const db = require('./database');
const bcrypt = require('bcryptjs');

// ==========================================
// USER SERVICE & REPOSITORY
// ==========================================
const UserService = {
    registerUser: (username, password, threshold = 0.40) => {
        // 1. Kiểm tra username tồn tại (Giống userRepository.findByUsername.isPresent)
        const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
        if (checkStmt.get(username)) {
            throw new Error("Tên đăng nhập đã tồn tại!");
        }

        // 2. Mã hóa mật khẩu (Giống passwordEncoder.encode)
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // 3. Lưu vào DB
        const insertStmt = db.prepare('INSERT INTO users (username, password, threshold) VALUES (?, ?, ?)');
        const result = insertStmt.run(username, hashedPassword, threshold);

        return { id: result.lastInsertRowid, username, threshold };
    },

    authenticate: (username, password) => {
        // 1. Tìm user
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        // 2. So sánh mật khẩu (Giống passwordEncoder.matches)
        if (user && bcrypt.compareSync(password, user.password)) {
            // Ẩn password trước khi trả về cho an toàn
            delete user.password;
            return user;
        }
        return null; // Trả về null nếu sai thông tin
    },

    updateThreshold: (id, newThreshold) => {
        const updateStmt = db.prepare('UPDATE users SET threshold = ? WHERE id = ?');
        const result = updateStmt.run(newThreshold, id);
        return result.changes > 0; // Trả về true nếu cập nhật thành công (changes = số dòng bị ảnh hưởng)
    }
};

// ==========================================
// POSTURE LOG SERVICE & REPOSITORY
// ==========================================
const PostureLogService = {
    processAndSaveLog: (userId, warningType, durationSeconds, distanceValue) => {
        if (durationSeconds < 0) {
            throw new Error("Thời gian gù lưng không hợp lệ!");
        }

        // Kiểm tra User tồn tại
        const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
        if (!user) {
            throw new Error("Không tìm thấy người dùng với ID: " + userId);
        }

        // Lưu Log
        const insertStmt = db.prepare(`
            INSERT INTO posture_logs (user_id, warning_type, duration_seconds, distance_value) 
            VALUES (?, ?, ?, ?)
        `);
        insertStmt.run(userId, warningType, durationSeconds, distanceValue);

        console.log(`[Service] Đã xử lý log cho User ID ${userId}: ${warningType} - ${durationSeconds}s`);
    },

    getTodayStats: (userId) => {
        // Mẹo SQLite: CURRENT_TIMESTAMP lưu theo giờ UTC. 
        // Hàm date(..., 'localtime') giúp so sánh đúng với ngày hiện tại ở múi giờ của máy tính.
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as totalLogs, 
                IFNULL(SUM(duration_seconds), 0) as totalDuration 
            FROM posture_logs 
            WHERE user_id = ? AND date(created_at, 'localtime') = date('now', 'localtime')
        `);
        
        const result = stmt.get(userId);
        
        return {
            logCount: result.totalLogs,
            totalDuration: result.totalDuration
        };
    },

    getRecentLogs: (userId) => {
        // Tương đương findTop20ByUserIdOrderByCreatedAtDesc
        const stmt = db.prepare(`
            SELECT * FROM posture_logs 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        `);
        return stmt.all(userId);
    }
};

// Xuất cả 2 service ra ngoài
module.exports = { UserService, PostureLogService };