export class AudioSys {
  constructor() { this.ctx = null; this.engineOsc = null; this.engineGain = null; this.sirenOsc = null; this.sirenGain = null; }
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
  }
  tone(freq, dur, type = 'sine', vol = 0.15, slide = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur);
  }
  noise(dur, vol = 0.2, freq = 800) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.ctx.destination); src.start(t);
  }
  pickup() { this.tone(880, 0.12, 'sine', 0.12); setTimeout(() => this.tone(1320, 0.14, 'sine', 0.12), 70); }
  cash() { this.tone(1568, 0.1, 'triangle', 0.14); setTimeout(() => this.tone(2093, 0.16, 'triangle', 0.12), 80); }
  crash() { this.noise(0.25, 0.35, 500); this.tone(70, 0.2, 'sine', 0.3, -30); }
  gunshot() { this.noise(0.12, 0.4, 3000); this.tone(150, 0.08, 'square', 0.2, -80); }
  punch() { this.noise(0.08, 0.2, 600); }
  horn() { this.tone(370, 0.25, 'square', 0.1); }
  door() { this.noise(0.06, 0.12, 900); }
  setEngine(on, speedRatio) {
    if (!this.ctx) return;
    if (on && !this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator(); this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth'; this.engineGain.gain.value = 0.05;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
      this.engineOsc.connect(f); f.connect(this.engineGain); this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }
    if (this.engineOsc) {
      this.engineOsc.frequency.value = 55 + Math.abs(speedRatio) * 140;
      if (!on) { try { this.engineOsc.stop(); } catch {} this.engineOsc = null; }
    }
  }
  setSiren(on, t) {
    if (!this.ctx) return;
    if (on && !this.sirenOsc) {
      this.sirenOsc = this.ctx.createOscillator(); this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = 'triangle'; this.sirenGain.gain.value = 0.045;
      this.sirenOsc.connect(this.sirenGain); this.sirenGain.connect(this.ctx.destination);
      this.sirenOsc.start();
    }
    if (this.sirenOsc) {
      this.sirenOsc.frequency.value = 700 + Math.sin(t * 6) * 180;
      if (!on) { try { this.sirenOsc.stop(); } catch {} this.sirenOsc = null; }
    }
  }
}
