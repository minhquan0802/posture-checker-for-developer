# 🧘‍♂️ AI Posture Checker — Trợ lý Ảo Cảnh báo Gù lưng Thời gian thực

> Ứng dụng Trí tuệ Nhân tạo (AI) phát hiện và cảnh báo tư thế ngồi sai (gù lưng) trong thời gian thực thông qua Webcam.  
> Phiên bản **v2.0.0** được thiết kế theo kiến trúc **Local Desktop Application (100% Offline)**, mang lại tốc độ phản hồi tính bằng mili-giây và bảo mật tuyệt đối dữ liệu người dùng.

---

## 🛠️ Công nghệ sử dụng

| Lớp kiến trúc | Công nghệ áp dụng |
|---|---|
| **Giao diện (Renderer Process)** | HTML5, CSS3, JavaScript (ES6+), UI/UX cho Desktop |
| **Lõi AI (Computer Vision)** | Google MediaPipe Pose Landmarker (BlazePose) |
| **Xử lý Logic (Main Process)** | Node.js, ElectronJS, IPC Communication |
| **Cơ sở dữ liệu (Local DB)** | SQLite3 (`better-sqlite3`), BCryptJS |
| **Đóng gói & Phân phối** | Electron-builder (NSIS Installer) |

---

## 📦 Tải & Cài đặt ứng dụng

Tải file cài đặt Windows (.exe) bản mới nhất tại: **[Releases v2.0.0](https://github.com/minhquan0802/Posture-Checker-for-Developer/releases/tag/v2.0.0)**

**Yêu cầu hệ thống:**
- Hệ điều hành: Windows 10/11
- Thiết bị ngoại vi: Có Webcam tích hợp hoặc cắm ngoài.
- *Lưu ý: Ứng dụng chạy độc lập 100% Offline, KHÔNG yêu cầu kết nối Internet.*

> ⚠️ **Lưu ý cài đặt:** Windows SmartScreen có thể hiển thị cảnh báo màu xanh do ứng dụng cá nhân chưa mua chữ ký số (Code Signing Certificate). 
> Bạn chỉ cần bấm **More info (Thêm thông tin) → Run anyway (Vẫn chạy)** để cài đặt bình thường.

---

## 🚀 Tính năng nổi bật & Hướng dẫn sử dụng

1. **Bảo mật cục bộ:** Đăng ký/Đăng nhập tài khoản lưu trữ nội bộ. Tự động ghi nhớ phiên làm việc.
2. **Hiệu chuẩn cá nhân hóa:** Ngồi thẳng lưng và bấm **Hiệu chuẩn** để AI học và ghi nhớ vóc dáng riêng của bạn.
3. **Hoạt động ngầm (System Tray):** Đóng cửa sổ ứng dụng sẽ thu nhỏ xuống khay hệ thống, AI vẫn âm thầm quét tư thế.
4. **Cảnh báo đa cấp độ:**
   - Liên tục 15s: Âm thanh nhắc nhở nhẹ + Thông báo Windows (Notification).
   - Liên tục 30s: Âm thanh cảnh báo nghiêm túc.
   - Liên tục 45s: Cảnh báo nguy hiểm đến cột sống.
5. **Thống kê Real-time:** Xem báo cáo tổng số lần gù lưng và tổng thời gian vi phạm ngay trong ngày với tốc độ truy xuất tức thì.

---

## 🗂️ Cấu trúc thư mục (Clean Architecture)

Hệ thống được tổ chức theo mô hình tách biệt rõ ràng giữa Frontend và Backend:

```text
Posture-Checker-for-Developer/
├── assets/                 # Hình ảnh, icon, âm thanh cảnh báo đa cấp độ
├── libs/                   # Thư viện core chạy offline (MediaPipe WASM)
├── models/                 # File trọng số AI (.task)
├── src/                    # Mã nguồn chính của ứng dụng
│   ├── BE/                 # [Lớp dữ liệu & Nghiệp vụ] Node.js, SQLite
│   │   ├── database.js     # Khởi tạo CSDL, tự động tạo bảng
│   │   └── service.js      # Xử lý logic Đăng nhập, Lưu Log, Mã hóa mật khẩu
│   └── FE/                 # [Lớp hiển thị] Giao diện người dùng
│       ├── dashboard.html  # Bảng thống kê dữ liệu
│       ├── index.html      # Màn hình Camera AI chính
│       ├── login.html      # Màn hình xác thực
│       └── settings.html   # Giao diện cài đặt ngưỡng & hiệu chuẩn
├── main.js                 # Lõi Electron: Quản lý vòng đời app, Tray Menu, IPC API
└── package.json            # Cấu hình project và đóng gói (electron-builder)
```

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
