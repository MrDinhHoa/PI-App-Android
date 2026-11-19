# BẢN THIẾT KẾ Ý TƯỞNG ỨNG DỤNG: VƯƠNG QUỐC CHỮ & SỐ
**Đối tượng mục tiêu:** Trẻ em 5 tuổi (Giai đoạn Tiền Tiểu Học)  
**Mục tiêu cốt lõi:** Vừa chơi vừa học – Chuẩn hóa kỹ năng đánh vần tiếng Việt, làm quen toán tư duy và tạo động lực qua hệ thống Mini-game phần thưởng.

---

## 1. CONCEPT & TRIẾT LÝ SẢN PHẨM

* **Tên gợi ý:** *Vương Quốc Chữ & Số* (hoặc *Bé Vui Tiền Tiểu Học*).
* **Giao diện & Trải nghiệm (UI/UX):**
  * **Thiết kế thân thiện:** Tông màu tươi sáng, nhân vật hoạt hình đồng hành (ví dụ: Thỏ Ngọc, Gấu Nâu). Kích thước nút bấm lớn (tối thiểu `60x60px`) phù hợp với thao tác ngón tay của trẻ 5 tuổi.
  * **100% điều hướng bằng giọng nói và hình ảnh:** Trẻ 5 tuổi chưa biết đọc chữ nên mọi hướng dẫn, nút bấm đều phải có giọng đọc ấm áp (tùy chọn giọng miền Nam/Bắc) và biểu tượng trực quan.
  * **Vòng lặp "Học trước - Chơi sau" (Gamification Loop):** Bé hoàn thành 1 chặng học (khoảng 3–5 phút) $\rightarrow$ Nhận "Chìa khóa / Sao vàng" $\rightarrow$ Mở khóa 1 lượt chơi Mini-game (giới hạn 2–3 phút/lượt để bảo vệ mắt và giữ sự tập trung).

---

## 2. PHÂN HỆ 1: TẬP ĐÁNH VẦN & ĐỌC HIỂU (TRỌNG TÂM)

Lộ trình được chia làm 4 cấp độ từ dễ đến khó, bám sát chương trình lớp 1 hiện hành (Cánh Diều / Kết nối tri thức):

### Cấp độ 1: Bảng chữ cái & Âm vị chuẩn (Phonics tiếng Việt)
* **Tính năng "Chạm là phát âm":** Hiển thị bảng chữ cái chia rõ 2 nhóm màu phân biệt:
  * **Nguyên âm:** a, ă, â, e, ê, i, o, ô, ơ, u, ư, y.
  * **Phụ âm đơn:** b, c, d, đ, g, h, k, l, m, n, p, q, r, s, t, v, x.
  * **Phụ âm ghép:** ch, gh, gi, kh, ng, ngh, nh, ph, qu, th, tr.
* **Quy chuẩn phát âm (Cực kỳ quan trọng):** Khi bé bấm vào phụ âm, hệ thống phải phát âm theo **cách đánh vần chuẩn mới** (ví dụ: bấm *B* đọc là *"bờ"*, bấm *C* đọc là *"cờ"*, bấm *M* đọc là *"mờ"* — tuyệt đối không đọc tên chữ cái kiểu cũ như *"bê, xê, em-mờ"* vì sẽ làm bé không ghép vần được).
* **Hình ảnh liên tưởng:** Mỗi chữ cái gắn với một hình ảnh sinh động và hiệu ứng chuyển động (ví dụ: chữ **O** tròn như quả trứng gà lăn tròn, chữ **Ô** đội mũ...).

### Cấp độ 2: Cỗ máy Ghép Vần & Thanh Điệu (Blending)
* **Tương tác kéo - thả (Drag & Drop):** Bé kéo phụ âm (ví dụ: **B**) ghép với nguyên âm (ví dụ: **A**).
  * Hệ thống phát âm chậm từng bước: *"Bờ... A... Ba"* $\rightarrow$ Hai khối chữ ghép dính vào nhau kèm hiệu ứng pháo hoa và đọc trơn: *"Ba!"*.
* **Thử thách Thanh điệu (6 dấu thanh):** Sau khi ghép được tiếng không dấu (ví dụ: *"Ba"*), 5 biểu tượng dấu (huyền, sắc, hỏi, ngã, nặng) xuất hiện. Bé chạm vào dấu nào, chữ tự đội dấu đó và đọc lên (ví dụ chạm dấu sắc $\rightarrow$ *"Bờ - A - Ba - Sắc - Bá"*).

### Cấp độ 3: Đọc Từ Đơn & Hình Ảnh Sinh Động
* Hiển thị từ vựng quen thuộc (2–3 âm tiết): *Con mèo, Quả táo, Xe đạp, Bông hoa...*
* **Hỗ trợ đánh vần từng tiếng:** Bên dưới mỗi tiếng có nút loa nhỏ. Nếu bé quên, bấm vào chữ *"mèo"* hệ thống sẽ đánh vần lại chậm rãi: *"Mờ - eo - meo - huyền - mèo"*.
* **Phần thưởng trực quan:** Sau khi đọc đúng, hình ảnh minh họa sống động (con mèo thật hoặc hoạt hình) hiện ra kèm âm thanh thực tế (*"Meo meo"*).

### Cấp độ 4: Đọc Câu Đơn Giản
* Các câu ngắn từ 4–6 chữ có vần điệu dễ nhớ (Ví dụ: *"Bé đi nhà trẻ"*, *"Mẹ mua quả na"*, *"Chú gà gáy vang"*).
* **Tính năng Karaoke Highlight:** Khi hệ thống đọc mẫu hoặc khi bé chạm vào từng chữ, chữ đó sẽ phát sáng và nảy lên, giúp bé luyện thói quen đưa mắt đọc từ trái sang phải.

---

## 3. PHÂN HỆ 2: TOÁN TƯ DUY TIỀN TIỂU HỌC

Tham khảo cấu trúc các bộ sách chuẩn bị vào lớp 1 (*Hành trang vào lớp 1*, *Toán tư duy Finger Math*), chia thành 4 nhóm bài tập tương tác:

1. **Nhận biết số & Đếm số lượng (Phạm vi 1–10, mở rộng 1–20):**
   * Cho giỏ trái cây hoặc đàn thú, bé chạm đếm từng đối tượng (hệ thống đếm theo: *1, 2, 3...*) rồi chọn thẻ số tương ứng.
2. **So sánh Nhiều hơn - Ít hơn - Bằng nhau & Dấu ($>$, $<$, $=$):**
   * Sử dụng hình ảnh "Chú cá sấu há miệng ăn bên có nhiều đồ ăn hơn" để bé ghi nhớ trực quan chiều của dấu $>$ và $<$.
3. **Tách - Gộp số (Nền tảng của Cộng - Trừ):**
   * Bài toán tình huống trực quan: Có 5 chú vịt trên bờ, 2 chú nhảy xuống ao $\rightarrow$ Hỏi trên bờ còn mấy chú? Bé tương tác trực tiếp với nhân vật để hiểu bản chất phép tính thay vì học vẹt.
4. **Quy luật & Hình học cơ bản:**
   * Nhận biết hình tròn, vuông, tam giác, chữ nhật qua đồ vật quen thuộc trong nhà.
   * Tìm hình tiếp theo theo quy luật màu sắc/hình dạng (Ví dụ: *Xanh - Đỏ - Xanh - ?*).
   * Định hướng không gian: *Trên - Dưới, Trái - Phải, Trước - Sau*.

---

## 4. HỆ THỐNG MINI-GAME PHẦN THƯỞNG

Mini-game chỉ mở khóa khi bé hoàn thành bài học, đóng vai trò giải trí và ôn luyện phản xạ:

| Tên Mini-Game | Cơ chế chơi | Mục tiêu củng cố kiến thức |
| :--- | :--- | :--- |
| **1. Bắn Bóng Chữ / Số** | Bong bóng bay từ dưới lên mang các chữ cái hoặc con số. Loa đọc *"Tìm chữ Ă"* hoặc *"Tìm số 7"*, bé chạm làm vỡ bóng. | Luyện phản xạ nhận diện mặt chữ và mặt số nhanh. |
| **2. Giải Cứu Thú Cưng** | Một chú gấu bị kẹt bên kia sông, các phiến đá trên sông có ghi các từ đơn (ví dụ: *cá, gà, vịt*). Bé phải bấm đúng phiến đá theo lời đọc để tạo cầu cho gấu qua sông. | Luyện đọc trơn từ đơn trong ngữ cảnh trò chơi hào hứng. |
| **3. Siêu Thị Của Bé** | Nhân vật hoạt hình đến mua hàng với giỏ hàng yêu cầu số lượng (ví dụ: *3 quả cam, 2 hộp sữa*). Bé kéo đúng số lượng hàng bỏ vào giỏ. | Ôn tập kỹ năng đếm và gộp số lượng. |
| **4. Tô Màu Kỳ Diệu** | Hoàn thành bài học nhận được "Cọ màu". Bé tô màu cho bức tranh con vật/đồ vật vừa học ở phần Đọc từ. | Phát triển thẩm mỹ, thư giãn mắt sau phần nhìn chữ/số. |

---

## 5. TÍNH NĂNG DÀNH CHO PHỤ HUYNH (PARENTAL CONTROL)

* **Giới hạn thời gian (Screen-time Lock):** Ba mẹ cài đặt thời gian học mỗi ngày (mặc định 20 phút/ngày). Hết giờ, nhân vật trong app sẽ ngáp ngủ và hẹn bé ngày mai quay lại.
* **Báo cáo tiến độ thông minh:** Thống kê những chữ cái, dấu thanh hoặc dạng toán nào bé hay bấm nghe lại nhiều lần để app tự động tăng tần suất ôn tập ở các buổi sau.
* **Cổng phụ huynh (Parental Gate):** Yêu cầu giải một phép toán nhân đơn giản (ví dụ: $7 \times 8 = ?$) trước khi truy cập vào phần cài đặt hoặc thanh toán.

---

## 6. LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM THỬ NGHIỆM (MVP)

Để tối ưu chi phí và kiểm thử phản ứng thực tế của trẻ 5 tuổi, giai đoạn đầu nên tập trung vào các hạng mục cốt lõi:
1. **Giai đoạn 1 (Core Audio & Phonics):** Thu âm chuẩn bộ âm vị tiếng Việt (nguyên âm, phụ âm, thanh điệu) và hoàn thiện tính năng *Bảng chữ cái* + *Cỗ máy ghép vần*.
2. **Giai đoạn 2 (Nội dung mẫu):** Xây dựng 10 bài học đầu tiên (5 bài Tiếng Việt từ chữ cái đến câu đơn + 5 bài Toán đếm/so sánh).
3. **Giai đoạn 3 (Gamification):** Tích hợp hệ thống sao thưởng và 01 Mini-game hoàn chỉnh (*Bắn bóng chữ/số*).