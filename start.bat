@echo off
title PixelMind - AI Image Editor

echo 🎨 PixelMind - AI Image Editor
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python không được tìm thấy. Vui lòng cài đặt Python 3.7+
    pause
    exit /b 1
)

echo ✅ Python được tìm thấy
python --version

echo.
echo 🚀 Đang khởi động Backend...
cd backend

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Tạo virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Kích hoạt virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📚 Cài đặt dependencies...
pip install -r requirements.txt

REM Start Flask server
echo 🌐 Khởi động Flask server tại http://localhost:5000
echo 💡 Nhấn Ctrl+C để dừng server
echo.

start "PixelMind Backend" cmd /k "python app.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🎨 Khởi động Frontend server tại http://localhost:8080
cd ..\frontend

start "PixelMind Frontend" cmd /k "python -m http.server 8080"

REM Wait a bit for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo ✅ PixelMind đã sẵn sàng!
echo 🔗 Truy cập: http://localhost:8080
echo.
echo Nhấn phím bất kỳ để mở trình duyệt...
pause >nul

REM Open browser
start http://localhost:8080

echo.
echo Nhấn phím bất kỳ để đóng script...
echo (Backend và Frontend sẽ tiếp tục chạy trong các cửa sổ riêng)
pause >nul
