# QLCL Pro — Hệ thống Quản lý Chất lượng & Hồ sơ Nghiệm thu Công trình (Kaizen V3)

Ứng dụng web thương mại B2B dành cho **Nhà thầu thi công xây dựng**, chuyển đổi và nâng cấp toàn diện từ quy trình hồ sơ Excel/VBA truyền thống sang nền tảng web trực tuyến tuân thủ **Nghị định 207/2026/NĐ-CP** và **Thông tư 32/2026/TT-BXD**.

## Điểm nổi bật (Kaizen V3)

1. **Tab Sơ đồ Mindmap Luồng Nhập Liệu Tương tác (`Sơ đồ Mindmap`):**
   - Trực quan hóa toàn bộ 10 bước nhập liệu từ đầu đến cuối qua 5 giai đoạn (`Khởi tạo → Chuẩn bị → Thi công → Nghiệm thu → Hoàn công & Xuất`).
   - Hiển thị trạng thái hoàn thiện thực tế từng nút, danh sách trường bắt buộc, phụ thuộc đầu vào/đầu ra, file Excel tương ứng và nút nhảy thẳng tới từng màn hình thao tác.
2. **Tuân thủ chặt chẽ NĐ 207/2026/NĐ-CP & TT 32/2026/TT-BXD:**
   - **Điều 14(6):** Quản lý lô vật liệu, CO/CQ/Hợp quy và kiểm soát nghiệm thu đầu vào trước khi đưa vào sử dụng.
   - **Điều 15(3) & TT 32 Điều 2:** Kế hoạch thí nghiệm trình CĐT chấp thuận; kiểm chứng tuổi mẫu R3/R7/R28 và phát hiện xung đột loại vật liệu – phép thử.
   - **Điều 22(3):** Theo dõi **SLA 24 giờ** từ thời điểm nhận Phiếu yêu cầu nghiệm thu đến khi kiểm tra.
   - **Sổ cấp số bất biến:** Cấp số biên bản trong giao dịch, khóa Snapshot nội dung khi phát hành; thu hồi (Void) không tái sử dụng lại số.
   - **Phụ lục IIa & IIb:** Nhật ký thi công/thời tiết (cảnh báo mưa ≥ 10mm cần kỹ sư xác nhận thủ công) và Sổ bản vẽ hoàn công kiểm soát hạng mục che khuất.
   - **Điều 28, 30 & Phụ lục VII, X:** Đầy đủ **42 đầu mục** (31 mục PL VII + 11 mục PL X) với trạng thái áp dụng 3 chiều và quản lý bản gốc/bản sao điện tử.
   - **Điều 52–53:** Hồ sơ pháp lý chuyển tiếp & xác định diện kiểm tra cơ quan chuyên môn.
3. **Trung tâm 30 Biểu mẫu In A4 / PDF & Xuất/Nhập 13 File Excel:**
   - Render trực tiếp **30 biểu mẫu A4** liên kết động với dữ liệu đang làm việc, tự động gắn watermark `DEMO — GIẢ LẬP` khi ở chế độ Demo.
   - Xuất **13 file Excel hợp đồng chuẩn** (bản có dữ liệu hoặc mẫu trắng) + File trộn thư Word (`ListCVXD(ToWord)` / `ListHTHM(ToWord)`), bảo vệ chống Formula Injection.
   - Nhập `.xlsx` an toàn theo **2 pha Dry-Run Preview → Commit**.
4. **Cách ly Tenant Demo & Dự án Thật (Zero Real Names):**
   - Toàn bộ dữ liệu demo được chuẩn hóa giả định, không sử dụng tên công ty/cá nhân/địa danh thật.
   - Cho phép khởi tạo **Tenant Dự án Thật sạch 100%** tách biệt hoàn toàn với dữ liệu `DEMO-*`.

## Cài đặt & Chạy thử nghiệm

```bash
npm install
npm test        # Chạy kiểm thử đơn vị quy tắc nghiệp vụ & pháp lý (Vitest)
npm run build   # Kiểm tra biên dịch production Next.js
npm run dev     # Chạy máy chủ phát triển tại http://localhost:3000
```

## Cấu trúc thư mục

```text
src/
├── app/                 # Next.js App Router (page.tsx, layout.tsx, api/health)
├── components/          # MindmapTab, FormPreviewTab, ModulesTabs, QlclApp
├── data/                # demo-seed.ts (100% giả định), mindmap-flow.ts, forms-catalog.ts
├── lib/                 # domain-rules.ts, excel-service.ts, __tests__/domain-rules.test.ts
└── types/               # qlcl.ts (Định nghĩa kiểu dữ liệu chuẩn hóa)
```

> **Lưu ý pháp lý:** Hệ thống là công cụ kỹ thuật hỗ trợ lập và quản lý hồ sơ QLCL. Các kết luận nghiệm thu, tiêu chuẩn áp dụng và diện kiểm tra nhà nước phải được Chủ đầu tư, Tư vấn giám sát và chuyên gia có thẩm quyền xác nhận theo hồ sơ thực tế của từng công trình.
