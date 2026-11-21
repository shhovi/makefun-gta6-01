// Keyboard and mouse input: WASD/arrows, E car, F punch, mouse shoot.
export function createInput(canvas) {
  const input = {
    keys: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    pressed: {},
    isDown: function (k) { return !!this.keys[k]; },
    clear: function () { this.keys = {}; this.pressed = {}; this.mouseDown = false; },
    wasPressed: function (k) { const v = !!this.pressed[k]; this.pressed[k] = false; return v; },
    axis: function () {
      let x = 0, y = 0;
      if (this.keys["a"] || this.keys["arrowleft"]) x -= 1;
      if (this.keys["d"] || this.keys["arrowright"]) x += 1;
      if (this.keys["w"] || this.keys["arrowup"]) y -= 1;
      if (this.keys["s"] || this.keys["arrowdown"]) y += 1;
      return { x: x, y: y };
    },
  };
  window.addEventListener("keydown", function (e) {
    const k = e.key.toLowerCase();
    if (!input.keys[k]) input.pressed[k] = true;
    input.keys[k] = true;
    if (k.indexOf("arrow") === 0) e.preventDefault();
  });
  window.addEventListener("keyup", function (e) { input.keys[e.key.toLowerCase()] = false; });
  if (canvas) {
    canvas.addEventListener("mousemove", function (e) {
      const r = canvas.getBoundingClientRect();
      input.mouseX = e.clientX - r.left;
      input.mouseY = e.clientY - r.top;
    });
    canvas.addEventListener("mousedown", function () { input.mouseDown = true; input.pressed["mouse"] = true; });
    window.addEventListener("mouseup", function () { input.mouseDown = false; });
  }
  return input;
}
