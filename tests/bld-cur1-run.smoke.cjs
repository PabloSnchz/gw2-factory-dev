// CUR-1 sonda (se borra al cerrar): tests de vigía y curación con el bld-code real, y una pasada de prueba contra
// las fuentes reales (bench completo + 25 builds repartidas) SIN escribir nada (CURATE_DRY=1).
'use strict';
const { spawnSync } = require('node:child_process');
const env = Object.assign({}, process.env, { CURATE_DRY: '1', CURATE_SAMPLE: '25' });
delete env.NODE_TEST_CONTEXT; delete env.GITHUB_OUTPUT; delete env.GITHUB_STEP_SUMMARY;
const t = spawnSync(process.execPath, ['--test', '--test-reporter=dot', '.github/scripts/bld-watch.test.cjs', '.github/scripts/bld-curate.test.cjs'], { env, encoding: 'utf8', timeout: 60000 });
console.log('TESTS código ' + t.status + '\n' + (t.stdout + t.stderr).slice(-2500));
const r = spawnSync(process.execPath, ['.github/scripts/bld-curate.cjs'], { env, encoding: 'utf8', timeout: 110000 });
console.log('PRUEBA código ' + r.status + '\n' + (r.stdout + r.stderr).slice(-6000));
process.exit(t.status || 0);
