# Hướng Dẫn Kỹ Thuật - PI App Android (Bé Học Vui)

## 1. Mục Đích & Trạng Thái
* **Mục đích:** Ứng dụng giáo dục tương tác mầm non dành cho bé 5 tuổi (chuẩn bị vào lớp 1), tối ưu cho máy tính bảng Android màn hình 10.9 inch (tỉ lệ 16:10 xoay ngang).
* **Bản thiết kế sản phẩm:** `tientieuhoc.md` (ý tưởng "Vương Quốc Chữ & Số": 4 cấp độ Tiếng Việt, 4 nhóm Toán, 4 mini-game, tính năng phụ huynh, lộ trình MVP 3 giai đoạn).
* **Mô hình kiến trúc:** Web App / PWA (Progressive Web App) chạy bằng HTML5, CSS3 và Vanilla JavaScript.
* **Đặc điểm nổi bật:** 
  * Hoạt động 100% không yêu cầu quyền Administrator trên máy tính Windows phát triển.
  * Không phụ thuộc vào Android Studio hay máy ảo nặng.
  * Tích hợp sẵn bộ khung giả lập Tablet 10.9 inch để kiểm thử trực tiếp trên máy tính.
* **Trạng thái:** Đã hoàn thành **cả 3 giai đoạn MVP** trong `tientieuhoc.md` (Âm vị & ghép vần → 10 bài học mẫu → Sao/chìa khóa + mini-game Bắn bóng). Đã kiểm thử tự động bằng Chrome headless (chạy hết 10 bài, vòng lặp học → nhận chìa khóa → chơi → hết giờ) và kiểm tra bố cục qua ảnh chụp 1024×640. **Chưa kiểm thử trên tablet thật và chưa nghe thử giọng đọc thật** (khi test, giọng đọc được giả lập).

---

## 2. Cấu Trúc Dự Án
```text
PI App Android/
├── index.html          # Giao diện chính: 6 tab (Bài Học, Trò Chơi, Chữ Cái, Ghép Vần, Đánh Vần, Làm Toán)
├── simulator.html      # Khung giả lập Tablet 10.9 inch (zoom 60-100%, fullscreen)
├── start-server.bat    # Script khởi chạy máy chủ nội bộ Python và tự mở trình duyệt
├── manifest.json       # Cấu hình PWA (orientation: landscape, display: standalone)
├── tientieuhoc.md      # Bản thiết kế ý tưởng sản phẩm
├── audio/
│   └── phonemes/       # Chỗ đặt file thu âm âm vị thật (.mp3) + index.json + README.md (quy tắc đặt tên)
├── css/
│   └── style.css       # Định kiểu giao diện mầm non, nút bấm to, layout tablet
└── js/                 # Thứ tự nạp trong index.html: audio → wallet → app → phonics-data → phonics → lessons-data → lessons → minigame → minigame-more → math-lab
    ├── audio.js        # Âm thanh Web Audio + giọng đọc SpeechSynthesis; speakSequence() đọc chậm từng phần; ưu tiên file thu âm nếu có
    ├── wallet.js       # Ví sao ⭐ + chìa khóa 🔑, lưu localStorage (window.wallet)
    ├── app.js          # Điều hướng tab, các module cũ, confetti; xuất window.addStar / awardKey / spawnConfetti / goToTab
    ├── phonics-data.js # Dữ liệu âm vị: bảng chữ cái (sound/blend/word/emoji), luật c/k-g/gh-ng/ngh, 6 thanh, ~50 tiếng có nghĩa
    ├── phonics.js      # Bảng chữ cái + Cỗ máy ghép vần; window.phonicsUtil (analyzeSyllable, spellParts, applyTone...)
    ├── lessons-data.js # Nội dung 17 bài học: từ 2 tiếng (36), câu đơn (20), ghép từ (20), vần (18), đồ vật đếm, danh sách bài
    ├── lessons.js      # Bản đồ bài học + trình chạy bài (~20 dạng bài tập), chấm sao, lưu tiến độ
    ├── minigame.js     # Khu trò chơi + Bắn Bóng Chữ & Số + Lật Thẻ Trí Nhớ; màn kết quả chung; window.minigame.register() cho game khác
    ├── minigame-more.js # Giải Cứu Thú Cưng, Siêu Thị Của Bé, Tô Màu Kỳ Diệu (đăng ký qua window.minigame.register)
    └── math-lab.js     # Tab Làm Toán: Phòng Luyện Toán 6 dạng (window.mathLab)
```

---

## 3. Các Module Tính Năng Hiện Có
### Lộ trình 16 Bài Học Tiền Tiểu Học (theo `tientieuhoc.md`)
1. **📚 Bài Học (tab mặc định):** Bản đồ Tiếng Việt 9 bài + Toán 8 bài (tổng 17 bài), mở khóa lần lượt trong từng track; tiến độ lưu localStorage (`beHocVui.lessons.v1`).
   * **Tiếng Việt (9 bài):**
     * (1) Nguyên âm – nghe âm chọn chữ, có trộn chữ dễ nhầm;
     * (2) Phụ âm – nghe âm chọn chữ / chọn hình theo âm đầu;
     * (3) Ghép vần & dấu – nghe tiếng chọn đúng dấu, nhìn hình chọn chữ;
     * (4) Đọc từ – chạm từng tiếng để nghe đánh vần ("Mờ – eo – meo – huyền – mèo"), chọn hình;
     * (5) Đọc câu – karaoke highlight, bé chạm từng chữ trái → phải, chọn hình;
     * (6) Phụ âm ghép – nghe và nhận biết 11 phụ âm ghép (ch, th, ph, nh, kh, tr, ng, ngh, gi, qu);
     * (7) Luật chính tả – quy tắc cốt lõi: k, gh, ngh đi với e, ê, i; c, g, ng đi với các âm còn lại;
     * (8) Ghép từ – nhìn hình điền tiếng còn thiếu để tạo thành từ có nghĩa;
     * (9) Vần cơ bản – 18 vần (ai, ay, oi, ao, eo, am, âm, ăn, em, en, ên, im, in, oa, ong, ông, ua, ưa), mỗi vần có file thu âm `van-*.mp3`: nghe vần chọn vần, nghe vần chọn hình, nhìn hình chọn vần ghép với âm đầu. Phương án nhiễu lấy từ nhóm vần dễ nhầm (`rhymeConfusable`). Đặt ở cuối track để không làm khóa lại bài đã học của bé.
   * **Toán tư duy (8 bài):**
     * (1) Đếm 1–5 và (2) Đếm 6–10 – chạm đếm từng hình, đếm xong mới hiện thẻ số;
     * (3) Nhận biết số / chọn nhóm đúng số lượng;
     * (4) Nhiều hơn – ít hơn – bằng nhau;
     * (5) Dấu > < = với cá sấu (vẽ SVG, há miệng về phía nhiều hơn);
     * (6) Tách - Gộp số – trực quan hóa bản chất phép tính;
     * (7) Phép cộng & trừ trong phạm vi 10 – công thức trực quan kết hợp hình vẽ;
     * (8) Hình học & Quy luật – nhận biết 5 hình khối cơ bản và giải chuỗi logic ABAB / AAB.
   * Chấm sao cuối bài: sai ≤1 lần → 3⭐, ≤3 lần → 2⭐, còn lại 1⭐. Mỗi lần học xong bài (kể cả học lại) → +1 🔑.
2. **🎮 Trò Chơi:** Sảnh trò chơi; game **Lật Thẻ Trí Nhớ** (tốn 1 🔑, 120 giây, lượt lẻ ghép chữ ↔ hình có âm đầu đó, lượt chẵn ghép số ↔ nhóm đồ vật; lượt đầu 4 cặp, sau đó 6 cặp; không cho 2 chữ lồng nhau như c/ch cùng lượt; lưu kỷ lục `beHocVui.memoryBest.v1`); game **Bắn Bóng Chữ & Số** (tốn 1 🔑, 120 giây, đếm ngược 3-2-1, bóng mang chữ/số bay lên, loa đọc "Tìm chữ…/Tìm số…", trúng 3 bóng thì đổi mục tiêu xen kẽ chữ/số, tạm dừng khi rời tab, lưu kỷ lục `beHocVui.balloonBest.v1`); game **Giải Cứu Thú Cưng** (nhảy qua 4 cột đá, mỗi cột 3 phiến mang chữ/số, chọn đúng theo lời cô thì bé nhảy lên, sai thì đá chìm; qua sông thì cứu được 1 bạn thú; lượt xen kẽ chữ/số; kỷ lục `beHocVui.rescueBest.v1`); game **Siêu Thị Của Bé** (đơn "Mẹ nhờ mua", chạm hàng trên kệ để bỏ vào giỏ, chạm hàng trong giỏ để bỏ ra, bấm Thanh toán; cô nhắc thiếu/thừa/sai món; độ khó: 1 loại 1–5 → 1 loại 3–8 → 2 loại; kỷ lục `beHocVui.marketBest.v1`); game **Tô Màu Kỳ Diệu** (tô màu theo số, 5 bút màu đỏ/vàng/xanh lá/xanh dương/nâu, 5 tranh SVG: ngôi nhà, chú cá, bông hoa, ô tô, cây táo; tô sai số thì cô nhắc bút đúng; kỷ lục `beHocVui.paintBest.v1`). Cả 5 game đều 2 phút/lượt, tốn 1 🔑, tạm dừng khi rời tab. Chơi game không cộng sao.
3. **🅰️ Chữ Cái:** Bảng chữ cái 3 nhóm màu (nguyên âm đỏ 12, phụ âm xanh dương 17, phụ âm ghép xanh lá 11); chạm là phát âm theo cách đánh vần mới ("bờ", "cờ") rồi đọc từ minh họa; O/Ô/Ơ có hiệu ứng lăn; chữ nghe lần đầu +1⭐.
4. **⚙️ Ghép Vần:** Kéo thả (pointer events, hỗ trợ cả chạm) 24 phụ âm + 9 nguyên âm vào cỗ máy → "Bờ… a… ba!"; chọn 1 trong 6 thanh → "Bờ – a – ba – huyền – bà"; tiếng có nghĩa hiện hình + thưởng sao; dạy luật chính tả c/k, g/gh, ng/ngh (gợi ý chữ đúng).
5. **Sao & chìa khóa:** Header hiển thị ⭐ và 🔑, lưu localStorage (`beHocVui.wallet.v1`); chìa khóa nhận được có hiệu ứng bay lên header.

### Module tự do có từ bản prototype đầu
6. **🔤 Tập Đánh Vần:** Ghép chữ cái vào ô theo hình (Cá, Gà, Bò, Xe, Mèo, Chó, Táo, Hoa).
7. **➕ Làm Toán – Phòng Luyện Toán** (`math-lab.js`, luyện tự do, không tốn 🔑; đúng ngay lần đầu +1⭐; số câu đúng mỗi dạng lưu `beHocVui.mathLab.v1`, đúng 8 câu thì lên **Cấp 2**). 6 dạng chọn ở thanh trên cùng:
   * ➕ Cộng trừ – chạm đếm từng hình (hiện số thứ tự), phép trừ gạch ✕ các hình bị bớt, công thức `a ± b = ?`; cấp 1 phạm vi 5, cấp 2 phạm vi 10;
   * 🔢 Trước – sau – dãy 7 số có 1 ô trống, hỏi số liền trước / liền sau; cấp 1 đến 10, cấp 2 đến 20 (`vnNum()` đọc 11–20);
   * 📖 Lời văn – cô kể bài toán 3 câu (chim, cá, gà con, bướm, ếch, vịt), hình động con vật tới / đi theo câu chuyện, hiện công thức; cấp 1 ≤5, cấp 2 ≤10;
   * 📏 Dài – cao – 3 bút chì (dài nhất / ngắn nhất) hoặc 3 tháp khối (cao nhất / thấp nhất);
   * 🕐 Đồng hồ – giờ đúng (đồng hồ SVG): nhìn đồng hồ chọn giờ, hoặc nghe giờ chọn đồng hồ;
   * 🧭 Vị trí – 4 con vật quanh một đồ vật, hỏi bạn ở phía trên / phía dưới / bên trái / bên phải.

> Đã bỏ (19/11/2026, theo yêu cầu người dùng): Vườn Thú, Đếm Số & Nổ Bóng Bay, Sắc Màu, Nối Hình – xóa cả HTML, JS và CSS.

### Hằng số / quy ước quan trọng
* **Cách đọc âm** nằm trong `phonics-data.js`: `sound` (đọc khi chạm chữ) và `blend` (đọc khi ghép vần). Một số chữ đặt theo SGK hiện hành: k = "ca", q = "cu", gi = "di", gh/ngh = "gờ kép"/"ngờ kép" (ghép vần đọc "gờ"/"ngờ"). Cần đối chiếu với bộ sách bé học.
* **File thu âm:** `audio/phonemes/<key>.mp3` + liệt kê key trong `index.json`. Key: `am-<chữ Telex>` (đ→dd, ă→aw, â→aa, ê→ee, ô→oo, ơ→ow, ư→uw), `am-<chữ>-ghep`, `thanh-<huyen|sac|hoi|nga|nang>`, `van-<vần>`. Key chưa có file thì dùng giọng máy.
* **Game Giải Cứu / Siêu Thị / Tô Màu:** `RS_STEPS = 4`, `RS_STONES = 3`, `MK_PRODUCTS`, `MK_BASKET_MAX = 10`, `PT_COLORS`, `PT_PICTURES` (tranh viewBox 400×300, mỗi vùng `{tag, a, n, l}`; vùng không có `n` là trang trí) ở `minigame-more.js`.
* **Game Lật Thẻ:** `MM_SECONDS = 120`, `MM_PAIRS = [4, 6]`, `MM_LETTERS` (đầu `minigame.js`).
* **Game Bắn Bóng:** `GAME_SECONDS = 120`, `HITS_PER_TARGET = 3`, `MAX_BALLOONS = 7`, `SPAWN_EVERY = 0.85`s, `RISE_SECONDS = [5.5, 7.5]` (đầu `minigame.js`).
* **Bài Đọc từ** chỉ dùng từ không có vần kết thúc p/t/c/ch (cách đánh vần các vần này khác nhau giữa các bộ sách).

---

## 4. Cách Chạy & Kiểm Thử
* **Chạy bằng script:** Nhấp đúp vào `start-server.bat` hoặc gõ trong terminal:
  ```powershell
  cd "PI App Android"
  .\start-server.bat
  ```
* **Xem trực tiếp:**
  * Giả lập Tablet 10.9 inch: `http://localhost:8000/simulator.html`
  * Ứng dụng trực tiếp: `http://localhost:8000/index.html`
  * Trong Antigravity IDE: Mở `Simple Browser: Show` > nhập địa chỉ trên.
* **Kiểm thử tự động (cách đã dùng, không lưu file test trong repo):** tạo trang `_test.html` tạm nhúng `index.html` trong iframe, giả lập `speechSynthesis.speak` và `requestAnimationFrame` (Chrome headless không chạy rAF / animation CSS khi dùng virtual time), chạy `chrome.exe --headless=new --virtual-time-budget=... --dump-dom` hoặc `--screenshot`, xong thì xóa file test. Máy không có Node.js; dùng Python 3.14 (`python -m http.server`).
* **Xóa tiến độ để test lại từ đầu:** xóa localStorage của trang (các key `beHocVui.*`).

---

## 5. Vấn Đề Đã Biết & Lưu Ý
* **Giọng đọc tiếng Việt:** Dùng Web Speech API (`SpeechSynthesis`), chất lượng phụ thuộc gói giọng tiếng Việt trên thiết bị. Giọng máy đọc âm đơn lẻ ("bờ", "ơ", vần "eo") có thể chưa chuẩn → cần nghe thử trên tablet; hướng xử lý là thu âm thật vào `audio/phonemes/`.
* **Emoji khác nhau theo hệ điều hành:** không dùng hướng của emoji để truyền tải ý nghĩa (đã thay 🐊 trong bài dấu > < bằng SVG). Một số emoji mới (🪑 🪨 🪵 🪣 🫖) cần Android đời mới.
* **Cảm ứng trên Tablet:** Đã thiết lập `-webkit-tap-highlight-color: transparent`, `user-select: none`; ô kéo thả và sân bóng dùng `touch-action: none`.
* **Chìa khóa:** bấm 🏠 giữa lượt chơi thì kết thúc lượt, không hoàn lại chìa khóa. Học lại bài cũ vẫn được +1 🔑 (có thể cần siết lại).

---

## 6. Việc Cần Làm Tiếp Theo
- [ ] Kiểm thử trên tablet thật: giọng đọc âm vị, kéo thả bằng ngón tay, tốc độ bóng bay, kích thước chạm.
- [ ] Thu âm chuẩn bộ âm vị / thanh điệu / vần, đặt vào `audio/phonemes/` (xem README trong thư mục).
- [ ] Đối chiếu cách đọc k, q, gi, gh, ngh và cách đánh vần với bộ sách bé học (Cánh Diều / Kết nối tri thức).
- [ ] Tính năng phụ huynh: Cổng phụ huynh (phép nhân), giới hạn thời gian dùng/ngày, báo cáo âm/dạng toán bé hay nghe lại.
- [ ] Thêm file `sw.js` (Service Worker) để chạy offline hoàn toàn trên tablet.
- [ ] Đưa ứng dụng lên GitHub Pages / Vercel để cài thử nghiệm qua *Add to Home Screen*.

---

## 7. Nhật Ký Thay Đổi
- **21/11/2026:** Tab Làm Toán thay bằng Phòng Luyện Toán 6 dạng (`js/math-lab.js`), xóa module toán cũ trong `app.js` và CSS `.math-*`. Service Worker lên `behocvui-v6`.
- **21/11/2026:** Thêm 3 game Giải Cứu Thú Cưng, Siêu Thị Của Bé, Tô Màu Kỳ Diệu (`js/minigame-more.js`); sảnh trò chơi đủ 5 game. `minigame.js` thêm `register()` + màn kết quả chung `showResult()`; các màn hình trong tab Trò Chơi chuyển bằng `data-view`. Service Worker lên `behocvui-v5`.
- **21/11/2026:** Thêm bài Tiếng Việt 9 "Vần cơ bản" và game Lật Thẻ Trí Nhớ; bổ sung dữ liệu (Đọc từ 10→36, Đọc câu 6→20, Ghép từ 10→20, thêm 4 đồ vật đếm); sửa lời nhắc "gấu" (ớ → â) và thay câu ghép từ "bình nước" 🍶 (nhiều đáp án đúng) bằng "quả bóng". Service Worker lên `behocvui-v4`. Các câu đọc mới chưa có file giọng HoaiMy trong `audio/voice/` nên dùng giọng máy của thiết bị.
- **19/11/2026:** Bỏ 4 tab Động Vật, Đếm Số, Màu Sắc, Nối Hình (HTML/JS/CSS); header còn 6 tab nên phóng to lại tab và hiện lại tên "Bé Học Vui".
- **19/11/2026:** Hoàn thành 3 giai đoạn MVP theo `tientieuhoc.md`: (1) tab Chữ Cái + Cỗ máy ghép vần & 6 thanh, hỗ trợ file thu âm; (2) tab Bài Học với 10 bài mẫu (5 Tiếng Việt, 5 Toán), chấm sao, lưu tiến độ; (3) ví sao/chìa khóa lưu localStorage, Khu trò chơi + game Bắn Bóng Chữ & Số 2 phút/lượt. Sửa lỗi layout `body` không đủ chiều cao (các tab bị dồn lên nửa trên).
- **18/11/2026:** Khởi tạo dự án Bé Học Vui (PWA), tích hợp khung giả lập Tablet 10.9", hoàn thiện 6 module (Động vật, Đánh vần, Làm toán, Đếm số, Màu sắc, Nối hình) kèm hệ thống âm thanh Web Audio và lồng tiếng tiếng Việt.
