# RESP-005 — Aprobada: REQ-005

- Estado: PROCESADA
- Fecha: 2026-10-20T18:27Z
- Solicitud: REQ-005
- Respuesta: APPROVED
- Opción: —
- Autor: PabloSnchz
- Canal: conversación con la Factory (FACTORY-GOVERNANCE-002). La registra la Factory, con el texto de Pablo.

## Comentario

La propuesta de gobernanza queda aceptada con una modificación: Discovery debe forzar una ronda automática después de 14 días sin investigación, no después de 7. Todo el resto de la propuesta queda aprobado.

Confirmaciones:

- la regla de las 3 preguntas;
- la clasificación de pendientes: decisiones estratégicas, acciones manuales, validaciones funcionales, información, bloqueos, riesgos;
- la política de Discovery por áreas;
- la distinción entre decisión, acción, validación e información;
- que bloqueos y riesgos no sean automáticamente pendientes de Pablo.

Nueva regla: antes de mostrar algo a Pablo, la Factory se pregunta si Pablo tiene realmente la información, la autoridad o el criterio para responderlo. Si no, lo resuelve sola o lo trata como bloqueo técnico. Las validaciones técnicas (CI, GitHub Actions, tests, contrastes, consola, network, DevTools) son responsabilidad de la Factory.

Discovery visible: se aprueba la sección permanente IDEAS en el panel, con los grupos Investigando, Madurando, Esperando criterio, Promovidas y Descartadas. Para cada idea: descripción breve, prioridad, fuente y estado. Una idea no se convierte automáticamente en backlog: debe existir una etapa explícita de análisis y promoción.

Discovery no se detiene por acciones manuales pendientes, validaciones funcionales pendientes, riesgos aceptados, bloqueos externos ni trabajo pendiente en otras áreas. Se detiene únicamente cuando existe una decisión estratégica sin responder, un riesgo CRÍTICO o una restricción explícita sobre esa misma área.

Prioridad: Producto > Dashboard, Documentación, Procesos e Infraestructura. Autonomía: continuar por micro-ciclos y detenerse solo por decisión estratégica, riesgo crítico, producción o bloqueo real.

## Efecto

Procesada por la Factory: la mayor parte el 2026-10-20 (GV-1) y el cierre el 2026-10-21 (GV-1a), después de que una interrupción cortara la publicación y Pablo fijara los límites de micro-ciclo (DEC-021).

- REQ-005 queda CERRADA con referencia a esta respuesta.
- Registradas DEC-019 (taxonomía de pendientes, bloqueos y riesgos) y DEC-020 (Discovery v2: áreas, latido de 14 días y vista Ideas), y las lecciones LES-023 y LES-024.
- Lectura de "decisión estratégica sin responder": detiene discovery en el área que esa decisión afecta, no en todas. Es la lectura coherente con lo que Pablo aprobó en el mismo mensaje (política por áreas, "trabajo pendiente en otras áreas" no frena) y con RESP-004 ("las decisiones estratégicas solo detienen el área afectada"). Una decisión sobre discovery mismo, o sobre la autonomía, detiene todo discovery. Pablo confirmó esta lectura al aprobar FACTORY-GOVERNANCE-004.
- Se completa en micro-ciclos: pendientes reclasificados (GV-1b), bloqueos con dueño y áreas en discovery (GV-1c) y verificación en CI de la clase de cada pendiente, la justificación de cada decisión, como máximo 3 decisiones abiertas, el dueño de cada bloqueo y el área de cada idea (GV-1d).
