// Tab Ghép Vần: 4 chế độ quanh Cỗ máy ghép vần (phonics.js)
//  ⚙️ Cỗ máy (chơi tự do, khay Âm / Vần)  🎯 Thử thách (ghép đúng tiếng trong hình)
//  📋 Bảng ghép (phụ âm × nguyên âm như bảng ôn SGK)  📒 Sổ sưu tập (tiếng có nghĩa bé đã ghép được)
(function () {
  const D = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const L = window.LESSONS_DATA;
  const audio = () => window.kidsAudio;
  const ph = () => window.phonics;

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const $ = id => document.getElementById(id);
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function bounce(node, cls, ms = 600) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), ms);
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ==================== TỪ ĐIỂN & DANH SÁCH SƯU TẬP ====================
  // Gộp PHONICS_DATA.words với kho tiếng có hình của Xưởng Đánh Vần (spell-lab.js)
  const BANK = (window.spellLab && window.spellLab.BANK) || [];
  const DICT = new Map();
  Object.entries(D.words).forEach(([t, w]) => DICT.set(t, w));
  BANK.forEach(w => { if (!DICT.has(w.text)) DICT.set(w.text, { emoji: w.emoji, say: w.say || `${cap(w.text)}!` }); });
  const lookup = s => DICT.get(s) || null;

  const RHYMES = L.rhymes.map(r => r.rhyme);
  // Tiếng ghép được bằng cỗ máy: âm đầu có trong khay + (1 nguyên âm của khay hoặc 1 vần của khay vần)
  const buildable = w => D.blendConsonants.includes(w.a.onset)
    && (D.blendVowels.includes(w.a.rhyme) || RHYMES.includes(w.a.rhyme));
  const POOL = BANK.filter(buildable); // mỗi hình chỉ ứng với 1 tiếng (BANK đã lọc)

  // ==================== DOM & STATE ====================
  const section = $('sec-blend');
  const modesEl = $('blModes');
  const views = { machine: $('blMachineView'), table: $('blTableView'), book: $('blBookView') };
  const challengeEl = $('blChallenge');
  const st = { mode: 'machine', target: null, solved: false, token: 0, page: 0, started: false };

  const MODES = [
    { key: 'machine', icon: '⚙️', label: 'Cỗ máy' },
    { key: 'challenge', icon: '🎯', label: 'Thử thách' },
    { key: 'table', icon: '📋', label: 'Bảng ghép' },
    { key: 'book', icon: '📒', label: 'Sổ sưu tập' }
  ];

  function renderModes() {
    modesEl.innerHTML = '';
    MODES.forEach(m => {
      const b = el('button', `mt-mode${m.key === st.mode ? ' active' : ''}`);
      b.append(el('span', 'mt-mode-icon', m.icon), el('span', 'mt-mode-label', m.label));
      if (m.key === 'book') b.appendChild(el('span', 'mt-mode-lv', `${foundCount()}/${POOL.length}`));
      b.addEventListener('click', () => {
        audio().playPop();
        selectMode(m.key);
      });
      modesEl.appendChild(b);
    });
  }
  const foundCount = () => POOL.filter(w => ph().found().has(w.text)).length;

  function selectMode(key, opts = {}) {
    st.mode = key;
    st.token++;
    renderModes();
    const view = key === 'challenge' ? 'machine' : key;
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('is-hidden', k !== view));
    challengeEl.classList.toggle('is-hidden', key !== 'challenge');
    audio().stopAll();
    if (key === 'machine') {
      ph().resetBlend();
      audio().speak('Cỗ máy ghép vần! Con kéo chữ vào máy nhé!');
    } else if (key === 'challenge') {
      newChallenge(opts.target);
    } else if (key === 'table') {
      renderTable();
      audio().speak('Bảng ghép vần! Con chạm vào từng ô để nghe cô đánh vần nhé!');
    } else if (key === 'book') {
      renderBook();
    }
  }

  // ==================== 🎯 THỬ THÁCH ====================
  function newChallenge(target) {
    const found = ph().found();
    if (!target) {
      const fresh = POOL.filter(w => !found.has(w.text) && w !== st.target);
      target = fresh.length && Math.random() < 0.75 ? pick(fresh) : pick(POOL.filter(w => w !== st.target));
    }
    st.target = target;
    st.solved = false;
    ph().setVowelMode(D.blendVowels.includes(target.a.rhyme) ? 'vowel' : 'rhyme');
    ph().resetBlend();

    challengeEl.innerHTML = '';
    challengeEl.appendChild(el('span', 'bl-ch-pic', target.emoji));
    const mid = el('div', 'bl-ch-text');
    mid.append(el('b', '', 'Thử thách'), el('span', '', 'Ghép tiếng trong hình'));
    challengeEl.appendChild(mid);
    const hint = el('button', 'action-btn bl-ch-btn', '💡 Gợi ý');
    hint.addEventListener('click', () => { audio().playPop(); giveHint(); });
    const skip = el('button', 'action-btn secondary bl-ch-btn', '🔄 Hình khác');
    skip.addEventListener('click', () => { audio().playPop(); newChallenge(); });
    challengeEl.append(hint, skip);
    bounce(challengeEl, 'anim-pop', 500);
    audio().speakSequence(['Thử thách! Con ghép tiếng', target.text, 'nhé!'], { gap: 250, rate: 0.85 });
  }

  function giveHint() {
    const t = st.target;
    if (!t) return;
    const tC = document.querySelector(`#blendConsonants [data-letter="${t.a.onset}"]`);
    const tV = document.querySelector(`#blendVowels [data-letter="${t.a.rhyme}"]`);
    [tC, tV].forEach(x => x && bounce(x, 'anim-suggest', 2400));
    audio().speakSequence(P.spellParts(t.text), { gap: 420, rate: 0.78 });
  }

  function onResult({ base, toned, stage }) {
    renderModes(); // cập nhật số tiếng trong Sổ sưu tập
    if (st.mode !== 'challenge' || !st.target || st.solved) return;
    const t = st.target;
    if (toned === t.text) {
      st.solved = true;
      ph().markFound(t.text);
      if (window.addStar) window.addStar(1);
      if (window.spawnConfetti) window.spawnConfetti();
      audio().playCelebration();
      challengeEl.classList.add('solved');
      renderModes();
      const token = st.token;
      audio().speakSequence(['Hoan hô! Con ghép đúng tiếng', t.text, 'rồi!'], { gap: 250, rate: 0.85 }).then(() => {
        setTimeout(() => {
          if (token !== st.token) return;
          challengeEl.classList.remove('solved');
          newChallenge();
        }, 700);
      });
      return;
    }
    if (base === t.a.base) {
      // ghép đúng phần âm đầu + vần, còn thiếu / sai dấu
      audio().speakSequence([stage === 'base' ? 'Đúng rồi! Giờ con chọn dấu thanh để thành tiếng' : 'Chưa đúng dấu rồi! Con nghe lại nhé:', t.text], { gap: 250, rate: 0.85 });
      return;
    }
    if (stage !== 'base') return;
    const a = P.analyzeSyllable(base);
    const parts = ['Đây là tiếng', base, 'Cô cần tiếng', t.text];
    if (a.onset !== t.a.onset) parts.push('Tiếng', t.text, 'có âm đầu', P.phonemePart(P.findLetter(t.a.onset), true));
    else parts.push('Con đổi vần khác nhé!');
    audio().playBoing();
    audio().speakSequence(parts, { gap: 260, rate: 0.85 });
  }

  // ==================== 📋 BẢNG GHÉP ====================
  const PAGES = [
    { label: 'b – l', cons: ['b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l'] },
    { label: 'm – x', cons: ['m', 'n', 'r', 's', 't', 'v', 'x'] },
    { label: 'ch – tr', cons: ['ch', 'gh', 'kh', 'ng', 'ngh', 'nh', 'ph', 'th', 'tr'] }
  ];
  const ruleFor = (c, v) => D.spellingRules.find(r => r.consonant === c && r.front === D.frontVowels.includes(v)) || null;

  function renderTable() {
    const pagesEl = $('blPages');
    pagesEl.innerHTML = '';
    PAGES.forEach((pg, i) => {
      const b = el('button', `bl-page${i === st.page ? ' active' : ''}`, pg.label);
      b.addEventListener('click', () => { audio().playPop(); st.page = i; renderTable(); });
      pagesEl.appendChild(b);
    });
    const table = $('blTable');
    table.innerHTML = '';
    table.style.setProperty('--cols', D.blendVowels.length);
    table.appendChild(el('div', 'bl-cell bl-corner', '+'));
    D.blendVowels.forEach(v => table.appendChild(el('div', 'bl-cell bl-head-v', v)));
    PAGES[st.page].cons.forEach(c => {
      const ci = P.findLetter(c);
      const head = el('button', 'bl-cell bl-head-c', c);
      head.addEventListener('click', () => { audio().playPop(); audio().speakSequence([P.phonemePart(ci, false)], { rate: 0.85 }); });
      table.appendChild(head);
      D.blendVowels.forEach(v => {
        const vi = P.findLetter(v);
        const base = c + v;
        const rule = ruleFor(c, v);
        const cell = el('button', `bl-cell bl-syl${rule ? ' bad' : ''}`, rule ? '✗' : base);
        const word = !rule && lookup(base);
        if (word) cell.appendChild(el('span', 'bl-syl-pic', word.emoji));
        cell.addEventListener('click', () => {
          if (rule) {
            audio().playBoing();
            bounce(cell, 'anim-shake');
            $('blTableStatus').textContent = `🤔 Không viết "${base}". ${rule.hint}`;
            audio().speakSequence([rule.hint], { rate: 0.88 });
            return;
          }
          audio().playPop();
          table.querySelectorAll('.bl-syl.speaking').forEach(x => x.classList.remove('speaking'));
          cell.classList.add('speaking');
          $('blTableStatus').textContent = `${cap(ci.blend || ci.sound)} – ${vi.sound} – ${base}${word ? ` ${word.emoji}` : ''}`;
          const parts = [P.phonemePart(ci, true), P.phonemePart(vi, true), base];
          if (word) parts.push(word.say);
          audio().speakSequence(parts, { gap: 380, rate: 0.8 }).then(() => cell.classList.remove('speaking'));
        });
        table.appendChild(cell);
      });
    });
    $('blTableStatus').textContent = 'Chạm vào một ô để nghe cô đánh vần. Ô có hình là tiếng có nghĩa!';
  }

  // ==================== 📒 SỔ SƯU TẬP ====================
  function renderBook() {
    const found = ph().found();
    const n = foundCount();
    const head = $('blBookHead');
    head.innerHTML = '';
    head.append(el('span', 'bl-book-title', `📒 Bé đã sưu tầm ${n} / ${POOL.length} tiếng`));
    const bar = el('div', 'bl-book-bar');
    const fill = el('div', 'bl-book-fill');
    fill.style.width = `${(n / POOL.length) * 100}%`;
    bar.appendChild(fill);
    head.appendChild(bar);

    const book = $('blBook');
    book.innerHTML = '';
    [...POOL].sort((x, y) => (found.has(y.text) - found.has(x.text)) || x.text.localeCompare(y.text, 'vi'))
      .forEach(w => {
        const got = found.has(w.text);
        const card = el('button', `bl-sticker${got ? ' got' : ''}`);
        card.append(el('span', 'bl-sticker-pic', w.emoji), el('span', 'bl-sticker-word', got ? w.text : '?'));
        card.addEventListener('click', () => {
          audio().playPop();
          if (got) {
            bounce(card, 'anim-pop', 500);
            audio().speakSequence([...P.spellParts(w.text), DICT.get(w.text).say], { gap: 380, rate: 0.8 });
          } else {
            selectMode('challenge', { target: w });
          }
        });
        book.appendChild(card);
      });
    audio().speak(n
      ? `Sổ sưu tập! Con đã ghép được ${n} tiếng có nghĩa. Chạm vào hình mờ để thử thách nhé!`
      : 'Sổ sưu tập! Con chạm vào một hình mờ để ghép tiếng đó nhé!');
  }

  // ==================== ENTRY ====================
  function enter() {
    ph().enterBlend();
    if (!st.started) {
      st.started = true;
      renderModes();
      audio().speak('Cỗ máy ghép vần! Con kéo chữ vào máy nhé!');
      return;
    }
    renderModes();
    if (st.mode === 'challenge' && st.target && !st.solved) {
      audio().speakSequence(['Con ghép tiếng', st.target.text, 'nhé!'], { gap: 250, rate: 0.85 });
    }
  }

  ph().onResult = onResult;
  window.blendLab = { enter, selectMode, lookup, POOL, st };
})();
