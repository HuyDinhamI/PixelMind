# AI Photo Booth

Một ứng dụng web cho phép chụp ảnh người dùng, biến đổi bằng Leonardo.ai và in ảnh đã tạo.

![AI Photo Booth](https://via.placeholder.com/800x400?text=AI+Photo+Booth)

## Tính năng

- 📸 Chụp ảnh từ camera
- 🧠 Sinh ảnh từ Leonardo.ai
- 🎨 Biến đổi ảnh theo nhiều phong cách khác nhau
- 🖨️ In ảnh đã chọn
- 🔁 Tự động reset cho nhiều người dùng

## Công nghệ sử dụng

- **Frontend**: React, Material-UI, React Webcam
- **Backend**: Python, FastAPI
- **AI**: Leonardo.ai API
- **Container**: Docker và docker-compose
- **Web Server**: Nginx

## Các bước hoạt động

1. Hiển thị màn hình chào mừng với các ảnh mẫu
2. Người dùng chụp ảnh qua webcam
3. Nhập hoặc chọn mô tả phong cách
4. Tạo ảnh qua Leonardo.ai API
5. Hiển thị 4 ảnh kết quả để lựa chọn
6. In ảnh đã chọn
7. Tự động reset để phục vụ người dùng tiếp theo

## Cài đặt và chạy

### Yêu cầu chung

- API key từ Leonardo.ai (Đăng ký tại [Leonardo.ai](https://leonardo.ai))

### Cấu hình biến môi trường

Dự án sử dụng file `.env` để lưu trữ các biến môi trường và API key. Vì lý do bảo mật, file này không được đưa lên GitHub.

1. Sao chép file mẫu `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Chỉnh sửa file `.env` và thêm API key của bạn:
   ```
   LEONARDO_API_KEY="your_leonardo_api_key_here"
   ```

### Phương pháp 1: Sử dụng Docker

#### Yêu cầu
- Docker và docker-compose

#### Các bước cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd pixel-mind
```

2. Thêm API key vào file .env:
```bash
# Tạo hoặc chỉnh sửa file .env
echo "LEONARDO_API_KEY=your_api_key_here" > .env
```

3. Build và chạy ứng dụng với Docker:
```bash
docker-compose up --build
```

4. Truy cập ứng dụng:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Swagger UI (API Documentation): http://localhost:5000/docs

### Phương pháp 2: Cài đặt trực tiếp (không dùng Docker)

#### Yêu cầu
- Node.js 18 hoặc cao hơn
- Python 3.9 hoặc cao hơn
- npm hoặc yarn
- pip

#### 1. Cài đặt và chạy Backend

```bash
# Di chuyển đến thư mục backend
cd backend

# Tạo môi trường ảo (khuyến nghị)
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env với API key
echo "LEONARDO_API_KEY=your_api_key_here" > .env

# Tạo thư mục uploads nếu chưa tồn tại
mkdir -p uploads

# Chạy server
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

Backend API sẽ chạy tại: http://localhost:5000

#### 2. Cài đặt và chạy Frontend

```bash
# Mở terminal mới, di chuyển đến thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
# hoặc
yarn install

# Cấu hình API endpoint trong .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Chạy development server
npm start
# hoặc
yarn start
```

Frontend sẽ chạy tại: http://localhost:3000

**Lưu ý:** Khi chạy không dùng Docker, frontend và backend chạy trên các port khác nhau. Bạn cần cấu hình CORS trên backend hoặc sử dụng proxy trong frontend để giao tiếp giữa chúng.

## Cấu trúc dự án

```
pixel-mind/
├── backend/             # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes và services
│   │   │   ├── routes/  # Định nghĩa endpoints
│   │   │   └── services/# Các dịch vụ giao tiếp với API bên ngoài
│   │   ├── core/        # Cấu hình cốt lõi
│   │   └── main.py      # Entry point
│   ├── Dockerfile       # Cấu hình Docker cho backend
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   ├── App.js       # Main application component
│   │   └── index.js     # Entry point
│   ├── Dockerfile       # Cấu hình Docker cho frontend
│   └── package.json     # Node.js dependencies
├── nginx/               # Nginx configuration
│   ├── Dockerfile       # Cấu hình Docker cho nginx
│   └── nginx.conf       # Cấu hình nginx
├── docker-compose.yml   # Docker Compose configuration
├── .env                 # Environment variables
└── README.md            # This file
```

## Tích hợp máy in

Phiên bản hiện tại chứa code giả lập cho chức năng in. Để tích hợp với máy in thực tế:

1. Chỉnh sửa `backend/app/api/services/print_service.py` để thay thế giả lập bằng kết nối thực.
2. Tùy thuộc vào loại máy in, sử dụng driver hoặc API phù hợp (như CUPS trên Linux).

## Phát triển

### Cấu trúc API

#### Generation API
- `POST /api/generation/create`: Tạo hình ảnh mới từ ảnh và prompt
- `GET /api/generation/{id}`: Lấy kết quả generation theo ID

#### Print API
- `POST /api/print`: In ảnh đã chọn

### Frontend Flow

Ứng dụng frontend sử dụng React Context để quản lý luồng trạng thái qua các màn hình khác nhau:
1. WelcomeScreen → CameraCapture → PromptInput → GeneratingScreen → ResultScreen → PrintingScreen → CompleteScreen

## License

MIT
