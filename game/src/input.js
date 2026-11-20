export class Input {
  constructor() {
    this.keys = new Set(); this.pressed = new Set();
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      if (!this.keys.has(e.key.toLowerCase())) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }
  down(k) { return this.keys.has(k); }
  hit(k) { return this.pressed.has(k); }
  endFrame() { this.pressed.clear(); }
  axis() {
    let x = 0, y = 0;
    if (this.down('a') || this.down('arrowleft')) x -= 1;
    if (this.down('d') || this.down('arrowright')) x += 1;
    if (this.down('w') || this.down('arrowup')) y -= 1;
    if (this.down('s') || this.down('arrowdown')) y += 1;
    return { x, y };
  }
}
