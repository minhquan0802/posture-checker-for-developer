package com.minhquan.server.controller;

import com.minhquan.server.entity.User;
import com.minhquan.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User registerRequest) {
        try {
            User savedUser = userService.registerUser(registerRequest);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 Bad Request nếu trùng tên đăng nhập
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> authenticatedUser = userService.authenticate(loginRequest);

        if (authenticatedUser.isPresent()) {
            // Đăng nhập thành công -> Trả về thông tin user (kèm threshold)
            return ResponseEntity.ok(authenticatedUser.get());
        } else {
            // Đăng nhập thất bại -> Trả về chuỗi báo lỗi và mã 401
            return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu");
        }
    }

    @PutMapping("/{id}/threshold")
    public ResponseEntity<?> updateThreshold(@PathVariable Integer id, @RequestBody Float newThreshold) {
        boolean isUpdated = userService.updateThreshold(id, newThreshold);

        if (isUpdated) {
            return ResponseEntity.ok("Đã cập nhật ngưỡng gù lưng thành: " + newThreshold);
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy người dùng");
        }
    }
}