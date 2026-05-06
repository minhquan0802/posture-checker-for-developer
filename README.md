# 🧘‍♂️ AI Posture Checker — Hệ thống Cảnh báo Gù lưng Thời gian thực

> Ứng dụng Trí tuệ Nhân tạo phát hiện và cảnh báo tư thế ngồi sai (gù lưng) trong thời gian thực thông qua Webcam.  
> Hệ thống xây dựng theo mô hình **Client - Server**, kết hợp **MediaPipe Pose Landmarker**, **Electron Desktop App** và **Spring Boot Backend**.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| **Frontend (Client)** | HTML, CSS, JavaScript, ElectronJS, MediaPipe Pose Landmarker |
| **Backend (Server)** | Java 21, Spring Boot, Spring Data JPA, Hibernate |
| **Database** | MySQL 8 (Aiven Cloud) |
| **Triển khai** | Render (Backend), Electron-builder (Frontend) |

---

## 📦 Tải & Cài đặt ứng dụng

Tải file cài đặt Windows tại: **[Releases](https://github.com/minhquan0802/Posture-Checker-for-Developer/releases/tag/v1.0.0)**

**Yêu cầu:**
- Windows 10/11
- Webcam

Nhấp đúp vào file `.exe` → cài đặt → mở app và sử dụng. Không cần cài thêm bất kỳ phần mềm nào khác.

---

## 🚀 Hướng dẫn sử dụng

1. Mở ứng dụng → Đăng ký tài khoản hoặc đăng nhập
2. Ngồi thẳng lưng trước camera → bấm **Hiệu chuẩn** để AI học tư thế chuẩn của bạn
3. Thu nhỏ app xuống khay hệ thống (System Tray) — app sẽ tự chạy nền
4. Khi gù lưng quá 15 giây liên tục → app phát âm thanh + thông báo Windows
5. Xem lịch sử vi phạm tại màn hình **Báo cáo**

---

## 🗂️ Cấu trúc thư mục

```
Posture-Checker/
├── client/                  # Electron Desktop App (Frontend + AI)
│   ├── assets/              # Âm thanh cảnh báo
│   ├── libs/mediapipe/      # MediaPipe library (offline)
│   ├── models/              # File trọng số AI (.task)
│   ├── index.html           # Màn hình nhận diện tư thế chính
│   ├── login.html           # Màn hình đăng nhập
│   ├── report.html          # Màn hình báo cáo thống kê
│   ├── settings.html        # Màn hình cài đặt & hiệu chuẩn
│   ├── main.js              # Electron Main Process
│   └── package.json
│
└── server/                  # Spring Boot Backend (deploy trên Render)
    ├── src/                 # Mã nguồn Java
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
- `shoulderWidth` — Chiều rộng vai theo trục X (chuẩn hóa, loại bỏ ảnh hưởng khoảng cách camera)

Khi `normalizedDistance < threshold` → **Phát hiện gù lưng** → Cảnh báo âm thanh + thông báo Windows sau 15 giây liên tục.

---

## Tác giả

**Nguyễn Hồng Minh Quân** — Sinh viên năm 4, Ngành Kỹ thuật Phần mềm  
Trường Đại học Công nghệ Sài Gòn — Khoa Công nghệ Thông tin  
MSSV: DH52201291
