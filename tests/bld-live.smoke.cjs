// BL-082 BLD-3: sonda con la API real (solo lectura). Carga las 9 profesiones con js/bld-ref.js y lee un código real.
// También mira la portada de builds de Snow Crows (robots.txt: Allow /) para planear la curación (BLD-7).
globalThis.GNBldCode = require('../js/bld-code.js');
const R = require('../js/bld-ref.js');
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (let p = 1; p <= 9; p++) {
    try {
      const t0 = Date.now();
      const ref = await R.load(p);
      const el = ref.specs.filter((s) => s.elite).map((s) => s.id + ':' + s.name).join(', ');
      const bad = ref.specs.filter((s) => s.major.some((l) => l.length !== 3)).map((s) => s.name);
      console.log(p, ref.name, 'specs', ref.specs.length, 'élites [' + el + ']', 'paleta', Object.keys(ref.palette).length,
        'barra H/U/E', ref.bar.Heal.length + '/' + ref.bar.Utility.length + '/' + ref.bar.Elite.length,
        'armas', Object.keys(ref.weapons).join('|'), 'mascotas', ref.pets.length, 'leyendas', ref.legends.length,
        'KB', Math.round(JSON.stringify(ref).length / 1024), 'ms', Date.now() - t0, bad.length ? 'LINEAS_RARAS ' + bad : '');
      if (p === 1) {
        const b = GNBldCode.decode('[&DQEbNxAZKgoDAQMBihKKEv4S/hJ6FnoWtRIAAAAAAAAAAAAAAAAAAAAAAAA=]');
        const v = R.resolve(b, ref);
        console.log('  código real:', v.specs.map((s) => s.name + '(' + s.traits.map((t) => t && t.name).join('/') + ')').join(' · '));
        console.log('  barra:', v.land.map((s) => s && s.name).join(' | '));
        console.log('  check:', JSON.stringify(R.check(b, ref)));
      }
      if (p === 9) console.log('  leyendas:', ref.legends.map((l) => l.code + ':' + l.name).join(', '));
      if (p === 4) console.log('  mascotas (5):', ref.pets.slice(0, 5).map((x) => x.id + ':' + x.name).join(', '));
    } catch (e) { console.log(p, 'ERROR', e.message); }
  }
  try {
    const r = await fetch('https://snowcrows.com/builds', UA);
    const h = await r.text();
    const links = [...new Set([...h.matchAll(/href="(\/builds\/[^"#?]+)"/g)].map((m) => m[1]))];
    console.log('\nsnowcrows /builds', r.status, h.length, 'enlaces', links.length, 'códigos en la portada', (h.match(/\[&amp;DQ|\[&DQ/g) || []).length);
    console.log(links.slice(0, 80).join('\n'));
    if (links[0]) {
      await sleep(1500);
      const r2 = await fetch('https://snowcrows.com' + links[0], UA);
      const h2 = await r2.text();
      const codes = h2.match(/\[&(amp;)?DQ[A-Za-z0-9+/=]+\]/g) || [];
      console.log('\n' + links[0], r2.status, h2.length, 'códigos', codes.length, codes.slice(0, 3).join(' '));
      const i = h2.search(/patch|updated|last update/i);
      console.log('contexto', h2.slice(Math.max(0, i - 200), i + 300).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    }
  } catch (e) { console.log('snowcrows ERROR', e.message); }
})();
