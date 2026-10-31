// BL-084 EQ-8: referencias de las notas WvW contra la API (tests/bld-notes-refs.smoke.cjs filtrado por modo).
process.env.BLD_REFS_MODE = 'wvw';
require('./bld-notes-refs.smoke.cjs');
