package com.gym.heartrate.service;

import com.gym.heartrate.dto.HeartRateDataDTO;
import com.gym.heartrate.entity.Student;
import com.gym.heartrate.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockBraceletService {

    private final StudentMapper studentMapper;
    private final HeartRateService heartRateService;

    private final Map<String, Integer> currentHeartRates = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private volatile boolean running = false;

    public void startSimulation() {
        running = true;
        List<Student> students = studentMapper.selectAll();
        for (Student s : students) {
            currentHeartRates.put(s.getBraceletId(), 75 + random.nextInt(15));
        }
        log.info("模拟手环数据推送已启动, 共 {} 个学员", students.size());
    }

    public void stopSimulation() {
        running = false;
        currentHeartRates.clear();
        log.info("模拟手环数据推送已停止");
    }

    public boolean isRunning() {
        return running;
    }

    @Scheduled(fixedRate = 1000)
    public void simulateHeartRatePush() {
        if (!running) {
            return;
        }

        currentHeartRates.forEach((braceletId, heartRate) -> {
            int change = random.nextInt(11) - 5;
            int newRate = Math.max(60, Math.min(185, heartRate + change));
            currentHeartRates.put(braceletId, newRate);

            HeartRateDataDTO dto = new HeartRateDataDTO();
            dto.setBraceletId(braceletId);
            dto.setHeartRate(newRate);
            dto.setTimestamp(LocalDateTime.now());

            try {
                heartRateService.processHeartRateData(dto);
            } catch (Exception e) {
                log.debug("处理心率数据失败: braceletId={}, error={}", braceletId, e.getMessage());
            }
        });
    }
}
