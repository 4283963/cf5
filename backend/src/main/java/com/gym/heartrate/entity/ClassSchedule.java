package com.gym.heartrate.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClassSchedule {
    private Long id;
    private String className;
    private String coachName;
    private String classType;
    private String roomId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer status;
    private String description;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
