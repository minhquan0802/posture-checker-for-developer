package com.minhquan.server.repository;

import com.minhquan.server.entity.PostureLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostureLogRepository extends JpaRepository<PostureLog, Long> {
    // Lọc theo cả userId và thời gian
    List<PostureLog> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(Integer userId, LocalDateTime startTime);

    // Lấy 20 log mới nhất của riêng User đó
    List<PostureLog> findTop20ByUserIdOrderByCreatedAtDesc(Integer userId);
}