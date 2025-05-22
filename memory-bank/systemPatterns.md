# System Patterns - AI Photo Booth

## Kiến trúc tổng quan

```mermaid
flowchart TB
    User[Người dùng] --> Frontend
    
    subgraph Client["Frontend (React)"]
        Frontend[Giao diện người dùng]
        Context[AppStateContext]
        Webcam[Chụp ảnh webcam]
        APIClient[API Client]
        
        Frontend <--> Context
        Context <--> Webcam
        Context <--> APIClient
    end
    
    subgraph Server["Backend (FastAPI)"]
        API[API Endpoints]
        LeonardoService[Leonardo Service]
        PrintService[Print Service]
        
        API <--> LeonardoService
        API <--> PrintService
    end
    
    subgraph External["External Services"]
        LeonardoAPI[Leonardo.ai API]
        Printer[Máy in]
    end
    
    APIClient <--> API
    LeonardoService <--> LeonardoAPI
    PrintService <--> Printer
```

## Mô hình triển khai

```mermaid
flowchart LR
    subgraph Docker["Docker Compose Environment"]
        Frontend[Frontend Container]
        Backend[Backend Container]
        Nginx[Nginx Container]
    end
    
    Client[Web Browser] --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Backend --> LeonardoAPI[Leonardo.ai API]
    Backend --> Printer[Máy in]
```

## Quản lý trạng thái

### Máy trạng thái ứng dụng

```mermaid
stateDiagram-v2
    [*] --> WELCOME
    WELCOME --> CAPTURE: Người dùng bắt đầu
    CAPTURE --> PROMPT: Chụp ảnh thành công
    PROMPT --> GENERATING: Gửi prompt
    GENERATING --> RESULTS: Nhận kết quả
    RESULTS --> PRINTING: Chọn ảnh để in
    PRINTING --> COMPLETE: In hoàn tất
    COMPLETE --> WELCOME: Tự động reset
    
    state IDLE_TIMEOUT <<fork>>
    CAPTURE --> IDLE_TIMEOUT: Không hoạt động > 60s
    PROMPT --> IDLE_TIMEOUT: Không hoạt động > 60s
    RESULTS --> IDLE_TIMEOUT: Không hoạt động > 60s
    PRINTING --> IDLE_TIMEOUT: Không hoạt động > 60s
    COMPLETE --> IDLE_TIMEOUT: Không hoạt động > 60s
    IDLE_TIMEOUT --> WELCOME
```

### Quản lý trạng thái Frontend

- Sử dụng **React Context API** (`AppStateContext.js`) để quản lý trạng thái toàn cục
- Các actions được định nghĩa rõ ràng để xử lý chuyển trạng thái
- Tự động theo dõi thời gian không hoạt động để reset ứng dụng

### Luồng xử lý dữ liệu

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant Frontend
    participant Backend
    participant Leonardo as Leonardo.ai API
    participant Printer as Máy in
    
    User->>Frontend: Bắt đầu
    Frontend->>User: Hiển thị camera
    User->>Frontend: Chụp ảnh
    Frontend->>Backend: Upload ảnh (POST /api/generation/upload)
    Backend->>Frontend: Trả về session_id
    User->>Frontend: Nhập prompt
    Frontend->>Backend: Gửi prompt (POST /api/generation/generate)
    Backend->>Leonardo: Gửi ảnh và prompt
    Leonardo->>Backend: Trả về generation_id
    Backend->>Frontend: Trả về generation_id
    loop Kiểm tra trạng thái
        Frontend->>Backend: Kiểm tra trạng thái (GET /api/generation/status/{session_id})
        Backend->>Leonardo: Kiểm tra tình trạng
        Leonardo->>Backend: Trả về kết quả hoặc đang xử lý
        Backend->>Frontend: Cập nhật trạng thái
    end
    Frontend->>User: Hiển thị 4 kết quả ảnh
    User->>Frontend: Chọn ảnh
    Frontend->>Backend: Gửi yêu cầu in (POST /api/print)
    Backend->>Printer: Gửi ảnh để in
    Printer->>Backend: Trạng thái in
    Backend->>Frontend: Kết quả in
    Frontend->>User: Thông báo hoàn thành
    Frontend->>Frontend: Tự động reset sau 60s
```

## Các mẫu thiết kế chính

### 1. State Management Pattern
- Sử dụng React Context API để quản lý trạng thái ứng dụng toàn cục
- Reducer pattern để xử lý các hành động thay đổi trạng thái
- Tách biệt rõ ràng giữa UI và logic trạng thái

### 2. Service Pattern
- Backend sử dụng các service objects để gói gọn logic tương tác với các API bên ngoài
- `LeonardoService`: Xử lý giao tiếp với Leonardo.ai API
- `PrintService`: Xử lý tương tác với máy in

### 3. Session-based Processing
- Mỗi phiên sử dụng có một session_id duy nhất
- Các file tạm thời và kết quả được lưu trong thư mục phiên
- Cơ chế tự động dọn dẹp sau khi hoàn thành

### 4. Async Status Polling
- Sử dụng polling để kiểm tra trạng thái xử lý ảnh không đồng bộ từ Leonardo.ai
- Backend cung cấp endpoint để kiểm tra trạng thái

### 5. Microservice Architecture
- Sử dụng Docker và Docker Compose để triển khai các service riêng biệt
- Nginx làm reverse proxy cho frontend và backend
- Các container giao tiếp qua mạng nội bộ

## Các thành phần chính

### Frontend
- **WelcomeScreen**: Màn hình chào mừng, khởi đầu ứng dụng
- **CameraCapture**: Chụp ảnh từ webcam
- **PromptInput**: Nhập mô tả phong cách
- **GeneratingScreen**: Hiển thị trong quá trình tạo ảnh
- **ResultScreen**: Hiển thị và cho phép chọn kết quả
- **PrintingScreen**: Hiển thị trong quá trình in
- **CompleteScreen**: Thông báo hoàn thành

### Backend
- **GenerationRouter**: Xử lý các endpoint liên quan đến việc sinh ảnh
  - `/upload`: Upload ảnh ban đầu
  - `/generate`: Gửi yêu cầu sinh ảnh đến Leonardo
  - `/status/{session_id}`: Kiểm tra trạng thái xử lý
  - `/session/{session_id}`: Dọn dẹp dữ liệu phiên
- **PrintRouter**: Xử lý yêu cầu in ảnh
- **LeonardoService**: Tương tác với Leonardo.ai API
- **PrintService**: Tương tác với máy in
