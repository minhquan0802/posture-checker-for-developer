const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let dbPath;

// 1. Xác định vị trí lưu file CSDL
if (app.isPackaged) {
    // Khi đã đóng gói thành file .exe: Lưu vào AppData của Windows
    dbPath = path.join(app.getPath('userData'), 'posture_db.sqlite');
} else {
    // Khi đang code Local: Lùi ra 2 cấp thư mục (từ backend -> src -> root)
    // để DB nằm ngoài cùng cho dễ quản lý
    dbPath = path.join(__dirname, '../../', 'posture_db.sqlite');
}

// Khởi tạo kết nối CSDL (verbose giúp in log câu SQL ra console để dễ debug)
const db = new Database(dbPath, { verbose: console.log });

// Bật tính năng kiểm tra Khóa ngoại (Foreign Key) của SQLite
db.pragma('foreign_keys = ON');

function initDB() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            threshold REAL
        );
    `;
    const createLogsTable = `
        CREATE TABLE IF NOT EXISTS posture_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            warning_type TEXT NOT NULL CHECK(warning_type IN ('SAI_TU_THE', 'LECH_VAI', 'NGOI_LAU')),
            duration_seconds INTEGER NOT NULL,
            distance_value REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `;

    // Thực thi lệnh tạo bảng
    db.exec(createUsersTable);
    db.exec(createLogsTable);

    try {
        // Thử Query vào cột mới xem có lỗi không
        db.prepare('SELECT start_minimized FROM users LIMIT 1').get();
    } catch (err) {
        // Nếu văng lỗi (tức là cột chưa tồn tại trong bản DB cũ), thì dùng lệnh ALTER để thêm cột
        if (err.message.includes('no such column')) {
            db.exec('ALTER TABLE users ADD COLUMN start_minimized INTEGER DEFAULT 0');
            console.log("Đã cập nhật Database: Thêm cột start_minimized thành công!");
        }
    }
    console.log(`✅ Cơ sở dữ liệu đã sẵn sàng tại: ${dbPath}`);
}

// Chạy hàm tạo bảng ngay khi file này được import
initDB();

// 3. Xuất đối tượng db để main.js có thể sử dụng
module.exports = db;