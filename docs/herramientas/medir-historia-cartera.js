/*!
 * docs/herramientas/medir-historia-cartera.js — BL-059 SHV-2c: mide la historia vieja de la Cartera en este navegador.
 * SOLO LEE: no escribe ni borra nada. Se corre desde la consola (F12) en la Bóveda:
 *   fetch('https://raw.githubusercontent.com/PabloSnchz/gw2-factory-dev/main/docs/herramientas/medir-historia-cartera.js').then(r => r.text()).then(eval)
 * Busca gn:wallet:snapshots* y walletSnapshot:* (la historia de una versión anterior) y muestra su FORMA,
 * no tus datos: cuántas claves, de qué cuenta (por número de Key, nunca la Key), cuántas fotos, de qué fechas a
 * qué fechas y cómo es una foto con los números cambiados por «n». Lo que imprime se puede copiar y pegar tal cual.
 * No mira gn:github:gist_snapshot (es otra cosa y lleva tus Keys).
 */
(function () {
  var KEYRE = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{20}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/gi;
  var keys = [];
  try { keys = JSON.parse(localStorage.getItem('gn:account:keys') || localStorage.getItem('gw2_keys') || '[]') || []; } catch (_) {}
  var vals = keys.map(function (k) { return k && (k.value || k.key || k.token) ? String(k.value || k.key || k.token) : String(k || ''); });
  function hide(s) {
    return String(s).replace(KEYRE, function (m) {
      var i = vals.indexOf(m);
      return i >= 0 ? '<Key #' + (i + 1) + '>' : '<Key que ya no está cargada>';
    }).replace(/[0-9A-F]{30,}/gi, '<texto largo oculto>');
  }
  var lo = Infinity, hi = -Infinity;
  function date(v) {
    if (typeof v === 'number' && v > 1.3e12 && v < 2.2e12) return v;
    if (typeof v === 'number' && v > 1.3e9 && v < 2.2e9) return v * 1000;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) { var t = Date.parse(v); return isNaN(t) ? null : t; }
    return null;
  }
  function seeDates(v, depth) {
    var d = date(v);
    if (d) { lo = Math.min(lo, d); hi = Math.max(hi, d); }
    if (depth > 6 || !v || typeof v !== 'object') return;
    Object.keys(v).forEach(function (k) { var dk = date(k); if (dk) { lo = Math.min(lo, dk); hi = Math.max(hi, dk); } seeDates(v[k], depth + 1); });
  }
  // La forma: números → «n», textos → su largo, listas → largo + forma del primero, objetos → hasta 12 claves.
  function shape(v, depth) {
    if (v === null) return null;
    if (typeof v === 'number') return date(v) ? 'fecha' : 'n';
    if (typeof v === 'boolean') return 'sí/no';
    if (typeof v === 'string') return date(v) ? 'fecha-texto' : 'texto(' + v.length + ')';
    if (depth > 4) return '…';
    if (Array.isArray(v)) return v.length ? ['lista de ' + v.length, shape(v[0], depth + 1)] : 'lista vacía';
    var ks = Object.keys(v), out = {};
    ks.slice(0, 12).forEach(function (k) { out[hide(k)] = shape(v[k], depth + 1); });
    if (ks.length > 12) out['…'] = '(' + ks.length + ' claves en total)';
    return out;
  }
  var found = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (!k || k === 'gn:github:gist_snapshot') continue;
    if (k.indexOf('gn:wallet:snapshots') === 0 || k.indexOf('walletSnapshot') === 0) found.push(k);
  }
  console.log('Historia vieja de la Cartera — ' + found.length + ' claves (solo lectura; tus Keys no aparecen).');
  var rows = [], forms = [];
  found.sort().forEach(function (k) {
    var raw = localStorage.getItem(k) || '', v = raw;
    try { v = JSON.parse(raw); } catch (_) {}
    lo = Infinity; hi = -Infinity;
    seeDates(v, 0);
    var n = Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 1;
    rows.push({ clave: hide(k), caracteres: raw.length, entradas: n,
      desde: isFinite(lo) ? new Date(lo).toISOString().slice(0, 10) : '—', hasta: isFinite(hi) ? new Date(hi).toISOString().slice(0, 10) : '—' });
    var f = JSON.stringify(shape(v, 0));
    if (forms.indexOf(f) < 0) forms.push(f);
  });
  if (rows.length) {
    console.table(rows);
    console.log('Formas distintas: ' + forms.length + ' (copiá desde acá):\n' + forms.map(function (s, j) { return (j + 1) + ') ' + JSON.stringify(JSON.parse(s), null, 1); }).join('\n'));
  } else {
    console.log('No hay historia vieja de la Cartera en este navegador.');
  }
  console.log('Cuentas cargadas: ' + vals.length + '. La Bóveda nueva ya recuerda ' + (window.ShvMemory && ShvMemory.stats ? JSON.stringify(ShvMemory.stats()) : '(ShvMemory no está en esta versión)') + '.');
})();
