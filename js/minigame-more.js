// Ba mini-game còn lại theo tientieuhoc.md: Giải Cứu Thú Cưng, Siêu Thị Của Bé, Tô Màu Kỳ Diệu.
// Mỗi lượt tốn 1 chìa khóa (minigame.js trừ khi bé chạm thẻ trò chơi) và giới hạn 2 phút.
// Đăng ký vào khu trò chơi qua window.minigame.register(); kết quả dùng màn hình chung showResult().
(function () {
  const PD = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const L = window.LESSONS_DATA;
  const MG = window.minigame;
  const audio = () => window.kidsAudio;

  const GAME_SECONDS = 120;

  // ==================== HELPERS ====================
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
  const numWord = n => L.numberWords[n] || String(n);
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
  function celebrate() {
    audio().playCelebration();
    if (window.spawnConfetti) window.spawnConfetti();
  }

  // Đồng hồ 2 phút, tạm dừng được khi bé rời tab
  function makeTimer(fillEl, onEnd) {
    const t = { left: 0, running: false, paused: false, id: 0, last: 0 };
    function draw() {
      fillEl.style.width = `${Math.max(0, t.left / GAME_SECONDS) * 100}%`;
      fillEl.parentElement.classList.toggle('low', t.left <= 15);
    }
    function tick() {
      if (!t.running || t.paused) return;
      const now = performance.now();
      t.left -= Math.min(1, (now - t.last) / 1000);
      t.last = now;
      draw();
      if (t.left <= 0) {
        t.stop();
        onEnd();
      }
    }
    t.start = () => {
      t.left = GAME_SECONDS;
      t.running = true;
      t.paused = !MG.sectionActive();
      t.last = performance.now();
      clearInterval(t.id);
      t.id = setInterval(tick, 250);
      draw();
    };
    t.pause = () => { t.paused = true; };
    t.resume = () => { t.paused = false; t.last = performance.now(); };
    t.stop = () => { t.running = false; clearInterval(t.id); };
    t.active = () => t.running && !t.paused;
    return t;
  }

  // Gắn nút 🏠 và đăng ký trò chơi
  function setupGame({ cardId, stopId, timer, start, end, resume }) {
    $(stopId).addEventListener('click', () => {
      audio().playPop();
      if (timer.running) end();
      else MG.showView('lobby');
    });
    MG.register({
      card: $(cardId),
      start,
      pause: () => timer.pause(),
      resume: () => { timer.resume(); if (resume) resume(); },
      isRunning: () => timer.running,
      stop: end
    });
  }

  // ======================================================================
  // 1. GIẢI CỨU THÚ CƯNG: bé nhảy qua sông bằng các phiến đá mang chữ / số đúng
  // ======================================================================
  const RS_STEPS = 4;          // số cột đá phải nhảy qua mỗi lần
  const RS_STONES = 3;         // số phiến đá mỗi cột
  const RS_PETS = [
    { emoji: '🐶', name: 'chú cún' }, { emoji: '🐱', name: 'bạn mèo' }, { emoji: '🐰', name: 'bạn thỏ' },
    { emoji: '🐥', name: 'chú gà con' }, { emoji: '🐼', name: 'bạn gấu trúc' }, { emoji: '🦊', name: 'bạn cáo' },
    { emoji: '🐭', name: 'bạn chuột' }, { emoji: '🐸', name: 'bạn ếch' }
  ];
  const RS_LETTERS = [...PD.alphabet.vowel, ...PD.alphabet.consonant].filter(x => x.letter !== 'y'); // y đọc giống i
  const RS_CONFUSABLE = [['a', 'ă', 'â'], ['o', 'ô', 'ơ'], ['u', 'ư'], ['e', 'ê'], ['b', 'd', 'đ', 'p'], ['m', 'n'], ['l', 't'], ['c', 'k']];

  const rs = {
    token: 0, score: 0, crossing: 0, step: 0, kind: 'letter', pet: null,
    columns: [], lock: false, lastWrongVoice: 0
  };
  const rsField = $('rsField');
  const rsKind = $('rsKind');
  const rsTarget = $('rsTarget');
  const rsScore = $('rsScore');
  const rsTimer = makeTimer($('rsTimerFill'), () => rsEnd());

  function rsValueVoice(kind, value) {
    return kind === 'letter' ? P.phonemePart(P.findLetter(value), false) : numWord(value);
  }
  function rsTargetVoice() {
    const v = rs.columns[rs.step].target;
    return [rs.kind === 'letter' ? 'Con tìm chữ' : 'Con tìm số', rsValueVoice(rs.kind, v)];
  }
  function rsAnnounce(prefix = []) {
    if (rs.step >= RS_STEPS) return;
    audio().speakSequence([...prefix, ...rsTargetVoice()], { gap: 150, rate: 0.9 });
  }

  function rsColumnValues(kind, target) {
    const vals = [target];
    if (kind === 'letter') {
      const group = RS_CONFUSABLE.find(g => g.includes(target));
      const close = group ? shuffle(group.filter(x => x !== target && P.findLetter(x))) : [];
      if (close.length) vals.push(close[0]);
      while (vals.length < RS_STONES) {
        const l = pick(RS_LETTERS).letter;
        if (!vals.includes(l)) vals.push(l);
      }
    } else {
      while (vals.length < RS_STONES) {
        const v = Math.random() < 0.5 ? target + pick([-1, 1]) : randInt(1, 10);
        if (v >= 1 && v <= 10 && !vals.includes(v)) vals.push(v);
      }
    }
    return shuffle(vals);
  }

  function rsMoveHero(node, dy = -34, dx = 0) {
    const hero = rsField.querySelector('.rs-hero');
    const f = rsField.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const x = r.left - f.left + r.width / 2 - hero.offsetWidth / 2 + dx;
    const y = r.top - f.top + r.height / 2 - hero.offsetHeight / 2 + dy;
    hero.style.transform = `translate(${x}px, ${y}px)`;
  }

  function rsNewCrossing() {
    rs.crossing++;
    rs.step = 0;
    rs.lock = false;
    rs.kind = rs.crossing % 2 === 1 ? 'letter' : 'number';
    let pet;
    do { pet = pick(RS_PETS); } while (rs.pet && pet === rs.pet);
    rs.pet = pet;

    const targets = [];
    while (targets.length < RS_STEPS) {
      const v = rs.kind === 'letter' ? pick(RS_LETTERS).letter : randInt(1, 10);
      if (!targets.includes(v)) targets.push(v);
    }
    rs.columns = targets.map(t => ({ target: t, values: rsColumnValues(rs.kind, t), node: null }));

    rsField.innerHTML = '';
    const left = el('div', 'rs-bank left');
    const start = el('div', 'rs-start', '🏕️');
    left.appendChild(start);
    const river = el('div', 'rs-river');
    rs.columns.forEach((col, ci) => {
      const c = el('div', 'rs-col');
      col.values.forEach(v => {
        const stone = el('button', 'rs-stone', String(v));
        stone.addEventListener('click', () => rsTap(ci, v, stone));
        c.appendChild(stone);
      });
      col.node = c;
      river.appendChild(c);
    });
    const right = el('div', 'rs-bank right');
    const petBox = el('div', 'rs-pet');
    petBox.append(el('span', 'rs-pet-emoji', pet.emoji), el('span', 'rs-pet-cry', 'Cứu tớ với!'));
    right.appendChild(petBox);
    const hero = el('div', 'rs-hero', '🧒');
    rsField.append(left, river, right, hero);
    rsMarkColumns();
    rsKind.textContent = rs.kind === 'letter' ? 'Tìm chữ' : 'Tìm số';
    rsShowTarget();
    // đặt bé đứng ở bờ trái (không hiệu ứng)
    hero.style.transition = 'none';
    rsMoveHero(start, -10);
    void hero.offsetWidth;
    hero.style.transition = '';
    rsAnnounce([`Giúp ${pet.name} qua sông nhé!`]);
  }

  function rsShowTarget() {
    rsTarget.textContent = rs.step < RS_STEPS ? rs.columns[rs.step].target : rs.pet.emoji;
    bounce(rsTarget.parentElement, 'anim-pop', 500);
  }

  function rsMarkColumns() {
    rs.columns.forEach((col, i) => {
      col.node.classList.toggle('active', i === rs.step);
      col.node.classList.toggle('done', i < rs.step);
    });
  }

  function rsTap(ci, value, stone) {
    if (!rsTimer.active() || rs.lock || ci !== rs.step) return;
    if (value === rs.columns[ci].target) {
      rs.lock = true;
      stone.classList.add('ok');
      audio().playPop();
      rsMoveHero(stone);
      rs.step++;
      rsMarkColumns();
      const token = rs.token;
      if (rs.step < RS_STEPS) {
        rsShowTarget();
        setTimeout(() => {
          if (token !== rs.token) return;
          rs.lock = false;
          rsAnnounce([rsValueVoice(rs.kind, value)]);
        }, 450);
        return;
      }
      // tới bờ bên kia: cứu được thú cưng
      setTimeout(() => {
        if (token !== rs.token) return;
        const petBox = rsField.querySelector('.rs-pet');
        rsMoveHero(petBox, petBox.offsetHeight / 2 + 40); // đứng ngay dưới bạn thú
        petBox.classList.add('saved');
        petBox.querySelector('.rs-pet-cry').textContent = 'Cảm ơn bạn!';
        rs.score++;
        rsScore.textContent = rs.score;
        celebrate();
        audio().speakSequence([`Con đã cứu được ${rs.pet.name}! Con giỏi quá!`], { rate: 0.9 }).then(() => {
          setTimeout(() => { if (token === rs.token && rsTimer.running) rsNewCrossing(); }, 300);
        });
      }, 500);
    } else {
      audio().playBoing();
      bounce(stone, 'sink', 700);
      const now = performance.now();
      if (now - rs.lastWrongVoice > 2000) {
        rs.lastWrongVoice = now;
        audio().speakSequence(['Ối, đá này chìm rồi! Đây là', rsValueVoice(rs.kind, value), ...rsTargetVoice()], { gap: 150, rate: 0.95 });
      }
    }
  }

  function rsStart() {
    rs.token++;
    rs.score = 0;
    rs.crossing = 0;
    rs.pet = null;
    rsScore.textContent = '0';
    MG.showView('rescue');
    rsTimer.start();
    rsNewCrossing();
  }

  function rsEnd() {
    rsTimer.stop();
    rs.token++;
    MG.showResult({ score: rs.score, bestKey: 'beHocVui.rescueBest.v1', icon: '🐾', unit: 'bạn thú', verb: 'Hết giờ rồi! Con cứu được' });
  }

  $('rsReplay').addEventListener('click', () => {
    audio().playPop();
    if (rsTimer.active()) rsAnnounce();
  });
  setupGame({ cardId: 'mgCardRescue', stopId: 'rsStop', timer: rsTimer, start: rsStart, end: rsEnd, resume: () => rsAnnounce() });

  // ======================================================================
  // 2. SIÊU THỊ CỦA BÉ: chạm hàng trên kệ để bỏ vào giỏ đúng số lượng, rồi thanh toán
  // ======================================================================
  const MK_PRODUCTS = [
    { emoji: '🍎', name: 'quả táo' }, { emoji: '🍊', name: 'quả cam' }, { emoji: '🍌', name: 'quả chuối' },
    { emoji: '🍓', name: 'quả dâu' }, { emoji: '🥕', name: 'củ cà rốt' }, { emoji: '🥚', name: 'quả trứng' },
    { emoji: '🧁', name: 'chiếc bánh' }, { emoji: '🍇', name: 'chùm nho' }, { emoji: '🥛', name: 'hộp sữa' },
    { emoji: '🌽', name: 'bắp ngô' }
  ];
  const MK_BASKET_MAX = 10;

  const mk = { token: 0, score: 0, order: [], basket: [], lock: false };
  const mkOrderEl = $('mkOrder');
  const mkShelf = $('mkShelf');
  const mkBasket = $('mkBasket');
  const mkScore = $('mkScore');
  const mkTimer = makeTimer($('mkTimerFill'), () => mkEnd());

  function mkOrderVoice() {
    const parts = ['Con mua giúp mẹ'];
    mk.order.forEach((o, i) => {
      if (i > 0) parts.push('và');
      parts.push(`${numWord(o.n)} ${o.p.name}`);
    });
    parts.push('nhé!');
    return parts;
  }
  function mkAnnounce() {
    audio().speakSequence(mkOrderVoice(), { gap: 150, rate: 0.9 });
  }

  function mkNewOrder() {
    mk.lock = false;
    mk.basket = [];
    const kinds = shuffle(MK_PRODUCTS);
    // độ khó tăng dần: 1 loại 1–5 → 1 loại 3–8 → 2 loại 1–4
    if (mk.score < 2) mk.order = [{ p: kinds[0], n: randInt(1, 5) }];
    else if (mk.score < 5) mk.order = [{ p: kinds[0], n: randInt(3, 8) }];
    else mk.order = [{ p: kinds[0], n: randInt(1, 4) }, { p: kinds[1], n: randInt(1, 4) }];

    mkOrderEl.innerHTML = '';
    mkOrderEl.appendChild(el('div', 'mk-order-title', '🧾 Mẹ nhờ mua'));
    mk.order.forEach(o => {
      const line = el('div', 'mk-order-line');
      line.append(el('span', 'mk-order-num', String(o.n)), el('span', 'mk-order-emoji', o.p.emoji));
      line.appendChild(el('span', 'mk-order-name', o.p.name));
      mkOrderEl.appendChild(line);
    });
    bounce(mkOrderEl, 'anim-pop', 500);

    // kệ hàng: các món cần mua + món khác cho đủ 4
    const onShelf = shuffle([...mk.order.map(o => o.p), ...kinds.slice(mk.order.length, 4)]);
    mkShelf.innerHTML = '';
    onShelf.forEach(p => {
      const b = el('button', 'mk-item');
      b.append(el('span', 'mk-item-emoji', p.emoji), el('span', 'mk-item-name', p.name));
      b.addEventListener('click', () => mkAdd(p, b));
      mkShelf.appendChild(b);
    });
    mkRenderBasket();
    mkAnnounce();
  }

  const mkCount = p => mk.basket.filter(x => x === p).length;

  function mkRenderBasket() {
    mkBasket.innerHTML = '';
    mk.basket.forEach((p, i) => {
      const it = el('button', 'mk-basket-item', p.emoji);
      it.addEventListener('click', () => mkRemove(i));
      mkBasket.appendChild(it);
    });
    if (!mk.basket.length) mkBasket.appendChild(el('div', 'mk-basket-empty', 'Giỏ đang trống'));
  }

  function mkAdd(p, node) {
    if (!mkTimer.active() || mk.lock) return;
    if (mk.basket.length >= MK_BASKET_MAX) {
      audio().playBoing();
      audio().speak('Giỏ đầy rồi con ơi!');
      return;
    }
    mk.basket.push(p);
    audio().playPop();
    bounce(node, 'anim-jump', 500);
    mkRenderBasket();
    audio().speakSequence([`${numWord(mkCount(p))} ${p.name}`], { rate: 0.9 });
  }

  function mkRemove(i) {
    if (!mkTimer.active() || mk.lock) return;
    const p = mk.basket[i];
    mk.basket.splice(i, 1);
    audio().playBoing();
    mkRenderBasket();
    audio().speakSequence([`Bỏ ra một ${p.name}. Còn ${numWord(mkCount(p))} ${p.name}`], { rate: 0.9 });
  }

  function mkPay() {
    if (!mkTimer.active() || mk.lock) return;
    if (!mk.basket.length) {
      audio().playBoing();
      audio().speakSequence(['Giỏ còn trống! Con chạm vào hàng trên kệ để bỏ vào giỏ nhé!'], { rate: 0.9 });
      return;
    }
    // tìm lỗi đầu tiên để nhắc bé
    let hint = null;
    for (const o of mk.order) {
      const have = mkCount(o.p);
      if (have < o.n) { hint = `Con mới có ${numWord(have)} ${o.p.name}. Mẹ cần ${numWord(o.n)} ${o.p.name}. Con lấy thêm nhé!`; break; }
      if (have > o.n) { hint = `Con lấy ${numWord(have)} ${o.p.name}, thừa rồi! Mẹ chỉ cần ${numWord(o.n)} thôi. Con chạm vào giỏ để bỏ bớt nhé!`; break; }
    }
    if (!hint) {
      const extra = mk.basket.find(p => !mk.order.some(o => o.p === p));
      if (extra) hint = `Mẹ không mua ${extra.name}. Con chạm vào ${extra.name} trong giỏ để bỏ ra nhé!`;
    }
    if (hint) {
      audio().playBoing();
      bounce(mkBasket, 'anim-shake', 500);
      audio().speakSequence([hint], { rate: 0.9 });
      return;
    }
    mk.lock = true;
    mk.score++;
    mkScore.textContent = mk.score;
    celebrate();
    const token = mk.token;
    audio().speakSequence(['Đúng rồi! Cảm ơn con, con mua giỏi quá!'], { rate: 0.9 }).then(() => {
      setTimeout(() => { if (token === mk.token && mkTimer.running) mkNewOrder(); }, 300);
    });
  }

  function mkStart() {
    mk.token++;
    mk.score = 0;
    mkScore.textContent = '0';
    MG.showView('market');
    mkTimer.start();
    mkNewOrder();
  }

  function mkEnd() {
    mkTimer.stop();
    mk.token++;
    MG.showResult({ score: mk.score, bestKey: 'beHocVui.marketBest.v1', icon: '🛒', unit: 'giỏ hàng', verb: 'Hết giờ rồi! Con đi chợ được' });
  }

  $('mkPay').addEventListener('click', () => { audio().playPop(); mkPay(); });
  $('mkReplay').addEventListener('click', () => {
    audio().playPop();
    if (mkTimer.active()) mkAnnounce();
  });
  setupGame({ cardId: 'mgCardMarket', stopId: 'mkStop', timer: mkTimer, start: mkStart, end: mkEnd, resume: () => mkAnnounce() });

  // ======================================================================
  // 3. TÔ MÀU KỲ DIỆU: tô màu theo số (vùng số 1 tô bút màu số 1...)
  // ======================================================================
  const PT_COLORS = [
    null,
    { n: 1, color: '#FF6B6B', name: 'màu đỏ' },
    { n: 2, color: '#FFD43B', name: 'màu vàng' },
    { n: 3, color: '#51CF66', name: 'màu xanh lá' },
    { n: 4, color: '#4DABF7', name: 'màu xanh dương' },
    { n: 5, color: '#B07D52', name: 'màu nâu' }
  ];
  // Mỗi hình: các vùng { tag, a: thuộc tính SVG, n: số màu, l: [x, y] vị trí số } vẽ theo thứ tự.
  // Vùng không có n là trang trí (đã tô sẵn). viewBox 0 0 400 300.
  const PT_PICTURES = [
    {
      name: 'ngôi nhà',
      shapes: [
        { tag: 'rect', a: { x: 0, y: 255, width: 400, height: 45 }, n: 3, l: [40, 280] },
        { tag: 'circle', a: { cx: 345, cy: 58, r: 32 }, n: 2, l: [345, 58] },
        { tag: 'polygon', a: { points: '70,145 200,45 330,145' }, n: 1, l: [200, 112] },
        { tag: 'rect', a: { x: 95, y: 145, width: 210, height: 115 }, n: 2, l: [200, 162] },
        { tag: 'rect', a: { x: 116, y: 176, width: 50, height: 42 }, n: 4, l: [141, 197] },
        { tag: 'rect', a: { x: 234, y: 176, width: 50, height: 42 }, n: 4, l: [259, 197] },
        { tag: 'rect', a: { x: 177, y: 192, width: 46, height: 68 }, n: 5, l: [200, 228] }
      ]
    },
    {
      name: 'chú cá',
      shapes: [
        { tag: 'rect', a: { x: 0, y: 250, width: 400, height: 50 }, n: 4, l: [200, 276] },
        { tag: 'polygon', a: { points: '322,252 342,185 362,252' }, n: 3, l: [342, 233] },
        { tag: 'polygon', a: { points: '40,252 58,200 76,252' }, n: 3, l: [58, 237] },
        { tag: 'polygon', a: { points: '268,150 356,92 356,208' }, n: 1, l: [326, 150] },
        { tag: 'polygon', a: { points: '150,98 205,42 242,98' }, n: 1, l: [200, 76] },
        { tag: 'ellipse', a: { cx: 180, cy: 150, rx: 110, ry: 68 }, n: 2, l: [200, 165] },
        { tag: 'circle', a: { cx: 112, cy: 134, r: 13 }, fill: '#FFF' },
        { tag: 'circle', a: { cx: 108, cy: 134, r: 6 }, fill: '#333' },
        { tag: 'circle', a: { cx: 70, cy: 70, r: 10 }, fill: 'none' },
        { tag: 'circle', a: { cx: 52, cy: 40, r: 7 }, fill: 'none' }
      ]
    },
    {
      name: 'bông hoa',
      shapes: [
        { tag: 'circle', a: { cx: 345, cy: 55, r: 30 }, n: 2, l: [345, 55] },
        { tag: 'rect', a: { x: 184, y: 160, width: 32, height: 90 }, n: 3, l: [200, 226] },
        { tag: 'ellipse', a: { cx: 154, cy: 212, rx: 34, ry: 15 }, n: 3, l: [150, 212] },
        { tag: 'ellipse', a: { cx: 246, cy: 196, rx: 34, ry: 15 }, n: 3, l: [250, 196] },
        { tag: 'polygon', a: { points: '140,245 260,245 243,298 157,298' }, n: 5, l: [200, 272] },
        { tag: 'circle', a: { cx: 200, cy: 60, r: 36 }, n: 1, l: [200, 46] },
        { tag: 'circle', a: { cx: 252, cy: 110, r: 36 }, n: 1, l: [268, 110] },
        { tag: 'circle', a: { cx: 200, cy: 160, r: 36 }, n: 1, l: [200, 176] },
        { tag: 'circle', a: { cx: 148, cy: 110, r: 36 }, n: 1, l: [132, 110] },
        { tag: 'circle', a: { cx: 200, cy: 110, r: 28 }, n: 2, l: [200, 110] }
      ]
    },
    {
      name: 'chiếc ô tô',
      shapes: [
        { tag: 'rect', a: { x: 0, y: 252, width: 400, height: 48 }, n: 3, l: [200, 278] },
        { tag: 'circle', a: { cx: 60, cy: 55, r: 30 }, n: 2, l: [60, 55] },
        { tag: 'polygon', a: { points: '50,152 118,152 160,95 268,95 305,152 350,152 350,222 50,222' }, n: 1, l: [200, 188] },
        { tag: 'polygon', a: { points: '138,146 168,106 207,106 207,146' }, n: 4, l: [186, 130] },
        { tag: 'polygon', a: { points: '215,146 215,106 258,106 284,146' }, n: 4, l: [240, 130] },
        { tag: 'circle', a: { cx: 335, cy: 172, r: 9 }, fill: '#FFF59D' },
        { tag: 'circle', a: { cx: 120, cy: 222, r: 30 }, n: 5, l: [120, 222] },
        { tag: 'circle', a: { cx: 280, cy: 222, r: 30 }, n: 5, l: [280, 222] }
      ]
    },
    {
      name: 'cây táo',
      shapes: [
        { tag: 'rect', a: { x: 0, y: 255, width: 400, height: 45 }, n: 3, l: [50, 280] },
        { tag: 'circle', a: { cx: 345, cy: 55, r: 30 }, n: 2, l: [345, 55] },
        { tag: 'rect', a: { x: 178, y: 160, width: 44, height: 100 }, n: 5, l: [200, 222] },
        { tag: 'circle', a: { cx: 200, cy: 110, r: 72 }, n: 3, l: [225, 72] },
        { tag: 'circle', a: { cx: 165, cy: 98, r: 16 }, n: 1, l: [165, 98] },
        { tag: 'circle', a: { cx: 238, cy: 122, r: 16 }, n: 1, l: [238, 122] },
        { tag: 'circle', a: { cx: 190, cy: 148, r: 16 }, n: 1, l: [190, 148] }
      ]
    }
  ];

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const pt = { token: 0, score: 0, order: [], idx: 0, selected: null, regions: [], left: 0, lock: false };
  const ptCanvas = $('ptCanvas');
  const ptPalette = $('ptPalette');
  const ptHint = $('ptHint');
  const ptScore = $('ptScore');
  const ptTimer = makeTimer($('ptTimerFill'), () => ptEnd());

  function ptRenderPalette() {
    ptPalette.innerHTML = '';
    PT_COLORS.slice(1).forEach(c => {
      const b = el('button', 'pt-crayon');
      b.style.setProperty('--c', c.color);
      b.append(el('span', 'pt-crayon-tip'), el('span', 'pt-crayon-num', String(c.n)));
      b.addEventListener('click', () => ptSelect(c, b));
      c.node = b;
      ptPalette.appendChild(b);
    });
  }

  function ptSelect(c, node) {
    if (!ptTimer.active()) return;
    pt.selected = c;
    ptPalette.querySelectorAll('.pt-crayon').forEach(x => x.classList.toggle('selected', x === node));
    audio().playPop();
    ptHint.textContent = `Bút ${c.name} số ${c.n}: tô vào các ô số ${c.n} nhé!`;
    audio().speakSequence([`${c.name}, số ${numWord(c.n)}`], { rate: 0.9 });
  }

  function ptNewPicture() {
    if (!pt.order.length || pt.idx >= pt.order.length) {
      pt.order = shuffle(PT_PICTURES);
      pt.idx = 0;
    }
    const pic = pt.order[pt.idx++];
    pt.pic = pic;
    pt.lock = false;
    pt.regions = [];
    ptCanvas.innerHTML = '';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.setAttribute('class', 'pt-svg');
    const labels = [];
    pic.shapes.forEach(s => {
      const node = document.createElementNS(SVG_NS, s.tag);
      Object.entries(s.a).forEach(([k, v]) => node.setAttribute(k, v));
      if (s.n) {
        node.setAttribute('class', 'pt-region');
        node.setAttribute('fill', '#FFFFFF');
        const region = { n: s.n, node, done: false };
        node.addEventListener('click', () => ptTap(region));
        pt.regions.push(region);
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', s.l[0]);
        t.setAttribute('y', s.l[1]);
        t.setAttribute('class', 'pt-label');
        t.textContent = String(s.n);
        region.label = t;
        labels.push(t);
      } else {
        node.setAttribute('class', 'pt-decor');
        node.setAttribute('fill', s.fill);
      }
      svg.appendChild(node);
    });
    labels.forEach(t => svg.appendChild(t)); // số luôn nằm trên cùng
    ptCanvas.appendChild(svg);
    pt.left = pt.regions.length;
    ptHint.textContent = `Tô màu ${pic.name}: chọn bút màu rồi chạm vào ô cùng số nhé! 🖍️`;
    audio().speakSequence([`Mình cùng tô màu ${pic.name} nhé! Con chọn bút màu, rồi tô vào ô có cùng số.`], { rate: 0.9 });
  }

  function ptTap(region) {
    if (!ptTimer.active() || pt.lock || region.done) return;
    if (!pt.selected) {
      audio().playBoing();
      bounce(ptPalette, 'anim-shake', 500);
      audio().speakSequence(['Con chọn bút màu trước nhé!'], { rate: 0.9 });
      return;
    }
    if (pt.selected.n !== region.n) {
      audio().playBoing();
      bounce(region.label, 'pt-blink', 900);
      const want = PT_COLORS[region.n];
      audio().speakSequence([`Ô này là số ${numWord(region.n)}. Con chọn bút số ${numWord(region.n)}, ${want.name} nhé!`], { rate: 0.9 });
      bounce(want.node, 'anim-jump', 600);
      return;
    }
    region.done = true;
    region.node.setAttribute('fill', pt.selected.color);
    region.node.classList.add('filled');
    region.label.classList.add('hide');
    audio().playPop();
    pt.left--;
    if (pt.left > 0) return;
    pt.lock = true;
    pt.score++;
    ptScore.textContent = pt.score;
    celebrate();
    const token = pt.token;
    audio().speakSequence([`Bức tranh ${pt.pic.name} đẹp quá! Con giỏi quá!`], { rate: 0.9 }).then(() => {
      setTimeout(() => { if (token === pt.token && ptTimer.running) ptNewPicture(); }, 900);
    });
  }

  function ptStart() {
    pt.token++;
    pt.score = 0;
    pt.selected = null;
    ptScore.textContent = '0';
    ptRenderPalette();
    MG.showView('paint');
    ptTimer.start();
    ptNewPicture();
  }

  function ptEnd() {
    ptTimer.stop();
    pt.token++;
    MG.showResult({ score: pt.score, bestKey: 'beHocVui.paintBest.v1', icon: '🖼️', unit: 'bức tranh', verb: 'Hết giờ rồi! Con tô xong' });
  }

  setupGame({ cardId: 'mgCardPaint', stopId: 'ptStop', timer: ptTimer, start: ptStart, end: ptEnd });

  window.minigameMore = { rs, mk, pt, rsTimer, mkTimer, ptTimer, PT_PICTURES };
})();
