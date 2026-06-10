package com.gym.heartrate.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClassCheckin {
    private Long id;
    private Long classId;
    private Long studentId;
    private String braceletId;
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;
    private BigDecimal totalCalories;
    private Integer avgHeartRate;
    private Integer maxHeartRate;
    private Integer duration;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
