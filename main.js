const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const db = require('./src/BE/database'); // Gọi file Database (Nó sẽ tự tạo bảng nếu chưa có)
const { UserService, PostureLogService } = require('./src/BE/service'); // Gọi các Service xử lý logic

// Ép trình duyệt cho phép phát âm thanh tự động ở chế độ ngầm
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let tray;
let dashboardWindow = null;
let settingsWindow = null;
let isMuted = false;
let isQuitting = false; // CỜ QUAN TRỌNG: Dùng để phân biệt "Ẩn cửa sổ" và "Thoát app"

function openSettings() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }
    settingsWindow = new BrowserWindow({
        width: 650,
        height: 600,
        title: "Cài Đặt và Hiệu Chuẩn",
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    settingsWindow.loadFile(path.join(__dirname, 'src', 'FE', 'settings.html'));
    settingsWindow.on('closed', () => { settingsWindow = null; });
}

function openDashboard() {
    if (dashboardWindow) {
        dashboardWindow.focus();
        return;
    }
    dashboardWindow = new BrowserWindow({
        width: 850,
        height: 600,
        title: "Thống Kê Tư Thế",
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    dashboardWindow.loadFile(path.join(__dirname, 'src', 'FE', 'dashboard.html'));
    dashboardWindow.on('closed', () => { dashboardWindow = null; });
}

app.whenReady().then(() => {
    // 1. Tạo cửa sổ chính
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false // Không cho ngủ đông khi ẩn
        }
    });

    // Mặc định mở trang Login
    mainWindow.loadFile(path.join(__dirname, 'src', 'FE', 'login.html'));

    // 2. Xử lý logic Đóng cửa sổ (Thu nhỏ xuống Tray)
    mainWindow.on('close', function (event) {
        if (!isQuitting) { // Nếu không phải đang bấm nút "Thoát hoàn toàn"
            event.preventDefault(); // Chặn việc tắt app
            mainWindow.hide();      // Giấu cửa sổ đi
            return false;
        }
    });

    // 3. Khởi tạo System Tray
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png')); 
    
    // Dynamic Menu cho Tray
    function updateTrayMenu() {
        const currentURL = mainWindow.webContents.getURL();
        const isLoggedIn = !currentURL.includes('login.html'); 

        let menuTemplate;

        if (isLoggedIn) {
            menuTemplate = [
                { label: 'Mở Màn Hình Camera', click: () => mainWindow.show() },
                { label: 'Xem Báo Cáo Thống Kê', click: () => openDashboard() },
                { label: 'Cài Đặt và Hiệu Chuẩn', click: () => openSettings() },
                { label: isMuted ? 'Bật tiếng' : 'Tắt tiếng', click: () => {
                    isMuted = !isMuted;
                    mainWindow.webContents.send('toggle-mute', isMuted);
                    updateTrayMenu(); 
                }},
                { type: 'separator' },
                { label: 'Đăng Xuất', click: () => {
                    mainWindow.webContents.send('logout-command');
                }},
                { label: 'Thoát hoàn toàn', click: () => {
                    isQuitting = true; // BẬT CỜ: Báo cho app biết là muốn tắt thật
                    app.quit(); // Gọi quit() chuẩn mực
                }}
            ];
        } else {
            menuTemplate = [
                { label: 'Mở Ứng Dụng (Đăng nhập)', click: () => mainWindow.show() },
                { type: 'separator' },
                { label: 'Thoát hoàn toàn', click: () => {
                    isQuitting = true;
                    app.quit();
                }}
            ];
        }

        const contextMenu = Menu.buildFromTemplate(menuTemplate);
        tray.setContextMenu(contextMenu);
    }

    // Tự động cập nhật Tray Menu khi chuyển trang
    mainWindow.webContents.on('did-finish-load', () => {
        updateTrayMenu();
    });

    // Khởi tạo Menu lần đầu tiên
    updateTrayMenu();
    tray.setToolTip('Trợ Lý AI Nhắc Nhở Tư Thế');
});

// =========================================================
// PHẦN API (BACKEND) - Lắng nghe yêu cầu từ giao diện HTML
// =========================================================

// 1. Hàm lắng nghe yêu cầu Bật/Tắt từ giao diện
ipcMain.on('toggle-autostart', (event, enable) => {
    app.setLoginItemSettings({
        openAtLogin: enable,
        path: app.getPath('exe') // Rất quan trọng: Trỏ đúng vào file .exe khi đã build
    });
    console.log(`Đã ${enable ? 'BẬT' : 'TẮT'} khởi động cùng Windows`);
});

// 2. Hàm kiểm tra trạng thái hiện tại (để hiển thị lên nút gạt lúc mới mở app)
ipcMain.handle('get-autostart-status', () => {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
});



// API: Lấy 20 lần gù lưng gần nhất
ipcMain.handle('api-get-recent-logs', (event, userId) => {
    try {
        return { success: true, data: PostureLogService.getRecentLogs(userId) };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// API: Cập nhật ngưỡng gù lưng (Threshold)
ipcMain.handle('api-update-threshold', (event, { userId, newThreshold }) => {
    try {
        const success = UserService.updateThreshold(userId, newThreshold);
        return { success: success };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// API: Đăng nhập
ipcMain.handle('api-login', (event, { username, password }) => {
    try {
        const user = UserService.authenticate(username, password);
        if (user) {
            return { success: true, user: user };
        } else {
            return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// API: Đăng ký
ipcMain.handle('api-register', (event, { username, password }) => {
    try {
        const newUser = UserService.registerUser(username, password);
        return { success: true, user: newUser };
    } catch (error) {
        return { success: false, message: error.message }; // Lỗi do trùng user
    }
});

// API: Lưu Log Gù Lưng
ipcMain.handle('api-save-log', (event, { userId, duration, distance }) => {
    try {
        PostureLogService.processAndSaveLog(userId, 'GU_LUNG', duration, distance);
        return { success: true };
    } catch (error) {
        console.error("Lỗi lưu log:", error);
        return { success: false, message: error.message };
    }
});

// API: Lấy thống kê cho trang Dashboard
ipcMain.handle('api-get-today-stats', (event, userId) => {
    try {
        return { success: true, data: PostureLogService.getTodayStats(userId) };
    } catch (error) {
        return { success: false, message: error.message };
    }
});