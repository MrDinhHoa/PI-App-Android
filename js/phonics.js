// Giai đoạn 1: Bảng chữ cái (Chạm là phát âm) + Cỗ máy ghép vần & thanh điệu
(function () {
  const D = window.PHONICS_DATA;
  const audio = () => window.kidsAudio;
  const star = n => { if (window.addStar) window.addStar(n); };

  const TONE_MARKS = /[̣̀́̃̉]/g;
  const stripTones = s => s.normalize('NFD').replace(TONE_MARKS, '').normalize('NFC');

  // ASCII file name for a letter (Telex style): đ→dd, ă→aw, â→aa, ê→ee, ô→oo, ơ→ow, ư→uw
  const SLUG_MAP = { 'đ': 'dd', 'ă': 'aw', 'â': 'aa', 'ê': 'ee', 'ô': 'oo', 'ơ': 'ow', 'ư': 'uw' };
  const slug = s => [...s].map(ch => SLUG_MAP[ch] || ch).join('');

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
  const applyTone = (syllable, mark) =>
    mark ? syllable.slice(0, -1) + (syllable.slice(-1) + mark).normalize('NFC') : syllable;

  const allLetters = [...D.alphabet.vowel, ...D.alphabet.consonant, ...D.alphabet.digraph];
  const findLetter = l => allLetters.find(x => x.letter === l);

  // Phoneme part for speakSequence (uses recorded clip "am-<slug>" if available)
  const phonemePart = (item, forBlend) => ({
    text: forBlend && item.blend ? item.blend : item.sound,
    clip: `am-${slug(item.letter)}${forBlend && item.blend ? '-ghep' : ''}`
  });
  const tonePart = tone => ({ text: tone.name, clip: `thanh-${tone.key}` });

  function bounceClass(el, cls, ms = 650) {
    el.classList.remove(cls);
    void el.offsetWidth; // restart animation
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  // ==================== CẤP ĐỘ 1: BẢNG CHỮ CÁI ====================
  const abc = {
    group: 'vowel',
    heard: new Set(),
    current: null,
    rendered: false
  };

  const abcGrid = document.getElementById('abcGrid');
  const abcDetail = document.getElementById('abcDetail');
  const abcBig = document.getElementById('abcBig');
  const abcPic = document.getElementById('abcPic');
  const abcWord = document.getElementById('abcWord');
  const abcNote = document.getElementById('abcNote');
  const abcGroupBtns = document.querySelectorAll('.abc-group-btn');
  const btnAbcReplay = document.getElementById('btnAbcReplay');

  const groupVoice = { vowel: 'Nguyên âm', consonant: 'Phụ âm', digraph: 'Phụ âm ghép' };

  function renderAbcGrid() {
    abcGrid.innerHTML = '';
    abcGrid.className = `abc-grid grp-${abc.group}`;
    D.alphabet[abc.group].forEach(item => {
      const tile = document.createElement('button');
      tile.className = 'abc-tile';
      tile.textContent = item.letter;
      if (abc.heard.has(item.letter)) tile.classList.add('heard');
      if (abc.current === item) tile.classList.add('selected');
      tile.addEventListener('click', () => selectLetter(item, tile));
      abcGrid.appendChild(tile);
    });
  }

  function groupOf(item) {
    return Object.keys(D.alphabet).find(g => D.alphabet[g].includes(item));
  }

  function renderWordWithHighlight(item) {
    abcWord.innerHTML = '';
    const plain = stripTones(item.word);
    const idx = plain.indexOf(item.letter);
    const chars = [...item.word];
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      if (idx >= 0 && i >= idx && i < idx + item.letter.length) span.className = 'hl';
      abcWord.appendChild(span);
    });
  }

  function showDetail(item) {
    abcDetail.className = `abc-detail grp-${groupOf(item)}`;
    abcBig.textContent = `${capitalize(item.letter)} ${item.letter}`;
    abcBig.classList.toggle('long', item.letter.length >= 3);
    abcPic.textContent = item.emoji;
    renderWordWithHighlight(item);
    abcNote.textContent = item.note || '';
    bounceClass(abcBig, item.anim || 'anim-jump', 900);
    bounceClass(abcPic, 'anim-pop', 600);
  }

  function playLetter(item) {
    abcBig.classList.remove('speaking');
    abcWord.classList.remove('speaking');
    audio().speakSequence([phonemePart(item, false), item.word], {
      gap: 550,
      rate: 0.8,
      onStep: i => {
        abcBig.classList.toggle('speaking', i === 0);
        abcWord.classList.toggle('speaking', i === 1);
      }
    });
  }

  function selectLetter(item, tile) {
    audio().playPop();
    abc.current = item;
    abcGrid.querySelectorAll('.abc-tile').forEach(t => t.classList.remove('selected'));
    tile.classList.add('selected');
    bounceClass(tile, item.anim || 'anim-jump', 900);
    showDetail(item);
    playLetter(item);

    if (!abc.heard.has(item.letter)) {
      abc.heard.add(item.letter);
      tile.classList.add('heard');
      star(1);
    }
  }

  abcGroupBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      audio().playPop();
      abc.group = btn.dataset.group;
      abcGroupBtns.forEach(b => b.classList.toggle('active', b === btn));
      renderAbcGrid();
      audio().speak(groupVoice[abc.group]);
    });
  });

  btnAbcReplay.addEventListener('click', () => {
    audio().playPop();
    if (abc.current) playLetter(abc.current);
    else audio().speak('Con chạm vào một chữ cái cùng cô nhé!');
  });

  function enterAlphabet() {
    if (!abc.rendered) {
      renderAbcGrid();
      abc.rendered = true;
    }
  }

  // ==================== CẤP ĐỘ 2: CỖ MÁY GHÉP VẦN ====================
  const blend = {
    c: null,         // consonant item
    v: null,         // vowel item
    base: null,      // syllable without tone, e.g. "ba"
    tone: null,      // tone object currently applied
    ready: false,    // blended successfully -> tones enabled
    rewarded: new Set(),
    rendered: false,
    vMode: 'vowel'   // khay bên phải: 'vowel' (nguyên âm) hoặc 'rhyme' (vần)
  };

  // Tiếng có nghĩa: tra trong từ điển gộp của blend-lab.js (nếu đã nạp), không thì PHONICS_DATA.words
  const lookupWord = s => (window.blendLab && window.blendLab.lookup(s)) || D.words[s] || null;

  // Sổ sưu tập: các tiếng có nghĩa bé đã ghép được (lưu lại giữa các lần mở app)
  const FOUND_KEY = 'beHocVui.blendFound.v1';
  let found = new Set();
  try { found = new Set(JSON.parse(localStorage.getItem(FOUND_KEY)) || []); } catch (e) { found = new Set(); }
  function markFound(s) {
    if (found.has(s)) return;
    found.add(s);
    try { localStorage.setItem(FOUND_KEY, JSON.stringify([...found])); } catch (e) { /* ignore */ }
  }

  // Phần đọc của ô bên phải: nguyên âm (âm vị) hoặc vần (file van-<vần>.mp3)
  const vPart = v => (v.isRhyme ? { text: v.letter, clip: `van-${slug(v.letter)}` } : phonemePart(v, true));
  const rhymeItem = r => ({ letter: r, sound: r, isRhyme: true });
  const toneVowel = () => (blend.v ? blend.v.letter : (blend.vMode === 'rhyme' ? 'eo' : 'a'));

  const trayC = document.getElementById('blendConsonants');
  const trayV = document.getElementById('blendVowels');
  const machine = document.getElementById('blendMachine');
  const slotC = document.getElementById('slotC');
  const slotV = document.getElementById('slotV');
  const resultEl = document.getElementById('blendResult');
  const pictureEl = document.getElementById('blendPicture');
  const toneBar = document.getElementById('toneBar');
  const statusEl = document.getElementById('blendStatus');
  const btnBlendReplay = document.getElementById('btnBlendReplay');
  const btnBlendReset = document.getElementById('btnBlendReset');

  function setStatus(text) {
    statusEl.textContent = text;
  }

  // Pointer-based drag & drop that works with finger and mouse. A short tap = onTap.
  function makeDraggable(tile, { onTap, onDrop }) {
    tile.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      let ghost = null;
      try { tile.setPointerCapture(e.pointerId); } catch (err) { /* synthetic/unsupported pointer */ }

      const overMachine = (x, y) => {
        const el = document.elementFromPoint(x, y);
        return !!(el && el.closest('#blendMachine'));
      };

      const onMove = ev => {
        if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 10) {
          ghost = tile.cloneNode(true);
          ghost.classList.add('drag-ghost');
          document.body.appendChild(ghost);
          tile.classList.add('dragging');
        }
        if (ghost) {
          ghost.style.left = `${ev.clientX}px`;
          ghost.style.top = `${ev.clientY}px`;
          machine.classList.toggle('drop-hover', overMachine(ev.clientX, ev.clientY));
        }
      };

      const end = (ev, cancelled) => {
        tile.removeEventListener('pointermove', onMove);
        tile.removeEventListener('pointerup', onUp);
        tile.removeEventListener('pointercancel', onCancel);
        machine.classList.remove('drop-hover');
        if (ghost) {
          ghost.remove();
          tile.classList.remove('dragging');
          if (!cancelled && overMachine(ev.clientX, ev.clientY)) onDrop();
          else if (!cancelled) audio().playBoing();
        } else if (!cancelled) {
          onTap();
        }
      };
      const onUp = ev => end(ev, false);
      const onCancel = ev => end(ev, true);

      tile.addEventListener('pointermove', onMove);
      tile.addEventListener('pointerup', onUp);
      tile.addEventListener('pointercancel', onCancel);
    });
  }

  function renderTrays() {
    trayC.innerHTML = '';
    D.blendConsonants.forEach(l => {
      const item = findLetter(l);
      const tile = document.createElement('div');
      tile.className = 'blend-tile tile-consonant';
      tile.textContent = l;
      tile.dataset.letter = l;
      makeDraggable(tile, { onTap: () => place('c', item), onDrop: () => place('c', item) });
      trayC.appendChild(tile);
    });

    renderVowelTray();
  }

  function renderVowelTray() {
    trayV.innerHTML = '';
    trayV.classList.toggle('rhymes', blend.vMode === 'rhyme');
    const toggle = document.createElement('div');
    toggle.className = 'tray-toggle';
    [['vowel', 'Âm'], ['rhyme', 'Vần']].forEach(([mode, label]) => {
      const b = document.createElement('button');
      b.className = `tray-toggle-btn${blend.vMode === mode ? ' active' : ''}`;
      b.textContent = label;
      b.addEventListener('click', () => {
        if (blend.vMode === mode) return;
        audio().playPop();
        setVowelMode(mode);
        audio().speak(mode === 'rhyme' ? 'Khay vần!' : 'Khay nguyên âm!');
      });
      toggle.appendChild(b);
    });
    trayV.appendChild(toggle);

    const list = blend.vMode === 'rhyme'
      ? ((window.LESSONS_DATA && window.LESSONS_DATA.rhymes) || []).map(r => rhymeItem(r.rhyme))
      : D.blendVowels.map(l => findLetter(l));
    list.forEach(item => {
      const tile = document.createElement('div');
      tile.className = `blend-tile tile-vowel${item.isRhyme ? ' tile-rhyme' : ''}`;
      tile.textContent = item.letter;
      tile.dataset.letter = item.letter;
      makeDraggable(tile, { onTap: () => place('v', item), onDrop: () => place('v', item) });
      trayV.appendChild(tile);
    });
  }

  function setVowelMode(mode) {
    if (blend.vMode === mode && trayV.childElementCount) return;
    blend.vMode = mode;
    renderVowelTray();
  }

  function renderToneBar() {
    toneBar.innerHTML = '';
    const vowel = toneVowel();
    D.tones.forEach(tone => {
      const btn = document.createElement('button');
      btn.className = 'tone-btn';
      btn.dataset.tone = tone.key;
      if (blend.tone === tone) btn.classList.add('active');
      btn.innerHTML = `<span class="tone-char"></span><span class="tone-name"></span>`;
      btn.querySelector('.tone-char').textContent = placeTone(vowel, tone.mark);
      btn.querySelector('.tone-name').textContent = tone.name;
      btn.addEventListener('click', () => chooseTone(tone, btn));
      toneBar.appendChild(btn);
    });
    toneBar.classList.toggle('disabled', !blend.ready);
  }

  function clearHighlights() {
    [slotC, slotV, resultEl].forEach(el => el.classList.remove('speaking'));
    toneBar.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('speaking'));
  }

  function renderSlots() {
    slotC.textContent = blend.c ? blend.c.letter : '';
    slotC.classList.toggle('filled', !!blend.c);
    slotV.textContent = blend.v ? blend.v.letter : '';
    slotV.classList.toggle('filled', !!blend.v);
  }

  function resetResult() {
    blend.base = null;
    blend.tone = null;
    blend.ready = false;
    resultEl.textContent = '?';
    resultEl.classList.remove('done');
    machine.classList.remove('merged');
    pictureEl.innerHTML = '';
    pictureEl.classList.remove('show');
    renderToneBar();
  }

  function place(type, item) {
    audio().playPop();
    blend[type] = item;
    renderSlots();
    resetResult();
    clearHighlights();
    const slot = type === 'c' ? slotC : slotV;
    bounceClass(slot, 'anim-pop', 500);

    if (blend.c && blend.v) {
      tryBlend();
    } else {
      audio().speakSequence([type === 'v' ? vPart(item) : phonemePart(item, true)], { rate: 0.8 });
      setStatus(type === 'c'
        ? `Giỏi lắm! Giờ bé kéo một ${blend.vMode === 'rhyme' ? 'vần' : 'nguyên âm'} màu đỏ vào cỗ máy nhé!`
        : 'Giỏi lắm! Giờ bé kéo một phụ âm màu xanh vào cỗ máy nhé!');
    }
  }

  function spellingProblem(c, v) {
    const isFront = D.frontVowels.includes((v.letter || '')[0]);
    return D.spellingRules.find(r => r.consonant === c.letter && r.front === isFront) || null;
  }

  function tryBlend() {
    const problem = spellingProblem(blend.c, blend.v);
    if (problem) {
      audio().playBoing();
      bounceClass(slotC, 'anim-shake', 600);
      setStatus(`🤔 ${problem.hint}`);
      audio().speak(problem.hint);
      const suggest = trayC.querySelector(`[data-letter="${problem.suggest}"]`);
      if (suggest) bounceClass(suggest, 'anim-suggest', 2400);
      setTimeout(() => {
        if (spellingProblem(blend.c || {}, blend.v || {}) === problem) {
          blend.c = null;
          renderSlots();
        }
      }, 900);
      return;
    }
    doBlend();
  }

  // "Bờ... a... ba!"
  async function doBlend() {
    const c = blend.c;
    const v = blend.v;
    const base = c.letter + v.letter;
    blend.base = base;
    setStatus(`${capitalize(c.blend || c.sound)}... ${v.sound}... ${base}!`);

    const finished = await audio().speakSequence(
      [phonemePart(c, true), vPart(v), base],
      {
        gap: 500,
        rate: 0.75,
        onStep: i => {
          clearHighlights();
          if (i === 0) slotC.classList.add('speaking');
          if (i === 1) slotV.classList.add('speaking');
          if (i === 2) {
            resultEl.textContent = base;
            resultEl.classList.add('done', 'speaking');
            machine.classList.add('merged');
            bounceClass(resultEl, 'anim-pop', 600);
            audio().playCelebration();
          }
        }
      }
    );
    if (!finished || blend.base !== base) return;

    blend.ready = true;
    blend.tone = D.tones[0];
    renderToneBar();
    if (!blend.rewarded.has(base)) {
      blend.rewarded.add(base);
      star(1);
    }

    const word = lookupWord(base);
    if (word) {
      showPicture(base, word);
      markFound(base);
      await audio().speakSequence([word.say], { rate: 0.9 });
    }
    if (blend.base === base && blend.tone === D.tones[0]) {
      setStatus(`🎉 ${capitalize(base)}! Bé chạm vào một dấu thanh bên dưới nhé!`);
      notify(base, base, 'base');
    }
  }

  // Báo cho chế độ Thử thách (blend-lab.js) biết bé vừa ghép xong tiếng nào
  function notify(base, toned, stage) {
    if (window.phonics.onResult) window.phonics.onResult({ base, toned, stage });
  }

  function showPicture(syllable, word) {
    pictureEl.innerHTML = '';
    const emoji = document.createElement('span');
    emoji.className = 'blend-picture-emoji';
    emoji.textContent = word.emoji;
    const label = document.createElement('span');
    label.className = 'blend-picture-word';
    label.textContent = syllable;
    pictureEl.append(emoji, label);
    pictureEl.classList.add('show');
    bounceClass(pictureEl, 'anim-pop', 600);
  }

  // "Bờ - a - ba - sắc - bá"
  async function chooseTone(tone, btn) {
    if (!blend.ready) {
      audio().playBoing();
      audio().speak('Con ghép tiếng trước, rồi mới chọn dấu nhé!');
      setStatus('Bé ghép phụ âm với nguyên âm trước, rồi mới chọn dấu nhé!');
      return;
    }
    audio().playPop();
    blend.tone = tone;
    toneBar.querySelectorAll('.tone-btn').forEach(b => b.classList.toggle('active', b === btn));
    await spellCurrent();
  }

  async function spellCurrent() {
    const { c, v, base, tone } = blend;
    if (!base) return;
    const toned = placeTone(base, tone ? tone.mark : '');
    const hasMark = tone && tone.mark;
    resultEl.textContent = toned;
    bounceClass(resultEl, 'anim-pop', 600);
    pictureEl.classList.remove('show');
    setStatus(hasMark
      ? `${capitalize(c.blend || c.sound)} - ${v.sound} - ${base} - ${tone.name} - ${toned}`
      : `${capitalize(c.blend || c.sound)} - ${v.sound} - ${base}`);

    const toneBtn = toneBar.querySelector(`[data-tone="${tone ? tone.key : 'ngang'}"]`);
    const parts = [phonemePart(c, true), vPart(v), base];
    if (hasMark) parts.push(tonePart(tone), toned);

    const finished = await audio().speakSequence(parts, {
      gap: 450,
      rate: 0.75,
      onStep: i => {
        clearHighlights();
        if (i === 0) slotC.classList.add('speaking');
        if (i === 1) slotV.classList.add('speaking');
        if (i === 2 || i === 4) resultEl.classList.add('speaking');
        if (i === 3 && toneBtn) toneBtn.classList.add('speaking');
      }
    });
    if (!finished || blend.base !== base || blend.tone !== tone) return;

    const word = lookupWord(toned);
    if (word) {
      showPicture(toned, word);
      audio().playCelebration();
      markFound(toned);
      if (!blend.rewarded.has(toned)) {
        blend.rewarded.add(toned);
        star(1);
      }
      await audio().speakSequence([word.say], { rate: 0.9 });
    }
    if (blend.base === base && blend.tone === tone) notify(base, toned, 'tone');
  }

  btnBlendReplay.addEventListener('click', () => {
    audio().playPop();
    if (blend.ready) spellCurrent();
    else if (blend.c && blend.v) tryBlend();
    else audio().speak('Con kéo phụ âm và nguyên âm vào cỗ máy nhé!');
  });

  btnBlendReset.addEventListener('click', () => {
    audio().playBoing();
    resetBlend();
    audio().speak('Ghép tiếng mới cùng cô nào!');
  });

  slotC.addEventListener('click', () => {
    if (!blend.c) return;
    audio().playBoing();
    blend.c = null;
    renderSlots();
    resetResult();
  });
  slotV.addEventListener('click', () => {
    if (!blend.v) return;
    audio().playBoing();
    blend.v = null;
    renderSlots();
    resetResult();
  });

  function resetBlend() {
    blend.c = null;
    blend.v = null;
    renderSlots();
    resetResult();
    clearHighlights();
    setStatus(blend.vMode === 'rhyme'
      ? 'Bé kéo một phụ âm màu xanh và một vần màu đỏ vào cỗ máy nhé!'
      : 'Bé kéo một phụ âm màu xanh và một nguyên âm màu đỏ vào cỗ máy nhé!');
  }

  function enterBlend() {
    if (!blend.rendered) {
      renderTrays();
      resetBlend();
      blend.rendered = true;
    }
  }

  // ==================== PHÂN TÍCH & ĐÁNH VẦN MỘT TIẾNG ====================
  // "mèo" -> onset "m", rhyme "eo", base "meo", tone huyền
  const ONSETS = ['ngh', 'ng', 'gh', 'gi', 'kh', 'nh', 'ph', 'qu', 'th', 'tr', 'ch',
                  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'];
  const VOWEL_CHARS = 'aăâeêioôơuưy';

  function analyzeSyllable(syllable) {
    const lower = syllable.toLowerCase().normalize('NFC');
    const nfd = lower.normalize('NFD');
    const tone = D.tones.find(t => t.mark && nfd.includes(t.mark)) || D.tones[0];
    const base = stripTones(lower);
    let onset = ONSETS.find(o => base.startsWith(o)) || '';
    // "gì", "gìn": gi is g + vần i...
    if (onset === 'gi' && (base.length === 2 || !VOWEL_CHARS.includes(base[2]))) onset = 'g';
    return { syllable: lower, base, onset, rhyme: base.slice(onset.length), tone };
  }

  function rhymePart(rhyme) {
    const single = rhyme.length === 1 && findLetter(rhyme);
    return single ? phonemePart(single, true) : { text: rhyme, clip: `van-${slug(rhyme)}` };
  }

  // Đặt dấu thanh đúng vị trí (kiểu cũ, như SGK hiện dùng: hòa, thủy):
  // - có ă â ê ô ơ ư: đặt vào chữ đó (ươ -> ơ);  - vần có âm cuối: nguyên âm cuối (bóng, hoàn);
  // - vần mở 2 nguyên âm: nguyên âm đầu (mèo, tài, hòa);  3 nguyên âm: nguyên âm giữa (ngoài).
  function placeTone(base, mark) {
    if (!mark) return base;
    const chars = [...base.normalize('NFC')];
    const start = analyzeSyllable(chars.join('')).onset.length;
    const vIdx = [];
    for (let i = start; i < chars.length; i++) if (VOWEL_CHARS.includes(chars[i])) vIdx.push(i);
    if (!vIdx.length) return base;
    const special = vIdx.filter(i => 'ăâêôơư'.includes(chars[i]));
    let t;
    if (special.length) t = special[special.length - 1];
    else if (vIdx[vIdx.length - 1] < chars.length - 1) t = vIdx[vIdx.length - 1];
    else if (vIdx.length >= 3) t = vIdx[1];
    else t = vIdx[0];
    chars[t] = (chars[t] + mark).normalize('NFC');
    return chars.join('');
  }

  // Parts for speakSequence: "Mờ - eo - meo - huyền - mèo"
  function spellParts(syllable) {
    const a = analyzeSyllable(syllable);
    const parts = [];
    if (!a.onset) {
      parts.push(rhymePart(a.base));
    } else {
      parts.push(phonemePart(findLetter(a.onset), true), rhymePart(a.rhyme), a.base);
    }
    if (a.tone.mark) parts.push(tonePart(a.tone), a.syllable);
    return parts;
  }

  window.phonics = {
    enterAlphabet, enterBlend, setVowelMode, resetBlend,
    found: () => found, markFound, onResult: null
  };
  window.phonicsUtil = {
    stripTones, applyTone, slug, capitalize, findLetter,
    phonemePart, tonePart, analyzeSyllable, spellParts, placeTone
  };
})();
