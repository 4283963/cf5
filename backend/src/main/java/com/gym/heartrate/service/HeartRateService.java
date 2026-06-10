package com.gym.heartrate.service;

import com.gym.heartrate.dto.HeartRateDataDTO;
import com.gym.heartrate.dto.StudentHeartRateVO;
import com.gym.heartrate.entity.ClassCheckin;
import com.gym.heartrate.entity.HeartRateHistory;
import com.gym.heartrate.entity.Student;
import com.gym.heartrate.mapper.ClassCheckinMapper;
import com.gym.heartrate.mapper.HeartRateHistoryMapper;
import com.gym.heartrate.mapper.StudentMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeartRateService {

    private final StudentMapper studentMapper;
    private final ClassCheckinMapper classCheckinMapper;
    private final HeartRateHistoryMapper heartRateHistoryMapper;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, StudentHeartRateVO> realtimeDataMap = new ConcurrentHashMap<>();
    private final Map<String, Student> studentCache = new ConcurrentHashMap<>();
    private final Map<String, ClassCheckin> checkinCache = new ConcurrentHashMap<>();
    private final Map<String, CheckinStats> checkinStatsCache = new ConcurrentHashMap<>();

    private final BlockingQueue<HeartRateHistory> historyWriteQueue = new LinkedBlockingQueue<>(100000);
    private final AtomicBoolean running = new AtomicBoolean(false);

    private ScheduledExecutorService scheduler;
    private ExecutorService writerExecutor;

    private static final int DB_BATCH_SIZE = 200;
    private static final long DB_FLUSH_INTERVAL_MS = 1000;
    private static final long WS_PUSH_INTERVAL_MS = 200;
    private static final long STATS_UPDATE_INTERVAL_MS = 5000;
    private static final long CACHE_REFRESH_INTERVAL_MS = 30000;

    private static class CheckinStats {
        int heartRateSum;
        int heartRateCount;
        int maxHeartRate;
        BigDecimal totalCalories;
        LocalDateTime checkinTime;
        volatile boolean dirty;
    }

    @PostConstruct
    public void init() {
        if (running.compareAndSet(false, true)) {
            scheduler = Executors.newScheduledThreadPool(3, r -> {
                Thread t = new Thread(r, "heartrate-scheduler");
                t.setDaemon(true);
                return t;
            });
            writerExecutor = Executors.newSingleThreadExecutor(r -> {
                Thread t = new Thread(r, "heartrate-db-writer");
                t.setDaemon(true);
                return t;
            });

            refreshCache();
            scheduler.scheduleAtFixedRate(this::refreshCache, CACHE_REFRESH_INTERVAL_MS, CACHE_REFRESH_INTERVAL_MS, TimeUnit.MILLISECONDS);
            scheduler.scheduleAtFixedRate(this::flushDatabase, DB_FLUSH_INTERVAL_MS, DB_FLUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
            scheduler.scheduleAtFixedRate(this::broadcastRealtimeData, WS_PUSH_INTERVAL_MS, WS_PUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
            scheduler.scheduleAtFixedRate(this::flushCheckinStats, STATS_UPDATE_INTERVAL_MS, STATS_UPDATE_INTERVAL_MS, TimeUnit.MILLISECONDS);

            writerExecutor.submit(this::backgroundDbWriter);

            log.info("心率处理服务已启动, 批量大小={}, DB刷新间隔={}ms, WS推送间隔={}ms",
                    DB_BATCH_SIZE, DB_FLUSH_INTERVAL_MS, WS_PUSH_INTERVAL_MS);
        }
    }

    @PreDestroy
    public void destroy() {
        if (running.compareAndSet(true, false)) {
            log.info("正在关闭心率处理服务, 剩余队列大小={}", historyWriteQueue.size());
            scheduler.shutdownNow();
            writerExecutor.shutdownNow();
            flushDatabase();
            flushCheckinStats();
            log.info("心率处理服务已关闭");
        }
    }

    private void refreshCache() {
        try {
            List<Student> students = studentMapper.selectAll();
            for (Student s : students) {
                studentCache.put(s.getBraceletId(), s);
            }
            log.debug("学员缓存已刷新, 共 {} 人", students.size());
        } catch (Exception e) {
            log.warn("刷新学员缓存失败", e);
        }
    }

    public static int calculateIntensity(int heartRate, int age) {
        int maxHeartRate = 220 - age;
        double ratio = (double) heartRate / maxHeartRate;
        if (ratio < 0.6) {
            return 1;
        } else if (ratio < 0.85) {
            return 2;
        } else {
            return 3;
        }
    }

    public static BigDecimal calculateCalories(int heartRate, double weight, int durationSeconds, int gender) {
        double metValue;
        if (heartRate < 100) {
            metValue = 2.5;
        } else if (heartRate < 130) {
            metValue = 5.0;
        } else if (heartRate < 160) {
            metValue = 8.0;
        } else {
            metValue = 11.0;
        }
        double calories = metValue * weight * (durationSeconds / 3600.0);
        return BigDecimal.valueOf(calories).setScale(2, RoundingMode.HALF_UP);
    }

    public void processHeartRateData(HeartRateDataDTO dto) {
        if (dto.getBraceletId() == null || dto.getHeartRate() == null) {
            return;
        }

        Student student = studentCache.get(dto.getBraceletId());
        if (student == null) {
            student = studentMapper.selectByBraceletId(dto.getBraceletId());
            if (student == null) {
                return;
            }
            studentCache.put(dto.getBraceletId(), student);
        }

        String cacheKey = dto.getBraceletId() + "_1";
        ClassCheckin checkin = checkinCache.get(cacheKey);
        if (checkin == null) {
            checkin = classCheckinMapper.selectByBraceletAndStatus(dto.getBraceletId(), 1);
            if (checkin == null) {
                return;
            }
            checkinCache.put(cacheKey, checkin);
        }

        int intensity = calculateIntensity(dto.getHeartRate(), student.getAge());

        int durationSeconds = 1;
        BigDecimal intervalCalories = calculateCalories(
                dto.getHeartRate(),
                student.getWeight().doubleValue(),
                durationSeconds,
                student.getGender()
        );

        HeartRateHistory history = new HeartRateHistory();
        history.setClassId(checkin.getClassId());
        history.setCheckinId(checkin.getId());
        history.setStudentId(student.getId());
        history.setBraceletId(dto.getBraceletId());
        history.setHeartRate(dto.getHeartRate());
        history.setCalories(intervalCalories);
        history.setIntensity(intensity);
        history.setRecordTime(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());

        if (!historyWriteQueue.offer(history)) {
            log.warn("心率写入队列已满, 丢弃数据, braceletId={}", dto.getBraceletId());
        }

        updateCheckinStatsCache(checkin, dto.getHeartRate(), intervalCalories);
        updateRealtimeData(student, checkin, dto.getHeartRate(), intensity, intervalCalories);
    }

    private void updateCheckinStatsCache(ClassCheckin checkin, int heartRate, BigDecimal intervalCalories) {
        String key = checkin.getId().toString();
        CheckinStats stats = checkinStatsCache.get(key);
        if (stats == null) {
            stats = new CheckinStats();
            stats.heartRateSum = 0;
            stats.heartRateCount = 0;
            stats.maxHeartRate = checkin.getMaxHeartRate() != null ? checkin.getMaxHeartRate() : 0;
            stats.totalCalories = checkin.getTotalCalories() != null ? checkin.getTotalCalories() : BigDecimal.ZERO;
            stats.checkinTime = checkin.getCheckinTime();
            checkinStatsCache.put(key, stats);
        }
        synchronized (stats) {
            stats.heartRateSum += heartRate;
            stats.heartRateCount++;
            if (heartRate > stats.maxHeartRate) {
                stats.maxHeartRate = heartRate;
            }
            stats.totalCalories = stats.totalCalories.add(intervalCalories);
            stats.dirty = true;
        }
    }

    private void updateRealtimeData(Student student, ClassCheckin checkin, int heartRate, int intensity, BigDecimal intervalCalories) {
        StudentHeartRateVO vo = realtimeDataMap.get(student.getBraceletId());
        if (vo == null) {
            vo = new StudentHeartRateVO();
            vo.setStudentId(student.getId());
            vo.setName(student.getName());
            vo.setBraceletId(student.getBraceletId());
            vo.setMembershipLevel(student.getMembershipLevel());
            vo.setAvgHeartRate(0);
            vo.setMaxHeartRate(0);
            vo.setTotalCalories(BigDecimal.ZERO);
            vo.setDuration(0);
            realtimeDataMap.put(student.getBraceletId(), vo);
        }
        vo.setHeartRate(heartRate);
        vo.setIntensity(intensity);

        String statsKey = checkin.getId().toString();
        CheckinStats stats = checkinStatsCache.get(statsKey);
        if (stats != null) {
            synchronized (stats) {
                vo.setTotalCalories(stats.totalCalories);
                vo.setMaxHeartRate(stats.maxHeartRate);
                if (stats.heartRateCount > 0) {
                    vo.setAvgHeartRate(stats.heartRateSum / stats.heartRateCount);
                }
                if (stats.checkinTime != null) {
                    long minutes = ChronoUnit.MINUTES.between(stats.checkinTime, LocalDateTime.now());
                    vo.setDuration((int) minutes);
                }
            }
        }
    }

    private void backgroundDbWriter() {
        while (running.get() && !Thread.currentThread().isInterrupted()) {
            try {
                List<HeartRateHistory> batch = new ArrayList<>(DB_BATCH_SIZE);
                HeartRateHistory first = historyWriteQueue.poll(5, TimeUnit.SECONDS);
                if (first == null) {
                    continue;
                }
                batch.add(first);
                historyWriteQueue.drainTo(batch, DB_BATCH_SIZE - 1);

                if (!batch.isEmpty()) {
                    doBatchInsert(batch);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("批量写入心率数据失败", e);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private void flushDatabase() {
        if (historyWriteQueue.isEmpty()) {
            return;
        }
        List<HeartRateHistory> batch = new ArrayList<>(DB_BATCH_SIZE);
        while (!historyWriteQueue.isEmpty() && batch.size() < DB_BATCH_SIZE) {
            historyWriteQueue.drainTo(batch, DB_BATCH_SIZE - batch.size());
            if (!batch.isEmpty()) {
                doBatchInsert(batch);
                batch.clear();
            }
        }
    }

    private void doBatchInsert(List<HeartRateHistory> batch) {
        if (batch.isEmpty()) return;
        try {
            heartRateHistoryMapper.batchInsert(batch);
            log.trace("批量写入心率历史 {} 条", batch.size());
        } catch (Exception e) {
            log.error("批量写入失败, 尝试单条回退, size={}", batch.size(), e);
            for (HeartRateHistory h : batch) {
                try {
                    heartRateHistoryMapper.insert(h);
                } catch (Exception ex) {
                    log.warn("单条回退写入也失败, braceletId={}, hr={}", h.getBraceletId(), h.getHeartRate());
                }
            }
        }
    }

    private void flushCheckinStats() {
        List<Map.Entry<String, CheckinStats>> dirtyEntries = new ArrayList<>();
        for (Map.Entry<String, CheckinStats> entry : checkinStatsCache.entrySet()) {
            if (entry.getValue().dirty) {
                dirtyEntries.add(entry);
            }
        }

        if (dirtyEntries.isEmpty()) {
            return;
        }

        log.debug("更新签到统计, 脏数据 {} 条", dirtyEntries.size());
        for (Map.Entry<String, CheckinStats> entry : dirtyEntries) {
            try {
                Long checkinId = Long.parseLong(entry.getKey());
                CheckinStats stats = entry.getValue();
                synchronized (stats) {
                    Integer avgHr = stats.heartRateCount > 0 ? (stats.heartRateSum / stats.heartRateCount) : 0;
                    Integer duration = 0;
                    if (stats.checkinTime != null) {
                        duration = (int) ChronoUnit.MINUTES.between(stats.checkinTime, LocalDateTime.now());
                    }
                    classCheckinMapper.updateStats(checkinId, stats.maxHeartRate, avgHr, stats.totalCalories, duration);
                    stats.dirty = false;
                }
            } catch (Exception e) {
                log.error("更新签到统计失败, checkinId={}", entry.getKey(), e);
            }
        }
    }

    private void broadcastRealtimeData() {
        if (realtimeDataMap.isEmpty()) {
            return;
        }
        List<StudentHeartRateVO> dataList = List.copyOf(realtimeDataMap.values());
        try {
            messagingTemplate.convertAndSend("/topic/heartrate", dataList);
        } catch (Exception e) {
            log.warn("广播心率数据失败", e);
        }
    }

    public List<StudentHeartRateVO> getCurrentRealtimeData() {
        return List.copyOf(realtimeDataMap.values());
    }

    public void clearRealtimeData(String braceletId) {
        realtimeDataMap.remove(braceletId);
        checkinCache.keySet().removeIf(k -> k.startsWith(braceletId + "_"));
    }

    public void clearAllRealtimeData() {
        realtimeDataMap.clear();
        checkinCache.clear();
        checkinStatsCache.clear();
        historyWriteQueue.clear();
    }

    public int getQueueSize() {
        return historyWriteQueue.size();
    }
}
