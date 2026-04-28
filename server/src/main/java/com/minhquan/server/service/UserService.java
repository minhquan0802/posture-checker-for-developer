package com.minhquan.server.service;

import com.minhquan.server.entity.User;
import com.minhquan.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    public User registerUser(User request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set ngưỡng mặc định nếu người dùng chưa truyền vào
        newUser.setThreshold(request.getThreshold() != null ? request.getThreshold() : 0.40f);

        return userRepository.save(newUser);
    }

    public Optional<User> authenticate(User loginRequest) {
        return userRepository.findByUsername(loginRequest.getUsername())
                .filter(user -> passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()));
    }


    // Logic xử lý cập nhật ngưỡng gù lưng
    public boolean updateThreshold(Integer id, Float newThreshold) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setThreshold(newThreshold);
            userRepository.save(user);
            return true; // Cập nhật thành công
        }

        return false; // Không tìm thấy user
    }
}