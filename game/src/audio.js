// WebAudio synth sound: engine hum, siren, gunshot, punch, pickup blips. Oscillators only, no files.
// The AudioContext is created lazily on first user gesture (browser autoplay rules).
export class SynthAudio {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.sirenOsc = null;
    this.sirenGain = null;
  }

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
  }

  blip(freq, duration, type = "sine", volume = 0.15, slideTo = null) {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  gunshot() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(gain).connect(this.ctx.destination);
    src.start(t);
    this.blip(160, 0.08, "square", 0.12, 60);
  }

  punch() {
    this.blip(110, 0.09, "triangle", 0.2, 55);
  }

  pickup() {
    this.blip(660, 0.09, "sine", 0.15);
    setTimeout(() => this.blip(990, 0.12, "sine", 0.15), 70);
  }

  missionComplete() {
    this.blip(523, 0.12, "sine", 0.16);
    setTimeout(() => this.blip(659, 0.12, "sine", 0.16), 110);
    setTimeout(() => this.blip(784, 0.2, "sine", 0.16), 220);
  }

  startEngine() {
    this.ensure();
    if (!this.ctx || this.engineOsc) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 55;
    this.engineGain.gain.value = 0.04;
    this.engineOsc.connect(this.engineGain).connect(this.ctx.destination);
    this.engineOsc.start();
  }

  setEngineSpeed(speed) {
    if (this.engineOsc) this.engineOsc.frequency.value = 55 + Math.abs(speed) * 0.45;
  }

  stopEngine() {
    if (this.engineOsc) {
      this.engineOsc.stop();
      this.engineOsc = null;
    }
  }

  startSiren() {
    this.ensure();
    if (!this.ctx || this.sirenOsc) return;
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();
    this.sirenOsc.type = "triangle";
    this.sirenGain.gain.value = 0.05;
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.7;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(this.sirenOsc.frequency);
    this.sirenOsc.frequency.value = 720;
    this.sirenOsc.connect(this.sirenGain).connect(this.ctx.destination);
    this.sirenOsc.start();
    lfo.start();
    this._sirenLfo = lfo;
  }

  stopSiren() {
    if (this.sirenOsc) {
      this.sirenOsc.stop();
      this._sirenLfo?.stop();
      this.sirenOsc = null;
    }
  }
}
