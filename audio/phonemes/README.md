# Thư mục thu âm âm vị (Giai đoạn 1)

Mặc định app dùng giọng đọc tổng hợp (Web Speech API). Khi có file thu âm chuẩn, chỉ cần:

1. Đặt file `.mp3` vào thư mục này, đặt tên theo bảng dưới.
2. Thêm tên file (không có `.mp3`) vào `index.json`, ví dụ: `["am-b", "am-a", "thanh-sac"]`.

Âm nào có trong `index.json` sẽ phát file thu âm; âm chưa có vẫn dùng giọng máy.

## Quy tắc đặt tên

- Âm vị: `am-<chữ>.mp3`. Chữ có dấu phụ viết kiểu Telex: `đ→dd`, `ă→aw`, `â→aa`, `ê→ee`, `ô→oo`, `ơ→ow`, `ư→uw`.
  Ví dụ: `am-b.mp3` ("bờ"), `am-dd.mp3` ("đờ"), `am-ee.mp3` ("ê"), `am-ngh.mp3` ("ngờ kép").
- Âm dùng khi ghép vần mà đọc khác khi đứng riêng: thêm `-ghep`.
  Hiện có: `am-gh-ghep.mp3` ("gờ"), `am-ngh-ghep.mp3` ("ngờ"), `am-k-ghep.mp3` ("ca").
- Thanh điệu: `thanh-huyen.mp3`, `thanh-sac.mp3`, `thanh-hoi.mp3`, `thanh-nga.mp3`, `thanh-nang.mp3`.

## Danh sách đầy đủ

| Nhóm | File |
| :--- | :--- |
| Nguyên âm | am-a, am-aw, am-aa, am-e, am-ee, am-i, am-o, am-oo, am-ow, am-u, am-uw, am-y |
| Phụ âm | am-b, am-c, am-d, am-dd, am-g, am-h, am-k, am-l, am-m, am-n, am-p, am-q, am-r, am-s, am-t, am-v, am-x |
| Phụ âm ghép | am-ch, am-gh, am-gi, am-kh, am-ng, am-ngh, am-nh, am-ph, am-qu, am-th, am-tr |
| Khi ghép vần | am-gh-ghep, am-ngh-ghep, am-k-ghep |
| Thanh điệu | thanh-huyen, thanh-sac, thanh-hoi, thanh-nga, thanh-nang |

Cách đọc từng âm (nội dung cần thu) xem cột `sound` / `blend` trong `js/phonics-data.js`.
