# FACTORY-RESEARCH-001 — Discovery Engine · Informe de misión

- Estado: CERRADA
- Fecha: 2026-10-20
- Modo: autonomía continua acotada (DEC-014)
- Tarea: BL-035
- Decisiones: DEC-015, DEC-016, DEC-017
- Lecciones: LES-020, LES-021
- Riesgos: RSK-017 (nuevo, MITIGADO), RSK-018 (nuevo, ALTO ABIERTO), RSK-001 (aceptado por Pablo)
- Pedido abierto: REQ-004

## Resumen

La Factory puede descubrir trabajo nuevo por sí misma, sin un agente nuevo y sin repetir el PRE_BACKLOG histórico de 3766 líneas. Discovery es una actividad de la etapa PRODUCT que corre en rondas cortas. Sus límites los verifica CI en cada push, así que no dependen de la disciplina de la Factory.

La ronda inicial demostró el valor del sistema: encontró dos errores de datos que el usuario ve hoy en la app (PSNA del día equivocado y metas faltantes de las dos últimas expansiones). Ahora son las dos primeras tareas de READY.

## Las cinco preguntas de la misión

### 1. ¿De dónde salen las oportunidades?

De cuatro familias de fuentes, en orden de rendimiento (DEC-015 §3):

| Familia | Fuentes | Acceso |
|---|---|---|
| Producto (siempre primero) | Datos estáticos del repo contra la wiki; backlog, roadmap, lessons, features, risks; textos de la app | Directo |
| Ecosistema | Notas de actualización oficiales, `API:Changelog`, foro de desarrollo de la API | Búsqueda web |
| Herramientas | gw2efficiency, gw2.app, GW2Timer, Blish HUD, canicraft, gw2.guildwars.games/es, GW2Treasures | Búsqueda web |
| Comunidad | Reddit r/Guildwars2, foros oficiales | Búsqueda web, lectura parcial |
| Comunidad | Discords públicos, GitHub discussions | Sin acceso: solo si Pablo trae el dato |

Una señal de comunidad sola no alcanza para prioridad ALTA. Hace falta evidencia observable.

### 2. ¿Cómo se evita saturar el backlog?

Con límites duros, verificados en CI por `tests/ai-memory.test.cjs` (DEC-016):

| Límite | Valor | Si se supera |
|---|---|---|
| READY | máximo 5 | CI en rojo |
| Oportunidades abiertas | máximo 15 | CI en rojo |
| Nuevas por ronda | máximo 3 | Regla de DEC-016 |
| Rondas por sesión | máximo 1 | Regla de DEC-016 |

Modos según READY:

| READY | Modo |
|---|---|
| 0 | prioritario |
| 1-3 | activo |
| 4-5 | restringido (solo ALTA) |
| más de 5 | detenido |

Modos según oportunidades abiertas:

| Abiertas | Modo |
|---|---|
| 0-10 | normal |
| 11-15 | depuración |
| más de 15 | prohibido agregar |

### 3. ¿Qué entra y qué no?

Una oportunidad se promueve a `BL-XXX` solo si cumple las cinco condiciones:

- tiene valor identificado;
- tiene una descripción clara;
- no está duplicada;
- tiene prioridad definida;
- hay lugar en READY.

Prioridades:

- **ALTA**: corrige información incorrecta, corrige errores visibles, reduce deuda relevante, mejora rendimiento medible o reduce riesgos altos.
- **MEDIA**: experiencia, mantenimiento o funcionalidad útil.
- **BAJA**: cosmético, hipotético o sin demanda.

Cada oportunidad responde seis preguntas: problema, beneficiario, valor, alternativa, prioridad y costo.

Desde DEC-017, READY solo contiene trabajo ejecutable. Las ideas y lo postergado vuelven a discovery.

### 4. ¿Cómo se registra sin perder nada?

- `discovery.md` tiene solo las oportunidades abiertas.
- `discovery-archive.md` guarda toda salida (PROMOVIDO, ARCHIVADO, DESCARTADO) con fecha, motivo y responsable. CI lo exige.
- Las oportunidades sin movimiento en 30 días pasan al archivo.
- En el backlog, rechazos y devoluciones quedan en DONE con prefijo ("Rechazado por Pablo", "Devuelto a discovery"). No se borran.

### 5. ¿Qué pasa cuando el backlog se vacía?

Con READY en 0, discovery pasa a modo prioritario y la próxima ronda empieza por la familia Producto: comparar un archivo de datos del repo con su fuente viva (LES-021). Es la fuente de mayor rendimiento: en la ronda inicial dio los dos hallazgos ALTA.

Las rondas autónomas dependen de REQ-004 (ver "Pendiente").

## Resultado de la ronda inicial

8 oportunidades registradas:

| ID | Oportunidad | Prioridad | Resultado |
|---|---|---|---|
| DISC-001 | PSNA muestra todos los días los puntos del 2026-03-17 | ALTA | Promovida a BL-013 |
| DISC-002 | Faltan metas de Janthir Wilds y Visions of Eternity; Monte Balrior mal etiquetado | ALTA | Promovida a BL-034 |
| DISC-003 | "Próximas funciones" anuncia funciones que ya existen | ALTA, costo XS | Abierta: la siguiente en entrar |
| DISC-004 | Historial y variación de la cartera | MEDIA | Abierta: necesita decisión sobre datos del usuario |
| DISC-005 | Avance hacia cada legendaria | MEDIA provisoria | Abierta |
| DISC-006 | Panel: modo autónomo y riesgos aceptados | MEDIA | Abierta |
| DISC-007 | Ubicación canónica del GDS (antes BL-023) | BAJA | Abierta |
| DISC-008 | Verificación medida de DEV sin Pages (antes BL-025) | BAJA | Abierta |

## Backlog después de la misión

READY bajó de 8 a 4:

1. BL-013 PSNA;
2. BL-034 metas;
3. BL-004 documentación;
4. BL-005 script duplicado.

Cambios de lugar:

- BL-007, BL-008 y BL-017 pasaron a BLOCKED con el motivo externo explícito.
- BL-023 y BL-025 volvieron a discovery.
- BL-010 quedó en DONE como rechazado.

Discovery queda en 6 de 15 abiertas. Con READY en 4, el modo es restringido: solo entran oportunidades ALTA.

## Respuesta de Pablo procesada

Durante la misión llegó RESP-002: Pablo rechazó REQ-001 (proteger `main` de producción) con el comentario "de momento no lo veo necesario, recorda mas adelante refinar esto conmigo".

Se procesó primero, según DEC-011:

- REQ-001 quedó CERRADA y BL-010 pasó a DONE como rechazado.
- RSK-001 queda aceptado, con revisión acordada el **2026-11-20** con una propuesta más acotada.

## Verificación

- Memoria: 0 problemas de formato y 0 referencias a IDs inexistentes.
- Panel simulado sobre la memoria real: 107 páginas, 0 problemas.
- `tests/ai-memory.test.cjs`: 13/13 en local. Las 8 mutaciones se detectaron:
  - READY con 6 tareas;
  - 16 oportunidades abiertas;
  - DISC sin prioridad;
  - estado inventado;
  - archivada sin motivo;
  - archivada con estado abierto;
  - DISC duplicado;
  - discovery-archive fuera del índice.
- Todos los archivos publicados se verificaron por SHA contra la copia local.
- El test se publicó último (`99f3220`), cuando la memoria ya cumplía los límites, para no dejar `main` en rojo.

## Incidente

Se repitió LES-018: dos decisiones se publicaron en paralelo y DEC-016 falló con 409. Se reintentó en serie sin pérdida y el contenido quedó verificado por SHA.

Causa: la regla existía, pero no se aplicó al publicar archivos nuevos e independientes. Corrección: toda escritura a una rama va en serie, aunque los archivos no dependan entre sí. LES-018 ya lo dice; no hace falta una lección nueva.

## Pendiente

- **REQ-004** (Pablo): cuándo puede investigar sola la Factory. Leídas al pie de la letra, las condiciones "decisiones humanas pendientes" y "tareas bloqueadas" casi siempre se cumplen. Hasta la respuesta no hay rondas autónomas. Recomendación: opción B.
- **BL-013** antes de publicar: confirmar qué conjunto del PSNA corresponde a cada día de la semana. Las copias de la wiki difieren en un día.
- **RSK-001**: volver a conversarlo con Pablo el 2026-11-20.

## Siguiente trabajo (autonomía continua)

BL-013 (PSNA), BL-034 (metas), BL-004 y BL-005, en ese orden. Producto primero (DEC-014).
