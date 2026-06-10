package com.gym.heartrate.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StudentHeartRateVO {
    private Long studentId;
    private String name;
    private String braceletId;
    private Integer heartRate;
    private Integer intensity;
    private BigDecimal totalCalories;
    private Integer avgHeartRate;
    private Integer maxHeartRate;
    private String membershipLevel;
    private Integer duration;
    private String team;
    private Boolean dangerWarning;
    private Integer dangerSeconds;
    private Integer maxHeartRateLimit;
}
