// RUN-200 (BL-082 fix): ¿qué URL de la API devuelve HTML en vez de JSON? Sonda temporal, se borra después.
const path = require('path');
const log = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, o) => {
  const r = await realFetch(url, o);
  const t = await r.clone().text();
  const html = /^\s*</.test(t);
  log.push([r.status, r.headers.get('content-type'), html ? 'HTML' : 'json', url.length, url.slice(0, 160), html ? t.slice(0, 160).replace(/\s+/g, ' ') : '']);
  return r;
};
const Ref = require(path.join(__dirname, '..', 'js', 'bld-ref.js'));
(async () => {
  for (const p of ['Engineer', 'Necromancer', 'Revenant', 'Ranger']) {
    log.length = 0; Ref._test.reset();
    try { const ref = await Ref.load(p); console.log('##', p, 'OK specs', ref.specs.length, 'skills', Object.keys(ref.skills).length); }
    catch (e) { console.log('##', p, 'FALLA', e.message); }
    log.forEach(l => console.log(l.join(' | ')));
  }
})();
