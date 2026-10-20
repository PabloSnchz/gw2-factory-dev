'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const run = require('./decision-response.cjs');
const { parseIssueBody, validate, nextResponseId, buildResponseMarkdown, parseRequestFile, MARKER } = run;

/* Textos dorados: idénticos en gw2-factory-dashboard/tests/respond.test.mjs. */
const GOLDEN_ISSUE_BODY = `<!-- gds:decision-response v1 -->
**Respuesta de Pablo** desde el Centro de Decisiones.

Pedido: REQ-002 — Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV
Respuesta: Hecha

\`\`\`gds-response
solicitud: REQ-002
respuesta: DONE
opcion: —
hasta: —
\`\`\`

### Comentario

_Escribí acá si querés agregar algo (opcional)._
`;
const GOLDEN_RESP_INPUT = {
  id: 'RESP-007', solicitud: 'REQ-002', respuesta: 'DONE', opcion: null, fecha: '2026-10-20T03:50Z',
  issue: 'https://github.com/PabloSnchz/gw2-factory-dev/issues/12', autor: 'PabloSnchz', comentario: 'Listo: https://gw2-factory-dev.vercel.app',
};
const GOLDEN_RESP = `# RESP-007 — Hecha: REQ-002

- Estado: PENDIENTE
- Fecha: 2026-10-20T03:50Z
- Solicitud: REQ-002
- Respuesta: DONE
- Opción: —
- Issue: https://github.com/PabloSnchz/gw2-factory-dev/issues/12
- Autor: PabloSnchz

## Comentario

Listo: https://gw2-factory-dev.vercel.app
`;

const REQ_002 = `# REQ-002 — Publicar la versión de prueba en Vercel y apagar GitHub Pages en DEV

- Estado: ABIERTA
- Tipo: acción
- Fecha: 2026-10-20

## Qué pasó

x
`;
const REQ_010 = `# REQ-010 — ¿Dónde?

- Estado: ABIERTA
- Tipo: decisión

## Opciones

- A — Uno.
- B — Dos.

## Recomendación

B — Simple.
`;

test('lee el cuerpo dorado que arma el panel', () => {
  assert.deepEqual(parseIssueBody(GOLDEN_ISSUE_BODY), { solicitud: 'REQ-002', respuesta: 'DONE', opcion: null, hasta: null, comentario: '' });
  const withComment = GOLDEN_ISSUE_BODY.replace('_Escribí acá si querés agregar algo (opcional)._', 'Listo.\nURL: https://x.vercel.app');
  assert.equal(parseIssueBody(withComment).comentario, 'Listo.\nURL: https://x.vercel.app');
  assert.ok(parseIssueBody('hola').error);
  assert.ok(parseIssueBody(MARKER + '\nsin bloque').error);
});

test('escribe exactamente el archivo dorado (espejo del panel)', () => {
  assert.equal(buildResponseMarkdown(GOLDEN_RESP_INPUT), GOLDEN_RESP);
  assert.throws(() => buildResponseMarkdown({ ...GOLDEN_RESP_INPUT, respuesta: 'MAYBE' }));
  const inj = buildResponseMarkdown({ ...GOLDEN_RESP_INPUT, autor: 'x\n- Estado: PROCESADA' });
  assert.equal((inj.match(/^- Estado:/gm) || []).length, 1, 'un salto de línea no puede inyectar metadatos');
});

test('valida en lenguaje de Pablo', () => {
  const ok = { solicitud: 'REQ-002', respuesta: 'DONE', opcion: null, hasta: null };
  assert.deepEqual(validate(ok, '2026-10-20'), []);
  assert.ok(validate({ ...ok, solicitud: 'BL-003' }, '2026-10-20').length);
  assert.ok(validate({ ...ok, respuesta: 'TALVEZ' }, '2026-10-20').length);
  assert.ok(validate({ ...ok, opcion: 'AB' }, '2026-10-20').length);
  assert.ok(validate({ ...ok, respuesta: 'POSTPONED' }, '2026-10-20').length, 'posponer necesita fecha');
  assert.ok(validate({ ...ok, respuesta: 'POSTPONED', hasta: '2026-10-19' }, '2026-10-20').length, 'fecha pasada');
  assert.deepEqual(validate({ ...ok, respuesta: 'POSTPONED', hasta: '2026-10-27' }, '2026-10-20'), []);
  assert.ok(validate({ ...ok, hasta: '2026-10-27' }, '2026-10-20').length, '"hasta" solo al posponer');
});

test('numeración y pedidos', () => {
  assert.equal(nextResponseId([]), 'RESP-001');
  assert.equal(nextResponseId(['README.md', 'RESP-001.md', 'RESP-009.md']), 'RESP-010');
  assert.deepEqual(parseRequestFile(REQ_010), { titulo: '¿Dónde?', estado: 'ABIERTA', tipo: 'decisión', opciones: ['A', 'B'] });
});

/* ------------------------------------------------------------ run() con GitHub simulado */

function fakeGitHub({ files = {}, issue = {}, conflictOnce = false } = {}) {
  const calls = { comments: [], writes: [], updates: [] };
  let conflicted = false;
  const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
  const err = (status) => Object.assign(new Error('HTTP ' + status), { status });
  const github = {
    rest: {
      issues: {
        get: async () => ({ data: { number: 12, state: 'open', html_url: 'https://github.com/PabloSnchz/gw2-factory-dev/issues/12', created_at: '2026-10-20T03:50:41Z', user: { login: 'PabloSnchz' }, body: GOLDEN_ISSUE_BODY, ...issue } }),
        createComment: async (p) => { calls.comments.push(p.body); return { data: {} }; },
        update: async (p) => { calls.updates.push(p); return { data: {} }; },
      },
      repos: {
        get: async () => ({ data: { default_branch: 'main' } }),
        getContent: async ({ path }) => {
          if (files[path] != null) return { data: { content: b64(files[path]), encoding: 'base64' } };
          const children = Object.keys(files).filter(p => p.startsWith(path + '/')).map(p => ({ type: 'file', name: p.slice(path.length + 1) }));
          if (children.length) return { data: children };
          throw err(404);
        },
        createOrUpdateFileContents: async (p) => {
          if (conflictOnce && !conflicted) { conflicted = true; files[p.path] = 'otro'; throw err(422); }
          files[p.path] = Buffer.from(p.content, 'base64').toString('utf8');
          calls.writes.push(p);
          return { data: { content: { html_url: 'https://github.com/x/blob/main/' + p.path } } };
        },
      },
    },
  };
  const context = { repo: { owner: 'PabloSnchz', repo: 'gw2-factory-dev' }, payload: { issue: { number: 12 } } };
  const core = { info: () => {}, failed: null, setFailed(m) { this.failed = m; } };
  return { github, context, core, calls, files };
}

const baseFiles = () => ({
  'ai-memory/requests/REQ-002-dev-en-vercel.md': REQ_002,
  'ai-memory/requests/REQ-010-x.md': REQ_010,
  'ai-memory/responses/README.md': '# Respuestas',
  'ai-memory/responses/RESP-001.md': '# RESP-001 — x',
});

test('camino feliz: escribe RESP-002, comenta y cierra el issue', async () => {
  const f = fakeGitHub({ files: baseFiles() });
  const out = await run(f);
  assert.equal(out.ok, true);
  assert.equal(out.id, 'RESP-002');
  const md = f.files['ai-memory/responses/RESP-002.md'];
  assert.equal(md, buildResponseMarkdown({ ...GOLDEN_RESP_INPUT, id: 'RESP-002', comentario: '', fecha: '2026-10-20T03:50Z' }));
  assert.match(f.calls.writes[0].message, /^docs\(ai-memory\): RESP-002 — Hecha REQ-002 \(issue #12\)$/);
  assert.match(f.calls.comments[0], /Registrado como \*\*RESP-002\*\*/);
  assert.deepEqual(f.calls.updates[0].state, 'closed');
  assert.equal(f.core.failed, null);
});

test('carrera: si el número ya existe, usa el siguiente', async () => {
  const f = fakeGitHub({ files: baseFiles(), conflictOnce: true });
  const out = await run(f);
  assert.equal(out.id, 'RESP-003');
});

test('errores: pedido inexistente, cerrado u opción inválida → comenta, no escribe, deja el issue abierto', async () => {
  const cases = [
    [GOLDEN_ISSUE_BODY.replace(/REQ-002/g, 'REQ-099'), /No existe el pedido REQ-099/],
    [GOLDEN_ISSUE_BODY.replace('respuesta: DONE', 'respuesta: APPROVED').replace('opcion: —', 'opcion: Z').replace(/REQ-002/g, 'REQ-010'), /no tiene la opción Z/],
    [GOLDEN_ISSUE_BODY.replace('opcion: —', 'opcion: A'), /no tiene opciones/],
    ['texto libre sin marca', /marca del Centro de Decisiones/],
  ];
  for (const [body, re] of cases) {
    const f = fakeGitHub({ files: baseFiles(), issue: { body } });
    const out = await run(f);
    assert.equal(out.ok, false);
    assert.match(f.calls.comments[0], re);
    assert.equal(f.calls.writes.length, 0);
    assert.equal(f.calls.updates.length, 0);
    assert.ok(f.core.failed);
  }
  const closed = baseFiles();
  closed['ai-memory/requests/REQ-002-dev-en-vercel.md'] = REQ_002.replace('ABIERTA', 'CERRADA');
  const f = fakeGitHub({ files: closed });
  await run(f);
  assert.match(f.calls.comments[0], /ya está CERRADA/);
});

test('seguridad e idempotencia: ignora issues de otros y los ya cerrados', async () => {
  for (const issue of [{ user: { login: 'alguien' } }, { state: 'closed' }]) {
    const f = fakeGitHub({ files: baseFiles(), issue });
    const out = await run(f);
    assert.equal(out.skipped, true);
    assert.equal(f.calls.writes.length + f.calls.comments.length + f.calls.updates.length, 0);
  }
});

test('posponer: guarda la fecha', async () => {
  const body = GOLDEN_ISSUE_BODY.replace('respuesta: DONE', 'respuesta: POSTPONED').replace('hasta: —', 'hasta: 2099-01-01');
  const f = fakeGitHub({ files: baseFiles(), issue: { body } });
  const out = await run(f);
  assert.equal(out.ok, true);
  assert.match(f.files['ai-memory/responses/RESP-002.md'], /- Respuesta: POSTPONED\n- Opción: —\n- Hasta: 2099-01-01\n/);
});
