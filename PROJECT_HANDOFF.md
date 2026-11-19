# PROJECT HANDOFF - BÀN GIAO DỰ ÁN

* **Dự án:** PI App Android - Bé Học Vui (Ứng dụng giáo dục tương tác cho bé 5 tuổi trên tablet 10.9")
* **Thời gian cập nhật:** 19/11/2026
* **Trạng thái dự án:** Đã hoàn thành 3 giai đoạn MVP theo bản thiết kế `tientieuhoc.md`. Đã kiểm thử tự động bằng Chrome headless; chưa kiểm thử trên tablet thật.

---

## 1. Tóm Tắt Trạng Thái Kỹ Thuật
* **Nền tảng:** Web / PWA (Progressive Web App) tối ưu cho Tablet Android 10.9 inch (tỉ lệ 16:10).
* **Môi trường phát triển:** Antigravity IDE / VS Code trên Windows (người dùng không có quyền Admin).
* **Trạng thái chạy thử:** Hoạt động tốt qua script `start-server.bat` (Python 3.14 nội bộ), kiểm thử trực quan qua `simulator.html`.

---

## 2. Nhật Ký Bàn Giao Theo Phiên

### Phiên ngày 19/11/2026 (Agent: Claude Code)
* **Bối cảnh:** Người dùng đưa bản thiết kế `tientieuhoc.md` ("Vương Quốc Chữ & Số") và yêu cầu làm lần lượt 3 giai đoạn MVP.
* **Đã làm:**
  1. **Giai đoạn 1 – Âm vị & ghép vần:** tab 🅰️ Chữ Cái (3 nhóm màu, phát âm theo cách đánh vần mới, từ minh họa) và tab ⚙️ Ghép Vần (kéo thả, đọc chậm "Bờ… a… ba", 6 thanh, luật c/k-g/gh-ng/ngh). `audio.js` thêm `speakSequence()` và cơ chế dùng file thu âm `audio/phonemes/` nếu có.
  2. **Giai đoạn 2 – 10 bài học mẫu:** tab 📚 Bài Học (tab mặc định) gồm bản đồ bài, 5 bài Tiếng Việt (nguyên âm → đọc câu karaoke) và 5 bài Toán (đếm 1–10, nhận biết số, so sánh, dấu > < = với cá sấu SVG), chấm 1–3 sao, lưu tiến độ.
  3. **Giai đoạn 3 – Gamification:** ví ⭐/🔑 lưu localStorage, học xong bài +1 🔑; tab 🎮 Trò Chơi với game Bắn Bóng Chữ & Số (tốn 1 🔑, 2 phút/lượt, tạm dừng khi rời tab, lưu kỷ lục).
  4. Sửa lỗi layout có sẵn: `body` chỉ có `min-height` nên các tab bị dồn lên nửa trên màn hình.
  5. Theo yêu cầu người dùng, bỏ 4 tab tự do cũ: Động Vật, Đếm Số, Màu Sắc, Nối Hình (xóa HTML, JS, CSS). Header còn 6 tab: Bài Học, Trò Chơi, Chữ Cái, Ghép Vần, Đánh Vần, Làm Toán; tab được phóng to lại, hiện lại tên "Bé Học Vui". Đã chạy thử tự động: 6 tab mở đúng, không lỗi JS.
* **Kiểm thử:** Chrome headless chạy hết 10 bài và vòng lặp học → chìa khóa → chơi → hết giờ, tất cả PASS; đã xem ảnh chụp 1024×640 từng màn. Giọng đọc được giả lập khi test → **chưa nghe giọng thật, chưa thử trên tablet thật**.
* **Chi tiết:** xem `CLAUDE.md` (cấu trúc file mới, hằng số, quy ước tên file thu âm, vấn đề đã biết).

### Phiên ngày 18/11/2026 (Agent: Antigravity)
* **Bối cảnh & Thách thức:** Người dùng muốn build app cho bé 5 tuổi trên tablet 10.9", vướng quyền Admin máy tính nên không thể cài đặt Android Studio hay các phần mềm giả lập nặng.
* **Giải pháp đề xuất & triển khai:**
  1. Chọn hướng kiến trúc Web App / PWA: Nhẹ, không cần Admin, xem trước ngay trong IDE và đưa lên tablet thành app độc lập chỉ bằng 1 thao tác.
  2. Xây dựng trang giả lập Tablet 10.9 inch (`simulator.html`) có sẵn khung viền, tỉ lệ chuẩn, chỉnh zoom và chế độ toàn màn hình để test ngay trên PC.
  3. Hoàn thành 6 module giáo dục mầm non:
     * 🦁 *Vườn thú:* Chạm con vật nhún nhảy, phát tiếng kêu.
     * 🔤 *Tập đánh vần:* Ghép chữ theo tranh, đánh vần từng âm tiết chuẩn tiếng Việt.
     * ➕ *Làm toán:* Phép cộng/trừ trực quan bằng trái cây, chạm đếm từng quả, giọng đọc đề bài.
     * 🔢 *Đếm số & Nổ bóng bay:* Bấm nổ bóng bay 1 đến 5.
     * 🎨 *Màu sắc:* Khám phá 6 màu sắc quen thuộc.
     * 🧩 *Nối bóng (Puzzle):* Ghép đồ vật với bóng đen.
  4. Tạo module âm thanh `audio.js` dùng Web Audio API và Web Speech API (hoạt động offline, không cần tải file ngoài).
  5. Cập nhật `start-server.bat` tự động điều hướng đúng thư mục và mở trình duyệt.

---

## 3. Việc Cần Làm Tiếp Theo Cho Phiên Tới
1. **Thử nghiệm trên Tablet thật:**
   * Tải code lên GitHub hoặc mở cổng mạng nội bộ Wi-Fi để mở trên Tablet thật, *Add to Home screen*.
   * Kiểm tra giọng đọc âm vị, kéo thả bằng ngón tay, tốc độ bóng bay, kích thước vùng chạm.
2. **Âm thanh chuẩn:** Thu âm bộ âm vị / thanh / vần vào `audio/phonemes/`; đối chiếu cách đọc k, q, gi, gh, ngh với bộ sách bé học.
3. **Tính năng phụ huynh:** Cổng phụ huynh, giới hạn thời gian dùng/ngày, báo cáo tiến độ.
4. **Mini-game còn lại:** Giải cứu thú cưng, Siêu thị của bé, Tô màu kỳ diệu.
5. **Offline Mode:** Viết file `sw.js` (Service Worker) để chạy offline hoàn toàn.
