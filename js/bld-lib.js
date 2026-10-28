/*!
 * js/bld-lib.js — Builds: pestaña Biblioteca (BL-082 BLD-7, BLD-8, BLD-10 y BLD-15: A1–A6, C2, D4)
 * Versión: 1.0.0 (2026-10-28)
 *
 * Builds curadas por mí (assets/data/builds/catalog.json): solo datos factuales (élite, modo, rol, armas, código,
 * fecha) con crédito y enlace a la fuente; ni textos ni imágenes de terceros (D1).
 * Filtros: profesión, élite, modo, rol, arma, tipo de daño y vigencia, más búsqueda por nombre. Profesión, modo y rol
 * en 3 toques o menos. Vigencia (D4): cada build dice para qué parche la revisé; si la vigía semanal
 * (assets/data/builds/watch.json) detecta un parche de balance más nuevo, pasa a «revisar».
 * Cada build: copiar código, ver la ficha (con validación contra la API), guardar en Mis builds, abrir la fuente y
 * «avisar que está vieja» (un issue de GitHub ya escrito, A6 sin servidor).
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var CATALOG = 'assets/data/builds/catalog.json';
  var WATCH = 'assets/data/builds/watch.json';
  var ISSUES = 'https://github.com/PabloSnchz/gw2-factory-dev/issues/new';
  var MODES = { pve: 'PvE', wvw: 'WvW', pvp: 'PvP' };
  var SUB = { raids: 'raids y strikes', fractals: 'fractales', 'open-world': 'mundo abierto', accessibuilds: 'accesible', roaming: 'roaming', zerg: 'zerg', conquest: 'conquista' };
  var ROLES = { dps: 'DPS', quickness: 'Celeridad', alacrity: 'Alacridad', heal: 'Curación', support: 'Apoyo', boon: 'Bendiciones', cc: 'Control' };
  var DAMAGE = { power: 'Poder', condition: 'Condición', hybrid: 'Híbrido' };
  var st = { cat: null, watch: null, error: '', loading: false, f: { prof: 0, elite: 0, mode: '', role: '', weapon: '', damage: '', state: '', q: '' }, open: '', views: {}, checks: {} };

  function esc(s) { return root.GNBldShow ? root.GNBldShow.esc(s) : String(s == null ? '' : s); }
  function C() { return root.GNBldCode; }

  // ---------------------------------------------------------------- modelo (puro)
  function latestPatch(cat, watch) {
    var a = (cat && cat.patch && cat.patch.latest) || '', b = (watch && watch.latestPatch) || '';
    return b > a ? b : a;
  }
  function stateOf(b, latest) { return b.patch && latest && b.patch < latest ? 'revisar' : 'vigente'; }
  function filter(builds, f, latest) {
    var q = String(f.q || '').trim().toLowerCase();
    return builds.filter(function (b) {
      if (f.prof && b.prof !== f.prof) return false;
      if (f.elite && b.elite !== f.elite) return false;
      if (f.mode && b.mode !== f.mode) return false;
      if (f.role && (b.roles || []).indexOf(f.role) < 0) return false;
      if (f.weapon && (b.weapons || []).indexOf(f.weapon) < 0) return false;
      if (f.damage && b.damage !== f.damage) return false;
      if (f.state && stateOf(b, latest) !== f.state) return false;
      if (q && (b.name + ' ' + (b.eliteName || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  // Cobertura (criterio 1): élites con al menos una build vigente por modo.
  // any = true cuenta también las que están «para revisar».
  function coverage(builds, latest, any) {
    var out = {};
    builds.forEach(function (b) { if (any || stateOf(b, latest) === 'vigente') { out[b.mode] = out[b.mode] || {}; out[b.mode][b.elite] = true; } });
    var n = {}; Object.keys(out).forEach(function (m) { n[m] = Object.keys(out[m]).length; });
    return n;
  }
  function issueUrl(b, latest) {
    var title = 'Build vieja: ' + b.name + ' (' + (MODES[b.mode] || b.mode) + ')';
    var body = 'Build de la Biblioteca: ' + b.id + '\nRevisada para el parche: ' + (b.patch || '?') + '\nÚltimo parche conocido: ' + (latest || '?') +
      '\nFuente: ' + (b.source && b.source.url || '') + '\n\n¿Qué cambió? (opcional)\n';
    return ISSUES + '?labels=' + encodeURIComponent('build-vieja') + '&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
  }
  function fmtDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || '—'); }

  // ---------------------------------------------------------------- vista
  function select(id, label, key, opts, cur) {
    return '<label class="bld-f" for="' + id + '"><small>' + label + '</small><select id="' + id + '" data-lib-f="' + key + '"><option value="">Todas</option>' +
      opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
  }
  function pills(label, key, map, cur) {
    return '<div class="bld-pills" role="group" aria-label="' + esc(label) + '"><small>' + esc(label) + '</small>' +
      ['<button type="button" class="bld-btn" data-lib-p="' + key + '" data-v="" aria-pressed="' + (!cur) + '">Todos</button>'].concat(Object.keys(map).map(function (k) {
        return '<button type="button" class="bld-btn" data-lib-p="' + key + '" data-v="' + k + '" aria-pressed="' + (cur === k) + '">' + esc(map[k]) + '</button>';
      })).join('') + '</div>';
  }
  function filtersHTML(cat, f) {
    var Cc = C(), builds = cat.builds;
    var elites = {}, weapons = {};
    builds.forEach(function (b) {
      if (!f.prof || b.prof === f.prof) elites[b.elite] = b.eliteName;
      (b.weapons || []).forEach(function (w) { weapons[w] = (Cc.WEAPONS_ES[w] || w); });
    });
    return '<div class="bld-card bld-filters">' +
      select('bldLibProf', 'Profesión', 'prof', [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (p) { return [p, Cc.PROF_ES[p]]; }), f.prof || '') +
      select('bldLibElite', 'Élite', 'elite', Object.keys(elites).map(function (e) { return [e, elites[e]]; }).sort(function (a, b) { return a[1].localeCompare(b[1], 'es'); }), f.elite || '') +
      select('bldLibWeapon', 'Arma', 'weapon', Object.keys(weapons).map(function (w) { return [w, weapons[w]]; }).sort(function (a, b) { return a[1].localeCompare(b[1], 'es'); }), f.weapon) +
      '<label class="bld-f" for="bldLibQ"><small>Buscar</small><input id="bldLibQ" type="search" data-lib-f="q" value="' + esc(f.q) + '" placeholder="nombre o élite"></label>' +
      pills('Modo', 'mode', MODES, f.mode) + pills('Rol', 'role', ROLES, f.role) + pills('Daño', 'damage', DAMAGE, f.damage) +
      pills('Vigencia', 'state', { vigente: 'Vigentes', revisar: 'Para revisar' }, f.state) +
      '</div>';
  }
  function cardHTML(b, latest) {
    var Cc = C(), s = stateOf(b, latest), on = st.open === b.id;
    var tags = ['<span class="bld-tag ' + (s === 'vigente' ? 'is-ok' : 'is-old') + '">' + (s === 'vigente' ? 'vigente · parche ' + fmtDate(b.patch) : 'revisar · era del parche ' + fmtDate(b.patch)) + '</span>'];
    if (b.damage) tags.push('<span class="bld-tag">' + esc(DAMAGE[b.damage]) + '</span>');
    (b.roles || []).forEach(function (r) { if (r !== 'dps' || (b.roles || []).length === 1) tags.push('<span class="bld-tag">' + esc(ROLES[r] || r) + '</span>'); });
    (b.weapons || []).forEach(function (w) { tags.push('<span class="bld-tag">' + esc(Cc.WEAPONS_ES[w] || w) + '</span>'); });
    var h = '<li class="bld-card bld-lib-card" data-id="' + esc(b.id) + '">' +
      '<b>' + esc(b.name) + '</b>' +
      '<p class="bld-muted">' + esc(Cc.PROF_ES[b.prof]) + ' · ' + esc(MODES[b.mode] || b.mode) + (b.sub ? ' (' + esc(SUB[b.sub] || b.sub) + ')' : '') +
      ' · dificultad ' + (b.difficulty || '?') + '/5 · fuente actualizada ' + fmtDate(b.sourceUpdated) + '</p>' +
      '<div class="bld-tags">' + tags.join(' ') + '</div>' +
      '<div class="bld-acts"><button type="button" class="bld-btn" data-bld-act="copy">Copiar código</button>' +
      '<button type="button" class="bld-btn" data-lib="toggle" aria-expanded="' + on + '">' + (on ? 'Cerrar' : 'Ver') + '</button>' +
      '<button type="button" class="bld-btn" data-bld-act="save">Guardar</button>' +
      '<a class="bld-btn" href="' + esc(b.source.url) + '" target="_blank" rel="noopener">' + esc(b.source.name) + ' ↗</a>' +
      '<a class="bld-btn" href="' + esc(issueUrl(b, latest)) + '" target="_blank" rel="noopener" title="Abre un aviso en GitHub ya escrito">Avisar que está vieja</a></div>';
    if (on) {
      h += st.views[b.id] ? root.GNBldShow.detailHTML(st.views[b.id], { code: b.code, checks: st.checks[b.id], title: b.name,
        meta: esc(MODES[b.mode]) + ' · <a href="' + esc(b.source.url) + '" target="_blank" rel="noopener">' + esc(b.source.name) + ' ↗</a>', actions: ['share', 'gw2skills', 'edit'] })
        : (st.viewErr[b.id] ? '<p class="bld-err" role="alert">' + esc(st.viewErr[b.id]) + '</p>' : '<p class="bld-muted" role="status">Buscando los nombres en la API del juego…</p>');
    }
    return h + '</li>';
  }
  function viewHTML() {
    if (st.loading) return '<div class="bld-card" role="status">Cargando la biblioteca…</div>';
    if (st.error) return '<div class="bld-card bld-err" role="alert">' + esc(st.error) + ' <button type="button" class="bld-btn" data-lib="retry">Reintentar</button></div>';
    if (!st.cat) return '';
    var latest = latestPatch(st.cat, st.watch), list = filter(st.cat.builds, st.f, latest);
    var old = st.cat.builds.filter(function (b) { return stateOf(b, latest) === 'revisar'; }).length;
    var cov = coverage(st.cat.builds, latest, true), ok = coverage(st.cat.builds, latest);
    var fresh = st.watch && st.watch.latestPatch && st.cat.patch && st.watch.latestPatch > st.cat.patch.latest;
    var line = old ? (fresh ? '<p class="bld-shv" role="status"><b>Ojo:</b> salió un parche de balance (' + fmtDate(latest) + ') y ' + old + (old === 1 ? ' build quedó' : ' builds quedaron') +
      ' para revisar. Las marco hasta que las revise. <small class="bld-muted">Lo sé por: la vigía semanal · en este navegador</small></p>'
      : '<p class="bld-shv" role="status">' + old + (old === 1 ? ' build dice' : ' builds dicen') + ' en su fuente que son de un parche anterior al último de balance (' + fmtDate(latest) +
      '). Las marco «para revisar»: sirven, pero conviene mirar la fuente. <small class="bld-muted">Lo sé por: la fecha que declara cada fuente</small></p>')
      : '<p class="bld-shv">Todas las builds están revisadas para el último parche de balance (' + fmtDate(latest) + '). <small class="bld-muted">Lo sé por: la biblioteca y la vigía semanal</small></p>';
    return line + filtersHTML(st.cat, st.f) +
      '<p class="bld-muted" aria-live="polite">' + list.length + ' de ' + st.cat.builds.length + ' builds · élites cubiertas: ' + ['pve', 'wvw', 'pvp'].filter(function (m) { return cov[m]; }).map(function (m) { return MODES[m] + ' ' + cov[m] + '/36' + (ok[m] !== cov[m] ? ' (' + (ok[m] || 0) + ' vigentes)' : ''); }).join(', ') + '</p>' +
      (list.length ? '<ul class="bld-lib">' + list.map(function (b) { return cardHTML(b, latest); }).join('') + '</ul>' : '<div class="bld-card bld-muted">Ninguna build con esos filtros. Probá sacando alguno.</div>') +
      '<p class="bld-muted"><small>Builds curadas por mí con datos de ' + (st.cat.sources || []).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>'; }).join(', ') +
      ': élite, modo, rol, armas, código y fecha; los textos, guías y rotaciones están en cada fuente. Si una fuente pide retirar algo, se retira.</small></p>';
  }

  var CSS = [
    '#buildsPanel .bld-filters{display:flex;flex-wrap:wrap;gap:8px 12px;margin-bottom:10px;align-items:flex-end}',
    '#buildsPanel .bld-f small,#buildsPanel .bld-pills small{display:block;color:var(--tx-2);font-size:.7rem;text-transform:uppercase}',
    '#buildsPanel .bld-f select,#buildsPanel .bld-f input{background:var(--bg-0);color:var(--tx-1);border:1px solid var(--bd-1);border-radius:8px;padding:5px 8px;font:inherit}',
    '#buildsPanel .bld-pills{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#buildsPanel .bld-pills small{width:100%}',
    '#buildsPanel [aria-pressed=true].bld-btn{border-color:var(--gn-mod);background:color-mix(in srgb,var(--gn-mod) 22%,var(--bg-2))}',
    '#buildsPanel .bld-lib{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}',
    '#buildsPanel .bld-lib-card{display:grid;gap:6px;align-content:start}#buildsPanel .bld-lib-card p{margin:0;font-size:.8rem}',
    '#buildsPanel .bld-lib-card .bld-detail{grid-column:1/-1}',
    '#buildsPanel .bld-tags{display:flex;flex-wrap:wrap;gap:4px}#buildsPanel .bld-tag.is-ok{border-color:var(--color-green,#3fb950)}#buildsPanel .bld-tag.is-old{border-color:var(--color-amber,#F2B94B)}',
    '#buildsPanel .bld-shv{border-left:3px solid var(--gn-mod);padding:6px 10px;background:var(--bg-1);border-radius:6px;color:var(--tx-1)}'
  ].join('\n');
  function ensureCss() {
    var d = root.document;
    if (!d || !d.head || d.getElementById('bld-lib-css')) return;
    var s = d.createElement('style'); s.id = 'bld-lib-css'; s.textContent = CSS; d.head.appendChild(s);
  }

  // ---------------------------------------------------------------- datos y comportamiento
  function getJSON(url) {
    var f = root.fetch;
    if (typeof f !== 'function') return Promise.reject(new Error('sin red'));
    return f(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('respondió ' + r.status); return r.json(); });
  }
  function load(ctx) {
    st.loading = true; st.error = ''; paint(ctx);
    return Promise.all([getJSON(CATALOG), getJSON(WATCH).catch(function () { return null; })]).then(function (r) {
      st.cat = r[0]; st.watch = r[1]; st.loading = false;
      var latest = latestPatch(st.cat, st.watch), old = st.cat.builds.filter(function (b) { return stateOf(b, latest) === 'revisar'; }).length;
      if (ctx.setSub) ctx.setSub(st.cat.builds.length + ' builds curadas · último parche de balance ' + fmtDate(latest) + (old ? ' · ' + old + ' para revisar' : ''));
      paint(ctx);
    }, function (e) { st.loading = false; st.error = 'No pude cargar la biblioteca (' + (e && e.message || '') + ').'; paint(ctx); });
  }
  function paint(ctx, focus) {
    if (!ctx.host) return;
    var a = root.document && root.document.activeElement, keep = focus || (a && a.id && ctx.host.contains && ctx.host.contains(a) ? '#' + a.id : '');
    if (!keep && a && a.getAttribute && a.getAttribute('data-lib-p')) keep = '[data-lib-p="' + a.getAttribute('data-lib-p') + '"][data-v="' + a.getAttribute('data-v') + '"]';
    ctx.host.innerHTML = viewHTML();
    if (keep) { var el = ctx.host.querySelector(keep); if (el && el.focus) el.focus(); }
  }
  function byId(id) { return (st.cat && st.cat.builds.filter(function (b) { return b.id === id; })[0]) || null; }
  function openView(ctx, b) {
    var r = C().parse(b.code);
    if (!r.ok) { st.viewErr[b.id] = r.error; return; }
    ctx.ref.load(r.build.profession).then(function (ref) {
      st.views[b.id] = ctx.ref.resolve(r.build, ref); st.checks[b.id] = ctx.ref.check(r.build, ref);
      if (st.open === b.id) paint(ctx);
    }, function (e) { st.viewErr[b.id] = 'No pude traer los nombres del juego (' + (e && e.message || '') + ').'; if (st.open === b.id) paint(ctx); });
  }
  st.viewErr = {};

  function render(host, ctx) {
    if (root.GNBldShow) root.GNBldShow.ensureCss();
    ensureCss();
    ctx.host = host;
    host.addEventListener('change', function (e) {
      var k = e.target && e.target.getAttribute && e.target.getAttribute('data-lib-f');
      if (!k || k === 'q') return;
      st.f[k] = k === 'prof' || k === 'elite' ? Number(e.target.value) || 0 : e.target.value;
      if (k === 'prof') st.f.elite = 0;
      paint(ctx);
    });
    host.addEventListener('input', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-lib-f') === 'q') {
        st.f.q = e.target.value; clearTimeout(st.qT);
        st.qT = setTimeout(function () { paint(ctx, '#bldLibQ'); var i = ctx.host.querySelector('#bldLibQ'); if (i && i.setSelectionRange) i.setSelectionRange(i.value.length, i.value.length); }, 200);
      }
    });
    host.addEventListener('click', function (e) {
      var p = e.target && e.target.closest ? e.target.closest('[data-lib-p]') : null;
      if (p) { st.f[p.getAttribute('data-lib-p')] = p.getAttribute('data-v'); return paint(ctx); }
      var t = e.target && e.target.closest ? e.target.closest('[data-lib]') : null;
      if (!t) return;
      if (t.getAttribute('data-lib') === 'retry') return load(ctx);
      var row = t.closest('[data-id]'), b = row && byId(row.getAttribute('data-id'));
      if (!b) return;
      st.open = st.open === b.id ? '' : b.id;
      if (st.open && !st.views[b.id]) openView(ctx, b);
      paint(ctx);
    });
    if (root.GNBldShow) root.GNBldShow.wire(host, function (btn) {
      var row = btn.closest('[data-id]'), b = row && byId(row.getAttribute('data-id'));
      return b ? { code: b.code, title: b.name, source: b.source } : null;
    }, ctx);
    if (!st.cat) return load(ctx);
    paint(ctx);
  }

  var api = { version: VERSION, render: render, _pure: { filter: filter, stateOf: stateOf, latestPatch: latestPatch, coverage: coverage, issueUrl: issueUrl, cardHTML: cardHTML, viewHTML: viewHTML, MODES: MODES, ROLES: ROLES }, _state: st };
  root.GNBldLib = api;
  if (root.GNBld && typeof root.GNBld.register === 'function') root.GNBld.register('lib', api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
