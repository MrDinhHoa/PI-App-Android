// Hai mini-game thêm: 🎣 Câu Cá Vần và 🚂 Tàu Hỏa Số. 2 phút/lượt, tốn 1 chìa khóa.
// Dùng đồng hồ + đăng ký chung của minigame-more.js (window.minigameMore.helpers).
(function () {
  const L = window.LESSONS_DATA;
  const P = window.phonicsUtil;
  const MG = window.minigame;
  const { makeTimer, setupGame } = window.minigameMore.helpers;
  const audio = () => window.kidsAudio;

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
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
  const numWord = n => (n <= 10 ? L.numberWords[n]
    : n < 20 ? `mười ${n === 15 ? 'lăm' : L.numberWords[n - 10]}` : n === 20 ? 'hai mươi' : String(n));
  function celebrate() {
    audio().playCelebration();
    if (window.spawnConfetti) window.spawnConfetti();
  }

  // ======================================================================
  // 🎣 CÂU CÁ VẦN: cá bơi ngang hồ mang vần, bé chạm cá có vần cô đọc
  // ======================================================================
  const FISH_LANES = 4;
  const FISH_MAX = 6;
  const FISH_SPAWN = 1.3;           // giây
  const FISH_CROSS = [7, 9.5];      // giây bơi hết hồ (chậm cho bé 5 tuổi)
  const FISH_PER_TARGET = 3;
  const FISH_EMOJI = ['🐟', '🐠', '🐡'];
  const RHYMES = L.rhymes.map(r => r.rhyme);
  const rhymePart = r => ({ text: r, clip: `van-${P.slug(r)}` });

  const fs = { token: 0, score: 0, hits: 0, target: null, fish: [], spawnAcc: 0, lastTs: 0, raf: 0, lastWrong: 0, lanes: [] };
  const fsPond = $('fsPond');
  const fsTarget = $('fsTarget');
  const fsHits = $('fsHits');
  const fsScore = $('fsScore');
  const fsBucket = $('fsBucket');
  const fsTimer = makeTimer($('fsTimerFill'), () => fsEnd());

  function fsAnnounce() {
    audio().speakSequence(['Con câu cá có vần', rhymePart(fs.target)], { gap: 150, rate: 0.9 });
  }
  function fsRenderHits() {
    fsHits.innerHTML = '';
    for (let i = 0; i < FISH_PER_TARGET; i++) fsHits.appendChild(el('span', i < fs.hits ? 'on' : '', '🐟'));
  }
  function fsNextTarget() {
    let t;
    do { t = pick(RHYMES); } while (t === fs.target);
    fs.target = t;
    fs.hits = 0;
    fsTarget.textContent = t;
    bounce(fsTarget.parentElement, 'anim-pop', 500);
    fsRenderHits();
    fsAnnounce();
  }
  // vần nhiễu: hay lấy vần dễ nhầm với mục tiêu
  function fsDistractor() {
    const group = (L.rhymeConfusable.find(g => g.includes(fs.target)) || []).filter(x => x !== fs.target);
    if (group.length && Math.random() < 0.5) return pick(group);
    let r;
    do { r = pick(RHYMES); } while (r === fs.target);
    return r;
  }

  function fsSpawn() {
    const live = fs.fish.filter(f => !f.caught);
    if (live.length >= FISH_MAX) return;
    const w = fsPond.clientWidth;
    const h = fsPond.clientHeight;
    const hasTarget = live.some(f => f.value === fs.target);
    const value = !hasTarget || Math.random() < 0.35 ? fs.target : fsDistractor();
    let lane;
    let tries = 0;
    do { lane = randInt(0, FISH_LANES - 1); tries++; } while (fs.lanes.includes(lane) && tries < 12);
    fs.lanes.push(lane);
    if (fs.lanes.length > 2) fs.lanes.shift();
    const dir = Math.random() < 0.5 ? 1 : -1;
    const node = el('div', `fs-fish${dir < 0 ? ' left' : ''}`);
    node.append(el('span', 'fs-fish-body', pick(FISH_EMOJI)), el('span', 'fs-fish-tag', value));
    const laneH = (h - 40) / FISH_LANES;
    const f = {
      node, value, dir, caught: false,
      x: dir > 0 ? -150 : w + 10,
      y: 30 + lane * laneH + rand(0, laneH - 90),
      speed: (w + 160) / rand(FISH_CROSS[0], FISH_CROSS[1]),
      phase: Math.random() * Math.PI * 2
    };
    node.addEventListener('pointerdown', e => { e.preventDefault(); fsTap(f); });
    fsPlace(f);
    fsPond.appendChild(node);
    fs.fish.push(f);
  }
  function fsPlace(f) {
    f.node.style.transform = `translate(${f.x}px, ${f.y + Math.sin(f.phase) * 8}px)`;
  }
  function fsRemove(f) {
    f.node.remove();
    fs.fish = fs.fish.filter(x => x !== f);
  }

  function fsTap(f) {
    if (!fsTimer.active() || f.caught) return;
    if (f.value === fs.target) {
      f.caught = true;
      f.node.classList.add('caught');
      // cá bay vào xô
      const pr = fsPond.getBoundingClientRect();
      const br = fsBucket.getBoundingClientRect();
      f.node.style.transform = `translate(${br.left - pr.left}px, ${br.top - pr.top - 20}px) scale(0.4)`;
      setTimeout(() => fsRemove(f), 650);
      audio().playPop();
      fs.score++;
      fs.hits++;
      fsScore.textContent = fs.score;
      bounce(fsBucket, 'anim-pop', 500);
      fsRenderHits();
      if (fs.hits >= FISH_PER_TARGET) {
        celebrate();
        const token = fs.token;
        audio().speakSequence(['Con giỏi quá!'], { rate: 0.95 }).then(() => {
          if (fsTimer.running && token === fs.token) fsNextTarget();
        });
      } else {
        audio().speakSequence([rhymePart(fs.target)], { rate: 0.9 });
      }
    } else {
      audio().playBoing();
      bounce(f.node.querySelector('.fs-fish-body'), 'anim-shake', 500);
      const now = performance.now();
      if (now - fs.lastWrong > 2500) {
        fs.lastWrong = now;
        audio().speakSequence(['Đây là vần', rhymePart(f.value), 'Con câu vần', rhymePart(fs.target)], { gap: 150, rate: 0.95 });
      }
    }
  }

  function fsFrame(ts) {
    if (!fsTimer.active()) return;
    const dt = fs.lastTs ? Math.min(0.05, (ts - fs.lastTs) / 1000) : 0;
    fs.lastTs = ts;
    fs.spawnAcc += dt;
    if (fs.spawnAcc >= FISH_SPAWN) {
      fs.spawnAcc = 0;
      fsSpawn();
    }
    const w = fsPond.clientWidth;
    fs.fish.forEach(f => {
      if (f.caught) return;
      f.x += f.dir * f.speed * dt;
      f.phase += dt * 2.5;
      fsPlace(f);
      if (f.x > w + 20 || f.x < -170) fsRemove(f);
    });
    fs.raf = requestAnimationFrame(fsFrame);
  }
  function fsLoop() {
    fs.lastTs = 0;
    cancelAnimationFrame(fs.raf);
    fs.raf = requestAnimationFrame(fsFrame);
  }

  function fsStart() {
    fs.token++;
    fs.score = 0;
    fs.target = null;
    fs.spawnAcc = FISH_SPAWN;
    fs.lanes = [];
    fs.fish.forEach(f => f.node.remove());
    fs.fish = [];
    fsScore.textContent = '0';
    MG.showView('fishing');
    fsTimer.start();
    fsNextTarget();
    fsLoop();
  }
  function fsEnd() {
    fsTimer.stop();
    fs.token++;
    cancelAnimationFrame(fs.raf);
    fs.fish.forEach(f => f.node.remove());
    fs.fish = [];
    MG.showResult({ score: fs.score, bestKey: 'beHocVui.fishBest.v1', icon: '🎣', unit: 'con cá', verb: 'Hết giờ rồi! Con câu được' });
  }
  $('fsReplay').addEventListener('click', () => {
    audio().playPop();
    if (fsTimer.active()) fsAnnounce();
  });
  setupGame({ cardId: 'mgCardFish', stopId: 'fsStop', timer: fsTimer, start: fsStart, end: fsEnd, resume: () => { fsAnnounce(); fsLoop(); } });

  // ======================================================================
  // 🚂 TÀU HỎA SỐ: chạm các số theo thứ tự để xếp lên toa, xong tàu chạy
  // ======================================================================
  const tr = { token: 0, score: 0, nums: [], order: [], next: 0, desc: false, lock: false };
  const trTrain = $('trTrain');
  const trStation = $('trStation');
  const trHint = $('trHint');
  const trScore = $('trScore');
  const trTimer = makeTimer($('trTimerFill'), () => trEnd());

  // độ khó tăng theo số tàu đã xếp
  function trLevel() {
    const s = tr.score;
    if (s < 2) return { n: 3, lo: 1, hi: 5, desc: false };
    if (s < 4) return { n: 4, lo: 1, hi: 10, desc: false };
    if (s < 6) return { n: 5, lo: 1, hi: 10, desc: false };
    if (s < 8) return { n: 4, lo: 1, hi: 10, desc: true };
    return { n: 5, lo: 1, hi: 20, desc: Math.random() < 0.5 };
  }
  const trRule = () => (tr.desc ? 'từ lớn đến bé' : 'từ bé đến lớn');
  function trAnnounce() {
    audio().speakSequence([`Con xếp số lên toa tàu theo thứ tự ${trRule()} nhé!`], { rate: 0.9 });
  }

  function trNewTrain() {
    const lv = trLevel();
    const pool = [];
    for (let v = lv.lo; v <= lv.hi; v++) pool.push(v);
    tr.nums = shuffle(pool).slice(0, lv.n);
    tr.desc = lv.desc;
    tr.order = [...tr.nums].sort((a, b) => (tr.desc ? b - a : a - b));
    tr.next = 0;
    tr.lock = false;

    // tàu mới hiện ngay tại ga (tắt hiệu ứng trượt khi bỏ lớp leaving)
    trTrain.style.transition = 'none';
    trTrain.classList.remove('leaving');
    void trTrain.offsetWidth;
    trTrain.style.transition = '';
    trTrain.innerHTML = '';
    tr.cars = tr.order.map(() => {
      const car = el('div', 'tr-car');
      trTrain.appendChild(car);
      return car;
    });
    trTrain.appendChild(el('span', 'tr-engine', '🚂')); // đầu máy ở trước, tàu chạy sang phải
    tr.cars[0].classList.add('active');

    trStation.innerHTML = '';
    tr.nums.forEach(v => {
      const b = el('button', 'tr-box', String(v));
      b.addEventListener('click', () => trTap(v, b));
      trStation.appendChild(b);
    });
    trHint.textContent = tr.desc ? 'Xếp từ LỚN đến BÉ ⬇️' : 'Xếp từ BÉ đến LỚN ⬆️';
    bounce(trHint, 'anim-pop', 500);
    trAnnounce();
  }

  function trTap(v, box) {
    if (!trTimer.active() || tr.lock || box.classList.contains('used')) return;
    const want = tr.order[tr.next];
    if (v !== want) {
      audio().playBoing();
      bounce(box, 'anim-shake', 500);
      audio().speakSequence([`Chưa đúng rồi! Con tìm số ${tr.desc ? 'lớn' : 'bé'} nhất trong các số còn lại nhé!`], { rate: 0.92 });
      return;
    }
    box.classList.add('used');
    const car = tr.cars[tr.next];
    car.textContent = String(v);
    car.classList.remove('active');
    car.classList.add('filled');
    audio().playPop();
    audio().speakSequence([numWord(v)], { rate: 0.9 });
    tr.next++;
    if (tr.next < tr.order.length) {
      tr.cars[tr.next].classList.add('active');
      return;
    }
    // đủ toa: tàu chạy
    tr.lock = true;
    tr.score++;
    trScore.textContent = tr.score;
    celebrate();
    const token = tr.token;
    setTimeout(() => { if (token === tr.token) trTrain.classList.add('leaving'); }, 500);
    audio().speakSequence(['Tu tu! Tàu chạy rồi!', ...tr.order.map(numWord)], { gap: 200, rate: 0.95 }).then(() => {
      setTimeout(() => { if (token === tr.token && trTimer.running) trNewTrain(); }, 400);
    });
  }

  function trStart() {
    tr.token++;
    tr.score = 0;
    trScore.textContent = '0';
    MG.showView('train');
    trTimer.start();
    trNewTrain();
  }
  function trEnd() {
    trTimer.stop();
    tr.token++;
    MG.showResult({ score: tr.score, bestKey: 'beHocVui.trainBest.v1', icon: '🚂', unit: 'đoàn tàu', verb: 'Hết giờ rồi! Con xếp được' });
  }
  $('trReplay').addEventListener('click', () => {
    audio().playPop();
    if (trTimer.active()) trAnnounce();
  });
  setupGame({ cardId: 'mgCardTrain', stopId: 'trStop', timer: trTimer, start: trStart, end: trEnd, resume: trAnnounce });

  window.minigameExtra = { fs, tr, fsTimer, trTimer };
})();
