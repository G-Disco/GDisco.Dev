import * as THREE from 'three';

const canvas = document.getElementById('tree-canvas');
if (canvas) {

  /* DAY / NIGHT */
  const IS_DAY = document.documentElement.dataset.theme === 'day';

  /* RENDERER */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  /* SCENE + CAMERA */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 4, 32);
  camera.lookAt(0, 11, 0);

  /* LIGHTS */
  scene.add(new THREE.AmbientLight(IS_DAY ? 0xfff8d8 : 0xfce8f4, IS_DAY ? 5.0 : 2.2));
  const dirLight = new THREE.DirectionalLight(IS_DAY ? 0xfffcf0 : 0xfff0f8, IS_DAY ? 9.0 : 4.0);
  dirLight.position.set(12, 26, 14);
  scene.add(dirLight);
  const fill = new THREE.PointLight(IS_DAY ? 0xffcc66 : 0xff88cc, IS_DAY ? 5.0 : 3.0, 80);
  fill.position.set(-16, 14, 10);
  scene.add(fill);
  const bounce = new THREE.PointLight(IS_DAY ? 0xffeecc : 0xffe0f0, IS_DAY ? 2.5 : 1.5, 60);
  bounce.position.set(6, -4, 16);
  scene.add(bounce);

  /* PETAL SHAPE — cherry blossom with notch */
  function makePetalShape() {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.11, 0.06, -0.14, 0.20, -0.09, 0.32);
    s.lineTo(-0.018, 0.29);
    s.lineTo(0, 0.34);
    s.lineTo(0.018, 0.29);
    s.bezierCurveTo(0.14, 0.20, 0.11, 0.06, 0, 0);
    return s;
  }
  const petalShape = makePetalShape();
  const petalGeo = new THREE.ShapeGeometry(petalShape, 6);
  const fallGeo = new THREE.ShapeGeometry(petalShape, 4);

  /* MATERIALS */
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x2a1018, roughness: 0.92, vertexColors: true,
  });
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xffd8ea, emissive: 0xff60a0, emissiveIntensity: 0.12,
    roughness: 0.70, transparent: true, opacity: 0.94, side: THREE.DoubleSide,
  });
  const fallMat = new THREE.MeshBasicMaterial({
    color: 0xffc0dc, transparent: true, opacity: 0.82, side: THREE.DoubleSide,
  });

  const nodes = [];  // { pos, parent, depth, children, radius }

  /* 1 — Manual trunk */
  const TRUNK_H = 4.5, TRUNK_S = 10;
  for (let i = 0; i <= TRUNK_S; i++) {
    nodes.push({
      pos: new THREE.Vector3(i * 0.04, -2.5 + i * (TRUNK_H / TRUNK_S), 0),
      parent: i === 0 ? null : i - 1,
      depth: i,
    });
  }

  /* 2 — Attraction points: wide drooping sakura canopy */
  let attractors = [];
  for (let i = 0; i < 700; i++) {
    let x, y, z;
    do {
      x = (Math.random() - 0.5) * 2;
      y = (Math.random() - 0.5) * 2;
      z = (Math.random() - 0.5) * 2;
    } while (x * x + y * y + z * z > 1);

    const r2d = Math.sqrt(x * x + z * z);
    const droop = r2d * r2d * 2.2;          // outer edges droop down
    attractors.push(new THREE.Vector3(
      0.3 + x * 11,
      13 + y * 6 - droop,
      0 + z * 9.5,
    ));
  }

  /* 3 — SCA grow loop */
  const SEG_LEN = 0.44;
  const INF_R2 = 7.5 * 7.5;
  const KILL_R2 = 1.3 * 1.3;
  const CROWD_R2 = SEG_LEN * SEG_LEN * 0.36;

  for (let iter = 0; iter < 160; iter++) {
    if (attractors.length === 0) break;

    const nodeDir = new Map();
    const toKill = new Set();

    for (let a = 0; a < attractors.length; a++) {
      const att = attractors[a];
      let bestD2 = Infinity, bestN = -1;

      for (let n = 0; n < nodes.length; n++) {
        const d2 = nodes[n].pos.distanceToSquared(att);
        if (d2 < KILL_R2) { toKill.add(a); bestN = -1; break; }
        if (d2 < INF_R2 && d2 < bestD2) { bestD2 = d2; bestN = n; }
      }

      if (bestN >= 0 && !toKill.has(a)) {
        if (!nodeDir.has(bestN)) nodeDir.set(bestN, new THREE.Vector3());
        nodeDir.get(bestN).add(
          new THREE.Vector3().subVectors(att, nodes[bestN].pos).normalize()
        );
      }
    }

    attractors = attractors.filter((_, i) => !toKill.has(i));

    let grew = false;
    nodeDir.forEach((dir, nIdx) => {
      dir.normalize();
      dir.x += (Math.random() - 0.5) * 0.10;
      dir.y += (Math.random() - 0.5) * 0.06;
      dir.z += (Math.random() - 0.5) * 0.10;
      dir.normalize();

      const parent = nodes[nIdx];
      const newPos = parent.pos.clone().addScaledVector(dir, SEG_LEN);

      let ok = true;
      for (const n of nodes) {
        if (n.pos.distanceToSquared(newPos) < CROWD_R2) { ok = false; break; }
      }
      if (ok) {
        nodes.push({ pos: newPos, parent: nIdx, depth: parent.depth + 1 });
        grew = true;
      }
    });

    if (!grew) break;
  }

  /* 4 — Children lists + pipe-model radii */
  nodes.forEach(n => { n.children = []; });
  nodes.forEach((n, i) => { if (n.parent !== null) nodes[n.parent].children.push(i); });

  function computeR(i) {
    const n = nodes[i];
    if (n.children.length === 0) { n.radius = 0.038; return 0.038 * 0.038; }
    let s = 0;
    n.children.forEach(c => { s += computeR(c); });
    n.radius = Math.min(0.72, Math.sqrt(s) * 1.12);
    return n.radius * n.radius;
  }
  computeR(0);

  /* ══════════════════════════════════════════
     BUILD BRANCH GEOMETRY — one merged mesh
  ══════════════════════════════════════════ */

  const posArr = [], nrmArr = [], colArr = [], idxArr = [];
  let vOff = 0;
  const leafPositions = [];
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const yAxis = new THREE.Vector3(0, 1, 0);

  nodes.forEach((node) => {
    if (node.parent === null) return;
    const parent = nodes[node.parent];

    const dir = new THREE.Vector3().subVectors(node.pos, parent.pos);
    const len = dir.length();
    if (len < 0.001) return;

    // Flores en la zona exterior del árbol (últimas capas), no solo en extremos
    if (node.depth >= Math.floor(maxDepth * 0.72)) leafPositions.push(node.pos.clone());

    const rTop = Math.max(0.030, node.radius);
    const rBottom = Math.max(0.038, parent.radius);
    const radSegs = rBottom > 0.40 ? 10 : rBottom > 0.20 ? 8 : rBottom > 0.10 ? 7 : 6;
    const RS1 = radSegs + 1;

    const t = Math.min(1, node.depth / maxDepth);
    const col = new THREE.Color().setHSL(0.94, 0.52, 0.10 + t * 0.12);

    const dirN = dir.clone().normalize();
    const quat = new THREE.Quaternion();
    if (Math.abs(dirN.dot(yAxis)) < 0.9999) {
      quat.setFromUnitVectors(yAxis, dirN);
    } else if (dirN.y < 0) {
      quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    }

    const mid = new THREE.Vector3().addVectors(parent.pos, node.pos).multiplyScalar(0.5);
    const base = vOff;

    for (let ring = 0; ring <= 1; ring++) {
      const r = ring === 0 ? rBottom : rTop;
      const ly = ring === 0 ? -len / 2 : len / 2;
      for (let s = 0; s < RS1; s++) {
        const angle = (s / radSegs) * Math.PI * 2;
        const nx = Math.cos(angle), nz = Math.sin(angle);

        const lv = new THREE.Vector3(nx * r, ly, nz * r).applyQuaternion(quat);
        posArr.push(lv.x + mid.x, lv.y + mid.y, lv.z + mid.z);

        const ln = new THREE.Vector3(nx, 0, nz).applyQuaternion(quat);
        nrmArr.push(ln.x, ln.y, ln.z);

        colArr.push(col.r, col.g, col.b);
        vOff++;
      }
    }

    for (let s = 0; s < radSegs; s++) {
      const a = base + s, b = base + s + 1;
      const c = base + RS1 + s, d = base + RS1 + s + 1;
      idxArr.push(a, c, b, b, c, d);
    }
  });

  const branchGeo = new THREE.BufferGeometry();
  branchGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3));
  branchGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrmArr), 3));
  branchGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colArr), 3));
  branchGeo.setIndex(new THREE.BufferAttribute(new Uint32Array(idxArr), 1));

  /* ══════════════════════════════════════════
     SCENE ASSEMBLY
  ══════════════════════════════════════════ */

  const treeGroup = new THREE.Group();
  scene.add(treeGroup);
  treeGroup.add(new THREE.Mesh(branchGeo, barkMat));

  /* Instanced flowers at leaf nodes */
  const CLUSTERS = 5, PER_FLOWER = 5;
  const totP = leafPositions.length * CLUSTERS * PER_FLOWER;
  const iFlwr = new THREE.InstancedMesh(petalGeo, petalMat, totP);
  const dummy = new THREE.Object3D();
  const ZAxis = new THREE.Vector3(0, 0, 1);
  let pIdx = 0;

  leafPositions.forEach(pos => {
    for (let f = 0; f < CLUSTERS; f++) {
      const qF = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      );
      const ctr = pos.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 0.40,
        (Math.random() - 0.5) * 0.55,
      ));
      for (let p = 0; p < PER_FLOWER; p++) {
        const ang = (p / PER_FLOWER) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const qP = new THREE.Quaternion().setFromAxisAngle(ZAxis, ang).premultiply(qF);
        dummy.position.copy(ctr);
        dummy.quaternion.copy(qP);
        dummy.scale.setScalar(1.3 + Math.random() * 0.9);
        dummy.updateMatrix();
        iFlwr.setMatrixAt(pIdx++, dummy.matrix);
      }
    }
  });
  iFlwr.count = pIdx;
  iFlwr.instanceMatrix.needsUpdate = true;
  treeGroup.add(iFlwr);

  /* ══════════════════════════════════════════
     BACKGROUND GROVE — low-poly sakura trees
  ══════════════════════════════════════════ */
  const GROUND_Y = -2.5;

  const distBarkMat = new THREE.MeshStandardMaterial({ color: 0x150810, roughness: 0.96 });
  const distCanopyMat = new THREE.MeshStandardMaterial({
    color: 0xffb0d4, emissive: 0xff4888, emissiveIntensity: 0.20,
    roughness: 0.78, transparent: true, opacity: 0.85,
  });

  // [x, z, scale, swayPhase]  — 30 flores en 3 capas de profundidad
  const GROVE = [
    // ── Capa cercana  Z -6 a -12  (8 flores, escala 0.58–0.70)
    [-28,  -6,  0.70, 0.30],
    [ 22,  -7,  0.66, 1.40],
    [-18,  -9,  0.64, 2.10],
    [ 36,  -8,  0.62, 0.70],
    [-44,  -7,  0.60, 3.20],
    [ 10, -11,  0.67, 1.90],
    [ -8,  -8,  0.63, 2.80],
    [ 48, -10,  0.58, 0.10],

    // ── Capa media    Z -13 a -22  (12 flores, escala 0.46–0.58)
    [-24, -15,  0.54, 0.00],
    [ 18, -14,  0.58, 0.80],
    [-36, -16,  0.46, 1.20],
    [ 30, -17,  0.52, 3.50],
    [-12, -18,  0.56, 2.00],
    [ 44, -15,  0.48, 1.10],
    [-48, -14,  0.50, 2.60],
    [  6, -20,  0.54, 3.80],
    [-20, -22,  0.52, 0.40],
    [ 26, -19,  0.50, 1.70],
    [-38, -21,  0.44, 2.30],
    [ 16, -22,  0.48, 3.00],
    [ 52, -18,  0.46, 1.55],
    [-54, -20,  0.44, 2.95],

    // ── Capa lejana   Z -24 a -38  (10 flores, escala 0.36–0.50)
    [-15, -26,  0.50, 2.40],
    [ 12, -28,  0.42, 1.80],
    [ -6, -30,  0.38, 2.90],
    [ 28, -27,  0.44, 0.50],
    [-30, -29,  0.40, 3.70],
    [ 42, -25,  0.46, 2.10],
    [-42, -27,  0.42, 1.30],
    [  4, -35,  0.36, 0.90],
    [-18, -34,  0.38, 2.20],
    [ 24, -33,  0.40, 3.40],
  ];

  const bgTreeGroups = [];

  GROVE.forEach(([gx, gz, sc, phase]) => {
    const g = new THREE.Group();
    const trunkH = 5.2 * sc;

    // Trunk — 6-sided prism (intentionally low-poly)
    const trunkGeo = new THREE.CylinderGeometry(0.11 * sc, 0.20 * sc, trunkH, 6);
    const trunk = new THREE.Mesh(trunkGeo, distBarkMat);
    trunk.position.y = GROUND_Y + trunkH / 2;
    g.add(trunk);

    // Canopy — two overlapping icosahedra (20 faces each = hard faceted look)
    const topY = GROUND_Y + trunkH;
    const r1 = 1.55 * sc, r2 = 1.05 * sc;

    const b1 = new THREE.Mesh(new THREE.IcosahedronGeometry(r1, 0), distCanopyMat);
    b1.position.set(0, topY + r1 * 0.55, 0);
    b1.scale.set(1.05, 0.82, 1.0);
    b1.rotation.y = phase;
    g.add(b1);

    const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(r2, 0), distCanopyMat);
    b2.position.set(0.38 * sc, topY + r1 * 0.95 + r2 * 0.3, 0.22 * sc);
    b2.scale.set(1.0, 0.78, 0.95);
    b2.rotation.y = phase + 1.1;
    g.add(b2);

    g.position.set(gx, 0, gz);
    g.userData.swayPhase = phase;
    scene.add(g);
    bgTreeGroups.push(g);
  });

  /* Falling petals */
  const fallers = Array.from({ length: 200 }, () => {
    const m = new THREE.Mesh(fallGeo, fallMat);
    m.position.set((Math.random() - 0.5) * 54, Math.random() * 32 - 4, (Math.random() - 0.5) * 22);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    m.userData = {
      vy: -(0.012 + Math.random() * 0.022),
      vx: (Math.random() - 0.5) * 0.022,
      drift: Math.random() * Math.PI * 2,
      driftS: 0.008 + Math.random() * 0.010,
      spin: (Math.random() - 0.5) * 0.042,
      spinY: (Math.random() - 0.5) * 0.024,
    };
    scene.add(m);
    return m;
  });

  /* ══════════════════════════════════════════
     MOON (night, upper-left) / SUN (day, upper-right)
  ══════════════════════════════════════════ */
  const MOON_START_X = IS_DAY ? 22 : -22;
  const MOON_Y       =  17;
  const MOON_Z       =   2;

  // Core sphere
  const moonGeo = new THREE.SphereGeometry(1.6, 32, 24);
  const moonMat = new THREE.MeshStandardMaterial(IS_DAY ? {
    color: 0xfffce0, emissive: 0xffee22, emissiveIntensity: 2.4,
    roughness: 0.05, metalness: 0.0,
  } : {
    color: 0xf0ecff, emissive: 0xddd8ff, emissiveIntensity: 1.1,
    roughness: 0.10, metalness: 0.0,
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  scene.add(moonMesh);

  // Soft halo
  const haloGeo = new THREE.SphereGeometry(2.8, 24, 18);
  const haloMat = new THREE.MeshBasicMaterial({
    color: IS_DAY ? 0xffdd55 : 0xaabbff,
    transparent: true, opacity: IS_DAY ? 0.16 : 0.10, side: THREE.BackSide,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  scene.add(haloMesh);

  // Dynamic light
  const moonLight = new THREE.PointLight(IS_DAY ? 0xff9933 : 0x3366ff, IS_DAY ? 20 : 14, 90, IS_DAY ? 1.2 : 1.4);
  scene.add(moonLight);

  /* ══════════════════════════════════════════
     MOON DRAG
     — listener en window fase capture para que funcione
       independientemente del z-index del contenido HTML
  ══════════════════════════════════════════ */
  let moonPosX = MOON_START_X;
  let moonPosY = MOON_Y;
  let moonVelX = 0, moonVelY = 0;   // inercia
  let isDraggingMoon = false;
  let dragOffsetX = 0, dragOffsetY = 0;
  let prevDragX = 0, prevDragY = 0; // para calcular velocidad al soltar

  const moonRay    = new THREE.Raycaster();
  const moonMouse  = new THREE.Vector2();
  const dragPlane  = new THREE.Plane(new THREE.Vector3(0, 0, 1), -MOON_Z);
  const dragPoint  = new THREE.Vector3();
  const moonOverlay = document.getElementById('moon-light-overlay');

  function toNDC(clientX, clientY) {
    moonMouse.x =  (clientX / window.innerWidth)  * 2 - 1;
    moonMouse.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('mousedown', e => {
    toNDC(e.clientX, e.clientY);
    moonRay.setFromCamera(moonMouse, camera);
    if (moonRay.intersectObject(moonMesh).length === 0) return;
    isDraggingMoon = true;
    moonVelX = 0; moonVelY = 0;
    moonRay.ray.intersectPlane(dragPlane, dragPoint);
    dragOffsetX = moonPosX - dragPoint.x;
    dragOffsetY = moonPosY - dragPoint.y;
    prevDragX = moonPosX; prevDragY = moonPosY;
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }, { capture: true });

  window.addEventListener('mousemove', e => {
    toNDC(e.clientX, e.clientY);
    if (isDraggingMoon) {
      moonRay.setFromCamera(moonMouse, camera);
      if (moonRay.ray.intersectPlane(dragPlane, dragPoint)) {
        const newX = dragPoint.x + dragOffsetX;
        const newY = dragPoint.y + dragOffsetY;
        // Velocidad = desplazamiento de este frame (suavizado)
        moonVelX = moonVelX * 0.5 + (newX - moonPosX) * 0.5;
        moonVelY = moonVelY * 0.5 + (newY - moonPosY) * 0.5;
        moonPosX = newX;
        moonPosY = newY;
      }
    } else {
      moonRay.setFromCamera(moonMouse, camera);
      document.body.style.cursor = moonRay.intersectObject(moonMesh).length > 0 ? 'grab' : '';
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isDraggingMoon) return;
    isDraggingMoon = false;
    document.body.style.cursor = '';
    // La velocidad queda guardada en moonVelX/Y — el animate loop la consume
  });

  /* Mouse + resize */
  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 1.4;
    my = (e.clientY / window.innerHeight - 0.5) * 0.8;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Animate */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

    tx += (mx - tx) * 0.07;
    ty += (my - ty) * 0.07;
    treeGroup.rotation.y = tx;
    treeGroup.rotation.z = Math.sin(t * 0.52) * 0.009 + Math.sin(t * 1.28) * 0.004;

    // Moon — posición, inercia, drift y overlay CSS
    if (isDraggingMoon) {
      // Mientras se arrastra, la posición ya la actualiza mousemove
    } else {
      // Inercia residual con damping
      moonPosX += moonVelX;
      moonPosY += moonVelY;
      moonVelX *= 0.93;
      moonVelY *= 0.93;
      // Drift pasivo cuando la inercia casi para (sol va hacia la izq, luna hacia la der)
      if (Math.abs(moonVelX) < 0.001) moonPosX += IS_DAY ? -0.00029 : 0.00029;
    }

    const baseGlow = IS_DAY ? 2.0 : 0.9;
    const moonGlow = baseGlow + Math.sin(t * 0.38) * (IS_DAY ? 0.20 : 0.12);
    moonMesh.position.set(moonPosX, moonPosY, MOON_Z);
    moonMesh.material.emissiveIntensity = moonGlow;
    haloMesh.position.set(moonPosX, moonPosY, MOON_Z);
    haloMesh.material.opacity = (IS_DAY ? 0.13 : 0.07) + Math.sin(t * 0.38) * 0.025;
    moonLight.position.set(moonPosX, moonPosY, MOON_Z);
    moonLight.intensity = (IS_DAY ? 18 : 13) + Math.sin(t * 0.38) * 2.5;

    // Proyectar sol/luna a coordenadas de pantalla → iluminar HTML
    if (moonOverlay) {
      const proj = moonMesh.position.clone().project(camera);
      const sx = ((proj.x + 1) / 2 * window.innerWidth)  | 0;
      const sy = ((-proj.y + 1) / 2 * window.innerHeight) | 0;
      const alpha = (0.13 + Math.sin(t * 0.38) * 0.03).toFixed(3);
      moonOverlay.style.background = IS_DAY
        ? `radial-gradient(circle at ${sx}px ${sy}px,` +
          `rgba(255,190,40,${alpha}) 0%,` +
          `rgba(255,130,0,${(alpha * 0.4).toFixed(3)}) 18%,` +
          `transparent 52%)`
        : `radial-gradient(circle at ${sx}px ${sy}px,` +
          `rgba(80,120,255,${alpha}) 0%,` +
          `rgba(40,60,200,${(alpha * 0.4).toFixed(3)}) 18%,` +
          `transparent 52%)`;
    }

    // Background grove sway
    bgTreeGroups.forEach(g => {
      const ph = g.userData.swayPhase;
      g.rotation.z = Math.sin(t * 0.44 + ph) * 0.022 + Math.sin(t * 0.71 + ph) * 0.009;
      g.rotation.x = Math.sin(t * 0.30 + ph) * 0.007;
    });

    const wind = Math.sin(t * 0.22) * 0.020 + Math.sin(t * 0.61) * 0.010;
    fallers.forEach(p => {
      p.userData.drift += p.userData.driftS;
      p.position.y += p.userData.vy;
      p.position.x += p.userData.vx + Math.sin(p.userData.drift) * 0.016 + wind;
      p.rotation.z += p.userData.spin;
      p.rotation.x += p.userData.spin * 0.5;
      p.rotation.y += p.userData.spinY;
      if (p.position.y < -9) {
        p.position.y = 28;
        p.position.x = (Math.random() - 0.5) * 54;
        p.position.z = (Math.random() - 0.5) * 22;
      }
    });

    renderer.render(scene, camera);
  }
  animate();
}
