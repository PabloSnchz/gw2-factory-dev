# DEC-011 — Intercambio de decisiones entre Pablo y la Factory (contrato v3)

- Estado: ACEPTADA
- Fecha: 2026-10-20
- Ámbito: Memoria oficial y Dashboard Factory
- Amplía: DEC-009
- Ampliada por: DEC-012 (canal de respuesta desde el panel, 2026-10-20)
- Misión: FACTORY-001B (MC-3)
- Especificación: `gw2-factory-dashboard/docs/DECISIONS.md`

## Contexto

Hasta ahora la Factory pedía decisiones a Pablo por tres vías mezcladas: DEC en estado PROPUESTA, ítems de backlog con la palabra "Pablo" y líneas de "Esperando a Pablo" en status.md. El panel podía mostrarlas, pero Pablo no tenía dónde responder ni la Factory dónde leer la respuesta: las decisiones de DEC-005, DEC-006 y BL-001 esperaron desde el 2026-10-19 y se resolvieron por chat (2026-10-20T02:53Z), fuera de la memoria.

## Decisión

1. **Pedido** (`ai-memory/requests/REQ-XXX-<slug>.md`): la Factory presenta cada cosa que necesita de Pablo como un pedido escrito para él: título = la pregunta; secciones Qué pasó, Por qué importa, Opciones (o ninguna para aprobar/rechazar), Cómo hacerlo (acciones), Recomendación. Metadatos: Estado ABIERTA/CERRADA, Tipo decisión/acción, Fecha, Prioridad, Relacionado, Verificación opcional.
2. **Respuesta** (`ai-memory/responses/RESP-XXX.md`): Pablo responde APPROVED, REJECTED, POSTPONED (con Hasta) o DONE, con opción y comentario. Estado PENDIENTE hasta que la Factory la procesa (PROCESADA, con sección Efecto). Se aceptan sinónimos en castellano.
3. **Ciclo de vida** medido por el panel: open → postponed / answered / measured → closed. Un pedido no cerrado "cubre" sus ítems relacionados: no aparecen sueltos en la cola de Pablo, y si está pospuesto, desaparece todo junto hasta la fecha.
4. **Verificaciones medidas**: una acción que el panel puede comprobar (hoy: `prod_protegida`) se da por hecha sin que Pablo responda.
5. **Protocolo de la Factory** (obligatorio al iniciar cada sesión, después de status/backlog/índice): procesar las respuestas PENDIENTE en orden de fecha, aplicar su efecto, marcarlas PROCESADA con `## Efecto`, cerrar el pedido (`Estado: CERRADA`, `- Cerrado: fecha · RESP-XXX`) salvo POSTPONED, y cerrar los pedidos verificados por medición.
6. **Regla v3**: toda DEC en estado PROPUESTA debe estar cubierta por un pedido no cerrado. Las líneas de "Esperando a Pablo" en status.md siguen permitidas, pero lo que necesita una respuesta va como pedido.
7. **Canal**: mientras no exista el canal desde el panel (MC-4), Pablo responde creando el archivo desde GitHub con la plantilla de `responses/README.md`. El formato es el mismo que generará el canal (`buildResponseMarkdown`), así el protocolo no cambia. Actualización 2026-10-20: el canal existe (DEC-012); el archivo manual queda como alternativa.

## Alternativas descartadas

- **Seguir usando DEC PROPUESTA como pedido**: mezcla la decisión con la pregunta, no tiene lugar para la respuesta y obliga a Pablo a leer formato interno.
- **Responder en status.md o en la DEC**: varias manos editando el mismo archivo; sin historial de respuestas ni estado de procesamiento.
- **Issues de GitHub como fuente de verdad**: la memoria dejaría de estar en ai-memory. Los issues se evalúan en MC-4 solo como canal de entrada que termina escribiendo una RESP.

## Consecuencias

- El panel muestra los pedidos primero en "Necesita tu decisión" y reporta en Salud: pedido sin respuesta > 7 días, respuesta sin procesar > 48 h, respuesta procesada con pedido abierto, respuestas huérfanas o fuera de formato, DEC PROPUESTA sin pedido.
- Cero llamadas extra a la API de GitHub.
- Nuevos IDs: REQ-XXX (pedidos) y RESP-XXX (respuestas). No se registran en memory-index.md: su índice es la carpeta y el panel.
- Primeros pedidos: REQ-001 (proteger producción, verificado por medición) y REQ-002 (DEV en Vercel y apagar GitHub Pages en DEV).
