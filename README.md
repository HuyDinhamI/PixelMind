# PixelMind - Game Biến Hóa Phong Cách

Một game web thuần frontend cho phép người dùng biến hóa phong cách của mình bằng công nghệ AI.

## 🎮 Tính Năng

### Game Flow (5 Phases):
1. **Phase 1 - Đăng nhập**: Nhập họ tên và email (có xác thực email)
2. **Phase 2 - Chụp ảnh**: Chụp ảnh cá nhân với preview và xác nhận
3. **Phase 3 - Nhập prompts**: 
   - Prompt 1: Mô tả thay đổi chính cho ảnh
   - Prompt 2: Mô tả style và phong cách mong muốn
4. **Phase 4 - Đợi tạo ảnh**: Loading screen với animations và fun facts
5. **Phase 5 - Kết quả**: So sánh ảnh gốc và ảnh được biến hóa

### Công Nghệ AI:
- **Frontend thuần**: HTML + CSS + JavaScript (không cần backend)
- **Dịch thuật**: Gemini AI API (gọi trực tiếp từ JavaScript)
- **Tạo ảnh**: Leonardo AI API (gọi trực tiếp từ JavaScript)
- **Luồng xử lý**: Upload ảnh → Tạo style image → Tạo ảnh cuối cùng

## 🛠️ Cài Đặt

### Requirements:
- **Trình duyệt hiện đại** (Chrome 80+, Firefox 75+, Safari 13+)
- **Kết nối internet** để gọi API
- **Camera/Webcam** để chụp ảnh

### File Structure:
```
PixelMind/
├── index.html          # Game chính
├── style.css           # Styling và animations
├── script.js           # Game logic + AI integration
├── .env               # API keys (chỉ để tham khảo)
├── start_bg.jpg       # Background đăng nhập
├── main.py            # Script gốc (tham khảo)
└── README.md          # Hướng dẫn này
```

## 🚀 Cách Chạy

### Cách 1: Live Server (Khuyến nghị):
```bash
# Sử dụng VS Code extension Live Server
# Right-click index.html → "Open with Live Server"
```

### Cách 2: Python HTTP Server:
```bash
cd /home/misa/Code/PixelMind
python3 -m http.server 8080
```
Sau đó mở: `http://localhost:8080`

### Cách 3: Mở trực tiếp:
```bash
# Trên Linux
xdg-open index.html

# Hoặc kéo thả file index.html vào trình duyệt
```

### 🔧 Cấu Hình CORS (nếu cần):

Do gọi API trực tiếp từ frontend, có thể gặp CORS issues. Giải pháp:

**Chrome với CORS disabled:**
```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"
```

**Firefox (không cần config đặc biệt)**

## 🔑 API Keys

API keys được hardcode trong `script.js` để đơn giản. Trong production, nên sử dụng environment variables hoặc proxy server.

```javascript
// Trong script.js
const LEONARDO_API_KEY = 'ed4bdeec-a43d-423e-aa0f-25f5618280a5';
const GEMINI_API_KEY = 'AIzaSyDBzJdJCKt8ZWGOxNkJ7DfF0uTNFyLyUv0';
```

## 🎯 Cách Sử Dụng

### Bước 1: Đăng nhập
- Nhập **họ và tên** (ít nhất 2 ký tự)
- Nhập **email** hợp lệ (có validation)
- Click "Bắt đầu biến hóa"

### Bước 2: Chụp ảnh
- Click "Bật camera" để truy cập webcam
- Click nút tròn để **chụp ảnh** (hoặc nhấn Space)
- Xem preview và chọn "Chụp lại" hoặc "Tiếp tục"

### Bước 3: Tạo phép màu
- **Prompt 1**: Mô tả thay đổi bạn muốn
  - *Ví dụ: "Tôi muốn đội mũ lưỡi trai, mặc áo hoodie xanh"*
- **Prompt 2**: Mô tả phong cách và không gian
  - *Ví dụ: "Phong cách Nhật Bản, khung cảnh núi Phú Sĩ, ánh sáng mềm mại"*
- Click "Biến hóa ngay"

### Bước 4: Đợi kết quả
- Xem loading animations và fun facts
- Thời gian tạo ảnh: ~90 giây (30s + 60s)

### Bước 5: Kết quả
- So sánh ảnh gốc vs ảnh biến hóa
- "Tải ảnh" để download
- "Chơi lại" để bắt đầu lại

## 🎨 Tính Năng Đặc Biệt

### Animations & UI:
- **Smooth transitions** giữa các phases
- **Gradient backgrounds** với màu sắc trẻ trung
- **Loading animations** với progress bar
- **Hover effects** và click animations
- **Responsive design** cho nhiều kích thước màn hình

### UX Features:
- **Character counters** cho prompts (max 200 ký tự)
- **Email validation** real-time
- **Keyboard shortcuts** (Space = chụp ảnh)
- **Error handling** với messages thân thiện
- **Local storage** để lưu dữ liệu tạm thời

### AI Integration:
- **Gemini AI** cho việc dịch thuật chất lượng cao
- **Leonardo AI** với ControlNet cho chất lượng ảnh professional
- **Dual ControlNet**:
  - Character Reference (giữ nguyên đặc điểm khuôn mặt)
  - Style Reference (áp dụng phong cách mong muốn)

## 🐛 Troubleshooting

### CORS Errors:
```bash
# Sử dụng Chrome với CORS disabled
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"

# Hoặc sử dụng Firefox (thường không có vấn đề CORS)
firefox index.html
```

### Camera không hoạt động:
- Cho phép quyền truy cập camera trong browser
- Sử dụng HTTPS hoặc localhost (HTTP)
- Kiểm tra browser compatibility
- Restart browser nếu cần

### API Calls Failed:
- Kiểm tra DevTools (F12) → Network tab để xem lỗi
- Verify API keys vẫn còn hoạt động
- Kiểm tra credit/quota limits trên Leonardo AI và Gemini
- Kiểm tra kết nối internet

### Loading Issues:
- Hard refresh (Ctrl+F5) để clear cache
- Disable browser extensions có thể block API calls
- Kiểm tra JavaScript errors trong Console

## 📱 Demo Mode

Nếu API calls fail, game sẽ tự động chuyển sang **demo mode**:
- Sử dụng ảnh placeholder từ Picsum Photos
- Thời gian chờ ngắn hơn (10 giây thay vì 90 giây)
- Tất cả features khác hoạt động bình thường
- Console sẽ log "Using fallback demo mode..."

## 🎯 Target Audience

Game được thiết kế cho **sinh viên** với:
- **UI trẻ trung**: Colors gradient Instagram/TikTok style
- **Animations playful**: Smooth và engaging
- **UX đơn giản**: Easy-to-use, intuitive
- **Fun elements**: Fun facts, interactive loading

## 📊 Performance

### Loading Times:
- Phase transitions: ~300ms
- Camera initialization: ~1-2s
- Image generation: ~90s (real AI)
- Demo mode: ~10s

### Browser Support:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔮 Future Enhancements

- [ ] Multiple style presets
- [ ] Social sharing features  
- [ ] Image gallery/history
- [ ] Mobile app version
- [ ] Real-time collaboration
- [ ] Advanced editing tools

---

**Made with ❤️ for Vietnamese students**

*Enjoy biến hóa phong cách của bạn! 🎨✨*
