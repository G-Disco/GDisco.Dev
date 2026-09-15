/** Color cycle: syncs canvas + updates -rgb vars for opacity-based styles */
export function initColorCycle() {
  const CYCLE_DURATION = 70000; // 70s per direction, 140s total round trip
  const startTime = performance.now();
  const root = document.documentElement;

  // RGB triplets for the -rgb variables (used with / alpha syntax)
  const RGB_RED = {
    'pink-rgb':        [204, 34, 34],
    'rose-rgb':        [153, 17, 17],
    'magenta-rgb':     [255, 68, 0],
    'violet-rgb':      [26, 8, 8],
    'purple-deep-rgb': [102, 16, 16],
  };
  const RGB_TEAL = {
    'pink-rgb':        [46, 196, 182],
    'rose-rgb':        [0, 168, 150],
    'magenta-rgb':     [50, 220, 200],
    'violet-rgb':      [8, 18, 16],
    'purple-deep-rgb': [10, 90, 82],
  };

  function getT(now) {
    const elapsed = now - startTime;
    const raw = (elapsed % (CYCLE_DURATION * 2)) / (CYCLE_DURATION * 2);
    return raw < 0.5 ? raw * 2 : 2 - raw * 2;
  }

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  // Update -rgb vars infrequently (every 500ms is plenty for a 50s cycle)
  let lastRgbUpdate = 0;
  function updateRgbVars(t, now) {
    if (now - lastRgbUpdate < 500) return;
    lastRgbUpdate = now;
    for (const key in RGB_RED) {
      const a = RGB_RED[key], b = RGB_TEAL[key];
      const v = lerp(a[0], b[0], t) + ' ' + lerp(a[1], b[1], t) + ' ' + lerp(a[2], b[2], t);
      root.style.setProperty('--' + key, v);
    }
  }

  function tick() {
    const now = performance.now();
    const t = getT(now);

    window.__GDISCO_COLOR_T = t;
    window.__GDISCO_PULSE = 0.88 + Math.sin((now - startTime) * 0.002) * 0.12;

    updateRgbVars(t, now);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
