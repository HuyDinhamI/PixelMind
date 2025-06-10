# PixelMind - AI Image Editor

Ứng dụng web chỉnh sửa ảnh thông minh sử dụng Leonardo AI. Người dùng có thể chụp ảnh, nhập mô tả chỉnh sửa, và nhận về ảnh đã được AI xử lý.

## 🚀 Tính năng

- **Chụp ảnh trực tiếp**: Sử dụng camera của máy tính
- **Hỗ trợ tiếng Việt**: Nhập mô tả bằng tiếng Việt, tự động dịch sang tiếng Anh
- **AI Image Editing**: Tích hợp Leonardo AI để chỉnh sửa ảnh thông minh
- **Giao diện thân thiện**: Thiết kế đơn giản, dễ sử dụng
- **Preview & Download**: Xem trước và tải xuống kết quả
- **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🏗️ Kiến trúc

```
pixelmind-web/
├── frontend/           # Frontend (HTML/CSS/JS)
│   ├── index.html     # Màn hình chính
│   ├── camera.html    # Giao diện camera
│   ├── edit.html      # Giao diện chỉnh sửa
│   ├── result.html    # Hiển thị kết quả
│   ├── style.css      # CSS styling
│   └── script.js      # JavaScript functions
├── backend/           # Backend (Python Flask)
│   ├── app.py         # Flask server
│   ├── leonardo_api.py # Leonardo AI integration
│   ├── requirements.txt
│   ├── uploads/       # Thư mục ảnh upload
│   └── results/       # Thư mục ảnh kết quả
└── README.md
```

## 📋 Yêu cầu hệ thống

- Python 3.7+
- Camera (webcam)
- Trình duyệt hỗ trợ WebRTC
- Kết nối internet (cho Leonardo AI)

## 🛠️ Cài đặt

### 1. Clone hoặc tải project

```bash
# Nếu sử dụng git
git clone <repository-url>
cd pixelmind-web

# Hoặc tải và giải nén thư mục
```

### 2. Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Kích hoạt virtual environment
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### 3. Chạy Backend

**Option 1: Sử dụng script tự động (Khuyến nghị)**
```bash
# Từ thư mục gốc
./start_fastapi.sh
```

**Option 2: Chạy thủ công**
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

Backend sẽ chạy tại `http://localhost:5000`

### 4. Chạy Frontend

Mở file `frontend/index.html` trong trình duyệt:

```bash
# Cách 1: Mở trực tiếp
cd frontend
# Mở index.html bằng trình duyệt

# Cách 2: Sử dụng Python HTTP server (khuyến nghị)
cd frontend
python -m http.server 8080
# Truy cập http://localhost:8080
```

## 🎯 Cách sử dụng

1. **Bắt đầu**: Mở `index.html` và nhấn "Bắt đầu chụp ảnh"

2. **Chụp ảnh**: 
   - Cho phép truy cập camera khi browser yêu cầu
   - Nhấn nút chụp để capture ảnh
   - Xem preview và chọn "Sử dụng ảnh này"

3. **Chỉnh sửa**:
   - Nhập mô tả cách muốn chỉnh sửa ảnh
   - Có thể sử dụng các gợi ý có sẵn
   - Nhấn "Tạo ảnh mới"

4. **Kết quả**:
   - Chờ AI xử lý (20-30 giây)
   - Xem so sánh ảnh gốc vs ảnh đã chỉnh sửa
   - Tải xuống ảnh hoặc thử lại

## ⚙️ Cấu hình

### Leonardo AI API Key

API key được hardcode trong `backend/leonardo_api.py`:

```python
self.api_key = "5605afe7-1f6d-40fd-979e-22b7f2df72ce"
```

Để thay đổi API key, sửa dòng này trong file `leonardo_api.py`.

### Settings khác

Các settings được hardcode trong `leonardo_api.py`:

- **Model**: Leonardo Creative (`6bef9f1b-29cb-40c7-b9df-32b51c1f67d3`)
- **Size**: 512x512
- **Guidance Scale**: 20
- **Number of Images**: 1

## 🐛 Troubleshooting

### Backend không khởi động

```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -an | grep 5000

# Kiểm tra dependencies
pip list

# Kiểm tra Python version
python --version
```

### Camera không hoạt động

- Đảm bảo browser có quyền truy cập camera
- Thử refresh trang và cho phép lại
- Kiểm tra camera có đang được ứng dụng khác sử dụng

### Không kết nối được Leonardo AI

- Kiểm tra kết nối internet
- Kiểm tra API key có đúng không
- Xem console log để biết lỗi cụ thể

### CORS Error

Nếu gặp lỗi CORS khi chạy frontend từ file://

```bash
# Chạy frontend qua HTTP server
cd frontend
python -m http.server 8080
```

## 🔧 Development

### Thêm tính năng mới

1. **Frontend**: Thêm vào các file HTML/CSS/JS trong `frontend/`
2. **Backend**: Thêm routes mới trong `app.py`
3. **AI Integration**: Sửa đổi `leonardo_api.py`

### Debug

- Backend logs: Kiểm tra terminal chạy Flask
- Frontend logs: Mở Developer Tools > Console
- Network: Kiểm tra tab Network trong DevTools

## 📝 Ghi chú

- Ứng dụng chỉ hỗ trợ chạy trên localhost
- API key Leonardo AI có giới hạn usage
- File ảnh được lưu tạm trong `uploads/` và `results/`
- LocalStorage được sử dụng để lưu trạng thái giữa các trang

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra console logs
2. Đảm bảo backend đang chạy
3. Kiểm tra kết nối mạng
4. Thử refresh browser

---

**Lưu ý**: Đây là ứng dụng demo, không nên sử dụng trong production mà chưa có các biện pháp bảo mật phù hợp.
