/*!
 * js/bld-editor.js — Builds: pestaña Editor (BL-082 BLD-5: B1, B2, B3, B5, B6 y C2)
 * Versión: 1.1.0 (2026-10-28) · BLD-12/13: panel «Equipo y código AE2» (js/bld-gear.js) debajo de la ficha · antes 1.0.0 BLD-5
 *
 * Elegís profesión, las 3 líneas (la élite solo en la tercera), los 3 rasgos de cada una, la barra de tierra
 * (y la de agua), mascotas o leyendas y armas; a la derecha ves la ficha y el código del juego al instante
 * (todo local: < 200 ms). Los datos salen de js/bld-ref.js (API oficial en castellano) y el código de js/bld-code.js.
 * Abre un código (#/builds/editor/<código>) o una build tuya (#/builds/editor/m:<id>) para editarla.
 * Teclado: todo son botones y listas nativas; cada rasgo dice su nombre y si está elegido (aria-pressed).
 */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var TIER = ['Adepto', 'Maestro', 'Gran maestro'];
  var SLOT = ['Curación', 'Utilidad 1', 'Utilidad 2', 'Utilidad 3', 'Élite'];
  var SLOT_TYPE = ['Heal', 'Utility', 'Utility', 'Utility', 'Elite'];
  var st = { build: null, ref: null, loading: false, error: '', title: '', mineId: '', lastArg: null, req: 0, gear: null };

  function C() { return root.GNBldCode; }
  function esc(s) { return root.GNBldShow ? root.GNBldShow.esc(s) : String(s == null ? '' : s); }
  function img(src, size) { return root.GNBldShow ? root.GNBldShow.img(src, '', size, 'bld-ic') : ''; }

  // ---------------------------------------------------------------- modelo (puro)
  function eliteId(b, ref) { var s = b.specs[2] && ref && root.GNBldRef.specById(ref, b.specs[2].id); return s && s.elite ? s.id : 0; }
  // Habilidades que puede ir en ese casillero con esa élite: [{ pid, id, name, icon }]
  function options(ref, slot, elite) {
    var type = SLOT_TYPE[slot];
    return (ref.bar[type] || []).filter(function (x) { return !x.spec || x.spec === elite; }).map(function (x) {
      var s = ref.skills[x.id] || {};
      return { pid: ref.bySkill[x.id] || 0, id: x.id, name: s.name || '#' + x.id, icon: s.icon || '' };
    }).filter(function (o) { return o.pid; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
  }
  // Al cambiar la élite, lo que ya no corresponde se vacía (habilidades y armas de la élite anterior).
  function prune(b, ref) {
    var el = eliteId(b, ref);
    ['land', 'water'].forEach(function (bar) {
      b.skills[bar] = b.skills[bar].map(function (pid, i) {
        if (!pid || b.profession === 9) return pid;
        return options(ref, i, el).some(function (o) { return o.pid === pid; }) ? pid : 0;
      });
    });
    var Cc = C();
    b.weapons = b.weapons.filter(function (w) { var k = Cc.WEAPONS[w], x = k && ref.weapons[k]; return x && (!x.spec || x.spec === el); });
    return b;
  }
  // Retornado: la barra la ponen las leyendas (curación, 3 utilidades y élite de la leyenda activa).
  function legendBar(b, ref) {
    if (b.profession !== 9 || !b.legends) return b;
    var leg = function (code) { return ref.legends.filter(function (l) { return l.code === code; })[0]; };
    var pid = function (id) { return ref.bySkill[id] || 0; };
    ['land', 'water'].forEach(function (bar) {
      var a = leg(b.legends[bar][0]), z = leg(b.legends[bar][1]);
      b.skills[bar] = a ? [pid(a.heal)].concat(a.utilities.map(pid), [pid(a.elite)]) : [0, 0, 0, 0, 0];
      b.legends[bar === 'land' ? 'inactiveLand' : 'inactiveWater'] = z ? z.utilities.map(pid) : [0, 0, 0];
    });
    return b;
  }
  function setSpec(b, ref, line, id) {
    b.specs[line] = { id: Number(id) || 0, traits: [0, 0, 0] };
    return prune(b, ref);
  }
  function setTrait(b, line, tier, choice) { b.specs[line].traits[tier] = b.specs[line].traits[tier] === choice ? 0 : choice; return b; }
  function toggleWeapon(b, id) {
    var i = b.weapons.indexOf(id);
    if (i >= 0) b.weapons.splice(i, 1); else if (b.weapons.length < 8) b.weapons.push(id);
    return b;
  }
  function fresh(prof) { var b = C().empty(prof); if (prof === 9) b.legends = { land: [0, 0], water: [0, 0], inactiveLand: [0, 0, 0], inactiveWater: [0, 0, 0] }; return b; }

  // ---------------------------------------------------------------- vista
  function profHTML(b) {
    var Cc = C();
    return '<fieldset class="bld-ed-prof"><legend>Profesión</legend>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (p) {
      return '<button type="button" class="bld-btn" data-ed="prof" data-v="' + p + '" aria-pressed="' + (b.profession === p) + '">' + esc(Cc.PROF_ES[p]) + '</button>';
    }).join('') + '</fieldset>';
  }
  function specLineHTML(b, ref, line) {
    var cur = b.specs[line], sp = cur.id ? root.GNBldRef.specById(ref, cur.id) : null;
    var used = b.specs.map(function (s) { return s.id; });
    var opts = ref.specs.filter(function (s) { return (line === 2 || !s.elite) && (s.id === cur.id || used.indexOf(s.id) < 0); })
      .sort(function (a, z) { return (a.elite - z.elite) || a.name.localeCompare(z.name, 'es'); });
    var h = '<div class="bld-ed-line"><label for="bldEdSpec' + line + '">Línea ' + (line + 1) + (line === 2 ? ' (acá va la élite)' : '') + '</label>' +
      '<select id="bldEdSpec' + line + '" data-ed="spec" data-line="' + line + '"><option value="0">— elegí —</option>' + opts.map(function (s) {
        return '<option value="' + s.id + '"' + (s.id === cur.id ? ' selected' : '') + '>' + esc(s.name) + (s.elite ? ' (élite)' : '') + '</option>';
      }).join('') + '</select>';
    if (sp) {
      h += '<div class="bld-ed-tiers">' + [0, 1, 2].map(function (tier) {
        return '<div class="bld-ed-tier" role="group" aria-label="' + esc(sp.name) + ', ' + TIER[tier] + '"><small>' + TIER[tier] + '</small>' +
          (sp.major[tier] || []).map(function (tid, k) {
            var t = ref.traits[tid] || {}, on = cur.traits[tier] === k + 1;
            return '<button type="button" class="bld-ed-tr" id="bldEdTr' + line + tier + k + '" data-ed="trait" data-line="' + line + '" data-tier="' + tier + '" data-v="' + (k + 1) +
              '" aria-pressed="' + on + '" title="' + esc(root.GNBldShow ? root.GNBldShow.plain(t.description) : '') + '">' + img(t.icon, 28) + '<span>' + esc(t.name || '#' + tid) + '</span></button>';
          }).join('') + '</div>';
      }).join('') + '</div>';
    }
    return h + '</div>';
  }
  function barHTML(b, ref, bar) {
    if (b.profession === 9) return '';
    var el = eliteId(b, ref);
    return '<div class="bld-ed-bar">' + [0, 1, 2, 3, 4].map(function (i) {
      var id = 'bldEdSk' + bar + i, cur = b.skills[bar][i];
      return '<label for="' + id + '"><small>' + SLOT[i] + '</small><select id="' + id + '" data-ed="skill" data-bar="' + bar + '" data-slot="' + i + '"><option value="0">— vacío —</option>' +
        options(ref, i, el).map(function (o) { return '<option value="' + o.pid + '"' + (o.pid === cur ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('') + '</select></label>';
    }).join('') + '</div>';
  }
  function petsHTML(b, ref) {
    if (b.profession !== 4 || !b.pets) return '';
    var sel = function (bar, i, label) {
      var id = 'bldEdPet' + bar + i, cur = b.pets[bar][i];
      return '<label for="' + id + '"><small>' + label + '</small><select id="' + id + '" data-ed="pet" data-bar="' + bar + '" data-i="' + i + '"><option value="0">—</option>' +
        ref.pets.slice().sort(function (a, z) { return a.name.localeCompare(z.name, 'es'); }).map(function (p) { return '<option value="' + p.id + '"' + (p.id === cur ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label>';
    };
    return '<fieldset class="bld-ed-bar"><legend>Mascotas</legend>' + sel('land', 0, 'Tierra 1') + sel('land', 1, 'Tierra 2') + sel('water', 0, 'Agua 1') + sel('water', 1, 'Agua 2') + '</fieldset>';
  }
  function legendsHTML(b, ref) {
    if (b.profession !== 9 || !b.legends) return '';
    var el = eliteId(b, ref);
    var ok = ref.legends.filter(function (l) { return [5, 7, 8].indexOf(l.code) < 0 || (l.code === 5 && el === 63) || (l.code === 7 && el === 69) || (l.code === 8 && el === 79); });
    var sel = function (bar, i, label) {
      var id = 'bldEdLeg' + bar + i, cur = b.legends[bar][i];
      return '<label for="' + id + '"><small>' + label + '</small><select id="' + id + '" data-ed="legend" data-bar="' + bar + '" data-i="' + i + '"><option value="0">—</option>' +
        ok.map(function (l) { return '<option value="' + l.code + '"' + (l.code === cur ? ' selected' : '') + '>' + esc(l.name) + '</option>'; }).join('') + '</select></label>';
    };
    return '<fieldset class="bld-ed-bar"><legend>Leyendas (ponen la barra)</legend>' + sel('land', 0, 'Activa') + sel('land', 1, 'Otra') + sel('water', 0, 'Agua activa') + sel('water', 1, 'Agua otra') + '</fieldset>';
  }
  function weaponsHTML(b, ref) {
    var Cc = C(), el = eliteId(b, ref);
    var ids = Object.keys(Cc.WEAPONS).map(Number).filter(function (w) { var x = ref.weapons[Cc.WEAPONS[w]]; return x && (!x.spec || x.spec === el); });
    return '<fieldset class="bld-ed-weap"><legend>Armas <small class="bld-muted">(hasta 8; van en el código desde 2023)</small></legend>' + ids.map(function (w) {
      var on = b.weapons.indexOf(w) >= 0, k = Cc.WEAPONS[w];
      return '<button type="button" class="bld-btn" data-ed="weapon" data-v="' + w + '" aria-pressed="' + on + '">' + esc(Cc.WEAPONS_ES[k] || k) + '</button>';
    }).join('') + '</fieldset>';
  }
  function previewHTML(b, ref) {
    var code = '', err = '';
    try { code = C().encode(b); } catch (e) { err = e.message; }
    var v = root.GNBldRef.resolve(b, ref), checks = root.GNBldRef.check(b, ref).concat(C().problems(b).map(function (p) {
      return { level: 'err', msg: p.code === 'DUP_SKILL' ? 'La misma habilidad está dos veces en la barra: el juego no lo acepta.' : 'Especialización repetida.' };
    }));
    return '<div class="bld-ed-prev"><label for="bldEdTitle"><small>Nombre</small></label><input id="bldEdTitle" data-ed="title" maxlength="80" value="' + esc(st.title) + '" placeholder="Mi build">' +
      (err ? '<p class="bld-err">' + esc(err) + '</p>' : root.GNBldShow.detailHTML(v, { code: code, checks: checks, title: st.title || null,
        actions: ['copy', 'share', 'gw2skills', 'save'] })) +
      (st.mineId ? '<p class="bld-muted">Editando una build de Mis builds: «Guardar» actualiza esa misma.</p>' : '') + (err ? '' : gearHTML(b, code)) + '</div>';
  }
  // BLD-12/13: equipo, sugerencia y AE2 (si js/bld-gear.js está cargado).
  function gearHTML(b, code) {
    var G = root.GNBldGear;
    if (!G || !code) return '';
    if (!st.gear) st.gear = G.fresh();
    return G.panelHTML(st.gear, (b.weapons || []).map(function (w) { return C().WEAPONS[w]; }).filter(Boolean), code);
  }
  function onGear(ctx, e) {
    var G = root.GNBldGear;
    if (!G || !st.gear || !e.target || !e.target.closest || !e.target.closest('[data-gear],[data-gear-box]')) return false;
    var code = '';
    try { code = C().encode(st.build); } catch (_) {}
    if (G.onEvent(e, st.gear, code, function () { paint(ctx); })) paint(ctx, e.target.id || '');
    return true;
  }

  function viewHTML() {
    var b = st.build;
    var left = profHTML(b);
    if (st.loading) left += '<div class="bld-card" role="status">Trayendo especializaciones, rasgos y habilidades del juego…</div>';
    else if (st.error) left += '<div class="bld-card bld-err" role="alert">' + esc(st.error) + ' <button type="button" class="bld-btn" data-ed="retry">Reintentar</button></div>';
    else if (st.ref) {
      left += '<h3 class="bld-ed-h">Especializaciones</h3>' + [0, 1, 2].map(function (l) { return specLineHTML(b, st.ref, l); }).join('') +
        legendsHTML(b, st.ref) + petsHTML(b, st.ref) +
        (b.profession === 9 ? '' : '<h3 class="bld-ed-h">Barra</h3>' + barHTML(b, st.ref, 'land') +
          '<details class="bld-ed-water"><summary>Bajo el agua</summary>' + barHTML(b, st.ref, 'water') + '</details>') +
        weaponsHTML(b, st.ref) +
        '<p><button type="button" class="bld-btn" data-ed="reset">Empezar de cero</button></p>';
    }
    return '<div class="bld-ed"><div class="bld-ed-form">' + left + '</div>' + (st.ref && !st.loading ? previewHTML(b, st.ref) : '<div></div>') + '</div>';
  }

  var CSS = [
    '#buildsPanel .bld-ed{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,420px);gap:14px;align-items:start}',
    '@media (max-width:980px){#buildsPanel .bld-ed{grid-template-columns:1fr}}',
    '#buildsPanel .bld-ed fieldset{border:1px solid var(--bd-1);border-radius:10px;padding:8px;margin:0 0 10px;display:flex;flex-wrap:wrap;gap:6px}',
    '#buildsPanel .bld-ed legend,#buildsPanel .bld-ed-h{font-weight:700;color:var(--tx-1);font-size:.9rem;margin:6px 0}',
    '#buildsPanel .bld-ed [aria-pressed=true].bld-btn{border-color:var(--gn-mod);background:color-mix(in srgb,var(--gn-mod) 22%,var(--bg-2))}',
    '#buildsPanel .bld-ed-line{border:1px solid var(--bd-1);border-radius:10px;padding:8px;margin-bottom:8px;background:var(--bg-1)}',
    '#buildsPanel .bld-ed select,#buildsPanel .bld-ed input{background:var(--bg-0);color:var(--tx-1);border:1px solid var(--bd-1);border-radius:8px;padding:5px 8px;font:inherit;max-width:100%}',
    '#buildsPanel .bld-ed-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}@media (max-width:620px){#buildsPanel .bld-ed-tiers{grid-template-columns:1fr}}',
    '#buildsPanel .bld-ed-tier{display:grid;gap:4px}#buildsPanel .bld-ed-tier small,#buildsPanel .bld-ed label small{color:var(--tx-2);font-size:.7rem;text-transform:uppercase;display:block}',
    '#buildsPanel .bld-ed-tr{display:flex;align-items:center;gap:6px;text-align:left;background:var(--bg-2);border:1px solid var(--bd-1);border-radius:8px;padding:4px 6px;color:var(--tx-2);font:inherit;font-size:.8rem;cursor:pointer;opacity:.75}',
    '#buildsPanel .bld-ed-tr[aria-pressed=true]{opacity:1;color:var(--tx-1);border-color:var(--gn-mod);box-shadow:0 0 0 1px var(--gn-mod)}',
    '#buildsPanel .bld-ed-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:10px}',
    '#buildsPanel .bld-ed-water summary{cursor:pointer;color:var(--tx-2);margin-bottom:8px}',
    '#buildsPanel .bld-ed-prev{position:sticky;top:12px;display:grid;gap:8px}'
  ].join('\n');
  function ensureCss() {
    var d = root.document;
    if (!d || !d.head || d.getElementById('bld-editor-css')) return;
    var s = d.createElement('style'); s.id = 'bld-editor-css'; s.textContent = CSS; d.head.appendChild(s);
  }

  // ---------------------------------------------------------------- comportamiento
  function loadRef(ctx, prof) {
    st.loading = true; st.error = ''; st.ref = null;
    var my = ++st.req;
    paint(ctx);
    return ctx.ref.load(prof).then(function (ref) {
      if (my !== st.req) return;
      st.ref = ref; st.loading = false;
      legendBar(st.build, ref);
      paint(ctx);
    }, function (e) {
      if (my !== st.req) return;
      st.loading = false; st.error = 'No pude traer los datos del juego (' + (e && e.message || 'sin conexión') + ').';
      paint(ctx);
    });
  }

  function paint(ctx, focusId) {
    if (!ctx.host) return;
    var a = root.document && root.document.activeElement;
    var keep = focusId || (a && a.id && ctx.host.contains && ctx.host.contains(a) ? a.id : '');
    ctx.host.innerHTML = viewHTML();
    if (keep) { var el = root.document.getElementById(keep); if (el && el.focus) el.focus(); }
  }

  function onInput(ctx, e) {
    var t = e.target, kind = t && t.getAttribute && t.getAttribute('data-ed');
    if (!kind) return;
    var b = st.build;
    if (kind === 'title') { st.title = t.value; return; }
    if (kind === 'spec') setSpec(b, st.ref, +t.getAttribute('data-line'), t.value);
    else if (kind === 'skill') { b.skills[t.getAttribute('data-bar')][+t.getAttribute('data-slot')] = Number(t.value) || 0; }
    else if (kind === 'pet') { b.pets[t.getAttribute('data-bar')][+t.getAttribute('data-i')] = Number(t.value) || 0; }
    else if (kind === 'legend') { b.legends[t.getAttribute('data-bar')][+t.getAttribute('data-i')] = Number(t.value) || 0; legendBar(b, st.ref); }
    else return;
    paint(ctx, t.id);
  }

  function onClick(ctx, e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-ed]') : null;
    if (!t || t.tagName === 'SELECT' || t.tagName === 'INPUT') return;
    var kind = t.getAttribute('data-ed'), b = st.build;
    if (kind === 'prof') {
      var p = +t.getAttribute('data-v');
      if (p === b.profession && st.ref) return;
      st.build = fresh(p); st.mineId = ''; st.title = '';
      return loadRef(ctx, p);
    }
    if (kind === 'retry') return loadRef(ctx, b.profession);
    if (kind === 'reset') { st.build = fresh(b.profession); st.mineId = ''; st.title = ''; legendBar(st.build, st.ref); return paint(ctx); }
    if (kind === 'trait') setTrait(b, +t.getAttribute('data-line'), +t.getAttribute('data-tier'), +t.getAttribute('data-v'));
    else if (kind === 'weapon') toggleWeapon(b, +t.getAttribute('data-v'));
    else return;
    paint(ctx, t.id);
  }

  // Guardar desde el editor: si vino de Mis builds, actualiza esa misma.
  function saveFromEditor(ctx) {
    if (!ctx.store) return ctx.toast('Mis builds todavía no cargó.', 'err');
    var code;
    try { code = C().encode(st.build); } catch (e) { return ctx.toast(e.message, 'err'); }
    var r = st.mineId ? ctx.store.update(st.mineId, { code: code, title: st.title }) : ctx.store.save({ code: code, title: st.title });
    if (r.ok && !st.mineId) st.mineId = r.id;
    ctx.toast(r.ok ? (r.dup ? 'Esa build ya estaba en Mis builds.' : 'Guardada en Mis builds.') : r.error, r.ok ? 'ok' : 'err');
  }

  function open(ctx, arg) {
    st.lastArg = arg;
    var a = String(arg || '');
    if (/^m:/.test(a) && ctx.store) {
      var m = ctx.store.get(a.slice(2));
      if (m) { var r = C().parse(m.code); if (r.ok) { st.build = r.build; st.title = m.title; st.mineId = m.id; return loadRef(ctx, r.build.profession); } }
    }
    if (a && !/^m:/.test(a)) {
      var p = C().parse('[&' + a + ']');
      if (p.ok) { st.build = p.build; st.title = ''; st.mineId = ''; return loadRef(ctx, p.build.profession); }
      ctx.toast(p.error, 'err');
    }
    if (!st.build) { st.build = fresh(1); return loadRef(ctx, 1); }
    if (!st.ref) return loadRef(ctx, st.build.profession);
    paint(ctx);
  }

  function render(host, ctx) {
    if (root.GNBldShow) root.GNBldShow.ensureCss();
    ensureCss();
    ctx.host = host;
    if (!host._bldEd) {
      host._bldEd = true;
      host.addEventListener('change', function (e) { if (!host.querySelector('.bld-ed')) return; if (onGear(st.ctx, e)) return; onInput(st.ctx, e); });
      host.addEventListener('toggle', function (e) { if (host.querySelector('.bld-ed')) onGear(st.ctx, e); }, true);
      host.addEventListener('input', function (e) { if (e.target && e.target.getAttribute && e.target.getAttribute('data-ed') === 'title') st.title = e.target.value; });
      host.addEventListener('click', function (e) {
        if (!host.querySelector('.bld-ed')) return;
        var s = e.target && e.target.closest ? e.target.closest('[data-bld-act="save"]') : null;
        if (s) { e.preventDefault(); e.stopPropagation(); return saveFromEditor(st.ctx); }
        if (e.target && e.target.closest && e.target.closest('[data-gear]')) return onGear(st.ctx, e);
        onClick(st.ctx, e);
      }, true);
      if (root.GNBldShow) root.GNBldShow.wire(host, function () {
        if (!host.querySelector('.bld-ed')) return null; // otra pestaña dibujó en este mismo lugar
        try { return { code: C().encode(st.build), title: st.title }; } catch (_) { return null; }
      }, st.ctx || ctx);
    }
    st.ctx = ctx;
    if (ctx.arg !== st.lastArg || !st.build) return open(ctx, ctx.arg);
    paint(ctx);
  }

  var api = { version: VERSION, render: render, refresh: function () { if (st.ctx && st.ctx.host && st.ctx.host.querySelector('.bld-ed')) paint(st.ctx); },
    _pure: { options: options, prune: prune, legendBar: legendBar, setSpec: setSpec, setTrait: setTrait, toggleWeapon: toggleWeapon, fresh: fresh, eliteId: eliteId,
      viewHTML: viewHTML, CSS: CSS }, _state: st };
  root.GNBldEditor = api;
  if (root.GNBld && typeof root.GNBld.register === 'function') root.GNBld.register('editor', api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
