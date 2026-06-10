package com.gym.heartrate.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Student {
    private Long id;
    private String name;
    private Integer gender;
    private Integer age;
    private BigDecimal weight;
    private Integer height;
    private String braceletId;
    private String phone;
    private String membershipLevel;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
