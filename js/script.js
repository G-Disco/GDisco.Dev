/* ============================================
   GSAP SETUP
   ============================================ */
gsap.registerPlugin(ScrollTrigger);

/* ============================================
   CANVAS — partículas ceniza (blanco + rosa pastel)
   ============================================ */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x      = Math.random() * canvas.width;
    this.y      = initial ? Math.random() * canvas.height : -6;
    this.size   = Math.random() * 1.8 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.14;
    this.speedY = Math.random() * 0.18 + 0.02;
    this.alpha  = Math.random() * 0.32 + 0.05;
    this.drift  = Math.random() * 0.004;
    this.offset = Math.random() * Math.PI * 2;
    this.tick   = 0;
    const r = Math.random();
    this.color = r > 0.55 ? '#f0b8d0' : r > 0.25 ? '#ff8ec8' : '#f5eff2';
  }

  update() {
    this.tick += 0.015;
    // movimiento orgánico — como ceniza en el viento
    this.x += this.speedX + Math.sin(this.tick + this.offset) * 0.3;
    this.y += this.speedY;
    if (this.y > canvas.height + 6) this.reset();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle   = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
  }
}

const particles = Array.from({ length: 260 }, () => new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  particles.forEach(p => { p.update(); p.draw(); });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ============================================
   CURSOR
   ============================================ */
const cursorDot   = document.querySelector('.cursor');
const cursorTrail = document.querySelector('.cursor-trail');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let trailX = mouseX, trailY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function trail() {
  trailX += (mouseX - trailX) * 0.1;
  trailY += (mouseY - trailY) * 0.1;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(trail);
})();

document.querySelectorAll('a, button, .tilt').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorDot.style.width      = '16px';
    cursorDot.style.height     = '16px';
    cursorDot.style.background = '#f5eff2';
    cursorDot.style.boxShadow  = '0 0 12px #f5eff2, 0 0 30px rgba(245,239,242,.35)';
  });
  el.addEventListener('mouseleave', () => {
    cursorDot.style.cssText = '';
  });
});

/* ============================================
   TYPEWRITER
   ============================================ */
const phrases = [
  'Full Stack Developer',
  'CSS Wizard nivel S+',
  'Bug Hunter Profesional',
  'Cafeinómano crónico',
  'Builder de experiencias',
  'Player One',
];

const typeEl = document.querySelector('.typewriter');
let pIdx = 0, cIdx = 0, deleting = false;

function typeWriter() {
  const cur = phrases[pIdx];
  typeEl.textContent = cur.slice(0, deleting ? cIdx - 1 : cIdx + 1);
  deleting ? cIdx-- : cIdx++;
  if (!deleting && cIdx === cur.length) {
    deleting = true;
    setTimeout(typeWriter, 2600); return;
  }
  if (deleting && cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
  setTimeout(typeWriter, deleting ? 34 : 70);
}
typeWriter();

/* ============================================
   NAVBAR SCROLL
   ============================================ */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ============================================
   GSAP — ENTRANCE
   ============================================ */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

heroTl
  .from('.nav-logo',     { y: -20, opacity: 0, duration: 0.5 })
  .from('.nav-links li', { y: -14, opacity: 0, stagger: 0.08, duration: 0.4 }, '-=0.3')
  .from('.bg-rose-bl',   { x: -40, opacity: 0, duration: 1.2, ease: 'power2.out' }, '-=0.4')
  .from('.bg-rose-br',   { x:  40, opacity: 0, duration: 1.2, ease: 'power2.out' }, '-=0.9')
  .from('.bg-rose-ml',   { x: -30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8')
  .from('.bg-rose-mr',   { x:  30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8')
  .from('.bg-rose-tl',   { y: -20, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.7')
  .from('.bg-rose-tr',   { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
  .to('.sm-greeting',    { opacity: 1, duration: 0.5 }, '-=0.6')
  .to('.sm-name',        { opacity: 1, duration: 0.7 }, '-=0.35')
  .to('.sm-title',       { opacity: 1, duration: 0.5 }, '-=0.3')
  .to('.xp-bar-wrap',      { opacity: 1, duration: 0.4 }, '-=0.2')
  .to('.discord-widget',   { opacity: 1, duration: 0.5 }, '-=0.1')
  .to('.sm-card',          { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

// XP fill + counter
heroTl.to('.xp-fill', { width: '72%', duration: 2, ease: 'power2.inOut' }, '-=0.5');
heroTl.to({ val: 0 }, {
  val: 7056, duration: 2, ease: 'power2.out',
  onUpdate() {
    const el = document.querySelector('.xp-counter');
    if (el) el.textContent = Math.round(this.targets()[0].val).toLocaleString();
  }
}, '<');

/* ============================================
   GSAP — BACKGROUND ROSES SWAY
   ============================================ */
gsap.to('.bg-rose-bl', {
  rotate: 2.5, duration: 4, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center',
});
gsap.to('.bg-rose-br', {
  rotate: -2.5, duration: 5, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center', delay: 1.5,
});
gsap.to('.bg-rose-ml', {
  rotate: 1.8, duration: 4.5, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center', delay: 0.8,
});
gsap.to('.bg-rose-mr', {
  rotate: -1.5, duration: 3.8, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center', delay: 2,
});
gsap.to('.bg-rose-tl', {
  rotate: 2, duration: 5.5, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'top center', delay: 1,
});
gsap.to('.bg-rose-tr', {
  rotate: -2, duration: 4.8, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'top center', delay: 2.5,
});
gsap.to('.footer-roses svg', {
  rotate: 1.5, duration: 3.5, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center',
  stagger: 1,
});

/* ============================================
   GSAP — VINE DIVIDERS
   ============================================ */
gsap.utils.toArray('.vine-divider').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    opacity: 0, scaleX: 0.6, duration: 1.2, ease: 'power3.out',
    transformOrigin: 'center',
  });
});

/* ============================================
   GSAP — SECTION REVEALS
   ============================================ */
gsap.utils.toArray('.section-header').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    x: -28, opacity: 0, duration: 0.8, ease: 'power3.out',
  });
});

gsap.utils.toArray('.g-card').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    y: 28, opacity: 0, duration: 0.7, ease: 'power3.out',
    delay: (i % 3) * 0.1,
  });
});

/* ============================================
   GSAP — ATTR BARS
   ============================================ */
document.querySelectorAll('.attr-fill').forEach(bar => {
  gsap.to(bar, {
    scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
    width: bar.dataset.w + '%',
    duration: 1.6, ease: 'power2.out',
    delay: Math.random() * 0.15,
  });
});

/* ============================================
   GSAP — ACHIEVEMENT COUNTERS
   ============================================ */
document.querySelectorAll('.ach-num[data-target]').forEach(el => {
  const target = parseInt(el.dataset.target);
  const obj = { val: 0 };
  gsap.to(obj, {
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    val: target, duration: 1.4, ease: 'power2.out',
    onUpdate() { el.textContent = Math.round(obj.val); },
  });
});

/* ============================================
   GSAP — CARD ROSE CORNERS
   ============================================ */
gsap.utils.toArray('.card-rose-corner').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    scale: 0, rotation: -20, duration: 0.8, ease: 'back.out(1.7)',
    transformOrigin: 'top center',
  });
});

/* ============================================
   3D TILT
   ============================================ */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top  - r.height / 2) / r.height) * -8;
    const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  *  8;
    gsap.to(card, { rotateX: rx, rotateY: ry, z: 8, transformPerspective: 900, duration: 0.1, ease: 'none' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, z: 0, duration: 0.6, ease: 'power3.out' });
  });
});

/* ============================================
   HAMBURGER
   ============================================ */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
let menuOpen    = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  navLinks.style.cssText = menuOpen ? `
    display:flex; flex-direction:column; position:absolute;
    top:100%; left:0; right:0; padding:1.1rem 7%; gap:.8rem;
    background:rgba(8,6,8,.97); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(245,239,242,.07);
  ` : 'display:none;';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { menuOpen = false; navLinks.style.cssText = 'display:none;'; });
});


/* ============================================
   ACTIVE NAV ON SCROLL
   ============================================ */
const navAs = document.querySelectorAll('.nav-links a');
document.querySelectorAll('section[id]').forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAs.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { threshold: 0.4 }).observe(s);
});

/* ============================================
   DISCORD — Lanyard presence (tiempo real)

   SETUP (una vez):
   1. Entra a discord.gg/lanyard con tu cuenta de Discord
   2. Activa Modo Desarrollador en Discord (Ajustes → Avanzado)
   3. Click derecho en tu nombre → "Copiar ID de usuario"
   4. Reemplaza el string de abajo con ese ID
   ============================================ */
const DISCORD_ID = '857777819324121098';

const DW_COLORS = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };
const DW_LABELS = { online: 'en línea', idle: 'ausente', dnd: 'no molestar', offline: 'offline' };

async function updateDiscord() {
  try {
    const r = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    if (!r.ok) return;
    const { data } = await r.json();

    const displayName = data.discord_user.global_name || data.discord_user.username;
    const avatarUrl   = data.discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp?size=128`
      : '';

    const playing   = data.activities?.find(a => a.type === 0);
    const listening = data.activities?.find(a => a.type === 2);
    const custom    = data.activities?.find(a => a.type === 4);
    let actText;
    if (playing)        actText = `▶ jugando ${playing.name}`;
    else if (listening) actText = `♪ ${listening.details ?? listening.name}`;
    else if (custom?.state) actText = custom.state;
    else                actText = DW_LABELS[data.discord_status] ?? 'offline';

    /* ─ small widget (sm-identity) ─ */
    const dot = document.getElementById('dw-status-dot');
    if (dot) {
      dot.style.background = DW_COLORS[data.discord_status] ?? DW_COLORS.offline;
      const dwName = document.getElementById('dw-name');
      const dwAct  = document.getElementById('dw-activity');
      const dwImg  = document.getElementById('dw-avatar-img');
      if (dwName) dwName.textContent = displayName;
      if (dwAct)  dwAct.textContent  = actText;
      if (dwImg && avatarUrl) dwImg.src = avatarUrl;
    }

    /* ─ featured card (El Brujo) ─ */
    const dcStatus   = document.getElementById('dc-status');
    const dcUsername = document.getElementById('dc-username');
    const dcActivity = document.getElementById('dc-activity');
    const dcAvatar   = document.getElementById('dc-avatar');
    if (dcStatus)   dcStatus.style.background = DW_COLORS[data.discord_status] ?? DW_COLORS.offline;
    if (dcUsername) dcUsername.textContent = displayName;
    if (dcActivity) dcActivity.textContent = actText;
    if (dcAvatar && avatarUrl) dcAvatar.src = avatarUrl;

  } catch { /* silencioso */ }
}

updateDiscord();
setInterval(updateDiscord, 30_000);
