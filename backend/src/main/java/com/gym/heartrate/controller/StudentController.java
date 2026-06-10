package com.gym.heartrate.controller;

import com.gym.heartrate.common.Result;
import com.gym.heartrate.entity.Student;
import com.gym.heartrate.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final ClassService classService;

    @GetMapping("/list")
    public Result<List<Student>> getStudentList() {
        return Result.success(classService.getAllStudents());
    }

    @GetMapping("/bracelet/{braceletId}")
    public Result<Student> getStudentByBracelet(@PathVariable String braceletId) {
        return Result.success(classService.getStudentByBracelet(braceletId));
    }
}
