package com.minhquan.server.controller;

import com.minhquan.server.dto.DailyStatResponse;
import com.minhquan.server.dto.PostureLogRequest;
import com.minhquan.server.entity.PostureLog;
import com.minhquan.server.service.PostureLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class PostureLogController {

    @Autowired
    private PostureLogService postureLogService;


    @PostMapping
    public ResponseEntity<String> saveLog(@RequestBody PostureLogRequest request) {
        postureLogService.processAndSaveLog(request);

        return ResponseEntity.ok("Lưu log thành công!");
    }

    // API: http://localhost:8080/api/logs/today/{userId}
    @GetMapping("/today/{userId}")
    public ResponseEntity<DailyStatResponse> getTodayStats(@PathVariable Integer userId) {
        return ResponseEntity.ok(postureLogService.getTodayStats(userId));
    }

    // API: http://localhost:8080/api/logs/recent/{userId}
    @GetMapping("/recent/{userId}")
    public ResponseEntity<List<PostureLog>> getRecentLogs(@PathVariable Integer userId) {
        return ResponseEntity.ok(postureLogService.getRecentLogs(userId));
    }
}