// Sonda BL-084 EQ-8 PvP (1/5), se borra al cerrar la tanda: datos oficiales de las builds de Guardián PvP.
'use strict';
require('./bld-eq8w-lib.cjs')([
  'sc-pvp-guardian-power-dragonhunter-longbow-sword-shield',
  'sc-pvp-guardian-support-firebrand-staff-sword-shield',
  'sc-pvp-guardian-valkyrie-willbender-spear-sword-focus',
  'sc-pvp-guardian-bunker-luminary-mace-focus-scepter-shield'
]).catch((e) => { console.log('ERROR ' + e.message); });
