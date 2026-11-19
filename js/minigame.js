// Giai đoạn 3: Khu trò chơi + Mini-game "Bắn Bóng Chữ & Số"
// Mỗi lượt chơi tốn 1 chìa khóa (nhận được khi học xong 1 bài) và giới hạn 2 phút.
(function () {
  const PD = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const L = window.LESSONS_DATA;
  const audio = () => window.kidsAudio;

  // ==================== CONFIG ====================
  const GAME_SECONDS = 120;       // 2 phút / lượt để bảo vệ mắt
  const HITS_PER_TARGET = 3;      // bắn đúng 3 bóng thì đổi mục tiêu
  const MAX_BALLOONS = 7;
  const SPAWN_EVERY = 0.85;       // giây
  const RISE_SECONDS = [5.5, 7.5]; // thời gian bóng bay hết màn hình (chậm cho bé 5 tuổi)
  const BEST_KEY = 'beHocVui.balloonBest.v1';

  const LETTERS = [...PD.alphabet.vowel, ...PD.alphabet.consonant].filter(x => x.letter !== 'y'); // y đọc giống i
  const CONFUSABLE = [['a', 'ă', 'â'], ['o', 'ô', 'ơ'], ['u', 'ư'], ['e', 'ê'], ['b', 'd', 'đ', 'p'], ['m', 'n'], ['c', 'e', 'o'], ['l', 't']];
  const COLORS = [
    ['#FF6B6B', '#EE5253'], ['#48DBFB', '#0ABDE3'], ['#FED330', '#F7B731'], ['#1DD1A1', '#10AC84'],
    ['#A55EEA', '#8854D0'], ['#FF9F43', '#EE8B2F'], ['#FF9FF3', '#F368E0']
  ];

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const numWord = n => L.numberWords[n] || String(n);
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function loadBest() {
    try { return +localStorage.getItem(BEST_KEY) || 0; } catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* ignore */ }
  }

  // ==================== DOM ====================
  const section = document.getElementById('sec-games');
  const lobbyEl = document.getElementById('mgLobby');
  const playEl = document.getElementById('mgPlay');
  const resultEl = document.getElementById('mgResult');
  const lobbyKeysEl = document.getElementById('mgKeyCount');
  const noKeyEl = document.getElementById('mgNoKey');
  const cardBalloon = document.getElementById('mgCardBalloon');
  const fieldEl = document.getElementById('mgField');
  const targetTextEl = document.getElementById('mgTargetText');
  const targetKindEl = document.getElementById('mgTargetKind');
  const targetHitsEl = document.getElementById('mgTargetHits');
  const scoreEl = document.getElementById('mgScore');
  const timerFillEl = document.getElementById('mgTimerFill');
  const countdownEl = document.getElementById('mgCountdown');

  function showView(name) {
    lobbyEl.classList.toggle('is-hidden', name !== 'lobby');
    playEl.classList.toggle('is-hidden', name !== 'play');
    resultEl.classList.toggle('is-hidden', name !== 'result');
  }

  // ==================== LOBBY ====================
  window.wallet.onChange(s => {
    lobbyKeysEl.textContent = s.keys;
    noKeyEl.classList.toggle('is-hidden', s.keys > 0);
    cardBalloon.classList.toggle('no-key', s.keys <= 0);
  });

  cardBalloon.addEventListener('click', () => {
    if (window.wallet.keys <= 0) {
      audio().playBoing();
      cardBalloon.classList.remove('anim-shake');
      void cardBalloon.offsetWidth;
      cardBalloon.classList.add('anim-shake');
      audio().speak('Bé chưa có chìa khóa. Bé học xong một bài để nhận chìa khóa nhé!');
      return;
    }
    audio().playPop();
    startGame();
  });

  document.querySelectorAll('.mg-card.soon').forEach(card => {
    card.addEventListener('click', () => {
      audio().playBoing();
      audio().speak('Trò chơi này sắp có nhé!');
    });
  });

  noKeyEl.addEventListener('click', () => {
    audio().playPop();
    window.goToTab('lessons');
  });

  // ==================== GAME STATE ====================
  const g = {
    running: false, paused: false, timeLeft: 0, score: 0, hits: 0,
    target: null, round: 0, balloons: [], spawnAcc: 0, lastTs: 0, raf: 0,
    lastWrongVoice: 0, recentLanes: [], token: 0
  };

  function targetVoice(t) {
    return t.kind === 'letter' ? ['Tìm chữ', P.phonemePart(t.item, false)] : [`Tìm số ${numWord(t.value)}`];
  }
  function valueVoice(kind, value) {
    return kind === 'letter' ? P.phonemePart(P.findLetter(value), false) : numWord(value);
  }

  function announceTarget() {
    audio().speakSequence(targetVoice(g.target), { gap: 150, rate: 0.9 });
  }

  function renderTargetHits() {
    targetHitsEl.innerHTML = '';
    for (let i = 0; i < HITS_PER_TARGET; i++) {
      targetHitsEl.appendChild(el('span', i < g.hits ? 'on' : '', '🎈'));
    }
  }

  function nextTarget() {
    g.round++;
    const prev = g.target ? g.target.value : null;
    if (g.round % 2 === 1) {
      let item;
      do { item = pick(LETTERS); } while (item.letter === prev);
      g.target = { kind: 'letter', value: item.letter, item };
      targetKindEl.textContent = 'Tìm chữ';
    } else {
      let v;
      do { v = randInt(1, 10); } while (v === prev);
      g.target = { kind: 'number', value: v };
      targetKindEl.textContent = 'Tìm số';
    }
    g.hits = 0;
    targetTextEl.textContent = g.target.value;
    targetTextEl.parentElement.classList.remove('anim-pop');
    void targetTextEl.offsetWidth;
    targetTextEl.parentElement.classList.add('anim-pop');
    renderTargetHits();
    announceTarget();
  }

  // Distractor value of the same kind as the target (often a look-alike)
  function distractor() {
    const t = g.target;
    if (t.kind === 'letter') {
      const group = CONFUSABLE.find(gr => gr.includes(t.value));
      if (group && Math.random() < 0.5) {
        const others = group.filter(x => x !== t.value && P.findLetter(x));
        if (others.length) return pick(others);
      }
      let l;
      do { l = pick(LETTERS).letter; } while (l === t.value);
      return l;
    }
    let v;
    do {
      v = Math.random() < 0.4 ? t.value + pick([-1, 1]) : randInt(1, 10);
    } while (v === t.value || v < 1 || v > 10);
    return v;
  }

  // ==================== BALLOONS ====================
  function fieldSize() {
    return { w: fieldEl.clientWidth, h: fieldEl.clientHeight };
  }

  function spawnBalloon() {
    const active = g.balloons.filter(b => !b.popped);
    if (active.length >= MAX_BALLOONS) return;
    const { w, h } = fieldSize();
    const hasTarget = active.some(b => b.value === g.target.value);
    const isTarget = !hasTarget || Math.random() < 0.35;
    const value = isTarget ? g.target.value : distractor();

    const laneCount = Math.max(3, Math.floor(w / 115));
    const laneW = w / laneCount;
    let lane;
    let tries = 0;
    do { lane = randInt(0, laneCount - 1); tries++; } while (g.recentLanes.includes(lane) && tries < 20);
    g.recentLanes.push(lane);
    if (g.recentLanes.length > Math.min(3, laneCount - 1)) g.recentLanes.shift();

    const [c1, c2] = pick(COLORS);
    const node = el('div', 'mg-balloon');
    const body = el('div', 'mg-balloon-body');
    body.style.background = `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55) 0 12%, transparent 13%), linear-gradient(135deg, ${c1}, ${c2})`;
    body.appendChild(el('span', 'mg-balloon-text', String(value)));
    node.append(body, el('div', 'mg-balloon-string'));

    const b = {
      node, body, value,
      x: lane * laneW + laneW / 2 - 48,
      y: h + 20,
      speed: (h + 180) / rand(RISE_SECONDS[0], RISE_SECONDS[1]),
      phase: Math.random() * Math.PI * 2,
      popped: false
    };
    node.addEventListener('pointerdown', e => {
      e.preventDefault();
      onBalloonTap(b);
    });
    place(b);
    fieldEl.appendChild(node);
    g.balloons.push(b);
  }

  function place(b) {
    const sway = Math.sin(b.phase) * 14;
    b.node.style.transform = `translate(${b.x + sway}px, ${b.y}px)`;
  }

  function removeBalloon(b) {
    b.node.remove();
    g.balloons = g.balloons.filter(x => x !== b);
  }

  function burst(b) {
    const rect = b.body.getBoundingClientRect();
    const fieldRect = fieldEl.getBoundingClientRect();
    const cx = rect.left - fieldRect.left + rect.width / 2;
    const cy = rect.top - fieldRect.top + rect.height / 2;
    for (let i = 0; i < 10; i++) {
      const p = el('span', 'mg-particle');
      const angle = (i / 10) * Math.PI * 2;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.setProperty('--dx', `${Math.cos(angle) * 70}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * 70}px`);
      p.style.background = pick(COLORS)[0];
      fieldEl.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function onBalloonTap(b) {
    if (!g.running || g.paused || b.popped) return;
    if (b.value === g.target.value) {
      b.popped = true;
      b.body.classList.add('pop');
      burst(b);
      audio().playBalloonPop();
      setTimeout(() => removeBalloon(b), 280);
      g.score++;
      g.hits++;
      scoreEl.textContent = g.score;
      renderTargetHits();
      if (g.hits >= HITS_PER_TARGET) {
        audio().playCelebration();
        if (window.spawnConfetti) window.spawnConfetti();
        const token = g.token;
        audio().speakSequence(['Giỏi quá!'], { rate: 0.95 }).then(() => {
          if (g.running && token === g.token) nextTarget();
        });
      } else {
        audio().speakSequence([valueVoice(g.target.kind, g.target.value)], { rate: 0.9 });
      }
    } else {
      audio().playBoing();
      b.body.classList.remove('wobble');
      void b.body.offsetWidth;
      b.body.classList.add('wobble');
      const now = performance.now();
      if (now - g.lastWrongVoice > 2500) {
        g.lastWrongVoice = now;
        audio().speakSequence(['Đây là', valueVoice(g.target.kind, b.value), ...targetVoice(g.target)], { gap: 150, rate: 0.95 });
      }
    }
  }

  // ==================== LOOP ====================
  function frame(ts) {
    if (!g.running || g.paused) return;
    const dt = g.lastTs ? Math.min(0.05, (ts - g.lastTs) / 1000) : 0;
    g.lastTs = ts;

    g.timeLeft -= dt;
    const ratio = Math.max(0, g.timeLeft / GAME_SECONDS);
    timerFillEl.style.width = `${ratio * 100}%`;
    timerFillEl.parentElement.classList.toggle('low', g.timeLeft <= 15);
    if (g.timeLeft <= 0) {
      endGame();
      return;
    }

    g.spawnAcc += dt;
    if (g.spawnAcc >= SPAWN_EVERY) {
      g.spawnAcc = 0;
      spawnBalloon();
    }

    g.balloons.forEach(b => {
      if (b.popped) return;
      b.y -= b.speed * dt;
      b.phase += dt * 2;
      place(b);
      if (b.y < -170) removeBalloon(b);
    });

    g.raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    g.lastTs = 0;
    cancelAnimationFrame(g.raf);
    g.raf = requestAnimationFrame(frame);
  }

  // ==================== GAME FLOW ====================
  async function startGame() {
    if (!window.wallet.useKey()) return;
    g.token++;
    const token = g.token;
    g.running = false;
    g.paused = false;
    g.timeLeft = GAME_SECONDS;
    g.score = 0;
    g.round = 0;
    g.target = null;
    g.spawnAcc = SPAWN_EVERY; // first balloon right away
    g.recentLanes = [];
    g.balloons.forEach(b => b.node.remove());
    g.balloons = [];
    scoreEl.textContent = '0';
    timerFillEl.style.width = '100%';
    timerFillEl.parentElement.classList.remove('low');
    targetTextEl.textContent = '?';
    targetKindEl.textContent = '';
    targetHitsEl.innerHTML = '';
    showView('play');

    // 3 - 2 - 1
    countdownEl.classList.remove('is-hidden');
    audio().speak('Sẵn sàng!');
    for (const n of ['3', '2', '1']) {
      countdownEl.textContent = n;
      countdownEl.classList.remove('anim-pop');
      void countdownEl.offsetWidth;
      countdownEl.classList.add('anim-pop');
      audio().playPop();
      await new Promise(r => setTimeout(r, 750));
      if (token !== g.token) return;
    }
    countdownEl.classList.add('is-hidden');
    if (!sectionActive()) {
      // the child left the tab during the countdown: start paused
      g.running = true;
      g.paused = true;
      nextTarget();
      audio().stopAll();
      return;
    }
    g.running = true;
    nextTarget();
    startLoop();
  }

  function endGame() {
    if (!g.running) return;
    g.running = false;
    g.paused = false;
    g.token++;
    cancelAnimationFrame(g.raf);
    g.balloons.forEach(b => {
      b.node.classList.add('fly-away');
      setTimeout(() => b.node.remove(), 600);
    });
    g.balloons = [];

    const best = loadBest();
    const isRecord = g.score > best;
    if (isRecord) saveBest(g.score);

    document.getElementById('mgResultScore').textContent = g.score;
    document.getElementById('mgResultBest').textContent = isRecord
      ? `🏅 Kỷ lục mới: ${g.score} quả bóng!`
      : `🏅 Kỷ lục: ${Math.max(best, g.score)} quả bóng`;
    showView('result');
    audio().playCelebration();
    if (window.spawnConfetti) window.spawnConfetti();
    audio().speakSequence([
      `Hết giờ rồi! Bé bắn được ${g.score} quả bóng!`,
      isRecord ? 'Kỷ lục mới! Giỏi quá!' : 'Giỏi quá!',
      'Mắt bé cần nghỉ một chút. Bé học bài tiếp để nhận chìa khóa nhé!'
    ], { gap: 400, rate: 0.9 });
  }

  function sectionActive() {
    return section.classList.contains('active');
  }

  function pause() {
    if (!g.running || g.paused) return;
    g.paused = true;
    cancelAnimationFrame(g.raf);
  }

  function resume() {
    if (!g.running || !g.paused) return;
    g.paused = false;
    announceTarget();
    startLoop();
  }

  document.getElementById('mgReplay').addEventListener('click', () => {
    audio().playPop();
    if (g.running) announceTarget();
  });
  document.getElementById('mgStop').addEventListener('click', () => {
    audio().playPop();
    if (g.running) endGame();
    else { g.token++; showView('lobby'); }
  });
  document.getElementById('mgResultLearn').addEventListener('click', () => {
    audio().playPop();
    showView('lobby');
    window.goToTab('lessons');
  });
  document.getElementById('mgResultLobby').addEventListener('click', () => {
    audio().playPop();
    showView('lobby');
    audio().speak('Khu trò chơi!');
  });

  // ==================== ENTRY ====================
  function enter() {
    if (g.running) {
      resume();
      return;
    }
    if (!resultEl.classList.contains('is-hidden')) return;
    showView('lobby');
    audio().speak(window.wallet.keys > 0
      ? 'Khu trò chơi! Bé chạm vào trò bắn bóng để chơi nhé!'
      : 'Khu trò chơi! Bé học xong một bài để nhận chìa khóa nhé!');
  }

  window.minigame = { enter, pause, _state: g };
})();
