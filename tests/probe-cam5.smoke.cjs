// Sonda de lectura (BL-064 CAM-5): quién usa wv-purchase-detail.js. Solo lee; se borra al cerrar CAM-5.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function walk(d, out) {
  for (const n of fs.readdirSync(path.join(ROOT, d))) {
    const p = d + '/' + n;
    const st = fs.statSync(path.join(ROOT, p));
    if (st.isDirectory()) { if (!/node_modules|assets|fixtures/.test(n)) walk(p, out); }
    else if (/\.(js|cjs|css|html)$/.test(n)) out.push(p);
  }
  return out;
}
const files = ['index.html'].concat(walk('js', []), walk('css', []), walk('tests', []), walk('tools', []));
const PATS = [
  ['globals', /enhanceShopCards|updateManualMark|refreshCardDisplay|getTotalPurchased|findRowByListingId|__wvpdState/],
  ['api', /WVPurchaseDetail|wv-purchase-detail/],
  ['badge', /badge--(success|warning|info|infinite)|class="badge\b|class=\\?'badge\b|\.badge\b/],
  ['tip', /data-tip/],
  ['oldcard', /wv-counter-placeholder|wv:shop:rendered|wvpd_open|wvpd_icon_url/]
];
for (const [tag, re] of PATS) {
  console.log('\n## ' + tag);
  for (const f of files) {
    if (f === 'js/wv-purchase-detail.js' || f.endsWith('probe-cam5.smoke.cjs')) continue;
    const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
    const hits = [];
    lines.forEach((l, i) => { if (re.test(l)) hits.push(i + 1); });
    if (!hits.length) continue;
    const first = hits.slice(0, 3).map((n) => n + ': ' + lines[n - 1].trim().slice(0, 110));
    console.log(f + ' (' + hits.length + ')\n  ' + first.join('\n  '));
  }
}
