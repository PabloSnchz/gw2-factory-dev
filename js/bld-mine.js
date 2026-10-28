/*!
 * js/bld-mine.js — Builds: pestaña Mis builds (BL-082 BLD-6, B7)
 * Versión: 1.0.0 (2026-10-28)
 *
 * Tus builds guardadas en este navegador (js/bld-store.js): copiar el código, abrir la ficha, editar en el Editor,
 * duplicar, renombrar, anotar y borrar (con confirmación). Viajan en tu archivo de respaldo.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var st = { open: '', confirm: '', view: {}, checks: {} };

  function esc(s) { return root.GNBldShow ? root.GNBldShow.esc(s) : String(s == null ? '' : s); }
  function fmt(t) { try { return new Date(t).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (_) { return ''; } }

  function rowHTML(b) {
    var C = root.GNBldCode, on = st.open === b.id;
    var h = '<li class="bld-card bld-mine-row" data-id="' + esc(b.id) + '">' +
      '<div class="bld-mine-h"><div><b>' + esc(b.title) + '</b><p class="bld-muted">' + esc(C ? C.PROF_ES[b.profession] || '' : '') + ' · editada ' + fmt(b.updated) +
      (b.source && b.source.url ? ' · basada en <a href="' + esc(b.source.url) + '" target="_blank" rel="noopener">' + esc(b.source.name || 'la fuente') + ' ↗</a>' : '') + '</p></div>' +
      '<div class="bld-acts">' +
      '<button type="button" class="bld-btn" data-mine="copy">Copiar código</button>' +
      '<button type="button" class="bld-btn" data-mine="toggle" aria-expanded="' + on + '">' + (on ? 'Cerrar' : 'Ver') + '</button>' +
      '<button type="button" class="bld-btn" data-mine="edit">Editar</button>' +
      '<button type="button" class="bld-btn" data-mine="dup">Duplicar</button>' +
      (st.confirm === b.id ? '<button type="button" class="bld-btn bld-err" data-mine="del-yes">Sí, borrar</button><button type="button" class="bld-btn" data-mine="del-no">No</button>'
        : '<button type="button" class="bld-btn" data-mine="del">Borrar</button>') +
      '</div></div>';
    if (on) {
      h += '<div class="bld-mine-more"><label><small>Nombre</small><input data-mine-field="title" maxlength="80" value="' + esc(b.title) + '"></label>' +
        '<label><small>Notas</small><textarea data-mine-field="notes" rows="2" maxlength="1000">' + esc(b.notes || '') + '</textarea></label>' +
        '<button type="button" class="bld-btn" data-mine="savemeta">Guardar nombre y notas</button>' +
        (st.view[b.id] ? root.GNBldShow.detailHTML(st.view[b.id], { code: b.code, checks: st.checks[b.id], title: b.title, actions: ['share', 'gw2skills'] })
          : '<p class="bld-muted" role="status">Cargando la ficha…</p>') + '</div>';
    }
    return h + '</li>';
  }

  function viewHTML(list) {
    if (!list.length) {
      return '<div class="bld-card"><p><b>Todavía no guardaste builds.</b></p><p class="bld-muted">Armá una en el <a href="#/builds/editor">Editor</a>, ' +
        'importá un código en <a href="#/builds/importar">Importar</a> o guardá una de la <a href="#/builds">Biblioteca</a>. Quedan en este navegador y viajan en tu respaldo.</p></div>';
    }
    return '<p class="bld-muted">' + list.length + (list.length === 1 ? ' build guardada' : ' builds guardadas') + ' en este navegador · viajan en tu respaldo.</p>' +
      '<ul class="bld-mine">' + list.map(rowHTML).join('') + '</ul>';
  }

  var CSS = [
    '#buildsPanel .bld-mine{list-style:none;margin:0;padding:0;display:grid;gap:8px}',
    '#buildsPanel .bld-mine-h{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center}',
    '#buildsPanel .bld-mine-h p{margin:2px 0 0;font-size:.8rem}',
    '#buildsPanel .bld-mine-more{display:grid;gap:8px;margin-top:10px}',
    '#buildsPanel .bld-mine-more input,#buildsPanel .bld-mine-more textarea{width:100%;box-sizing:border-box;background:var(--bg-0);color:var(--tx-1);border:1px solid var(--bd-1);border-radius:8px;padding:6px 8px;font:inherit}',
    '#buildsPanel .bld-mine-more small{display:block;color:var(--tx-2);font-size:.7rem;text-transform:uppercase}'
  ].join('\n');
  function ensureCss() {
    var d = root.document;
    if (!d || !d.head || d.getElementById('bld-mine-css')) return;
    var s = d.createElement('style'); s.id = 'bld-mine-css'; s.textContent = CSS; d.head.appendChild(s);
  }

  function loadView(ctx, b) {
    var r = root.GNBldCode.parse(b.code);
    if (!r.ok || !ctx.ref) return;
    ctx.ref.load(r.build.profession).then(function (ref) {
      st.view[b.id] = ctx.ref.resolve(r.build, ref);
      st.checks[b.id] = ctx.ref.check(r.build, ref);
      if (st.open === b.id) paint(ctx);
    }, function (e) { ctx.toast('No pude traer los nombres del juego: ' + (e && e.message || ''), 'err'); });
  }

  function paint(ctx) {
    if (!ctx.host || !ctx.store) return;
    var a = root.document && root.document.activeElement;
    var keep = a && a.getAttribute ? [a.closest && a.closest('[data-id]') ? a.closest('[data-id]').getAttribute('data-id') : '', a.getAttribute('data-mine') || ''] : null;
    ctx.host.innerHTML = viewHTML(ctx.store.list());
    if (keep && keep[0] && keep[1]) {
      var el = ctx.host.querySelector('[data-id="' + keep[0] + '"] [data-mine="' + keep[1] + '"]');
      if (el && el.focus) el.focus();
    }
  }

  function onClick(ctx, e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-mine]') : null;
    if (!b) return;
    var row = b.closest('[data-id]'), id = row && row.getAttribute('data-id'), act = b.getAttribute('data-mine');
    var item = id && ctx.store.get(id);
    if (!item) return;
    e.preventDefault();
    if (act === 'copy') return root.GNBldShow.copy(item.code).then(function (ok) { ctx.toast(ok ? 'Código copiado.' : 'No pude copiar.', ok ? 'ok' : 'err'); });
    if (act === 'toggle') { st.open = st.open === id ? '' : id; if (st.open && !st.view[id]) loadView(ctx, item); return paint(ctx); }
    if (act === 'edit') return ctx.go('editor', 'm:' + id);
    if (act === 'dup') { var r = ctx.store.duplicate(id); ctx.toast(r.ok ? 'Duplicada.' : r.error, r.ok ? 'ok' : 'err'); return paint(ctx); }
    if (act === 'del') { st.confirm = id; return paint(ctx); }
    if (act === 'del-no') { st.confirm = ''; return paint(ctx); }
    if (act === 'del-yes') { st.confirm = ''; var d = ctx.store.remove(id); ctx.toast(d.ok ? 'Borrada.' : d.error, d.ok ? 'ok' : 'err'); return paint(ctx); }
    if (act === 'savemeta') {
      var t = row.querySelector('[data-mine-field="title"]'), n = row.querySelector('[data-mine-field="notes"]');
      var u = ctx.store.update(id, { title: t ? t.value : null, notes: n ? n.value : null });
      ctx.toast(u.ok ? 'Guardado.' : u.error, u.ok ? 'ok' : 'err');
      return paint(ctx);
    }
  }

  function render(host, ctx) {
    if (root.GNBldShow) root.GNBldShow.ensureCss();
    ensureCss();
    ctx.host = host;
    if (!ctx.store) { host.innerHTML = '<div class="bld-card bld-err">Mis builds no cargó: recargá la página.</div>'; return; }
    host.addEventListener('click', function (e) { onClick(ctx, e); });
    if (root.GNBldShow) root.GNBldShow.wire(host, function (btn) {
      var row = btn.closest('[data-id]'), item = row && ctx.store.get(row.getAttribute('data-id'));
      return item ? { code: item.code, title: item.title } : null;
    }, ctx);
    paint(ctx);
  }

  var api = { version: VERSION, render: render, _pure: { viewHTML: viewHTML, rowHTML: rowHTML }, _state: st };
  root.GNBldMine = api;
  if (root.GNBld && typeof root.GNBld.register === 'function') root.GNBld.register('mine', api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
