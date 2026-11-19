// Ví phần thưởng của bé: sao ⭐ (thành tích) và chìa khóa 🔑 (mở 1 lượt chơi mini-game).
// Lưu vào localStorage nếu trình duyệt cho phép; nếu không, vẫn chạy bình thường trong phiên.
(function () {
  const KEY = 'beHocVui.wallet.v1';
  let state = { stars: 0, keys: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) state = { stars: +saved.stars || 0, keys: +saved.keys || 0 };
  } catch (e) { /* storage unavailable */ }

  const listeners = [];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    listeners.forEach(fn => fn(state));
  }

  window.wallet = {
    get stars() { return state.stars; },
    get keys() { return state.keys; },
    addStars(n = 1) { state.stars += n; save(); },
    addKeys(n = 1) { state.keys += n; save(); },
    useKey() {
      if (state.keys <= 0) return false;
      state.keys -= 1;
      save();
      return true;
    },
    onChange(fn) { listeners.push(fn); fn(state); }
  };
})();
