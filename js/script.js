gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : -6;
    this.size = Math.random() * 1.8 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.14;
    this.speedY = Math.random() * 0.18 + 0.02;
    this.alpha = Math.random() * 0.32 + 0.05;
    this.drift = Math.random() * 0.004;
    this.offset = Math.random() * Math.PI * 2;
    this.tick = 0;
    const r = Math.random();
    this.color = r > 0.55 ? '#f0b8d0' : r > 0.25 ? '#ff8ec8' : '#f5eff2';
  }

  update() {
    this.tick += 0.015;
    this.x += this.speedX + Math.sin(this.tick + this.offset) * 0.3;
    this.y += this.speedY;
    if (this.y > canvas.height + 6) this.reset();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
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

const cursorDot = document.querySelector('.cursor');
const cursorTrail = document.querySelector('.cursor-trail');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let trailX = mouseX, trailY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

(function trail() {
  trailX += (mouseX - trailX) * 0.1;
  trailY += (mouseY - trailY) * 0.1;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(trail);
})();

document.querySelectorAll('a, button, .tilt').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorDot.style.width = '16px';
    cursorDot.style.height = '16px';
    cursorDot.style.background = '#f5eff2';
    cursorDot.style.boxShadow = '0 0 12px #f5eff2, 0 0 30px rgba(245,239,242,.35)';
  });
  el.addEventListener('mouseleave', () => {
    cursorDot.style.cssText = '';
  });
});

let phrases = (window.GDISCO_T && window.GDISCO_LANG)
  ? window.GDISCO_T[window.GDISCO_LANG].phrases
  : ['Full Stack Developer', 'CSS Wizard nivel S+', 'Bug Hunter Profesional', 'Cafeinómano crónico', 'Builder de experiencias', 'Player One'];

const typeEl = document.querySelector('.typewriter');
let pIdx = 0, cIdx = 0, deleting = false;

window.setPhrases = function (newPhrases) {
  phrases = newPhrases;
  pIdx = 0; cIdx = 0; deleting = false;
};

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

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── Navbar clock ──────────────────────────────────────────────────
(function () {
  const el = document.getElementById('nav-clock');
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  tick();
  setInterval(tick, 1000);
})();

// ─── Scrollspy ────────────────────────────────────────────────────
(function () {
  const SECTION_IDS = ['inicio', 'stats', 'quejas', 'contacto'];
  const links = document.querySelectorAll('.nav-links a');

  function setActive(id) {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }

  function updateSpy() {
    let current = SECTION_IDS[0];
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 100) current = id;
    });
    setActive(current);
  }

  // Actualización inmediata al hacer click
  links.forEach(a => {
    a.addEventListener('click', function () {
      const id = this.getAttribute('href').slice(1);
      setActive(id);
    });
  });

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();
})();

const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

heroTl
  .from('.nav-logo', { y: -20, opacity: 0, duration: 0.5 })
  .from('.nav-links li', { y: -14, opacity: 0, stagger: 0.08, duration: 0.4 }, '-=0.3')
  .from('.bg-rose-bl', { x: -40, opacity: 0, duration: 1.2, ease: 'power2.out' }, '-=0.4')
  .from('.bg-rose-br', { x: 40, opacity: 0, duration: 1.2, ease: 'power2.out' }, '-=0.9')
  .from('.bg-rose-ml', { x: -30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8')
  .from('.bg-rose-mr', { x: 30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8')
  .from('.bg-rose-tl', { y: -20, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.7')
  .from('.bg-rose-tr', { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
  .to('.sm-greeting', { opacity: 1, duration: 0.5 }, '-=0.6')
  .to('.sm-name', { opacity: 1, duration: 0.7 }, '-=0.35')
  .to('.sm-title', { opacity: 1, duration: 0.5 }, '-=0.3')
  .to('.xp-bar-wrap', { opacity: 1, duration: 0.4 }, '-=0.2')
  .to('.discord-widget', { opacity: 1, duration: 0.5 }, '-=0.1')
  .to('.sm-card', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

heroTl.to('.xp-fill', { width: '72%', duration: 2, ease: 'power2.inOut' }, '-=0.5');
heroTl.to({ val: 0 }, {
  val: 7056, duration: 2, ease: 'power2.out',
  onUpdate() {
    const el = document.querySelector('.xp-counter');
    if (el) el.textContent = Math.round(this.targets()[0].val).toLocaleString();
  }
}, '<');

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
gsap.to('.sakura-tree', {
  rotate: 1.5, duration: 3.5, ease: 'sine.inOut',
  repeat: -1, yoyo: true, transformOrigin: 'bottom center',
  stagger: 1,
});

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

document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -8;
    const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 8;
    gsap.to(card, { rotateX: rx, rotateY: ry, z: 8, transformPerspective: 900, duration: 0.1, ease: 'none' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, z: 0, duration: 0.6, ease: 'power3.out' });
  });
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  navLinks.style.cssText = menuOpen ? `
    display:flex; flex-direction:column; position:absolute;
    top:100%; left:0; right:0; padding:1.1rem 7%; gap:.8rem;
    background:rgba(8,6,8,.97); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(245,239,242,.07);
  ` : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { menuOpen = false; navLinks.style.cssText = ''; });
});

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

const DISCORD_ID = '857777819324121098';

const DW_COLORS = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };
const DW_LABELS = { online: 'en línea', idle: 'ausente', dnd: 'no molestar', offline: 'offline' };

async function updateDiscord() {
  try {
    const r = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    if (!r.ok) return;
    const { data } = await r.json();

    const displayName = data.discord_user.global_name || data.discord_user.username;
    const avatarHash = data.discord_user.avatar;
    const avatarUrl = avatarHash
      ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${avatarHash}.webp?size=128&animated=true`
      : '';

    const playing = data.activities?.find(a => a.type === 0);
    const listening = data.activities?.find(a => a.type === 2);
    const custom = data.activities?.find(a => a.type === 4);
    let actText;
    if (playing) actText = `▶ playing ${playing.name}`;
    else if (listening) actText = `♪ listening to ${listening.details ?? listening.name}`;
    else if (custom?.state) actText = custom.state;
    else actText = DW_LABELS[data.discord_status] ?? 'offline';

    // Activity thumbnail: Spotify album art or game icon
    let actImgUrl = '';
    if (data.spotify?.album_art_url) {
      actImgUrl = data.spotify.album_art_url;
    } else if (playing?.assets?.large_image) {
      const img = playing.assets.large_image;
      if (img.startsWith('mp:external/')) {
        actImgUrl = `https://media.discordapp.net/external/${img.slice('mp:external/'.length)}`;
      } else if (playing.application_id) {
        actImgUrl = `https://cdn.discordapp.com/app-assets/${playing.application_id}/${img}.webp?size=64`;
      }
    }

    const statusColor = DW_COLORS[data.discord_status] ?? DW_COLORS.offline;

    const dot = document.getElementById('dw-status-dot');
    if (dot) dot.style.background = statusColor;

    // Nav status dot
    const navDot = document.getElementById('nav-status-dot');
    if (navDot) navDot.style.background = statusColor;

    const dwName = document.getElementById('dw-name');
    const dwAct = document.getElementById('dw-activity');
    const dwImg = document.getElementById('dw-avatar-img');
    const dwActImg = document.getElementById('dw-activity-img');
    const dwLogoSvg = document.getElementById('dw-logo-svg');
    if (dwName) dwName.textContent = displayName;
    if (dwAct) dwAct.textContent = actText;
    if (dwImg) dwImg.src = avatarUrl || '';
    if (dwActImg && dwLogoSvg) {
      if (actImgUrl) {
        dwActImg.src = actImgUrl;
        dwActImg.style.display = 'block';
        dwLogoSvg.style.display = 'none';
      } else {
        dwActImg.style.display = 'none';
        dwLogoSvg.style.display = '';
      }
    }

    // Navbar now playing / idle
    const nowPlaying   = document.getElementById('nav-now-playing');
    const nnpTrack     = document.getElementById('nnp-track');
    const nnpIcon      = document.getElementById('nnp-music-icon');
    const nnpTrackWrap = document.getElementById('nnp-track-wrap');
    const nnpIdle      = document.getElementById('nnp-idle');
    if (nowPlaying && nnpTrack) {
      if (data.spotify) {
        const text = `${data.spotify.song}  —  ${data.spotify.artist}`;
        const doubled = text + '   ·   ' + text;
        nnpTrack.textContent = doubled;
        nnpTrack.style.animationDuration = Math.max(10, text.length * 0.28) + 's';
        if (nnpIcon)      nnpIcon.style.display      = '';
        if (nnpTrackWrap) nnpTrackWrap.style.display = '';
        if (nnpIdle)      nnpIdle.style.display      = 'none';
      } else {
        if (nnpIcon)      nnpIcon.style.display      = 'none';
        if (nnpTrackWrap) nnpTrackWrap.style.display = 'none';
        if (nnpIdle)      nnpIdle.style.display      = 'flex';
      }
      nowPlaying.style.display = 'flex';
    }

  } catch (e) { console.warn('[Discord]', e); }
}

updateDiscord();
setInterval(updateDiscord, 30_000);

// ─── Petal cursor effect ───────────────────────────────────────────
const PETAL_COLORS = ['#f0b8d0', '#e91e8c', '#c084fc', '#f472b6', '#ff78b0'];

document.addEventListener('click', function (e) {
  for (let i = 0; i < 5; i++) spawnPetal(e.clientX, e.clientY);
});

function spawnPetal(x, y) {
  const el = document.createElement('div');
  el.className = 'click-petal';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.background = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  el.style.transform = `translate(-50%,-50%) rotate(${Math.random() * 360}deg)`;
  document.body.appendChild(el);
  const tx = (Math.random() - 0.5) * 80;
  const ty = 30 + Math.random() * 60;
  gsap.to(el, {
    x: tx, y: ty,
    rotation: `+=${Math.random() * 540 - 270}`,
    opacity: 0,
    scale: 0.3 + Math.random() * 0.5,
    duration: 0.7 + Math.random() * 0.5,
    ease: 'power2.out',
    onComplete: () => el.remove(),
  });
}

// ─── Konami code ──────────────────────────────────────────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', function (e) {
  konamiIdx = (e.key === KONAMI[konamiIdx]) ? konamiIdx + 1 : 0;
  if (konamiIdx === KONAMI.length) {
    konamiIdx = 0;
    if (typeof confetti !== 'function') return;
    const end = Date.now() + 3000;
    (function burst() {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f0b8d0','#e91e8c','#c084fc','#ffffff'] });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f0b8d0','#e91e8c','#c084fc','#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(burst);
    })();
  }
});

// ─── Cigarro counter ──────────────────────────────────────────────
(function () {
  const START = new Date('2023-01-01').getTime();
  const MS_PER_CIGARRO = 72 * 60 * 1000;
  const el = document.getElementById('cigarro-count');
  if (!el) return;
  const target = Math.floor((Date.now() - START) / MS_PER_CIGARRO);
  gsap.to({ val: Math.max(0, target - 120) }, {
    val: target,
    duration: 2.5,
    ease: 'power2.out',
    delay: 0.6,
    onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val).toLocaleString(); },
  });

  // Sarcastic tooltip on click
  const MSGS = {
    es: ['// sí, estoy consciente', '// no es tu problema', '// el doctor también lo sabe', '// feature, no bug', '// me ayuda a pensar', '// podría ser peor'],
    en: ['// yes, I\'m aware', '// not your problem', '// my doctor knows too', '// feature, not a bug', '// helps me think', '// could be worse'],
  };
  let tipIdx = 0;
  const card = el.closest('.cigarro-card');
  const tip = document.createElement('div');
  tip.className = 'cigarro-tip';
  tip.style.opacity = '0';
  document.body.appendChild(tip);

  card.addEventListener('click', function (e) {
    e.stopPropagation();
    const lang = window.GDISCO_LANG || 'es';
    const msgs = MSGS[lang];
    tip.textContent = msgs[tipIdx % msgs.length];
    tipIdx++;
    const rect = card.getBoundingClientRect();
    tip.style.left = (rect.left + rect.width / 2) + 'px';
    tip.style.top = (rect.top - 10) + 'px';
    gsap.killTweensOf(tip);
    gsap.fromTo(tip, { opacity: 0, y: 0 }, { opacity: 1, y: -28, duration: 0.25, ease: 'power2.out',
      onComplete: function () {
        gsap.to(tip, { opacity: 0, y: -44, duration: 0.4, delay: 1.2, ease: 'power2.in' });
      }
    });
  });
})();

// ─── GO.exe crash animation ────────────────────────────────────────
(function () {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  const CHARS = '!@#$%^&*<>?/\\|█▓░╬╪≠±×÷';
  let crashing = false;

  logo.style.cursor = 'pointer';
  logo.addEventListener('click', function () {
    if (crashing) return;
    crashing = true;

    const original = logo.innerHTML;
    const text = 'GO.exe';
    let frame = 0;

    // Phase 1: glitch (400ms)
    const glitchInterval = setInterval(function () {
      const glitched = text.split('').map(c =>
        Math.random() < 0.5 ? CHARS[Math.floor(Math.random() * CHARS.length)] : c
      ).join('');
      logo.textContent = glitched;
      frame++;
      if (frame > 10) {
        clearInterval(glitchInterval);
        // Phase 2: crash message
        logo.textContent = 'FATAL_ERR';
        logo.style.color = '#e53935';
        setTimeout(function () {
          // Phase 3: rebooting
          logo.textContent = '// rebooting';
          logo.style.color = '';
          let dots = 0;
          const rebootInterval = setInterval(function () {
            logo.textContent = '// rebooting' + '.'.repeat(++dots % 4);
            if (dots >= 9) {
              clearInterval(rebootInterval);
              // Phase 4: restore with typewriter
              logo.textContent = '';
              const restore = 'GO.exe';
              let i = 0;
              const typeInterval = setInterval(function () {
                logo.textContent += restore[i++];
                if (i >= restore.length) {
                  clearInterval(typeInterval);
                  logo.innerHTML = original;
                  crashing = false;
                }
              }, 80);
            }
          }, 120);
        }, 500);
      }
    }, 40);
  });
})();
