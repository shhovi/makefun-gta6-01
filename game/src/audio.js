// WebAudio synthesized sound: engine, siren, gunshot, punch, pickup.
export function createAudio() {
  let ctx = null;
  let engineOsc = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function blip(freq, dur, type, gain) {
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type || "square"; o.frequency.value = freq;
    g.gain.value = gain || 0.08;
    o.connect(g); g.connect(c.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.stop(c.currentTime + dur);
  }
  return {
    unlock: function () { ensure(); },
    gunshot: function () { blip(160, 0.12, "sawtooth", 0.18); },
    punch: function () { blip(90, 0.08, "square", 0.12); },
    pickup: function () { blip(880, 0.15, "sine", 0.1); },
    missionDone: function () { blip(660, 0.12, "sine", 0.1); blip(990, 0.18, "sine", 0.08); },
    siren: function () { blip(700, 0.2, "triangle", 0.06); },
    engine: function (on) {
      const c = ensure(); if (!c) return;
      if (on && !engineOsc) {
        engineOsc = c.createOscillator();
        engineOsc.type = "sawtooth"; engineOsc.frequency.value = 60;
        const g = c.createGain(); g.gain.value = 0.03;
        engineOsc.connect(g); g.connect(c.destination); engineOsc.start();
      } else if (!on && engineOsc) { try { engineOsc.stop(); } catch (e) {} engineOsc = null; }
    },
  };
}
