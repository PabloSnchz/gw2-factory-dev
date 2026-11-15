// Sonda BL-084 EQ-8 PvP (4/5), se borra al cerrar la tanda: una build por archivo (la salida se recorta a 12000).
'use strict';
require('./bld-eq8w-lib.cjs')(['sc-pvp-necromancer-avatar-ritualist-staff-spear']).catch((e) => { console.log('ERROR ' + e.message); });
