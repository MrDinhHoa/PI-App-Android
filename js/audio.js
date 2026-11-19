// Audio & Speech Synthesis Module for Kids App
class KidsAudio {
  constructor() {
    this.ctx = null;
    this.seqToken = 0;
    this.currentClip = null;
    this._cancelClip = null;
    this.clips = new Set();
    this.voiceMap = new Map();
    this.cachedVoices = [];
    this.initAudioContext();
    this.initVoices();
    this.loadClipIndex();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initVoices() {
    if (!('speechSynthesis' in window)) return;
    const refresh = () => {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch (_) {
        this.cachedVoices = [];
      }
    };
    refresh();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refresh);
    } else {
      window.speechSynthesis.onvoiceschanged = refresh;
    }
  }

  normalizeText(text) {
    return String(text || '')
      .trim()
      .toLowerCase()
      .normalize('NFC')
      .replace(/[!?.,…:;]+$/g, '')
      .replace(/\s+/g, ' ');
  }

  // Cute Pop sound (for button clicks, cards)
  playPop() {
    this.ensureContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Balloon Pop Sound
  playBalloonPop() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  // Success Fanfare / Chime (C - E - G - High C)
  playCelebration() {
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }, index * 90);
    });
  }

  // Boing sound
  playBoing() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  getViVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = (this.cachedVoices && this.cachedVoices.length)
      ? this.cachedVoices
      : (window.speechSynthesis.getVoices() || []);

    const viVoices = voices.filter(v => /^vi([-_]|$)/i.test(v.lang || ''));
    if (!viVoices.length) return null;

    const scoreVoice = (v) => {
      const name = (v.name || '').toLowerCase();
      let score = 0;
      if (/hoaimy|linh|mai|google tiếng việt|female|gft|vic/.test(name)) score += 10;
      if (/namminh|male/.test(name)) score -= 5;
      if (v.localService) score += 1;
      return score;
    };

    return [...viVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  }

  // Stop any speech or recorded clip that is playing
  stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (this._cancelClip) {
      const cancel = this._cancelClip;
      this._cancelClip = null;
      cancel();
    } else if (this.currentClip) {
      this.currentClip.pause();
      this.currentClip = null;
    }
  }

  // Stop everything and interrupt any running sequence
  stopAll() {
    this.seqToken = (this.seqToken || 0) + 1;
    this.stopSpeech();
  }

  // ==================== RECORDED VOICE & PHONEME CLIPS ====================
  loadClipIndex() {
    if (!window.fetch) return;
    fetch('audio/phonemes/index.json')
      .then(r => (r.ok ? r.json() : []))
      .then(list => {
        if (Array.isArray(list)) list.forEach(k => this.clips.add(k));
      })
      .catch(() => {});

    fetch('audio/voice/index.json')
      .then(r => (r.ok ? r.json() : {}))
      .then(map => {
        if (map && typeof map === 'object' && !Array.isArray(map)) {
          Object.entries(map).forEach(([text, key]) => {
            const norm = this.normalizeText(text);
            if (norm && key) this.voiceMap.set(norm, key);
          });
        }
      })
      .catch(() => {});
  }

  resolveClipUrl(part) {
    const p = typeof part === 'string' ? { text: part } : (part || {});
    if (p.clip && this.clips && this.clips.has(p.clip)) {
      return `audio/phonemes/${p.clip}.mp3`;
    }
    if (p.text && this.voiceMap && this.voiceMap.size) {
      const key = this.voiceMap.get(this.normalizeText(p.text));
      if (key) return `audio/voice/${key}.mp3`;
    }
    return null;
  }

  playUrl(url) {
    return new Promise(resolve => {
      if (this._cancelClip) {
        const prev = this._cancelClip;
        this._cancelClip = null;
        prev();
      }
      const clip = new Audio(url);
      this.currentClip = clip;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (this.currentClip === clip) this.currentClip = null;
        if (this._cancelClip === finish) this._cancelClip = null;
        try {
          clip.pause();
        } catch (_) {}
        resolve();
      };
      this._cancelClip = finish;
      clip.onended = finish;
      clip.onerror = finish;
      clip.play().catch(finish);
    });
  }

  playClip(key) {
    return this.playUrl(`audio/phonemes/${key}.mp3`);
  }

  // Voice narration in Vietnamese preschool teacher style for 5yo
  speak(text) {
    this.seqToken = (this.seqToken || 0) + 1; // interrupt any running sequence
    this.stopSpeech();

    const url = this.resolveClipUrl({ text });
    if (url) {
      this.playUrl(url);
      return;
    }
    this.speakOnce(text, 0.88);
  }

  speakOnce(text, rate) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      u.rate = rate || 0.88;
      u.pitch = 1.08;
      const viVoice = this.getViVoice();
      if (viVoice) u.voice = viVoice;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, 1500 + String(text || '').length * 250);
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    });
  }

  // part: "text" or { text, clip }
  sayPart(part, rate) {
    const p = typeof part === 'string' ? { text: part } : part;
    const url = this.resolveClipUrl(p);
    if (url) return this.playUrl(url);
    return this.speakOnce(p.text, rate);
  }

  // Speak parts one after another, slowly, with a pause between them.
  // onStep(i) is called before part i (for highlighting). Resolves true if finished,
  // false if interrupted by another speak()/speakSequence().
  async speakSequence(parts, { gap = 450, rate = 0.85, onStep } = {}) {
    this.seqToken = (this.seqToken || 0) + 1;
    const token = this.seqToken;
    this.stopSpeech();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(80);

    for (let i = 0; i < parts.length; i++) {
      if (token !== this.seqToken) return false;
      if (onStep) onStep(i);
      await this.sayPart(parts[i], rate);
      if (token !== this.seqToken) return false;
      if (i < parts.length - 1) await wait(gap);
    }
    if (onStep) onStep(-1);
    return true;
  }
}

window.kidsAudio = new KidsAudio();
