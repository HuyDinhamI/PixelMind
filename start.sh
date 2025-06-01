#!/bin/bash

# PixelMind Startup Script

echo "🎨 PixelMind - AI Image Editor"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python không được tìm thấy. Vui lòng cài đặt Python 3.7+"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python được tìm thấy: $($PYTHON_CMD --version)"

# Start backend
echo ""
echo "🚀 Đang khởi động Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Tạo virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
echo "🔧 Kích hoạt virtual environment..."
source venv/bin/activate

# Install requirements
echo "📚 Cài đặt dependencies..."
pip install -r requirements.txt

# Start Flask server
echo "🌐 Khởi động Flask server tại http://localhost:5000"
echo "💡 Nhấn Ctrl+C để dừng server"
echo ""

$PYTHON_CMD app.py &
FLASK_PID=$!

# Start frontend server
echo "🎨 Khởi động Frontend server tại http://localhost:8080"
cd ../frontend
$PYTHON_CMD -m http.server 8080 &
FRONTEND_PID=$!

echo ""
echo "✅ PixelMind đã sẵn sàng!"
echo "🔗 Truy cập: http://localhost:8080"
echo ""
echo "Nhấn Ctrl+C để dừng toàn bộ ứng dụng"

# Wait for interrupt
trap 'echo ""; echo "🛑 Đang dừng PixelMind..."; kill $FLASK_PID $FRONTEND_PID; exit' INT

# Keep script running
wait
