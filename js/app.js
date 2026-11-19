// Kids App Logic - Educational App for 5yo
document.addEventListener('DOMContentLoaded', () => {
  // Common Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.game-section');
  const starCountEl = document.getElementById('starCount');
  const rewardBox = document.getElementById('rewardBox');

  const keyCountEl = document.getElementById('keyCount');
  window.wallet.onChange(s => {
    starCountEl.textContent = s.stars;
    keyCountEl.textContent = s.keys;
  });

  function addStar(count = 1) {
    window.wallet.addStars(count);
    rewardBox.classList.add('pulse');
    setTimeout(() => rewardBox.classList.remove('pulse'), 500);
    spawnConfetti();
  }

  // A big key flies from the screen centre into the header counter, then the key is added
  function awardKey() {
    const target = document.getElementById('keyBox').getBoundingClientRect();
    const key = document.createElement('div');
    key.className = 'flying-key';
    key.textContent = '🔑';
    document.body.appendChild(key);
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    key.style.left = `${startX}px`;
    key.style.top = `${startY}px`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      key.classList.add('go');
      key.style.left = `${target.left + target.width / 2}px`;
      key.style.top = `${target.top + target.height / 2}px`;
    }));
    setTimeout(() => {
      key.remove();
      window.wallet.addKeys(1);
      const box = document.getElementById('keyBox');
      box.classList.add('pulse');
      setTimeout(() => box.classList.remove('pulse'), 500);
      window.kidsAudio.playBoing();
    }, 1300);
  }
  window.awardKey = awardKey;
  window.addStar = addStar; // shared with phonics.js / lessons.js
  window.spawnConfetti = () => spawnConfetti();

  // ==================== TAB NAVIGATION ====================
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.kidsAudio.playPop();
      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `sec-${btn.dataset.tab}`;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Leaving the game tab pauses a running game
      if (btn.dataset.tab !== 'games' && window.minigame) window.minigame.pause();

      if (btn.dataset.tab === 'lessons') {
        window.lessons.enter();
      } else if (btn.dataset.tab === 'games') {
        window.minigame.enter();
      } else if (btn.dataset.tab === 'alphabet') {
        window.kidsAudio.speak('Bảng chữ cái! Con chạm vào chữ để nghe cô đọc nhé!');
        window.phonics.enterAlphabet();
      } else if (btn.dataset.tab === 'blend') {
        window.kidsAudio.speak('Cỗ máy ghép vần! Con kéo chữ vào máy cùng cô nhé!');
        window.phonics.enterBlend();
      } else if (btn.dataset.tab === 'spelling') {
        window.kidsAudio.speak('Con cùng cô tập đánh vần nhé!');
        loadSpellingWord();
      } else if (btn.dataset.tab === 'math') {
        window.kidsAudio.speak('Con cùng cô làm toán vui nhé!');
        newMathQuestion();
      }
    });
  });

  window.goToTab = name => {
    const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (btn) btn.click();
  };

  // ==================== 2. SPELLING MODULE (TẬP ĐÁNH VẦN) ====================
  const spellingData = [
    { word: 'CÁ', emoji: '🐟', phonics: 'Cờ - A - Ca - sắc - CÁ! Con cá!', name: 'Con cá' },
    { word: 'GÀ', emoji: '🐔', phonics: 'Gờ - A - Ga - huyền - GÀ! Con gà trống!', name: 'Con gà' },
    { word: 'BÒ', emoji: '🐮', phonics: 'Bờ - O - Bo - huyền - BÒ! Chú bò sữa!', name: 'Con bò' },
    { word: 'XE', emoji: '🚗', phonics: 'Xờ - E - XE! Chiếc xe ô tô!', name: 'Xe ô tô' },
    { word: 'MÈO', emoji: '🐱', phonics: 'Mờ - Eo - Meo - huyền - MÈO! Bạn mèo con!', name: 'Mèo con' },
    { word: 'CHÓ', emoji: '🐶', phonics: 'Chờ - O - Cho - sắc - CHÓ! Chú cún ngoan!', name: 'Chú chó' },
    { word: 'TÁO', emoji: '🍎', phonics: 'Tờ - Ao - Tao - sắc - TÁO! Quả táo đỏ!', name: 'Quả táo' },
    { word: 'HOA', emoji: '🌸', phonics: 'Hờ - Oa - HOA! Bông hoa đẹp!', name: 'Bông hoa' }
  ];

  let currentSpellingIdx = 0;
  let userLetters = [];
  const spellingPicEl = document.getElementById('spellingPic');
  const spellingSlotsEl = document.getElementById('spellingSlots');
  const spellingLettersPoolEl = document.getElementById('spellingLettersPool');
  const spellingStatusEl = document.getElementById('spellingStatus');
  const btnSpellingAudio = document.getElementById('btnSpellingAudio');

  // Distractor letters to mix in
  const extraLetters = ['B', 'C', 'D', 'E', 'H', 'M', 'N', 'O', 'T', 'X'];

  function loadSpellingWord() {
    const item = spellingData[currentSpellingIdx];
    spellingPicEl.textContent = item.emoji;
    spellingStatusEl.textContent = `Bé hãy ghép tên "${item.name}" nào!`;

    const targetWord = item.word;
    userLetters = new Array(targetWord.length).fill(null);

    // Create empty slots
    spellingSlotsEl.innerHTML = '';
    for (let i = 0; i < targetWord.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'spelling-slot';
      slot.dataset.index = i;
      slot.addEventListener('click', () => removeLetterFromSlot(i));
      spellingSlotsEl.appendChild(slot);
    }

    // Prepare letters pool (Target letters + 2 random distractors)
    const lettersToOffer = targetWord.split('');
    while (lettersToOffer.length < targetWord.length + 2) {
      const randChar = extraLetters[Math.floor(Math.random() * extraLetters.length)];
      if (!lettersToOffer.includes(randChar)) {
        lettersToOffer.push(randChar);
      }
    }
    // Shuffle
    lettersToOffer.sort(() => Math.random() - 0.5);

    // Render pool
    spellingLettersPoolEl.innerHTML = '';
    lettersToOffer.forEach((char, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'spelling-bubble';
      bubble.textContent = char;
      bubble.dataset.char = char;
      bubble.dataset.bubbleId = `bubble-${idx}`;
      bubble.addEventListener('click', () => placeLetterInSlot(char, bubble));
      spellingLettersPoolEl.appendChild(bubble);
    });
  }

  function placeLetterInSlot(char, bubbleEl) {
    // Find first empty slot
    const emptyIdx = userLetters.findIndex(val => val === null);
    if (emptyIdx === -1) return; // All slots filled

    window.kidsAudio.playPop();
    const lower = char.toLowerCase();
    const letterItem = window.phonicsUtil && window.phonicsUtil.findLetter(lower);
    if (letterItem) {
      window.kidsAudio.speakSequence([window.phonicsUtil.phonemePart(letterItem, false)], { rate: 0.85 });
    } else {
      window.kidsAudio.speakSequence([lower], { rate: 0.85 });
    }

    userLetters[emptyIdx] = { char, bubbleEl };
    bubbleEl.classList.add('used');

    const slots = spellingSlotsEl.querySelectorAll('.spelling-slot');
    slots[emptyIdx].textContent = char;
    slots[emptyIdx].classList.add('filled');

    // Check if full
    if (!userLetters.includes(null)) {
      checkSpellingResult();
    }
  }

  function removeLetterFromSlot(slotIdx) {
    if (!userLetters[slotIdx]) return;

    window.kidsAudio.playBoing();
    const item = userLetters[slotIdx];
    item.bubbleEl.classList.remove('used');
    userLetters[slotIdx] = null;

    const slots = spellingSlotsEl.querySelectorAll('.spelling-slot');
    slots[slotIdx].textContent = '';
    slots[slotIdx].classList.remove('filled');
  }

  function checkSpellingResult() {
    const currentWord = spellingData[currentSpellingIdx].word;
    const constructedWord = userLetters.map(item => item.char).join('');

    if (constructedWord === currentWord) {
      // Correct!
      window.kidsAudio.playCelebration();
      spellingStatusEl.textContent = `🎉 Tuyệt vời! ${spellingData[currentSpellingIdx].phonics}`;
      addStar(2);

      setTimeout(() => {
        window.kidsAudio.speak(spellingData[currentSpellingIdx].phonics);
        setTimeout(() => {
          currentSpellingIdx = (currentSpellingIdx + 1) % spellingData.length;
          loadSpellingWord();
        }, 3200);
      }, 300);
    } else {
      // Wrong
      window.kidsAudio.playBoing();
      spellingStatusEl.textContent = 'Chưa đúng rồi! Bé chạm vào ô chữ để thử lại nhé!';
      setTimeout(() => {
        window.kidsAudio.speak('Chưa đúng rồi, con thử lại cùng cô nhé!');
      }, 200);
    }
  }

  btnSpellingAudio.addEventListener('click', () => {
    window.kidsAudio.playPop();
    const item = spellingData[currentSpellingIdx];
    window.kidsAudio.speakSequence(['Con hãy ghép chữ', item.word.toLowerCase(), item.name], { gap: 200, rate: 0.85 });
  });

  // ==================== 3. MATH MODULE (BÉ LÀM TOÁN) ====================
  const MATH_NUM_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
  const mathNumWord = n => MATH_NUM_WORDS[n] || String(n);

  const mathEmojis = [
    { emoji: '🍎', name: 'quả táo' },
    { emoji: '🍓', name: 'quả dâu' },
    { emoji: '🦆', name: 'chú vịt' },
    { emoji: '🚗', name: 'chiếc xe' },
    { emoji: '🎈', name: 'quả bóng' }
  ];

  const mathGroup1El = document.getElementById('mathGroup1');
  const mathGroup2El = document.getElementById('mathGroup2');
  const mathOpEl = document.getElementById('mathOp');
  const mathTargetEl = document.getElementById('mathTarget');
  const mathPromptTextEl = document.getElementById('mathPromptText');
  const mathChoicesEl = document.getElementById('mathChoices');
  const btnMathAudio = document.getElementById('btnMathAudio');

  let currentAnswer = 0;
  let currentMathQuestionParts = [];

  function newMathQuestion() {
    mathTargetEl.textContent = '?';
    mathTargetEl.classList.remove('solved');

    const item = mathEmojis[Math.floor(Math.random() * mathEmojis.length)];
    // Random operator: 70% addition, 30% subtraction
    const isAddition = Math.random() > 0.3;

    let num1, num2;
    if (isAddition) {
      num1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
      num2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
      currentAnswer = num1 + num2;
      mathOpEl.textContent = '+';
      currentMathQuestionParts = [mathNumWord(num1), item.name, 'cộng', mathNumWord(num2), item.name, 'bằng mấy', item.name];
      mathPromptTextEl.textContent = `Bé hãy tính: ${num1} ${item.name} + ${num2} ${item.name} = ?`;
    } else {
      num1 = Math.floor(Math.random() * 4) + 2; // 2 to 5
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to num1-1
      currentAnswer = num1 - num2;
      mathOpEl.textContent = '−';
      currentMathQuestionParts = [mathNumWord(num1), item.name, 'bớt', mathNumWord(num2), item.name, 'còn mấy', item.name];
      mathPromptTextEl.textContent = `Bé hãy tính: ${num1} ${item.name} − ${num2} ${item.name} = ?`;
    }

    // Render items in Group 1
    mathGroup1El.innerHTML = '';
    for (let i = 0; i < num1; i++) {
      const span = document.createElement('span');
      span.className = 'math-mini-item';
      span.textContent = item.emoji;
      span.addEventListener('click', () => {
        window.kidsAudio.playPop();
        window.kidsAudio.speak(mathNumWord(i + 1));
      });
      mathGroup1El.appendChild(span);
    }

    // Render items in Group 2
    mathGroup2El.innerHTML = '';
    for (let i = 0; i < num2; i++) {
      const span = document.createElement('span');
      span.className = 'math-mini-item';
      span.textContent = item.emoji;
      span.addEventListener('click', () => {
        window.kidsAudio.playPop();
        window.kidsAudio.speak(mathNumWord(i + 1));
      });
      mathGroup2El.appendChild(span);
    }

    // Create 3 answer choices (1 correct, 2 distractors)
    const choices = [currentAnswer];
    while (choices.length < 3) {
      const distractor = Math.max(1, currentAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1));
      if (!choices.includes(distractor) && distractor > 0) {
        choices.push(distractor);
      }
    }
    choices.sort(() => Math.random() - 0.5);

    mathChoicesEl.innerHTML = '';
    choices.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'math-choice-btn';
      btn.textContent = val;
      btn.addEventListener('click', () => {
        if (val === currentAnswer) {
          // Correct answer
          mathTargetEl.textContent = val;
          mathTargetEl.classList.add('solved');
          window.kidsAudio.playCelebration();
          addStar(2);

          mathPromptTextEl.textContent = `🎉 Hoan hô! Kết quả là ${val}!`;
          setTimeout(() => {
            window.kidsAudio.speakSequence(['Cô khen con, đúng rồi! Kết quả là', mathNumWord(val)], { gap: 180, rate: 0.88 });
            setTimeout(newMathQuestion, 2800);
          }, 300);
        } else {
          // Wrong answer
          window.kidsAudio.playBoing();
          btn.style.transform = 'scale(0.85)';
          setTimeout(() => btn.style.transform = '', 200);
          window.kidsAudio.speak('Chưa đúng rồi, con đếm lại cùng cô nhé!');
        }
      });
      mathChoicesEl.appendChild(btn);
    });
  }

  btnMathAudio.addEventListener('click', () => {
    window.kidsAudio.playPop();
    window.kidsAudio.speakSequence(currentMathQuestionParts, { gap: 150, rate: 0.88 });
  });

  // ==================== CONFETTI EFFECT ====================
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let confettiParticles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function spawnConfetti() {
    const colors = ['#FF6B6B', '#48DBFB', '#FED330', '#1DD1A1', '#FF9FF3', '#54A0FF'];
    for (let i = 0; i < 35; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.3 + (Math.random() * 50),
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.8) * 10,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }
  }

  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.rotation += p.rSpeed;
      p.opacity -= 0.015;

      if (p.opacity <= 0) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    requestAnimationFrame(updateConfetti);
  }
  updateConfetti();
});
