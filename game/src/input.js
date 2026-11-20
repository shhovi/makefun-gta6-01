// Keyboard state with per-frame edge detection.
export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();
    window.addEventListener('keydown', (event) => {
      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === ' '
      ) {
        event.preventDefault();
      }
      const key = event.key.toLowerCase();
      if (!this.keys.has(key)) {
        this.pressed.add(key);
      }
      this.keys.add(key);
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  down(key) {
    return this.keys.has(key);
  }

  hit(key) {
    return this.pressed.has(key);
  }

  endFrame() {
    this.pressed.clear();
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.down('a') || this.down('arrowleft')) x -= 1;
    if (this.down('d') || this.down('arrowright')) x += 1;
    if (this.down('w') || this.down('arrowup')) y -= 1;
    if (this.down('s') || this.down('arrowdown')) y += 1;
    return { x, y };
  }
}
