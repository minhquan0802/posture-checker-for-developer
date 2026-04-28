package com.minhquan.server.service;


import com.minhquan.server.dto.DailyStatResponse;
import com.minhquan.server.entity.User;
import com.minhquan.server.repository.UserRepository;
import org.springframework.stereotype.Service;

import com.minhquan.server.dto.PostureLogRequest;
import com.minhquan.server.entity.PostureLog;
import com.minhquan.server.repository.PostureLogRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostureLogService {

    @Autowired
    private PostureLogRepository postureLogRepository;

    @Autowired
    private UserRepository userRepository;

    public void processAndSaveLog(PostureLogRequest request) {
        if (request.getDurationSeconds() < 0) {
            throw new IllegalArgumentException("Thời gian gù lưng không hợp lệ!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + request.getUserId()));

        // Chuyển DTO thành Entity
        PostureLog log = new PostureLog();
        log.setUserId(user.getId());
        log.setWarningType(request.getWarningType());
        log.setDurationSeconds(request.getDurationSeconds());
        log.setDistanceValue(request.getDistanceValue());

        postureLogRepository.save(log);

        System.out.println("[Service] Đã xử lý log cho User ID " + request.getUserId() + ": " + request.getWarningType() + " - " + request.getDurationSeconds() + "s");
    }


    public DailyStatResponse getTodayStats(Integer userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        // Chỉ lấy log của User hiện tại
        List<PostureLog> todayLogs = postureLogRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, startOfDay);

        int totalDuration = todayLogs.stream()
                .mapToInt(PostureLog::getDurationSeconds)
                .sum();

        return new DailyStatResponse(todayLogs.size(), totalDuration);
    }

    public List<PostureLog> getRecentLogs(Integer userId) {
        return postureLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }
}