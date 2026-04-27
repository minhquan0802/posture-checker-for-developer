package com.minhquan.server.service;


import com.minhquan.server.dto.DailyStatResponse;
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

    public void processAndSaveLog(PostureLogRequest request) {
        // Có thể validate thêm logic ở đây (VD: check số âm) trước khi lưu
        if (request.getDurationSeconds() < 0) {
            throw new IllegalArgumentException("Thời gian gù lưng không hợp lệ!");
        }

        // Chuyển DTO thành Entity
        PostureLog log = new PostureLog();
        log.setWarningType(request.getWarningType());
        log.setDurationSeconds(request.getDurationSeconds());
        log.setDistanceValue(request.getDistanceValue());

        // Lưu xuống Database
        postureLogRepository.save(log);

        System.out.println("[Service] Đã xử lý và lưu log: " + request.getWarningType() + " - " + request.getDurationSeconds() + "s");
    }

    public DailyStatResponse getTodayStats() {
        // Lấy mốc thời gian 00:00:00 của ngày hôm nay
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        // Gọi database lấy toàn bộ log từ rạng sáng đến giờ
        List<PostureLog> todayLogs = postureLogRepository.findByCreatedAtAfterOrderByCreatedAtDesc(startOfDay);

        // Tính tổng số giây vi phạm bằng Stream API
        int totalDuration = todayLogs.stream()
                .mapToInt(PostureLog::getDurationSeconds)
                .sum();

        // Trả kết quả (Tổng số dòng log, Tổng số giây)
        return new DailyStatResponse(todayLogs.size(), totalDuration);
    }

    public List<PostureLog> getRecentLogs() {
        return postureLogRepository.findTop20ByOrderByCreatedAtDesc();
    }
}