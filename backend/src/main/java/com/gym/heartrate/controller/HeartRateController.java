package com.gym.heartrate.controller;

import com.gym.heartrate.common.Result;
import com.gym.heartrate.dto.HeartRateDataDTO;
import com.gym.heartrate.dto.StudentHeartRateVO;
import com.gym.heartrate.service.HeartRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/heartrate")
@RequiredArgsConstructor
public class HeartRateController {

    private final HeartRateService heartRateService;

    @PostMapping("/report")
    public Result<Void> reportHeartRate(@Valid @RequestBody HeartRateDataDTO dto) {
        heartRateService.processHeartRateData(dto);
        return Result.success();
    }

    @PostMapping("/batch-report")
    public Result<Void> batchReportHeartRate(@RequestBody List<HeartRateDataDTO> dtoList) {
        for (HeartRateDataDTO dto : dtoList) {
            heartRateService.processHeartRateData(dto);
        }
        return Result.success();
    }

    @GetMapping("/realtime")
    public Result<List<StudentHeartRateVO>> getRealtimeData() {
        return Result.success(heartRateService.getCurrentRealtimeData());
    }
}
