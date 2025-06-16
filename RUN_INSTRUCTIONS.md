# 🚀 Hướng dẫn chạy PixelMind với Backend API

## 🏗️ **Architecture mới:**
```
Frontend (UI) → Backend API (api_server.py) → Leonardo AI + Gemini
     ↓              ↓                            ↓
 Browser         Terminal Logs            External APIs
```

## 📋 **Cách chạy hệ thống:**

### **Terminal 1: API Server (Main Backend)**
```bash
cd /home/misa/Code/PixelMind
python3 api_server.py
```

Expected output:
```
🚀 Starting PixelMind API Server...
📡 Frontend should call: http://localhost:5000/api/generate-image
🔧 Health check: http://localhost:5000/api/health
📋 Logs will appear below:
================================================================================
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

### **Terminal 2: Frontend Server**
```bash
cd /home/misa/Code/PixelMind
python3 -m http.server 8082
```

### **Terminal 3: Log Server (Optional)**
```bash
cd /home/misa/Code/PixelMind
python3 log_server.py
```
*Để xem logs từ frontend (browser interactions)*

### **Browser:**
```
http://localhost:8082
```

## 🔄 **Data Flow:**

### **Frontend → Backend:**
```javascript
POST http://localhost:5000/api/generate-image
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "prompt1": "tôi muốn đội mũ lưỡi trai",
  "prompt2": "phong cách anime Nhật Bản"
}
```

### **Backend Processing:**
1. ✅ **Receive request** from frontend
2. ✅ **Save base64 image** to temporary file
3. ✅ **Translate prompts** via Gemini AI
4. ✅ **Upload image** to Leonardo AI
5. ✅ **Generate style image** with translated prompt2
6. ✅ **Generate final image** with ControlNet (Character + Style)
7. ✅ **Return image URL** to frontend

### **Expected Terminal Logs:**
```bash
[00:12:15] [PHASE] [API_REQUEST] Received image generation request
[00:12:16] [INFO] [AI_GENERATION] Processing image generation request
    Data: {
      "prompt1": "tôi muốn đội mũ lưỡi trai",
      "prompt2": "phong cách anime Nhật Bản",
      "imageSize": "145KB"
    }
[00:12:17] [INFO] [IMAGE_PROCESSING] Base64 image saved successfully
[00:12:18] [API] [GEMINI] Translation request started
[00:12:20] [API] [GEMINI] Translation completed successfully
[00:12:22] [API] [LEONARDO] Starting image upload
[00:12:25] [API] [LEONARDO] Image uploaded successfully
[00:12:27] [API] [LEONARDO] Starting style image generation
[00:12:57] [API] [LEONARDO] Style image generated successfully
[00:12:59] [API] [LEONARDO] Starting final image generation with ControlNet
[00:13:59] [API] [LEONARDO] Final image generated successfully
[00:14:00] [PHASE] [AI_GENERATION] Image generation completed successfully
```

## 🎯 **Test Endpoints:**

### **Health Check:**
```bash
curl http://localhost:5000/api/health
```

### **Translation Test:**
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "tôi muốn đội mũ lưỡi trai"}'
```

## 🔧 **Troubleshooting:**

### **API Server không start:**
```bash
# Check dependencies
pip install flask flask-cors requests openai pillow

# Check port 5000
lsof -i :5000

# Kill if needed
pkill -f api_server.py
```

### **Frontend không connect được backend:**
- Kiểm tra API server đang chạy trên port 5000
- Verify health endpoint: `http://localhost:5000/api/health`
- Check browser console cho CORS errors

### **AI Generation fails:**
- Check API keys trong api_server.py
- Verify Leonardo AI credits
- Check Gemini API access

### **No logs appearing:**
- Logs chỉ xuất hiện khi có requests
- Cần chụp ảnh và generate để thấy full workflow
- Check terminal running api_server.py

## ✅ **Success Indicators:**

### **Frontend UI:**
- ✅ Login works
- ✅ Camera access granted
- ✅ Photo capture successful
- ✅ Prompt validation passes
- ✅ Loading phase shows
- ✅ Final image displays

### **Backend Terminal:**
- ✅ All phases logged with colors
- ✅ API calls successful (200 status)
- ✅ Image processing completed
- ✅ No error messages
- ✅ Final image URL returned

## 💡 **Performance:**

### **Expected Timing:**
- **Translation**: ~2-3 seconds per prompt
- **Image upload**: ~3-5 seconds
- **Style generation**: ~30 seconds
- **Final generation**: ~60 seconds
- **Total time**: ~90-100 seconds

### **Fallback Mode:**
Nếu API calls fail, frontend sẽ tự động switch sang demo mode:
- Random image từ Picsum Photos
- Chỉ mất ~10 giây
- Tất cả UI features vẫn hoạt động

## 🎨 **Demo vs Real Mode:**

| Feature | Demo Mode | Real AI Mode |
|---------|-----------|--------------|
| Image Quality | Random stock photo | AI-generated with face + style |
| Processing Time | 10 seconds | 90 seconds |
| API Calls | None | Gemini + Leonardo |
| Logs | Minimal | Detailed step-by-step |
| User Experience | Fast preview | Real transformation |

---

**Happy AI Image Generation! 🎨✨**

*Nếu gặp issues, check terminal logs để debug từng step!*
