# DEC-029 — Los tests del legado se migran por CI, no a mano

- Estado: ACEPTADA — decisión técnica de la Factory (MIG-4, BL-043). Pablo aprobó la migración por tandas en RESP-010.
- Fecha: 2026-10-22
- Ámbito: gw2-factory-dev (`tools/legacy/`, `.github/workflows/legacy-tests.yml`). No cambia la app.
- Relacionadas: REQ-010, RESP-010, LES-027, RSK-016, DEC-012

## Contexto

gw2-wallet-agents tiene 88 archivos de tests (~1,1 MB). No usan `node:test`: son scripts que imprimen "OK"/"FAIL" y algunos terminan con código 0 aunque fallen. Migrarlos a mano obliga a que cada byte pase dos veces por la Factory (leer y volver a escribir) y a tener localmente el código de DEV para correrlos: es el límite físico de LES-027. El entorno de la Factory no tiene red ni git; CI sí.

El legado es público (MIT) y 34 de sus 47 archivos .js son idénticos a los de DEV (12 cambiaron y 1 solo existe en el legado), así que buena parte de los tests debería seguir valiendo.

## Decisión

1. **Censo en CI (MIG-4a).** El workflow `legacy-tests` hace checkout del legado fijado a `eb91075` (solo lectura, sin credenciales), copia cada test a una copia de DEV, lo corre ahí y en el legado, y guarda un informe en `tools/legacy/CENSO.md`: estado en cada lado (VERDE, ROJO, MIENTE, TIEMPO, DEPENDENCIA), OK/FAIL, archivos de la app que cambiaron y las últimas líneas de salida de los que fallan. Yo leo el informe, no los 88 archivos.
2. **Importación por CI (MIG-4b en adelante).** Los archivos que decida migrar los copia el mismo workflow desde el commit fijado, a partir de una lista versionada. Solo entran los que están en VERDE contra DEV; los que mienten se corrigen o se descartan; los ROJO se analizan uno por uno (error real → backlog; test viejo → se adapta o se descarta).
3. **Una sola escritura por workflow.** El censo escribe solo `tools/legacy/CENSO.md`; la importación, solo los archivos de la lista. Un push con `GITHUB_TOKEN` no dispara otros workflows, así que no hay bucles.

## Consecuencias

- La revisión se apoya en evidencia ejecutada, no en lectura. Los que voy a adaptar sí los leo.
- `tools/` no se publica en DEV (MIG-2e): el informe no llega a la app.
- Si cambia el legado no importa: está fijado a un commit, y queda archivado al terminar BL-043.
