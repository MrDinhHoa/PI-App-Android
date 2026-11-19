# HƯỚNG DẪN DÀNH CHO AI AGENT (AGENTS.md)

Tài liệu này cung cấp ngữ cảnh, quy ước và vai trò cho các trợ lý AI (Claude Code, Antigravity) khi làm việc trong dự án **PI App Android**.

---

## 1. Hệ Thống Tài Liệu Dự Án
Dự án sử dụng bộ 3 file tài liệu chuẩn:
* **`AGENTS.md` (File này):** Quy định chung, quy ước code và hướng dẫn vận hành cho Agent.
* **`PROJECT_HANDOFF.md`:** Nhật ký bàn giao công việc giữa các phiên làm việc, lưu lại những việc đã làm và việc cần làm tiếp theo.
* **`CLAUDE.md`:** Tài liệu kỹ thuật chi tiết của dự án (cấu trúc file, cách chạy, module tính năng, vấn đề đã biết).

> **Quy tắc quan trọng:** Cuối mỗi phiên làm việc, Agent cần cập nhật `PROJECT_HANDOFF.md` và `CLAUDE.md` thông qua lệnh `/ket-thuc-phien`.

---

## 2. Ràng Buộc & Môi Trường Làm Việc
1. **Không có quyền Administrator:**
   * Tuyệt đối không yêu cầu người dùng hoặc cố gắng chạy lệnh cài đặt phần mềm yêu cầu quyền Admin (như Android Studio, Hyper-V, driver hệ thống).
   * Mọi công cụ phải là **Portable** hoặc dựa trên công nghệ Web chuẩn (HTML5/CSS/JS) chạy qua máy chủ Python có sẵn trên máy (`python` trong `PATH`).
2. **Quy ước thiết kế cho trẻ 5 tuổi (Tablet 10.9 inch):**
   * **Giao diện xoay ngang (Landscape):** Tối ưu cho màn hình tablet lớn, không thiết kế giao diện dạng dọc của điện thoại.
   * **Nút bấm lớn & Thân thiện:** Kích thước nút tối thiểu 64px - 90px, bo góc mềm mại, màu sắc tươi sáng, tương phản tốt.
   * **Âm thanh & Phản hồi tức thì:** Mọi hành động tương tác phải có âm thanh hoặc hiệu ứng hình ảnh (tiếng kêu, nổ pháo hoa, nhún nhảy).
   * **Tự chủ tài nguyên (Self-contained):** Ưu tiên Web Audio API và Emoji/CSS Vector để tránh lỗi thiếu file media hoặc phụ thuộc vào đường truyền mạng ngoài.

---

## 3. Lệnh Khởi Chạy Dự Án
* Chạy máy chủ xem trước nội bộ:
  ```powershell
  cd "PI App Android"
  .\start-server.bat
  ```
* Địa chỉ truy cập:
  * Giả lập Tablet 10.9": `http://localhost:8000/simulator.html`
  * Ứng dụng gốc: `http://localhost:8000/index.html`
