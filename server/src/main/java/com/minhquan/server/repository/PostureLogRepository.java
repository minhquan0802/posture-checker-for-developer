package com.minhquan.server.repository;

import com.minhquan.server.entity.PostureLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostureLogRepository extends JpaRepository<PostureLog, Long> {
    // Lấy tất cả log từ một mốc thời gian (dùng để lọc log trong ngày hôm nay)
    List<PostureLog> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime startTime);

    // Lấy 20 log mới nhất để hiển thị lên bảng lịch sử
    List<PostureLog> findTop20ByOrderByCreatedAtDesc();
}