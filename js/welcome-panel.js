/*!
 * js/welcome-panel.js — Pantalla de Bienvenida: la puerta de entrada a La Bóveda
 * Versión: 2.0.0 (2026-10-23) · BL-058, propuesta WEL-0b aprobada por Pablo
 *
 * Contesta: qué puedo hacer en la Bóveda, qué módulos tengo, qué configuré, qué me falta
 * y dónde me conviene seguir. Dos estados: sin API Key (tres pasos) y con API Key.
 *
 * Frontera (DEC-032): la Bienvenida no asume funciones de ningún módulo. Nada de horarios,
 * metas, agendas, saldos ni logros: cada módulo aparece como una tarjeta que lleva a él.
 * Un test lo vigila (tests/welcome-view.test.cjs).
 *
 * Datos: solo lo que ya está en este navegador (Keys guardadas y cuenta activa por Storage)
 * y assets/welcome-news.json. No hace pedidos a la API.
 * Mi voz la pone js/shiruvana-places.js al principio de .panel__body (DEC-024, DEC-025).
 *
 * 2.0.0 (WEL-1): estructura nueva sin estilos ni efectos en línea; cabecera con el gato;
 *   los 9 módulos de la barra lateral; Novedades; Guías y ayuda; pie compacto con los colores
 *   oficiales de la bio. Mismos ids de botones que 1.4.0. Siguen WEL-2 (Tu Bóveda) y WEL-3
 *   (Seguí donde quedaste).
 */
(function (root) {
  'use strict';
  var VERSION = '2.0.0';
  var LOG = '[Welcome]';

  var LINKS = {
    discord: 'https://discord.gg/ZGNsfsqyKe',
    instagram: 'https://www.instagram.com/pablin.schez/',
    youtube: 'https://www.youtube.com/@pablinschez',
    twitch: 'https://www.twitch.tv/pblsnchz',
    github: 'https://github.com/PabloSnchz',
    paypal: 'https://www.paypal.com/paypalme/pblsnchz',
    kofi: 'https://ko-fi.com/pablinschez',
    metrics: 'https://pablosnchz.github.io/github-repo-traffic-stats/',
    bio: 'https://pablosnchz.github.io/bio/',
    email: 'pablinnn@gmail.com',
    anet: 'https://account.arena.net/applications',
    guide: 'docs/user-guide.html',
    guideAdv: 'docs/user-guide-avanzado.html',
    privacy: 'privacy.html'
  };

  // Los 9 módulos, en el orden de la barra lateral. «free»: anda sin API Key.
  var MODULES = [
    { id: 'cards', name: 'Cartera', desc: 'Divisas, conversor y todas tus cuentas', href: '#/cards', icon: 'assets/icons/733322.png', color: '#F2B94B', tag: 'Renovada' },
    { id: 'meta', name: 'Metas y Eventos', desc: 'Horarios de metas y world bosses', href: '#/meta', icon: 'assets/icons/102420.png', color: '#A896FF', tag: 'Renovada', free: true },
    { id: 'armory', name: 'Armería Legendaria', desc: 'Las 206 legendarias, recetas y lo que te falta', href: '#/account/legendary-armory', icon: 'assets/icons/Cuentas/157085.png', color: '#E545CA' },
    { id: 'achievements', name: 'Logros', desc: 'Los que tenés cerca de completar', href: '#/account/achievements', icon: 'assets/icons/155059.png', color: '#6EA3FF' },
    { id: 'wv', name: 'Cámara del Brujo', desc: 'Objetivos diarios, semanales y tienda', href: '#/account/wizards-vault', icon: 'assets/icons/3172791.png', color: '#15C3B7' },
    { id: 'activities', name: 'Actividades', desc: 'PSNA del día, Home Nodes y semanales', href: '#/activities', icon: 'assets/icons/1302773.png', color: '#3CC48A' },
    { id: 'raids', name: 'Raids y Strikes', desc: 'Alas y encuentros de la semana', href: '#/account/raids', icon: 'assets/icons/raids/raid-icon.png', color: '#F47C7C' },
    { id: 'characters', name: 'Inventario y Personajes', desc: 'Buscá un objeto en toda la cuenta', href: '#/account/characters', icon: 'assets/icons/Welcome/358409.png', color: '#7EC3FF' },
    { id: 'accounts', name: 'Cuentas', desc: 'Tus cuentas y Keys, cifradas en tu PC', href: '#/account/accounts', icon: 'assets/icons/3601748.png', color: '#8E96A3', local: true }
  ];
  var NEWS_URL = 'assets/welcome-news.json';
  var NEWS_DAYS = 14;  // una novedad lleva «NUEVO» durante 14 días
  var NEWS_MAX = 3;

  var CSS = [
    '#welcomePanel .wl-head{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;padding:20px 22px;margin:-1px -1px 0;border-bottom:1px solid var(--bd-1);background:linear-gradient(180deg,var(--glow-base,rgba(123,92,255,.12)),transparent);border-radius:inherit}',
    '#welcomePanel .wl-cat{width:64px;height:64px;border-radius:16px;background:var(--bg-0);display:grid;place-items:center;box-shadow:0 0 0 1px var(--bd-1),0 0 26px var(--glow-base,rgba(123,92,255,.22));flex-shrink:0}',
    '#welcomePanel .wl-cat img{width:44px;height:44px}',
    '#welcomePanel .wl-htx{min-width:0}',
    '#welcomePanel .wl-htx .panel__title{margin:0;padding:0;border:0;font-size:1.55rem;font-weight:800;line-height:1.15;color:var(--tx-1)}',
    '#welcomePanel .wl-sub{color:var(--tx-3);font-size:.92rem;margin-top:3px}',
    '#welcomePanel .wl-sub b{color:var(--tx-2);font-weight:600}',
    '#welcomePanel .wl-pills{margin-left:auto;display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}',
    '#welcomePanel .wl-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--bd-1);border-radius:10px;background:transparent;color:var(--tx-3);font:inherit;font-size:.9rem;white-space:nowrap;cursor:pointer;text-decoration:none}',
    '#welcomePanel .wl-pill img{width:22px;height:22px}',
    '#welcomePanel .wl-pill b{color:var(--tx-1);font-variant-numeric:tabular-nums}',
    '#welcomePanel .wl-pill.is-warn{border-color:var(--gn-gold,var(--color-amber))}',
    '#welcomePanel .wl-pill.is-warn b{color:var(--gn-gold,var(--color-amber))}',
    '#welcomePanel .wl-body{display:grid;gap:18px;padding-top:16px}',
    '#welcomePanel .wl-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin:0 0 10px}',
    '#welcomePanel .wl-h h3{margin:0;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx-3)}',
    '#welcomePanel .wl-h span{font-size:.8rem;color:var(--tx-3)}',
    '#welcomePanel .wl-btn{display:inline-flex;align-items:center;gap:8px;background:var(--bg-0);border:1px solid var(--bd-1);color:var(--tx-1);border-radius:10px;padding:8px 14px;font:inherit;font-size:.88rem;cursor:pointer;text-decoration:none}',
    '#welcomePanel .wl-btn--pri{background:var(--acc-1);border-color:var(--acc-1);color:var(--bg-0);font-weight:700}',
    '#welcomePanel .wl-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;counter-reset:wls;list-style:none;margin:0;padding:0}',
    '#welcomePanel .wl-step{background:var(--bg-0);border:1px solid var(--bd-1);border-radius:14px;padding:14px 16px;display:grid;gap:8px;align-content:start;justify-items:start}',
    '#welcomePanel .wl-step.is-on{border-color:var(--acc-1);box-shadow:0 0 0 1px var(--acc-1) inset}',
    '#welcomePanel .wl-step b::before{counter-increment:wls;content:counter(wls);display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--bg-2);border:1px solid var(--bd-2,var(--bd-1));margin-right:8px;font-size:.8rem}',
    '#welcomePanel .wl-step.is-on b::before{background:var(--acc-1);color:var(--bg-0);border-color:var(--acc-1)}',
    '#welcomePanel .wl-step span{font-size:.85rem;color:var(--tx-3)}',
    '#welcomePanel .wl-mods{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;list-style:none;margin:0;padding:0}',
    '#welcomePanel .wl-mod{position:relative;display:flex;gap:12px;align-items:center;height:100%;background:var(--bg-0);border:1px solid var(--bd-1);border-radius:14px;padding:12px 14px 12px 17px;text-decoration:none;color:inherit;transition:border-color .15s,transform .15s}',
    '#welcomePanel .wl-mod::before,#welcomePanel .wl-news li::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:3px;background:var(--x)}',
    '#welcomePanel .wl-mod img{width:40px;height:40px;border-radius:10px;flex-shrink:0}',
    '#welcomePanel .wl-mod b{display:block;font-size:.95rem;color:var(--tx-1)}',
    '#welcomePanel .wl-mod span{display:block;font-size:.8rem;color:var(--tx-3)}',
    '#welcomePanel .wl-tag{position:absolute;top:8px;right:10px;font-style:normal;font-size:.66rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-radius:999px;padding:1px 7px;border:1px solid var(--gn-gold,var(--color-amber));color:var(--gn-gold,var(--color-amber))}',
    '#welcomePanel .wl-tag--key{border-color:var(--bd-2,var(--bd-1));color:var(--tx-3)}',
    '#welcomePanel .wl-tag--free{border-color:var(--color-green);color:var(--color-green)}',
    '#welcomePanel .wl-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}',
    '#welcomePanel .wl-card{background:var(--bg-0);border:1px solid var(--bd-1);border-radius:14px;padding:14px 16px;min-width:0}',
    '#welcomePanel .wl-news{list-style:none;margin:0;padding:0;display:grid;gap:10px}',
    '#welcomePanel .wl-news li{position:relative;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:start;font-size:.86rem;padding-left:12px}',
    '#welcomePanel .wl-news li::before{top:2px;bottom:2px}',
    '#welcomePanel .wl-news img{width:28px;height:28px;border-radius:7px;grid-row:span 2}',
    '#welcomePanel .wl-news b{color:var(--tx-1)}',
    '#welcomePanel .wl-news small,#welcomePanel .wl-empty{color:var(--tx-3);font-size:.8rem}',
    '#welcomePanel .wl-new{font-size:.62rem;font-weight:800;letter-spacing:.05em;color:var(--bg-0);background:var(--acc-1);border-radius:999px;padding:0 6px;margin-left:6px;vertical-align:2px}',
    '#welcomePanel .wl-guides{display:grid;gap:8px}',
    '#welcomePanel .wl-guide{display:flex;gap:12px;align-items:center;border:1px solid var(--bd-1);border-radius:12px;padding:10px 12px;text-decoration:none;color:inherit;background:var(--bg-1)}',
    '#welcomePanel .wl-guide img{width:30px;height:30px}',
    '#welcomePanel .wl-guide b{display:block;font-size:.9rem;color:var(--tx-1)}',
    '#welcomePanel .wl-guide small{color:var(--tx-3);font-size:.78rem}',
    '#welcomePanel .wl-guide em{margin-left:auto;font-style:normal;color:var(--tx-3)}',
    '#welcomePanel .wl-foot{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding-top:14px;border-top:1px solid var(--bd-1);font-size:.82rem;color:var(--tx-3)}',
    '#welcomePanel .wl-bio{display:inline-flex;height:26px;border-radius:4px;overflow:hidden;text-decoration:none;font-size:10px;font-weight:700}',
    // Insignia de la bio: colores oficiales de Gato Negro, fijos a propósito (DEC-025).
    '#welcomePanel .wl-bio span:first-child{background:#232A3A;color:#F4F6FA;padding:0 10px;display:flex;align-items:center}',
    '#welcomePanel .wl-bio span:last-child{background:#5A3DDB;color:#FFFFFF;padding:0 12px;display:flex;align-items:center}',
    '#welcomePanel .wl-soc,#welcomePanel .wl-sup{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '#welcomePanel .wl-soc a{width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--bd-1);border-radius:8px;background:var(--bg-0)}',
    '#welcomePanel .wl-soc img{width:18px;height:18px}',
    '#welcomePanel .wl-sup a{display:inline-flex;gap:6px;align-items:center;font-size:.8rem;color:var(--tx-2);text-decoration:none;border:1px solid var(--bd-1);border-radius:999px;padding:3px 10px}',
    '#welcomePanel .wl-sup img{width:16px;height:16px}',
    '#welcomePanel .wl-priv{margin-left:auto;color:var(--tx-3)}',
    '#welcomePanel .wl-mod:hover,#welcomePanel .wl-guide:hover,#welcomePanel .wl-btn:hover,#welcomePanel .wl-pill:hover,#welcomePanel .wl-sup a:hover,#welcomePanel .wl-soc a:hover{border-color:var(--acc-1)}',
    '#welcomePanel .wl-mod:hover{transform:translateY(-1px)}',
    '#welcomePanel a:focus-visible,#welcomePanel button:focus-visible{outline:2px solid var(--acc-1);outline-offset:2px}',
    '@media (max-width:980px){#welcomePanel .wl-pills{margin-left:0;justify-content:flex-start;width:100%}}',
    '@media (max-width:720px){#welcomePanel .wl-head{padding:16px 14px}' +
      '#welcomePanel .wl-pills{flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px}' +
      '#welcomePanel .wl-mods{grid-template-columns:repeat(2,minmax(0,1fr))}' +
      '#welcomePanel .wl-mod{flex-direction:column;align-items:flex-start;padding:12px}' +
      '#welcomePanel .wl-mod span{display:none}' +
      '#welcomePanel .wl-tag{position:static}' +
      '#welcomePanel .wl-btn,#welcomePanel .wl-pill{min-height:44px}' +
      '#welcomePanel .wl-priv{margin-left:0}}',
    '@media (prefers-reduced-motion:reduce){#welcomePanel .wl-mod{transition:none}#welcomePanel .wl-mod:hover{transform:none}}'
  ].join('\n');

  var state = { inited: false, active: false, news: null, newsLoading: false, wired: false };

  // ---------------------------------------------------------------- utilidades
  function doc() { return root.document; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function storageGet(name, fallback) {
    try {
      var S = root.Storage;
      if (!S || typeof S.get !== 'function') return null;
      var key = (S.STORAGE_KEYS && S.STORAGE_KEYS[name]) || fallback;
      return S.get(key);
    } catch (_) { return null; }
  }

  // ---------------------------------------------------------------- modelo (puro)
  // Lo que la Bienvenida sabe de vos, tomado solo de este navegador.
  function readEnv() {
    return {
      keys: storageGet('ACCOUNT_KEYS', 'gn:account:keys'),
      selected: storageGet('ACCOUNT_SELECTED', 'gn:account:selected')
    };
  }

  function buildModel(env) {
    var keys = Array.isArray(env && env.keys) ? env.keys.filter(function (k) { return k && k.value; }) : [];
    var active = null;
    for (var i = 0; i < keys.length; i++) if (keys[i].value === (env && env.selected)) active = keys[i];
    if (!active && keys.length) active = keys[0];
    return {
      state: keys.length ? 'back' : 'new',
      keyCount: keys.length,
      activeLabel: active ? (String(active.label || '').trim() || 'sin nombre') : ''
    };
  }

  // Novedades: más nuevas primero, como mucho 3; «NUEVO» si tienen 14 días o menos.
  function pickNews(items, now) {
    var t = typeof now === 'number' ? now : Date.now();
    var list = (Array.isArray(items) ? items : []).filter(function (n) {
      return n && n.title && /^\d{4}-\d{2}-\d{2}$/.test(String(n.date || ''));
    });
    list.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return list.slice(0, NEWS_MAX).map(function (n) {
      var d = Date.parse(n.date + 'T00:00:00Z');
      var p = n.date.split('-');
      return {
        title: n.title, text: n.text || '', module: n.module || '',
        when: p[2] + '/' + p[1],
        isNew: t - d >= 0 && t - d <= NEWS_DAYS * 864e5
      };
    });
  }

  function moduleById(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
    return null;
  }

  // ---------------------------------------------------------------- vista (pura)
  function headHTML(m) {
    var sub = m.state === 'back'
      ? 'Hola de nuevo · cuenta activa <b>' + esc(m.activeLabel) + '</b>'
      : 'Tu cuenta de Guild Wars 2 en un solo lugar · todo queda en este navegador';
    var pills = m.state === 'back'
      ? '<button type="button" class="wl-pill" id="welcomeManageKeysBtn" data-act="manage-keys">' +
          '<img src="assets/icons/Welcome/2604909.png" alt="">API Key <b>Activa</b></button>' +
        '<a class="wl-pill" id="welcomeAccountsBtn" href="#/account/accounts" data-act="accounts">' +
          '<img src="assets/icons/3601748.png" alt="">Cuentas <b>' + m.keyCount + '</b></a>'
      : '<button type="button" class="wl-pill is-warn" data-act="add-key">' +
          '<img src="assets/icons/Welcome/2604909.png" alt="">API Key <b>sin cargar</b></button>';
    return '<div class="wl-cat"><img src="assets/brand/gato-negro.svg" alt="" width="44" height="44"></div>' +
      '<div class="wl-htx" data-wl-slot="title"></div>' +
      '<div class="wl-pills" aria-label="Estado de tu Bóveda">' + pills + '</div>' +
      '<div class="wl-sub" data-wl-sub>' + sub + '</div>';
  }

  function stepsHTML() {
    return '<section aria-label="Empezá en tres pasos">' +
      '<div class="wl-h"><h3>Empezá en tres pasos</h3><span>Tus datos se quedan en este navegador</span></div>' +
      '<ol class="wl-steps">' +
        '<li class="wl-step is-on"><b>Creá tu API Key</b><span>En account.arena.net, con los permisos que te detallo al agregarla.</span>' +
          '<a class="wl-btn" href="' + LINKS.anet + '" target="_blank" rel="noopener">Abrir account.arena.net ↗</a></li>' +
        '<li class="wl-step"><b>Pegala en La Bóveda</b><span>La reviso y te digo si le falta algún permiso.</span>' +
          '<button type="button" class="wl-btn wl-btn--pri" id="welcomeAddKeyBtn" data-act="add-key">＋ Agregar API Key</button></li>' +
        '<li class="wl-step"><b>Elegí por dónde empezar</b><span>La Cartera es lo más rápido para ver que todo anda.</span>' +
          '<a class="wl-btn" href="#/cards">Ir a la Cartera</a></li>' +
      '</ol></section>';
  }

  function modulesHTML(m) {
    var items = MODULES.map(function (mod) {
      var tag = '';
      if (m.state === 'back') { if (mod.tag) tag = '<i class="wl-tag">' + esc(mod.tag) + '</i>'; }
      else if (mod.free) tag = '<i class="wl-tag wl-tag--free">Sin Key</i>';
      else if (!mod.local) tag = '<i class="wl-tag wl-tag--key">Con Key</i>';
      return '<li><a class="wl-mod" href="' + mod.href + '" data-mod="' + mod.id + '" style="--x:' + mod.color + '">' +
        '<img src="' + mod.icon + '" alt="" width="40" height="40" loading="lazy">' +
        '<div><b>' + esc(mod.name) + '</b><span>' + esc(mod.desc) + '</span></div>' + tag + '</a></li>';
    }).join('');
    return '<section aria-label="¿Qué puedo hacer aquí?">' +
      '<div class="wl-h"><h3>¿Qué puedo hacer aquí?</h3><span>' +
        (m.state === 'back' ? 'Tus 9 módulos, a un clic' : 'Los 9 módulos de la Bóveda') + '</span></div>' +
      '<ul class="wl-mods">' + items + '</ul></section>';
  }

  function newsHTML(news) {
    var body;
    if (news === null) body = '<p class="wl-empty">Cargando novedades…</p>';
    else if (!news.length) body = '<p class="wl-empty">Por ahora no hay novedades.</p>';
    else body = '<ul class="wl-news">' + news.map(function (n) {
      var mod = moduleById(n.module);
      return '<li style="--x:' + (mod ? mod.color : 'var(--acc-1)') + '">' +
        (mod ? '<img src="' + mod.icon + '" alt="" width="28" height="28" loading="lazy">' : '<span></span>') +
        '<b>' + esc(n.title) + (n.isNew ? '<span class="wl-new">NUEVO</span>' : '') + '</b>' +
        '<small>' + esc(n.when) + (n.text ? ' · ' + esc(n.text) : '') + '</small></li>';
    }).join('') + '</ul>';
    return '<section class="wl-card" aria-label="Novedades de la Bóveda">' +
      '<div class="wl-h"><h3>Novedades de la Bóveda</h3></div>' + body + '</section>';
  }

  function guidesHTML() {
    return '<section class="wl-card" aria-label="Guías y ayuda">' +
      '<div class="wl-h"><h3>Guías y ayuda</h3></div><div class="wl-guides">' +
        '<a class="wl-guide" href="' + LINKS.guide + '" target="_blank" rel="noopener"><img src="assets/icons/Welcome/102367.png" alt="" width="30" height="30"><div><b>Guía de usuario</b><small>Lo básico, módulo por módulo</small></div><em aria-hidden="true">↗</em></a>' +
        '<a class="wl-guide" href="' + LINKS.guideAdv + '" target="_blank" rel="noopener"><img src="assets/icons/Welcome/102361.png" alt="" width="30" height="30"><div><b>Guía avanzada</b><small>Cada módulo en detalle, varias cuentas y copias</small></div><em aria-hidden="true">↗</em></a>' +
        '<a class="wl-guide" href="' + LINKS.discord + '" target="_blank" rel="noopener"><img src="assets/icons/Welcome/discord.png" alt="" width="30" height="30"><div><b>¿Algo no anda?</b><small>Contalo en el Discord de la comunidad</small></div><em aria-hidden="true">↗</em></a>' +
      '</div></section>';
  }

  function footHTML() {
    function soc(name, label) {
      return '<a href="' + LINKS[name] + '" target="_blank" rel="noopener" title="' + label + '"><img src="assets/icons/Welcome/' +
        (name === 'twitch' ? 'twitchlogo' : name) + '.png" alt="' + label + '" width="18" height="18"></a>';
    }
    return '<footer class="wl-foot">' +
      '<a class="wl-bio" href="' + LINKS.bio + '" target="_blank" rel="noopener"><span>Link in Bio</span><span>Pablin Schez</span></a>' +
      '<span>La Bóveda la hace Pablin Schez para la comunidad.</span>' +
      '<div class="wl-soc" aria-label="Comunidad">' + soc('discord', 'Discord') + soc('youtube', 'YouTube') + soc('twitch', 'Twitch') + soc('instagram', 'Instagram') + soc('github', 'GitHub') + '</div>' +
      '<div class="wl-sup"><span>Apoyar:</span>' +
        '<a href="' + LINKS.paypal + '" target="_blank" rel="noopener"><img src="assets/icons/Welcome/payp.png" alt="" width="16" height="16">PayPal</a>' +
        '<a href="' + LINKS.kofi + '" target="_blank" rel="noopener"><img src="assets/icons/Welcome/kofi.png" alt="" width="16" height="16">Ko-fi</a>' +
        '<a href="' + LINKS.metrics + '" target="_blank" rel="noopener">Métricas</a>' +
        '<a href="mailto:' + LINKS.email + '">Contacto</a></div>' +
      '<a class="wl-priv" href="' + LINKS.privacy + '" target="_blank" rel="noopener">Privacidad</a>' +
      '</footer>';
  }

  function bodyHTML(m, news) {
    return '<div class="wl-body">' +
      (m.state === 'new' ? stepsHTML() : '') +
      modulesHTML(m) +
      '<div class="wl-row">' + newsHTML(news) + guidesHTML() + '</div>' +
      footHTML() +
      '</div>';
  }

  // ---------------------------------------------------------------- DOM
  function ensureCSS() {
    var d = doc();
    if (!d || d.getElementById('wl-css')) return;
    var st = d.createElement('style');
    st.id = 'wl-css';
    st.textContent = CSS;
    (d.head || d.documentElement).appendChild(st);
  }

  function ensurePanel() {
    var d = doc();
    var host = d.getElementById('welcomePanel');
    if (host) return host;
    host = d.createElement('section');
    host.id = 'welcomePanel';
    host.className = 'panel col-main';
    host.setAttribute('hidden', '');
    host.setAttribute('aria-labelledby', 'welcomeTitle');
    host.innerHTML = '<h2 class="panel__title" id="welcomeTitle">La Bóveda del Gato Negro</h2><div class="panel__body"></div>';
    var anchor = d.getElementById('walletPanel');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(host, anchor);
    else d.body.appendChild(host);
    return host;
  }

  // La cabecera vive fuera de .panel__body: así mi voz (shiruvana-places) queda debajo de ella.
  function renderHead(host, m) {
    var d = doc();
    var head = host.querySelector('.wl-head');
    var title = host.querySelector('#welcomeTitle') || host.querySelector('.panel__title');
    if (!head) {
      head = d.createElement('div');
      head.className = 'wl-head';
      host.insertBefore(head, host.firstChild);
    }
    head.innerHTML = headHTML(m);
    if (title) {
      title.textContent = 'La Bóveda del Gato Negro';
      var slot = head.querySelector('[data-wl-slot="title"]');
      if (slot) {
        slot.appendChild(title);
        var sub = head.querySelector('[data-wl-sub]');
        if (sub) slot.appendChild(sub);
      }
    }
  }

  function openKeysModal() {
    var modal = doc().getElementById('keysModal');
    if (!modal) return;
    modal.hidden = false;
    if (modal.__wlClose) return;
    modal.__wlClose = true;
    var close = function () { modal.hidden = true; };
    var b = modal.querySelector('.modal__backdrop'); if (b) b.addEventListener('click', close);
    var x = modal.querySelector('.modal__close'); if (x) x.addEventListener('click', close);
    doc().addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  function onClick(e) {
    var t = e && e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'add-key' || act === 'manage-keys') { if (e.preventDefault) e.preventDefault(); openKeysModal(); }
  }

  function render() {
    var host = ensurePanel();
    var body = host.querySelector('.panel__body');
    if (!body) return;
    ensureCSS();
    var m = buildModel(readEnv());
    renderHead(host, m);
    body.innerHTML = bodyHTML(m, state.news);
    if (!state.wired) {
      state.wired = true;
      host.addEventListener('click', onClick);
    }
    loadNews();
  }

  function loadNews() {
    if (state.news !== null || state.newsLoading || typeof root.fetch !== 'function') {
      if (typeof root.fetch !== 'function' && state.news === null) state.news = [];
      return;
    }
    state.newsLoading = true;
    root.fetch(NEWS_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (data) {
        state.newsLoading = false;
        state.news = pickNews(data && data.items ? data.items : data);
        if (state.active) render();
      });
  }

  function activate() {
    state.active = true;
    ensurePanel().removeAttribute('hidden');
    render();
  }

  function deactivate() {
    state.active = false;
    var panel = doc().getElementById('welcomePanel');
    if (panel) panel.setAttribute('hidden', '');
  }

  function onAccountChange() { if (state.active) render(); }

  var Welcome = {
    version: VERSION,
    initOnce: function () {
      if (state.inited) return;
      state.inited = true;
      ensurePanel();
      doc().addEventListener('gn:tokenchange', onAccountChange);
      if (typeof root.addEventListener === 'function') root.addEventListener('storage', onAccountChange);
      if (root.console && root.console.info) root.console.info(LOG, 'ready v' + VERSION);
    },
    activate: activate,
    deactivate: deactivate,
    refresh: function () { if (state.active) render(); },
    Route: { path: 'welcome', mount: activate, unmount: deactivate },
    _debug: function () { return { version: VERSION, active: state.active, news: state.news ? state.news.length : null }; },
    _pure: { buildModel: buildModel, pickNews: pickNews, headHTML: headHTML, bodyHTML: bodyHTML, MODULES: MODULES, CSS: CSS, LINKS: LINKS }
  };

  root.Welcome = Welcome;

  if (doc().readyState === 'loading') doc().addEventListener('DOMContentLoaded', Welcome.initOnce);
  else Welcome.initOnce();

})(typeof window !== 'undefined' ? window : this);
