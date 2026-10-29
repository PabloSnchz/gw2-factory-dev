// BL-082 BENCH-1 sonda 3 (solo lectura, descartable): benchmarks de Snow Crows en forma compacta, en mitades
// para que la salida no se recorte. Fila: [dirección sin «raids/», dificultad, máx, prom, log de dps.report].
const HALF = 1;
const UA = { headers: { 'User-Agent': 'LaBovedaDelGatoNegro/1.0 (+https://github.com/PabloSnchz/gw2-factory-dev; curacion manual de builds)' } };
const num = (s) => Number(String(s).replace(/[^0-9]/g, '')) || 0;
(async () => {
  const h = await (await fetch('https://snowcrows.com/en/benchmarks', UA)).text();
  const parts = h.split('class="font-medium line-clamp-1"');
  const rows = [];
  for (let i = 1; i < parts.length; i++) {
    const before = parts[i - 1].slice(-1500), p = parts[i].slice(0, 6000);
    const href = (before.match(/href="([^"]+)"\s*$/) || [])[1] || '';
    const dots = (p.split('data-tippy-content="Build Difficulty"')[1] || '').split('</span>')[0];
    const diff = (dots.match(/text-orange-400/g) || []).length;
    const max = num((p.match(/fa-angle-double-up[^>]*><\/i>\s*([\d,]+)/) || [])[1]);
    const avg = num((p.match(/fa-tilde[^>]*><\/i>\s*([\d,]+)/) || [])[1]);
    const log = (p.match(/href="https:\/\/dps\.report\/([^"]+)"/) || [])[1] || '';
    rows.push([href.replace(/^https?:\/\/[^/]+/, '').replace(/^\/(en\/)?builds\//, '').replace(/^raids\//, ''), diff, max, avg, log]);
  }
  const n = Math.ceil(rows.length / 2), part = HALF === 1 ? rows.slice(0, n) : rows.slice(n);
  console.log('ROWS', rows.length, 'HALF', HALF, part.length);
  part.forEach((r) => console.log(r.join('|')));
})();
