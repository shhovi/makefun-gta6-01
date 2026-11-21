export function createAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol) {
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = vol || 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }
  return {
    unlock() {
      ensure();
    },
    punch() {
      tone(140, 0.12, "square", 0.1);
    },
    shoot() {
      tone(720, 0.08, "sawtooth", 0.12);
      tone(180, 0.14, "square", 0.08);
    },
    siren() {
      tone(660, 0.18, "sine", 0.06);
      tone(880, 0.18, "sine", 0.06);
    },
    cash() {
      tone(990, 0.1, "sine", 0.08);
      tone(1320, 0.16, "sine", 0.08);
      tone(1560, 0.1, "sine", 0.05);
    },
    crash() {
      tone(90, 0.25, "sawtooth", 0.12);
    },
    engine(speed) {
      if (Math.abs(speed) > 1) tone(80 + Math.abs(speed) * 12, 0.1, "sawtooth", 0.03);
    },
  };
}
