/*!
 * js/acc-vault-import.js — Importar el Llavero desde Excel, sin archivos en claro (BL-070, paso 4, CTA-4b)
 * Proyecto: Bóveda del Gato Negro
 * Versión: 1.0.0 (2026-10-26)
 *
 * Reemplaza el asistente de 4 pasos del panel anterior (Excel → JSON en claro → JSON enriquecido en claro →
 * .enc): el Excel se lee en el navegador, las cuentas quedan en el Llavero abierto sin guardar, y se guardan
 * con «Guardar con el cifrado nuevo» (js/acc-vault-edit.js). Nunca se descarga ni se guarda nada en claro.
 * Lee las mismas columnas de la plantilla de siempre (id, nombre, email, password, gmailPassword, apiKey,
 * twitch_user, twitch_email, twitch_password, geforce_linked, notas, tags) y arma el mismo formato de cuenta.
 * «Descargar plantilla» baja la plantilla vacía, con una fila de ejemplo sin datos reales.
 * Usa SheetJS (window.XLSX), que ya carga index.html. Lo dibuja y le pasa los eventos js/acc-vault-view.js.
 * Se carga por js/modules.json (DEC-035), antes de acc-view.js.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var COLUMNS = ['id', 'nombre', 'email', 'password', 'gmailPassword', 'apiKey', 'twitch_user', 'twitch_email', 'twitch_password', 'geforce_linked', 'notas', 'tags'];
  var EXAMPLE = ['mi_cuenta_1', 'Mi cuenta principal', 'usuario@ejemplo.com', '', '', '', 'miusuario', 'miusuario@ejemplo.com', '', 'TRUE', 'Cuenta principal', 'main,farming'];
  var MAX_BYTES = 5 * 1024 * 1024;

  var st = { busy: false };

  function VV() { return root.AccVaultView || null; }
  function X() { return root.XLSX || null; }
  function toast(kind, text) { if (typeof root.toast === 'function') root.toast(kind, text, { ttl: 3200 }); }

  // ------------------------------------------------------------------ modelo (puro)
  // Encabezados sin importar mayúsculas, espacios ni guiones: «Twitch User», «twitch-user» y «twitch_user» son lo mismo.
  function norm(k) { return String(k == null ? '' : k).trim().toLowerCase().replace(/[\s-]+/g, '_'); }
  var ALIAS = { name: 'nombre', notes: 'notas', geforce: 'geforce_linked', geforce_now: 'geforce_linked' };
  function cell(row, key) {
    var want = norm(key);
    for (var k in row) {
      if (!Object.prototype.hasOwnProperty.call(row, k)) continue;
      var n = norm(k);
      if (n === want || ALIAS[n] === want) return row[k] == null ? '' : String(row[k]);
    }
    return '';
  }
  function yes(v) { var s = String(v || '').trim().toLowerCase(); return s === 'true' || s === 'verdadero' || s === 'si' || s === 'sí' || s === '1' || s === 'x'; }
  // Las contraseñas tal cual (un espacio puede ser parte de una); el resto, sin espacios en los bordes.
  function rowToAccount(row, i) {
    var t = function (k) { return cell(row, k).trim(); }, raw = function (k) { return cell(row, k); };
    var name = t('nombre'), email = t('email');
    if (!name && !email && !t('apiKey') && !raw('password')) return null; // fila vacía
    var tu = t('twitch_user'), te = t('twitch_email'), tp = raw('twitch_password'), key = t('apiKey');
    var tags = t('tags').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    return {
      id: t('id') || 'cuenta_' + (i + 1), name: name || email || 'Cuenta ' + (i + 1),
      login: { email: email, password: raw('password'), gmailPassword: raw('gmailPassword') },
      services: { twitch: { linked: !!(tu || te || tp), username: tu || null, email: te || null, password: tp || null }, geforceNow: { linked: yes(t('geforce_linked')) } },
      apiKey: key ? { value: key } : null, notes: raw('notas'), tags: tags
    };
  }
  function rowsToData(rows, today) {
    var list = [];
    (rows || []).forEach(function (r, i) { var a = rowToAccount(r || {}, i); if (a) list.push(a); });
    return { version: 2, lastUpdated: today, accounts: list };
  }

  // ------------------------------------------------------------------ HTML (Llavero cerrado)
  function lockedHTML() {
    var ok = !!X();
    return '<div class="vki"><label class="cv-btn vk-pick' + (ok ? '' : ' vki-off') + '"><input type="file" id="vkXlsx" accept=".xlsx,.xls,.csv" class="vk-file-in"' + (ok && !st.busy ? '' : ' disabled') + '>' + (st.busy ? 'Leyendo el Excel…' : 'Importar desde Excel') + '</label>' +
      '<button type="button" class="cv-btn" data-vk="tpl"' + (ok ? '' : ' disabled') + '>Descargar plantilla</button>' +
      '<span class="vki-note">' + (ok ? 'El Excel se lee acá y las cuentas quedan en el Llavero sin guardar: después tocás «Guardar con el cifrado nuevo». No se baja nada en claro.' : 'No pude cargar el lector de Excel. Recargá la página (Ctrl+F5).') + '</span></div>';
  }

  // ------------------------------------------------------------------ acciones
  function readFile(file) {
    if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise(function (ok, ko) { var r = new root.FileReader(); r.onload = function () { ok(r.result); }; r.onerror = ko; r.readAsArrayBuffer(file); });
  }
  function importFile(file) {
    var XL = X(), V = VV();
    if (!XL || !V || !file) return null;
    if (file.size > MAX_BYTES) { toast('error', 'Ese archivo es muy grande para ser tu planilla de cuentas.'); return null; }
    st.busy = true;
    return readFile(file).then(function (buf) {
      var wb = XL.read(new Uint8Array(buf), { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]];
      var rows = ws ? XL.utils.sheet_to_json(ws, { raw: false, defval: '' }) : [];
      var d = rowsToData(rows, new Date(Date.now()).toISOString().slice(0, 10));
      st.busy = false;
      if (!d.accounts.length) { toast('error', 'No encontré cuentas en ese Excel. ¿Usaste la plantilla?'); V.rerender(); return; }
      V.openData(d, String(file.name || 'llavero').replace(/\.(xlsx|xls|csv)$/i, ''), true);
      toast('success', 'Importé ' + d.accounts.length + (d.accounts.length === 1 ? ' cuenta' : ' cuentas') + '. Falta guardar con el cifrado nuevo; después borrá el Excel: tiene tus contraseñas en claro.');
    }, function () { st.busy = false; toast('error', 'No pude leer ese archivo.'); V.rerender(); }).catch(function (e) {
      st.busy = false; toast('error', 'No pude leer ese Excel: ' + ((e && e.message) || 'error')); V.rerender();
    });
  }
  function template() {
    var XL = X();
    if (!XL) return false;
    var ws = XL.utils.aoa_to_sheet([COLUMNS, EXAMPLE]), wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, 'Cuentas');
    XL.writeFile(wb, 'plantilla_cuentas.xlsx');
    return true;
  }
  function onChange(e) {
    var t = e && e.target;
    if (!t || t.id !== 'vkXlsx') return false;
    var f = t.files && t.files[0];
    if (f) importFile(f);
    try { t.value = ''; } catch (_) {}
    return true;
  }

  root.AccVaultImport = {
    version: VERSION, lockedHTML: lockedHTML, onChange: onChange, template: template, importFile: importFile,
    _pure: { rowsToData: rowsToData, rowToAccount: rowToAccount, norm: norm, yes: yes, COLUMNS: COLUMNS, EXAMPLE: EXAMPLE, MAX_BYTES: MAX_BYTES, state: function () { return st; } }
  };
  if (root.console && root.console.info) root.console.info('[AccVaultImport] ready v' + VERSION);
})(typeof window !== 'undefined' ? window : this);
