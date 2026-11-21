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
        window.abcLab.enter();
      } else if (btn.dataset.tab === 'blend') {
        window.blendLab.enter();
      } else if (btn.dataset.tab === 'spelling') {
        window.spellLab.enter();
      } else if (btn.dataset.tab === 'math') {
        window.mathLab.enter();
      }
    });
  });

  window.goToTab = name => {
    const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (btn) btn.click();
  };

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
