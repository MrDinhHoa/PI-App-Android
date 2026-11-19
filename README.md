# Bé Học Vui (`PI-App-Android`)

Ứng dụng giáo dục tương tác (PWA) vừa học vừa chơi cho bé 5 tuổi (chuẩn bị vào lớp 1), thiết kế tối ưu cho màn hình **Tablet Android 10.9 inch xoay ngang**.

## Truy cập trực tuyến (GitHub Pages)
* Sau khi bật GitHub Pages cho nhánh `main`:
  * Ứng dụng chính: `https://mrdinhhoa.github.io/PI-App-Android/`
  * Khung giả lập Tablet 10.9" trên máy tính: `https://mrdinhhoa.github.io/PI-App-Android/simulator.html`

## 6 Tính năng hiện có
1. **📚 Bài Học:** Bản đồ 10 bài học mẫu (5 bài Tiếng Việt từ nhận biết âm đến đọc câu karaoke; 5 bài Toán từ đếm 1–10 đến so sánh `> < =` với cá sấu SVG), chấm 1–3 sao, lưu tiến độ.
2. **🎮 Trò Chơi:** Ví sao ⭐ & chìa khóa 🔑, cùng mini-game **Bắn Bóng Chữ & Số** (2 phút/lượt, lưu điểm kỷ lục).
3. **🅰️ Chữ Cái:** Bảng chữ cái 3 nhóm màu, phát âm theo cách đánh vần mới kèm từ minh họa.
4. **⚙️ Ghép Vần:** Cỗ máy kéo thả phụ âm + nguyên âm + 6 thanh điệu, hỗ trợ luật chính tả `c/k`, `g/gh`, `ng/ngh`.
5. **🔤 Đánh Vần:** Ghép chữ cái vào ô theo tranh minh họa và đánh vần từng âm tiết.
6. **➕ Làm Toán:** Phép cộng/trừ trực quan qua hoa quả, chạm đếm từng hình và giọng đọc câu hỏi tiếng Việt.

## Chạy thử trên máy tính (Không cần quyền Admin)
Chạy script khởi động máy chủ nội bộ Python:
```powershell
.\start-server.bat
```
Sau đó mở:
* Khung giả lập Tablet 10.9": `http://localhost:8000/simulator.html`
* Ứng dụng trực tiếp: `http://localhost:8000/index.html`

## Cài đặt lên Tablet Android 10.9 inch (PWA)
1. Mở liên kết GitHub Pages bằng trình duyệt **Chrome** trên máy tính bảng.
2. Mở menu trình duyệt (`⋮`) → chọn **Cài đặt ứng dụng** hoặc **Thêm vào màn hình chính**.
3. Mở biểu tượng **Bé Học Vui** từ màn hình chính để chạy toàn màn hình xoay ngang.
