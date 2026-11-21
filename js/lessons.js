// Bản đồ bài học (Tiếng Việt 11 bài + Toán 10 bài, nút Ôn tập) + trình chạy bài
(function () {
  const L = window.LESSONS_DATA;
  const PD = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const audio = () => window.kidsAudio;

  // ==================== HELPERS ====================
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  // Đọc số 0–20: 15 -> "mười lăm", 20 -> "hai mươi"
  const numWord = n => (n <= 10 ? L.numberWords[n]
    : n < 20 ? `mười ${n === 15 ? 'lăm' : L.numberWords[n - 10]}` : n === 20 ? 'hai mươi' : String(n));
  const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
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
  // n distinct numbers in [lo, hi] including `must`
  function numberOptions(must, n, lo, hi) {
    const pool = [];
    for (let v = lo; v <= hi; v++) if (v !== must) pool.push(v);
    // prefer neighbours so the choice needs real counting
    pool.sort((x, y) => Math.abs(x - must) - Math.abs(y - must) || Math.random() - 0.5);
    return shuffle([must, ...shuffle(pool.slice(0, n + 1)).slice(0, n - 1)]);
  }

  // ==================== PROGRESS (localStorage, optional) ====================
  const STORE_KEY = 'beHocVui.lessons.v1';
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* private mode */ }
  }
  let progress = loadProgress();

  const trackLessons = track => L.lessons.filter(x => x.track === track);
  function isUnlocked(lesson) {
    const list = trackLessons(lesson.track);
    const i = list.indexOf(lesson);
    return i === 0 || !!progress[list[i - 1].id];
  }

  // ==================== EXERCISE BUILDERS ====================
  const CONFUSABLE = [
    ['a', 'ă', 'â'], ['o', 'ô', 'ơ'], ['u', 'ư'], ['e', 'ê'],
    ['b', 'd', 'đ', 'p'], ['m', 'n'], ['t', 'th'], ['l', 'n'],
    ['ch', 'tr', 'th'], ['ng', 'ngh', 'nh'], ['c', 'k'], ['g', 'gh'], ['ph', 'th']
  ];

  function letterOptions(target, pool, n = 3) {
    const group = CONFUSABLE.find(g => g.includes(target.letter)) || [];
    const others = pool.filter(x => x !== target && x.sound !== target.sound);
    const close = shuffle(others.filter(x => group.includes(x.letter)));
    const far = shuffle(others.filter(x => !group.includes(x.letter)));
    // one confusable letter (if any) + random ones
    return shuffle([target, ...[...close.slice(0, 1), ...far].slice(0, n - 1)]);
  }

  const vowels = PD.alphabet.vowel.filter(x => x.letter !== 'y'); // y sounds like i
  const consonants = PD.alphabet.consonant.filter(x => x.letter !== 'q'); // q needs u
  const digraphs = PD.alphabet.digraph;

  const dictEntries = Object.entries(PD.words).map(([text, w]) => ({ text, ...w }));
  const uniquePictures = dictEntries.filter(w => dictEntries.filter(x => x.emoji === w.emoji).length === 1);

  // Vần: phương án nhiễu gồm 1 vần dễ nhầm (nếu có) + vần ngẫu nhiên
  const rhymePart = r => ({ text: r, clip: `van-${P.slug(r)}` });
  function rhymeOptions(target, n = 3) {
    const group = (L.rhymeConfusable.find(g => g.includes(target.rhyme)) || []).filter(r => r !== target.rhyme);
    const others = L.rhymes.filter(x => x !== target);
    const close = shuffle(others.filter(x => group.includes(x.rhyme)));
    const far = shuffle(others.filter(x => !group.includes(x.rhyme)));
    return shuffle([target, ...[...close.slice(0, 1), ...far].slice(0, n - 1)]);
  }

  const BUILD = {
    tv1: () => sample(vowels, 5).map(t => ({ type: 'pickLetter', group: 'vowel', target: t, options: letterOptions(t, vowels) })),

    tv2: () => [
      ...sample(consonants, 3).map(t => ({ type: 'pickLetter', group: 'consonant', target: t, options: letterOptions(t, consonants) })),
      ...sample(consonants, 3).map(t => ({
        type: 'pickInitial', target: t,
        options: shuffle([t, ...sample(consonants.filter(x => x !== t), 2)])
      }))
    ],

    tv3: () => [
      ...sample(dictEntries.filter(w => P.analyzeSyllable(w.text).tone.mark), 3).map(w => {
        const base = P.stripTones(w.text);
        const variants = PD.tones.map(t => P.applyTone(base, t.mark)).filter(v => v !== w.text);
        return { type: 'pickSyllable', target: w.text, options: shuffle([w.text, ...sample(variants, 2)]) };
      }),
      ...sample(uniquePictures, 3).map(w => ({
        type: 'pictureWord', target: w,
        options: shuffle([w, ...sample(uniquePictures.filter(x => x !== w), 2)])
      }))
    ],

    tv4: () => sample(L.words, 5).map(w => ({
      type: 'readWord', target: w,
      options: shuffle([w, ...sample(L.words.filter(x => x !== w), 2)])
    })),

    tv5: () => sample(L.sentences, 3).map(s => ({
      type: 'sentence', target: s,
      options: shuffle([s, ...sample(L.sentences.filter(x => x !== s), 2)])
    })),

    tv6: () => [
      ...sample(digraphs, 3).map(t => ({
        type: 'pickLetter', group: 'digraph', target: t,
        options: letterOptions(t, digraphs)
      })),
      ...sample(digraphs, 2).map(t => ({
        type: 'pickInitial', target: t,
        options: shuffle([t, ...sample(digraphs.filter(x => x !== t), 2)])
      }))
    ],

    tv7: () => sample(L.spellingQuiz, 5).map(q => ({
      type: 'spellingRule',
      quiz: q,
      options: q.options
    })),

    tv8: () => sample(L.wordPuzzles, 5).map(p => ({
      type: 'fillWord',
      puzzle: p,
      options: shuffle(p.choices)
    })),

    tv9: () => {
      const picks = sample(L.rhymes, 6);
      return [
        ...picks.slice(0, 2).map(t => ({ type: 'pickRhyme', target: t, options: rhymeOptions(t) })),
        ...picks.slice(2, 4).map(t => ({ type: 'findRhymeWord', target: t, options: rhymeOptions(t) })),
        ...picks.slice(4, 6).map(t => ({ type: 'completeRhyme', target: t, options: rhymeOptions(t) }))
      ];
    },

    tv10: () => pick(L.traceGroups).map(letter => ({ type: 'traceLetter', letter })),

    tv11: () => sample(L.stories, 2).map(story => ({ type: 'story', story })),

    toan1: () => shuffle([1, 2, 3, 4, 5]).map(n => ({ type: 'countTap', n, item: pick(L.counters), lo: 1, hi: 6 })),

    toan2: () => shuffle([6, 7, 8, 9, 10]).map(n => ({ type: 'countTap', n, item: pick(L.counters), lo: 5, hi: 10 })),

    toan3: () => [
      ...sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3).map(n => ({ type: 'pickNumber', n, options: numberOptions(n, 4, 1, 10) })),
      ...sample([2, 3, 4, 5, 6], 2).map(n => ({ type: 'pickGroup', n, item: pick(L.counters), options: numberOptions(n, 3, 1, 7) }))
    ],

    toan4: () => shuffle([0, 1, 2, 3, 4]).map(k => {
      const a = randInt(1, 8);
      let b = k === 0 ? a : randInt(1, 9);
      while (k !== 0 && b === a) b = randInt(1, 9);
      return { type: 'compareMoreLess', a, b, ask: k % 2 ? 'nhiều' : 'ít', item: pick(L.counters) };
    }),

    toan5: () => shuffle(['>', '<', '=', pick(['>', '<']), pick(['>', '<'])]).map(sign => {
      let a = randInt(1, 8);
      let b = randInt(1, 8);
      if (sign === '=') b = a;
      while (sign !== '=' && a === b) b = randInt(1, 8);
      if ((sign === '>' && a < b) || (sign === '<' && a > b)) [a, b] = [b, a];
      return { type: 'compareSign', a, b, sign, item: pick(L.counters) };
    }),

    toan6: () => [
      ...sample([
        { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 2 },
        { a: 3, b: 3 }, { a: 4, b: 1 }, { a: 2, b: 4 }, { a: 3, b: 4 }
      ], 3).map(pair => ({
        type: 'mergeNumbers',
        a: pair.a,
        b: pair.b,
        sum: pair.a + pair.b,
        item: pick(L.counters)
      })),
      ...sample([
        { total: 4, part: 2 }, { total: 5, part: 2 }, { total: 5, part: 3 },
        { total: 6, part: 2 }, { total: 6, part: 4 }, { total: 7, part: 3 }
      ], 2).map(sp => ({
        type: 'splitNumbers',
        total: sp.total,
        part: sp.part,
        remain: sp.total - sp.part,
        item: pick(L.counters)
      }))
    ],

    toan7: () => [
      ...sample([
        { a: 2, b: 3, op: '+' }, { a: 3, b: 4, op: '+' }, { a: 4, b: 2, op: '+' },
        { a: 5, b: 2, op: '+' }, { a: 3, b: 5, op: '+' }, { a: 1, b: 6, op: '+' }
      ], 3).map(m => ({
        type: 'mathOperation',
        a: m.a, b: m.b, op: '+',
        result: m.a + m.b,
        item: pick(L.counters)
      })),
      ...sample([
        { a: 5, b: 2, op: '-' }, { a: 6, b: 3, op: '-' }, { a: 7, b: 2, op: '-' },
        { a: 8, b: 4, op: '-' }, { a: 6, b: 2, op: '-' }, { a: 5, b: 3, op: '-' }
      ], 2).map(m => ({
        type: 'mathOperation',
        a: m.a, b: m.b, op: '-',
        result: m.a - m.b,
        item: pick(L.counters)
      }))
    ],

    toan8: () => [
      ...sample(L.shapes, 2).map(s => ({
        type: 'pickShape',
        target: s,
        options: shuffle([s, ...sample(L.shapes.filter(x => x !== s), 3)])
      })),
      ...sample(L.patterns, 3).map(p => ({
        type: 'patternNext',
        target: p,
        options: shuffle(p.choices)
      }))
    ]
  };

  Object.assign(BUILD, {
    toan9: () => [
      ...sample(range(11, 20), 3).map(n => ({ type: 'tenFrame', n })),
      ...sample(range(11, 20), 2).map(n => ({ type: 'pickNumber', n, options: numberOptions(n, 4, 11, 20) }))
    ],
    toan10: () => {
      const hours = sample(range(1, 12), 5);
      return [
        ...hours.slice(0, 3).map(h => ({ type: 'clockRead', h, options: numberOptions(h, 3, 1, 12) })),
        ...hours.slice(3).map(h => ({ type: 'clockFind', h, options: numberOptions(h, 3, 1, 12) }))
      ];
    }
  });

  // Ôn tập: trộn 5 câu từ các bài đã học xong trong một track
  const REVIEW_SIZE = 5;
  function reviewLesson(trackKey) {
    const id = `review-${trackKey}`;
    BUILD[id] = () => {
      const done = trackLessons(trackKey).filter(l => progress[l.id] && BUILD[l.id]);
      return Array.from({ length: REVIEW_SIZE }, () => pick(BUILD[pick(done).id]()));
    };
    return { id, track: trackKey, icon: '🔁', title: 'Ôn tập', intro: 'Ôn tập! Mình cùng ôn lại các bài con đã học nhé!' };
  }

  // ==================== DOM ====================
  const section = document.getElementById('sec-lessons');
  const mapEl = document.getElementById('lsMap');
  const tracksEl = document.getElementById('lsTracks');
  const playerEl = document.getElementById('lsPlayer');
  const titleEl = document.getElementById('lsTitle');
  const dotsEl = document.getElementById('lsDots');
  const areaEl = document.getElementById('lsArea');
  const bannerEl = document.getElementById('lsBanner');
  const btnHome = document.getElementById('lsHome');
  const btnReplay = document.getElementById('lsReplay');

  const sectionActive = () => section.classList.contains('active');

  // ==================== MAP ====================
  const TRACKS = [
    { key: 'tv', label: 'Tiếng Việt', icon: '📖', voice: 'Tiếng Việt' },
    { key: 'toan', label: 'Toán', icon: '🔢', voice: 'Toán' }
  ];

  function starsText(n) {
    return '⭐'.repeat(n) + '☆'.repeat(3 - n);
  }

  function renderMap() {
    tracksEl.innerHTML = '';
    TRACKS.forEach(track => {
      const row = el('div', `ls-track ls-track-${track.key}`);
      const list = trackLessons(track.key);
      const label = el('div', 'ls-track-label');
      label.append(el('span', 'ls-track-icon', track.icon), el('span', '', track.label));
      const starSum = list.reduce((sum, l) => sum + (progress[l.id] ? progress[l.id].stars : 0), 0);
      label.appendChild(el('span', 'ls-track-stars', `⭐ ${starSum}/${list.length * 3}`));
      const doneCount = list.filter(l => progress[l.id]).length;
      if (doneCount >= 2) {
        const review = el('button', 'ls-review-btn', '🔁 Ôn tập');
        review.addEventListener('click', () => { audio().playPop(); startLesson(reviewLesson(track.key)); });
        label.appendChild(review);
      }
      row.appendChild(label);

      const path = el('div', 'ls-path');
      const nextLesson = list.find(l => isUnlocked(l) && !progress[l.id]);
      list.forEach((lesson, i) => {
        const unlocked = isUnlocked(lesson);
        const done = progress[lesson.id];
        const wrap = el('div', 'ls-node-wrap');
        const node = el('button', 'ls-node');
        if (!unlocked) node.classList.add('locked');
        if (done) node.classList.add('done');
        if (lesson === nextLesson) node.classList.add('next');
        node.append(el('span', 'ls-node-icon', unlocked ? lesson.icon : '🔒'), el('span', 'ls-node-num', String(i + 1)));
        node.addEventListener('click', () => onNodeClick(lesson, node));
        wrap.append(node, el('div', 'ls-node-stars', starsText(done ? done.stars : 0)), el('div', 'ls-node-title', lesson.title));
        path.appendChild(wrap);
      });
      row.appendChild(path);
      tracksEl.appendChild(row);
      // tự cuộn tới bài tiếp theo (bản đồ dài hơn màn hình)
      const focus = path.querySelector('.ls-node.next') || path.querySelector('.ls-node:not(.locked):last-of-type');
      if (focus) {
        requestAnimationFrame(() => {
          const wrap = focus.parentElement;
          path.scrollLeft = Math.max(0, wrap.offsetLeft - path.clientWidth / 2 + wrap.offsetWidth / 2);
        });
      }
    });
  }

  function onNodeClick(lesson, node) {
    if (!isUnlocked(lesson)) {
      audio().playBoing();
      bounce(node, 'anim-shake');
      audio().speak('Con học xong bài trước để mở bài này nhé!');
      return;
    }
    audio().playPop();
    startLesson(lesson);
  }

  // ==================== PLAYER ====================
  const player = {
    lesson: null, exercises: [], idx: 0, mistakes: 0,
    token: 0, solved: false, prompt: null, introOnce: null, pendingPrompt: false
  };

  function showPlayer(show) {
    mapEl.classList.toggle('is-hidden', show);
    playerEl.classList.toggle('is-hidden', !show);
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    player.exercises.forEach((_, i) => {
      const d = el('span', 'ls-dot');
      if (i < player.idx) d.classList.add('done');
      if (i === player.idx) d.classList.add('current');
      dotsEl.appendChild(d);
    });
  }

  function startLesson(lesson) {
    player.token++;
    audio().stopAll();
    player.lesson = lesson;
    player.exercises = BUILD[lesson.id]();
    player.idx = 0;
    player.mistakes = 0;
    player.introOnce = lesson.intro;
    titleEl.textContent = `${lesson.icon} ${lesson.title}`;
    showPlayer(true);
    renderExercise();
  }

  function exitLesson() {
    player.token++;
    player.lesson = null;
    player.prompt = null;
    audio().stopAll();
    showPlayer(false);
    renderMap();
  }

  async function playPrompt() {
    const p = player.prompt;
    if (!p) return;
    player.pendingPrompt = false;
    const token = player.token;
    if (player.introOnce) {
      const intro = player.introOnce;
      player.introOnce = null;
      const ok = await audio().speakSequence([intro], { rate: 0.9 });
      if (!ok || token !== player.token || player.prompt !== p) return;
      await sleep(250);
    }
    if (p.play) p.play();
    else audio().speakSequence(p.voice, { gap: 180, rate: 0.85 });
  }

  // text: banner text; voice: parts; play: optional custom player (replaces voice)
  function setPrompt(text, voice, play) {
    player.prompt = { text, voice, play };
    bannerEl.textContent = text;
    if (sectionActive()) playPrompt();
    else player.pendingPrompt = true;
  }

  function renderExercise() {
    player.solved = false;
    areaEl.innerHTML = '';
    renderDots();
    const ex = player.exercises[player.idx];
    RENDER[ex.type](ex, areaEl);
  }

  // Báo cáo phụ huynh: dạng bài = tên bài, chi tiết = chữ / vần / số đang hỏi
  function exDetail(ex) {
    if (!ex) return '';
    const t = ex.target;
    if (t && typeof t === 'object') return t.letter || t.rhyme || (t.text && t.text.split(' ').length === 1 ? t.text : '') || '';
    if (ex.letter) return ex.letter;
    if (ex.quiz) return ex.quiz.full;
    if (ex.h) return `${ex.h} giờ`;
    if (typeof ex.n === 'number') return String(ex.n);
    return '';
  }
  function logAnswer(ok) {
    if (!window.parentLog || !player.lesson) return;
    const ex = player.exercises[player.idx];
    const lesson = player.lesson.id.startsWith('review') ? 'Ôn tập' : player.lesson.title;
    window.parentLog.answer(`Bài học: ${lesson}`, ok, exDetail(ex));
  }

  async function correct(target, extraParts = []) {
    if (player.solved) return;
    player.solved = true;
    logAnswer(true);
    const token = player.token;
    if (target) target.classList.add('right');
    audio().playCelebration();
    if (window.spawnConfetti) window.spawnConfetti();
    const praise = pick(L.praises);
    bannerEl.textContent = `🎉 ${praise}`;
    const dot = dotsEl.children[player.idx];
    if (dot) dot.classList.add('done');

    await audio().speakSequence([praise, ...extraParts], { gap: 220, rate: 0.85 });
    await sleep(600);
    if (token !== player.token) return;
    player.idx++;
    if (player.idx >= player.exercises.length) finishLesson();
    else renderExercise();
  }

  function wrong(target, hintParts) {
    if (player.solved) return;
    player.mistakes++;
    logAnswer(false);
    audio().playBoing();
    if (target) bounce(target, 'anim-shake');
    audio().speakSequence(hintParts || ['Chưa đúng rồi, con thử lại cùng cô nhé!'], { gap: 180, rate: 0.85 });
  }

  function finishLesson() {
    const lesson = player.lesson;
    const stars = player.mistakes <= 1 ? 3 : player.mistakes <= 3 ? 2 : 1;
    const replay = !!progress[lesson.id] || lesson.id.startsWith('review');
    const prev = progress[lesson.id] ? progress[lesson.id].stars : 0;
    if (!lesson.id.startsWith('review')) {
      progress[lesson.id] = { stars: Math.max(prev, stars) };
      saveProgress();
    }
    // Phụ huynh có thể tắt chìa khóa khi học lại / ôn tập, hoặc giới hạn số chìa mỗi ngày
    const getKey = !window.parentLog || window.parentLog.canAwardKey(replay);
    player.prompt = null;
    renderDots();

    areaEl.innerHTML = '';
    const box = el('div', 'ls-finish');
    box.appendChild(el('div', 'ls-finish-trophy', '🏆'));
    box.appendChild(el('div', 'ls-finish-title', `Hoàn thành bài "${lesson.title}"!`));
    const starRow = el('div', 'ls-finish-stars');
    for (let i = 0; i < 3; i++) {
      const s = el('span', i < stars ? 'on' : 'off', '⭐');
      s.style.animationDelay = `${0.3 + i * 0.35}s`;
      starRow.appendChild(s);
    }
    box.appendChild(starRow);

    const noKeyText = replay && window.parentLog && !window.parentLog._data().settings.replayKeys
      ? 'Học bài mới để nhận chìa khóa nhé 😊'
      : 'Hôm nay bé đã nhận đủ chìa khóa rồi 😊';
    box.appendChild(el('div', 'ls-finish-key', getKey ? '+1 🔑 Chìa khóa mở trò chơi!' : noKeyText));

    const actions = el('div', 'ls-finish-actions');
    const btnPlay = el('button', 'action-btn big play', '🎈 Chơi Bắn Bóng');
    btnPlay.addEventListener('click', () => {
      audio().playPop();
      exitLesson();
      window.goToTab('games');
    });
    const btnMap = el('button', 'action-btn big', '🗺️ Chọn bài khác');
    btnMap.addEventListener('click', () => { audio().playPop(); exitLesson(); });
    const btnAgain = el('button', 'action-btn big secondary', '🔁 Học lại');
    btnAgain.addEventListener('click', () => { audio().playPop(); startLesson(lesson); });
    actions.append(btnPlay, btnMap, btnAgain);
    box.appendChild(actions);
    areaEl.appendChild(box);

    bannerEl.textContent = getKey ? `Bé được ${stars} ngôi sao và 1 chìa khóa!` : `Bé được ${stars} ngôi sao!`;
    window.addStar(stars);
    if (getKey) {
      if (window.parentLog) window.parentLog.keyAwarded();
      setTimeout(() => window.awardKey(), 900);
    }
    audio().playCelebration();
    setTimeout(() => window.spawnConfetti && window.spawnConfetti(), 400);
    const starWord = ['', 'một', 'hai', 'ba'][stars];
    audio().speakSequence(getKey
      ? [`Hoàn thành bài học rồi! Cô tặng con ${starWord} ngôi sao và một chìa khóa!`, 'Con có thể chơi trò bắn bóng rồi đấy!']
      : [`Hoàn thành bài học rồi! Cô tặng con ${starWord} ngôi sao!`],
    { gap: 260, rate: 0.9 });
  }

  btnHome.addEventListener('click', () => { audio().playPop(); exitLesson(); audio().speak('Chào con! Con chọn bài học cùng cô nhé!'); });
  btnReplay.addEventListener('click', () => { audio().playPop(); playPrompt(); });

  // ==================== EXERCISE RENDERERS ====================
  function choiceRow(items, makeCard) {
    const row = el('div', 'ls-choices');
    items.forEach(item => row.appendChild(makeCard(item)));
    return row;
  }

  function bigSpeaker() {
    const b = el('button', 'ls-speaker', '🔊');
    b.addEventListener('click', () => { audio().playPop(); playPrompt(); });
    return b;
  }

  function pictureCard(emoji, onTap) {
    const c = el('button', 'ls-card ls-pic', emoji);
    c.addEventListener('click', () => onTap(c));
    return c;
  }

  // Crocodile head with open jaws facing LEFT (like ">"); add class "flip" to face right ("<").
  // Drawn as SVG because the 🐊 emoji faces different directions on different platforms.
  function crocSvg(extraCls = '') {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 64 48');
    svg.setAttribute('class', `ls-croc ${extraCls}`);
    svg.innerHTML =
      '<path d="M54 16 L6 3 Q2 4 4 9 L46 24 Z" fill="#27AE60"/>' +            // upper jaw
      '<path d="M46 24 L4 39 Q2 44 6 45 L54 32 Z" fill="#229954"/>' +          // lower jaw
      '<path d="M12 8 l3 5 l3 -4 M22 11 l3 5 l3 -4 M32 14 l3 5 l3 -4" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linejoin="round"/>' +
      '<path d="M12 40 l3 -5 l3 4 M22 37 l3 -5 l3 4 M32 34 l3 -5 l3 4" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linejoin="round"/>' +
      '<ellipse cx="54" cy="24" rx="9" ry="12" fill="#2ECC71"/>' +             // head
      '<circle cx="53" cy="15" r="5" fill="#FFF"/><circle cx="52" cy="15" r="2.5" fill="#333"/>';
    return svg;
  }

  function groupBox(count, emoji, cls = '') {
    const box = el('div', `ls-group ${cls}`);
    const grid = el('div', 'ls-group-items');
    if (count > 4) grid.classList.add('many');
    for (let i = 0; i < count; i++) grid.appendChild(el('span', 'ls-group-item', emoji));
    box.appendChild(grid);
    return box;
  }

  const RENDER = {
    // Nghe âm -> chọn chữ
    pickLetter(ex, area) {
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, item => {
        const c = el('button', `ls-card ls-letter grp-${ex.group}`, item.letter);
        c.addEventListener('click', () => {
          if (item === ex.target) correct(c, [P.phonemePart(item, false)]);
          else wrong(c, ['Đây là', P.phonemePart(item, false), 'Con tìm chữ', P.phonemePart(ex.target, false)]);
        });
        return c;
      }));
      setPrompt('Bé nghe và chạm vào chữ đúng nhé!', ['Con tìm chữ', P.phonemePart(ex.target, false)]);
    },

    // Nghe âm đầu -> chọn hình
    pickInitial(ex, area) {
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, item => pictureCard(item.emoji, c => {
        if (item === ex.target) correct(c, [item.word, ...P.spellParts(item.word)]);
        else wrong(c, ['Đây là', item.word, 'Con tìm hình có âm', P.phonemePart(ex.target, false)]);
      })));
      setPrompt('Hình nào có âm đầu bé vừa nghe?', ['Hình nào có âm đầu là', P.phonemePart(ex.target, false)]);
    },

    // Nghe tiếng -> chọn tiếng đúng dấu thanh
    pickSyllable(ex, area) {
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, text => {
        const c = el('button', 'ls-card ls-word', text);
        c.addEventListener('click', () => {
          if (text === ex.target) correct(c, P.spellParts(text));
          else wrong(c, ['Đây là tiếng', text, 'Con tìm tiếng', ex.target]);
        });
        return c;
      }));
      setPrompt('Bé nghe kỹ dấu thanh rồi chọn tiếng đúng nhé!', ['Con tìm tiếng', ex.target]);
    },

    // Nhìn hình -> chọn chữ
    pictureWord(ex, area) {
      area.appendChild(el('div', 'ls-hero-pic', ex.target.emoji));
      area.appendChild(choiceRow(ex.options, w => {
        const c = el('button', 'ls-card ls-word', w.text);
        c.addEventListener('click', () => {
          if (w === ex.target) correct(c, [...P.spellParts(w.text), w.say]);
          else wrong(c, ['Đây là chữ', w.text, 'Con thử lại cùng cô nhé!']);
        });
        return c;
      }));
      setPrompt('Đây là hình gì? Bé chọn chữ đúng nhé!', ['Đây là hình gì? Con chọn chữ đúng nhé!']);
    },

    // Đọc từ 2 tiếng (chạm từng tiếng để nghe đánh vần) -> chọn hình
    readWord(ex, area) {
      const wordRow = el('div', 'ls-word-row');
      ex.target.text.split(' ').forEach(syl => {
        const chip = el('button', 'ls-syl');
        chip.append(el('span', 'ls-syl-text', syl), el('span', 'ls-syl-icon', '🔊'));
        chip.addEventListener('click', () => {
          audio().playPop();
          audio().speakSequence(P.spellParts(syl), {
            gap: 400, rate: 0.75,
            onStep: i => chip.classList.toggle('speaking', i >= 0)
          }).then(() => chip.classList.remove('speaking'));
        });
        wordRow.appendChild(chip);
      });
      area.appendChild(wordRow);
      area.appendChild(choiceRow(ex.options, w => pictureCard(w.emoji, c => {
        if (w === ex.target) correct(c, [w.text, w.sound]);
        else wrong(c, ['Chưa đúng rồi, con chạm vào chữ để nghe cô đánh vần nhé!']);
      })));
      setPrompt('Bé đọc từ này rồi chọn hình đúng nhé! (Chạm vào chữ để nghe đánh vần)',
        ['Con đọc từ này rồi chọn hình đúng nhé!']);
    },

    // Đọc câu: karaoke -> bé chạm từng chữ trái sang phải -> chọn hình
    sentence(ex, area) {
      const words = ex.target.text.split(' ');
      let phase = 'listen';
      let expected = 0;
      const token = player.token;

      const row = el('div', 'ls-sentence');
      const spans = words.map((w, i) => {
        const s = el('button', 'ls-sent-word', w);
        s.addEventListener('click', () => onWordTap(i, s));
        row.appendChild(s);
        return s;
      });
      area.appendChild(row);
      const picRow = el('div', 'ls-choices ls-hidden-row');
      area.appendChild(picRow);

      function markNext() {
        spans.forEach((s, i) => s.classList.toggle('next', phase === 'tap' && i === expected));
      }

      async function karaoke() {
        const ok = await audio().speakSequence(words.map(w => w.toLowerCase()), {
          gap: 220, rate: 0.8,
          onStep: i => spans.forEach((s, j) => {
            s.classList.toggle('karaoke-on', j === i);
            if (j === i) bounce(s, 'anim-jump', 500);
          })
        });
        spans.forEach(s => s.classList.remove('karaoke-on'));
        if (!ok || token !== player.token || phase !== 'listen') return;
        phase = 'tap';
        markNext();
        bannerEl.textContent = 'Giờ bé chạm từng chữ, từ trái sang phải nhé! 👉';
        audio().speakSequence(['Giờ con chạm từng chữ từ trái sang phải nhé!'], { rate: 0.9 });
      }

      function onWordTap(i, span) {
        if (phase === 'listen') return;
        if (phase === 'pick') {
          audio().speakSequence([words[i].toLowerCase()], { rate: 0.8 });
          return;
        }
        if (i !== expected) {
          audio().playBoing();
          bounce(spans[expected], 'anim-jump', 500);
          audio().speakSequence(['Con đọc lần lượt từ bên trái sang nhé!'], { rate: 0.9 });
          return;
        }
        audio().playPop();
        span.classList.add('read');
        bounce(span, 'anim-jump', 500);
        expected++;
        if (expected < words.length) {
          markNext();
          audio().speakSequence([words[i].toLowerCase()], { rate: 0.8 });
          return;
        }
        phase = 'pick';
        markNext();
        ex.options.forEach(s => picRow.appendChild(pictureCard(s.emoji, c => {
          if (s === ex.target) correct(c, [ex.target.text]);
          else wrong(c, ['Chưa đúng rồi, con đọc lại câu và chọn hình nhé!']);
        })));
        picRow.classList.remove('ls-hidden-row');
        bannerEl.textContent = 'Câu này nói về hình nào? Bé chọn nhé!';
        audio().speakSequence([words[i].toLowerCase(), 'Câu này nói về hình nào? Con chọn nhé!'], { gap: 220, rate: 0.85 });
      }

      setPrompt('Bé nghe cô đọc câu nhé! 👂', [], () => karaoke());
    },

    // Chạm đếm từng đồ vật -> chọn số
    countTap(ex, area) {
      let counted = 0;
      const { n, item } = ex;
      const grid = el('div', 'ls-count-grid');
      if (n > 5) grid.classList.add('two-rows');
      const choiceWrap = el('div', 'ls-choices ls-hidden-row');

      for (let i = 0; i < n; i++) {
        const it = el('button', 'ls-count-item');
        it.appendChild(el('span', 'ls-count-emoji', item.emoji));
        it.addEventListener('click', () => {
          if (it.dataset.num) {
            audio().speakSequence([numWord(+it.dataset.num)], { rate: 0.85 });
            return;
          }
          counted++;
          it.dataset.num = counted;
          it.classList.add('counted');
          it.appendChild(el('span', 'ls-count-badge', String(counted)));
          audio().playPop();
          bounce(it, 'anim-jump', 500);
          if (counted < n) {
            audio().speakSequence([numWord(counted)], { rate: 0.85 });
          } else {
            choiceWrap.classList.remove('ls-hidden-row');
            const text = `Có tất cả mấy ${item.name}? Bé chọn số nhé!`;
            const voiceParts = ['Có tất cả mấy', item.name, 'Con chọn số nhé!'];
            player.prompt = { text, voice: voiceParts };
            bannerEl.textContent = text;
            audio().speakSequence([numWord(counted), ...voiceParts], { gap: 180, rate: 0.85 });
          }
        });
        grid.appendChild(it);
      }

      numberOptions(n, 3, ex.lo, ex.hi).forEach(v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === n) correct(c, ['Có tất cả', numWord(n), item.name]);
          else wrong(c, ['Chưa đúng rồi, con đếm lại cùng cô nhé!']);
        });
        choiceWrap.appendChild(c);
      });

      area.append(grid, choiceWrap);
      const text = `Bé chạm vào từng ${item.name} để đếm nhé!`;
      setPrompt(text, ['Con chạm vào từng', item.name, 'để đếm cùng cô nhé!']);
    },

    // Nghe số -> chọn thẻ số
    pickNumber(ex, area) {
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === ex.n) correct(c, ['Số', numWord(v)]);
          else wrong(c, ['Đây là số', numWord(v), 'Con tìm số', numWord(ex.n)]);
        });
        return c;
      }));
      setPrompt('Bé nghe và tìm đúng số nhé!', ['Con tìm số', numWord(ex.n)]);
    },

    // Nghe số -> chọn nhóm có đúng số lượng
    pickGroup(ex, area) {
      area.appendChild(choiceRow(ex.options, v => {
        const g = groupBox(v, ex.item.emoji, 'ls-group-btn');
        g.addEventListener('click', () => {
          if (v === ex.n) correct(g, ['Nhóm này có', numWord(v), ex.item.name]);
          else wrong(g, ['Nhóm này có', numWord(v), ex.item.name, 'Con đếm lại cùng cô nhé!']);
        });
        return g;
      }));
      setPrompt(`Bé tìm nhóm có ${ex.n} ${ex.item.name} nhé!`, ['Con tìm nhóm có', numWord(ex.n), ex.item.name]);
    },

    // Bên nào nhiều hơn / ít hơn / bằng nhau
    compareMoreLess(ex, area) {
      const { a, b, ask, item } = ex;
      const answer = a === b ? 'equal' : ((ask === 'nhiều') === (a > b) ? 'left' : 'right');
      const row = el('div', 'ls-compare');
      const left = groupBox(a, item.emoji, 'ls-group-btn side');
      const mid = el('button', 'ls-card ls-equal-btn', '= Bằng nhau');
      const right = groupBox(b, item.emoji, 'ls-group-btn side');
      const tap = (side, node) => {
        if (side === answer) {
          correct(node, [side === 'equal' ? 'Hai bên bằng nhau!' : (ask === 'nhiều' ? 'Bên này nhiều hơn!' : 'Bên này ít hơn!')]);
        } else {
          wrong(node, ['Chưa đúng rồi, con đếm hai bên cùng cô nhé!']);
        }
      };
      left.addEventListener('click', () => tap('left', left));
      right.addEventListener('click', () => tap('right', right));
      mid.addEventListener('click', () => tap('equal', mid));
      row.append(left, mid, right);
      area.appendChild(row);
      const voiceText = ask === 'nhiều'
        ? 'Bên nào nhiều hơn? Nếu bằng nhau con chọn nút Bằng nhau nhé!'
        : 'Bên nào ít hơn? Nếu bằng nhau con chọn nút Bằng nhau nhé!';
      setPrompt(`Bên nào ${ask.toUpperCase()} hơn? 🤔`, [voiceText]);
    },

    // Chọn dấu >, <, = (cá sấu há miệng về phía nhiều hơn)
    compareSign(ex, area) {
      const { a, b, sign, item } = ex;
      const row = el('div', 'ls-compare');
      const left = groupBox(a, item.emoji, 'side');
      left.appendChild(el('div', 'ls-group-num', String(a)));
      const slot = el('div', 'ls-sign-slot', '?');
      const right = groupBox(b, item.emoji, 'side');
      right.appendChild(el('div', 'ls-group-num', String(b)));
      row.append(left, slot, right);
      area.appendChild(row);

      const rel = { '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' };
      area.appendChild(choiceRow(['>', '<', '='], s => {
        const c = el('button', 'ls-card ls-sign');
        c.appendChild(el('span', 'ls-sign-char', s));
        if (s !== '=') c.appendChild(crocSvg(s === '<' ? 'flip' : ''));
        c.addEventListener('click', () => {
          if (s === sign) {
            slot.innerHTML = '';
            slot.appendChild(el('span', 'ls-sign-char', s));
            if (s !== '=') slot.appendChild(crocSvg(`big ${s === '<' ? 'flip' : ''}`));
            slot.classList.add('solved');
            correct(c, [numWord(a), rel[s], numWord(b)]);
          } else {
            wrong(c, ['Chưa đúng rồi, chú cá sấu luôn há miệng về phía nhiều hơn nhé!']);
          }
        });
        return c;
      }));
      setPrompt('Bé chọn dấu đúng nhé! 🐊 Cá sấu há miệng về phía nhiều hơn.',
        ['Con chọn dấu đúng nhé! Cá sấu há miệng về phía nhiều hơn.']);
    },

    // Quy tắc chính tả c/k, g/gh, ng/ngh
    spellingRule(ex, area) {
      const q = ex.quiz;
      const hero = el('div', 'ls-spell-hero');
      hero.appendChild(el('div', 'ls-hero-pic', q.emoji));

      const wordRow = el('div', 'ls-spell-word');
      const slot = el('span', 'ls-spell-slot', '?');
      const tail = el('span', 'ls-spell-tail', q.vowel);
      wordRow.append(slot, tail);
      hero.appendChild(wordRow);
      area.appendChild(hero);

      area.appendChild(choiceRow(ex.options, opt => {
        const c = el('button', 'ls-card ls-letter grp-consonant', opt);
        c.addEventListener('click', () => {
          if (opt === q.prefix) {
            slot.textContent = opt;
            slot.classList.add('filled');
            correct(c, [q.full, q.hint]);
          } else {
            wrong(c, ['Chưa đúng rồi! ' + q.hint]);
          }
        });
        return c;
      }));

      const text = `Bé chọn chữ đúng để điền vào từ "${q.full}" nhé! ✨`;
      setPrompt(text, ['Con chọn chữ đúng để điền vào từ', q.full, 'nhé!']);
    },

    // Ghép từ có nghĩa
    fillWord(ex, area) {
      const p = ex.puzzle;
      area.appendChild(el('div', 'ls-hero-pic', p.emoji));

      const wordRow = el('div', 'ls-fill-row');
      const first = el('span', 'ls-fill-fixed', p.first);
      const slot = el('span', 'ls-fill-slot', '?');
      wordRow.append(first, slot);
      area.appendChild(wordRow);

      area.appendChild(choiceRow(ex.options, w => {
        const c = el('button', 'ls-card ls-word', w);
        c.addEventListener('click', () => {
          if (w === p.second) {
            slot.textContent = w;
            slot.classList.add('filled');
            correct(c, [p.full]);
          } else {
            wrong(c, ['Chưa đúng rồi, con chọn lại cùng cô nhé!']);
          }
        });
        return c;
      }));

      const text = `Bé nhìn hình và chọn tiếng đúng để ghép thành "${p.full}" nhé! 🧩`;
      setPrompt(text, ['Con nhìn hình và chọn tiếng đúng để ghép thành từ', p.full, 'nhé!']);
    },

    // Nghe vần -> chọn vần
    pickRhyme(ex, area) {
      const t = ex.target;
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, item => {
        const c = el('button', 'ls-card ls-word ls-rhyme', item.rhyme);
        c.addEventListener('click', () => {
          if (item === t) correct(c, ['Vần', rhymePart(t.rhyme), ...P.spellParts(t.word)]);
          else wrong(c, ['Đây là vần', rhymePart(item.rhyme), 'Con tìm vần', rhymePart(t.rhyme)]);
        });
        return c;
      }));
      setPrompt('Bé nghe cô đọc vần rồi chạm vào vần đúng nhé! 🎵', ['Con tìm vần', rhymePart(t.rhyme)]);
    },

    // Nghe vần -> chọn hình có vần đó
    findRhymeWord(ex, area) {
      const t = ex.target;
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, item => pictureCard(item.emoji, c => {
        if (item === t) correct(c, P.spellParts(t.word));
        else wrong(c, ['Đây là', item.word, 'Con tìm hình có vần', rhymePart(t.rhyme)]);
      })));
      setPrompt('Hình nào có vần bé vừa nghe? 🖼️', ['Hình nào có vần', rhymePart(t.rhyme)]);
    },

    // Nhìn hình -> chọn vần còn thiếu (âm đầu + ? = tiếng)
    completeRhyme(ex, area) {
      const t = ex.target;
      const a = P.analyzeSyllable(t.word);
      const hero = el('div', 'ls-spell-hero');
      hero.appendChild(el('div', 'ls-hero-pic', t.emoji));
      const wordRow = el('div', 'ls-spell-word');
      const slot = el('span', 'ls-spell-slot', '?');
      wordRow.append(el('span', 'ls-spell-tail', a.onset), slot);
      hero.appendChild(wordRow);
      area.appendChild(hero);

      area.appendChild(choiceRow(ex.options, item => {
        const c = el('button', 'ls-card ls-word ls-rhyme', item.rhyme);
        c.addEventListener('click', () => {
          if (item === t) {
            slot.textContent = a.syllable.slice(a.onset.length);
            slot.classList.add('filled');
            correct(c, P.spellParts(t.word));
          } else {
            wrong(c, ['Đây là vần', rhymePart(item.rhyme), 'Con nhìn hình, đọc lại cùng cô nhé!', t.word]);
          }
        });
        return c;
      }));
      setPrompt(`Bé chọn vần đúng để ghép thành "${t.word}" nhé! 🧩`, ['Con chọn vần đúng để ghép thành tiếng', t.word]);
    },

    // Tập viết: tô chữ bằng ngón tay (khối tô chữ của abc-lab.js)
    traceLetter(ex, area) {
      const part = P.phonemePart(P.findLetter(ex.letter), false);
      area.appendChild(window.abcLab.createTracer(ex.letter, {
        isLocked: () => player.solved,
        onPass: () => correct(null, ['Con tô chữ', part, 'đẹp quá!']),
        onFail: (stage, msg) => wrong(stage, [msg])
      }));
      setPrompt(`Bé dùng ngón tay tô theo chữ "${ex.letter}" nhé! ✍️`, ['Con tô theo chữ', part, 'nhé!']);
    },

    // Đọc hiểu: cô đọc truyện (tô sáng từng câu) -> hỏi 1 câu -> chọn hình
    story(ex, area) {
      const s = ex.story;
      const token = player.token;
      const box = el('div', 'ls-story');
      box.appendChild(el('div', 'ls-story-scene', s.scene));
      const lines = el('div', 'ls-story-lines');
      lines.appendChild(el('div', 'ls-story-title', s.title));
      const spans = s.sentences.map(t => {
        const b = el('button', 'ls-story-line', t);
        b.addEventListener('click', () => { audio().playPop(); audio().speakSequence([t], { rate: 0.8 }); });
        lines.appendChild(b);
        return b;
      });
      box.appendChild(lines);
      area.appendChild(box);

      const ask = el('div', 'ls-story-ask ls-hidden-row');
      ask.appendChild(el('div', 'ls-story-q', `❓ ${s.question}`));
      ask.appendChild(choiceRow(shuffle(s.options), o => {
        const c = el('button', 'ls-card ls-story-opt');
        c.append(el('span', 'ls-story-opt-pic', o.emoji), el('span', 'ls-story-opt-text', o.text));
        c.addEventListener('click', () => {
          if (o === s.options[0]) correct(c, [o.text]);
          else wrong(c, ['Chưa đúng rồi! Con nghe lại câu chuyện cùng cô nhé!']);
        });
        return c;
      }));
      area.appendChild(ask);

      async function read() {
        await audio().speakSequence([...s.sentences, s.question], {
          gap: 500, rate: 0.82,
          onStep: i => spans.forEach((x, j) => x.classList.toggle('karaoke-on', j === i))
        });
        spans.forEach(x => x.classList.remove('karaoke-on'));
        if (token !== player.token) return;
        ask.classList.remove('ls-hidden-row');
        bannerEl.textContent = `${s.question} Bé chọn hình nhé!`;
      }
      setPrompt(`Bé nghe cô đọc truyện "${s.title}" nhé! 📚`, [], () => read());
    },

    // Số đến 20 bằng khung 10 ô: 1 khung đầy (1 chục) + khung còn lại
    tenFrame(ex, area) {
      const { n } = ex;
      const row = el('div', 'ls-tenframes');
      [10, n - 10].forEach(k => {
        const f = el('div', 'ls-tenframe');
        for (let i = 0; i < 10; i++) f.appendChild(el('span', `ls-tf-cell${i < k ? ' on' : ''}`));
        row.appendChild(f);
      });
      area.appendChild(row);
      area.appendChild(choiceRow(numberOptions(n, 3, 11, 20), v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === n) correct(c, ['Mười', 'và', numWord(n - 10), 'là', numWord(n)]);
          else wrong(c, ['Chưa đúng rồi! Khung đầy là mười chấm, con đếm thêm khung bên phải nhé!']);
        });
        return c;
      }));
      setPrompt('Có tất cả bao nhiêu chấm tròn? Khung đầy là 10 chấm nhé! 🔟', ['Có tất cả bao nhiêu chấm tròn? Khung đầy là mười chấm nhé!']);
    },

    // Xem đồng hồ: nhìn đồng hồ -> chọn giờ
    clockRead(ex, area) {
      area.appendChild(window.mathLab.clockSvg(ex.h, 'big'));
      area.appendChild(choiceRow(ex.options, v => {
        const c = el('button', 'ls-card ls-word', `${v} giờ`);
        c.addEventListener('click', () => {
          if (v === ex.h) correct(c, [`${numWord(ex.h)} giờ`]);
          else wrong(c, ['Con nhìn kim ngắn chỉ vào số mấy nhé!']);
        });
        return c;
      }));
      setPrompt('Đồng hồ chỉ mấy giờ? 🕐', ['Đồng hồ chỉ mấy giờ?']);
    },

    // Xem đồng hồ: nghe giờ -> chọn đồng hồ
    clockFind(ex, area) {
      area.appendChild(choiceRow(ex.options, v => {
        const c = el('button', 'ls-card ls-clock-card');
        c.appendChild(window.mathLab.clockSvg(v, 'small'));
        c.addEventListener('click', () => {
          if (v === ex.h) correct(c, [`${numWord(ex.h)} giờ`]);
          else wrong(c, [`Đồng hồ này chỉ ${numWord(v)} giờ. Con tìm đồng hồ chỉ ${numWord(ex.h)} giờ nhé!`]);
        });
        return c;
      }));
      setPrompt(`Đồng hồ nào chỉ ${ex.h} giờ? 🕐`, [`Đồng hồ nào chỉ ${numWord(ex.h)} giờ?`]);
    },

    // Gộp số
    mergeNumbers(ex, area) {
      const { a, b, sum, item } = ex;
      const row = el('div', 'ls-calc-row');

      const grpA = groupBox(a, item.emoji, 'side');
      grpA.appendChild(el('div', 'ls-group-num', String(a)));

      const plus = el('div', 'ls-calc-sym', '+');

      const grpB = groupBox(b, item.emoji, 'side');
      grpB.appendChild(el('div', 'ls-group-num', String(b)));

      const eq = el('div', 'ls-calc-sym', '=');
      const slot = el('div', 'ls-calc-slot', '?');

      row.append(grpA, plus, grpB, eq, slot);
      area.appendChild(row);

      const opts = numberOptions(sum, 3, 1, 10);
      area.appendChild(choiceRow(opts, v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === sum) {
            slot.textContent = String(sum);
            slot.classList.add('solved');
            correct(c, ['Gộp lại có tất cả', numWord(sum), item.name]);
          } else {
            wrong(c, ['Chưa đúng rồi, con đếm hai bên gộp lại cùng cô nhé!']);
          }
        });
        return c;
      }));

      const text = `Gộp ${a} ${item.name} và ${b} ${item.name} được mấy? Bé chọn số nhé! 🤲`;
      setPrompt(text, ['Gộp', numWord(a), item.name, 'và', numWord(b), item.name, 'được mấy? Con chọn số nhé!']);
    },

    // Tách số
    splitNumbers(ex, area) {
      const { total, part, remain, item } = ex;
      const wrap = el('div', 'ls-split-wrap');

      const topGrp = groupBox(total, item.emoji, 'side');
      topGrp.appendChild(el('div', 'ls-group-num', `Có tất cả ${total}`));
      wrap.appendChild(topGrp);

      const branchRow = el('div', 'ls-split-branches');
      const b1 = groupBox(part, item.emoji, 'side');
      b1.appendChild(el('div', 'ls-group-num', `Bớt ${part}`));

      const arrow = el('div', 'ls-calc-sym', '➡️');

      const b2 = el('div', 'ls-split-slot-grp');
      const slot = el('div', 'ls-calc-slot', '?');
      b2.append(slot, el('div', 'ls-group-num', 'Còn lại'));

      branchRow.append(b1, arrow, b2);
      wrap.appendChild(branchRow);
      area.appendChild(wrap);

      const opts = numberOptions(remain, 3, 1, 10);
      area.appendChild(choiceRow(opts, v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === remain) {
            slot.textContent = String(remain);
            slot.classList.add('solved');
            correct(c, ['Còn lại', numWord(remain), item.name]);
          } else {
            wrong(c, ['Chưa đúng rồi, con đếm lại số còn lại cùng cô nhé!']);
          }
        });
        return c;
      }));

      const text = `Có ${total} ${item.name}, bớt đi ${part} thì còn mấy? Bé chọn số nhé! 🔢`;
      setPrompt(text, ['Có tất cả', numWord(total), item.name, 'bớt đi', numWord(part), 'thì còn lại mấy? Con chọn số nhé!']);
    },

    // Phép tính cộng & trừ trực quan
    mathOperation(ex, area) {
      const { a, b, op, result, item } = ex;
      const row = el('div', 'ls-calc-row');

      const cardA = el('div', 'ls-calc-card');
      cardA.appendChild(el('div', 'ls-calc-big-num', String(a)));
      cardA.appendChild(el('div', 'ls-calc-mini-items', item.emoji.repeat(Math.min(a, 6))));

      const opSym = el('div', 'ls-calc-sym', op);

      const cardB = el('div', 'ls-calc-card');
      cardB.appendChild(el('div', 'ls-calc-big-num', String(b)));
      cardB.appendChild(el('div', 'ls-calc-mini-items', item.emoji.repeat(Math.min(b, 6))));

      const eqSym = el('div', 'ls-calc-sym', '=');
      const slot = el('div', 'ls-calc-slot', '?');

      row.append(cardA, opSym, cardB, eqSym, slot);
      area.appendChild(row);

      const opts = numberOptions(result, 4, 1, 10);
      area.appendChild(choiceRow(opts, v => {
        const c = el('button', 'ls-card ls-num', String(v));
        c.addEventListener('click', () => {
          if (v === result) {
            slot.textContent = String(result);
            slot.classList.add('solved');
            correct(c, [numWord(a), op === '+' ? 'cộng' : 'trừ', numWord(b), 'bằng', numWord(result)]);
          } else {
            wrong(c, ['Chưa đúng rồi, con tính lại cùng cô nhé!']);
          }
        });
        return c;
      }));

      const opText = op === '+' ? 'cộng' : 'trừ';
      const text = `${a} ${opText} ${b} bằng mấy? Bé chọn kết quả nhé! ➕`;
      setPrompt(text, [numWord(a), opText, numWord(b), 'bằng mấy? Con chọn số nhé!']);
    },

    // Nhận biết hình khối
    pickShape(ex, area) {
      area.appendChild(bigSpeaker());
      area.appendChild(choiceRow(ex.options, s => {
        const c = el('button', 'ls-card ls-shape-card');
        c.appendChild(el('span', 'ls-shape-icon', s.icon));
        c.appendChild(el('span', 'ls-shape-title', s.name));
        c.addEventListener('click', () => {
          if (s.id === ex.target.id) {
            correct(c, [s.name]);
          } else {
            wrong(c, ['Đây là', s.name, 'Con tìm', ex.target.name, 'nhé!']);
          }
        });
        return c;
      }));

      const text = `Bé hãy tìm "${ex.target.name}" nhé! 🔷`;
      setPrompt(text, ['Con hãy tìm', ex.target.name, 'nhé!']);
    },

    // Dãy quy luật tư duy logic
    patternNext(ex, area) {
      const p = ex.target;
      const row = el('div', 'ls-pattern-row');
      p.seq.forEach(ch => {
        const it = el('div', 'ls-pattern-item', ch);
        row.appendChild(it);
      });
      const slot = el('div', 'ls-pattern-slot', '❓');
      row.appendChild(slot);
      area.appendChild(row);

      area.appendChild(choiceRow(ex.options, opt => {
        const c = el('button', 'ls-card ls-pattern-btn', opt);
        c.addEventListener('click', () => {
          if (opt === p.next) {
            slot.textContent = opt;
            slot.classList.add('solved');
            correct(c, ['Đúng rồi!', 'Tiếp theo là', p.name || opt]);
          } else {
            wrong(c, ['Chưa đúng rồi, con quan sát quy luật thật kỹ nhé!']);
          }
        });
        return c;
      }));

      const text = 'Bé nhìn quy luật và tìm hình tiếp theo nhé! 🤔';
      setPrompt(text, ['Bé nhìn quy luật và tìm hình tiếp theo vào dấu hỏi chấm nhé!']);
    }
  };

  // ==================== ENTRY ====================
  function enter() {
    if (player.lesson) {
      if (player.pendingPrompt) playPrompt();
      return;
    }
    renderMap();
    audio().speak('Chào con! Con chọn bài học cùng cô nhé!');
  }

  renderMap();
  window.lessons = { enter, BUILD, player };
})();
