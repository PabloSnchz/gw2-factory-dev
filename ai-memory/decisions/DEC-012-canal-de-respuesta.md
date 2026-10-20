# DEC-012 — Canal de respuesta: Pablo responde desde el panel

- Estado: ACEPTADA
- Fecha: 2026-10-20
- Ámbito: Dashboard Factory y gw2-factory-dev (workflow)
- Amplía: DEC-011
- Misión: FACTORY-001B (MC-4)
- Especificación: `gw2-factory-dashboard/docs/DECISIONS.md` (sección "Canal de respuesta desde el panel")

## Contexto

DEC-011 definió dónde vive una respuesta (`ai-memory/responses/RESP-XXX.md`), pero Pablo tenía que crear ese archivo a mano en GitHub, con plantilla y numeración. Era fricción y una fuente de errores de formato. MC-4 pide que Pablo pueda aprobar, rechazar, posponer o marcar como hecho directamente desde el panel. Prioridad: usabilidad antes que diseño visual.

El panel es un sitio estático: no tiene backend ni puede guardar secretos.

## Decisión

1. **Botones en el panel** (`js/respond.js`): cada pedido abierto muestra sus respuestas posibles, en "Necesita tu decisión" y en el detalle del pedido.
   - Acción: **Ya lo hice** · **Posponer 7 días** · **No lo voy a hacer**.
   - Decisión: **Aprobar <recomendada>** primero, después las otras opciones, **Rechazar** y **Posponer 7 días**.
2. **Cada botón abre un issue prellenado** en gw2-factory-dev, con un bloque de datos legible (`gds-response`: solicitud, respuesta, opción, hasta) y un espacio para comentario. Pablo toca **Submit new issue**. GitHub lo autentica: el navegador no maneja tokens.
3. **Workflow `decision-response`** (gw2-factory-dev) al abrirse o editarse el issue:
   - valida la respuesta y el pedido (que exista, esté ABIERTA y tenga esa opción);
   - escribe `ai-memory/responses/RESP-XXX.md` con el formato de DEC-011, numerando con el siguiente libre;
   - comenta el enlace y cierra el issue.
   - Si algo no es válido, comenta qué corregir y deja el issue abierto; editarlo lo reintenta.
4. **Seguridad**:
   - Solo corre en `PabloSnchz/gw2-factory-dev`: si el archivo llega a producción en una promoción, queda inerte.
   - Solo acepta issues del dueño del repositorio que tengan la marca `gds:decision-response`.
   - El texto del issue nunca se interpola en comandos: lo lee el script.
   - Permisos mínimos: `contents: write` e `issues: write`.
   - Ejecución en serie (`concurrency`).
5. **Contrato espejo**: el cuerpo del issue y el archivo RESP tienen el mismo texto dorado en los tests de ambos repos (`tests/respond.test.mjs` y `.github/scripts/decision-response.test.cjs`). Si un lado cambia el formato, el CI del otro lo detecta.
6. **Después de responder**: al Refrescar, el panel muestra el pedido en "Ya respondiste" y lo saca de la cola. El protocolo de la Factory (DEC-011 punto 5) no cambia.
7. **El camino manual sigue disponible** como alternativa (`responses/README.md`).

## Alternativas descartadas

- **A — Enlace "crear archivo" prellenado en GitHub**: usa parámetros de URL no documentados. Pablo tendría que elegir el número RESP (colisiones) y ningún paso valida el contenido.
- **B — Token de GitHub guardado en el navegador**: un secreto con permiso de escritura dentro de un sitio público; riesgo de filtración y de mantenimiento.
- **C — Backend o función serverless**: nueva infraestructura, nuevo secreto y nuevo punto de falla para un flujo de un solo usuario.
- **D — Issues como fuente de verdad**: ya descartada en DEC-011. Acá el issue es solo el canal de entrada; la verdad sigue en `ai-memory/responses/`.

## Consecuencias

- Responder pasa de "crear un archivo con plantilla" a **un botón y Submit**. Sin tokens ni infraestructura nueva.
- Cada respuesta deja rastro doble: el issue (cerrado, con el enlace) y el RESP, que incluye `Issue:` y `Autor:`.
- El commit de cada RESP lo firma `github-actions[bot]` y aparece en la actividad de DEV.
- Si el workflow falla, el error solo se ve en el issue: el panel todavía no lo muestra (BL-028, RSK-014).
- Verificado en GitHub real el 2026-10-20 con el issue #1 de prueba (REQ-999 inexistente): el workflow corrió, comentó el error en 3 s, no escribió nada y el issue quedó abierto hasta cerrarse a mano. La escritura del RESP está probada con un GitHub simulado; la primera respuesta real de Pablo la confirma en producción del canal.
