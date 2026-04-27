const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;

app.whenReady().then(() => {
    // 1. Tạo một cửa sổ ứng dụng (ẩn đi mặc định)
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Không hiện cửa sổ lúc mới bật
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 2. Trỏ đường dẫn vào chính cái file index.html bạn đã code sẵn
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // 3. Xử lý khi bấm nút X (Không thoát app mà chỉ ẩn đi)
    mainWindow.on('close', function (event) {
        event.preventDefault();
        // event.stopPropagation();
        mainWindow.hide();
    });

    // 4. Tạo icon dưới System Tray (khay hệ thống)
    // Lưu ý: Cần 1 file ảnh icon nhỏ (ví dụ icon.png) để hiển thị ở góc phải
    tray = new Tray(path.join(__dirname, 'icon.png')); 
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Hiển thị Camera', click: () => mainWindow.show() },
        { label: 'Thoát hoàn toàn', click: () => {
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setToolTip('Trợ Lý AI Nhắc Nhở Tư Thế');
    tray.setContextMenu(contextMenu);
});