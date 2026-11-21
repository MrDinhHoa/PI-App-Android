// Tab Đánh Vần: "Xưởng Đánh Vần" theo cách lớp 1 dạy (âm đầu + vần + dấu thanh), 4 dạng bài.
// Luyện tự do (không tốn chìa khóa); đúng ngay lần đầu +1⭐. Dùng lại window.phonicsUtil.
(function () {
  const PD = window.PHONICS_DATA;
  const P = window.phonicsUtil;
  const L = window.LESSONS_DATA;
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

  // ==================== KHO TIẾNG CÓ HÌNH ====================
  // Tiếng một âm tiết, có âm đầu, không có vần kết thúc p/t/c/ch, mỗi hình chỉ ứng với một tiếng.
  const EXTRA_WORDS = [
    { text: 'gấu', emoji: '🐻', say: 'Con gấu!' }, { text: 'heo', emoji: '🐷', say: 'Con heo!' },
    { text: 'rùa', emoji: '🐢', say: 'Con rùa!' }, { text: 'ngựa', emoji: '🐴', say: 'Con ngựa!' },
    { text: 'quà', emoji: '🎁', say: 'Hộp quà!' }, { text: 'giày', emoji: '👟', say: 'Đôi giày!' },
    { text: 'nhện', emoji: '🕷️', say: 'Con nhện!' }, { text: 'sao', emoji: '⭐', say: 'Ngôi sao!' },
    { text: 'kéo', emoji: '✂️', say: 'Cái kéo!' }, { text: 'tôm', emoji: '🦐', say: 'Con tôm!' },
    { text: 'nho', emoji: '🍇', say: 'Chùm nho!' }, { text: 'sữa', emoji: '🥛', say: 'Cốc sữa!' }
  ];
  const SKIP = new Set(['số', 'đỏ']); // hình trừu tượng, bé khó gọi tên
  const FINAL_STOP = /(p|t|c|ch)$/;

  const BANK = (() => {
    const raw = [
      ...Object.entries(PD.words).map(([text, w]) => ({ text, emoji: w.emoji, say: w.say })),
      ...L.rhymes.map(r => ({ text: r.word, emoji: r.emoji, say: null })),
      ...EXTRA_WORDS
    ];
    const byText = new Map();
    raw.forEach(w => { if (!byText.has(w.text) && !SKIP.has(w.text)) byText.set(w.text, w); });
    const list = [...byText.values()].map(w => ({ ...w, a: P.analyzeSyllable(w.text) }))
      .filter(w => w.a.onset && w.a.rhyme && !FINAL_STOP.test(w.a.rhyme));
    // bỏ các hình dùng cho nhiều tiếng (ví dụ 👨 ba / bố)
    return list.filter(w => list.filter(x => x.emoji === w.emoji).length === 1);
  })();

  const ONSET_CONFUSABLE = [
    ['b', 'd', 'đ', 'p'], ['m', 'n'], ['l', 'n'], ['t', 'th', 'tr'], ['ch', 'tr'], ['c', 'k', 'kh'],
    ['g', 'gh', 'gi'], ['ng', 'ngh', 'nh'], ['ph', 'th'], ['s', 'x'], ['d', 'gi', 'r'], ['v', 'b']
  ];
  const VOWELS = new Set(PD.alphabet.vowel.map(x => x.letter));
  const allOnsets = [...new Set(BANK.map(w => w.a.onset))];
  const allRhymes = [...new Set(BANK.map(w => w.a.rhyme))];

  // 3 phương án: đáp án + 1 dễ nhầm (nếu có) + ngẫu nhiên
  function optionsWith(target, pool, groups, n = 3) {
    const group = (groups.find(g => g.includes(target)) || []).filter(x => x !== target);
    // âm đầu dễ nhầm luôn đọc được (có trong bảng chữ cái); vần dễ nhầm phải có trong kho
    const close = shuffle(group.filter(x => (groups === ONSET_CONFUSABLE ? P.findLetter(x) : pool.includes(x))));
    const far = shuffle(pool.filter(x => x !== target && !group.includes(x)));
    return shuffle([target, ...[...close.slice(0, 1), ...far].slice(0, n - 1)]);
  }
  const onsetOptions = o => optionsWith(o, allOnsets, ONSET_CONFUSABLE);
  const rhymeOptions = r => optionsWith(r, allRhymes, L.rhymeConfusable);
  function toneOptions(tone) {
    return shuffle([tone, ...shuffle(PD.tones.filter(t => t !== tone)).slice(0, 2)]);
  }

  // Phần đọc cho âm đầu / vần / thanh (dùng file thu âm nếu có)
  const onsetPart = o => P.phonemePart(P.findLetter(o), true);
  function rhymePart(r) {
    const single = r.length === 1 && P.findLetter(r);
    return single ? P.phonemePart(single, true) : { text: r, clip: `van-${P.slug(r)}` };
  }
  const tonePart = t => (t.mark ? P.tonePart(t) : 'thanh ngang');
  const toneSample = t => P.applyTone('a', t.mark);
  const toneLabel = t => (t.mark ? `dấu ${t.name}` : 'không dấu');

  // ==================== TIẾN ĐỘ ====================
  const STORE_KEY = 'beHocVui.spellLab.v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { progress = {}; }
  const saveProgress = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ } };

  // ==================== DOM & STATE ====================
  const logAnswer = ok => window.parentLog && window.parentLog.answer(`Đánh vần: ${MODES[st.mode].label}`, ok, (st.lastWord ? st.lastWord.text : ''));
  const section = $('sec-spelling');
  const modesEl = $('spModes');
  const areaEl = $('spArea');
  const bannerEl = $('spBanner');
  const st = { mode: null, token: 0, solved: false, mistakes: 0, prompt: null, lastWord: null };
  const sectionActive = () => section.classList.contains('active');

  function nextWord() {
    let w;
    do { w = pick(BANK); } while (w === st.lastWord);
    st.lastWord = w;
    return w;
  }

  function setPrompt(text, voice) {
    st.prompt = voice;
    bannerEl.textContent = text;
    if (sectionActive()) playPrompt();
  }
  function playPrompt() {
    if (st.prompt) audio().speakSequence(st.prompt, { gap: 300, rate: 0.82 });
  }
  function choiceRow(items, make) {
    const row = el('div', 'mt-choices');
    items.forEach(it => row.appendChild(make(it)));
    return row;
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
    }
    const praise = pick(L.praises);
    bannerEl.textContent = `🎉 ${praise}`;
    await audio().speakSequence([praise, ...parts], { gap: 380, rate: 0.82 });
    await sleep(700);
    if (token === st.token) nextQuestion();
  }
  function wrong(node, parts) {
    if (st.solved) return;
    st.mistakes++;
    logAnswer(false);
    audio().playBoing();
    if (node) bounce(node, 'anim-shake');
    audio().speakSequence(parts || ['Chưa đúng rồi, con thử lại cùng cô nhé!'], { gap: 300, rate: 0.82 });
  }
  const finalParts = w => [...P.spellParts(w.text), ...(w.say ? [w.say] : [])];

  // Hình + ô kết quả dùng chung
  function hero(w, showPic = true) {
    const box = el('div', 'sp-hero');
    if (showPic) box.appendChild(el('div', 'sp-pic', w.emoji));
    return box;
  }

  // ==================== 4 DẠNG BÀI ====================
  const MODES = {
    // 1. Ghép tiếng: âm đầu -> vần -> dấu thanh
    build: {
      icon: '🧱', label: 'Ghép tiếng',
      render(area) {
        const w = nextWord();
        const a = w.a;
        const box = hero(w);
        const row = el('div', 'sp-build-row');
        const slotO = el('div', 'sp-slot onset', '?');
        const slotR = el('div', 'sp-slot rhyme', '?');
        const slotT = el('div', 'sp-slot tone', '?');
        const result = el('div', 'sp-result', '');
        const cell = (slot, text) => {
          const c = el('div', 'sp-cell');
          c.append(slot, el('span', 'sp-cell-label', text));
          return c;
        };
        row.append(cell(slotO, 'âm đầu'), el('span', 'sp-plus', '+'), cell(slotR, 'vần'), el('span', 'sp-plus', '+'),
          cell(slotT, 'dấu'), el('span', 'sp-plus', '='), cell(result, 'tiếng'));
        box.appendChild(row);
        area.appendChild(box);
        const choices = el('div', 'sp-choices-wrap');
        area.appendChild(choices);
        const token = st.token;

        const stepOnset = () => {
          slotO.classList.add('active');
          choices.innerHTML = '';
          choices.appendChild(choiceRow(onsetOptions(a.onset), o => {
            const b = el('button', 'mt-card sp-tile onset', o);
            b.addEventListener('click', () => {
              if (st.solved || token !== st.token) return;
              if (o === a.onset) {
                audio().playPop();
                slotO.textContent = o;
                slotO.classList.remove('active');
                slotO.classList.add('filled');
                audio().speakSequence([onsetPart(o)], { rate: 0.82 }).then(() => { if (token === st.token) stepRhyme(); });
                choices.innerHTML = '';
              } else {
                wrong(b, ['Đây là', onsetPart(o), 'Tiếng', w.text, 'có âm đầu là', onsetPart(a.onset)]);
              }
            });
            return b;
          }));
          setPrompt(`Bé ghép tiếng "${w.text}". Âm đầu là gì? 🧱`, ['Con ghép tiếng', w.text, 'Âm đầu là gì?']);
        };
        const stepRhyme = () => {
          slotR.classList.add('active');
          choices.appendChild(choiceRow(rhymeOptions(a.rhyme), r => {
            const b = el('button', 'mt-card sp-tile rhyme', r);
            b.addEventListener('click', () => {
              if (st.solved || token !== st.token) return;
              if (r === a.rhyme) {
                audio().playPop();
                slotR.textContent = r;
                slotR.classList.remove('active');
                slotR.classList.add('filled');
                choices.innerHTML = '';
                audio().speakSequence([onsetPart(a.onset), rhymePart(r), a.base], { gap: 380, rate: 0.8 })
                  .then(() => { if (token === st.token) stepTone(); });
              } else {
                wrong(b, ['Đây là vần', rhymePart(r), 'Tiếng', w.text, 'có vần', rhymePart(a.rhyme)]);
              }
            });
            return b;
          }));
          setPrompt(`Vần của tiếng "${w.text}" là gì? 🎵`, ['Vần của tiếng', w.text, 'là gì?']);
        };
        const stepTone = () => {
          slotT.classList.add('active');
          choices.appendChild(choiceRow(PD.tones, t => {
            const b = el('button', 'mt-card sp-tile tone');
            b.append(el('span', 'sp-tone-mark', toneSample(t)), el('span', 'sp-tone-name', t.mark ? t.name : 'ngang'));
            b.addEventListener('click', () => {
              if (st.solved || token !== st.token) return;
              if (t === a.tone) {
                slotT.textContent = t.mark ? toneSample(t) : '—';
                slotT.classList.remove('active');
                slotT.classList.add('filled');
                result.textContent = w.text;
                result.classList.add('filled');
                correct(b, finalParts(w));
              } else {
                wrong(b, ['Đây là', tonePart(t), 'Con nghe lại nhé:', w.text]);
              }
            });
            return b;
          }));
          setPrompt(`Tiếng "${w.text}" có dấu gì? ✨`, [a.base, 'thành', w.text, 'Tiếng', w.text, 'có dấu gì?']);
        };
        stepOnset();
      }
    },

    // 2. Ghép chữ cái: xếp đúng thứ tự (phụ âm ghép là 1 thẻ), rồi chọn dấu
    letters: {
      icon: '🔤', label: 'Ghép chữ cái',
      render(area) {
        const w = nextWord();
        const a = w.a;
        const tokens = [a.onset, ...[...a.rhyme]];
        const box = hero(w);
        const slots = el('div', 'sp-letter-slots');
        const slotEls = tokens.map(() => {
          const s = el('div', 'sp-letter-slot', '');
          slots.appendChild(s);
          return s;
        });
        const toneSlot = el('div', 'sp-letter-slot tone', '');
        if (a.tone.mark) slots.appendChild(toneSlot);
        box.appendChild(slots);
        area.appendChild(box);

        // thẻ chữ: các chữ của tiếng + 2 chữ gây nhiễu
        const letterPool = [...PD.alphabet.vowel, ...PD.alphabet.consonant, ...PD.alphabet.digraph]
          .map(x => x.letter).filter(l => l !== 'q' && l !== 'y'); // q luôn đi với u, y dễ lẫn với i
        const extras = [];
        const group = ONSET_CONFUSABLE.find(g => g.includes(a.onset)) || [];
        const near = group.filter(x => !tokens.includes(x));
        if (near.length) extras.push(pick(near));
        while (extras.length < 2) {
          const l = pick(letterPool);
          if (!tokens.includes(l) && !extras.includes(l)) extras.push(l);
        }
        const pool = el('div', 'sp-pool');
        let next = 0;
        const token = st.token;
        shuffle([...tokens, ...extras]).forEach(t => {
          // tô màu theo loại chữ như tab Chữ Cái (nguyên âm đỏ, phụ âm xanh) để không lộ đáp án
          const b = el('button', `mt-card sp-tile ${VOWELS.has(t) ? 'rhyme' : 'onset'}`, t);
          b.addEventListener('click', () => {
            if (st.solved || token !== st.token || b.classList.contains('used') || next >= tokens.length) return;
            if (t === tokens[next]) {
              audio().playPop();
              b.classList.add('used');
              slotEls[next].textContent = t;
              slotEls[next].classList.add('filled');
              const item = P.findLetter(t);
              audio().speakSequence([item ? P.phonemePart(item, false) : t], { rate: 0.85 });
              next++;
              if (next === tokens.length) {
                pool.classList.add('done');
                if (a.tone.mark) askTone();
                else {
                  correct(null, finalParts(w));
                }
              }
            } else {
              const want = P.findLetter(tokens[next]);
              wrong(b, ['Chưa đúng rồi! Chữ tiếp theo là', want ? P.phonemePart(want, false) : tokens[next]]);
              bounce(slotEls[next], 'anim-jump', 500);
            }
          });
          pool.appendChild(b);
        });
        area.appendChild(pool);

        const askTone = () => {
          toneSlot.classList.add('active');
          const tones = el('div', 'sp-choices-wrap');
          tones.appendChild(choiceRow(toneOptions(a.tone), t => {
            const b = el('button', 'mt-card sp-tile tone');
            b.append(el('span', 'sp-tone-mark', toneSample(t)), el('span', 'sp-tone-name', t.mark ? t.name : 'ngang'));
            b.addEventListener('click', () => {
              if (st.solved || token !== st.token) return;
              if (t === a.tone) {
                toneSlot.textContent = `◌${t.mark}`.normalize('NFC');
                toneSlot.classList.add('filled');
                correct(b, finalParts(w));
              } else {
                wrong(b, ['Đây là', tonePart(t), 'Con nghe lại nhé:', w.text]);
              }
            });
            return b;
          }));
          pool.replaceWith(tones);
          bannerEl.textContent = `Tiếng "${w.text}" có dấu gì? ✨`;
          st.prompt = ['Tiếng', w.text, 'có dấu gì?'];
          audio().speakSequence(['Còn dấu thanh nữa! Tiếng', w.text, 'có dấu gì?'], { gap: 300, rate: 0.82 });
        };

        setPrompt(`Bé xếp chữ cái để viết tiếng "${w.text}" nhé! 🔤`, ['Con xếp chữ cái để viết tiếng', w.text, ...P.spellParts(w.text)]);
      }
    },

    // 3. Nghe cô đánh vần -> chọn hình
    listen: {
      icon: '👂', label: 'Nghe đánh vần',
      render(area) {
        const w = nextWord();
        const others = shuffle(BANK.filter(x => x !== w && x.a.base !== w.a.base)).slice(0, 2);
        area.appendChild(el('button', 'ls-speaker sp-big-speaker', '🔊'));
        area.lastChild.addEventListener('click', () => { audio().playPop(); playPrompt(); });
        area.appendChild(choiceRow(shuffle([w, ...others]), x => {
          const b = el('button', 'mt-card sp-pic-card', x.emoji);
          b.addEventListener('click', () => {
            if (x === w) {
              b.appendChild(el('span', 'sp-pic-word', w.text));
              correct(b, [w.text, ...(w.say ? [w.say] : [])]);
            } else {
              wrong(b, ['Đây là', x.text, 'Con nghe cô đánh vần lại nhé!', ...P.spellParts(w.text)]);
            }
          });
          return b;
        }));
        setPrompt('Bé nghe cô đánh vần rồi chọn hình đúng nhé! 👂', ['Con nghe cô đánh vần nhé!', ...P.spellParts(w.text)]);
      }
    },

    // 4. Phân tích tiếng: âm đầu / vần / dấu thanh là gì?
    analyze: {
      icon: '🔍', label: 'Phân tích tiếng',
      render(area) {
        const w = nextWord();
        const a = w.a;
        const ask = pick(['onset', 'rhyme', 'tone']);
        const box = hero(w);
        const word = el('div', 'sp-word');
        const on = el('span', 'sp-word-onset', w.text.slice(0, a.onset.length));
        const rest = el('span', 'sp-word-rest', w.text.slice(a.onset.length));
        word.append(on, rest);
        box.appendChild(word);
        area.appendChild(box);

        let opts, label, voiceQ, cls, sayOpt, isRight, reveal, doneParts;
        if (ask === 'onset') {
          opts = onsetOptions(a.onset); cls = 'onset'; label = o => o; sayOpt = onsetPart;
          isRight = o => o === a.onset; voiceQ = 'có âm đầu là gì?';
          reveal = () => on.classList.add('hl');
          doneParts = ['Tiếng', w.text, 'có âm đầu', onsetPart(a.onset)];
        } else if (ask === 'rhyme') {
          opts = rhymeOptions(a.rhyme); cls = 'rhyme'; label = r => r; sayOpt = rhymePart;
          isRight = r => r === a.rhyme; voiceQ = 'có vần gì?';
          reveal = () => rest.classList.add('hl');
          doneParts = ['Tiếng', w.text, 'có vần', rhymePart(a.rhyme)];
        } else {
          opts = toneOptions(a.tone); cls = 'tone'; label = null; sayOpt = tonePart;
          isRight = t => t === a.tone; voiceQ = 'có dấu gì?';
          reveal = () => rest.classList.add('hl-tone');
          doneParts = ['Tiếng', w.text, a.tone.mark ? 'có dấu' : 'không có dấu', ...(a.tone.mark ? [tonePart(a.tone)] : [])];
        }
        area.appendChild(choiceRow(opts, o => {
          const b = el('button', `mt-card sp-tile ${cls}`);
          if (label) b.textContent = label(o);
          else b.append(el('span', 'sp-tone-mark', toneSample(o)), el('span', 'sp-tone-name', toneLabel(o)));
          b.addEventListener('click', () => {
            if (isRight(o)) {
              reveal();
              correct(b, doneParts);
            } else {
              wrong(b, ['Đây là', sayOpt(o), 'Con đọc chậm lại cùng cô nhé:', ...P.spellParts(w.text)]);
            }
          });
          return b;
        }));
        const qText = { onset: 'có âm đầu là gì', rhyme: 'có vần gì', tone: 'có dấu gì' }[ask];
        setPrompt(`Tiếng "${w.text}" ${qText}? 🔍`, ['Tiếng', w.text, voiceQ]);
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
    nextQuestion();
  }
  function nextQuestion() {
    st.token++;
    st.solved = false;
    st.mistakes = 0;
    audio().stopAll();
    areaEl.innerHTML = '';
    areaEl.className = `mt-area sp-area mode-${st.mode}`;
    MODES[st.mode].render(areaEl);
  }

  $('spReplay').addEventListener('click', () => {
    audio().playPop();
    playPrompt();
  });

  function enter() {
    if (!st.mode) {
      st.mode = 'build';
      renderModes();
      nextQuestion();
      return;
    }
    playPrompt();
  }

  window.spellLab = { enter, selectMode, st, MODES, BANK, progress };
})();
