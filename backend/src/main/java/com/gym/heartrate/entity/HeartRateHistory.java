package com.gym.heartrate.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HeartRateHistory {
    private Long id;
    private Long classId;
    private Long checkinId;
    private Long studentId;
    private String braceletId;
    private Integer heartRate;
    private BigDecimal calories;
    private Integer intensity;
    private LocalDateTime recordTime;
    private LocalDateTime createTime;
}
