/**
 * .github/scripts/decision-response.cjs — Canal de respuesta del Centro de Decisiones (DEC-012).
 *
 * Pablo toca "Aprobar / Rechazar / Posponer / Ya lo hice" en el panel → se abre un issue
 * prellenado en este repo → al enviarlo, este script (vía .github/workflows/decision-response.yml):
 *   1. valida la respuesta y el pedido (requests/REQ-XXX),
 *   2. escribe ai-memory/responses/RESP-XXX.md con el formato de DEC-011,
 *   3. comenta el resultado en el issue y lo cierra.
 * Si algo no es válido, comenta qué corregir y deja el issue abierto (editarlo lo reintenta).
 *
 * Formato espejo de gw2-factory-dashboard/js/decisions.js (buildResponseMarkdown) y
 * js/respond.js (buildIssueBody). Los tests de ambos repos comparan contra el mismo texto dorado.
 */
'use strict';

const MARKER = '<!-- gds:decision-response v1 -->';
const RESPONSES = { APPROVED: 'Aprobada', REJECTED: 'Rechazada', POSTPONED: 'Pospuesta', DONE: 'Hecha' };
const REQUESTS_DIR = 'ai-memory/requests';
const RESPONSES_DIR = 'ai-memory/responses';
const PLACEHOLDER = /^_?Escrib[ií] ac[aá] si quer[eé]s agregar algo \(opcional\)\._?$/i;

const one = (v) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim();
const pad3 = (n) => String(n).padStart(3, '0');

/** Lee el cuerpo del issue que arma el panel. Devuelve { solicitud, respuesta, opcion, hasta, comentario } o { error }. */
function parseIssueBody(body) {
  const text = String(body || '').replace(/\r\n?/g, '\n');
  if (!text.includes(MARKER)) return { error: 'El issue no tiene la marca del Centro de Decisiones.' };
  const block = text.match(/```gds-response\n([\s\S]*?)\n```/);
  if (!block) return { error: 'Falta el bloque `gds-response` con los datos de la respuesta.' };
  const kv = {};
  for (const line of block[1].split('\n')) {
    const m = line.match(/^\s*([a-záéíóú]+)\s*:\s*(.*?)\s*$/i);
    if (m) kv[m[1].toLowerCase()] = m[2];
  }
  const comentarioMatch = text.match(/\n###\s+Comentario\s*\n([\s\S]*)$/);
  const comentario = comentarioMatch
    ? comentarioMatch[1].split('\n').filter(l => !PLACEHOLDER.test(l.trim())).join('\n').trim()
    : '';
  const clean = (v) => (v == null || v === '' || v === '—' || v === '-' ? null : v);
  return {
    solicitud: clean(kv.solicitud),
    respuesta: clean(kv.respuesta) ? kv.respuesta.toUpperCase() : null,
    opcion: clean(kv.opcion || kv['opción']),
    hasta: clean(kv.hasta),
    comentario,
  };
}

/** Problemas de una respuesta, en lenguaje de Pablo. `today` = 'AAAA-MM-DD'. */
function validate(p, today) {
  const problems = [];
  if (!p.solicitud || !/^REQ-\d{3}$/.test(p.solicitud)) problems.push('"solicitud" debe ser un pedido con la forma REQ-XXX.');
  if (!RESPONSES[p.respuesta]) problems.push('"respuesta" debe ser APPROVED, REJECTED, POSTPONED o DONE.');
  if (p.opcion && !/^[A-Z]$/.test(p.opcion)) problems.push('"opcion" debe ser una letra (A, B, C…) o quedar vacía.');
  if (p.respuesta === 'POSTPONED') {
    if (!p.hasta || !/^\d{4}-\d{2}-\d{2}$/.test(p.hasta) || isNaN(Date.parse(p.hasta + 'T00:00:00Z'))) problems.push('Para posponer, "hasta" debe ser una fecha AAAA-MM-DD.');
    else if (today && p.hasta <= today) problems.push('La fecha de "hasta" tiene que ser posterior a hoy.');
  } else if (p.hasta) {
    problems.push('"hasta" solo se usa al posponer.');
  }
  return problems;
}

/** Datos mínimos de un pedido: estado, tipo y letras de opciones. */
function parseRequestFile(md) {
  const text = String(md || '').replace(/\r\n?/g, '\n');
  const meta = (k) => { const m = text.match(new RegExp('^\\s*-\\s+' + k + ':\\s*(.*)$', 'mi')); return m ? m[1].trim() : null; };
  const titulo = (text.match(/^#\s+REQ-\d{3}\s*[—-]\s*(.*)$/m) || [])[1] || '';
  const opcionesBlock = (text.match(/\n##\s+Opciones\s*\n([\s\S]*?)(\n##\s|$)/) || [])[1] || '';
  const opciones = [...opcionesBlock.matchAll(/^\s*[-*]\s+([A-Z])\s+[—-]\s+/gm)].map(m => m[1]);
  return { titulo: titulo.trim(), estado: (meta('Estado') || '').toUpperCase().split(/\s/)[0], tipo: (meta('Tipo') || '').toLowerCase(), opciones };
}

/** Siguiente RESP-XXX libre a partir de los nombres existentes en responses/. */
function nextResponseId(names) {
  const nums = names.map(n => (n.match(/^RESP-(\d{3,})/) || [])[1]).filter(Boolean).map(Number);
  return 'RESP-' + pad3((nums.length ? Math.max(...nums) : 0) + 1);
}

/** Espejo exacto de buildResponseMarkdown (gw2-factory-dashboard/js/decisions.js). */
function buildResponseMarkdown(r) {
  const code = r.respuesta;
  if (!RESPONSES[code]) throw new Error('Respuesta inválida: ' + code);
  const lines = [
    `# ${r.id} — ${RESPONSES[code]}: ${r.solicitud}`,
    '',
    `- Estado: PENDIENTE`,
    `- Fecha: ${one(r.fecha)}`,
    `- Solicitud: ${r.solicitud}`,
    `- Respuesta: ${code}`,
    `- Opción: ${r.opcion ? one(r.opcion) : '—'}`,
  ];
  if (code === 'POSTPONED') lines.push(`- Hasta: ${one(r.hasta)}`);
  if (r.issue) lines.push(`- Issue: ${one(r.issue)}`);
  if (r.autor) lines.push(`- Autor: ${one(r.autor)}`);
  lines.push('', '## Comentario', '', (String(r.comentario || '').trim() || '—'), '');
  return lines.join('\n');
}

/** ISO del issue → 'AAAA-MM-DDTHH:MMZ'. */
const isoMinute = (iso) => new Date(iso).toISOString().slice(0, 16) + 'Z';

async function listNames(github, owner, repo, path, ref) {
  try {
    const { data } = await github.rest.repos.getContent({ owner, repo, path, ref });
    return Array.isArray(data) ? data.filter(x => x.type === 'file').map(x => x.name) : [];
  } catch (e) {
    if (e.status === 404) return [];
    throw e;
  }
}

async function readFile(github, owner, repo, path, ref) {
  const { data } = await github.rest.repos.getContent({ owner, repo, path, ref });
  return Buffer.from(data.content, data.encoding || 'base64').toString('utf8');
}

/** Punto de entrada para actions/github-script. */
async function run({ github, context, core }) {
  const { owner, repo } = context.repo;
  const number = context.payload.issue.number;
  const say = (body) => github.rest.issues.createComment({ owner, repo, issue_number: number, body });

  // Se vuelve a leer el issue: otra ejecución (edición) puede haberlo procesado y cerrado.
  const { data: issue } = await github.rest.issues.get({ owner, repo, issue_number: number });
  if (issue.state !== 'open') { core.info('Issue ya cerrado: nada que hacer.'); return { skipped: true }; }
  if (issue.user.login.toLowerCase() !== owner.toLowerCase()) { core.info('Solo se aceptan respuestas del dueño del repositorio.'); return { skipped: true }; }

  const parsed = parseIssueBody(issue.body);
  const today = new Date().toISOString().slice(0, 10);
  const problems = parsed.error ? [parsed.error] : validate(parsed, today);

  const { data: repoInfo } = await github.rest.repos.get({ owner, repo });
  const ref = repoInfo.default_branch;

  let req = null;
  if (!problems.length) {
    const names = await listNames(github, owner, repo, REQUESTS_DIR, ref);
    const file = names.find(n => n === parsed.solicitud + '.md' || n.startsWith(parsed.solicitud + '-'));
    if (!file) problems.push(`No existe el pedido ${parsed.solicitud} en ${REQUESTS_DIR}/.`);
    else {
      req = parseRequestFile(await readFile(github, owner, repo, `${REQUESTS_DIR}/${file}`, ref));
      if (req.estado !== 'ABIERTA') problems.push(`El pedido ${parsed.solicitud} ya está ${req.estado || 'sin estado'}: no admite respuestas.`);
      if (parsed.opcion && req.opciones.length && !req.opciones.includes(parsed.opcion)) problems.push(`El pedido ${parsed.solicitud} no tiene la opción ${parsed.opcion} (opciones: ${req.opciones.join(', ')}).`);
      if (parsed.opcion && !req.opciones.length) problems.push(`El pedido ${parsed.solicitud} no tiene opciones: dejá "opcion" vacía.`);
    }
  }

  if (problems.length) {
    await say(['No pude registrar esta respuesta:', '', ...problems.map(p => '- ' + p), '', 'Corregí el texto del issue (Edit) y se vuelve a intentar sola.'].join('\n'));
    core.setFailed(problems.join(' '));
    return { ok: false, problems };
  }

  // Escribe la respuesta. Si el número ya existe (carrera), prueba el siguiente.
  for (let attempt = 0; attempt < 3; attempt++) {
    const names = await listNames(github, owner, repo, RESPONSES_DIR, ref);
    const id = nextResponseId(names);
    const md = buildResponseMarkdown({
      id, solicitud: parsed.solicitud, respuesta: parsed.respuesta, opcion: parsed.opcion, hasta: parsed.hasta,
      fecha: isoMinute(issue.created_at), issue: issue.html_url, autor: issue.user.login, comentario: parsed.comentario,
    });
    const path = `${RESPONSES_DIR}/${id}.md`;
    try {
      const { data } = await github.rest.repos.createOrUpdateFileContents({
        owner, repo, path, branch: ref,
        message: `docs(ai-memory): ${id} — ${RESPONSES[parsed.respuesta]} ${parsed.solicitud} (issue #${number})`,
        content: Buffer.from(md, 'utf8').toString('base64'),
      });
      const url = data && data.content ? data.content.html_url : `https://github.com/${owner}/${repo}/blob/${ref}/${path}`;
      await say([
        `Registrado como **${id}** (${RESPONSES[parsed.respuesta].toLowerCase()} · ${parsed.solicitud}${req && req.titulo ? ' — ' + req.titulo : ''}).`,
        '',
        `Archivo: ${url}`,
        '',
        'La Factory lo procesa al iniciar su próxima sesión. En el panel ya figura como respondido (tocá Refrescar).',
      ].join('\n'));
      await github.rest.issues.update({ owner, repo, issue_number: number, state: 'closed', state_reason: 'completed' });
      return { ok: true, id, path };
    } catch (e) {
      if (e.status === 422 || e.status === 409) continue;
      throw e;
    }
  }
  core.setFailed('No se encontró un número de respuesta libre.');
  return { ok: false };
}

module.exports = run;
Object.assign(module.exports, { MARKER, RESPONSES, parseIssueBody, validate, parseRequestFile, nextResponseId, buildResponseMarkdown, isoMinute, run });
