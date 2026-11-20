// Nội dung các bài học (5 bài cơ bản + 3 bài nâng cao mỗi track). Sửa / thêm nội dung ở đây.
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

  // Bài 7 (Nâng cao) - Luật chính tả c/k, g/gh, ng/ngh
  spellingQuiz: [
    { prefix: 'k', vowel: 'ẹo', full: 'kẹo', emoji: '🍬', options: ['c', 'k'], hint: 'Chữ k chỉ đi với e, ê, i thôi con nhé!' },
    { prefix: 'c', vowel: 'á', full: 'cá', emoji: '🐟', options: ['c', 'k'], hint: 'Chữ c đi với các chữ a, o, ô, ơ, u, ư nhé!' },
    { prefix: 'k', vowel: 'em', full: 'kem', emoji: '🍦', options: ['c', 'k'], hint: 'Trước chữ e, bé chọn chữ k nhé!' },
    { prefix: 'c', vowel: 'am', full: 'cam', emoji: '🍊', options: ['c', 'k'], hint: 'Trước chữ a, bé chọn chữ c nhé!' },
    { prefix: 'gh', vowel: 'ế', full: 'ghế', emoji: '🪑', options: ['g', 'gh'], hint: 'Trước chữ ê, bé chọn gờ kép gh nhé!' },
    { prefix: 'g', vowel: 'à', full: 'gà', emoji: '🐔', options: ['g', 'gh'], hint: 'Trước chữ a, bé chọn chữ g đơn nhé!' },
    { prefix: 'gh', vowel: 'ẹ', full: 'ghẹ', emoji: '🦀', options: ['g', 'gh'], hint: 'Trước chữ e, bé chọn gờ kép gh nhé!' },
    { prefix: 'g', vowel: 'ấu', full: 'gấu', emoji: '🐻', options: ['g', 'gh'], hint: 'Trước chữ ớ, bé chọn chữ g đơn nhé!' },
    { prefix: 'ngh', vowel: 'é', full: 'nghé', emoji: '🐃', options: ['ng', 'ngh'], hint: 'Trước chữ e, bé chọn ngờ kép ngh nhé!' },
    { prefix: 'ng', vowel: 'ô', full: 'ngô', emoji: '🌽', options: ['ng', 'ngh'], hint: 'Trước chữ ô, bé chọn chữ ng đơn nhé!' },
    { prefix: 'ngh', vowel: 'ỉ', full: 'nghỉ', emoji: '🏖️', options: ['ng', 'ngh'], hint: 'Trước chữ i, bé chọn ngờ kép ngh nhé!' },
    { prefix: 'ng', vowel: 'ựa', full: 'ngựa', emoji: '🐴', options: ['ng', 'ngh'], hint: 'Trước chữ ư, bé chọn chữ ng đơn nhé!' }
  ],

  // Bài 8 (Nâng cao) - Ghép từ có nghĩa
  wordPuzzles: [
    { first: 'con', second: 'mèo', emoji: '🐱', choices: ['mèo', 'chó', 'gà'], full: 'con mèo' },
    { first: 'hoa', second: 'sen', emoji: '🪷', choices: ['sen', 'lá', 'cây'], full: 'hoa sen' },
    { first: 'chiếc', second: 'xe', emoji: '🚗', choices: ['xe', 'nhà', 'cửa'], full: 'chiếc xe' },
    { first: 'quả', second: 'táo', emoji: '🍎', choices: ['táo', 'cam', 'dâu'], full: 'quả táo' },
    { first: 'chú', second: 'thỏ', emoji: '🐰', choices: ['thỏ', 'gấu', 'voi'], full: 'chú thỏ' },
    { first: 'máy', second: 'bay', emoji: '✈️', choices: ['bay', 'nước', 'giặt'], full: 'máy bay' },
    { first: 'mặt', second: 'trời', emoji: '☀️', choices: ['trời', 'trăng', 'đất'], full: 'mặt trời' },
    { first: 'bình', second: 'nước', emoji: '🍶', choices: ['nước', 'sữa', 'trà'], full: 'bình nước' },
    { first: 'con', second: 'cá', emoji: '🐟', choices: ['cá', 'tôm', 'cua'], full: 'con cá' },
    { first: 'cái', second: 'ô', emoji: '☂️', choices: ['ô', 'mũ', 'nón'], full: 'cái ô' }
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

  praises: ['Cô khen con, đúng rồi!', 'Con giỏi quá!', 'Tuyệt vời lắm con ơi!', 'Hoan hô con yêu!', 'Giỏi lắm, đúng rồi!'],

  // Bài 8 Toán (Nâng cao) - Hình học & Quy luật tư duy
  shapes: [
    { id: 'circle', name: 'hình tròn', icon: '🔴', color: '#FF5252' },
    { id: 'square', name: 'hình vuông', icon: '🟦', color: '#448AFF' },
    { id: 'triangle', name: 'hình tam giác', icon: '🔺', color: '#FFA000' },
    { id: 'rectangle', name: 'hình chữ nhật', icon: '🟧', color: '#FF7043' },
    { id: 'star', name: 'hình ngôi sao', icon: '⭐', color: '#FFD700' }
  ],

  patterns: [
    { seq: ['🍎', '🍌', '🍎', '🍌'], next: '🍎', choices: ['🍎', '🍌'], name: 'quả táo' },
    { seq: ['🔴', '🟦', '🔴', '🟦'], next: '🔴', choices: ['🔴', '🟦'], name: 'hình tròn đỏ' },
    { seq: ['🚗', '🚙', '🚗', '🚙'], next: '🚗', choices: ['🚗', '🚙'], name: 'chiếc xe đỏ' },
    { seq: ['⭐', '🎈', '⭐', '🎈'], next: '⭐', choices: ['⭐', '🎈'], name: 'ngôi sao vàng' },
    { seq: ['🐶', '🐱', '🐶', '🐱'], next: '🐶', choices: ['🐶', '🐱'], name: 'chú cún' },
    { seq: ['🔺', '🟢', '🔺', '🟢'], next: '🔺', choices: ['🔺', '🟢'], name: 'hình tam giác' },
    { seq: ['🍓', '🍇', '🍓', '🍇'], next: '🍓', choices: ['🍓', '🍇'], name: 'quả dâu tây' },
    { seq: ['🌸', '🌻', '🌸', '🌻'], next: '🌸', choices: ['🌸', '🌻'], name: 'bông hoa hồng' }
  ],

  // Danh sách bài học: track "tv" (Tiếng Việt) và "toan" (Toán). Mở khóa lần lượt trong từng track.
  lessons: [
    // 5 bài Tiếng Việt cơ bản
    { id: 'tv1', track: 'tv', icon: '🅰️', title: 'Nguyên âm', intro: 'Bài một. Nguyên âm. Con nghe cô đọc và tìm đúng chữ nhé!' },
    { id: 'tv2', track: 'tv', icon: '🐄', title: 'Phụ âm', intro: 'Bài hai. Phụ âm. Con nghe âm và tìm chữ, tìm hình cùng cô nhé!' },
    { id: 'tv3', track: 'tv', icon: '⚙️', title: 'Ghép vần & dấu', intro: 'Bài ba. Ghép vần và dấu thanh. Con nghe kỹ cùng cô nhé!' },
    { id: 'tv4', track: 'tv', icon: '📖', title: 'Đọc từ', intro: 'Bài bốn. Đọc từ. Con chạm vào chữ để nghe cô đánh vần nhé!' },
    { id: 'tv5', track: 'tv', icon: '🗣️', title: 'Đọc câu', intro: 'Bài năm. Đọc câu. Con đọc cùng cô nhé!' },
    // 3 bài Tiếng Việt nâng cao
    { id: 'tv6', track: 'tv', icon: '🐯', title: 'Phụ âm ghép', intro: 'Bài sáu. Phụ âm ghép. Con nghe cô đọc và tìm đúng phụ âm ghép nhé!' },
    { id: 'tv7', track: 'tv', icon: '✨', title: 'Luật chính tả', intro: 'Bài bảy. Quy tắc chính tả. Con nhớ k, gh, và ngh chỉ đi với e, ê, i nhé!' },
    { id: 'tv8', track: 'tv', icon: '🧩', title: 'Ghép từ', intro: 'Bài tám. Ghép từ có nghĩa. Bé nhìn hình và tìm tiếng còn thiếu nhé!' },

    // 5 bài Toán cơ bản
    { id: 'toan1', track: 'toan', icon: '🍎', title: 'Đếm 1 đến 5', intro: 'Bài một. Đếm từ một đến năm. Con chạm vào từng hình để đếm cùng cô nhé!' },
    { id: 'toan2', track: 'toan', icon: '🦆', title: 'Đếm 6 đến 10', intro: 'Bài hai. Đếm từ sáu đến mười. Con đếm thật cẩn thận cùng cô nhé!' },
    { id: 'toan3', track: 'toan', icon: '🔢', title: 'Nhận biết số', intro: 'Bài ba. Nhận biết số. Con nghe cô đọc và tìm đúng số nhé!' },
    { id: 'toan4', track: 'toan', icon: '⚖️', title: 'Nhiều hơn, ít hơn', intro: 'Bài bốn. Nhiều hơn, ít hơn. Con so sánh hai bên cùng cô nhé!' },
    { id: 'toan5', track: 'toan', icon: '🐊', title: 'Dấu lớn, bé, bằng', intro: 'Bài năm. Chú cá sấu tham ăn luôn há miệng về phía có nhiều đồ ăn hơn!' },
    // 3 bài Toán nâng cao
    { id: 'toan6', track: 'toan', icon: '🤲', title: 'Tách & Gộp số', intro: 'Bài sáu. Tách và gộp số. Bé xem hai nhóm gộp lại có tất cả bao nhiêu nhé!' },
    { id: 'toan7', track: 'toan', icon: '➕', title: 'Phép cộng & trừ', intro: 'Bài bảy. Phép cộng và trừ trực quan. Bé cùng cô tính nhé!' },
    { id: 'toan8', track: 'toan', icon: '🔷', title: 'Hình & Quy luật', intro: 'Bài tám. Hình học và quy luật logic. Bé tìm hình khối và hình tiếp theo nhé!' }
  ]
};
