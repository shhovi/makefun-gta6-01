// WebAudio synth sound effects: engine, siren, gunshot, punch, pickup.
// No audio files — every sound is generated with oscillators/noise.
// The AudioContext is created lazily on the first user gesture.

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.sirenOsc = null;
    this.sirenGain = null;
  }

  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    return true;
  }

  blip(freq, dur, type = "square", gainValue = 0.12, slideTo = null) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  noise(dur, gainValue = 0.2) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = gainValue;
    src.connect(gain).connect(this.ctx.destination);
    src.start(t);
  }

  gunshot() {
    this.noise(0.16, 0.3);
    this.blip(180, 0.1, "square", 0.08, 60);
  }

  punch() {
    this.noise(0.08, 0.16);
    this.blip(120, 0.08, "sine", 0.14, 55);
  }

  pickup() {
    this.blip(880, 0.09, "sine", 0.12);
    setTimeout(() => this.blip(1320, 0.12, "sine", 0.12), 70);
  }

  setEngine(running, speedRatio = 0) {
    if (!running) {
      if (this.engineOsc) {
        try { this.engineOsc.stop(); } catch { /* already stopped */ }
        this.engineOsc = null;
      }
      return;
    }
    if (!this.ensure()) return;
    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = "sawtooth";
      this.engineGain.gain.value = 0.045;
      this.engineOsc.connect(this.engineGain).connect(this.ctx.destination);
      this.engineOsc.start();
    }
    this.engineOsc.frequency.value = 55 + Math.abs(speedRatio) * 130;
  }

  setSiren(active, timeMs) {
    if (!active) {
      if (this.sirenOsc) {
        try { this.sirenOsc.stop(); } catch { /* already stopped */ }
        this.sirenOsc = null;
      }
      return;
    }
    if (!this.ensure()) return;
    if (!this.sirenOsc) {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = "triangle";
      this.sirenGain.gain.value = 0.035;
      this.sirenOsc.connect(this.sirenGain).connect(this.ctx.destination);
      this.sirenOsc.start();
    }
    this.sirenOsc.frequency.value = Math.floor(timeMs / 350) % 2 === 0 ? 700 : 950;
  }
}
