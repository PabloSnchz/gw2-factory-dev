// BL-076 SHV-5 (DEC-033): cuando hablo de tus datos, digo de dónde lo sé.
// Toda llamada a mi voz (.voice) fuera de mis archivos de base lleva «basis», y toda llamada a mi globo (.speak)
// lleva «source». PENDIENTES es la lista exacta de lo que todavía falta: solo puede achicarse. Si un archivo nuevo
// habla sin fundamento, o uno de la lista se arregla y no se lo saca, la suite falla.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const JS = path.join(__dirname, '..', 'js');

// Exentos, con su motivo:
//  - shiruvana.js define la voz (el ejemplo de uso está en un comentario).
//  - shiruvana-places.js: textos fijos de ayuda (modal de Keys, guías, saludo y mi rincón), no observaciones sobre
//    tus datos. «Shiruvana te guía», que sí lo es, ya dice de dónde lo sé (tests/shiruvana-places.test.cjs).
const EXENTOS = { 'shiruvana.js': 'define la voz', 'shiruvana-places.js': 'textos fijos de ayuda' };

// SHV-5b (hecho): Logros, Inventario, Heredad · SHV-5c (hecho): Actividades y Cuentas · SHV-5d (hecho): Cámara, Metas y el Conversor. Desde acá, nadie habla sin decir de dónde lo sabe.
const PENDIENTES = [];

/** Cada llamada a .name( con sus argumentos completos (paréntesis anidados incluidos). */
function calls(src, name) {
  const out = [], re = new RegExp('\\.' + name + '\\(', 'g');
  let m;
  while ((m = re.exec(src))) {
    let d = 0, j = m.index + name.length + 1;
    for (; j < src.length; j++) { if (src[j] === '(') d++; else if (src[j] === ')' && !--d) break; }
    out.push(src.slice(m.index, j + 1));
  }
  return out;
}
function faltan(src) {
  return calls(src, 'voice').filter((c) => !/\bbasis\s*:/.test(c)).length +
    calls(src, 'speak').filter((c) => !/\bsource\s*:/.test(c)).length;
}
const FILES = fs.readdirSync(JS).filter((f) => f.endsWith('.js') && !EXENTOS[f]).sort();
const read = (f) => fs.readFileSync(path.join(JS, f), 'utf8');

test('cuando hablo, digo de dónde lo sé: la lista de pendientes es exacta y solo se achica', () => {
  const sin = FILES.filter((f) => faltan(read(f)) > 0);
  assert.deepEqual(sin, PENDIENTES);
});

test('el detector ve lo que tiene que ver', () => {
  assert.equal(faltan("S.voice({ kind: 'explica', text: t })"), 1);
  assert.equal(faltan("S.voice({ kind: 'explica', text: t, basis: b })"), 0);
  assert.equal(faltan("S.voice({ kind: k, text: f(a, (b)) })"), 1, 'paréntesis anidados');
  assert.equal(faltan("S.voice({ kind: k, text: f(a, (b)), basis: x })"), 0);
  assert.equal(faltan("B.speak(box, msg, { module: 'm', key: k })"), 1);
  assert.equal(faltan("B.speak(box, msg, { module: 'm', source: 's' })"), 0);
  assert.equal(faltan("if (typeof S.voice === 'function') x();"), 0, 'mirar si existe no es hablar');
  assert.equal(faltan("S.voice({ text: 'a' }); S.voice({ text: 'b', basis: c })"), 1, 'cuenta cada llamada');
});

test('Raids habla con los 4 tipos de DEC-024; los exentos y los pendientes existen', () => {
  assert.doesNotMatch(read('raids-sheet.js'), /kind: '(success|hint)'/);
  Object.keys(EXENTOS).forEach((f) => assert.ok(fs.existsSync(path.join(JS, f)), f));
  PENDIENTES.forEach((f) => assert.ok(FILES.includes(f), f + ' existe'));
  assert.equal(new Set(PENDIENTES).size, PENDIENTES.length);
});

// D3 de SHV-5: la hora del dato solo si es real; si no, «en este navegador». Nunca una hora inventada.
test('D3: las líneas fijas dicen «en este navegador» y no inventan hora; Cuentas y Metas, como corresponde', () => {
  let fijas = 0;
  FILES.forEach((f) => {
    calls(read(f), 'voice').forEach((c) => {
      const m = c.match(/\bbasis\s*:\s*'([^']*)'/);
      if (!m) return;
      fijas++;
      assert.match(m[1], / · en este navegador$/, f + ': ' + m[1]);
      assert.doesNotMatch(m[1], /\d{1,2}:\d{2}/, f + ': sin hora inventada');
    });
  });
  assert.ok(fijas >= 8, 'leí las líneas fijas (' + fijas + ')');
  const acc = read('acc-view.js'), mt = read('meta-theme.js');
  assert.match(acc, /at: st\.readAt \|\| null/, 'Cuentas usa la hora real de su lectura');
  assert.match(acc, /C\.basisText\(b\)/);
  assert.match(mt, /todayStats\(S\.snap\)\.state === 'ok' \?/, 'Metas nombra tu día solo si la API respondió');
  assert.match(mt, /insertBefore\(btn, bs\)/, 'el waypoint va antes de «Lo sé por»');
});
