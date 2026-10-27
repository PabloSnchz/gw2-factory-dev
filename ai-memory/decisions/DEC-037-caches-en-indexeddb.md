# DEC-037 — Cachés en IndexedDB, tus datos en localStorage

- Estado: ACEPTADA — D1 a D3 de BL-074 delegados por Pablo (2026-10-26 20:54Z); BL-074 cerrada por Pablo (2026-10-26 23:54Z).
- Fecha: 2026-10-27
- Ámbito: dónde guarda cosas la Bóveda en el navegador del jugador.
- Relacionadas: BL-074, BL-059, DEC-035, DEC-033

## Contexto

Pablo midió su navegador de producción (2026-10-26 18:31Z): localStorage al 74 % (~3,7 M de ~5 M caracteres), compartido por producción, DEV y los dashboards (mismo origen). Las 10 claves más grandes eran cachés que se pueden volver a pedir a la API. Con la cuota llena, cada escritura falla y la Bóveda arranca en frío.

## Decisión

1. **Cachés en IndexedDB** con copia en memoria (`js/gn-idb.js`): `api-gw2.js` (lsGet/lsSet/lsDel/lsHas), el conversor y los logros de Cuentas. Lectura síncrona desde memoria; escritura a IndexedDB en lote. Si no hay IndexedDB, todo sigue en localStorage: nunca rompe.
2. **Tus datos en localStorage**: Keys, ajustes, fijados, el Llavero cifrado y mi memoria (`gn:shv:wallet`, con tope propio de 64 KB). No son cachés: «Vaciar caché» no los toca.
3. **Mudanza segura**: copiar, esperar la confirmación de IndexedDB y recién ahí borrar de localStorage.
4. **Limpieza con censo previo**: una clave vieja se borra solo si una sonda confirma que ningún módulo la lee (lista `DEAD` de `gn-idb.js`). La copia vieja del Llavero (`accounts:lastFile`) solo si ya existe la nueva (`accounts:vault2`).
5. Un caché nuevo entra por el prefijo de `gn-idb.js`, no escribiendo directo en localStorage.

## Consecuencias

- localStorage queda para lo chico y lo que no se puede volver a pedir.
- Cada caché que se agregue tiene que tener tope o poda: el del conversor crecía sin tope (hallazgo de BLS-3).
- Producción y DEV comparten el almacenamiento: el código viejo de producción vuelve a llenar sus cachés en localStorage hasta que tenga este cambio.
