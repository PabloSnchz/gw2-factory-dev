// BL-084 EQ-8: referencias de las notas PvP contra la API (tests/bld-notes-refs.smoke.cjs filtrado por modo).
process.env.BLD_REFS_MODE = 'pvp';
require('./bld-notes-refs.smoke.cjs');
