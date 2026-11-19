// Dữ liệu âm vị tiếng Việt cho Giai đoạn 1 (Bảng chữ cái + Cỗ máy ghép vần)
// - sound: cách đọc khi chạm chữ (đánh vần chuẩn mới: "bờ", "cờ"... không đọc tên chữ "bê", "xê").
// - blend: cách đọc khi ghép vần (nếu khác sound, ví dụ gh đọc "gờ kép" nhưng ghép là "gờ").
// - word / emoji: từ minh họa có chứa chữ đó.
// Cách đọc k ("ca"), q ("cu"), gi ("di"), gh/ngh ("gờ kép"/"ngờ kép") theo SGK Tiếng Việt 1 hiện hành;
// nếu bộ sách bé học dùng cách đọc khác, chỉ cần sửa ở đây.
window.PHONICS_DATA = {
  alphabet: {
    vowel: [
      { letter: 'a', sound: 'a', word: 'áo', emoji: '👕' },
      { letter: 'ă', sound: 'á', word: 'ăn', emoji: '🍚', note: 'Ă đọc là "á"' },
      { letter: 'â', sound: 'ớ', word: 'ấm', emoji: '🫖', note: 'Â đọc là "ớ"' },
      { letter: 'e', sound: 'e', word: 'em bé', emoji: '👶' },
      { letter: 'ê', sound: 'ê', word: 'ếch', emoji: '🐸' },
      { letter: 'i', sound: 'i', word: 'chim', emoji: '🐦', note: 'i ngắn' },
      { letter: 'o', sound: 'o', word: 'ong', emoji: '🐝', anim: 'anim-roll', note: 'O tròn như quả trứng lăn tròn' },
      { letter: 'ô', sound: 'ô', word: 'cái ô', emoji: '☂️', anim: 'anim-roll', note: 'Ô là o đội mũ' },
      { letter: 'ơ', sound: 'ơ', word: 'nơ', emoji: '🎀', anim: 'anim-roll', note: 'Ơ là o có râu' },
      { letter: 'u', sound: 'u', word: 'cú mèo', emoji: '🦉' },
      { letter: 'ư', sound: 'ư', word: 'sư tử', emoji: '🦁', note: 'Ư là u có râu' },
      { letter: 'y', sound: 'i', word: 'máy bay', emoji: '✈️', note: 'y đọc là "i" (i dài)' }
    ],
    consonant: [
      { letter: 'b', sound: 'bờ', word: 'bò', emoji: '🐄' },
      { letter: 'c', sound: 'cờ', word: 'cá', emoji: '🐟' },
      { letter: 'd', sound: 'dờ', word: 'dê', emoji: '🐐' },
      { letter: 'đ', sound: 'đờ', word: 'đèn', emoji: '💡' },
      { letter: 'g', sound: 'gờ', word: 'gà', emoji: '🐔' },
      { letter: 'h', sound: 'hờ', word: 'hoa', emoji: '🌸' },
      { letter: 'k', sound: 'ca', blend: 'ca', word: 'kéo', emoji: '✂️', note: 'k đọc là "ca", chỉ đứng trước e, ê, i' },
      { letter: 'l', sound: 'lờ', word: 'lá', emoji: '🍃' },
      { letter: 'm', sound: 'mờ', word: 'mèo', emoji: '🐱' },
      { letter: 'n', sound: 'nờ', word: 'nấm', emoji: '🍄' },
      { letter: 'p', sound: 'pờ', word: 'pin', emoji: '🔋' },
      { letter: 'q', sound: 'cu', word: 'quả cam', emoji: '🍊', note: 'q luôn đi cùng u thành "qu"' },
      { letter: 'r', sound: 'rờ', word: 'rùa', emoji: '🐢' },
      { letter: 's', sound: 'sờ', word: 'sao', emoji: '⭐' },
      { letter: 't', sound: 'tờ', word: 'táo', emoji: '🍎' },
      { letter: 'v', sound: 'vờ', word: 'voi', emoji: '🐘' },
      { letter: 'x', sound: 'xờ', word: 'xe', emoji: '🚗' }
    ],
    digraph: [
      { letter: 'ch', sound: 'chờ', word: 'chó', emoji: '🐶' },
      { letter: 'gh', sound: 'gờ kép', blend: 'gờ', word: 'ghế', emoji: '🪑', note: 'gờ kép, chỉ đứng trước e, ê, i' },
      { letter: 'gi', sound: 'di', word: 'giày', emoji: '👟', note: 'gi đọc là "di"' },
      { letter: 'kh', sound: 'khờ', word: 'khỉ', emoji: '🐒' },
      { letter: 'ng', sound: 'ngờ', word: 'ngựa', emoji: '🐴' },
      { letter: 'ngh', sound: 'ngờ kép', blend: 'ngờ', word: 'nghé', emoji: '🐃', note: 'ngờ kép, chỉ đứng trước e, ê, i' },
      { letter: 'nh', sound: 'nhờ', word: 'nhện', emoji: '🕷️' },
      { letter: 'ph', sound: 'phờ', word: 'phở', emoji: '🍜' },
      { letter: 'qu', sound: 'quờ', word: 'quà', emoji: '🎁' },
      { letter: 'th', sound: 'thờ', word: 'thỏ', emoji: '🐰' },
      { letter: 'tr', sound: 'trờ', word: 'trống', emoji: '🥁' }
    ]
  },

  // Chữ dùng trong Cỗ máy ghép vần (âm đầu + 1 nguyên âm)
  blendConsonants: ['b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'r', 's',
                    't', 'v', 'x', 'ch', 'gh', 'kh', 'ng', 'ngh', 'nh', 'ph', 'th', 'tr'],
  blendVowels: ['a', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư'],

  // Luật chính tả c/k, g/gh, ng/ngh: e, ê, i là "nguyên âm hàng trước"
  frontVowels: ['e', 'ê', 'i'],
  spellingRules: [
    { consonant: 'c', front: true, suggest: 'k',
      hint: 'Trước e, ê, i mình không viết chữ c. Bé thử chữ k (ca) nhé!' },
    { consonant: 'k', front: false, suggest: 'c',
      hint: 'Chữ k (ca) chỉ đi với e, ê, i thôi. Bé thử chữ c nhé!' },
    { consonant: 'g', front: true, suggest: 'gh',
      hint: 'Trước e, ê, i bé dùng gờ kép gh nhé!' },
    { consonant: 'gh', front: false, suggest: 'g',
      hint: 'Gờ kép gh chỉ đi với e, ê, i thôi. Bé thử chữ g nhé!' },
    { consonant: 'ng', front: true, suggest: 'ngh',
      hint: 'Trước e, ê, i bé dùng ngờ kép ngh nhé!' },
    { consonant: 'ngh', front: false, suggest: 'ng',
      hint: 'Ngờ kép ngh chỉ đi với e, ê, i thôi. Bé thử chữ ng nhé!' }
  ],

  // 6 thanh điệu: thanh ngang (không dấu) + 5 dấu
  tones: [
    { key: 'ngang', name: 'ngang', mark: '' },
    { key: 'huyen', name: 'huyền', mark: '̀' },
    { key: 'sac', name: 'sắc', mark: '́' },
    { key: 'hoi', name: 'hỏi', mark: '̉' },
    { key: 'nga', name: 'ngã', mark: '̃' },
    { key: 'nang', name: 'nặng', mark: '̣' }
  ],

  // Tiếng có nghĩa: ghép đúng sẽ hiện hình minh họa và được thưởng sao
  words: {
    'ba': { emoji: '👨', say: 'Ba của bé!' },
    'bà': { emoji: '👵', say: 'Bà của bé!' },
    'bé': { emoji: '👶', say: 'Em bé!' },
    'bò': { emoji: '🐄', say: 'Con bò!' },
    'bố': { emoji: '👨', say: 'Bố của bé!' },
    'bơ': { emoji: '🥑', say: 'Quả bơ!' },
    'bú': { emoji: '🍼', say: 'Em bé bú sữa!' },
    'cá': { emoji: '🐟', say: 'Con cá!' },
    'cà': { emoji: '🍆', say: 'Quả cà!' },
    'cỏ': { emoji: '🌿', say: 'Bãi cỏ xanh!' },
    'cờ': { emoji: '🚩', say: 'Lá cờ!' },
    'cú': { emoji: '🦉', say: 'Con cú mèo!' },
    'dê': { emoji: '🐐', say: 'Con dê!' },
    'dế': { emoji: '🦗', say: 'Con dế!' },
    'dù': { emoji: '☂️', say: 'Cái dù!' },
    'đá': { emoji: '🪨', say: 'Hòn đá!' },
    'đỏ': { emoji: '🔴', say: 'Màu đỏ!' },
    'gà': { emoji: '🐔', say: 'Con gà!' },
    'gỗ': { emoji: '🪵', say: 'Khúc gỗ!' },
    'ghế': { emoji: '🪑', say: 'Cái ghế!' },
    'hổ': { emoji: '🐯', say: 'Con hổ!' },
    'hồ': { emoji: '🏞️', say: 'Cái hồ nước!' },
    'khỉ': { emoji: '🐒', say: 'Con khỉ!' },
    'lá': { emoji: '🍃', say: 'Chiếc lá!' },
    'lê': { emoji: '🍐', say: 'Quả lê!' },
    'mẹ': { emoji: '👩', say: 'Mẹ của bé!' },
    'mì': { emoji: '🍜', say: 'Bát mì!' },
    'mũ': { emoji: '🧢', say: 'Cái mũ!' },
    'nơ': { emoji: '🎀', say: 'Cái nơ!' },
    'ngô': { emoji: '🌽', say: 'Bắp ngô!' },
    'nghé': { emoji: '🐃', say: 'Con nghé!' },
    'nhà': { emoji: '🏠', say: 'Ngôi nhà!' },
    'nho': { emoji: '🍇', say: 'Chùm nho!' },
    'phở': { emoji: '🍜', say: 'Bát phở!' },
    'rổ': { emoji: '🧺', say: 'Cái rổ!' },
    'số': { emoji: '🔢', say: 'Con số!' },
    'thỏ': { emoji: '🐰', say: 'Con thỏ!' },
    'thư': { emoji: '✉️', say: 'Lá thư!' },
    'tô': { emoji: '🥣', say: 'Cái tô!' },
    'tre': { emoji: '🎋', say: 'Cây tre!' },
    'trà': { emoji: '🍵', say: 'Tách trà!' },
    'võ': { emoji: '🥋', say: 'Bé học võ!' },
    'vở': { emoji: '📒', say: 'Quyển vở!' },
    'vé': { emoji: '🎫', say: 'Tấm vé!' },
    'xe': { emoji: '🚗', say: 'Chiếc xe!' },
    'xô': { emoji: '🪣', say: 'Cái xô!' },
    'chó': { emoji: '🐶', say: 'Con chó!' },
    'chè': { emoji: '🍧', say: 'Cốc chè!' }
  }
};
