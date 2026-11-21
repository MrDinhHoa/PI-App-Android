// Khu Phụ Huynh: cổng phép nhân, giới hạn thời gian dùng mỗi ngày, quy tắc chìa khóa, báo cáo.
// Nạp sau wallet.js và trước app.js. Các module ghi kết quả qua window.parentLog.answer(...).
(function () {
  const STORE_KEY = 'beHocVui.parent.v1';
  const TICK_SEC = 5;
  const KEEP_DAYS = 60;

  const DEFAULTS = { limitMin: 0, replayKeys: true, keysPerDay: 0 };
  let data = { settings: { ...DEFAULTS }, days: {}, stats: {}, misses: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved) data = { ...data, ...saved, settings: { ...DEFAULTS, ...(saved.settings || {}) } };
  } catch (e) { /* ignore */ }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ } };

  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function today() {
    const k = dayKey();
    if (!data.days[k]) {
      data.days[k] = { sec: 0, keys: 0, bonusMin: 0 };
      // xóa ngày quá cũ
      Object.keys(data.days).sort().slice(0, -KEEP_DAYS).forEach(x => delete data.days[x]);
    }
    return data.days[k];
  }
  const fmtMin = sec => `${Math.round(sec / 60)} phút`;

  // ==================== GHI KẾT QUẢ HỌC ====================
  // category: dạng bài ("Bài học: Nguyên âm"); detail: chữ / vần / số cụ thể (có thể rỗng)
  function answer(category, ok, detail) {
    const s = data.stats[category] || (data.stats[category] = { ok: 0, err: 0 });
    if (ok) s.ok++; else s.err++;
    if (!ok && detail) data.misses[detail] = (data.misses[detail] || 0) + 1;
    save();
  }

  // ==================== CHÌA KHÓA ====================
  // replay: học lại bài đã xong hoặc Ôn tập. Trả về true nếu được nhận chìa khóa.
  function canAwardKey(replay) {
    const s = data.settings;
    if (replay && !s.replayKeys) return false;
    if (s.keysPerDay > 0 && today().keys >= s.keysPerDay) return false;
    return true;
  }
  function keyAwarded() {
    today().keys++;
    save();
  }

  // ==================== THỜI GIAN DÙNG ====================
  const overlay = document.getElementById('parentOverlay');
  const limitScreen = document.getElementById('limitScreen');
  const limitSec = () => (data.settings.limitMin > 0 ? (data.settings.limitMin + today().bonusMin) * 60 : Infinity);
  const isLocked = () => today().sec >= limitSec();
  let warned = false;

  function tick() {
    if (document.visibilityState !== 'visible' || isLocked()) return;
    const d = today();
    d.sec += TICK_SEC;
    save();
    const left = limitSec() - d.sec;
    if (left <= 120 && left > 0 && !warned) {
      warned = true;
      window.kidsAudio && window.kidsAudio.speak('Còn hai phút nữa là hết giờ học hôm nay rồi con nhé!');
    }
    if (isLocked()) showLimit();
  }
  setInterval(tick, TICK_SEC * 1000);

  function showLimit() {
    if (window.minigame) window.minigame.pause();
    if (window.kidsAudio) {
      window.kidsAudio.stopAll();
      window.kidsAudio.speak('Hết giờ học hôm nay rồi! Con cho mắt nghỉ ngơi, mai mình học tiếp nhé!');
    }
    limitScreen.classList.remove('is-hidden');
  }
  function hideLimitIfFree() {
    if (!isLocked()) {
      limitScreen.classList.add('is-hidden');
      warned = limitSec() - today().sec <= 120;
    }
  }

  // ==================== CỔNG PHỤ HUYNH ====================
  const gate = { a: 0, b: 0, input: '', onPass: null };
  const gateQ = document.getElementById('pgQuestion');
  const gateInput = document.getElementById('pgInput');
  const gateBox = document.getElementById('parentGate');
  const panel = document.getElementById('parentPanel');

  function openGate(onPass) {
    gate.a = 3 + Math.floor(Math.random() * 7);
    gate.b = 3 + Math.floor(Math.random() * 7);
    gate.input = '';
    gate.onPass = onPass;
    gateQ.textContent = `${gate.a} × ${gate.b} = ?`;
    gateInput.textContent = '';
    gateInput.classList.remove('bad');
    overlay.classList.remove('is-hidden');
    gateBox.classList.remove('is-hidden');
    panel.classList.add('is-hidden');
  }
  function closeAll() {
    overlay.classList.add('is-hidden');
    hideLimitIfFree();
  }
  function gateKey(k) {
    if (k === 'del') gate.input = gate.input.slice(0, -1);
    else if (k === 'ok') {
      if (+gate.input === gate.a * gate.b) {
        gateBox.classList.add('is-hidden');
        gate.onPass();
        return;
      }
      gateInput.classList.add('bad');
      setTimeout(() => gateInput.classList.remove('bad'), 500);
      gate.input = '';
    } else if (gate.input.length < 3) gate.input += k;
    gateInput.textContent = gate.input;
  }
  const keypad = document.getElementById('pgKeypad');
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach(k => {
    const b = document.createElement('button');
    b.className = `pg-key${k === 'ok' ? ' ok' : ''}`;
    b.textContent = k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k;
    b.addEventListener('click', () => gateKey(k));
    keypad.appendChild(b);
  });
  document.getElementById('pgCancel').addEventListener('click', closeAll);

  // ==================== BẢNG PHỤ HUYNH ====================
  const pnTabs = document.querySelectorAll('.pn-tab');
  const pnBody = document.getElementById('pnBody');
  let pnTab = 'report';

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function openPanel() {
    panel.classList.remove('is-hidden');
    renderPanel();
  }
  pnTabs.forEach(t => t.addEventListener('click', () => { pnTab = t.dataset.tab; renderPanel(); }));
  document.getElementById('pnClose').addEventListener('click', closeAll);

  function renderPanel() {
    pnTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === pnTab));
    pnBody.innerHTML = '';
    if (pnTab === 'report') renderReport();
    else renderSettings();
  }

  function card(title) {
    const c = el('div', 'pn-card');
    c.appendChild(el('div', 'pn-card-title', title));
    pnBody.appendChild(c);
    return c;
  }

  function renderReport() {
    // --- thời gian 7 ngày ---
    const t = card('⏱️ Thời gian dùng 7 ngày gần nhất');
    const chart = el('div', 'pn-chart');
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ d, sec: (data.days[dayKey(d)] || {}).sec || 0 });
    }
    const max = Math.max(600, ...days.map(x => x.sec));
    const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    days.forEach((x, i) => {
      const col = el('div', 'pn-bar-col');
      col.appendChild(el('span', 'pn-bar-val', x.sec ? String(Math.round(x.sec / 60)) : ''));
      const bar = el('div', `pn-bar${i === 6 ? ' today' : ''}`);
      bar.style.height = `${Math.max(2, (x.sec / max) * 100)}%`;
      col.append(bar, el('span', 'pn-bar-day', i === 6 ? 'Nay' : WD[x.d.getDay()]));
      chart.appendChild(col);
    });
    t.appendChild(chart);
    const d = today();
    const lim = data.settings.limitMin;
    t.appendChild(el('div', 'pn-note', `Hôm nay: ${fmtMin(d.sec)}${lim ? ` / giới hạn ${lim + d.bonusMin} phút` : ' (không giới hạn)'} · Chìa khóa nhận hôm nay: ${d.keys}`));

    // --- tiến độ bài học ---
    const p = card('📚 Tiến độ bài học');
    let prog = {};
    try { prog = JSON.parse(localStorage.getItem('beHocVui.lessons.v1')) || {}; } catch (e) { prog = {}; }
    const lessons = (window.LESSONS_DATA && window.LESSONS_DATA.lessons) || [];
    [['tv', 'Tiếng Việt'], ['toan', 'Toán']].forEach(([k, name]) => {
      const list = lessons.filter(l => l.track === k);
      const done = list.filter(l => prog[l.id]);
      const stars = done.reduce((s, l) => s + prog[l.id].stars, 0);
      const row = el('div', 'pn-prog-row');
      row.appendChild(el('span', 'pn-prog-name', name));
      const bar = el('div', 'pn-prog-bar');
      const fill = el('div', 'pn-prog-fill');
      fill.style.width = `${list.length ? (done.length / list.length) * 100 : 0}%`;
      bar.appendChild(fill);
      row.append(bar, el('span', 'pn-prog-num', `${done.length}/${list.length} bài · ⭐ ${stars}/${list.length * 3}`));
      p.appendChild(row);
      const weak = done.filter(l => prog[l.id].stars <= 1).map(l => l.title);
      if (weak.length) p.appendChild(el('div', 'pn-note', `Bài nên học lại (1⭐): ${weak.join(', ')}`));
    });

    // --- dạng bài hay sai ---
    const w = card('🧐 Dạng bài bé hay sai');
    const cats = Object.entries(data.stats)
      .map(([name, s]) => ({ name, ...s, rate: s.err / Math.max(1, s.ok + s.err) }))
      .filter(x => x.err > 0 && x.ok + x.err >= 3)
      .sort((a, b) => b.rate - a.rate || b.err - a.err)
      .slice(0, 6);
    if (!cats.length) w.appendChild(el('div', 'pn-note', 'Chưa đủ dữ liệu. Bé học thêm vài bài là có báo cáo nhé.'));
    cats.forEach(x => {
      const row = el('div', 'pn-weak-row');
      row.appendChild(el('span', 'pn-weak-name', x.name));
      const bar = el('div', 'pn-weak-bar');
      const fill = el('div', 'pn-weak-fill');
      fill.style.width = `${Math.round(x.rate * 100)}%`;
      bar.appendChild(fill);
      row.append(bar, el('span', 'pn-weak-num', `sai ${x.err} / ${x.ok + x.err}`));
      w.appendChild(row);
    });

    // --- chữ / vần / số hay nhầm ---
    const m = card('🔤 Chữ, vần, số bé hay nhầm');
    const misses = Object.entries(data.misses).sort((a, b) => b[1] - a[1]).slice(0, 12);
    if (!misses.length) m.appendChild(el('div', 'pn-note', 'Chưa có.'));
    else {
      const chips = el('div', 'pn-chips');
      misses.forEach(([k, n]) => chips.appendChild(el('span', 'pn-chip', `${k} · ${n}`)));
      m.appendChild(chips);
    }
  }

  function optionRow(label, values, current, fmt, onPick) {
    const row = el('div', 'pn-set-row');
    row.appendChild(el('span', 'pn-set-label', label));
    const opts = el('div', 'pn-opts');
    values.forEach(v => {
      const b = el('button', `pn-opt${v === current ? ' active' : ''}`, fmt(v));
      b.addEventListener('click', () => { onPick(v); save(); renderPanel(); });
      opts.appendChild(b);
    });
    row.appendChild(opts);
    return row;
  }

  function renderSettings() {
    const s = data.settings;
    const t = card('⏱️ Thời gian dùng mỗi ngày');
    t.appendChild(optionRow('Giới hạn', [0, 15, 20, 30, 45, 60], s.limitMin, v => (v ? `${v} phút` : 'Không'), v => { s.limitMin = v; }));
    const d = today();
    t.appendChild(el('div', 'pn-note', `Hôm nay đã dùng ${fmtMin(d.sec)}. Hết giờ, app hiện màn hình nghỉ và chỉ phụ huynh mở lại được.`));
    if (s.limitMin) {
      const bonus = el('button', 'action-btn', '➕ Cho thêm 15 phút hôm nay');
      bonus.addEventListener('click', () => { today().bonusMin += 15; save(); renderPanel(); });
      t.appendChild(bonus);
    }

    const k = card('🔑 Chìa khóa chơi game');
    k.appendChild(optionRow('Học lại bài cũ / Ôn tập', [true, false], s.replayKeys, v => (v ? 'Được chìa khóa' : 'Không'), v => { s.replayKeys = v; }));
    k.appendChild(optionRow('Tối đa mỗi ngày', [0, 3, 5, 10], s.keysPerDay, v => (v ? `${v} chìa` : 'Không giới hạn'), v => { s.keysPerDay = v; }));
    k.appendChild(el('div', 'pn-note', `Bé đang có ${window.wallet ? window.wallet.keys : 0} 🔑 · Mỗi lượt chơi 2 phút tốn 1 🔑.`));

    const r = card('🗑️ Dữ liệu');
    const btnStats = el('button', 'action-btn secondary', 'Xóa báo cáo');
    btnStats.addEventListener('click', () => {
      if (!confirm('Xóa thống kê dạng bài và chữ hay nhầm?')) return;
      data.stats = {};
      data.misses = {};
      save();
      renderPanel();
    });
    const btnAll = el('button', 'action-btn pn-danger', 'Xóa toàn bộ tiến độ của bé');
    btnAll.addEventListener('click', () => {
      if (!confirm('Xóa toàn bộ tiến độ, sao, chìa khóa và báo cáo? Không thể hoàn tác.')) return;
      try {
        Object.keys(localStorage).filter(x => x.startsWith('beHocVui.') && x !== STORE_KEY).forEach(x => localStorage.removeItem(x));
      } catch (e) { /* ignore */ }
      data = { settings: data.settings, days: {}, stats: {}, misses: {} };
      save();
      location.reload();
    });
    const btns = el('div', 'pn-btns');
    btns.append(btnStats, btnAll);
    r.appendChild(btns);
  }

  // ==================== NÚT MỞ ====================
  document.getElementById('parentBtn').addEventListener('click', () => {
    window.kidsAudio && window.kidsAudio.playPop();
    openGate(openPanel);
  });
  document.getElementById('limitParentBtn').addEventListener('click', () => openGate(openPanel));

  // kiểm tra ngay khi mở app (ví dụ bé mở lại sau khi đã hết giờ)
  if (isLocked()) setTimeout(showLimit, 300);

  window.parentLog = {
    answer, canAwardKey, keyAwarded, isLocked,
    _data: () => data, _tick: tick, openGate
  };
})();
