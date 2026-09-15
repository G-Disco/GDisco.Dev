/** Gurren Lagann spiral power animated background */
export function initSacredBg() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, time = 0;


  const GOLD = 'rgba(196, 163, 90,';
  const WHITE = 'rgba(255, 240, 220,';

  const R_RED     = [204, 34, 34];
  const R_CRIMSON = [153, 17, 17];
  const R_ORANGE  = [255, 68, 0];
  const R_DARK    = [26, 8, 8];

  const T_RED     = [46, 196, 182];
  const T_CRIMSON = [0, 168, 150];
  const T_ORANGE  = [50, 220, 200];
  const T_DARK    = [8, 18, 16];

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function mixC(arrA, arrB, t) {
    return 'rgba(' + lerp(arrA[0], arrB[0], t) + ',' + lerp(arrA[1], arrB[1], t) + ',' + lerp(arrA[2], arrB[2], t) + ',';
  }

  let RED, CRIMSON, ORANGE, DARK;
  function updateColors() {
    const t = window.__GDISCO_COLOR_T || 0;
    RED     = mixC(R_RED, T_RED, t);
    CRIMSON = mixC(R_CRIMSON, T_CRIMSON, t);
    ORANGE  = mixC(R_ORANGE, T_ORANGE, t);
    DARK    = mixC(R_DARK, T_DARK, t);
  }
  updateColors();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function glowStroke(color, alpha, baseWidth) {
    ctx.strokeStyle = `${color}${alpha * 0.08})`;
    ctx.lineWidth = baseWidth + 18;
    ctx.stroke();
    ctx.strokeStyle = `${color}${alpha * 0.15})`;
    ctx.lineWidth = baseWidth + 10;
    ctx.stroke();
    ctx.strokeStyle = `${color}${alpha * 0.35})`;
    ctx.lineWidth = baseWidth + 4;
    ctx.stroke();
    ctx.strokeStyle = `${color}${alpha})`;
    ctx.lineWidth = baseWidth;
    ctx.stroke();
  }

  // --- Constellation nodes ---
  const nodes = [];
  for (let i = 0; i < 60; i++) {
    nodes.push({
      x: Math.random() * 2000 - 200, y: Math.random() * 2000 - 200,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 2 + 0.8, pulse: Math.random() * Math.PI * 2,
      warm: Math.random(),
    });
  }

  // --- Rising embers ---
  const embers = [];
  for (let i = 0; i < 90; i++) {
    embers.push({
      x: Math.random() * 2000, y: Math.random() * 2000,
      vy: -(Math.random() * 0.6 + 0.15), vx: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 3.5 + 0.5,
      colorType: Math.random(),
      alpha: Math.random() * 0.5 + 0.25,
      life: Math.random() * Math.PI * 2,
    });
  }

  // --- Drills ---
  const drills = [];
  const drillPositions = [
    { xr: 0.06, yr: 0.3, s: 1.3 }, { xr: 0.94, yr: 0.7, s: 1.4 },
    { xr: 0.12, yr: 0.08, s: 1.0 }, { xr: 0.88, yr: 0.92, s: 1.1 },
    { xr: 0.85, yr: 0.1, s: 0.9 }, { xr: 0.15, yr: 0.9, s: 1.0 },
    { xr: 0.5, yr: 0.03, s: 0.8 }, { xr: 0.5, yr: 0.97, s: 0.9 },
    { xr: 0.03, yr: 0.6, s: 1.1 }, { xr: 0.97, yr: 0.4, s: 1.2 },
  ];
  for (const dp of drillPositions) {
    drills.push({
      xr: dp.xr, yr: dp.yr,
      size: (40 + Math.random() * 50) * dp.s,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01 + (Math.random() > 0.5 ? 0.006 : -0.006),
    });
  }

  const ENERGY_COUNT = 16;

  // --- Spiral inflow particles ---
  const inflowParticles = [];
  const INFLOW_COUNT = 20;

  function newInflowParticle() {
    return {
      angle: Math.random() * Math.PI * 2,
      dist: 0.3 + Math.random() * 0.7,
      speed: 0.0006 + Math.random() * 0.0012,
      spiralRate: 2.5 + Math.random() * 3.5,
      size: 0.8 + Math.random() * 2.2,
      alpha: 0.25 + Math.random() * 0.5,
      colorType: Math.random(),
      trail: [],
    };
  }
  for (let i = 0; i < INFLOW_COUNT; i++) inflowParticles.push(newInflowParticle());

  // ──────────────────────────────────────────
  // Spin burst — periodic fast spin (~35s cycle)
  // time increments 0.002/frame ≈ 0.12/sec → 35s ≈ 4.2
  // ──────────────────────────────────────────
  const BURST_CYCLE = 4.2;
  let extraSpin = 0;

  function getSpinBurst() {
    const pos = (time % BURST_CYCLE) / BURST_CYCLE;
    if (pos < 0.75 || pos >= 0.95) return 0;
    const p = (pos - 0.75) / 0.2;
    if (p < 0.3) {
      // Slow ramp up (ease-in)
      const t = p / 0.3;
      return t * t;
    }
    // Fast-to-slow ramp down (ease-out)
    const t = (p - 0.3) / 0.7;
    const inv = 1 - t;
    return inv * inv;
  }

  // ──────────────────────────────────────────
  // Draw functions
  // ──────────────────────────────────────────

  // Base spiral (always visible)
  function drawSpiral(cx, cy, maxR, turns, rotation, lineColor, alpha, lineW) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    const steps = turns * 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const r = (t / (turns * Math.PI * 2)) * maxR;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    glowStroke(lineColor, alpha, lineW);
    ctx.restore();
  }

  // --- Central spiral complex ---
  function drawCentralSpiral(cx, cy, radius, rotation, alpha, burstIntensity) {
    const baseAlpha = alpha;

    ctx.save();
    ctx.translate(cx, cy);

    // Rings
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2);
    glowStroke(GOLD, baseAlpha * 0.6, 2);

    ctx.beginPath(); ctx.arc(0, 0, radius * 0.94, 0, Math.PI * 2);
    glowStroke(RED, baseAlpha * 0.3, 1);

    ctx.beginPath(); ctx.arc(0, 0, radius * 0.89, 0, Math.PI * 2);
    glowStroke(CRIMSON, baseAlpha * 0.2, 0.6);

    // Tick marks
    ctx.strokeStyle = `${GOLD}${baseAlpha * 0.4})`;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 72; i++) {
      const a = (i * Math.PI * 2) / 72 + rotation * 0.3;
      const len = i % 6 === 0 ? 16 : i % 3 === 0 ? 8 : 5;
      const r1 = radius * 0.96;
      const r2 = r1 - len;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
    }

    ctx.restore();

    // Base concentric spirals (constant brightness)
    drawSpiral(cx, cy, radius * 0.85, 5, rotation, GOLD, baseAlpha * 1.0, 3);
    drawSpiral(cx, cy, radius * 0.7, 4, -rotation * 0.8 + Math.PI, RED, baseAlpha * 0.7, 2.2);
    drawSpiral(cx, cy, radius * 0.5, 3, rotation * 1.5 + Math.PI * 0.5, ORANGE, baseAlpha * 0.6, 1.6);
    drawSpiral(cx, cy, radius * 0.3, 2.5, -rotation * 2.5, GOLD, baseAlpha * 0.8, 1.2);
    drawSpiral(cx, cy, radius * 0.15, 2, rotation * 4, WHITE, baseAlpha * 0.5, 0.8);

    // Core flash during spin burst
    if (burstIntensity > 0.1) {
      ctx.save();
      ctx.translate(cx, cy);
      const flashR = radius * 0.5;
      const flashGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, flashR);
      flashGrad.addColorStop(0, `${WHITE}${burstIntensity * 0.15})`);
      flashGrad.addColorStop(0.3, `${GOLD}${burstIntensity * 0.08})`);
      flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(-flashR, -flashR, flashR * 2, flashR * 2);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(cx, cy);

    // Glow arms
    const armCount = 12;
    for (let i = 0; i < armCount; i++) {
      const armAngle = (i * Math.PI * 2) / armCount + rotation;
      const edgePhase = time * 1.2 + i * (Math.PI * 2 / armCount);
      const edgeGlow = 0.4 + Math.sin(edgePhase) * 0.4;

      const innerR = radius * 0.1;
      const outerR = radius * 0.85;
      const x1 = Math.cos(armAngle) * innerR;
      const y1 = Math.sin(armAngle) * innerR;
      const x2 = Math.cos(armAngle + 0.5) * outerR;
      const y2 = Math.sin(armAngle + 0.5) * outerR;

      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `${GOLD}${baseAlpha * edgeGlow * 0.06})`;
      ctx.lineWidth = 20; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `${ORANGE}${baseAlpha * edgeGlow * 0.15})`;
      ctx.lineWidth = 8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `${GOLD}${baseAlpha * edgeGlow * 0.6})`;
      ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Core glow
    const coreGlow = 0.7 + Math.sin(time * 1.8) * 0.3;
    const coreR = radius * 0.4;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    coreGrad.addColorStop(0, `${WHITE}${Math.min(1, baseAlpha * coreGlow * 0.85)})`);
    coreGrad.addColorStop(0.12, `${GOLD}${Math.min(1, baseAlpha * coreGlow * 1.0)})`);
    coreGrad.addColorStop(0.35, `${ORANGE}${Math.min(1, baseAlpha * coreGlow * 0.6)})`);
    coreGrad.addColorStop(0.6, `${RED}${baseAlpha * coreGlow * 0.25})`);
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(-coreR, -coreR, coreR * 2, coreR * 2);

    // Central dot
    ctx.fillStyle = `${WHITE}${Math.min(1, baseAlpha * 1.0)})`;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `${GOLD}${Math.min(1, baseAlpha * 0.9)})`;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // --- Spiral inflow particles ---
  function drawInflowParticles(cx, cy, maxR, burstIntensity) {
    const speedMult = 1 + burstIntensity * 1.5;

    for (const p of inflowParticles) {
      p.dist -= p.speed * speedMult;
      p.angle += p.spiralRate * p.speed * speedMult;

      if (p.dist <= 0.03) {
        Object.assign(p, newInflowParticle());
        p.trail = [];
        continue;
      }

      const r = p.dist * maxR;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r;

      p.trail.push({ x, y });
      if (p.trail.length > 14) p.trail.shift();

      const proximity = 1 - p.dist;
      const a = p.alpha * (0.2 + proximity * 0.8);
      const color = p.colorType < 0.35 ? GOLD : p.colorType < 0.65 ? ORANGE : RED;

      if (p.trail.length > 2) {
        for (let ti = 1; ti < p.trail.length; ti++) {
          const trailA = a * (ti / p.trail.length) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.trail[ti - 1].x, p.trail[ti - 1].y);
          ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
          ctx.strokeStyle = `${color}${trailA})`;
          ctx.lineWidth = p.size * (ti / p.trail.length);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `${color}${a * 0.1})`;
      ctx.beginPath(); ctx.arc(x, y, p.size * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${color}${a * 0.4})`;
      ctx.beginPath(); ctx.arc(x, y, p.size * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${WHITE}${a * 0.7})`;
      ctx.beginPath(); ctx.arc(x, y, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  // --- Drill shape ---
  function drawDrill(cx, cy, size, rotation, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const coneH = size * 3;
    const baseR = size * 0.6;

    ctx.beginPath();
    ctx.moveTo(0, -coneH * 0.5);
    ctx.lineTo(-baseR, coneH * 0.5);
    ctx.lineTo(baseR, coneH * 0.5);
    ctx.closePath();
    ctx.strokeStyle = `${GOLD}${alpha * 0.35})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    const drillGrad = ctx.createLinearGradient(0, -coneH * 0.5, 0, coneH * 0.5);
    drillGrad.addColorStop(0, `${GOLD}${alpha * 0.08})`);
    drillGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = drillGrad;
    ctx.fill();

    ctx.beginPath();
    const spiralTurns = 6;
    const steps = spiralTurns * 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = -coneH * 0.5 + t * coneH;
      const widthAtT = t * baseR;
      const angle = t * spiralTurns * Math.PI * 2;
      const x = Math.sin(angle) * widthAtT;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    glowStroke(GOLD, alpha * 0.5, 0.8);

    const tipGlow = 0.4 + Math.sin(time * 3 + rotation) * 0.3;
    ctx.fillStyle = `${ORANGE}${alpha * tipGlow * 0.2})`;
    ctx.beginPath(); ctx.arc(0, -coneH * 0.5, size * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `${WHITE}${alpha * tipGlow * 0.4})`;
    ctx.beginPath(); ctx.arc(0, -coneH * 0.5, size * 0.15, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // --- Corner frames ---
  function drawCorner(cx, cy, size, flipX, flipY, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    const s = size;
    ctx.strokeStyle = `${GOLD}${alpha * 0.5})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.8);
    ctx.lineTo(0, 0);
    ctx.lineTo(s * 0.8, 0);
    ctx.stroke();

    ctx.strokeStyle = `${GOLD}${alpha * 0.25})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(s * 0.06, s * 0.65);
    ctx.lineTo(s * 0.06, s * 0.06);
    ctx.lineTo(s * 0.65, s * 0.06);
    ctx.stroke();

    ctx.strokeStyle = `${GOLD}${alpha * 0.4})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    const spiralSteps = 30;
    for (let i = 0; i <= spiralSteps; i++) {
      const t = (i / spiralSteps) * Math.PI * 3;
      const r = (i / spiralSteps) * s * 0.08;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = `${GOLD}${alpha * 0.3})`;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath(); ctx.arc(0, i * s * 0.15, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(i * s * 0.15, 0, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  // --- Energy lines ---
  function drawEnergyLines(cx, cy, maxLen, alpha) {
    for (let i = 0; i < ENERGY_COUNT; i++) {
      const angle = (i * Math.PI * 2) / ENERGY_COUNT + time * 0.06;
      const pulsePhase = time * 1.5 + i * (Math.PI * 2 / ENERGY_COUNT);
      const pulse = 0.35 + Math.sin(pulsePhase) * 0.35;
      const len = maxLen * (0.5 + pulse * 0.5);

      const x1 = cx + Math.cos(angle) * 25;
      const y1 = cy + Math.sin(angle) * 25;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, `${ORANGE}${alpha * pulse * 0.5})`);
      grad.addColorStop(0.3, `${RED}${alpha * pulse * 0.3})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const dotPos = ((time * 0.6 + i * 0.12) % 1);
      const dotAlpha = Math.sin(dotPos * Math.PI);
      const dx = x1 + (x2 - x1) * dotPos;
      const dy = y1 + (y2 - y1) * dotPos;

      ctx.fillStyle = `${GOLD}${alpha * dotAlpha * 0.06})`;
      ctx.beginPath(); ctx.arc(dx, dy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${GOLD}${alpha * dotAlpha * 0.3})`;
      ctx.beginPath(); ctx.arc(dx, dy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${WHITE}${alpha * dotAlpha * 0.7})`;
      ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // --- Galaxy spiral background ---
  function drawGalaxy(cx, cy, maxR, alpha) {
    const arms = 3;
    for (let arm = 0; arm < arms; arm++) {
      const offset = (arm * Math.PI * 2) / arms;
      ctx.beginPath();
      const steps = 150;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 5 + offset + time * 0.025;
        const r = t * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${CRIMSON}${alpha * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const angle = t * Math.PI * 5 + offset + time * 0.025;
        const r = t * maxR + (Math.sin(time + i * 3) * 12);
        const x = cx + Math.cos(angle) * r + (Math.sin(i * 7.3) * 18);
        const y = cy + Math.sin(angle) * r + (Math.cos(i * 5.1) * 18);
        const dotA = alpha * 0.08 * (1 - t * 0.5);
        ctx.fillStyle = `${ORANGE}${dotA})`;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ──────────────────────────────────────────
  // Main loop
  // ──────────────────────────────────────────
  function frame() {
    time += 0.002;
    updateColors();
    ctx.clearRect(0, 0, w, h);

    const baseAlpha = 0.55 + Math.sin(time * 0.4) * 0.1;
    const r = Math.min(w, h) * 0.38;
    const cx = w * 0.5;
    const cy = h * 0.45;

    const burst = getSpinBurst();
    extraSpin += burst * 0.025;
    const rotation = time * 0.15 + extraSpin;

    drawGalaxy(cx, cy, Math.max(w, h) * 0.65, baseAlpha);
    drawEnergyLines(cx, cy, Math.min(w, h) * 0.55, baseAlpha * 0.7);
    drawInflowParticles(cx, cy, Math.min(w, h) * 0.45, burst);
    drawCentralSpiral(cx, cy, r, rotation, baseAlpha, burst);

    const cornerSize = Math.min(w, h) * 0.3;
    const navH = 52;
    drawCorner(15, navH + 10, cornerSize, false, false, 0.4);
    drawCorner(w - 15, navH + 10, cornerSize, true, false, 0.4);
    drawCorner(15, h - 15, cornerSize, false, true, 0.4);
    drawCorner(w - 15, h - 15, cornerSize, true, true, 0.4);

    for (const dr of drills) {
      dr.rot += dr.rotSpeed;
      drawDrill(dr.xr * w, dr.yr * h, dr.size, dr.rot, 0.35);
    }

    const connDist = 140;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50) n.x = w + 50;
      if (n.x > w + 50) n.x = -50;
      if (n.y < -50) n.y = h + 50;
      if (n.y > h + 50) n.y = -50;
      n.pulse += 0.012;
      const glow = 0.25 + Math.sin(n.pulse) * 0.18;

      const color = n.warm < 0.5 ? GOLD : n.warm < 0.8 ? ORANGE : RED;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${glow})`; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${glow * 0.12})`; ctx.fill();
    }

    ctx.lineWidth = 0.3;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connDist) {
          ctx.strokeStyle = `${GOLD}${(1 - dist / connDist) * 0.1})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (const e of embers) {
      e.x += e.vx + Math.sin(time * 2.5 + e.y * 0.01) * 0.4;
      e.y += e.vy;
      e.life += 0.015;
      if (e.y < -20) { e.y = h + 20; e.x = Math.random() * w; e.life = Math.random() * Math.PI * 2; }

      const flicker = e.alpha + Math.sin(time * 4 + e.x * 0.1 + e.life) * 0.15;
      const color = e.colorType < 0.33 ? GOLD : e.colorType < 0.66 ? ORANGE : RED;
      const a = Math.max(0, flicker);

      ctx.fillStyle = `${color}${a * 0.1})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${color}${a * 0.3})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `${color}${a})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }

    const breathe = 0.08 + Math.sin(time * 0.3) * 0.04;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
    grad.addColorStop(0, `${CRIMSON}${breathe * 1.3})`);
    grad.addColorStop(0.3, `${RED}${breathe * 0.5})`);
    grad.addColorStop(0.6, `${DARK}${breathe * 0.3})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
