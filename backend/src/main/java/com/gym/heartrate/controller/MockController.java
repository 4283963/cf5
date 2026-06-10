package com.gym.heartrate.controller;

import com.gym.heartrate.common.Result;
import com.gym.heartrate.service.MockBraceletService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mock")
@RequiredArgsConstructor
public class MockController {

    private final MockBraceletService mockBraceletService;

    @PostMapping("/start")
    public Result<Map<String, Object>> startSimulation() {
        mockBraceletService.startSimulation();
        Map<String, Object> data = new HashMap<>();
        data.put("running", true);
        data.put("message", "模拟手环数据推送已启动");
        return Result.success(data);
    }

    @PostMapping("/stop")
    public Result<Map<String, Object>> stopSimulation() {
        mockBraceletService.stopSimulation();
        Map<String, Object> data = new HashMap<>();
        data.put("running", false);
        data.put("message", "模拟手环数据推送已停止");
        return Result.success(data);
    }

    @GetMapping("/status")
    public Result<Map<String, Object>> getStatus() {
        Map<String, Object> data = new HashMap<>();
        data.put("running", mockBraceletService.isRunning());
        return Result.success(data);
    }
}
