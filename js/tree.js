/* ============================================
   SAKURA TREE — Space Colonization Algorithm
   Ramas orgánicas · Pipe model radii · 5-petal flowers
   ============================================ */
(function () {
  const canvas = document.getElementById('tree-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* RENDERER */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  /* SCENE + CAMERA */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 4, 32);
  camera.lookAt(0, 11, 0);

  /* LIGHTS */
  scene.add(new THREE.AmbientLight(0xfce8f4, 2.2));
  const sun = new THREE.DirectionalLight(0xfff0f8, 4.0);
  sun.position.set(12, 26, 14);
  scene.add(sun);
  const fill = new THREE.PointLight(0xff88cc, 3.0, 80);
  fill.position.set(-16, 14, 10);
  scene.add(fill);
  const bounce = new THREE.PointLight(0xffe0f0, 1.5, 60);
  bounce.position.set(6, -4, 16);
  scene.add(bounce);

  /* PETAL SHAPE — cherry blossom with notch */
  function makePetalShape() {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.11, 0.06, -0.14, 0.20, -0.09, 0.32);
    s.lineTo(-0.018, 0.29);
    s.lineTo(0,      0.34);
    s.lineTo(0.018,  0.29);
    s.bezierCurveTo(0.14, 0.20, 0.11, 0.06, 0, 0);
    return s;
  }
  const petalShape = makePetalShape();
  const petalGeo   = new THREE.ShapeGeometry(petalShape, 6);
  const fallGeo    = new THREE.ShapeGeometry(petalShape, 4);

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

  /* ══════════════════════════════════════════
     SPACE COLONIZATION ALGORITHM
  ══════════════════════════════════════════ */

  const nodes = [];  // { pos, parent, depth, children, radius }

  /* 1 — Manual trunk */
  const TRUNK_H = 4.5, TRUNK_S = 10;
  for (let i = 0; i <= TRUNK_S; i++) {
    nodes.push({
      pos:    new THREE.Vector3(i * 0.04, -2.5 + i * (TRUNK_H / TRUNK_S), 0),
      parent: i === 0 ? null : i - 1,
      depth:  i,
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

    const r2d   = Math.sqrt(x * x + z * z);
    const droop = r2d * r2d * 2.2;          // outer edges droop down
    attractors.push(new THREE.Vector3(
      0.3 + x * 11,
      13  + y * 6 - droop,
      0   + z * 9.5,
    ));
  }

  /* 3 — SCA grow loop */
  const SEG_LEN  = 0.44;
  const INF_R2   = 7.5 * 7.5;
  const KILL_R2  = 1.3 * 1.3;
  const CROWD_R2 = SEG_LEN * SEG_LEN * 0.36;

  for (let iter = 0; iter < 160; iter++) {
    if (attractors.length === 0) break;

    const nodeDir = new Map();
    const toKill  = new Set();

    for (let a = 0; a < attractors.length; a++) {
      const att  = attractors[a];
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
  let   vOff   = 0;
  const leafPositions = [];
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const yAxis    = new THREE.Vector3(0, 1, 0);

  nodes.forEach((node) => {
    if (node.parent === null) return;
    const parent = nodes[node.parent];

    const dir = new THREE.Vector3().subVectors(node.pos, parent.pos);
    const len = dir.length();
    if (len < 0.001) return;

    // Flores en la zona exterior del árbol (últimas capas), no solo en extremos
    if (node.depth >= Math.floor(maxDepth * 0.72)) leafPositions.push(node.pos.clone());

    const rTop    = Math.max(0.030, node.radius);
    const rBottom = Math.max(0.038, parent.radius);
    const radSegs = rBottom > 0.40 ? 10 : rBottom > 0.20 ? 8 : rBottom > 0.10 ? 7 : 6;
    const RS1     = radSegs + 1;

    const t   = Math.min(1, node.depth / maxDepth);
    const col = new THREE.Color().setHSL(0.94, 0.52, 0.10 + t * 0.12);

    const dirN = dir.clone().normalize();
    const quat = new THREE.Quaternion();
    if (Math.abs(dirN.dot(yAxis)) < 0.9999) {
      quat.setFromUnitVectors(yAxis, dirN);
    } else if (dirN.y < 0) {
      quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    }

    const mid  = new THREE.Vector3().addVectors(parent.pos, node.pos).multiplyScalar(0.5);
    const base = vOff;

    for (let ring = 0; ring <= 1; ring++) {
      const r  = ring === 0 ? rBottom : rTop;
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
      const a = base + s,        b = base + s + 1;
      const c = base + RS1 + s,  d = base + RS1 + s + 1;
      idxArr.push(a, c, b,  b, c, d);
    }
  });

  const branchGeo = new THREE.BufferGeometry();
  branchGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3));
  branchGeo.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(nrmArr), 3));
  branchGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(colArr), 3));
  branchGeo.setIndex(new THREE.BufferAttribute(new Uint32Array(idxArr), 1));

  /* ══════════════════════════════════════════
     SCENE ASSEMBLY
  ══════════════════════════════════════════ */

  const treeGroup = new THREE.Group();
  scene.add(treeGroup);
  treeGroup.add(new THREE.Mesh(branchGeo, barkMat));

  /* Instanced flowers at leaf nodes */
  const CLUSTERS = 5, PER_FLOWER = 5;
  const totP  = leafPositions.length * CLUSTERS * PER_FLOWER;
  const iFlwr = new THREE.InstancedMesh(petalGeo, petalMat, totP);
  const dummy = new THREE.Object3D();
  const ZAxis = new THREE.Vector3(0, 0, 1);
  let   pIdx  = 0;

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
        const qP  = new THREE.Quaternion().setFromAxisAngle(ZAxis, ang).premultiply(qF);
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

  /* Falling petals */
  const fallers = Array.from({ length: 200 }, () => {
    const m = new THREE.Mesh(fallGeo, fallMat);
    m.position.set((Math.random() - 0.5) * 54, Math.random() * 32 - 4, (Math.random() - 0.5) * 22);
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    m.userData = {
      vy:     -(0.012 + Math.random() * 0.022),
      vx:     (Math.random() - 0.5) * 0.022,
      drift:  Math.random() * Math.PI * 2,
      driftS: 0.008 + Math.random() * 0.010,
      spin:   (Math.random() - 0.5) * 0.042,
      spinY:  (Math.random() - 0.5) * 0.024,
    };
    scene.add(m);
    return m;
  });

  /* Mouse + resize */
  let mx = 0, my = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 1.4;
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

    const wind = Math.sin(t * 0.22) * 0.020 + Math.sin(t * 0.61) * 0.010;
    fallers.forEach(p => {
      p.userData.drift += p.userData.driftS;
      p.position.y += p.userData.vy;
      p.position.x += p.userData.vx + Math.sin(p.userData.drift) * 0.016 + wind;
      p.rotation.z  += p.userData.spin;
      p.rotation.x  += p.userData.spin * 0.5;
      p.rotation.y  += p.userData.spinY;
      if (p.position.y < -9) {
        p.position.y = 28;
        p.position.x = (Math.random() - 0.5) * 54;
        p.position.z = (Math.random() - 0.5) * 22;
      }
    });

    renderer.render(scene, camera);
  }
  animate();
})();
