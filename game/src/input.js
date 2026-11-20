// Keyboard + mouse input: WASD/arrows, E vehicle, F punch,
// mouse click to shoot, P/Esc pause, Shift to run on foot.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this.canvas = canvas;

    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener("mousedown", () => {
      this.mouse.down = true;
      this.mouse.clicked = true;
    });
    window.addEventListener("mouseup", () => {
      this.mouse.down = false;
    });
  }

  axis() {
    const k = this.keys;
    return {
      x: (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0),
      y: (k.has("s") || k.has("arrowdown") ? 1 : 0) - (k.has("w") || k.has("arrowup") ? 1 : 0),
    };
  }

  wasPressed(key) {
    return this.pressed.has(key);
  }

  endFrame() {
    this.pressed.clear();
    this.mouse.clicked = false;
  }
}
