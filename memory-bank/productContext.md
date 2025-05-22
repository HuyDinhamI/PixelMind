# Product Context - AI Photo Booth

## Vấn đề dự án giải quyết
AI Photo Booth giải quyết những vấn đề sau:
- Photo booth truyền thống chỉ cung cấp các bộ lọc và hiệu ứng có sẵn, hạn chế sáng tạo
- Người dùng muốn những hình ảnh độc đáo hơn thay vì những hiệu ứng thông thường
- Các công nghệ AI sinh ảnh thường yêu cầu kiến thức chuyên môn và thời gian thiết lập
- Cần một giải pháp dễ sử dụng, tự động hóa cho trải nghiệm AI tại các sự kiện

## Đối tượng người dùng
### Người tham dự sự kiện
- Quan tâm đến công nghệ và trải nghiệm mới
- Muốn có kỷ niệm độc đáo từ sự kiện
- Có thể không quen thuộc với AI và công nghệ sinh ảnh

### Nhà tổ chức sự kiện
- Muốn tạo trải nghiệm đặc biệt và thu hút cho khách tham dự
- Cần giải pháp đáng tin cậy, tự động với tối thiểu can thiệp
- Tìm kiếm các yếu tố khác biệt so với photo booth thông thường

## Trải nghiệm người dùng
### Luồng sử dụng chính
1. **Chào mừng**: Màn hình hiển thị slideshow các ví dụ về ảnh AI để thu hút và giới thiệu
2. **Chụp ảnh**: Giao diện đơn giản để người dùng chụp và xác nhận ảnh của họ
3. **Chọn phong cách**: Người dùng chọn hoặc nhập mô tả phong cách biến đổi mong muốn
4. **Chờ xử lý**: Hiển thị hoạt ảnh và thông báo trong lúc Leonardo.ai tạo ảnh
5. **Lựa chọn kết quả**: Người dùng xem và chọn 1 trong 4 kết quả được tạo
6. **In ảnh**: Ảnh được in ra và thông báo thành công hiển thị
7. **Kết thúc**: Tự động reset sau khi hoàn thành hoặc sau khoảng thời gian không hoạt động

### Các yếu tố cần quan tâm
- **Thời gian chờ**: Giảm thiểu cảm giác chờ đợi bằng hoạt ảnh và thông báo
- **Dễ hiểu**: Hướng dẫn rõ ràng tại mỗi bước
- **Tự động hóa**: Tự động reset để phục vụ người tiếp theo
- **Khả năng sửa lỗi**: Cho phép quay lại các bước trước nếu cần
- **Phản hồi trực quan**: Thông báo rõ ràng về trạng thái và kết quả

## Các tình huống sử dụng
1. **Sự kiện công ty**: Tạo kỷ niệm độc đáo tại các buổi tiệc, hội nghị
2. **Triển lãm công nghệ**: Giới thiệu khả năng của AI sinh ảnh
3. **Không gian giải trí**: Tại trung tâm thương mại, công viên giải trí
4. **Đám cưới và lễ kỷ niệm**: Thay thế cho photo booth truyền thống
5. **Các cửa hàng bán lẻ**: Tạo trải nghiệm khách hàng độc đáo

## Yếu tố khác biệt
- Kết hợp giữa trải nghiệm photo booth quen thuộc với công nghệ AI tiên tiến
- Biến đổi ảnh với vô số phong cách khác nhau thay vì các bộ lọc cố định
- Cho phép người dùng mô tả phong cách mong muốn bằng ngôn ngữ tự nhiên
- Trình diễn công nghệ AI một cách trực quan, dễ hiểu
- Tự động hóa toàn bộ quy trình chụp và biến đổi ảnh

## Những thách thức và giới hạn
- Thời gian xử lý của Leonardo.ai (20-30 giây cho mỗi lần tạo ảnh)
- Phụ thuộc vào kết nối internet ổn định
- Giới hạn về số lượng request API (cần kiểm soát quota)
- Xử lý bảo mật và quyền riêng tư cho ảnh người dùng
- Đảm bảo kết quả AI phù hợp và không có nội dung không mong muốn
