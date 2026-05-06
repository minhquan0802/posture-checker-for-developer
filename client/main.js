const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');


// Ép trình duyệt cho phép phát âm thanh tự động ở chế độ ngầm
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let tray;
let dashboardWindow = null;
let settingsWindow = null;
let isMuted = false;

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
        show: true, // Không hiện/hiển thị cửa sổ lúc mới bật
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
    
    // const contextMenu = Menu.buildFromTemplate([
    //     { label: 'Màn hình chính', click: () => mainWindow.show() },
        
    //     { label: 'Xem Báo Cáo Thống Kê', click: () => {
    //         // 1. Lấy đường dẫn file HTML mà cửa sổ chính đang mở
    //         const currentURL = mainWindow.webContents.getURL();
            
    //         // 2. Nếu đang mở trang login -> Chặn ngay lập tức
    //         if (currentURL.includes('login.html')) {
    //             dialog.showMessageBox({
    //                 type: 'warning',
    //                 title: 'Cảnh báo',
    //                 message: 'Bạn phải đăng nhập trước khi xem báo cáo!'
    //             });
    //             return; // Dừng luôn, không cho chạy xuống hàm mở cửa sổ
    //         }
            
    //         // 3. Nếu không phải login (tức là index.html) -> Cho phép mở
    //         openDashboard();
    //     }},
        
    //     { label: 'Cài Đặt và Hiệu Chuẩn', click: () => {
    //         const currentURL = mainWindow.webContents.getURL();
            
    //         if (currentURL.includes('login.html')) {
    //             dialog.showMessageBox({
    //                 type: 'warning',
    //                 title: 'Cảnh báo',
    //                 message: 'Bạn phải đăng nhập trước khi vào cài đặt!'
    //             });
    //             return;
    //         }
            
    //         openSettings();
    //     }},
        
    //     { type: 'separator' },
    //     { label: 'Đăng Xuất', click: () => {
    //         mainWindow.webContents.send('logout-command');
    //     }},
    //     { label: 'Thoát hoàn toàn', click: () => {
    //         if (dashboardWindow) dashboardWindow.destroy();
    //         if (settingsWindow) settingsWindow.destroy();
    //         mainWindow.destroy();
    //         app.quit();
    //     }}
    // ]);
    

    
    
    // Dynamic Menu
    function updateTrayMenu() {
        const currentURL = mainWindow.webContents.getURL();
        
        // Nếu URL không chứa 'login.html' => Tức là đang ở index.html => Đã đăng nhập
        const isLoggedIn = !currentURL.includes('login.html'); 

        let menuTemplate;

        if (isLoggedIn) {
            // MENU FULL: Dành cho lúc đang chạy Camera
            menuTemplate = [
                { label: 'Mở Màn Hình Camera', click: () => mainWindow.show() },
                { label: 'Xem Báo Cáo Thống Kê', click: () => openDashboard() },
                { label: 'Cài Đặt và Hiệu Chuẩn', click: () => openSettings() },
                { label: isMuted ? '🔊 Bật tiếng' : '🔇 Tắt tiếng', click: () => {
                    isMuted = !isMuted;
                    mainWindow.webContents.send('toggle-mute', isMuted);
                    updateTrayMenu(); // Cập nhật lại label
                }},
                { type: 'separator' },
                { label: 'Đăng Xuất', click: () => {
                    mainWindow.webContents.send('logout-command');
                }},
                { label: 'Thoát hoàn toàn', click: () => {
                    if (dashboardWindow) dashboardWindow.destroy();
                    if (settingsWindow) settingsWindow.destroy();
                    mainWindow.destroy();
                    app.quit();
                }}
            ];
        } else {
            // MENU RÚT GỌN: Dành cho lúc chưa đăng nhập
            menuTemplate = [
                { label: 'Mở Ứng Dụng (Đăng nhập)', click: () => mainWindow.show() },
                { type: 'separator' },
                { label: 'Thoát hoàn toàn', click: () => {
                    mainWindow.destroy();
                    app.quit();
                }}
            ];
        }

        // Ép System Tray nạp lại cái Menu mới này
        const contextMenu = Menu.buildFromTemplate(menuTemplate);
        tray.setContextMenu(contextMenu);
    }

    // 2. Lắng nghe sự kiện chuyển trang của Electron
    // Mỗi khi bạn nhảy từ Login sang Camera, hoặc văng từ Camera về Login, Menu sẽ tự động đổi!
    mainWindow.webContents.on('did-finish-load', () => {
        updateTrayMenu();
    });


    tray.setToolTip('Trợ Lý AI Nhắc Nhở Tư Thế');
    tray.setContextMenu(contextMenu);
});