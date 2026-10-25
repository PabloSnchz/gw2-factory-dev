// Sonda temporal de BL-070 ACT-4 (se borra después de RUN-060). Solo lee la API pública y escribe lo que ve.
'use strict';
const test = require('node:test');
const API = 'https://api.guildwars2.com';
const get = (p) => fetch(API + p).then((r) => (r.ok ? r.json() : { status: r.status }));

test('sonda ACT-4', async (t) => {
  const [aEn, aEs, qEs, prof, cur, item, races] = await Promise.all([
    get('/v2/backstory/answers?ids=all&lang=en'), get('/v2/backstory/answers?ids=all&lang=es'), get('/v2/backstory/questions?ids=all&lang=es'),
    get('/v2/professions?ids=Elementalist,Guardian,Warrior,Revenant,Thief&lang=es'), get('/v2/currencies?ids=1,2,68,66,28&lang=es'),
    get('/v2/items?ids=19980&lang=es'), get('/v2/races?ids=all&lang=es')]);
  const es = {};
  (Array.isArray(aEs) ? aEs : []).forEach((a) => { es[a.id] = a; });
  const human = (Array.isArray(aEn) ? aEn : []).filter((a) => (a.races || []).length === 1 && a.races[0] === 'Human' && /Commoner|Nobility|Street Rat/i.test(a.title));
  human.forEach((a) => t.diagnostic('ANSWER ' + JSON.stringify({ id: a.id, en: a.title, es: es[a.id] && es[a.id].title, question: a.question, professions: a.professions })));
  const qids = [...new Set(human.map((a) => a.question))];
  (Array.isArray(qEs) ? qEs : []).filter((q) => qids.includes(q.id)).forEach((q) => t.diagnostic('QUESTION ' + JSON.stringify({ id: q.id, title: q.title, answers: q.answers, order: q.order, races: q.races })));
  (Array.isArray(prof) ? prof : []).forEach((p) => t.diagnostic('PROF ' + JSON.stringify({ id: p.id, name: p.name, icon: p.icon, icon_big: p.icon_big })));
  (Array.isArray(cur) ? cur : []).forEach((c) => t.diagnostic('CUR ' + JSON.stringify({ id: c.id, name: c.name, icon: c.icon })));
  (Array.isArray(item) ? item : []).forEach((i) => t.diagnostic('ITEM ' + JSON.stringify({ id: i.id, name: i.name, icon: i.icon })));
  (Array.isArray(races) ? races : []).forEach((r) => t.diagnostic('RACE ' + JSON.stringify({ id: r.id, name: r.name })));
});
