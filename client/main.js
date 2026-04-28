const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');


// Ép trình duyệt cho phép phát âm thanh tự động ở chế độ ngầm
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let tray;
let dashboardWindow = null;
let settingsWindow = null;

function openSettings() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 650,
        height: 600,
        title: "Cài Đặt & Hiệu Chuẩn",
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: false }
    });

    settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

function openDashboard() {
    // Nếu cửa sổ đã mở rồi thì đưa nó lên trên cùng, không tạo thêm cái mới
    if (dashboardWindow) {
        dashboardWindow.focus();
        return;
    }

    dashboardWindow = new BrowserWindow({
        width: 850,
        height: 600,
        title: "Thống Kê Tư Thế",
        autoHideMenuBar: true, // Ẩn thanh menu (File, Edit, View...)
        webPreferences: {
            nodeIntegration: false
        }
    });

    dashboardWindow.loadFile(path.join(__dirname, 'dashboard.html'));

    // Khi người dùng bấm X đóng cửa sổ báo cáo thì xóa biến nhớ
    dashboardWindow.on('closed', () => {
        dashboardWindow = null;
    });
}

app.whenReady().then(() => {
    // 1. Tạo một cửa sổ ứng dụng (ẩn đi mặc định)
    mainWindow = new BrowserWindow({
        // width: 800,
        // height: 600,
        width: 1000,
        height: 800,
        show: true, // Không hiện cửa sổ lúc mới bật
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,

            // Không cho trình duyệt "ngủ đông" ứng dụng khi ẩn cửa sổ
            backgroundThrottling: false
        }
    });

    // 2. Trỏ vào index.html để hiển thị giao diện
    // mainWindow.loadFile(path.join(__dirname, 'index.html'));

    //Mở file login.html thay vì index.html
    mainWindow.loadFile(path.join(__dirname, 'login.html'));

    // 3. Xử lý khi bấm nút X (Không thoát app mà chỉ ẩn đi)
    mainWindow.on('close', function (event) {
        event.preventDefault();
        // event.stopPropagation();
        mainWindow.hide();
    });

    // 4. Tạo icon dưới System Tray (icon.png)
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png')); 
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Hiển thị Camera', click: () => mainWindow.show() },
        { label: 'Số lần ngồi gù', click: () => openDashboard() },
        { label: 'Cài Đặt & Hiệu Chuẩn', click: () => openSettings() },
        { type: 'separator' }, // Tạo một đường kẻ ngang
        { label: 'Thoát hoàn toàn', click: () => {
            if (dashboardWindow) dashboardWindow.destroy(); // Đóng Dashboard nếu đang mở
            if (settingsWindow) settingsWindow.destroy(); // Dọn dẹp luôn cửa sổ settings
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setToolTip('Trợ Lý AI Nhắc Nhở Tư Thế');
    tray.setContextMenu(contextMenu);
});