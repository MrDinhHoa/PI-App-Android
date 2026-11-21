// Nội dung các bài học (Tiếng Việt 9 bài, Toán 8 bài). Sửa / thêm nội dung ở đây.
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
    { text: 'lá cờ', emoji: '🚩', sound: 'Lá cờ bay phấp phới!' },
    { text: 'con cua', emoji: '🦀', sound: 'Cua bò ngang!' },
    { text: 'con cá', emoji: '🐟', sound: 'Cá bơi tung tăng!' },
    { text: 'con ong', emoji: '🐝', sound: 'Ong bay vo ve!' },
    { text: 'con thỏ', emoji: '🐰', sound: 'Thỏ nhảy tung tăng!' },
    { text: 'con khỉ', emoji: '🐒', sound: 'Khỉ leo cây giỏi quá!' },
    { text: 'con rùa', emoji: '🐢', sound: 'Rùa bò chầm chậm!' },
    { text: 'con hổ', emoji: '🐯', sound: 'Hổ kêu gừ gừ!' },
    { text: 'con gấu', emoji: '🐻', sound: 'Gấu thích ăn mật ong!' },
    { text: 'con heo', emoji: '🐷', sound: 'Ủn ỉn, ủn ỉn!' },
    { text: 'con ngựa', emoji: '🐴', sound: 'Hí hí!' },
    { text: 'quả nho', emoji: '🍇', sound: 'Chùm nho ngọt lịm!' },
    { text: 'quả lê', emoji: '🍐', sound: 'Quả lê mát quá!' },
    { text: 'quả cam', emoji: '🍊', sound: 'Quả cam vàng ươm!' },
    { text: 'quả chuối', emoji: '🍌', sound: 'Chuối chín vàng!' },
    { text: 'dưa hấu', emoji: '🍉', sound: 'Dưa hấu đỏ mọng!' },
    { text: 'cái mũ', emoji: '🧢', sound: 'Cái mũ che nắng!' },
    { text: 'cái kéo', emoji: '✂️', sound: 'Cái kéo cắt giấy!' },
    { text: 'cái nơ', emoji: '🎀', sound: 'Cái nơ xinh quá!' },
    { text: 'ô tô', emoji: '🚗', sound: 'Ô tô chạy bon bon!' },
    { text: 'máy bay', emoji: '✈️', sound: 'Máy bay bay cao!' },
    { text: 'tàu hỏa', emoji: '🚂', sound: 'Tàu hỏa xình xịch!' },
    { text: 'ngôi sao', emoji: '⭐', sound: 'Ngôi sao lấp lánh!' },
    { text: 'cầu vồng', emoji: '🌈', sound: 'Cầu vồng bảy màu!' },
    { text: 'cây dừa', emoji: '🌴', sound: 'Cây dừa cao vút!' },
    { text: 'đôi giày', emoji: '👟', sound: 'Đôi giày của bé!' },
    { text: 'ngôi nhà', emoji: '🏠', sound: 'Ngôi nhà của bé!' }
  ],

  // Bài 5 - Đọc câu: 4–6 chữ, kèm hình minh họa để bé chọn
  sentences: [
    { text: 'Bé đi nhà trẻ', emoji: '👧🏫' },
    { text: 'Mẹ mua quả cam', emoji: '👩🍊' },
    { text: 'Chú gà gáy vang', emoji: '🐓🌅' },
    { text: 'Con bò ăn cỏ', emoji: '🐄🌿' },
    { text: 'Bà bế em bé', emoji: '👵👶' },
    { text: 'Con mèo trèo cây', emoji: '🐱🌳' },
    { text: 'Bố đọc báo', emoji: '👨📰' },
    { text: 'Bé tô màu', emoji: '👧🖍️' },
    { text: 'Mẹ nấu cơm', emoji: '👩🍚' },
    { text: 'Con cá bơi', emoji: '🐟🌊' },
    { text: 'Bé đá bóng', emoji: '👦⚽' },
    { text: 'Chim hót líu lo', emoji: '🐦🎶' },
    { text: 'Bé đi ngủ', emoji: '👶🛏️' },
    { text: 'Ông tưới cây', emoji: '👴🌱' },
    { text: 'Bé rửa tay', emoji: '🧒🧼' },
    { text: 'Trời mưa to', emoji: '🌧️☔' },
    { text: 'Con thỏ ăn cà rốt', emoji: '🐰🥕' },
    { text: 'Bé đi xe đạp', emoji: '🧒🚲' },
    { text: 'Con khỉ ăn chuối', emoji: '🐒🍌' },
    { text: 'Bé đọc sách', emoji: '👧📚' }
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
    { prefix: 'g', vowel: 'ấu', full: 'gấu', emoji: '🐻', options: ['g', 'gh'], hint: 'Trước chữ â, bé chọn chữ g đơn nhé!' },
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
    { first: 'quả', second: 'bóng', emoji: '⚽', choices: ['bóng', 'mèo', 'bàn'], full: 'quả bóng' },
    { first: 'con', second: 'cá', emoji: '🐟', choices: ['cá', 'tôm', 'cua'], full: 'con cá' },
    { first: 'cái', second: 'ô', emoji: '☂️', choices: ['ô', 'mũ', 'nón'], full: 'cái ô' },
    { first: 'con', second: 'voi', emoji: '🐘', choices: ['voi', 'bàn', 'sách'], full: 'con voi' },
    { first: 'quả', second: 'cam', emoji: '🍊', choices: ['cam', 'xe', 'mèo'], full: 'quả cam' },
    { first: 'cái', second: 'kéo', emoji: '✂️', choices: ['kéo', 'gà', 'cá'], full: 'cái kéo' },
    { first: 'bông', second: 'hoa', emoji: '🌸', choices: ['hoa', 'cá', 'xe'], full: 'bông hoa' },
    { first: 'xe', second: 'đạp', emoji: '🚲', choices: ['đạp', 'mèo', 'cam'], full: 'xe đạp' },
    { first: 'cầu', second: 'vồng', emoji: '🌈', choices: ['vồng', 'gà', 'táo'], full: 'cầu vồng' },
    { first: 'con', second: 'ong', emoji: '🐝', choices: ['ong', 'ghế', 'bút'], full: 'con ong' },
    { first: 'ngôi', second: 'nhà', emoji: '🏠', choices: ['nhà', 'cá', 'lá'], full: 'ngôi nhà' },
    { first: 'cây', second: 'dừa', emoji: '🌴', choices: ['dừa', 'gà', 'bút'], full: 'cây dừa' },
    { first: 'tàu', second: 'hỏa', emoji: '🚂', choices: ['hỏa', 'cam', 'mèo'], full: 'tàu hỏa' }
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
    { emoji: '🌸', name: 'bông hoa' },
    { emoji: '🐥', name: 'chú gà con' },
    { emoji: '🍌', name: 'quả chuối' },
    { emoji: '🐢', name: 'con rùa' },
    { emoji: '🧁', name: 'chiếc bánh' }
  ],

  // Bài 9 Tiếng Việt - Vần cơ bản. Mỗi vần kèm 1 từ có hình minh họa (một tiếng, có âm đầu).
  // Chỉ dùng vần đã có file thu âm trong audio/phonemes (van-<vần>.mp3).
  rhymes: [
    { rhyme: 'ai', word: 'tai', emoji: '👂' },
    { rhyme: 'ay', word: 'tay', emoji: '✋' },
    { rhyme: 'oi', word: 'voi', emoji: '🐘' },
    { rhyme: 'ao', word: 'táo', emoji: '🍎' },
    { rhyme: 'eo', word: 'mèo', emoji: '🐱' },
    { rhyme: 'am', word: 'cam', emoji: '🍊' },
    { rhyme: 'âm', word: 'nấm', emoji: '🍄' },
    { rhyme: 'ăn', word: 'khăn', emoji: '🧣' },
    { rhyme: 'em', word: 'kem', emoji: '🍦' },
    { rhyme: 'en', word: 'kèn', emoji: '🎺' },
    { rhyme: 'ên', word: 'nến', emoji: '🕯️' },
    { rhyme: 'im', word: 'chim', emoji: '🐦' },
    { rhyme: 'in', word: 'pin', emoji: '🔋' },
    { rhyme: 'oa', word: 'hoa', emoji: '🌸' },
    { rhyme: 'ong', word: 'bóng', emoji: '⚽' },
    { rhyme: 'ông', word: 'trống', emoji: '🥁' },
    { rhyme: 'ua', word: 'cua', emoji: '🦀' },
    { rhyme: 'ưa', word: 'dưa', emoji: '🍉' }
  ],
  // Các vần dễ nhầm (dùng làm phương án nhiễu)
  rhymeConfusable: [['ai', 'ay', 'oi'], ['ao', 'eo'], ['am', 'âm', 'ăn'], ['em', 'en', 'ên'], ['im', 'in'], ['ong', 'ông'], ['ua', 'ưa', 'oa']],

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
    { id: 'tv9', track: 'tv', icon: '🎵', title: 'Vần cơ bản', intro: 'Bài chín. Vần. Con nghe cô đọc vần và tìm cùng cô nhé!' },

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
