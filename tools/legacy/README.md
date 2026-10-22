# tools/legacy — los tests del legado de QwenPaw en DEV

Migración de los tests de `gw2-wallet-agents` (fijado a `eb91075`) a La Bóveda, por CI (BL-043, DEC-029).

| Archivo | Qué es |
|---|---|
| `census.cjs` | Corre cada test del legado en el legado y en una copia de DEV (censo) e importa la lista |
| `importar.txt` | Lo que se trae: tests a `tests/` y las herramientas que necesitan a `tools/` |
| `CENSO.md` | Informe del censo, lo escribe CI. No editar |
| `IMPORTACION.txt` | Resultado de la última importación, lo escribe CI. No editar |

El workflow `.github/workflows/legacy-tests.yml` corre en cada cambio de esta carpeta. Solo importa si **todos** los tests de la lista pasan contra DEV; si no, no deja nada y explica por qué en `IMPORTACION.txt`.

## Criterio

Cada test se juzga contra **La Bóveda de hoy**, no contra la app que el legado conocía:

- **Valor:** protege algo que la app usa hoy → se importa.
- **Historia:** prueba algo que ya fue reemplazado o que no existe en DEV → se descarta. No es un error de la app.
- **Proceso del sistema de agentes:** depende de herramientas internas de QwenPaw, no del producto → se descarta.
- **Roto en origen:** fallaba también en el legado → se descarta.

## Lo que no se importa, y por qué (88 archivos del legado: 73 importados, 15 fuera)

| Test | Clase | Motivo |
|---|---|---|
| `arma-2-3-cola-contrato`, `armeria-alert-01-clasificacion`, `armeria-filtros-cola-card`, `armeria-modal-iconos-nombre`, `armeria-ui-arbol` | Historia | Prueban el modal de la Armería, reemplazado por la pantalla de la legendaria (BL-047, BL-049). La Armería actual tiene sus propios tests: `legendary-sheet`, `legendary-tree-ui`, `legendary-totals-stock`, `legendary-catalog-labels` |
| `hb122-contrato-recetas`, `idea84-leyenda-pipeline` | Historia | Leen los generadores `js/_build_*.py` del legado. Los reemplazan `tools/legendary/` y sus 4 tests (MIG-2) |
| `hb119-t19a-cadena` | Historia | Exige 14 módulos que escuchan el cambio de cuenta; en la app son 13 porque el 14º es `homestead-tracker.js`, que nunca llegó a La Bóveda. El invariante lo siguen cuidando `hb133-appjs-no-traga-gn` y `hb106-t13-invariante` |
| `alert86-censo-clasificacion` | Historia | Necesita `homestead-tracker.js`. El panel de Homestead va a discovery (MIG-6); si se construye, el test vuelve con él |
| `hb134-cuento-po-refs`, `hb204-alert204-veredicto`, `hb205-ruta-no-atada` | Proceso de agentes | Dependen de `tools/hb100-suite.mjs` y `tools/hb116-union-po.mjs`, herramientas del sistema de QwenPaw |
| `hb114-t17-t18` | Roto en origen | Rutas de Windows; fallaba también en el legado |
| `idea50f.cacheclear-real` | Roto en origen | 5 FAIL también en el legado |
| `hb90-t9-mutex` | Roto en origen | Falla en el legado y pasa en DEV: inestable. Si entrara, podría poner `main` en rojo sin motivo |

`idea61-claves-congeladas` y `t19c-lectores-legacy` sí entran, con su herramienta `tools/audit-61-congeladas.mjs`: vigilan que la lista de cuentas y la cuenta elegida no queden congeladas entre las dos claves de `storage.js`, que es lo que sube el backup del Gist.
