# Tech Context - AI Photo Booth

## Stack công nghệ

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **Camera Integration**: React Webcam
- **State Management**: React Context API + Reducers
- **HTTP Client**: Axios
- **Build Tool**: Create React App

### Backend
- **Framework**: FastAPI (Python)
- **API Documentation**: Swagger UI (tích hợp với FastAPI)
- **Image Processing**: Pillow (Python Imaging Library)
- **Environment Management**: python-dotenv
- **Logging**: Python logging module
- **Async Processing**: FastAPI background tasks

### External Services
- **AI Generation**: Leonardo.ai API
- **In ấn**: Tích hợp CUPS hoặc dịch vụ in ảnh (hiện đang mô phỏng)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **File Storage**: Local file system

## Môi trường phát triển

### Yêu cầu cài đặt
- Node.js 18 hoặc cao hơn
- Python 3.9 hoặc cao hơn
- Docker và Docker Compose (nếu sử dụng)
- Leonardo.ai API key

### Biến môi trường
- `LEONARDO_API_KEY`: API key để kết nối với Leonardo.ai
- `REACT_APP_API_URL`: URL của backend API (chỉ khi chạy không dùng Docker)
- `CORS_ORIGINS`: Danh sách nguồn gốc được phép CORS (mặc định "*")

## Quy trình dữ liệu

### Luồng xử lý ảnh
1. **Chụp ảnh** từ webcam (frontend)
2. **Upload ảnh** lên backend (lưu tạm thời)
3. **Upload ảnh** từ backend lên Leonardo.ai
4. **Gửi prompt và ảnh** để tạo biến thể
5. **Polling trạng thái** cho đến khi hoàn thành
6. **Lấy URL ảnh kết quả** từ Leonardo.ai
7. **Tải và lưu ảnh** tạm thời trên backend (không bắt buộc)
8. **Hiển thị ảnh kết quả** trên frontend
9. **In ảnh** được chọn

### Quản lý phiên
- Mỗi người dùng = một phiên duy nhất (session_id)
- Tất cả dữ liệu phiên được lưu trong thư mục riêng
- Tự động dọn dẹp sau khi hoàn thành hoặc khi gọi endpoint dọn dẹp

## API Endpoints

### Generation API
- `POST /api/generation/upload`: Upload ảnh từ frontend
  - Input: File ảnh (form data)
  - Output: session_id, đường dẫn file

- `POST /api/generation/generate`: Gửi ảnh và prompt tới Leonardo.ai
  - Input: session_id, prompt, số lượng ảnh, chiều rộng, chiều cao
  - Output: generation_id, trạng thái

- `GET /api/generation/status/{session_id}`: Kiểm tra trạng thái tạo ảnh
  - Input: session_id
  - Output: trạng thái, URLs ảnh (nếu hoàn thành)

- `DELETE /api/generation/session/{session_id}`: Dọn dẹp phiên
  - Input: session_id
  - Output: thông báo thành công

### Print API
- `POST /api/print`: In ảnh đã chọn
  - Input: URL ảnh hoặc đường dẫn
  - Output: trạng thái in, print_job_id

## Xử lý Leonardo.ai API

### Các bước tương tác
1. Lấy presigned URL để upload ảnh
2. Upload ảnh lên cloud storage
3. Gửi yêu cầu generation với prompt và ảnh đã upload
4. Kiểm tra trạng thái generation theo định kỳ
5. Lấy URLs của ảnh kết quả khi hoàn thành

### Model sử dụng
- **Model ID**: 6bef9f1b-29cb-40c7-b9df-32b51c1f67d3
- **Thông số mặc định**:
  - Width: 512px
  - Height: 512px
  - Số ảnh: 4

## Xử lý in ấn

### Hiện trạng
- Hiện tại đang sử dụng code giả lập cho chức năng in

### Tích hợp tương lai
- Cần chỉnh sửa `PrintService` để kết nối với máy in thực tế
- Có thể sử dụng CUPS trên Linux hoặc các API in khác
- Cần bổ sung cấu hình như tên máy in, khổ giấy, v.v.

## Quản lý hiệu suất và lỗi

### Logging
- Sử dụng Python logging module để ghi log
- Log được định dạng với timestamp, module, level và message
- Log mức INFO trở lên

### Xử lý lỗi
- Sử dụng try/except để bắt và ghi log lỗi
- Trả về HTTP exceptions với status code và chi tiết phù hợp
- Frontend hiển thị thông báo lỗi thân thiện với người dùng

### Tối ưu hiệu suất
- Background tasks trong FastAPI để xử lý các tác vụ không đồng bộ
- Lưu trữ tạm thời ảnh và kết quả
- Tự động dọn dẹp để tránh tràn ổ đĩa
