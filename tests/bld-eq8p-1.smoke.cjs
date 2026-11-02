// Sonda BL-084 EQ-8 PvP (1/5), se borra al cerrar la tanda: datos oficiales de las builds de Guerrero PvP.
'use strict';
require('./bld-eq8w-lib.cjs')([
  'sc-pvp-warrior-condition-berserker-longbow-mace-sword',
  'sc-pvp-warrior-strength-spellbreaker-spear-staff',
  'sc-pvp-warrior-power-paragon-spear-greatsword'
]).catch((e) => { console.log('ERROR ' + e.message); });
