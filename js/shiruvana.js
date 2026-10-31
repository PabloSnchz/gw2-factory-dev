/*!
 * js/shiruvana.js — Mi voz en La Bóveda (DEC-025, DEC-024)
 * Versión: 1.1.0
 *
 * 1.1.0 (BL-059 SHV-1): opción `basis` → línea «Lo sé por: …», el fundamento de lo que digo (DEC-033).
 * 2026-10-31 (BL-085, DEC-048): mi cara nueva, la figura ilustrada oficial. Solo cambia la imagen; la API es la misma.
 *
 * Soy Shiruvana. Aparezco solo cuando le hablo al jugador: bienvenida, API Keys,
 * guías y ayuda, errores que puede resolver y avisos sobre sus datos.
 * Nunca en saldos, tablas, listas, filtros, la cabecera ni la navegación.
 *
 * Reglas:
 *  - Un avatar por modal o sección: el primer mensaje lo lleva; los siguientes, `avatar: false`.
 *  - Los colores salen del theme activo (variables CSS), así me veo bien en todos, también en los claros.
 *  - El texto se inserta como texto, nunca como HTML: no hay forma de inyectar marcado.
 *  - El avatar es decorativo (alt vacío): quién habla lo dice el rótulo visible "Shiruvana".
 *
 * Uso:
 *   var el = Shiruvana.voice({ kind: 'explica', text: ['Párrafo 1', 'Párrafo 2'] });
 *   contenedor.prepend(el);
 */
(function (root) {
  'use strict';

  /** Avatar oficial (DEC-048): cara de shiruvana-hola, 112 px, WebP, el mismo que el panel (gds/voice.js). */
  var AVATAR = 'data:image/webp;base64,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';

  /** Tipo de mensaje → rótulo visible. */
  var KINDS = {
    saluda:     { label: 'Shiruvana' },
    explica:    { label: 'Shiruvana te explica' },
    recomienda: { label: 'Shiruvana te recomienda' },
    advierte:   { label: 'Shiruvana te avisa' }
  };

  var STYLE_ID = 'shiruvana-voice-css';
  var CSS = [
    '.shv-voice{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;',
    'padding:12px 16px;margin:0 0 14px 0;border-radius:var(--radius-md,12px);',
    'background:var(--bg-1,var(--panel));color:var(--text);',
    'border:1px solid var(--bd-1,var(--panel-border));border-left:4px solid var(--acc-1);}',
    '.shv-voice--compact{grid-template-columns:minmax(0,1fr);}',
    '.shv-voice__avatar{display:block;width:48px;height:48px;object-fit:cover;border-radius:50%;',
    'box-shadow:0 0 0 2px var(--acc-1);}',
    '.shv-voice--lg .shv-voice__avatar{width:56px;height:56px;}',
    '.shv-voice__main{min-width:0;display:grid;gap:4px;}',
    '.shv-voice__label{margin:0;font-weight:700;font-size:0.85rem;color:var(--text);letter-spacing:0.2px;}',
    '.shv-voice__body p{margin:0 0 6px 0;font-size:0.9rem;line-height:1.5;color:var(--tx-2,var(--text));}',
    '.shv-voice__body p:last-child{margin-bottom:0;}',
    '.shv-voice__basis{margin:6px 0 0 0;font-size:0.78rem;line-height:1.4;color:var(--tx-2,var(--text));}',
    '.shv-voice--recomienda{border-left-color:var(--color-green,var(--acc-1));}',
    '.shv-voice--recomienda .shv-voice__avatar{box-shadow:0 0 0 2px var(--color-green,var(--acc-1));}',
    '.shv-voice--advierte{border-left-color:var(--acc-warn,var(--acc-1));}',
    '.shv-voice--advierte .shv-voice__avatar{box-shadow:0 0 0 2px var(--acc-warn,var(--acc-1));}',
    '@media (max-width:480px){.shv-voice__avatar{width:40px;height:40px;}',
    '.shv-voice--lg .shv-voice__avatar{width:48px;height:48px;}}'
  ].join('');

  function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(style);
  }

  /**
   * Un mensaje mío.
   * @param {object} o
   * @param {'saluda'|'explica'|'recomienda'|'advierte'} o.kind
   * @param {string|string[]} o.text  uno o más párrafos, texto plano
   * @param {boolean} [o.avatar=true] false para el segundo mensaje y siguientes de una misma sección
   * @param {'md'|'lg'} [o.size='md'] 48 o 56 px
   * @param {string} [o.basis] de dónde lo sé y cuándo; se muestra como «Lo sé por: …», texto plano
   * @param {Document} [o.doc]
   * @returns {HTMLElement}
   */
  function voice(o) {
    o = o || {};
    var doc = o.doc || root.document;
    ensureStyle(doc);
    var kind = KINDS[o.kind] ? o.kind : 'explica';
    var withAvatar = o.avatar !== false;
    var paragraphs = Array.isArray(o.text) ? o.text : [o.text == null ? '' : o.text];

    var box = doc.createElement('aside');
    box.className = 'shv-voice shv-voice--' + kind + (withAvatar ? '' : ' shv-voice--compact') + (o.size === 'lg' ? ' shv-voice--lg' : '');
    box.setAttribute('data-voice', kind);
    box.setAttribute('aria-label', KINDS[kind].label);

    if (withAvatar) {
      var img = doc.createElement('img');
      img.className = 'shv-voice__avatar';
      img.src = AVATAR;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.width = o.size === 'lg' ? 56 : 48;
      img.height = img.width;
      img.decoding = 'async';
      box.appendChild(img);
    }

    var main = doc.createElement('div');
    main.className = 'shv-voice__main';
    var label = doc.createElement('p');
    label.className = 'shv-voice__label';
    label.textContent = KINDS[kind].label;
    main.appendChild(label);
    var body = doc.createElement('div');
    body.className = 'shv-voice__body';
    paragraphs.forEach(function (t) {
      var p = doc.createElement('p');
      p.textContent = String(t);
      body.appendChild(p);
    });
    main.appendChild(body);
    if (o.basis) {
      var basis = doc.createElement('p');
      basis.className = 'shv-voice__basis';
      basis.textContent = 'Lo sé por: ' + String(o.basis);
      main.appendChild(basis);
    }
    box.appendChild(main);
    return box;
  }

  root.Shiruvana = { voice: voice, KINDS: KINDS, AVATAR: AVATAR, CSS: CSS, version: '1.1.0' };

})(typeof window !== 'undefined' ? window : globalThis);
