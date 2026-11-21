// Tab Làm Toán: "Phòng Luyện Toán" với 6 dạng bài. Luyện tự do (không tốn chìa khóa);
// trả lời đúng ngay lần đầu được +1⭐. Một số dạng tự lên cấp khi bé làm đúng đủ nhiều câu.
(function () {
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
  // Đọc số 0–20 bằng chữ: 15 → "mười lăm", 20 → "hai mươi"
  function vnNum(n) {
    if (n <= 10) return L.numberWords[n];
    if (n < 20) return `mười ${n === 15 ? 'lăm' : L.numberWords[n - 10]}`;
    if (n === 20) return 'hai mươi';
    return String(n);
  }
  // n số khác nhau trong [lo, hi] có chứa answer, ưu tiên số gần đáp án
  function numChoices(answer, lo, hi, n = 3) {
    const pool = [];
    for (let v = lo; v <= hi; v++) if (v !== answer) pool.push(v);
    pool.sort((x, y) => Math.abs(x - answer) - Math.abs(y - answer) || Math.random() - 0.5);
    return shuffle([answer, ...shuffle(pool.slice(0, n + 1)).slice(0, n - 1)]);
  }

  // ==================== TIẾN ĐỘ (số câu đúng ngay lần đầu mỗi dạng) ====================
  const STORE_KEY = 'beHocVui.mathLab.v1';
  const LEVEL_UP_AT = 8; // đúng 8 câu thì lên cấp 2 (phạm vi lớn hơn)
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { progress = {}; }
  const saveProgress = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ } };
  const level = mode => ((progress[mode] || 0) >= LEVEL_UP_AT ? 2 : 1);

  // ==================== DOM & STATE ====================
  const logAnswer = ok => window.parentLog && window.parentLog.answer(`Làm toán: ${MODES[st.mode].label}`, ok, '');
  const section = $('sec-math');
  const modesEl = $('mtModes');
  const areaEl = $('mtArea');
  const bannerEl = $('mtBanner');
  const st = { mode: null, token: 0, solved: false, mistakes: 0, prompt: null, play: null };
  const sectionActive = () => section.classList.contains('active');

  function setPrompt(text, voice, play) {
    st.prompt = voice;
    st.play = play || null;
    bannerEl.textContent = text;
    if (sectionActive()) playPrompt();
  }
  function playPrompt() {
    if (st.play) st.play();
    else if (st.prompt) audio().speakSequence(st.prompt, { gap: 160, rate: 0.88 });
  }

  function choiceRow(items, make) {
    const row = el('div', 'mt-choices');
    items.forEach(it => row.appendChild(make(it)));
    return row;
  }
  function numCard(v, onTap) {
    const b = el('button', 'mt-card mt-num', String(v));
    b.addEventListener('click', () => onTap(b));
    return b;
  }

  async function correct(node, parts = []) {
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
      renderModes();
    }
    const praise = pick(L.praises);
    bannerEl.textContent = `🎉 ${praise}`;
    await audio().speakSequence([praise, ...parts], { gap: 200, rate: 0.88 });
    await sleep(700);
    if (token === st.token) nextQuestion();
  }

  function wrong(node, parts) {
    if (st.solved) return;
    st.mistakes++;
    logAnswer(false);
    audio().playBoing();
    if (node) bounce(node, 'anim-shake');
    audio().speakSequence(parts || ['Chưa đúng rồi, con thử lại cùng cô nhé!'], { gap: 160, rate: 0.88 });
  }

  // Ô đồ vật bé chạm để đếm (số thứ tự hiện trên từng hình)
  function countingGroup(count, emoji, { goneFrom = Infinity, counter } = {}) {
    const box = el('div', 'mt-group');
    if (count > 5) box.classList.add('many');
    for (let i = 0; i < count; i++) {
      const it = el('button', 'mt-item', emoji);
      if (i >= goneFrom) {
        it.classList.add('gone');
        it.disabled = true;
      } else {
        it.addEventListener('click', () => {
          if (it.dataset.num) {
            audio().speakSequence([vnNum(+it.dataset.num)], { rate: 0.9 });
            return;
          }
          counter.n++;
          it.dataset.num = counter.n;
          it.appendChild(el('span', 'mt-badge', String(counter.n)));
          audio().playPop();
          audio().speakSequence([vnNum(counter.n)], { rate: 0.9 });
        });
      }
      box.appendChild(it);
    }
    return box;
  }

  // ==================== 6 DẠNG BÀI ====================
  const MODES = {
    // 1. Cộng trừ bằng hình: chạm để đếm, phép trừ gạch bớt hình
    calc: {
      icon: '➕', label: 'Cộng trừ',
      render(area) {
        const max = level('calc') === 1 ? 5 : 10;
        const isAdd = Math.random() < 0.6;
        let a, b;
        if (isAdd) { a = randInt(1, max - 1); b = randInt(1, max - a); } else { a = randInt(2, max); b = randInt(1, a - 1); }
        const ans = isAdd ? a + b : a - b;
        const item = pick(L.counters);
        const counter = { n: 0 };

        const row = el('div', 'mt-calc-row');
        if (isAdd) {
          row.append(countingGroup(a, item.emoji, { counter }), el('div', 'mt-sym', '+'), countingGroup(b, item.emoji, { counter }));
        } else {
          row.appendChild(countingGroup(a, item.emoji, { goneFrom: a - b, counter }));
        }
        area.appendChild(row);

        const formula = el('div', 'mt-formula');
        const slot = el('span', 'mt-slot', '?');
        formula.append(el('span', '', `${a} ${isAdd ? '+' : '−'} ${b} =`), slot);
        area.appendChild(formula);

        area.appendChild(choiceRow(numChoices(ans, 0, max, 3), v => numCard(v, c => {
          if (v === ans) {
            slot.textContent = String(ans);
            slot.classList.add('solved');
            correct(c, [vnNum(a), isAdd ? 'cộng' : 'trừ', vnNum(b), 'bằng', vnNum(ans)]);
          } else {
            wrong(c, [isAdd ? 'Chưa đúng rồi, con chạm vào từng hình để đếm tất cả nhé!' : 'Chưa đúng rồi, con đếm những hình chưa bị gạch nhé!']);
          }
        })));

        const name = item.name;
        if (isAdd) {
          setPrompt(`Có ${a} ${name}, thêm ${b} ${name}. Có tất cả mấy ${name}?`,
            ['Có', vnNum(a), name, 'thêm', vnNum(b), name, 'Có tất cả mấy', name, '?']);
        } else {
          setPrompt(`Có ${a} ${name}, bớt đi ${b} ${name}. Còn lại mấy ${name}?`,
            ['Có', vnNum(a), name, 'bớt đi', vnNum(b), name, 'Còn lại mấy', name, '?']);
        }
      }
    },

    // 2. Số liền trước / liền sau trên dãy số
    neighbor: {
      icon: '🔢', label: 'Trước – sau',
      render(area) {
        const max = level('neighbor') === 1 ? 10 : 20;
        const after = Math.random() < 0.5;
        const n = after ? randInt(0, max - 1) : randInt(1, max);
        const ans = after ? n + 1 : n - 1;
        const start = Math.max(0, Math.min(ans - 3, max - 6));
        const line = el('div', 'mt-line');
        let slot;
        for (let v = start; v <= Math.min(max, start + 6); v++) {
          const cell = el('div', 'mt-line-cell', v === ans ? '?' : String(v));
          if (v === n) cell.classList.add('given');
          if (v === ans) { cell.classList.add('blank'); slot = cell; }
          line.appendChild(cell);
        }
        area.appendChild(line);
        area.appendChild(el('div', 'mt-line-hint', after ? `Số liền sau số ${n} 👉 ?` : `? 👈 Số liền trước số ${n}`));

        area.appendChild(choiceRow(numChoices(ans, 0, max, 3), v => numCard(v, c => {
          if (v === ans) {
            slot.textContent = String(ans);
            slot.classList.add('solved');
            correct(c, [after ? 'Số liền sau của số' : 'Số liền trước của số', vnNum(n), 'là số', vnNum(ans)]);
          } else {
            wrong(c, [`Chưa đúng rồi! Con đếm ${after ? 'tiếp' : 'lùi'} từ số`, vnNum(n), 'nhé!']);
          }
        })));
        setPrompt(after ? `Số liền sau của ${n} là số mấy?` : `Số liền trước của ${n} là số mấy?`,
          [after ? 'Số liền sau của số' : 'Số liền trước của số', vnNum(n), 'là số mấy?']);
      }
    },

    // 3. Toán có lời văn: cô kể chuyện, hình động minh họa
    story: {
      icon: '📖', label: 'Lời văn',
      render(area) {
        const STORIES = [
          { emoji: '🐦', name: 'con chim', place: 'trên cành cây', come: 'bay tới', go: 'bay đi', scene: '🌳' },
          { emoji: '🐟', name: 'con cá', place: 'trong hồ', come: 'bơi tới', go: 'bơi đi', scene: '🌊' },
          { emoji: '🐥', name: 'chú gà con', place: 'trên sân', come: 'chạy tới', go: 'chạy vào chuồng', scene: '🌾' },
          { emoji: '🦋', name: 'con bướm', place: 'trong vườn hoa', come: 'bay tới', go: 'bay đi', scene: '🌷' },
          { emoji: '🐸', name: 'con ếch', place: 'trên lá sen', come: 'nhảy tới', go: 'nhảy xuống nước', scene: '🪷' },
          { emoji: '🦆', name: 'chú vịt', place: 'dưới ao', come: 'bơi tới', go: 'lên bờ', scene: '💧' }
        ];
        const s = pick(STORIES);
        const max = level('story') === 1 ? 5 : 10;
        const isAdd = Math.random() < 0.5;
        let a, b;
        if (isAdd) { a = randInt(1, max - 1); b = randInt(1, max - a); } else { a = randInt(2, max); b = randInt(1, a - 1); }
        const ans = isAdd ? a + b : a - b;

        const scene = el('div', 'mt-scene');
        scene.appendChild(el('div', 'mt-scene-bg', s.scene));
        const crowd = el('div', 'mt-crowd');
        const items = [];
        for (let i = 0; i < a; i++) { const it = el('span', 'mt-actor', s.emoji); items.push(it); crowd.appendChild(it); }
        const comers = [];
        if (isAdd) for (let i = 0; i < b; i++) { const it = el('span', 'mt-actor waiting', s.emoji); comers.push(it); crowd.appendChild(it); }
        scene.appendChild(crowd);
        area.appendChild(scene);

        const formula = el('div', 'mt-formula is-hidden-soft');
        const slot = el('span', 'mt-slot', '?');
        formula.append(el('span', '', `${a} ${isAdd ? '+' : '−'} ${b} =`), slot);
        area.appendChild(formula);

        let acted = false;
        const act = () => {
          if (acted) return;
          acted = true;
          if (isAdd) comers.forEach((it, i) => setTimeout(() => it.classList.remove('waiting'), i * 180));
          else items.slice(a - b).forEach((it, i) => setTimeout(() => it.classList.add('leaving'), i * 180));
          setTimeout(() => formula.classList.remove('is-hidden-soft'), 300);
        };

        const s1 = `Có ${vnNum(a)} ${s.name} ${s.place}.`;
        const s2 = isAdd ? `Có thêm ${vnNum(b)} ${s.name} ${s.come}.` : `${vnNum(b)} ${s.name} ${s.go}.`;
        const q = isAdd ? `Hỏi có tất cả mấy ${s.name}?` : `Hỏi còn lại mấy ${s.name}?`;
        const token = st.token;

        area.appendChild(choiceRow(numChoices(ans, 0, max, 3), v => numCard(v, c => {
          act();
          if (v === ans) {
            slot.textContent = String(ans);
            slot.classList.add('solved');
            correct(c, [vnNum(a), isAdd ? 'cộng' : 'trừ', vnNum(b), 'bằng', vnNum(ans)]);
          } else {
            wrong(c, [isAdd ? `Chưa đúng rồi! Con đếm tất cả các ${s.name} nhé!` : `Chưa đúng rồi! Con đếm các ${s.name} còn ở lại nhé!`]);
          }
        })));

        const text = `Có ${a} ${s.name} ${s.place}. ${isAdd ? `Có thêm ${b} ${s.name} ${s.come}.` : `${b} ${s.name} ${s.go}.`} ${q}`;
        setPrompt(text, [s1, s2, q], () => {
          audio().speakSequence([s1, s2, q], {
            gap: 500, rate: 0.85,
            onStep: i => { if (i === 2 && token === st.token) act(); }
          });
        });
      }
    },

    // 4. So sánh dài - ngắn (bút chì) và cao - thấp (tháp khối)
    measure: {
      icon: '📏', label: 'Dài – cao',
      render(area) {
        const COLORS = ['#FF6B6B', '#4DABF7', '#51CF66', '#FFD43B', '#B197FC', '#FF922B'];
        const isLong = Math.random() < 0.5;
        const askMax = Math.random() < 0.5;
        const sizes = isLong ? shuffle([35, 50, 65, 80, 95]).slice(0, 3) : shuffle([2, 3, 4, 5, 6, 7]).slice(0, 3);
        const target = askMax ? Math.max(...sizes) : Math.min(...sizes);
        const colors = shuffle(COLORS);
        const word = isLong ? (askMax ? 'dài nhất' : 'ngắn nhất') : (askMax ? 'cao nhất' : 'thấp nhất');
        const thing = isLong ? 'Bút chì' : 'Tháp';

        const wrap = el('div', isLong ? 'mt-pencils' : 'mt-towers');
        sizes.forEach((size, i) => {
          const b = el('button', isLong ? 'mt-pencil-row' : 'mt-tower');
          if (isLong) {
            const p = el('span', 'mt-pencil');
            p.style.width = `${size}%`;
            p.style.setProperty('--c', colors[i]);
            b.appendChild(p);
          } else {
            for (let k = 0; k < size; k++) {
              const blk = el('span', 'mt-block');
              blk.style.background = colors[i];
              b.appendChild(blk);
            }
          }
          b.addEventListener('click', () => {
            if (size === target) correct(b, [`${thing} này ${word}!`]);
            else wrong(b, [`Chưa đúng rồi! Con so sánh thật kỹ, tìm ${thing.toLowerCase()} ${word} nhé!`]);
          });
          wrap.appendChild(b);
        });
        area.appendChild(wrap);
        setPrompt(`${thing} nào ${word}? Bé chạm vào nhé! ${isLong ? '✏️' : '🧱'}`, [`${thing} nào ${word}? Con chạm vào nhé!`]);
      }
    },

    // 5. Xem đồng hồ giờ đúng
    clock: {
      icon: '🕐', label: 'Đồng hồ',
      render(area) {
        const h = randInt(1, 12);
        const opts = numChoices(h, 1, 12, 3);
        const hint = ['Con nhìn kim ngắn chỉ vào số mấy nhé! Kim dài chỉ số mười hai là giờ đúng.'];
        if (Math.random() < 0.5) {
          // Nhìn 1 đồng hồ -> chọn giờ
          area.appendChild(clockSvg(h, 'big'));
          area.appendChild(choiceRow(opts, v => {
            const b = el('button', 'mt-card mt-word', `${v} giờ`);
            b.addEventListener('click', () => {
              if (v === h) correct(b, [`${vnNum(h)} giờ`]);
              else wrong(b, hint);
            });
            return b;
          }));
          setPrompt('Đồng hồ chỉ mấy giờ? 🕐', ['Đồng hồ chỉ mấy giờ?']);
        } else {
          // Nghe giờ -> chọn đồng hồ đúng
          area.appendChild(choiceRow(opts, v => {
            const b = el('button', 'mt-card mt-clock-card');
            b.appendChild(clockSvg(v, 'small'));
            b.addEventListener('click', () => {
              if (v === h) correct(b, [`Đồng hồ này chỉ ${vnNum(h)} giờ`]);
              else wrong(b, [`Đồng hồ này chỉ ${vnNum(v)} giờ.`, ...hint]);
            });
            return b;
          }));
          setPrompt(`Đồng hồ nào chỉ ${h} giờ? 🕐`, [`Đồng hồ nào chỉ ${vnNum(h)} giờ?`]);
        }
      }
    },

    // 6. Vị trí: trên, dưới, trái, phải
    position: {
      icon: '🧭', label: 'Vị trí',
      render(area) {
        const OBJECTS = [{ emoji: '📦', name: 'cái hộp' }, { emoji: '🏠', name: 'ngôi nhà' }, { emoji: '🌳', name: 'cái cây' }, { emoji: '🎁', name: 'hộp quà' }];
        const ANIMALS = [
          { emoji: '🐱', name: 'bạn mèo' }, { emoji: '🐶', name: 'chú cún' }, { emoji: '🐰', name: 'bạn thỏ' },
          { emoji: '🐥', name: 'chú gà con' }, { emoji: '🐻', name: 'bạn gấu' }, { emoji: '🐸', name: 'bạn ếch' }
        ];
        const POS = [
          { key: 'top', word: 'phía trên' }, { key: 'bottom', word: 'phía dưới' },
          { key: 'left', word: 'bên trái' }, { key: 'right', word: 'bên phải' }
        ];
        const obj = pick(OBJECTS);
        const animals = shuffle(ANIMALS).slice(0, 4);
        const target = pick(POS);
        const grid = el('div', 'mt-pos-grid');
        const center = el('div', 'mt-pos-center', obj.emoji);
        grid.appendChild(center);
        POS.forEach((p, i) => {
          const a = animals[i];
          const b = el('button', `mt-pos-animal pos-${p.key}`, a.emoji);
          b.addEventListener('click', () => {
            if (p === target) correct(b, [`${a.name} ở ${p.word} ${obj.name}`]);
            else wrong(b, [`Đây là ${a.name}, ở ${p.word} ${obj.name}. Con tìm bạn ở ${target.word} nhé!`]);
          });
          grid.appendChild(b);
        });
        area.appendChild(grid);
        setPrompt(`Bạn nào ở ${target.word} ${obj.name}? 🧭`, [`Bạn nào ở ${target.word} ${obj.name}?`]);
      }
    }
  };

  // Đồng hồ SVG: kim ngắn chỉ giờ h, kim dài chỉ số 12
  function clockSvg(h, size) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', `mt-clock ${size}`);
    let html = '<circle cx="100" cy="100" r="92" fill="#FFF" stroke="#FF7B54" stroke-width="8"/>';
    for (let i = 1; i <= 12; i++) {
      const ang = (i * 30 - 90) * Math.PI / 180;
      html += `<text x="${100 + Math.cos(ang) * 70}" y="${100 + Math.sin(ang) * 70}" class="mt-clock-num">${i}</text>`;
    }
    const ha = (h % 12) * 30;
    html += `<line x1="100" y1="100" x2="100" y2="28" stroke="#4DABF7" stroke-width="6" stroke-linecap="round"/>`;
    html += `<line x1="100" y1="100" x2="100" y2="52" stroke="#E64A19" stroke-width="10" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>`;
    html += '<circle cx="100" cy="100" r="8" fill="#5D4037"/>';
    svg.innerHTML = html;
    return svg;
  }

  // ==================== ĐIỀU KHIỂN ====================
  function renderModes() {
    modesEl.innerHTML = '';
    Object.entries(MODES).forEach(([key, m]) => {
      const b = el('button', `mt-mode${key === st.mode ? ' active' : ''}`);
      b.append(el('span', 'mt-mode-icon', m.icon), el('span', 'mt-mode-label', m.label));
      const lv = level(key);
      if (key in LEVELED && lv === 2) b.appendChild(el('span', 'mt-mode-lv', 'Cấp 2'));
      b.addEventListener('click', () => {
        audio().playPop();
        selectMode(key);
      });
      modesEl.appendChild(b);
    });
  }
  const LEVELED = { calc: 1, neighbor: 1, story: 1 };

  function selectMode(key) {
    st.mode = key;
    renderModes();
    nextQuestion();
  }

  function nextQuestion() {
    st.token++;
    st.solved = false;
    st.mistakes = 0;
    audio().stopAll();
    areaEl.innerHTML = '';
    areaEl.className = `mt-area mode-${st.mode}`;
    MODES[st.mode].render(areaEl);
  }

  $('mtReplay').addEventListener('click', () => {
    audio().playPop();
    playPrompt();
  });

  function enter() {
    if (!st.mode) {
      st.mode = 'calc';
      renderModes();
      nextQuestion();
      return;
    }
    playPrompt();
  }

  window.mathLab = { enter, selectMode, st, MODES, vnNum, progress, clockSvg };
})();
