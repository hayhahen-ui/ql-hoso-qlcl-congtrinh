# Báo cáo Audit Tổng thể & Nâng cấp Kaizen V3

## 1. Tóm tắt Audit kiến trúc cũ (Excel/VBA & Prototype tĩnh)
1. **Rủi ro mất/lệch số biên bản:** Bản Excel cũ đánh số bằng hàm `RANK()` sống trên cột ngày nên khi chèn/sửa ngày, số biên bản đã phát hành bị thay đổi dây chuyền.
2. **Tự động kết luận sai quy định:** Bản nguyên mẫu tự trả `Đạt` ngay cả khi thiếu dung sai hoặc quy tắc chưa duyệt; dùng `RANDBETWEEN` sinh giờ nghiệm thu không tái lập được.
3. **Lỗi trình tự thời gian & liên kết dữ liệu:** Một số mẫu đối chiếu trước đây phát hiện ngày trả kết quả thí nghiệm trước ngày lấy mẫu, tuổi mẫu R28 chỉ cách 13 ngày, hoặc gắn nhầm loại mẫu vật liệu.
4. **Thiếu luồng hướng dẫn trực quan:** Kỹ sư hiện trường/nội nghiệp khó hình dung thứ tự nhập liệu xuyên suốt giữa 13 bảng dữ liệu và 30 biểu mẫu đầu ra.
5. **Chưa tách biệt Tenant Demo và Dự án thật:** Thiếu cơ chế cách ly mã `DEMO-*` và thiếu quy trình preview/xác nhận 2 bước khi làm mới dữ liệu.

## 2. Các hạng mục Kaizen V3 đã hiện thực hóa trong hệ thống Web
- **Tab Sơ đồ Mindmap Luồng Nhập Liệu:** Sơ đồ tương tác 10 bước qua 5 giai đoạn (`Khởi tạo → Chuẩn bị → Thi công → Nghiệm thu → Hoàn công & Xuất`), hiển thị % hoàn tất thực tế, tài liệu đầu vào/đầu ra và nút nhảy thẳng tới từng màn hình nhập liệu.
- **Sổ cấp số bất biến (`number_sequence`):** Cấp số duy nhất theo `(project_code, doc_type, year)` và đóng băng Snapshot; thu hồi (`void`) vẫn giữ nguyên số lịch sử.
- **Kiểm soát SLA 24 giờ (NĐ 207/2026 Điều 22 khoản 3):** Tính thời gian phản hồi từ giờ nhận Phiếu yêu cầu nghiệm thu đến giờ kiểm tra theo múi giờ `Asia/Ho_Chi_Minh`.
- **Rule Engine KTHH an toàn:** Chỉ đánh giá Đạt/Vượt khi đủ Đơn vị + Dung sai + Quy tắc được phê duyệt; thiếu điều kiện mặc định `Chưa đánh giá`.
- **Quản lý 42 đầu mục Hồ sơ (31 mục Phụ lục VII + 11 mục Phụ lục X):** Trạng thái áp dụng 3 chiều (`Áp dụng` / `Không áp dụng` / `Chưa xác định`) và phân loại bản gốc/bản sao điện tử theo Điều 28(4).
- **Trung tâm 30 Biểu mẫu A4 & 13 File XLSX:** Liên kết dữ liệu động, gắn watermark cố định khi ở chế độ Demo, chống Formula Injection khi xuất Excel, và Import 2 pha `Dry-Run Preview → Commit`.
- **Cách ly Tenant & Bảo mật danh tính:** Toàn bộ dữ liệu Demo sử dụng danh tính giả định, tách biệt hoàn toàn với Tenant Dự án thật mới.
