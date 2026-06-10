package com.gym.heartrate.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HeartRateDataDTO {
    private String braceletId;
    private Integer heartRate;
    private LocalDateTime timestamp;
    private BigDecimal calories;
    private Integer intensity;
}
