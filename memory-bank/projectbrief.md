# PixelMind - AI Image Editor

## Project Overview
PixelMind là một ứng dụng web chỉnh sửa ảnh thông minh sử dụng Leonardo AI. Người dùng có thể chụp ảnh, nhập mô tả chỉnh sửa bằng tiếng Việt, và nhận về ảnh đã được AI xử lý.

## Core Requirements
- **Camera Integration**: Chụp ảnh trực tiếp từ webcam
- **AI Image Editing**: Sử dụng Leonardo AI PhotoReal v2 model
- **Vietnamese Support**: Hỗ trợ prompt tiếng Việt với translation
- **User-Friendly Interface**: Giao diện đơn giản, responsive
- **Real-time Processing**: Xử lý ảnh và hiển thị kết quả

## Key Features
1. **Chụp ảnh**: Camera integration với preview
2. **Prompt translation**: Dịch tiếng Việt sang tiếng Anh
3. **AI Processing**: Leonardo AI generation với fallback
4. **Result Display**: Before/after comparison
5. **Download**: Tải xuống ảnh kết quả

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: FastAPI (Python) - async support
- **AI Services**: 
  - Leonardo AI (PhotoReal v2)
  - Gemini (Translation)
- **File Handling**: aiofiles, multipart uploads

## Success Criteria
- Chụp ảnh thành công từ camera
- Dịch prompt tiếng Việt sang tiếng Anh
- Tạo ảnh chất lượng cao với Leonardo AI
- Hiển thị kết quả rõ ràng
- Tải xuống ảnh được
