# FACTORY-OPS-001 — Modelo operativo de largo plazo

- Estado: PROPUESTA — esperando la decisión de Pablo (REQ-008). Nada de esto está implementado.
- Fecha: 2026-10-21
- Base: instrucciones v2, DEC-014, DEC-015 a DEC-022, LES-012, LES-020, LES-025, RSK-009, RSK-016, RSK-017
- Evidencia usada: las sesiones del 2026-10-20 y 2026-10-21 (commits y `status.md`)

## 0. El límite que condiciona todo

**Shiruvana no corre sola.** Cada sesión empieza cuando alguien la abre: hoy, Pablo con un mensaje. GitHub Actions puede ejecutar scripts y tests a horario, pero no puede despertar a Shiruvana. Despertarla por horario o por evento depende de que la plataforma del agente tenga disparadores programados o por evento. La Factory no puede comprobar eso desde su entorno, y si existe tiene un costo de uso.

Por eso el modelo separa dos cosas:

- **lo que necesita a Shiruvana**: decidir, programar, revisar, documentar;
- **lo que puede correr sin ella**: tests, chequeos de datos, avisos y el registro de respuestas, que ya hace un workflow (DEC-012).

### Lo medido hasta hoy

| Dato | Valor |
|---|---|
| Micro-ciclo de memoria (checkpoint, 1 a 3 archivos y cierre) | 2 a 5 min |
| Micro-ciclo de archivo grande (`js/activities.js`, 62 KB) | ~20 min, casi todo en validación |
| Sesión del 2026-10-21 entre 00:26 y 00:45 | 7 micro-ciclos: GV-1 completo, BL-013a y el pedido REQ-007 |
| Sesión del 2026-10-21 entre 00:53 y 01:11 | 6 micro-ciclos: BL-013 cerrado |
| Interrupciones de plataforma | 3 en 2 días: FACTORY-001B, SD-2 y GV-1 |
| Trabajo perdido desde DEC-021 | 0 |

## 1. Al despertar: el arranque

Cada sesión empieza igual, en este orden y sin saltear pasos. Cuesta 1 o 2 micro-ciclos de lectura:

1. **Leer el estado:** `status.md`, `backlog.md` y `memory-index.md`.
2. **Recuperar si hace falta:** si `status.md` dice EN_CURSO, se compara por SHA el manifiesto del micro-ciclo interrumpido contra lo publicado. Se termina o se descarta ese micro-ciclo antes de cualquier otra cosa (LES-012, DEC-021 §3).
3. **Procesar respuestas:** cada RESP en estado PENDIENTE se procesa y su REQ se cierra (DEC-011). Una respuesta de Pablo siempre va antes que cualquier trabajo.
4. **Mirar alertas:**
   - riesgos CRÍTICOS abiertos;
   - riesgos ALTOS sin mitigación;
   - cambios en producción (el panel ya lo mide);
   - el resultado de la vigilia (§7), cuando exista.
5. **Calcular el modo de la sesión:** normal, restringido o detenido (§5).
6. **Elegir trabajo** (§2) y escribir el checkpoint con su manifiesto.

## 2. Qué trabajo tomar

La Factory elige siempre la **primera tarea elegible** de esta lista:

1. **Recuperación y respuestas de Pablo** (arranque, §1).
2. **Lo roto que ve el usuario:** un error o un dato falso en la app que se pueda arreglar ya.
3. **READY de producto,** por prioridad: CRÍTICO, ALTO, MEDIO, BAJO. A igual prioridad, la más vieja.
4. **Deuda técnica que frena producto:** solo si la próxima tarea de producto la necesita, o si reduce un riesgo ALTO.
5. **Discovery,** cuando le toca (§4).
6. **Panel, memoria, documentación y procesos:** solo con una justificación escrita en la tarea. Las justificaciones válidas son deuda identificada, bloqueo operativo o mejora medible del producto (autoconstrucción limitada, v2).

Una tarea es **elegible** si cumple todo esto:

- está en READY;
- no espera nada de Pablo;
- no toca producción;
- no está en un área detenida;
- entra en un micro-ciclo, o se puede partir en micro-ciclos que dejen todo funcionando.

## 3. Cómo repartir el trabajo

Como presupuesto **por semana**, no como regla por sesión:

| Tipo | Parte de los micro-ciclos | Por qué |
|---|---|---|
| Producto (funcionalidades, errores, datos de la app) | **60 % o más** | Es el objetivo de la Factory |
| Deuda técnica de la app | hasta 15 % | Solo la que frena producto o reduce riesgo |
| Discovery | hasta 10 % | Es combustible, no producto |
| Panel, memoria, documentación y procesos | **hasta 15 %** | Herramientas de soporte |

Medido sobre los commits de la semana: lo que toca `js/`, `assets/`, `css/`, `index.html` y sus tests cuenta como producto. Si en una semana el soporte supera el 15 %, la semana siguiente empieza con 3 micro-ciclos de producto antes de cualquier tarea de soporte.

**Excepción:** una orden explícita de Pablo, como las misiones de gobernanza de esta semana, no cuenta contra el presupuesto, pero se registra aparte.

## 4. Discovery

**Cuándo investigar**, siempre que no haya un motivo de §5 que lo detenga:

- **READY = 0:** ronda obligatoria al empezar la sesión.
- **READY entre 1 y 3:** una ronda cuando se cierra una tarea de producto, como máximo una por sesión.
- **READY entre 4 y 5:** modo restringido, solo se registran ideas de prioridad ALTA.
- **Latido:** si pasan 14 días sin ronda, la próxima sesión hace una (DEC-020).

**Cómo es una ronda** (DEC-015 §6):

- primero mantenimiento: archivar, fusionar y analizar;
- después 2 familias de fuentes, siempre la de producto;
- como máximo 3 ideas nuevas.

**Cuándo promover:** una idea ANALIZADA pasa a READY si cumple los criterios de DEC-016 y hay lugar. Como máximo 1 promoción por ronda. Si requiere una decisión de Pablo, queda en "Esperando criterio" hasta que haya lugar para un pedido (máximo 3 abiertos).

**Cuándo archivar:**

- sin movimiento en 30 días;
- de prioridad BAJA y sin demanda nueva en 2 rondas seguidas.

En los dos casos se archiva con motivo; nada se borra.

**Contra la inflación del backlog** (verificado en CI):

- READY ≤ 5;
- ideas abiertas ≤ 15;
- no hay ronda nueva con más de 5 ideas sin analizar.

Se agrega una regla nueva: **por cada idea promovida, la Factory cierra o archiva otra cosa en la misma semana.** Así el backlog no crece si no se cierra trabajo.

## 5. Cuándo detenerse

**Se detiene toda la Factory** solo en estos casos:

1. un riesgo CRÍTICO abierto, salvo para mitigarlo;
2. cualquier acción que toque producción;
3. una decisión pendiente sobre la autonomía, las reglas de gobierno o la propia Factory. Ejemplo: REQ-006 bloqueaba todo, porque definía cómo se trabaja;
4. un bloqueo operativo general: sin acceso al repositorio, o con la memoria inconsistente y sin poder recuperarla.

**Se detiene solo un área** cuando hay:

- una decisión estratégica pendiente sobre esa área (campo `Bloquea:` del pedido);
- una dependencia externa de esa área;
- una restricción explícita de Pablo sobre esa área.

Las otras áreas siguen.

**No detienen nada:**

- validaciones funcionales de Pablo;
- acciones manuales pendientes;
- riesgos aceptados;
- bloqueos de entorno de otras tareas;
- riesgos ALTOS que tienen una mitigación en curso.

**Se cierra la sesión** cuando se cumple cualquiera de estas condiciones:

- se terminó el alcance pedido;
- se alcanzó el límite de la sesión (§8);
- no queda trabajo elegible y Discovery no tiene qué hacer;
- aparece un motivo de detención.

Siempre se cierra con `status.md` en IDLE y un resumen de la sesión.

## 6. Cuándo pedir ayuda a Pablo

Se aplica el filtro de 3 preguntas (DEC-019). Pablo recibe solo:

- decisiones de producto, usuario, negocio, estrategia, autonomía, producción o recursos externos, como pedidos con riesgo y recomendación;
- acciones que solo él puede hacer, porque necesitan su cuenta, sus permisos o su dinero;
- validaciones con su mirada de usuario.

Nunca recibe CI, tests, consola, contraste ni logs. Eso es de la Factory, o queda como bloqueo de entorno.

**Cuándo preguntar:** apenas aparece la necesidad, sin esperar a que bloquee. Mientras no responde, la Factory sigue con otra área. Si un pedido lleva más de 7 días sin respuesta, el panel lo resalta. La Factory no lo vuelve a preguntar ni lo decide por él.

## 7. Scheduler

| Opción | Cómo funciona | A favor | En contra |
|---|---|---|---|
| A. Solo cuando Pablo interactúa | Pablo abre una sesión | Sin costo ni infraestructura nueva; Pablo ve todo | Si Pablo no escribe, la Factory no avanza; el trabajo se concentra en ráfagas |
| B. Sesiones programadas | La plataforma abre una sesión a horario fijo | Avance constante sin Pablo | Depende de que la plataforma lo permita; costo de uso; trabaja aunque no haya nada que hacer |
| C. Eventos del panel | Responder un pedido despierta a Shiruvana | Reacción inmediata a Pablo | Depende de la plataforma; sin respuestas no hay avance; un error de canal deja a la Factory quieta |
| D. Híbrido | A más una vigilia automática sin agente, y B solo si la plataforma lo permite | Avanza cuando hay con qué, sin depender de una sola vía | Más partes que mantener |

**Recomendación: D, por etapas.**

1. **Ahora, sin costo:**
   - **A** como forma de despertar. Un mensaje de Pablo, aunque sea "continuá", vale como sesión completa.
   - **Una vigilia diaria en GitHub Actions**, que corre sin Shiruvana:
     - corre todos los tests;
     - comprueba que los archivos de datos no hayan vencido;
     - mide el latido de Discovery y los pedidos sin respuesta;
     - deja el resultado en un archivo que la Factory lee al despertar.

     Además resuelve en parte RSK-016: la Factory no puede leer CI, pero sí puede leer un archivo del repositorio.
2. **Si la plataforma lo permite y Pablo acepta el costo:** **B** con 2 sesiones programadas por día, en horarios en que Pablo no suele escribir.
3. **C** queda descartado por ahora: depende de lo mismo que B y avanza solo cuando Pablo responde, que ya cubre A.

**Por qué no B sola:** sin la vigilia, una sesión programada no sabe si algo se rompió entre sesiones. Además, todavía no se sabe si la plataforma lo permite.

## 8. Sesiones

| Parámetro | Valor | Base |
|---|---|---|
| Sesiones por día | Con A, las que Pablo abra. Con B, 2 programadas | 2 alcanzan para cerrar ~1 tarea de producto por día |
| Duración máxima | **60 min** | Hoy hubo sesiones de 20 a 45 min sin problemas. Las interrupciones llegaron en sesiones largas o en publicaciones grandes |
| Trabajo máximo | **12 micro-ciclos, o 1 tarea de producto completa más su cierre.** Como máximo **2 micro-ciclos de archivo grande** | Medido: 6 o 7 micro-ciclos por sesión |
| Cierre | Alcance terminado, límite alcanzado, nada elegible o motivo de detención | `status.md` en IDLE con su resumen |

Cada micro-ciclo sigue cumpliendo DEC-021: 1 objetivo, 3 archivos, escrituras en serie y manifiesto.

## 9. Una semana sana

Con unas 10 sesiones por semana (2 por día hábil) y unos 80 micro-ciclos:

| Tipo | Por semana | Ejemplo |
|---|---|---|
| Producto | **3 a 5 tareas cerradas** (≥ 48 micro-ciclos) | BL-034, DISC-003 promovida, un error visible |
| Deuda técnica | 1 tarea | BL-005 (script duplicado) |
| Discovery | 1 o 2 rondas, de 0 a 3 ideas, de 0 a 1 promovida | |
| Panel y memoria | 0 o 1 tarea, solo si está justificada | Las métricas de §12 |
| Documentación | dentro de cada tarea | Las FEAT y LES de cada cierre |
| Pedidos a Pablo | 0 a 2 | |
| Validaciones para Pablo | 1 a 3, una por cada funcionalidad nueva | |

**Señal de alerta:** una semana sin ninguna tarea de producto cerrada, si no hubo un bloqueo real, quiere decir que la Factory se está mirando a sí misma.

## 10. Sin trabajo READY

En este orden:

1. Ronda de Discovery obligatoria, con producto e ideas analizadas primero.
2. Promover la mejor idea analizada que no necesite a Pablo.
3. Si no hay ninguna, buscar deuda técnica de la app con evidencia: FEAT-000, LES-003 o documentación desactualizada.
4. Si tampoco hay, preparar un pedido de producto para Pablo con 2 o 3 ideas que necesitan su criterio, si hay lugar para un pedido.
5. Si nada de eso aplica, **cerrar la sesión en IDLE**. La Factory no inventa trabajo de infraestructura para estar ocupada.

## 11. Contra la autooptimización infinita

1. **Presupuesto:** soporte ≤ 15 % por semana (§3), medido sobre los commits.
2. **Justificación escrita:** toda tarea de panel, memoria o procesos declara en el backlog cuál de las 3 condiciones de v2 cumple. Sin justificación, no entra en READY.
3. **Prueba del usuario:** antes de empezar una tarea de soporte, la Factory responde "¿qué ve distinto el usuario de la app o Pablo cuando termine?". Si la respuesta es "nada", no se hace.
4. **Freno de rachas:** después de 3 micro-ciclos de soporte seguidos, el siguiente tiene que ser de producto, si hay producto elegible.
5. **Revisión mensual:** proporción de producto contra soporte en los últimos 30 días.

## 12. Métricas

Todas salen de lo que ya existe (commits, `backlog.md`, `requests/`, `discovery.md`), sin pedirle nada a Pablo:

| Métrica | Sana | Alerta |
|---|---|---|
| Tareas de producto cerradas por semana | ≥ 3 | 0 sin bloqueo real |
| Parte de commits de producto | ≥ 60 % | < 40 % |
| Errores o datos falsos visibles abiertos (ALTO o más) | bajando | igual 2 semanas |
| Días desde la última tarea de producto cerrada | ≤ 3 | > 7 |
| Tiempo de la respuesta de Pablo al procesamiento | ≤ 1 sesión | > 48 h |
| Pedidos abiertos para Pablo | ≤ 3 | > 3 (CI ya falla) |
| Funcionalidades esperando su validación | ≤ 3 | > 5 |
| READY | 2 a 5 | 0 dos sesiones seguidas, o > 5 |
| Ideas abiertas | ≤ 10 | 11 a 15 |
| Trabajo perdido por interrupciones | 0 | cualquier archivo perdido |
| Retrabajo: commits que corrigen uno del mismo día | ≤ 10 % | > 25 % |

El panel mostraría 4 de estas en Hoy:

- tareas de producto de la semana;
- proporción de producto;
- días sin producto;
- pedidos abiertos.

El resto iría en Salud. Es una tarea de panel justificada: es la observabilidad que pide v2.

## 13. Riesgos del modelo

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Sin sesiones programadas, la Factory solo avanza cuando Pablo escribe | MEDIO | Cada mensaje de Pablo es una sesión completa; la vigilia detecta problemas mientras tanto |
| Las sesiones programadas trabajan sin supervisión y acumulan cambios que nadie mira | MEDIO | Las reglas de detención no cambian; producción nunca; resumen por sesión; validaciones funcionales para Pablo |
| Costo de uso de la plataforma con B | Desconocido | Lo decide Pablo; empezar con 1 sesión por día y medir |
| Las métricas se vuelven el objetivo (cerrar tareas chicas para sumar) | MEDIO | Se cuentan por prioridad, las ALTAS pesan más; revisión mensual |
| La vigilia es una pieza más que puede fallar sin que nadie lo note | BAJO | Si su archivo de resultado tiene más de 48 h, el arranque lo trata como alerta |
| La Factory empieza a "mantener" el modelo en vez de usarlo | MEDIO | Este modelo cuenta como soporte (§3); cambiarlo requiere un pedido a Pablo |

## 14. Decisión y lección propuestas

Se registran si Pablo aprueba. Se escriben sin guion porque todavía no existen en la memoria.

- **DEC 023 — Modelo operativo de largo plazo:**
  - arranque fijo;
  - orden de elección del trabajo;
  - presupuesto semanal (≥ 60 % producto, ≤ 15 % soporte);
  - sesiones de 60 min o 12 micro-ciclos;
  - qué detiene la Factory y qué detiene solo un área;
  - qué hacer sin READY;
  - métricas;
  - scheduler híbrido por etapas.
- **LES 027 — La autonomía tiene un límite físico.** "Operar semanas sin supervisión" no depende solo de las reglas: Shiruvana despierta solo cuando alguien la abre. Antes de diseñar autonomía, hay que separar lo que necesita al agente de lo que puede correr solo (tests, avisos, registros).

## 15. Implementación propuesta, si se aprueba

En micro-ciclos dentro de DEC-021, después de BL-034 (producto primero):

1. DEC 023 y LES 027, con el índice.
2. La vigilia diaria: un workflow y su script. Tarea de infraestructura justificada, porque mitiga RSK-016.
3. El arranque fijo escrito en `memory-index.md`, en "Lectura obligatoria".
4. Las métricas en el panel, como tarea MEDIO del panel.
5. Si Pablo habilita B en la plataforma: dejar el horario en DEC 023 y medir una semana.
