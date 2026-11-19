// Nội dung 10 bài học mẫu (Giai đoạn 2). Sửa / thêm nội dung ở đây, không cần đụng vào lessons.js.
window.LESSONS_DATA = {
  // Bài 4 - Đọc từ: từ 2 tiếng (tránh vần có âm cuối p, t, c, ch để đánh vần đơn giản)
  words: [
    { text: 'con mèo', emoji: '🐱', sound: 'Meo meo!' },
    { text: 'con gà', emoji: '🐔', sound: 'Ò ó o!' },
    { text: 'con chó', emoji: '🐶', sound: 'Gâu gâu!' },
    { text: 'con bò', emoji: '🐄', sound: 'Bò ơ bò!' },
    { text: 'con dê', emoji: '🐐', sound: 'Be be!' },
    { text: 'con voi', emoji: '🐘', sound: 'Chú voi to quá!' },
    { text: 'quả táo', emoji: '🍎', sound: 'Quả táo đỏ, ngon quá!' },
    { text: 'bông hoa', emoji: '🌸', sound: 'Hoa thơm quá!' },
    { text: 'cái ô', emoji: '☂️', sound: 'Cái ô che mưa!' },
    { text: 'lá cờ', emoji: '🚩', sound: 'Lá cờ bay phấp phới!' }
  ],

  // Bài 5 - Đọc câu: 4–6 chữ, kèm hình minh họa để bé chọn
  sentences: [
    { text: 'Bé đi nhà trẻ', emoji: '👧🏫' },
    { text: 'Mẹ mua quả cam', emoji: '👩🍊' },
    { text: 'Chú gà gáy vang', emoji: '🐓🌅' },
    { text: 'Con bò ăn cỏ', emoji: '🐄🌿' },
    { text: 'Bà bế em bé', emoji: '👵👶' },
    { text: 'Con mèo trèo cây', emoji: '🐱🌳' }
  ],

  // Toán: đồ vật để đếm
  counters: [
    { emoji: '🍎', name: 'quả táo' },
    { emoji: '🍓', name: 'quả dâu' },
    { emoji: '🦆', name: 'chú vịt' },
    { emoji: '🐟', name: 'con cá' },
    { emoji: '🎈', name: 'quả bóng' },
    { emoji: '⭐', name: 'ngôi sao' },
    { emoji: '🐞', name: 'con bọ rùa' },
    { emoji: '🍊', name: 'quả cam' },
    { emoji: '🚗', name: 'chiếc xe' },
    { emoji: '🌸', name: 'bông hoa' }
  ],

  numberWords: ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'],

  praises: ['Đúng rồi!', 'Giỏi quá!', 'Tuyệt vời!', 'Bé giỏi lắm!', 'Hoan hô!'],

  // Danh sách bài học: track "tv" (Tiếng Việt) và "toan" (Toán). Mở khóa lần lượt trong từng track.
  lessons: [
    { id: 'tv1', track: 'tv', icon: '🅰️', title: 'Nguyên âm', intro: 'Bài một. Nguyên âm. Bé nghe và tìm đúng chữ nhé!' },
    { id: 'tv2', track: 'tv', icon: '🐄', title: 'Phụ âm', intro: 'Bài hai. Phụ âm. Bé nghe âm và tìm chữ, tìm hình nhé!' },
    { id: 'tv3', track: 'tv', icon: '⚙️', title: 'Ghép vần & dấu', intro: 'Bài ba. Ghép vần và dấu thanh. Bé nghe kỹ nhé!' },
    { id: 'tv4', track: 'tv', icon: '📖', title: 'Đọc từ', intro: 'Bài bốn. Đọc từ. Bé chạm vào chữ để nghe đánh vần nhé!' },
    { id: 'tv5', track: 'tv', icon: '🗣️', title: 'Đọc câu', intro: 'Bài năm. Đọc câu. Bé đọc cùng cô nhé!' },
    { id: 'toan1', track: 'toan', icon: '🍎', title: 'Đếm 1 đến 5', intro: 'Bài một. Đếm từ một đến năm. Bé chạm vào từng hình để đếm nhé!' },
    { id: 'toan2', track: 'toan', icon: '🦆', title: 'Đếm 6 đến 10', intro: 'Bài hai. Đếm từ sáu đến mười. Bé đếm thật cẩn thận nhé!' },
    { id: 'toan3', track: 'toan', icon: '🔢', title: 'Nhận biết số', intro: 'Bài ba. Nhận biết số. Bé nghe và tìm đúng số nhé!' },
    { id: 'toan4', track: 'toan', icon: '⚖️', title: 'Nhiều hơn, ít hơn', intro: 'Bài bốn. Nhiều hơn, ít hơn. Bé so sánh hai bên nhé!' },
    { id: 'toan5', track: 'toan', icon: '🐊', title: 'Dấu lớn, bé, bằng', intro: 'Bài năm. Chú cá sấu tham ăn luôn há miệng về phía có nhiều đồ ăn hơn!' }
  ]
};
