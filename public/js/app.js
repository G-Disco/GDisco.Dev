
    (function () {
      var btn = document.getElementById('d20-btn');
      var result = document.getElementById('d20-result');
      if (!btn || !result) return;

      var msgs = {
        es: [
          [1, 'Pifia crítica. Tu código se borra solo.'],
          [2, 'El server de prod se cae. No fue tu culpa... o sí.'],
          [3, 'Git push --force a main. Suerte.'],
          [4, 'Tu PR fue rechazada sin comentarios.'],
          [5, 'Se te olvidó el punto y coma. Otra vez.'],
          [6, 'El cliente cambió los requisitos. De nuevo.'],
          [7, 'Café tibio. Día mediocre.'],
          [8, 'Un bug menor. Nada que no arregle un cigarro.'],
          [9, 'Compiló a la primera... pero no hace lo que debería.'],
          [10, 'Meh. Ni bien ni mal. Como un martes.'],
          [11, 'Encontraste un bug antes que QA. Bien por ti.'],
          [12, 'El legacy code tenía sentido por una vez.'],
          [13, 'Tu regex funcionó al primer intento.'],
          [14, 'El deploy salió limpio. Sin rollback.'],
          [15, 'Alguien te agradeció en el PR. Se siente bien.'],
          [16, 'Zero warnings. Zero errors. ¿Estás soñando?'],
          [17, 'El jefe dice que vas bien. Sospechoso pero agradable.'],
          [18, 'Resolviste un bug de 3 días en 5 minutos.'],
          [19, 'Te subieron el sueldo. No, espera, eso no pasa.'],
          [20, '¡Crítico natural! El universo te sonríe, brujo.'],
        ],
        en: [
          [1, 'Critical fail. Your code deletes itself.'],
          [2, 'Prod server goes down. Not your fault... or was it?'],
          [3, 'Git push --force to main. Good luck.'],
          [4, 'Your PR was rejected with no comments.'],
          [5, 'You forgot the semicolon. Again.'],
          [6, 'Client changed the requirements. Again.'],
          [7, 'Lukewarm coffee. Mediocre day.'],
          [8, 'Minor bug. Nothing a cigarette won\'t fix.'],
          [9, 'Compiled first try... but doesn\'t do what it should.'],
          [10, 'Meh. Neither good nor bad. Like a Tuesday.'],
          [11, 'Found a bug before QA. Good for you.'],
          [12, 'The legacy code made sense for once.'],
          [13, 'Your regex worked on the first try.'],
          [14, 'Clean deploy. No rollback needed.'],
          [15, 'Someone thanked you in the PR. Feels nice.'],
          [16, 'Zero warnings. Zero errors. Are you dreaming?'],
          [17, 'Boss says you\'re doing well. Suspicious but nice.'],
          [18, 'Solved a 3-day bug in 5 minutes.'],
          [19, 'They gave you a raise. Wait, that doesn\'t happen.'],
          [20, 'Natural 20! The universe smiles upon you, wizard.'],
        ]
      };

      btn.addEventListener('click', function () {
        var roll = Math.floor(Math.random() * 20);
        var lang = window.GDISCO_LANG || 'es';
        var list = msgs[lang] || msgs.es;
        var entry = list[roll];
        btn.classList.add('d20-spin');
        setTimeout(function () {
          btn.classList.remove('d20-spin');
          result.textContent = '🎲 ' + entry[0] + ' — ' + entry[1];
        }, 400);
      });
    })();

    (function () {
      const carousel = document.getElementById('games-carousel');
      const btnPrev = document.getElementById('carousel-prev');
      const btnNext = document.getElementById('carousel-next');
      const dotsWrap = document.getElementById('carousel-dots');
      if (!carousel) return;

      const VISIBLE = 4;
      const cards = Array.from(carousel.querySelectorAll('.game-card'));
      const total = cards.length;
      const steps = total - VISIBLE;
      let current = 0;

      cards.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      });

      function goTo(idx) {
        current = ((idx % total) + total) % total;
        if (current > steps) current = 0;
        const cardW = cards[0].offsetWidth + 8;
        carousel.scrollLeft = current * cardW;
        dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }

      btnPrev.addEventListener('click', () => goTo(current === 0 ? steps : current - 1));
      btnNext.addEventListener('click', () => goTo(current >= steps ? 0 : current + 1));
      goTo(0);
    })();


    (function () {
      const list = document.getElementById('quejas-list');
      const form = document.getElementById('queja-form');
      const feedback = document.getElementById('queja-feedback');
      let adminKey = null;

      function esc(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      function renderReplyInput(card, qId) {
        const wrap = document.createElement('div');
        wrap.className = 'queja-reply-form';
        wrap.innerHTML = `<input class="queja-input queja-reply-input" type="text" placeholder="responder..." maxlength="280" autocomplete="off"><button class="btn btn-ghost queja-reply-btn">↩</button>`;
        wrap.querySelector('.queja-reply-btn').addEventListener('click', () => {
          const text = wrap.querySelector('.queja-reply-input').value.trim();
          if (!text) return;
          fetch('/api/quejas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: adminKey, id: qId, reply: text }),
          }).then(r => r.json()).then(d => {
            if (d.ok) {
              appendReply(card, text);
              wrap.querySelector('.queja-reply-input').value = '';
            } else alert(d.error);
          });
        });
        card.appendChild(wrap);
      }

      function appendReply(card, text, ts) {
        let repliesWrap = card.querySelector('.queja-replies');
        if (!repliesWrap) {
          repliesWrap = document.createElement('div');
          repliesWrap.className = 'queja-replies';
          const replyForm = card.querySelector('.queja-reply-form');
          if (replyForm) card.insertBefore(repliesWrap, replyForm);
          else card.appendChild(repliesWrap);
        }
        const r = document.createElement('div');
        r.className = 'queja-reply';
        const replyTs = ts || Date.now();
        const timeStr = window.relativeTime ? window.relativeTime(replyTs) : '';
        r.innerHTML = `<img class="queja-reply-avatar" src="/SGDaiGurren.webp" alt="Gabriel O."><span class="queja-reply-author">Gabriel O.</span><span class="queja-reply-text">${esc(text)}</span><span class="queja-reply-time" data-ts="${replyTs}">${timeStr}</span>`;
        repliesWrap.appendChild(r);
      }

      function renderQueja(q, prepend = false) {
        const card = document.createElement('div');
        card.className = 'queja-card g-card';
        const initial = (q.name[0] ?? '?').toUpperCase();
        const qId = q.id ?? q.ts ?? '';
        card.dataset.id = qId;
        const ts = q.ts ?? q.id ?? null;
        const timeStr = (ts && window.relativeTime) ? window.relativeTime(ts) : '';
        const timeHtml = ts ? `<span class="queja-time" data-ts="${ts}">${timeStr}</span>` : '';
        card.innerHTML = `<div class="qc-top"><div class="queja-avatar">${esc(initial)}</div><span class="queja-name">${esc(q.name)}</span>${timeHtml}</div><span class="queja-text">${esc(q.text)}</span>${adminKey ? `<button class="queja-del" data-id="${esc(qId)}">×</button>` : ''}`;
        if (q.replies && q.replies.length) {
          const repliesWrap = document.createElement('div');
          repliesWrap.className = 'queja-replies';
          q.replies.forEach(rep => {
            const r = document.createElement('div');
            r.className = 'queja-reply';
            const repTs = rep.ts || null;
            const repTimeStr = (repTs && window.relativeTime) ? window.relativeTime(repTs) : '';
            const repTimeHtml = repTs ? `<span class="queja-reply-time" data-ts="${repTs}">${repTimeStr}</span>` : '';
            r.innerHTML = `<img class="queja-reply-avatar" src="/SGDaiGurren.webp" alt="Gabriel O."><span class="queja-reply-author">Gabriel O.</span><span class="queja-reply-text">${esc(rep.text)}</span>${repTimeHtml}`;
            repliesWrap.appendChild(r);
          });
          card.appendChild(repliesWrap);
        }
        if (adminKey) renderReplyInput(card, qId);
        if (prepend) list.insertBefore(card, list.firstChild);
        else list.appendChild(card);
        if (typeof window.refreshQuejasDots === 'function') window.refreshQuejasDots();
      }

      function addDeleteListeners() {
        list.querySelectorAll('.queja-del').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            fetch('/api/quejas', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, key: adminKey }),
            }).then(r => r.json()).then(d => {
              if (d.ok) btn.closest('.queja-card').remove();
              else alert(d.error);
            });
          });
        });
      }

      function refreshTimestamps() {
        if (!window.relativeTime) return;
        document.querySelectorAll('[data-ts]').forEach(el => {
          const ts = Number(el.dataset.ts);
          if (ts) el.textContent = window.relativeTime(ts);
        });
      }
      setInterval(refreshTimestamps, 60_000);
      window.addEventListener('gdisco:lang', refreshTimestamps);

      fetch('/api/quejas').then(r => r.json()).then(d => {
        (d.quejas ?? []).forEach(q => renderQueja(q));
      }).catch(() => {});

      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('queja-name').value.trim();
        const text = document.getElementById('queja-text').value.trim();
        if (!name || !text) { feedback.textContent = 'faltan campos.'; return; }
        fetch('/api/quejas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, text }),
        }).then(r => r.json()).then(d => {
          if (d.ok) {
            renderQueja({ id: d.id, name, text }, true);
            if (adminKey) addDeleteListeners();
            form.reset();
            feedback.textContent = 'queja registrada.';
            setTimeout(() => { feedback.textContent = ''; }, 3000);
            if (typeof confetti === 'function') confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.7 },
              colors: ['#cc2222', '#ff4400', '#c4a35a', '#991111', '#ffffff'],
            });
          } else {
            feedback.textContent = d.error ?? 'error.';
          }
        }).catch(() => { feedback.textContent = 'error de red.'; });
      });

      const eyeBtn = document.getElementById('admin-eye');
      const keyInput = document.getElementById('admin-key');
      const flag = document.getElementById('admin-flag');

      eyeBtn.addEventListener('click', () => {
        const show = keyInput.type === 'password';
        keyInput.type = show ? 'text' : 'password';
        eyeBtn.textContent = show ? '🙈' : '👁';
      });

      document.getElementById('admin-panel').addEventListener('submit', (e) => {
        e.preventDefault();
        const key = keyInput.value.trim();
        if (!key) return;
        flag.textContent = '...';
        flag.className = 'admin-flag';
        fetch('/api/quejas', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: -1, key }),
        }).then(r => r.json()).then(d => {
          if (d.error === 'No autorizado') {
            flag.textContent = '✗ incorrecta';
            flag.className = 'admin-flag admin-flag--err';
            return;
          }
          flag.textContent = '✓ correcta';
          flag.className = 'admin-flag admin-flag--ok';
          adminKey = key;
          setTimeout(() => {
            document.getElementById('admin-panel').style.display = 'none';
          }, 800);
          list.querySelectorAll('.queja-card:not(:first-child)').forEach(card => {
            const id = card.dataset.id;
            if (!card.querySelector('.queja-del')) {
              const btn = document.createElement('button');
              btn.className = 'queja-del';
              btn.dataset.id = id;
              btn.textContent = '×';
              card.appendChild(btn);
            }
            if (!card.querySelector('.queja-reply-form')) renderReplyInput(card, Number(id));
          });
          addDeleteListeners();
        }).catch(() => {
          flag.textContent = '✗ error de red';
          flag.className = 'admin-flag admin-flag--err';
        });
      });
    })();

    (function () {
      const carousel = document.getElementById('quejas-list');
      const btnPrev = document.getElementById('quejas-prev');
      const btnNext = document.getElementById('quejas-next');
      const dotsWrap = document.getElementById('quejas-dots');
      if (!carousel) return;
      let qCurrent = 0;

      function getCards() { return Array.from(carousel.querySelectorAll('.queja-card')); }

      function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        getCards().forEach((_, i) => {
          const d = document.createElement('button');
          d.className = 'carousel-dot' + (i === qCurrent ? ' active' : '');
          d.addEventListener('click', () => goTo(i));
          dotsWrap.appendChild(d);
        });
      }

      function goTo(idx) {
        const cards = getCards();
        if (!cards.length) return;
        qCurrent = ((idx % cards.length) + cards.length) % cards.length;
        carousel.scrollTo({ left: qCurrent * (cards[0].offsetWidth + 12), behavior: 'smooth' });
        if (dotsWrap) dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === qCurrent));
      }

      if (btnPrev) btnPrev.addEventListener('click', () => { const c = getCards(); goTo(qCurrent === 0 ? c.length - 1 : qCurrent - 1); });
      if (btnNext) btnNext.addEventListener('click', () => { const c = getCards(); goTo(qCurrent >= c.length - 1 ? 0 : qCurrent + 1); });

      window.refreshQuejasDots = function () { buildDots(); };
      buildDots();
    })();

    (function () {
      const KEY = 'gdisco_visited';
      const el = document.getElementById('visitor-count');
      const isNew = !localStorage.getItem(KEY);
      fetch(isNew ? '/api/counter?hit=1' : '/api/counter')
        .then(r => r.json())
        .then(d => {
          if (el) el.textContent = (d.count ?? 0).toLocaleString();
          if (isNew) localStorage.setItem(KEY, '1');
        })
        .catch(() => { if (el) el.textContent = '—'; });
    })();

    (function () {
      function tStr(key, fallback) {
        const T = window.GDISCO_T;
        const lang = window.GDISCO_LANG || 'es';
        return (T && T[lang] && T[lang][key]) || fallback;
      }
      function fmt(s, vars) {
        return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
      }
      function escAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      const steamList = document.getElementById('steam-list');
      const steamFoot = document.getElementById('steam-foot');
      const spotifyList = document.getElementById('spotify-list');
      const spotifyFoot = document.getElementById('spotify-foot');

      function steamItem(g, useFortnight) {
        const meta = useFortnight && g.hours_2w > 0
          ? fmt(tStr('ls_hours_2w', '{n}h last 2w'), { n: g.hours_2w })
          : fmt(tStr('ls_hours_total', '{n}h total'), { n: g.hours_total });
        const img = g.icon
          ? `<img class="ls-icon-img" src="${escAttr(g.icon)}" alt="" loading="lazy">`
          : '<span class="ls-icon-img" style="display:flex;align-items:center;justify-content:center;color:var(--dim);">▸</span>';
        const url = `https://store.steampowered.com/app/${g.appid}/`;
        return `<li class="ls-item">${img}<a class="ls-name" href="${url}" target="_blank" rel="noopener noreferrer">${escAttr(g.name)}</a><span class="ls-meta">${meta}</span></li>`;
      }

      function spotifyItem(t) {
        const img = t.cover
          ? `<img class="ls-icon-img" src="${escAttr(t.cover)}" alt="" loading="lazy">`
          : '<span class="ls-icon-img" style="display:flex;align-items:center;justify-content:center;color:var(--dim);">♪</span>';
        const link = t.url
          ? `<a class="ls-name" href="${escAttr(t.url)}" target="_blank" rel="noopener noreferrer">${escAttr(t.name)}</a>`
          : `<span class="ls-name">${escAttr(t.name)}</span>`;
        return `<li class="ls-item">${img}${link}<span class="ls-meta">${escAttr(t.artists)}</span></li>`;
      }

      let steamData = null;
      function renderSteam() {
        if (!steamList) return;
        if (!steamData || steamData.error || (!steamData.recent?.length && !steamData.top?.length)) {
          steamList.innerHTML = `<li class="ls-empty">${tStr('ls_offline', '// offline')}</li>`;
          if (steamFoot) steamFoot.textContent = '';
          return;
        }
        const useRecent = steamData.recent && steamData.recent.length > 0;
        const games = useRecent ? steamData.recent : steamData.top;
        steamList.innerHTML = games.slice(0, 5).map(g => steamItem(g, useRecent)).join('');
        if (steamFoot && steamData.totalGames) {
          steamFoot.textContent = fmt(tStr('ls_total_games', '{n} games · {h}h'), { n: steamData.totalGames, h: steamData.totalHours });
        }
      }

      fetch('/api/steam').then(r => r.json()).then(d => {
        steamData = d;
        renderSteam();
        var steamAvatar = document.getElementById('social-steam-avatar');
        if (steamAvatar && d.profile && d.profile.avatar) steamAvatar.src = d.profile.avatar;
      }).catch(() => { renderSteam(); });

      function renderSpotify(d) {
        if (!spotifyList) return;
        if (!d || d.error) {
          spotifyList.innerHTML = `<li class="ls-empty">${tStr('ls_offline', '// offline')}</li>`;
          return;
        }
        const list = (d.recent && d.recent.length) ? d.recent : (d.tracks || []);
        if (!list.length && !d.now_playing) {
          spotifyList.innerHTML = `<li class="ls-empty">${tStr('ls_empty', '// no data')}</li>`;
          return;
        }
        let html = '';
        if (d.now_playing) {
          html += `<li class="ls-now-playing"><span class="ls-np-pulse"></span><span>${tStr('ls_now_playing', 'now playing')}: <strong>${escAttr(d.now_playing.name)}</strong> — ${escAttr(d.now_playing.artists)}</span></li>`;
        }
        html += list.slice(0, 5).map(spotifyItem).join('');
        spotifyList.innerHTML = html;
      }

      function pullSpotify() {
        fetch('/api/spotify')
          .then(r => r.json())
          .then(renderSpotify)
          .catch(() => renderSpotify(null));
      }

      window.addEventListener('gdisco:lang', () => {
        renderSteam();
        pullSpotify();
      });

      pullSpotify();
      setInterval(() => {
        if (document.hidden) return;
        pullSpotify();
      }, 60_000);
    })();

    (function () {
      const overlay = document.getElementById('term-overlay');
      const body    = document.getElementById('term-body');
      const input   = document.getElementById('term-input');
      const form    = document.getElementById('term-prompt');
      const closeBtn = document.getElementById('term-close');
      if (!overlay || !input) return;

      const history = [];
      let histIdx = -1;
      let booted = false;

      function lang() { return window.GDISCO_LANG || 'es'; }
      function isEn() { return lang() === 'en'; }
      function escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      }

      function out(html, cls) {
        const line = document.createElement('div');
        line.className = 'term-line' + (cls ? ' ' + cls : '');
        line.innerHTML = html;
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
      }

      function open() {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        if (!booted) { boot(); booted = true; }
        setTimeout(() => input.focus(), 40);
      }
      function close() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      }
      function isOpen() { return overlay.classList.contains('open'); }

      function isTypingElsewhere() {
        const a = document.activeElement;
        if (!a || a === input) return false;
        const tag = a.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || a.isContentEditable;
      }

      document.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (!isOpen() && isTypingElsewhere()) return;
          e.preventDefault();
          isOpen() ? close() : open();
        } else if (e.key === 'Escape' && isOpen()) {
          e.preventDefault();
          close();
        }
      });
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

      const C = {};
      C.help = function () {
        const en = isEn();
        const items = [
          ['help',         en ? 'show this'           : 'mostrar esto'],
          ['whoami',       en ? 'who am I'            : 'sobre mí'],
          ['contact',      en ? 'reach me'            : 'contactarme'],
          ['socials',      en ? 'find me online'      : 'mis redes'],
          ['games',        en ? 'what I play'         : 'qué juego'],
          ['date',         en ? 'current date/time'   : 'fecha y hora'],
          ['echo <text>',  en ? 'echo text'           : 'echo texto'],
          ['clear',        'cls'],
          ['exit',         en ? 'close terminal'      : 'cerrar terminal'],
          ['gurren',       '???'],
          ['coffee',       '???'],
          ['cigarro',      '???'],
          ['sudo *',       '???'],
        ];
        out('<span class="term-acc">// available commands</span>');
        items.forEach(([c, d]) => {
          const pad = c + ' '.repeat(Math.max(2, 16 - c.length));
          out('  <span class="term-cmd">' + escHtml(pad) + '</span><span class="term-dim">' + escHtml(d) + '</span>');
        });
      };

      C.whoami = function () {
        const en = isEn();
        out('<span class="term-pink">Gabriel Ortega</span> <span class="term-dim">— @g._disco</span>');
        out(en ? 'Full Stack Developer · CSS Wizard nivel S+' : 'Full Stack Developer · CSS Wizard nivel S+');
        out(en ? 'AviHel MRO — Two roles, one cigarette.'      : 'AviHel MRO — Dos roles, un cigarro.');
        out('');
        out(en ? 'Gamer since 13. Dev since 17.'                : 'Gamer desde los 13. Dev desde los 17.');
        out(en ? 'If I can smoke while doing it, *maybe* I can do it.' : 'Si puedo fumar mientras lo hago, *tal vez* lo puedo hacer.');
      };
      C.about = C.whoami;

      C.contact = function () {
        out('<span class="term-acc">// contact</span>');
        out('  email    <a href="mailto:gabriel16ortega@gmail.com" class="term-link">gabriel16ortega@gmail.com</a>');
        out('  discord  <a href="https://discord.com/users/857777819324121098" target="_blank" rel="noopener" class="term-link">@gabriel</a>');
      };

      C.socials = function () {
        out('<span class="term-acc">// find me online</span>');
        out('  instagram  <a href="https://www.instagram.com/g._disco/" target="_blank" rel="noopener" class="term-link">@g._disco</a>');
        out('  spotify    <a href="https://open.spotify.com/user/31mmoahummftq3u7u6xwl4xyp7ay?si=1bd5184f65b64962" target="_blank" rel="noopener" class="term-link">GDisco</a>');
        out('  steam      <a href="https://steamcommunity.com/profiles/76561199206260941/" target="_blank" rel="noopener" class="term-link">GDisco</a>');
      };

      C.games = function () {
        out('<span class="term-acc">// games</span>');
        out('  Genshin Impact     · ~4000h · AR 60');
        out('  Zenless Zone Zero  · Proxy · New Eridu');
        out('  Valorant           · Bronce · Duelist');
        out('  League of Legends  · Plata · Mid/Top');
        out('  Warframe           · MR 16');
        out('  VRChat             · Quest 2');
        out('  GTA V              · Online');
        out('  Halo               · MCC');
      };

      C.date = function () { out(new Date().toString()); };
      C.pwd  = function () { out('/home/gabriel'); };

      C.clear = function () { body.innerHTML = ''; };
      C.cls = C.clear;

      C.exit  = close;
      C.quit  = close;
      C.q     = close;
      C.close = close;
      C.bye   = close;

      C.echo = function (...args) { out(escHtml(args.join(' '))); };

      C.cat = function (file) {
        if (!file) { out('cat: missing operand'); return; }
        if (file.includes('secret') || file.includes('passwd') || file.startsWith('/etc')) {
          out('cat: ' + escHtml(file) + ': permission denied');
        } else {
          out('cat: ' + escHtml(file) + ': nice try.');
        }
      };

      C.sudo = function () {
        out('<span class="term-err">// nice try.</span> <span class="term-dim">you\'re not in the sudoers file. this incident will be reported.</span>');
      };

      C.rm = function (...args) {
        if (args[0] === '-rf' && (args[1] === '/' || args[1] === '/*' || args[1] === '~')) {
          out('<span class="term-pink">// nope.</span>');
        } else {
          out('rm: ' + (isEn() ? 'permission denied. this is not your machine.' : 'permiso denegado. no es tu máquina.'));
        }
      };

      C.gurren = function () {
        out('<pre class="term-ascii">    \\\\\\|///');
        out('   \\\\ - - //');
        out('   ( @ @ )');
        out('+oOOo-(_)-oOOo+</pre>');
        out('<span class="term-pink">"Just who the hell do you think I am?!"</span>');
        out('<span class="term-dim">— Kamina, Tengen Toppa Gurren Lagann</span>');
      };

      C.coffee = function () {
        out('<pre class="term-ascii">     ( (');
        out('      ) )');
        out('   ........');
        out('   |      |]');
        out('    \\    /');
        out('     `--\'</pre>');
        out(isEn() ? '<span class="term-dim">// coffee dispensed. take a break.</span>' : '<span class="term-dim">// café servido. tómate un break.</span>');
      };

      C.cigarro = function () {
        out(isEn() ? '<span class="term-err">// permission denied</span> <span class="term-dim">— out of stock.</span>' : '<span class="term-err">// permiso denegado</span> <span class="term-dim">— se acabaron.</span>');
      };
      C.cigarette = C.cigarro;
      C.smoke = C.cigarro;

      C.history = function () {
        history.forEach((h, i) => out('  ' + (i + 1) + '  ' + escHtml(h)));
      };

      C.man = function (cmd) {
        if (!cmd) { out('What manual page do you want?'); return; }
        out('No manual entry for ' + escHtml(cmd) + '. ' + (isEn() ? 'Try ' : 'Prueba ') + '<span class="term-cmd">help</span>.');
      };

      function execute(line) {
        const trimmed = line.trim();
        if (!trimmed) return;
        out('<span class="term-ps1">gabriel@gdisco:~$</span> <span class="term-input-echo">' + escHtml(trimmed) + '</span>');
        history.push(trimmed);
        histIdx = history.length;
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        if (typeof C[cmd] === 'function') {
          try { C[cmd](...args); } catch (e) { out('<span class="term-err">// error: ' + escHtml(e.message) + '</span>'); }
        } else {
          out('<span class="term-err">' + escHtml(cmd) + ': command not found.</span> <span class="term-dim">try </span><span class="term-cmd">help</span>');
        }
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        execute(input.value);
        input.value = '';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length === 0) return;
          if (histIdx > 0) histIdx--;
          input.value = history[histIdx] || '';
          setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (histIdx < history.length - 1) {
            histIdx++;
            input.value = history[histIdx];
          } else {
            histIdx = history.length;
            input.value = '';
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const partial = input.value.toLowerCase().split(/\s+/)[0];
          if (!partial) return;
          const matches = Object.keys(C).filter(c => c.startsWith(partial));
          if (matches.length === 1) input.value = matches[0] + ' ';
          else if (matches.length > 1) out('  ' + matches.join('  '));
        } else if (e.key === 'l' && e.ctrlKey) {
          e.preventDefault();
          C.clear();
        } else if (e.key === 'c' && e.ctrlKey) {
          e.preventDefault();
          out('<span class="term-ps1">gabriel@gdisco:~$</span> <span class="term-input-echo">' + escHtml(input.value) + '</span>^C');
          input.value = '';
        }
      });

      function boot() {
        const en = isEn();
        out('<span class="term-dim">// booting gdisco shell v1.0...</span>');
        out('<span class="term-dim">// loading modules</span> [<span class="term-cmd">OK</span>]');
        out('<span class="term-dim">// auth as gabriel</span>   [<span class="term-cmd">OK</span>]');
        out('');
        out(en
          ? 'welcome to <span class="term-acc">GDisco shell</span>. type <span class="term-cmd">help</span> to start, <span class="term-cmd">exit</span> or <kbd>esc</kbd> to leave.'
          : 'bienvenido a <span class="term-acc">GDisco shell</span>. escribe <span class="term-cmd">help</span> para empezar, <span class="term-cmd">exit</span> o <kbd>esc</kbd> para salir.');
        out('');
      }

      window.openTerminal  = open;
      window.closeTerminal = close;
    })();

    (function () {
      const trigger = document.getElementById('nav-version');
      const overlay = document.getElementById('cl-overlay');
      const body    = document.getElementById('cl-body');
      const closeBtn = document.getElementById('cl-close');
      if (!trigger || !overlay || !body) return;

      function lang() { return window.GDISCO_LANG || 'es'; }
      function tStr(key, fb) {
        const T = window.GDISCO_T;
        return (T && T[lang()] && T[lang()][key]) || fb;
      }
      function tArr(key) {
        const T = window.GDISCO_T;
        return (T && T[lang()] && T[lang()][key]) || [];
      }

      function render() {
        const log = tArr('cl_log');
        const currentLabel = tStr('cl_current', 'current');
        body.innerHTML = log.map(e => {
          const cls = 'cl-entry' + (e.current ? ' cl-entry--current' : '');
          const badge = e.current ? `<span class="cl-badge">${currentLabel}</span>` : '';
          const subtitle = e.title ? `<span class="cl-subtitle">${e.title}</span>` : '';
          const notes = (e.notes || []).map(n => `<li>${n}</li>`).join('');
          return `<article class="${cls}">
            <header class="cl-entry-head">
              <span class="cl-version">${e.v}</span>
              <span class="cl-date">${e.date || ''}</span>
              ${badge}
              ${subtitle}
            </header>
            <ul class="cl-notes">${notes}</ul>
          </article>`;
        }).join('');
        const footEl = overlay.querySelector('[data-i18n="cl_footer"]');
        if (footEl) footEl.textContent = tStr('cl_footer', '// fin del log');
      }

      function open() {
        if (!body.dataset.rendered) { render(); body.dataset.rendered = '1'; }
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        body.scrollTop = 0;
      }
      function close() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      }

      trigger.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      });
      window.addEventListener('gdisco:lang', () => {
        if (body.dataset.rendered) render();
      });
    })();

    (function () {
      var canvas = document.getElementById('goth-clock');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var size = 260;
      var cx = size / 2, cy = size / 2, r = 115;
      var GOLD = '#c4a35a';
      var GOLD_DIM = 'rgba(196, 163, 90, 0.3)';
      var GOLD_GLOW = 'rgba(196, 163, 90, 0.15)';
      var PURPLE = 'rgba(204, 34, 34, 0.4)';
      var WHITE = 'rgba(240, 238, 245, 0.7)';
      var RUNES = 'ⅫⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪ';

      function draw() {
        var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Monterrey' }));
        var h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();

        ctx.clearRect(0, 0, size, size);

        ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = GOLD_GLOW; ctx.fill();

        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD_DIM; ctx.lineWidth = 0.5; ctx.stroke();

        for (var i = 0; i < 12; i++) {
          var a = (i * Math.PI * 2) / 12 - Math.PI / 2;
          var x1 = cx + Math.cos(a) * (r - 7);
          var y1 = cy + Math.sin(a) * (r - 7);
          var x2 = cx + Math.cos(a) * (r - 2);
          var y2 = cy + Math.sin(a) * (r - 2);
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = GOLD; ctx.lineWidth = i % 3 === 0 ? 1.5 : 0.7;
          ctx.stroke();

          var nx = cx + Math.cos(a) * (r - 15);
          var ny = cy + Math.sin(a) * (r - 15);
          ctx.font = '17px serif';
          ctx.fillStyle = GOLD_DIM;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(RUNES[i], nx, ny);
        }

        for (var j = 0; j < 60; j++) {
          if (j % 5 === 0) continue;
          var a2 = (j * Math.PI * 2) / 60 - Math.PI / 2;
          var mx1 = cx + Math.cos(a2) * (r - 3);
          var my1 = cy + Math.sin(a2) * (r - 3);
          var mx2 = cx + Math.cos(a2) * (r - 1);
          var my2 = cy + Math.sin(a2) * (r - 1);
          ctx.beginPath(); ctx.moveTo(mx1, my1); ctx.lineTo(mx2, my2);
          ctx.strokeStyle = GOLD_DIM; ctx.lineWidth = 0.3; ctx.stroke();
        }

        ctx.strokeStyle = PURPLE; ctx.lineWidth = 0.4;
        var pr = 10;
        for (var p = 0; p < 5; p++) {
          var pa1 = (p * 2 * Math.PI) / 5 - Math.PI / 2;
          var pa2 = ((p + 2) * 2 * Math.PI) / 5 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(pa1) * pr, cy + Math.sin(pa1) * pr);
          ctx.lineTo(cx + Math.cos(pa2) * pr, cy + Math.sin(pa2) * pr);
          ctx.stroke();
        }

        var hAngle = ((h + m / 60) * Math.PI * 2) / 12 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(hAngle) * (r * 0.5), cy + Math.sin(hAngle) * (r * 0.5));
        ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();

        var mAngle = ((m + s / 60) * Math.PI * 2) / 60 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(mAngle) * (r * 0.72), cy + Math.sin(mAngle) * (r * 0.72));
        ctx.strokeStyle = WHITE; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();

        var sAngle = (s * Math.PI * 2) / 60 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sAngle) * (r * 0.78), cy + Math.sin(sAngle) * (r * 0.78));
        ctx.strokeStyle = 'rgba(255, 68, 0, 0.6)'; ctx.lineWidth = 0.7; ctx.lineCap = 'round'; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = GOLD; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = GOLD_GLOW; ctx.fill();
      }

      draw();
      setInterval(draw, 1000);
    })();

    (function () {
      var DISCORD_ID = '857777819324121098';
      var COLORS = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };
      var LABELS = { online: 'en línea', idle: 'ausente', dnd: 'no molestar', offline: 'offline' };

      function update() {
        fetch('https://api.lanyard.rest/v1/users/' + DISCORD_ID)
          .then(function(r) { return r.json(); })
          .then(function(res) {
            var data = res.data;
            if (!data) return;

            var name = data.discord_user.global_name || data.discord_user.username;
            var hash = data.discord_user.avatar;
            var ext = hash && hash.startsWith('a_') ? 'gif' : 'webp';
            var avatarUrl = hash
              ? 'https://cdn.discordapp.com/avatars/' + data.discord_user.id + '/' + hash + '.' + ext + '?size=128'
              : '';

            var status = data.discord_status || 'offline';
            var color = COLORS[status] || COLORS.offline;

            var custom = null;
            var playing = null;
            var listening = null;
            if (data.activities) {
              for (var i = 0; i < data.activities.length; i++) {
                if (data.activities[i].type === 4) custom = data.activities[i];
                if (data.activities[i].type === 0) playing = data.activities[i];
                if (data.activities[i].type === 2) listening = data.activities[i];
              }
            }

            var actText = '';
            if (playing) actText = '▶ ' + playing.name;
            else if (listening) actText = '♪ ' + (listening.details || listening.name);

            var el = function(id) { return document.getElementById(id); };

            var dot = el('about-discord-dot');
            if (dot) dot.style.background = color;

            var navDot = el('nav-status-dot');
            if (navDot) navDot.style.background = color;

            var dpAvatar = el('dp-avatar');
            if (dpAvatar && avatarUrl) dpAvatar.src = avatarUrl;
            var socialDiscord = el('social-discord-avatar');
            if (socialDiscord && avatarUrl) socialDiscord.src = avatarUrl;
            if (dpAvatar) {
              dpAvatar.style.borderColor = color;
              dpAvatar.style.boxShadow = '0 0 10px ' + color + '80, 0 0 20px ' + color + '30';
            }

            var dpName = el('dp-name');
            if (dpName) dpName.textContent = name;

            var dpStatus = el('dp-status');
            if (dpStatus) {
              dpStatus.textContent = LABELS[status] || 'offline';
              dpStatus.style.color = color;
            }

            var dpQuote = el('dp-quote');
            if (dpQuote) dpQuote.textContent = (custom && custom.state) ? custom.state : '';

            var dpActivity = el('dp-activity');
            if (dpActivity) dpActivity.textContent = actText;

            var nnpTrack = el('nnp-track');
            var nnpIcon = el('nnp-music-icon');
            var nnpTrackWrap = el('nnp-track-wrap');
            var nnpIdle = el('nnp-idle');
            if (nnpTrack && data.spotify) {
              var text = data.spotify.song + '  —  ' + data.spotify.artist;
              nnpTrack.textContent = text + '   ·   ' + text;
              nnpTrack.style.animationDuration = Math.max(10, text.length * 0.28) + 's';
              if (nnpIcon) nnpIcon.style.display = '';
              if (nnpTrackWrap) nnpTrackWrap.style.display = '';
              if (nnpIdle) nnpIdle.style.display = 'none';
            } else {
              if (nnpIcon) nnpIcon.style.display = 'none';
              if (nnpTrackWrap) nnpTrackWrap.style.display = 'none';
              if (nnpIdle) nnpIdle.style.display = '';
            }
          }).catch(function() {});
      }

      update();
      setInterval(function() { if (!document.hidden) update(); }, 30000);
    })();

    (function () {
      var btn = document.getElementById('bgm-toggle');
      if (!btn) return;

      var audio = new Audio('/assets/audio/libera-me-from-hell.mp3');
      audio.loop = true;
      audio.volume = 0.35;

      var playing = false;
      var triedAutoplay = false;

      function play() {
        audio.play().then(function () {
          playing = true;
          btn.classList.add('playing');
        }).catch(function () {});
      }

      function toggle() {
        if (playing) {
          audio.pause();
          playing = false;
          btn.classList.remove('playing');
        } else {
          play();
        }
      }

      btn.addEventListener('click', toggle);

      function onFirstInteraction() {
        if (triedAutoplay) return;
        triedAutoplay = true;
        if (!playing) play();
        document.removeEventListener('click', onFirstInteraction);
        document.removeEventListener('keydown', onFirstInteraction);
        document.removeEventListener('scroll', onFirstInteraction);
      }

      document.addEventListener('click', onFirstInteraction);
      document.addEventListener('keydown', onFirstInteraction);
      document.addEventListener('scroll', onFirstInteraction, { passive: true });
    })();

    (function () {
      var el = document.getElementById('kamina-quote');
      if (!el) return;
      var quotes = [
        '"Kick logic out and do the impossible!" — Kamina',
        '"Believe in the you who believes in yourself." — Kamina',
        '"Don\'t believe in yourself. Believe in me! Believe in the Kamina who believes in you!" — Kamina',
        '"Your drill is the drill that will pierce the heavens!" — Simon',
        '"Just who the hell do you think I am?!" — Kamina',
        '"The tomorrow we\'re trying to reach is not a tomorrow you had decided on." — Simon',
        '"A real man never dies, even when he\'s killed!" — Kamina',
        '"Go beyond the impossible and kick reason to the curb!" — Kamina',
        '"If you\'re gonna dig, dig to the heavens!" — Kamina',
        '"Later, buddy." — Kamina',
        '"My drill is my soul!" — Simon',
        '"Don\'t forget. Believe in yourself. Not in the you who believes in me. Not the me who believes in you. Believe in the you who believes in yourself." — Kamina',
        '"The lights in the sky are stars. Stars that all of us will one day have to surpass." — Lordgenome',
        '"When we were trapped in that dark tunnel... you were the one who lit the way." — Simon',
        '"Mark my words. This drill will open a hole in the universe!" — Simon',
      ];
      el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    })();
