(function () {
  const T = {
    es: {
      nav_home: 'inicio',
      nav_stats: 'timeline',
      nav_quejas: 'quejas',
      nav_contact: 'contacto',
      greeting: '// hola, soy',
      visitor_smile: 'Sonríe~',
      visitor_text: 'Eres el visitante no:',
      about_tag: '// sobre_mi.exe',
      about_text: 'Desarrollador fullstack con <em>obsesión por el CSS, comentar código y el tabaco</em>.<br>Gamer no-profesional desde los 13, Dev desde los 17.<br>Si puedo fumar mientras lo hago <em>*tal vez*</em> lo puedo hacer.',
      btn_stats: '▶ ver stats',
      btn_contact: 'escribeme',
      stats_title: '// más_detalles',
      bio_p1: 'Me pagan con un cigarro — <em>A veces la mitad de uno.</em>',
      bio_p2: 'Paso la mayor parte del tiempo jugando o rediseñando esta página.',
      bio_p3: 'Me apasiona ser naco — hablar corriente es mi don. Disfruto de la música, mi anime favorito (y el mejor) es Gurren Lagann. <span style="color:#e53935;font-weight:bold;">No negociable.</span>',
      bio_p4: 'También administro servidores. Por amor al arte — y me defiendo con todo esto:',
      tl_2023_role: 'Creciendo',
      tl_2023_desc: 'Puro HTML al principio, ni sabía lo que había afuera. Luego PHP, apenas volviéndome un don.',
      tl_2024_role: 'Practicante',
      tl_2024_desc: 'Mantener lo que había y construir sobre ello.',
      tl_2025_role: 'Full Stack Dev',
      tl_2025_desc: 'Reconstruí <a href="https://avihel.com.mx" target="_blank" rel="noopener noreferrer" class="tl-link">↗ avihel.com.mx</a> desde cero. Ese sí es mío. <em class="tl-shade">Me siguen pagando como practicante.</em>',
      tl_now_role: 'FS + Enc. Sistemas',
      tl_now_desc: 'Dos roles, un cigarro. <em class="tl-shade">Aún me pagan como practicante.</em>',
      games_label: '// cosas que me gusta jugar',
      ls_steam_title: '// steam · jugando últimamente',
      ls_spotify_title: '// spotify · escuchadas recientes',
      ls_loading: '// cargando...',
      ls_offline: '// offline',
      ls_empty: '// sin datos',
      ls_now_playing: 'sonando ahora',
      ls_hours_2w: '{n}h estas 2sem',
      ls_hours_total: '{n}h totales',
      ls_total_games: '{n} juegos · {h}h',
      game_genshin_desc: 'Mi mayor adicción desde 2020. ~4000 horas registradas, catador de monas chinas profesional.',
      game_zzz_desc: 'Lo mismo que Genshin pero aquí se mueven más rico.',
      game_valorant_desc: 'La desgracia de mi paciencia y mi cordura.',
      game_lol_desc: 'Lo mismo que Valorant, pero esto es más como una relación abusiva.',
      game_warframe_desc: 'El grind eterno. Lo dejo y vuelvo cada 3 meses como si nada.',
      game_vrchat_desc: 'El lugar más extraño de internet y aun así me quedo.',
      game_gta_desc: 'Clásico. Nunca se va, nunca se va.',
      game_halo_desc: 'El shooter que me hizo amar los shooters antes que Valorant los arruinara.',
      quejas_title: '// quejas o confesiones',
      quejas_sub: '— Son anónimas, deja tu huella.',
      queja_form_title: '// deja tu queja o confesión',
      cigarro_text: 'cigarros fumados codeando',
      queja_name_ph: 'nombre',
      queja_text_ph: 'tu queja aquí...',
      queja_submit: 'enviar',
      admin_enter: 'entrar',
      contact_title: 'Contacto',
      contact_email_label: 'correo',
      footer_sub: 'Gamer poco profesional · Profanador de JS · Builder de experiencias · Comentador compulsivo',
      footer_copy: '// GSAP · Three.js · CSS · amor y espinas',
      nnp_idle_label: 'durmiendo',
      phrases: [
        'Full Stack Developer',
        'CSS Wizard nivel S+',
        'Bug Hunter Profesional',
        'Cafeinómano crónico',
        'Builder de experiencias',
        'Player One',
      ],
      title_phrases: [
        '[Codeando]',
        '[Fumando]',
        '[En partida]',
        '[Idle]',
        '[Cazando bugs]',
        '[Soñando]',
      ],
      time_now: 'ahora',
      time_min: 'hace {n}m',
      time_hour: 'hace {n}h',
      time_day: 'hace {n}d',
      time_week: 'hace {n}sem',
      cl_title: '// changelog',
      cl_footer: '// fin del log · escrito entre cigarro y cigarro',
      cl_current: 'actual',
      cl_log: [
        {
          v: 'v2.5', date: '2026-05', current: true,
          title: 'el update de la flojera productiva',
          notes: [
            'Spotify <em>en vivo</em> con polling cada 60s — ahora ven qué oigo aunque no se los pidan.',
            'Steam stats reales — sí, llevo 4000h en Genshin, ya cállense.',
            'Terminal flotante — tecla <kbd>~</kbd> para sentirme hacker.',
            'Click en la luna = tormenta de pétalos. <em>Porque sí.</em>',
            'GIFs → MP4: 30MB → 1.8MB. Su data móvil me lo agradece.',
            'Limpieza de código: borré 100+ líneas de comentarios que nadie iba a leer.',
          ],
        },
        {
          v: 'v2.4', date: '2026-04',
          title: 'el árbol que nadie pidió',
          notes: [
            'Cherry tree 3D con three.js — porque CSS no era suficiente sufrimiento.',
            'Luna arrastrable. Pruébalo. <em>Ahora.</em>',
            'Kanji flotantes 桜花散 de fondo — significa "flores de cerezo cayendo", muy poético.',
            'Particles cursor con pétalos — más decoración inútil = más arte.',
          ],
        },
        {
          v: 'v2.3', date: '2026-03',
          title: 'la sección de quejas',
          notes: [
            'Confesiones anónimas porque mis amigos necesitaban un lugar para insultarme.',
            'Admin panel oculto al fondo — no es seguro pero <em>se ve cool</em>.',
            'Replies como Gabriel O. — me sirve para tener la última palabra.',
          ],
        },
        {
          v: 'v2.2', date: '2026-02',
          title: 'identidad rebrand',
          notes: [
            'Discord widget en vivo (Lanyard API) — para que sepan cuándo estoy en VRChat.',
            'Social cards mini · Instagram · Spotify · Steam.',
            'Logo <span class="cl-pink">G<b>O</b>.exe</span> con glitch on click — escondido.',
          ],
        },
        {
          v: 'v2.1', date: '2026-01',
          title: 'la barra de XP que no hace nada',
          notes: [
            'XP bar puramente decorativa. <em>Nivel 12 desde hace 4 meses.</em>',
            'Visitor counter real (KV de Cloudflare).',
            'Cigarro counter — placebo. Solo sube si yo lo subo. <em>Nadie lo nota.</em>',
          ],
        },
        {
          v: 'v2.0', date: '2025-11',
          title: 'rebuild gothic-cyber',
          notes: [
            'Borré todo el v1. <em>Vergüenza ajena de mí mismo.</em>',
            'Paleta nueva: rosa, espinas, sakura. Nunca más volveré a usar Bootstrap.',
            'Fonts: Pirata One, Cinzel Decorative, Share Tech Mono. <em>Diva.</em>',
          ],
        },
        {
          v: 'v1.0', date: '2024-04',
          title: 'la era oscura',
          notes: [
            'Tabla HTML con marquee y un GIF de Naruto.',
            '<em>No existe documentación de esta versión.</em>',
            '<span class="cl-dim">// se hizo lo que se pudo</span>',
          ],
        },
      ],
    },
    en: {
      nav_home: 'home',
      nav_stats: 'timeline',
      nav_quejas: 'complaints',
      nav_contact: 'contact',
      greeting: '// hey, I\'m',
      visitor_smile: 'Smile~',
      visitor_text: 'You\'re visitor no:',
      about_tag: '// about_me.exe',
      about_text: 'Fullstack developer with <em>an obsession for CSS, code comments, and cigarettes</em>.<br>Non-professional gamer since 13, Dev since 17.<br>If I can smoke while doing it <em>*maybe*</em> I can get it done.',
      btn_stats: '▶ view stats',
      btn_contact: 'contact me',
      stats_title: '// more_details',
      bio_p1: 'They pay me with a cigarette — <em>Sometimes half of one.</em>',
      bio_p2: 'I spend most of my time gaming or redesigning this page.',
      bio_p3: 'I\'m a bit of a lowlife — casual talk is my gift. I enjoy music, my favorite anime (and the best) is Gurren Lagann. <span style="color:#e53935;font-weight:bold;">Non-negotiable.</span>',
      bio_p4: 'I also manage servers. For the love of the craft — and I hold my own with all of this:',
      tl_2023_role: 'Growing',
      tl_2023_desc: 'Pure HTML at first, had no idea what was out there. Then PHP, barely becoming a wizard.',
      tl_2024_role: 'Intern',
      tl_2024_desc: 'Maintaining what was there and building on top of it.',
      tl_2025_role: 'Full Stack Dev',
      tl_2025_desc: 'Rebuilt <a href="https://avihel.com.mx" target="_blank" rel="noopener noreferrer" class="tl-link">↗ avihel.com.mx</a> from scratch. That one\'s mine. <em class="tl-shade">Still being paid as an intern.</em>',
      tl_now_role: 'FS + Systems Lead',
      tl_now_desc: 'Two roles, one cigarette. <em class="tl-shade">Still paid as an intern.</em>',
      games_label: '// things I like to play',
      ls_steam_title: '// steam · recently played',
      ls_spotify_title: '// spotify · recently listened',
      ls_loading: '// loading...',
      ls_offline: '// offline',
      ls_empty: '// no data',
      ls_now_playing: 'now playing',
      ls_hours_2w: '{n}h last 2w',
      ls_hours_total: '{n}h total',
      ls_total_games: '{n} games · {h}h',
      game_genshin_desc: 'My biggest addiction since 2020. ~4000 hours logged, professional anime girl connoisseur.',
      game_zzz_desc: 'Same as Genshin but they move better here.',
      game_valorant_desc: 'The bane of my patience and sanity.',
      game_lol_desc: 'Same as Valorant, but this one feels more like an abusive relationship.',
      game_warframe_desc: 'The eternal grind. I quit and come back every 3 months like nothing happened.',
      game_vrchat_desc: 'The strangest place on the internet and yet I stay.',
      game_gta_desc: 'Classic. It never leaves, it never leaves.',
      game_halo_desc: 'The shooter that made me love shooters before Valorant ruined them.',
      quejas_title: '// complaints or confessions',
      quejas_sub: '— They\'re anonymous, leave your mark.',
      queja_form_title: '// leave your complaint or confession',
      cigarro_text: 'cigarettes smoked while coding',
      queja_name_ph: 'name',
      queja_text_ph: 'your complaint here...',
      queja_submit: 'send',
      admin_enter: 'enter',
      contact_title: 'Contact',
      contact_email_label: 'email',
      footer_sub: 'Unprofessional gamer · JS profaner · Experience builder · Compulsive commenter',
      footer_copy: '// GSAP · Three.js · CSS · love and thorns',
      nnp_idle_label: 'idling',
      phrases: [
        'Full Stack Developer',
        'CSS Wizard S+ Tier',
        'Professional Bug Hunter',
        'Chronic Caffeine Addict',
        'Experience Builder',
        'Player One',
      ],
      title_phrases: [
        '[Coding]',
        '[Smoking]',
        '[In game]',
        '[Idle]',
        '[Bug hunting]',
        '[Dreaming]',
      ],
      time_now: 'just now',
      time_min: '{n}m ago',
      time_hour: '{n}h ago',
      time_day: '{n}d ago',
      time_week: '{n}w ago',
      cl_title: '// changelog',
      cl_footer: '// end of log · written between cigarettes',
      cl_current: 'current',
      cl_log: [
        {
          v: 'v2.5', date: '2026-05', current: true,
          title: 'the productive-procrastination update',
          notes: [
            'Spotify <em>live</em> with 60s polling — now you see what I listen to whether you asked or not.',
            'Real Steam stats — yes, 4000h in Genshin, shut up.',
            'Floating terminal — hit <kbd>~</kbd> to feel like a hacker.',
            'Click the moon = petal storm. <em>Just because.</em>',
            'GIFs → MP4: 30MB → 1.8MB. Your mobile data thanks me.',
            'Code cleanup: deleted 100+ lines of comments nobody was going to read.',
          ],
        },
        {
          v: 'v2.4', date: '2026-04',
          title: 'the tree nobody asked for',
          notes: [
            '3D cherry tree with three.js — because CSS wasn\'t suffering enough.',
            'Draggable moon. Try it. <em>Now.</em>',
            'Floating kanji 桜花散 background — means "scattering cherry blossoms", very poetic.',
            'Petal cursor particles — more useless decoration = more art.',
          ],
        },
        {
          v: 'v2.3', date: '2026-03',
          title: 'the complaints section',
          notes: [
            'Anonymous confessions because my friends needed somewhere to insult me.',
            'Hidden admin panel at the bottom — not secure but <em>looks cool</em>.',
            'Replies as Gabriel O. — lets me have the last word.',
          ],
        },
        {
          v: 'v2.2', date: '2026-02',
          title: 'identity rebrand',
          notes: [
            'Live Discord widget (Lanyard API) — so you know when I\'m in VRChat.',
            'Mini social cards · Instagram · Spotify · Steam.',
            'Logo <span class="cl-pink">G<b>O</b>.exe</span> with hidden glitch on click.',
          ],
        },
        {
          v: 'v2.1', date: '2026-01',
          title: 'the XP bar that does nothing',
          notes: [
            'Purely decorative XP bar. <em>Level 12 for 4 months now.</em>',
            'Real visitor counter (Cloudflare KV).',
            'Cigarette counter — placebo. Only goes up if I bump it. <em>Nobody notices.</em>',
          ],
        },
        {
          v: 'v2.0', date: '2025-11',
          title: 'gothic-cyber rebuild',
          notes: [
            'Deleted all of v1. <em>Secondhand embarrassment from myself.</em>',
            'New palette: pink, thorns, sakura. Never touching Bootstrap again.',
            'Fonts: Pirata One, Cinzel Decorative, Share Tech Mono. <em>Diva.</em>',
          ],
        },
        {
          v: 'v1.0', date: '2024-04',
          title: 'the dark era',
          notes: [
            'HTML table with a marquee and a Naruto GIF.',
            '<em>No documentation exists for this version.</em>',
            '<span class="cl-dim">// did what we could</span>',
          ],
        },
      ],
    },
  };

  function detectLang() {
    var saved = localStorage.getItem('gdisco_lang');
    if (saved === 'es' || saved === 'en') return saved;
    var nav = (navigator.language || 'es').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'es';
  }

  window.GDISCO_T = T;
  window.GDISCO_LANG = detectLang();

  function doApply(lang) {
    var t = T[lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (key in t) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.dataset.i18nPh;
      if (key in t) el.placeholder = t[key];
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';
    document.documentElement.lang = lang;
    if (typeof window.setPhrases === 'function') window.setPhrases(t.phrases);
    localStorage.setItem('gdisco_lang', lang);
    try { window.dispatchEvent(new CustomEvent('gdisco:lang', { detail: { lang: lang } })); } catch (e) {}
  }

  function applyLang(lang, animate) {
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    window.GDISCO_LANG = lang;

    if (animate && document.body) {
      document.body.classList.add('lang-transition');
      setTimeout(function () { doApply(lang); }, 130);
      setTimeout(function () { document.body.classList.remove('lang-transition'); }, 320);
    } else {
      doApply(lang);
    }
  }

  window.applyLang = applyLang;
  window.toggleLang = function () {
    applyLang(window.GDISCO_LANG === 'es' ? 'en' : 'es', true);
  };

  window.relativeTime = function (ts) {
    if (!ts) return '';
    var lang = window.GDISCO_LANG || 'es';
    var t = T[lang];
    var diff = Date.now() - ts;
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    var d = Math.floor(h / 24);
    var w = Math.floor(d / 7);
    function fmt(key, n) { return t[key].replace('{n}', n); }
    if (s < 60)  return t.time_now;
    if (m < 60)  return fmt('time_min', m);
    if (h < 24)  return fmt('time_hour', h);
    if (d < 7)   return fmt('time_day', d);
    if (w < 5)   return fmt('time_week', w);
    return new Date(ts).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { month: 'short', day: 'numeric' });
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(window.GDISCO_LANG, false);
  });
})();
