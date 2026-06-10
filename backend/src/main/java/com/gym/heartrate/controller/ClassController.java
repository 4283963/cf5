package com.gym.heartrate.controller;

import com.gym.heartrate.common.Result;
import com.gym.heartrate.entity.ClassCheckin;
import com.gym.heartrate.entity.ClassSchedule;
import com.gym.heartrate.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/class")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping("/list")
    public Result<List<ClassSchedule>> getClassList() {
        return Result.success(classService.getAllClasses());
    }

    @GetMapping("/{id}")
    public Result<ClassSchedule> getClassById(@PathVariable Long id) {
        return Result.success(classService.getClassById(id));
    }

    @GetMapping("/current")
    public Result<ClassSchedule> getCurrentClass(@RequestParam(defaultValue = "ROOM-A01") String roomId) {
        return Result.success(classService.getCurrentClass(roomId));
    }

    @PostMapping("/create")
    public Result<ClassSchedule> createClass(@RequestBody ClassSchedule classSchedule) {
        return Result.success(classService.createClass(classSchedule));
    }

    @PostMapping("/checkin")
    public Result<ClassCheckin> checkin(@RequestBody Map<String, Object> params) {
        Long classId = Long.valueOf(params.get("classId").toString());
        if (params.containsKey("braceletId")) {
            String braceletId = params.get("braceletId").toString();
            return Result.success(classService.checkinByBracelet(classId, braceletId));
        } else if (params.containsKey("studentId")) {
            Long studentId = Long.valueOf(params.get("studentId").toString());
            return Result.success(classService.checkin(classId, studentId));
        }
        return Result.error("必须提供 braceletId 或 studentId");
    }

    @PostMapping("/checkout/{checkinId}")
    public Result<ClassCheckin> checkout(@PathVariable Long checkinId) {
        return Result.success(classService.checkout(checkinId));
    }

    @GetMapping("/{classId}/checkins")
    public Result<List<ClassCheckin>> getClassCheckins(@PathVariable Long classId) {
        return Result.success(classService.getClassCheckins(classId));
    }
}
