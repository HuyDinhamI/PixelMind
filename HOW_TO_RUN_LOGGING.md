# 📋 Hướng dẫn chạy Terminal Logging System

## 🖥️ **Tổng quan**
Logging system cho phép xem tất cả logs của PixelMind game trực tiếp trong terminal với màu sắc và format đẹp mắt.

## 🚀 **Cách chạy**

### **Bước 1: Cài đặt dependencies**
```bash
cd /home/misa/Code/PixelMind
pip install flask flask-cors
```

### **Bước 2: Khởi động Log Server (Terminal 1)**
```bash
python3 log_server.py
```

Sẽ thấy output:
```
🚀 Starting PixelMind Log Server...
📡 Frontend should send logs to: http://localhost:3001/api/log
🔧 Health check: http://localhost:3001/api/health
📋 Logs will appear below:
================================================================================
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:3001
 * Running on http://[::1]:3001
```

### **Bước 3: Khởi động Game Frontend (Terminal 2)**
```bash
# Cách 1: Python HTTP Server
python3 -m http.server 8080

# Cách 2: Live Server (VS Code)
# Right-click index.html → "Open with Live Server"
```

### **Bước 4: Mở Game**
Truy cập: `http://localhost:8080`

## 📊 **Logs sẽ hiển thị như:**

```bash
[00:01:15] [INFO] [GAME] Initializing PixelMind Game Controller
[00:01:16] [PHASE] [TRANSITION] 1 → 2: User navigation
    Data: {
      "from": 1,
      "to": 2,
      "reason": "User navigation"
    }
[00:01:20] [INFO] [LOGIN] Starting login process
[00:01:22] [INFO] [LOGIN] Login successful, user data saved
    Data: {
      "fullName": "Nguyễn Văn A",
      "email": "ngu***@gmail.com"
    }
[00:01:25] [INFO] [CAMERA] Requesting camera access
[00:01:27] [INFO] [CAMERA] Camera access granted successfully
    Data: {
      "streamId": "abc123",
      "tracks": 1
    }
[00:01:30] [INFO] [CAMERA] Starting photo capture
[00:01:32] [INFO] [CAMERA] Photo captured successfully
    Data: {
      "imageSize": "145KB",
      "format": "JPEG",
      "quality": 0.8
    }
[00:01:35] [INFO] [AI_GENERATION] Starting AI image generation process
    Data: {
      "prompt1": "tôi muốn đội mũ lưỡi trai",
      "prompt2": "phong cách anime Nhật Bản",
      "imageSize": "145KB"
    }
[00:01:37] [API] [GEMINI] Translation request started
    Data: {
      "originalPrompt": "tôi muốn đội mũ lưỡi trai",
      "promptLength": 22
    }
[00:01:40] [API] [GEMINI] Translation completed successfully
    Data: {
      "originalPrompt": "tôi muốn đội mũ lưỡi trai",
      "translatedPrompt": "I want to wear a baseball cap",
      "responseStatus": 200
    }
```

## 🎨 **Color Coding**

- **🔵 INFO** - Blue: Thông tin chung
- **🟡 WARN** - Yellow: Cảnh báo
- **🔴 ERROR** - Red: Lỗi  
- **🔷 API** - Cyan: API calls
- **🟣 PHASE** - Magenta: Phase transitions

## 🔧 **Troubleshooting**

### **Log server không start được:**
```bash
# Kiểm tra port 3001 có được sử dụng không
lsof -i :3001

# Kill process nếu cần
pkill -f log_server.py

# Chạy lại
python3 log_server.py
```

### **Frontend không gửi logs:**
- Kiểm tra browser console có errors không
- Verify log server đang chạy: `http://localhost:3001/api/health`
- Kiểm tra CORS settings

### **Logs bị trống:**
- Logs chỉ xuất hiện khi user interact với game
- Cần chụp ảnh và generate để thấy full flow
- API calls real sẽ có nhiều logs hơn demo mode

## 💡 **Tips**

### **Lọc logs specific phase:**
```bash
python3 log_server.py | grep "CAMERA"
python3 log_server.py | grep "API"
python3 log_server.py | grep "ERROR"
```

### **Save logs to file:**
```bash
python3 log_server.py | tee pixelmind_logs.txt
```

### **Beautify JSON data:**
Logs đã được format với JSON indent = 2 cho dễ đọc.

## 📈 **Monitoring trong Production**

Có thể extend log server để:
- Save logs vào database
- Add log rotation
- Create dashboard
- Set up alerts cho errors
- Add metrics và analytics

---

**Happy Debugging! 🎯✨**
