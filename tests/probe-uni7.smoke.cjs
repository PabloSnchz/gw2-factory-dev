// BL-078 UNI-7: ¿la wiki ya sirve las imágenes de Chak y de Dragon's End? Sonda temporal (se borra después).
// Solo lee: no guarda nada en el repo. Corre con RUN-NNN desde factory-diagnose.
'use strict';
const { test } = require('node:test');

const URLS = [
  ['chak', 'https://wiki.guildwars2.com/images/a/ae/Chak_Animation_8.gif'],
  ['dragons_end', 'https://wiki.guildwars2.com/images/2/29/Echo_of_the_Dragonvoid_infusion.jpg'],
  ['wiki_api', 'https://wiki.guildwars2.com/api.php?action=query&titles=File:Chak_Animation_8.gif&prop=imageinfo&iiprop=url|size|mime&format=json'],
  ['archive', 'https://web.archive.org/web/2024id_/https://wiki.guildwars2.com/images/a/ae/Chak_Animation_8.gif']
];
const HEAD = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', Accept: '*/*' };

test('wiki: estado de las imágenes', async () => {
  for (const [k, u] of URLS) {
    try {
      const r = await fetch(u, { headers: HEAD, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get('content-type') || '-';
      const head = /json|text/.test(ct) ? buf.toString('utf8').slice(0, 400).replace(/\s+/g, ' ') : buf.subarray(0, 6).toString('latin1');
      console.log([k, r.status, ct, buf.length, r.url, head].join('|'));
    } catch (e) {
      console.log([k, 'ERROR', String(e && e.message)].join('|'));
    }
  }
});
