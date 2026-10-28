// BL-082 BLD-7/8/15: ayuda de curación (solo lectura). Lee las páginas públicas de Snow Crows (robots.txt «Allow: /»),
// una por vez y con pausa, y anota solo datos factuales: élite, modo, dirección, fecha de actualización y código.
// No copia textos ni imágenes. El catálogo lo armo yo con estos datos y crédito a la fuente.
globalThis.GNBldCode = require('../js/bld-code.js');
const C = globalThis.GNBldCode;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'https://snowcrows.com';
const ELITES = { druid: 5, daredevil: 7, berserker: 18, dragonhunter: 27, reaper: 34, chronomancer: 40, scrapper: 43, tempest: 48, herald: 52,
  soulbeast: 55, weaver: 56, holosmith: 57, deadeye: 58, mirage: 59, scourge: 60, spellbreaker: 61, firebrand: 62, renegade: 63, harbinger: 64,
  willbender: 65, virtuoso: 66, catalyst: 67, bladesworn: 68, vindicator: 69, mechanist: 70, specter: 71, untamed: 72, troubadour: 73, paragon: 74,
  amalgam: 75, ritualist: 76, antiquary: 77, galeshot: 78, conduit: 79, evoker: 80, luminary: 81 };
const OF = { guardian: [27, 62, 65, 81], warrior: [18, 61, 68, 74], engineer: [43, 57, 70, 75], ranger: [5, 55, 72, 78], thief: [7, 58, 71, 77],
  elementalist: [48, 56, 67, 80], mesmer: [40, 59, 66, 73], necromancer: [34, 60, 64, 76], revenant: [52, 63, 69, 79] };
// Índices por modo, en orden de preferencia (el primero que publica la élite gana).
const MODES = { pve: ['raids', 'fractals', 'open-world', 'accessibuilds'], wvw: ['wvw'], pvp: ['pvp'] };
async function text(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(url, Object.assign({ signal: ctl.signal }, UA)); clearTimeout(t);
      if (r.ok) return await r.text();
      if (r.status === 404) return '';
    } catch (e) {}
    await sleep(2500);
  }
  return '';
}
const eliteOf = (slug) => { const p = slug.split('/').pop().split('-').find((x) => ELITES[x]); return p ? ELITES[p] : 0; };
module.exports = async function run(profs) {
  for (const p of profs) {
    const pick = {};
    for (const mode of Object.keys(MODES)) {
      for (const idx of MODES[mode]) {
        await sleep(900);
        const h = await text(BASE + '/builds/' + idx + '/' + p);
        const ls = [...new Set([...h.matchAll(new RegExp('href="(/builds/' + idx + '/' + p + '/[^"#?]+)"', 'g'))].map((m) => m[1]))];
        ls.forEach((u) => { const e = eliteOf(u); const k = e + '|' + mode; if (e && !pick[k]) pick[k] = u; });
      }
    }
    const miss = OF[p].flatMap((e) => ['pve', 'wvw', 'pvp'].map((m) => e + '|' + m)).filter((k) => !pick[k]);
    console.log('# ' + p + ' faltan: ' + (miss.join(' ') || 'nada'));
    for (const k of Object.keys(pick).sort()) {
      await sleep(900);
      const url = pick[k];
      const h = await text(BASE + url);
      const m = h.match(/writeText\('\[&(?:amp;)?(DQ[A-Za-z0-9+/]+={0,2})\]'\)/) || h.match(/\[&(?:amp;)?(DQ[A-Za-z0-9+/]{40,}={0,2})\]/);
      const up = (h.replace(/<[^>]+>/g, ' ').match(/Updated\s+([A-Z][a-z]{2,8}\.?\s+\d{1,2},\s+\d{4})/) || [])[1] || '';
      let ok = 'SIN_CODIGO', el = 0;
      if (m) { const r = C.parse('[&' + m[1] + ']'); ok = r.ok ? 'ok' : 'MAL:' + r.errorCode; if (r.ok) el = r.build.specs[2].id; }
      const [e, mode] = k.split('|');
      console.log(['R', e, mode, String(el) === e ? 'ok' : 'EL' + el, up.replace(/\s+/g, ' ') || '-', url.replace('/builds/', ''), m ? m[1] : '-', ok].join('\t'));
    }
  }
};
