// Keyboard + mouse input state. WASD/arrows to move, E enter car, F punch, mouse aim/shoot.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this._pressed = new Set();

    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this._pressed.add(k);
      this.keys.add(k);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));

    if (canvas) {
      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      });
      canvas.addEventListener("mousedown", () => { this.mouseDown = true; });
      window.addEventListener("mouseup", () => { this.mouseDown = false; });
    }
  }

  isDown(...keys) {
    return keys.some((k) => this.keys.has(k.toLowerCase()));
  }

  justPressed(key) {
    return this._pressed.has(key.toLowerCase());
  }

  endFrame() {
    this._pressed.clear();
  }

  get up() { return this.isDown("w", "arrowup"); }
  get down() { return this.isDown("s", "arrowdown"); }
  get left() { return this.isDown("a", "arrowleft"); }
  get right() { return this.isDown("d", "arrowright"); }
  get enterCar() { return this.justPressed("e"); }
  get punch() { return this.justPressed("f"); }
  get pause() { return this.justPressed("escape"); }
}
