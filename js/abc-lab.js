// Tab Chữ Cái: 5 chế độ. "Bảng chữ cái" là phần cũ trong phonics.js; 4 dạng mới luyện tự do
// (không tốn chìa khóa), đúng ngay lần đầu +1⭐.
(function () {
  const PD = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const L = window.LESSONS_DATA;
  const audio = () => window.kidsAudio;

  // ==================== HELPERS ====================
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const shuffle = a => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
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
  const stripTones = s => s.normalize('NFD').replace(/[̣̀́̃̉]/g, '').normalize('NFC');

  // 29 chữ cái tiếng Việt theo thứ tự
  const ALPHA = ['a', 'ă', 'â', 'b', 'c', 'd', 'đ', 'e', 'ê', 'g', 'h', 'i', 'k', 'l', 'm', 'n',
    'o', 'ô', 'ơ', 'p', 'q', 'r', 's', 't', 'u', 'ư', 'v', 'x', 'y'];
  const CONFUSABLE = [['a', 'ă', 'â'], ['o', 'ô', 'ơ'], ['u', 'ư'], ['e', 'ê'], ['b', 'd', 'đ', 'p', 'q'],
    ['m', 'n', 'u'], ['l', 't', 'i'], ['c', 'e', 'o'], ['g', 'q', 'y'], ['h', 'k'], ['s', 'x'], ['v', 'y']];
  const say = l => {
    const item = P.findLetter(l);
    return item ? P.phonemePart(item, false) : l;
  };
  const isVowel = l => PD.alphabet.vowel.some(x => x.letter === l);
  // n chữ khác nhau gồm đáp án + 1 chữ dễ nhầm (nếu có) + ngẫu nhiên
  function letterOptions(target, n = 3) {
    const group = (CONFUSABLE.find(g => g.includes(target)) || []).filter(x => x !== target);
    const close = shuffle(group).slice(0, 1);
    const far = shuffle(ALPHA.filter(x => x !== target && !close.includes(x)));
    return shuffle([target, ...[...close, ...far].slice(0, n - 1)]);
  }

  // ==================== TIẾN ĐỘ ====================
  const STORE_KEY = 'beHocVui.abcLab.v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { progress = {}; }
  const saveProgress = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ } };

  // ==================== DOM & STATE ====================
  const logAnswer = ok => window.parentLog && window.parentLog.answer(`Chữ cái: ${MODES[st.mode].label}`, ok, '');
  const section = $('sec-alphabet');
  const modesEl = $('abModes');
  const boardView = $('abBoardView');
  const labView = $('abLabView');
  const areaEl = $('abArea');
  const bannerEl = $('abBanner');
  const st = { mode: 'board', token: 0, solved: false, mistakes: 0, prompt: null, started: false };
  const sectionActive = () => section.classList.contains('active');

  function setPrompt(text, voice) {
    st.prompt = voice;
    bannerEl.textContent = text;
    if (sectionActive()) playPrompt();
  }
  function playPrompt() {
    if (st.prompt) audio().speakSequence(st.prompt, { gap: 250, rate: 0.85 });
  }
  function choiceRow(items, make) {
    const row = el('div', 'mt-choices');
    items.forEach(it => row.appendChild(make(it)));
    return row;
  }
  async function correct(node, parts = [], { next = true } = {}) {
    if (st.solved) return;
    st.solved = true;
    logAnswer(true);
    const token = st.token;
    if (node) node.classList.add('right');
    audio().playCelebration();
    if (window.spawnConfetti) window.spawnConfetti();
    if (st.mistakes === 0) {
      progress[st.mode] = (progress[st.mode] || 0) + 1;
      saveProgress();
      if (window.addStar) window.addStar(1);
    }
    const praise = pick(L.praises);
    bannerEl.textContent = `🎉 ${praise}`;
    await audio().speakSequence([praise, ...parts], { gap: 300, rate: 0.85 });
    await sleep(600);
    if (next && token === st.token) nextQuestion();
  }
  function wrong(node, parts) {
    if (st.solved) return;
    st.mistakes++;
    logAnswer(false);
    audio().playBoing();
    if (node) bounce(node, 'anim-shake');
    audio().speakSequence(parts || ['Chưa đúng rồi, con thử lại cùng cô nhé!'], { gap: 250, rate: 0.85 });
  }
  function letterCard(l, onTap, upper = false) {
    const b = el('button', `mt-card ab-letter ${isVowel(l) ? 'vowel' : 'consonant'}`, upper ? l.toUpperCase() : l);
    b.addEventListener('click', () => onTap(b));
    return b;
  }

  // ==================== ✍️ TẬP TÔ CHỮ ====================
  // Chữ mẫu vẽ trên canvas; bé tô bằng ngón tay. Đạt khi phủ ≥ 70% nét chữ và không tô ra ngoài quá nhiều.
  const TRACE_W = 440;
  const TRACE_H = 330;
  const TRACE_FONT = (size) => `700 ${size}px Comfortaa, "Segoe UI", sans-serif`;
  const PASS_COVER = 0.7;
  const MAX_OUTSIDE = 0.35;

  // Khối tô chữ dùng chung (tab Chữ Cái và bài học Tập viết trong lessons.js).
  // opts: isLocked() -> true khi không cho tô nữa; onPass(stage); onFail(stage, lời nhắc); extraButtons: [nút]
  function createTracer(letter, opts) {
    const wrap = el('div', 'ab-trace');
    const stage = el('div', 'ab-trace-stage');
    const guide = document.createElement('canvas');
    const ink = document.createElement('canvas');
    [guide, ink].forEach(c => { c.width = TRACE_W; c.height = TRACE_H; });
    guide.className = 'ab-trace-guide';
    ink.className = 'ab-trace-ink';
    stage.append(guide, ink);

    const side = el('div', 'ab-trace-side');
    const item = P.findLetter(letter);
    side.append(el('div', 'ab-trace-pic', item ? item.emoji : '✏️'), el('div', 'ab-trace-word', item ? item.word : ''));
    const btnDone = el('button', 'action-btn play', '✅ Xong');
    const btnClear = el('button', 'action-btn secondary', '🧽 Xóa');
    side.append(btnDone, btnClear, ...(opts.extraButtons || []));
    wrap.append(stage, side);

    // --- vẽ chữ mẫu: mặt nạ (để chấm) + hình hiển thị (nét mờ + viền chấm) ---
    const mask = document.createElement('canvas');
    mask.width = TRACE_W; mask.height = TRACE_H;
    const near = document.createElement('canvas');
    near.width = TRACE_W; near.height = TRACE_H;
    let maskData = null;
    let nearData = null;
    function drawGuide() {
      const size = 280;
      const g = guide.getContext('2d');
      g.clearRect(0, 0, TRACE_W, TRACE_H);
      // kẻ ô li như vở tập viết
      g.strokeStyle = '#FFE3D3';
      g.lineWidth = 2;
      g.setLineDash([]);
      for (let y = 40; y < TRACE_H; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(TRACE_W, y); g.stroke(); }
      [mask.getContext('2d'), near.getContext('2d'), g].forEach(c => {
        c.font = TRACE_FONT(size);
        c.textAlign = 'center';
        c.textBaseline = 'middle';
      });
      const x = TRACE_W / 2;
      const y = TRACE_H / 2 + 10;
      g.fillStyle = '#FFE8D6';
      g.fillText(letter, x, y);
      g.setLineDash([8, 9]);
      g.lineWidth = 3;
      g.strokeStyle = '#FF9F6E';
      g.strokeText(letter, x, y);
      const m = mask.getContext('2d');
      m.clearRect(0, 0, TRACE_W, TRACE_H);
      m.fillStyle = '#000';
      m.fillText(letter, x, y);
      maskData = m.getImageData(0, 0, TRACE_W, TRACE_H).data;
      // vùng cho phép (nét chữ nới rộng) để không phạt khi tô hơi lệch
      const n = near.getContext('2d');
      n.clearRect(0, 0, TRACE_W, TRACE_H);
      n.fillStyle = '#000';
      n.strokeStyle = '#000';
      n.lineWidth = 46;
      n.lineJoin = 'round';
      n.fillText(letter, x, y);
      n.strokeText(letter, x, y);
      nearData = n.getImageData(0, 0, TRACE_W, TRACE_H).data;
    }
    const fontReady = document.fonts && document.fonts.load ? document.fonts.load(TRACE_FONT(280), letter).catch(() => {}) : Promise.resolve();
    fontReady.then(() => { if (wrap.isConnected) drawGuide(); });
    drawGuide();

    // --- tô bằng ngón tay ---
    const ctx = ink.getContext('2d');
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FF7B54';
    let drawing = false;
    let last = null;
    let passed = false;
    const locked = () => passed || (opts.isLocked && opts.isLocked());
    const pos = e => {
      const r = ink.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (TRACE_W / r.width), y: (e.clientY - r.top) * (TRACE_H / r.height) };
    };
    ink.addEventListener('pointerdown', e => {
      if (locked()) return;
      e.preventDefault();
      try { ink.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      drawing = true;
      last = pos(e);
      ctx.beginPath();
      ctx.arc(last.x, last.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#FF7B54';
      ctx.fill();
    });
    ink.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    });
    const endStroke = () => {
      if (!drawing) return;
      drawing = false;
      check(false);
    };
    ink.addEventListener('pointerup', endStroke);
    ink.addEventListener('pointercancel', endStroke);

    function score() {
      const d = ctx.getImageData(0, 0, TRACE_W, TRACE_H).data;
      let guideN = 0, covered = 0, inkN = 0, outside = 0;
      for (let y = 0; y < TRACE_H; y += 4) {
        for (let x = 0; x < TRACE_W; x += 4) {
          const i = (y * TRACE_W + x) * 4 + 3;
          const g = maskData[i] > 0;
          const k = d[i] > 0;
          if (g) { guideN++; if (k) covered++; }
          if (k) { inkN++; if (!(nearData[i] > 0)) outside++; }
        }
      }
      return { cover: guideN ? covered / guideN : 0, outside: inkN ? outside / inkN : 0 };
    }

    function check(manual) {
      if (locked()) return;
      const s = score();
      if (s.cover >= PASS_COVER && s.outside <= MAX_OUTSIDE) {
        passed = true;
        stage.classList.add('done');
        opts.onPass(stage);
      } else if (manual) {
        opts.onFail(stage, s.outside > MAX_OUTSIDE ? 'Con tô hơi ra ngoài rồi. Con xóa đi và tô lại theo nét chấm nhé!' : 'Con tô kín cả chữ nhé!');
      } else if (s.outside > 0.5) {
        audio().speakSequence(['Con tô theo nét chấm nhé!'], { rate: 0.9 });
      }
    }

    btnDone.addEventListener('click', () => {
      audio().playPop();
      check(true);
    });
    btnClear.addEventListener('click', () => {
      audio().playPop();
      ctx.clearRect(0, 0, TRACE_W, TRACE_H);
    });
    return wrap;
  }

  function traceLetter(area) {
    // lần lượt theo thứ tự bảng chữ cái, nhớ chữ đang tập
    const idx = (progress.traceIdx || 0) % ALPHA.length;
    const letter = ALPHA[idx];
    const btnNext = el('button', 'action-btn', '⏭️ Chữ khác');
    btnNext.addEventListener('click', () => {
      audio().playPop();
      progress.traceIdx = idx + 1;
      saveProgress();
      nextQuestion();
    });
    area.appendChild(createTracer(letter, {
      isLocked: () => st.solved,
      onPass: () => {
        progress.traceIdx = idx + 1;
        saveProgress();
        correct(null, ['Con tô chữ', say(letter), 'đẹp quá!']);
      },
      onFail: (stage, msg) => wrong(stage, [msg]),
      extraButtons: [btnNext]
    }));
    setPrompt(`Bé dùng ngón tay tô theo chữ "${letter}" nhé! ✍️`, ['Con dùng ngón tay tô theo chữ', say(letter), 'nhé!']);
  }

  // ==================== CÁC DẠNG CÂU HỎI ====================
  const MODES = {
    board: { icon: '🔤', label: 'Bảng chữ cái' },
    trace: { icon: '✍️', label: 'Tập tô', render: traceLetter },

    // 🔠 Chữ hoa <-> chữ thường
    cases: {
      icon: '🔠', label: 'Hoa – thường',
      render(area) {
        const l = pick(ALPHA);
        const showUpper = Math.random() < 0.5;
        area.appendChild(el('div', `ab-hero-letter ${isVowel(l) ? 'vowel' : 'consonant'}`, showUpper ? l.toUpperCase() : l));
        area.appendChild(choiceRow(letterOptions(l), x => letterCard(x, c => {
          if (x === l) correct(c, [showUpper ? 'Chữ hoa' : 'Chữ thường', say(l), showUpper ? 'viết thường như thế này!' : 'viết hoa như thế này!']);
          else wrong(c, ['Đây là chữ', say(x), 'Con tìm chữ', say(l), 'nhé!']);
        }, !showUpper)));
        setPrompt(showUpper ? `Chữ "${l.toUpperCase()}" viết thường là chữ nào? 🔠` : `Chữ "${l}" viết hoa là chữ nào? 🔠`,
          [showUpper ? 'Chữ hoa này viết thường là chữ nào?' : 'Chữ này viết hoa là chữ nào?', say(l)]);
      }
    },

    // 🚂 Thứ tự chữ cái: đoàn tàu thiếu 1 toa
    order: {
      icon: '🚂', label: 'Thứ tự chữ',
      render(area) {
        const start = randInt(0, ALPHA.length - 5);
        const win = ALPHA.slice(start, start + 5);
        const miss = randInt(1, 4);
        const ans = win[miss];
        const train = el('div', 'ab-train');
        train.appendChild(el('span', 'ab-engine', '🚂'));
        let slot;
        win.forEach((l, i) => {
          const car = el('div', `ab-car ${i === miss ? 'blank' : ''}`, i === miss ? '?' : l);
          if (i === miss) slot = car;
          else {
            car.addEventListener('click', () => { audio().playPop(); audio().speakSequence([say(l)], { rate: 0.9 }); });
          }
          train.appendChild(car);
        });
        area.appendChild(train);
        // phương án nhiễu: chữ dễ nhầm / chữ khác ngoài đoàn tàu
        const outside = ALPHA.filter(x => !win.includes(x));
        const close = shuffle((CONFUSABLE.find(g => g.includes(ans)) || []).filter(x => outside.includes(x)));
        const opts = shuffle([ans, ...[...new Set([...close.slice(0, 1), ...shuffle(outside)])].slice(0, 2)]);
        area.appendChild(choiceRow(opts, x => letterCard(x, c => {
          if (x === ans) {
            slot.textContent = ans;
            slot.classList.remove('blank');
            slot.classList.add('solved');
            correct(c, win.map(say));
          } else {
            wrong(c, ['Chưa đúng rồi! Sau chữ', say(win[miss - 1]), 'là chữ nào nhỉ? Con đọc lại đoàn tàu cùng cô nhé!']);
          }
        })));
        setPrompt(`Toa tàu nào bị thiếu? Sau chữ "${win[miss - 1]}" là chữ gì? 🚂`, ['Toa tàu nào bị thiếu? Sau chữ', say(win[miss - 1]), 'là chữ gì?']);
      }
    },

    // 🔍 Tìm chữ trong từ
    find: {
      icon: '🔍', label: 'Tìm chữ',
      render(area) {
        const bank = (window.spellLab && window.spellLab.BANK) || [];
        const w = pick(bank);
        const chars = [...w.text];
        const bases = chars.map(stripTones);
        const target = pick([...new Set(bases)].filter(x => ALPHA.includes(x)));
        area.appendChild(el('div', 'ab-find-pic', w.emoji));
        const row = el('div', 'ab-find-word');
        let left = bases.filter(b => b === target).length;
        chars.forEach((ch, i) => {
          const b = el('button', 'ab-find-char', ch);
          b.addEventListener('click', () => {
            if (st.solved || b.classList.contains('found')) return;
            if (bases[i] === target) {
              b.classList.add('found');
              audio().playPop();
              left--;
              if (left === 0) correct(null, ['Chữ', say(target), 'trong tiếng', w.text]);
            } else {
              wrong(b, ['Đây là chữ', say(bases[i]), 'Con tìm chữ', say(target), 'nhé!']);
            }
          });
          row.appendChild(b);
        });
        area.appendChild(row);
        setPrompt(`Bé chạm vào chữ "${target}" trong tiếng "${w.text}" nhé! 🔍`, ['Con chạm vào chữ', say(target), 'trong tiếng', w.text]);
      }
    }
  };

  // ==================== ĐIỀU KHIỂN ====================
  function renderModes() {
    modesEl.innerHTML = '';
    Object.entries(MODES).forEach(([key, m]) => {
      const b = el('button', `mt-mode${key === st.mode ? ' active' : ''}`);
      b.append(el('span', 'mt-mode-icon', m.icon), el('span', 'mt-mode-label', m.label));
      b.addEventListener('click', () => {
        audio().playPop();
        selectMode(key);
      });
      modesEl.appendChild(b);
    });
  }

  function selectMode(key) {
    st.mode = key;
    renderModes();
    boardView.classList.toggle('is-hidden', key !== 'board');
    labView.classList.toggle('is-hidden', key === 'board');
    if (key === 'board') {
      st.token++;
      audio().stopAll();
      window.phonics.enterAlphabet();
      audio().speak('Bảng chữ cái! Con chạm vào chữ để nghe cô đọc nhé!');
      return;
    }
    nextQuestion();
  }

  function nextQuestion() {
    st.token++;
    st.solved = false;
    st.mistakes = 0;
    audio().stopAll();
    areaEl.innerHTML = '';
    areaEl.className = `mt-area ab-area mode-${st.mode}`;
    MODES[st.mode].render(areaEl);
  }

  $('abReplay').addEventListener('click', () => {
    audio().playPop();
    playPrompt();
  });

  function enter() {
    window.phonics.enterAlphabet();
    if (!st.started) {
      st.started = true;
      renderModes();
      audio().speak('Bảng chữ cái! Con chạm vào chữ để nghe cô đọc nhé!');
      return;
    }
    if (st.mode !== 'board') playPrompt();
  }

  window.abcLab = { enter, selectMode, st, MODES, ALPHA, progress, createTracer };
})();
