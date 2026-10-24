// Sonda temporal de BL-070 RAI-3: qué vía de lectura de la wiki oficial responde desde CI.
// Solo lectura. Se borra al terminar RAI-3.
'use strict';
const T = encodeURIComponent("Greer's Coffer");
const URLS = [
  'https://wiki-en.guildwars2.com/api.php?action=parse&prop=wikitext&format=json&formatversion=2&redirects=1&page=' + T,
  'https://wiki-en.guildwars2.com/index.php?action=raw&title=' + T,
  'https://wiki.guildwars2.com/index.php?action=raw&title=' + T,
  'https://wiki.guildwars2.com/wiki/Special:Export/' + T,
  'https://wiki.guildwars2.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&titles=' + T,
];
const UAS = ['gw2-factory-dev/1.0 (https://github.com/PabloSnchz/gw2-factory-dev; read-only probe)',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'];

(async () => {
  for (const u of URLS) {
    for (const ua of UAS) {
      try {
        const r = await fetch(u, { headers: { 'User-Agent': ua, Accept: 'application/json,text/plain,*/*' }, signal: AbortSignal.timeout(20000) });
        const t = await r.text();
        console.log(r.status + ' | ' + (ua[0] === 'g' ? 'ua-bot' : 'ua-browser') + ' | ' + u.slice(0, 70) + ' | ' + (r.headers.get('content-type') || '') + ' | ' + t.length + ' B | ' + t.slice(0, 160).replace(/\s+/g, ' '));
      } catch (e) { console.log('ERR | ' + u.slice(0, 70) + ' | ' + e.message); }
    }
  }
})();
