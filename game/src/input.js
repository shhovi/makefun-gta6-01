export function createInput(canvas) {
  const keys = {};
  const mouse = { x: 0, y: 0, down: false, clicked: false };
  const pressed = {};
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
    if (k === " " || k.startsWith("arrow")) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener("mousedown", () => {
    mouse.down = true;
    mouse.clicked = true;
  });
  window.addEventListener("mouseup", () => {
    mouse.down = false;
  });
  return {
    keys,
    mouse,
    isDown(k) {
      return !!keys[k];
    },
    wasPressed(k) {
      return !!pressed[k];
    },
    endFrame() {
      for (const k of Object.keys(pressed)) delete pressed[k];
      mouse.clicked = false;
    },
    axis() {
      let x = 0;
      let y = 0;
      if (keys["a"] || keys["arrowleft"]) x -= 1;
      if (keys["d"] || keys["arrowright"]) x += 1;
      if (keys["w"] || keys["arrowup"]) y -= 1;
      if (keys["s"] || keys["arrowdown"]) y += 1;
      return { x, y };
    },
    reset() {
      for (const k of Object.keys(keys)) delete keys[k];
      for (const k of Object.keys(pressed)) delete pressed[k];
      mouse.down = false;
      mouse.clicked = false;
    },
  };
}
