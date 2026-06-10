package com.gym.heartrate.service;

import com.gym.heartrate.dto.HeartRateDataDTO;
import com.gym.heartrate.dto.StudentHeartRateVO;
import com.gym.heartrate.entity.ClassCheckin;
import com.gym.heartrate.entity.HeartRateHistory;
import com.gym.heartrate.entity.Student;
import com.gym.heartrate.mapper.ClassCheckinMapper;
import com.gym.heartrate.mapper.HeartRateHistoryMapper;
import com.gym.heartrate.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeartRateService {

    private final StudentMapper studentMapper;
    private final ClassCheckinMapper classCheckinMapper;
    private final HeartRateHistoryMapper heartRateHistoryMapper;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, StudentHeartRateVO> realtimeDataMap = new ConcurrentHashMap<>();

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

    @Transactional
    public void processHeartRateData(HeartRateDataDTO dto) {
        Student student = studentMapper.selectByBraceletId(dto.getBraceletId());
        if (student == null) {
            log.warn("未找到手环对应的学员: braceletId={}", dto.getBraceletId());
            return;
        }

        ClassCheckin checkin = classCheckinMapper.selectByBraceletAndStatus(dto.getBraceletId(), 1);
        if (checkin == null) {
            log.warn("学员未签到或课程未开始: braceletId={}", dto.getBraceletId());
            return;
        }

        int intensity = calculateIntensity(dto.getHeartRate(), student.getAge());

        int durationSeconds = 5;
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
        heartRateHistoryMapper.insert(history);

        updateCheckinStats(checkin, dto.getHeartRate(), intervalCalories);
        updateRealtimeData(student, checkin, dto.getHeartRate(), intensity);

        broadcastRealtimeData();
    }

    private void updateCheckinStats(ClassCheckin checkin, int heartRate, BigDecimal intervalCalories) {
        if (checkin.getMaxHeartRate() == null || heartRate > checkin.getMaxHeartRate()) {
            checkin.setMaxHeartRate(heartRate);
        }

        int currentAvg = checkin.getAvgHeartRate() != null ? checkin.getAvgHeartRate() : 0;
        int newAvg = (currentAvg == 0) ? heartRate : (currentAvg + heartRate) / 2;
        checkin.setAvgHeartRate(newAvg);

        BigDecimal total = checkin.getTotalCalories() != null ? checkin.getTotalCalories() : BigDecimal.ZERO;
        checkin.setTotalCalories(total.add(intervalCalories));

        if (checkin.getCheckinTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(checkin.getCheckinTime(), LocalDateTime.now());
            checkin.setDuration((int) minutes);
        }

        classCheckinMapper.update(checkin);
    }

    private void updateRealtimeData(Student student, ClassCheckin checkin, int heartRate, int intensity) {
        StudentHeartRateVO vo = realtimeDataMap.get(student.getBraceletId());
        if (vo == null) {
            vo = new StudentHeartRateVO();
            vo.setStudentId(student.getId());
            vo.setName(student.getName());
            vo.setBraceletId(student.getBraceletId());
            vo.setMembershipLevel(student.getMembershipLevel());
        }
        vo.setHeartRate(heartRate);
        vo.setIntensity(intensity);
        vo.setTotalCalories(checkin.getTotalCalories());
        vo.setAvgHeartRate(checkin.getAvgHeartRate());
        vo.setMaxHeartRate(checkin.getMaxHeartRate());
        vo.setDuration(checkin.getDuration());
        realtimeDataMap.put(student.getBraceletId(), vo);
    }

    private void broadcastRealtimeData() {
        List<StudentHeartRateVO> dataList = List.copyOf(realtimeDataMap.values());
        try {
            messagingTemplate.convertAndSend("/topic/heartrate", dataList);
        } catch (Exception e) {
            log.error("广播心率数据失败", e);
        }
    }

    public List<StudentHeartRateVO> getCurrentRealtimeData() {
        return List.copyOf(realtimeDataMap.values());
    }

    public void clearRealtimeData(String braceletId) {
        realtimeDataMap.remove(braceletId);
    }

    public void clearAllRealtimeData() {
        realtimeDataMap.clear();
    }
}
