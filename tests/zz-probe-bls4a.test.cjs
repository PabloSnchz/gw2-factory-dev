'use strict';
// Sonda BLS-4a (BL-074): quién lee todavía cada clave vieja candidata a limpieza. Se borra después.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const C = ["'items_cache_v1'", 'psna:', "'characters:", 'characters:cached', 'gw2_currencies_cache_v1', 'ach_meta_v2', 'ach_meta_v1', 'gw2_conv_cache_v1', 'gw2_conv_cache_v2',
  'gh_token', 'gh_gist', 'gn:github:', 'raid_strike_view', 'raids:strike', 'walletSnapshot', 'walletPins', 'hecho_hoy', 'activities:stones', 'activities_stones', "'wv:season", 'gn_inv_',
  'gn_wallet_', 'gw2_wv_', 'wvpd_', 'welcome_seen', 'gn_theme', 'gn_converter_state', 'wallet_dashboard_', 'last_file', 'accounts:lastFile', 'accounts:vault2', 'gn:achievements:cache',
  'gn:activities:psna', 'gn:characters:', 'gw2_meta_', 'gn_meta_', 'walletCompact', 'gn_home_nodes', 'gn_activities_toggles', 'gw2_favs', 'gw2_keys', 'gw2_selected_key'];
test('sonda', () => {
  const files = fs.readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js') && n !== 'storage.js').map((n) => 'js/' + n);
  const src = {};
  files.forEach((f) => { src[f] = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n'); });
  for (const c of C) {
    const hits = [];
    for (const f of files) src[f].forEach((l, i) => { if (l.includes(c) && !/^\s*(\*|\/\/)/.test(l)) hits.push(f.slice(3) + ':' + (i + 1)); });
    console.log('[' + c + '] ' + hits.length + ' ' + hits.slice(0, 8).join(' '));
  }
});
