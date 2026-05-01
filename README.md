# 🧘‍♂️ AI Posture Checker — Hệ thống Cảnh báo Gù lưng Thời gian thực

> Ứng dụng Trí tuệ Nhân tạo phát hiện và cảnh báo tư thế ngồi sai (gù lưng) trong thời gian thực thông qua Webcam.  
> Hệ thống xây dựng theo mô hình **Client - Server**, kết hợp **MediaPipe Pose Landmarker**, **Electron Desktop App** và **Spring Boot Backend**.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| **Frontend (Client)** | HTML, CSS, JavaScript, ElectronJS, MediaPipe Pose Landmarker |
| **Backend (Server)** | Java 21, Spring Boot, Spring Data JPA, Hibernate |
| **Database** | MySQL 8 |
| **Đóng gói & Triển khai** | Docker, Docker Compose, Electron-builder |

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — Dùng để chạy Server và Database
- **[Node.js LTS](https://nodejs.org/)** — Dùng để chạy và đóng gói ứng dụng giao diện
- **[Java 21](https://adoptium.net/) + Maven** *(Tùy chọn)* — Nếu muốn tự biên dịch lại file `.jar`

> ⚠️ **Quan trọng:** Hãy **tắt** các dịch vụ MySQL đang chạy trên máy (XAMPP, WAMP, MySQL Workbench...) trước khi chạy Docker để tránh xung đột cổng `3306`.

---

## ⚙️ Hướng dẫn Cài đặt & Khởi chạy

### Bước 1 — Khởi chạy Backend & Database

Backend đã được đóng gói hoàn toàn bằng Docker Compose. Chỉ cần **1 lệnh duy nhất** để khởi chạy cả Server lẫn Database.

```bash
# Di chuyển vào thư mục server
cd server

# Khởi chạy toàn bộ hệ thống
docker-compose up -d --build
```

> Lần chạy đầu tiên sẽ mất khoảng **1–2 phút** để tải image MySQL và biên dịch Spring Boot.  
> Spring Boot sẽ tự động tạo cấu trúc bảng trong Database khi khởi động.

**Kiểm tra Backend đã chạy thành công chưa:**

```bash
docker-compose logs -f spring-backend
```

Khi thấy dòng `Started ServerApplication` là Backend đã sẵn sàng tại cổng `8080`.

---

### Bước 2 — Khởi chạy Frontend (Ứng dụng Camera AI)

```bash
# Di chuyển vào thư mục client
cd client

# Cài đặt các thư viện cần thiết (chỉ cần chạy lần đầu)
npm install

# Khởi chạy ứng dụng
npm start
```

Ứng dụng Desktop sẽ mở lên, yêu cầu quyền truy cập Camera và bắt đầu nhận diện tư thế.

---

## 📦 Đóng gói ra file `.exe` (Windows Installer)

Nếu muốn xuất thành phần mềm độc lập để cài đặt trên Windows:

```bash
# Chạy với quyền Administrator để tránh lỗi symbolic link
cd client
npm run build
```

Sau khi hoàn tất, file cài đặt sẽ xuất hiện tại:

```
client/dist/Posture Checker Setup 1.0.0.exe
```

Nhấp đúp vào file `.exe` để cài đặt ứng dụng.

> ⚠️ **Lưu ý:** Lệnh `npm run build` phải được chạy trong terminal với quyền **Administrator** (Run as Administrator), nếu không sẽ gặp lỗi `Cannot create symbolic link`.

---

## 🗂️ Cấu trúc thư mục

```
Posture-Checker/
├── client/                  # Electron Desktop App (Frontend + AI)
│   ├── assets/              # Âm thanh cảnh báo
│   ├── libs/mediapipe/      # MediaPipe library (offline)
│   ├── models/              # File trọng số AI (.task)
│   ├── index_final1.html    # Màn hình nhận diện tư thế chính
│   ├── login.html           # Màn hình đăng nhập
│   ├── report.html          # Màn hình báo cáo thống kê
│   ├── settings.html        # Màn hình cài đặt & hiệu chuẩn
│   ├── main.js              # Electron Main Process
│   └── package.json
│
└── server/                  # Spring Boot Backend
    ├── src/                 # Mã nguồn Java
    ├── docker-compose.yml   # Cấu hình Docker
    └── Dockerfile
```

---

## 🧠 Thuật toán nhận diện tư thế

Hệ thống sử dụng **MediaPipe Pose Landmarker** (BlazePose) để trích xuất tọa độ 33 điểm khớp xương. Thuật toán phát hiện gù lưng dựa trên **Normalized Distance**:

```
normalizedDistance = |nose.y - midShoulder.y| / shoulderWidth
```

Trong đó:
- `nose.y` — Tọa độ Y của điểm Mũi (landmark 0)
- `midShoulder.y` — Trung điểm Y của hai Vai (landmark 11, 12)
- `shoulderWidth` — Chiều rộng vai theo trục X (dùng để chuẩn hóa, loại bỏ ảnh hưởng khoảng cách camera)

Khi `normalizedDistance < threshold` → **Phát hiện gù lưng** → Cảnh báo âm thanh + thông báo Windows sau 15 giây liên tục.

---
<img width="1446" height="1712" alt="image" src="https://github.com/user-attachments/assets/d8254049-6a40-4baa-abc7-e4464831ebae" />

