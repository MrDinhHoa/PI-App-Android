# PROJECT HANDOFF - BÀN GIAO DỰ ÁN

* **Dự án:** PI App Android - Bé Học Vui (Ứng dụng giáo dục tương tác cho bé 5 tuổi trên tablet 10.9")
* **Thời gian cập nhật:** 20/11/2026
* **Trạng thái dự án:** Đã mở rộng hệ thống bài học lên **16 bài học** (8 Tiếng Việt + 8 Toán), hoàn thành trọn vẹn lộ trình Tiền Tiểu Học từ cơ bản đến nâng cao theo bản thiết kế `tientieuhoc.md`. Đã tích hợp Service Worker offline (`behocvui-v3`), workflow GitHub Actions build TWA APK, và bộ giọng đọc cô giáo mầm non (HoaiMy).

---

## 1. Tóm Tắt Trạng Thái Kỹ Thuật
* **Nền tảng:** Web / PWA (Progressive Web App) tối ưu cho Tablet Android 10.9 inch (tỉ lệ 16:10).
* **Môi trường phát triển:** Antigravity IDE / VS Code trên Windows (người dùng không có quyền Admin).
* **Trạng thái chạy thử:** Hoạt động tốt qua script `start-server.bat` (Python nội bộ `py.exe`), kiểm thử trực quan qua `simulator.html`.
* **Khả năng đóng gói APK:** Sẵn sàng qua GitHub Actions Bubblewrap (`.github/workflows/build-apk.yml`).

---

## 2. Nhật Ký Bàn Giao Theo Phiên

### Phiên ngày 20/11/2026 (Agent: Antigravity)
* **Bối cảnh:** Người dùng yêu cầu bổ sung các bài học Tiếng Việt và Toán nâng cao cho giai đoạn tiền tiểu học chuẩn bị vào lớp 1.
* **Đã làm:**
  1. **Bổ sung 3 bài Tiếng Việt nâng cao:**
     * `tv6` (Phụ âm ghép): Luyện nghe và nhận biết 11 phụ âm ghép phức tạp (`ch, gh, gi, kh, ng, ngh, nh, ph, qu, th, tr`) và tìm hình ảnh/từ ngữ tương ứng.
     * `tv7` (Quy tắc chính tả vàng): Ôn luyện quy tắc cốt lõi trước lớp 1: `k, gh, ngh` chỉ đi với `e, ê, i`; còn `c, g, ng` đi với các nguyên âm khác. Tương tác điền khuyết âm đầu kèm giọng nhắc bài sư phạm ấm áp.
     * `tv8` (Ghép từ có nghĩa): Nhìn hình minh họa và chọn tiếng còn thiếu để tạo từ ghép hoàn chỉnh (`con mèo`, `hoa sen`, `máy bay`, `quả táo`...).
  2. **Bổ sung 3 bài Toán nâng cao:**
     * `toan6` (Tách - Gộp số): Nền tảng tư duy phép tính; gộp 2 nhóm đồ vật thành tổng hoặc tách nhóm theo tình huống trực quan (ví dụ: có 5 chú vịt, 2 chú bơi đi, còn mấy chú?).
     * `toan7` (Phép cộng & trừ trong phạm vi 10): Phép tính cộng/trừ trực quan, hiển thị công thức lớn và các icon hình ảnh để bé vừa nhìn số vừa đếm kiểm tra.
     * `toan8` (Hình học & Quy luật tư duy): Nhận biết 5 hình khối cơ bản (hình tròn, vuông, tam giác, chữ nhật, ngôi sao) và giải các chuỗi quy luật logic mầm non (ABAB / AAB).
  3. **Tối ưu UI bản đồ bài học:**
     * Thanh lộ trình bài học hỗ trợ cuộn ngang mượt mà (`overflow-x: auto`), hiển thị đẹp mắt toàn bộ 8 bài học mỗi phân hệ mà không bị co méo.
     * Bổ sung styling cho các dạng bài mới: ô khuyết chính tả, ô ghép từ, thẻ phép tính trực quan, khung tách gộp số, thẻ hình học và ô chuỗi quy luật.
  4. **Nâng cấp Service Worker:** Cập nhật cache lên `behocvui-v3` để lập tức kích hoạt các bài học mới.
* **Kiểm thử:** Node.js syntax & execution validation pass 100% cho toàn bộ 16 bài học; các bài tập tạo đúng dữ liệu và renderer tương ứng.

### Phiên ngày 19/11/2026 (Agent: Claude Code)
* **Bối cảnh:** Người dùng đưa bản thiết kế `tientieuhoc.md` ("Vương Quốc Chữ & Số") và yêu cầu làm lần lượt 3 giai đoạn MVP.
* **Đã làm:**
  1. **Giai đoạn 1 – Âm vị & ghép vần:** tab 🅰️ Chữ Cái (3 nhóm màu, phát âm theo cách đánh vần mới, từ minh họa) và tab ⚙️ Ghép Vần (kéo thả, đọc chậm "Bờ… a… ba", 6 thanh, luật c/k-g/gh-ng/ngh). `audio.js` thêm `speakSequence()` và cơ chế dùng file thu âm `audio/phonemes/` nếu có.
  2. **Giai đoạn 2 – 10 bài học mẫu:** tab 📚 Bài Học (tab mặc định) gồm bản đồ bài, 5 bài Tiếng Việt (nguyên âm → đọc câu karaoke) và 5 bài Toán (đếm 1–10, nhận biết số, so sánh, dấu > < = với cá sấu SVG), chấm 1–3 sao, lưu tiến độ.
  3. **Giai đoạn 3 – Gamification:** ví ⭐/🔑 lưu localStorage, học xong bài +1 🔑; tab 🎮 Trò Chơi với game Bắn Bóng Chữ & Số (tốn 1 🔑, 2 phút/lượt, tạm dừng khi rời tab, lưu kỷ lục).
  4. Sửa lỗi layout có sẵn: `body` chỉ có `min-height` nên các tab bị dồn lên nửa trên màn hình.
  5. Theo yêu cầu người dùng, bỏ 4 tab tự do cũ: Động Vật, Đếm Số, Màu Sắc, Nối Hình (xóa HTML, JS, CSS). Header còn 6 tab: Bài Học, Trò Chơi, Chữ Cái, Ghép Vần, Đánh Vần, Làm Toán.

### Phiên ngày 18/11/2026 (Agent: Antigravity)
* **Bối cảnh & Thách thức:** Khởi tạo dự án Bé Học Vui (PWA), tích hợp khung giả lập Tablet 10.9", hoàn thiện 6 module ban đầu kèm hệ thống âm thanh Web Audio và lồng tiếng tiếng Việt.

---

## 3. Việc Cần Làm Tiếp Theo Cho Phiên Tới
1. **Kiểm thử trải nghiệm người dùng trên Tablet thật:**
   * Mở trên Tablet 10.9", kiểm tra âm lượng, độ nhạy chạm tay, vuốt ngang danh sách bài học và tương tác kéo thả.
2. **Tính năng phụ huynh (Parental Control):**
   * Cổng bảo vệ ba mẹ (phép nhân đơn giản).
   * Cài đặt giới hạn thời gian chơi/học mỗi ngày.
3. **Các Mini-game bổ sung:**
   * Phát triển thêm mini-game thứ 2: Giải cứu thú cưng (vượt sông bằng phiến đá chữ) hoặc Siêu thị của bé (kéo thả số lượng hàng hóa vào giỏ).
