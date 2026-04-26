# Posture-Checker-for-Developer
Ứng dụng hỗ trợ developer duy trì tư thế ngồi đúng khi lập trình.  Sử dụng MediaPipe Pose Landmarker để nhận diện tư thế qua webcam,  Frontend đơn giản hiển thị cảnh báo, Backend Spring Boot xử lý dữ liệu và quản lý API.  Mục tiêu: khuyến khích thói quen làm việc lành mạnh, giảm nguy cơ đau lưng và RSI.
Sử dụng các điểm Mũi [0], Vai trái [11], vai phải [12]. Khoảng cách y từ Mũi tới trung bình giữa 2 vai ((Vai trái + Vai phải) / 2) phải >= khoảng THRESHOLD (mặc định là 0.40)
<img width="1446" height="1712" alt="image" src="https://github.com/user-attachments/assets/d8254049-6a40-4baa-abc7-e4464831ebae" />

