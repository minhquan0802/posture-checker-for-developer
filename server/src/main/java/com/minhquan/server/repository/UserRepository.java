package com.minhquan.server.repository;

import com.minhquan.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Hàm tùy chỉnh để tìm User theo tên đăng nhập
    Optional<User> findByUsername(String username);
}