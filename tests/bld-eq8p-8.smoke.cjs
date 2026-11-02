// Sonda BL-084 EQ-8 PvP (2/5), se borra al cerrar la tanda: una build por archivo (la salida se recorta a 12000).
'use strict';
require('./bld-eq8w-lib.cjs')(['sc-pvp-ranger-cc-druid-hammer-mace-mace']).catch((e) => { console.log('ERROR ' + e.message); });
