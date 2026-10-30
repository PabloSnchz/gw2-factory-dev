// BL-084 EQ-1 sonda (solo lectura, descartable): cómo viene el equipo en fichas de Snow Crows (raids, PvP, WvW, mundo abierto).
// Imprime, por tabla del bloque de equipo: encabezados y, por fila, atributos data-armory-* y el texto visible. Sin copiar prosa.
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const URLS = [
  'https://snowcrows.com/builds/raids/engineer/power-mechanist-rifle',
  'https://snowcrows.com/builds/pvp/guardian/power-dragonhunter-longbow-sword-shield',
  'https://snowcrows.com/builds/wvw/guardian/power-dragonhunter',
  'https://snowcrows.com/builds/open-world/warrior/champion-hunter-paragon',
];
const clean = (s) => s.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
const txt = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
(async () => {
  for (const u of URLS) {
    const h = clean(await (await fetch(u, UA)).text());
    console.log('\n######## ' + u.replace('https://snowcrows.com/builds/', '') + ' len ' + h.length);
    // límite: desde el primer <table> hasta el bloque de especializaciones
    const a = h.indexOf('<table'), b = h.indexOf('data-armory-embed="specializations"');
    const seg = h.slice(a, b > a ? b : a + 60000);
    const tables = seg.split('<table').slice(1);
    console.log('tables', tables.length);
    tables.slice(0, 6).forEach((t, i) => {
      t = t.split('</table>')[0];
      const ths = [...t.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => txt(m[1]));
      console.log('T' + i + ' TH ' + JSON.stringify(ths));
      t.split('<tr').slice(1).forEach((r) => {
        const at = [...r.matchAll(/data-armory-([a-z0-9-]+)=(?:"([^"]*)"|'([^']*)'|(?=[\s>]))/g)].map((m) => m[1] + '=' + (m[2] != null ? m[2] : m[3] != null ? m[3] : '')).filter((x) => !/^(size|inline-text)=/.test(x));
        const tx = txt(r.replace(/^[^>]*>/, ''));
        if (at.length || tx) console.log('  R ' + at.join(' ') + ' | ' + tx.slice(0, 110));
      });
    });
    // texto del bloque antes de la primera tabla (por si el amuleto de PvP va aparte)
    const pre = h.slice(Math.max(0, a - 2500), a);
    const at = [...pre.matchAll(/data-armory-([a-z0-9-]+)="([^"]*)"/g)].map((m) => m[1] + '=' + m[2]).filter((x) => !/^(size|inline-text)=/.test(x));
    console.log('PRE ' + at.join(' ').slice(0, 400));
  }
})();
