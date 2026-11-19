// Audio & Speech Synthesis Module for Kids App
class KidsAudio {
  constructor() {
    this.ctx = null;
    this.seqToken = 0;
    this.currentClip = null;
    this.initAudioContext();
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

    // Noise buffer for realistic balloon pop
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
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.includes('vi') || v.lang.includes('VN')) || null;
  }

  // Stop any speech or recorded clip that is playing
  stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (this.currentClip) {
      this.currentClip.pause();
      this.currentClip = null;
    }
  }

  // Stop everything and interrupt any running sequence
  stopAll() {
    this.seqToken = (this.seqToken || 0) + 1;
    this.stopSpeech();
  }

  // Voice narration in Vietnamese for 5yo
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    this.seqToken = (this.seqToken || 0) + 1; // interrupt any running sequence
    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Slightly slower, friendly for 5yo
    utterance.pitch = 1.25; // Cheerful, higher pitch suitable for kids

    const viVoice = this.getViVoice();
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  }

  // ==================== RECORDED PHONEME CLIPS ====================
  // Drop recorded files into audio/phonemes/ and list their keys in audio/phonemes/index.json.
  // A listed clip replaces the synthetic voice for that phoneme/tone. See audio/phonemes/README.md.
  loadClipIndex() {
    this.clips = new Set();
    if (!window.fetch) return;
    fetch('audio/phonemes/index.json')
      .then(r => (r.ok ? r.json() : []))
      .then(list => { if (Array.isArray(list)) list.forEach(k => this.clips.add(k)); })
      .catch(() => {});
  }

  speakOnce(text, rate) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      u.rate = rate;
      u.pitch = 1.2;
      const viVoice = this.getViVoice();
      if (viVoice) u.voice = viVoice;

      let done = false;
      // Fallback: some browsers occasionally never fire onend
      const timer = setTimeout(() => finish(), 1500 + text.length * 250);
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
    });
  }

  playClip(key) {
    return new Promise(resolve => {
      const clip = new Audio(`audio/phonemes/${key}.mp3`);
      this.currentClip = clip;
      clip.onended = resolve;
      clip.onerror = resolve;
      clip.play().catch(resolve);
    });
  }

  // part: "text" or { text, clip }
  sayPart(part, rate) {
    const p = typeof part === 'string' ? { text: part } : part;
    if (p.clip && this.clips && this.clips.has(p.clip)) return this.playClip(p.clip);
    return this.speakOnce(p.text, rate);
  }

  // Speak parts one after another, slowly, with a pause between them.
  // onStep(i) is called before part i (for highlighting). Resolves true if finished,
  // false if interrupted by another speak()/speakSequence().
  async speakSequence(parts, { gap = 450, rate = 0.8, onStep } = {}) {
    this.seqToken = (this.seqToken || 0) + 1;
    const token = this.seqToken;
    this.stopSpeech();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(80); // Chrome may drop an utterance queued right after cancel()

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
