/*!
 * tests/gn-idb-hook.test.cjs — BL-074 BLS-2: js/api-gw2.js delega sus cachés en GNIdb (js/gn-idb.js).
 *
 * Se monta el api-gw2.js REAL en un sandbox (mismo montaje que idea50-boton-cache) y se mide:
 *  [1] sin GNIdb, todo sigue en localStorage como siempre (los tests viejos dependen de eso);
 *  [2] con GNIdb, los cachés que él reclama van a GNIdb y NO tocan localStorage;
 *  [3] las claves que GNIdb no reclama (tus datos, otros cachés) siguen en localStorage;
 *  [4] «Vaciar caché» (cacheClear) cuenta y vacía también lo que está en GNIdb; el dryRun no borra;
 *  [5] con el gn-idb.js REAL y sin IndexedDB, handles() es false: la Bóveda sigue con localStorage;
 *  [6] index.html carga gn-idb.js con su versión, antes de los módulos defer que piden a la API.
 * Ejecutar: node tests/gn-idb-hook.test.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const API = fs.readFileSync(path.join(ROOT, 'js', 'api-gw2.js'), 'utf8');
const IDB = fs.readFileSync(path.join(ROOT, 'js', 'gn-idb.js'), 'utf8');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; console.log('  FAIL  ' + m); } }
function eq(a, b, m) { ok(a === b, m + '  (obtenido: ' + JSON.stringify(a) + ')'); }

function fakeIdb(prefixes) {
  const mem = new Map(); let cleared = 0;
  return {
    mem, get cleared() { return cleared; },
    handles(k) { return prefixes.some((p) => String(k).indexOf(p) === 0); },
    get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
    set(k, v) { mem.set(k, JSON.stringify(v)); return true; },
    has(k) { return mem.has(k); },
    del(k) { mem.delete(k); },
    stats() { let c = 0; mem.forEach((s, k) => { c += k.length + s.length; }); return { enabled: true, keys: mem.size, chars: c }; },
    clear() { const n = mem.size; mem.clear(); cleared++; return Promise.resolve(n); }
  };
}

function mount(opts) {
  opts = opts || {};
  const store = new Map();
  const quiet = new Proxy({}, { get(_t, p) { return p === 'log' || p === 'warn' || p === 'info' ? () => {} : console[p]; } });
  const sb = {
    console: quiet,
    localStorage: {
      get length() { return store.size; },
      key(i) { return Array.from(store.keys())[i]; },
      getItem(k) { return store.has(k) ? store.get(k) : null; },
      setItem(k, v) { store.set(k, String(v)); },
      removeItem(k) { store.delete(k); }
    },
    fetch() {
      return Promise.resolve({ ok: true, status: 200, headers: { get() { return null; } }, text() { return Promise.resolve('[]'); } });
    },
    setTimeout, clearTimeout, URL, Promise, Map, Set, Date, JSON, Object, Array, String, Number, Math, isFinite
  };
  sb.window = sb; sb.globalThis = sb;
  if (opts.idb) sb.GNIdb = opts.idb;
  if (opts.realIdb) sb.GN_IDB_MANUAL = true;
  vm.createContext(sb);
  if (opts.realIdb) vm.runInContext(IDB, sb, { filename: 'gn-idb.js' });
  vm.runInContext(API, sb, { filename: 'api-gw2.js' });
  return { sb, store, api: sb.GW2Api };
}

(async function () {
  console.log('\n[0] el código: un solo punto de decisión, en los 4 accesos a localStorage');
  ok(/function idb\(k\) \{ var G = root\.GNIdb; return G && G\.handles\(k\) \? G : null; \}/.test(API),
    'api-gw2.js tiene idb(k): pregunta a GNIdb si la clave es suya (y si GNIdb existe)');
  ['lsGet(key)', 'lsSet(key, val)', 'lsDel(key)', 'lsHas(key)'].forEach((f) => {
    const i = API.indexOf('function ' + f);
    ok(i > 0 && /var G = idb\(key\); if \(G\) return G\./.test(API.slice(i, i + 160)), f + ' delega primero en GNIdb');
  });

  console.log('\n[1] sin GNIdb, los cachés siguen en localStorage (como hasta hoy)');
  const a = mount();
  a.store.set('ach_acc', '"x"');
  const d1 = a.api.__cacheClear({ dryRun: true });
  eq(d1.removed, 1, 'el dryRun cuenta la clave de localStorage');
  ok(a.store.has('ach_acc'), 'y el dryRun no borra');

  console.log('\n[2]+[3] con GNIdb: los cachés suyos van a él; el resto, a localStorage');
  const G = fakeIdb(['commerce_listings', 'ach_acc', 'items_cache_v1']);
  const b = mount({ idb: G });
  // getCommerceListings guarda con putCache -> lsSet('commerce_listings:<fp>')
  const tok = 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEEFFFFFFFF-1111-2222-3333-444444444444';
  try { await b.api.getCommerceListings(tok, { nocache: false }); } catch (_) {}
  const enG = Array.from(G.mem.keys()).filter((k) => k.indexOf('commerce_listings') === 0);
  const enLS = Array.from(b.store.keys()).filter((k) => k.indexOf('commerce_listings') === 0);
  ok(enG.length >= 1, 'commerce_listings quedó en GNIdb (' + enG.join(',') + ')');
  eq(enLS.length, 0, 'y NO en localStorage');
  try { await b.api.getAccountWallet(tok); } catch (_) {}
  const walletLS = Array.from(b.store.keys()).filter((k) => k.indexOf('wallet') === 0);
  const walletG = Array.from(G.mem.keys()).filter((k) => k.indexOf('wallet') === 0);
  ok(walletLS.length >= 1 && walletG.length === 0, 'wallet (GNIdb no la reclama) sigue en localStorage');

  console.log('\n[4] Vaciar caché cuenta y vacía GNIdb; el dryRun no borra');
  b.store.set('gn:account:keys', 'KEEP');
  const nG = G.mem.size, nLS = Array.from(b.store.keys()).filter((k) => k !== 'gn:account:keys').length;
  const dry = b.api.__cacheClear({ dryRun: true });
  eq(dry.removed, nG + nLS, 'dryRun: removed = cachés de localStorage + cachés de GNIdb');
  ok(dry.bytes >= G.stats().chars, 'y los bytes incluyen los de GNIdb');
  eq(G.mem.size, nG, 'el dryRun NO vació GNIdb');
  eq(G.cleared, 0, 'ni llamó a clear()');
  const real = b.api.__cacheClear();
  eq(real.removed, dry.removed, 'el borrado real cumple la cifra del dryRun');
  eq(G.cleared, 1, 'llamó a GNIdb.clear() una vez');
  eq(G.mem.size, 0, 'GNIdb quedó vacío');
  ok(b.store.has('gn:account:keys'), 'tus datos siguen en localStorage');

  console.log('\n[5] con el gn-idb.js real y sin IndexedDB: todo sigue en localStorage');
  const c = mount({ realIdb: true });
  c.sb.GNIdb.init({ localStorage: c.sb.localStorage });
  eq(c.sb.GNIdb.handles('ach_acc'), false, 'sin IndexedDB, GNIdb no reclama nada');
  try { await c.api.getCommerceListings(tok, {}); } catch (_) {}
  ok(Array.from(c.store.keys()).some((k) => k.indexOf('commerce_listings') === 0), 'y la capa API guarda en localStorage como siempre');
  eq(c.api.__cacheClear({ dryRun: true }).removed >= 1, true, 'Vaciar caché los sigue encontrando');

  console.log('\n[6] index.html carga gn-idb.js con versión, antes de los defer');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<script src="js\/gn-idb\.js\?v=([\d.]+)"><\/script>/);
  ok(!!m, 'index.html tiene <script src="js/gn-idb.js?v=…"> (sin defer ni async)');
  const hv = (IDB.match(/Versión:\s*([\d.]+)/) || [])[1];
  eq(m && m[1], hv, 'la ?v es la versión del archivo');
  const iIdb = m ? html.indexOf(m[0]) : -1;
  ok(iIdb > 0, 'está en el HTML');
  ok(!/BLS-1: inerte/.test(IDB), 'el encabezado de gn-idb.js ya no dice que está inerte');

  console.log('\n' + (fail === 0 ? 'TODO OK' : 'HAY FALLOS') + ' — ' + pass + ' pass / ' + fail + ' FAIL');
  process.exit(fail === 0 ? 0 : 1);
})();
