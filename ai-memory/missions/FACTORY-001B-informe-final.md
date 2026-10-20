# FACTORY-001B — Gato Design System y Centro de Decisiones · Informe final

- Estado: CERRADA (2026-10-20). Aprobada funcionalmente por Pablo; pendiente su validación final
- Período: 2026-10-20T02:51Z → 2026-10-20T05:36Z (seis micro-ciclos después de la recuperación)
- Repositorios: gw2-factory-dashboard (panel) · gw2-factory-dev (memoria y workflow del canal)
- Producción: no se tocó
- Decisiones: DEC-010, DEC-011, DEC-012, DEC-013, DEC-014 (todas aceptadas; DEC-014 por RESP-001)

## 1. Qué se pidió y qué se entregó

| Criterio de éxito de la misión | Resultado | Evidencia | Pendiente |
|---|---|---|---|
| Pablo entiende el estado de la Factory en menos de 60 segundos | **Cumplido en estructura** | La vista Hoy abre con una frase que dice qué hacer y sigue con una tarjeta por pendiente; jerarquía verificada por test en todas las vistas | Verlo en un navegador real (RSK-015, BL-016) |
| Pablo decide desde el panel | **Cumplido y verificado en real** | Botones Aprobar / Rechazar / Posponer / Ya lo hice → issue prellenado → `responses/` (DEC-012). Primera decisión real: REQ-003 aprobada desde el panel y procesada (sección 8). Errores del canal visibles (DEC-013) | — |
| Identidad visual propia: La Bóveda del Gato Negro | **Cumplido** | GDS 1.0.1: paleta Obsidian / Arcane, marca del gato, estados con ícono + texto (DEC-010) | Revisión visual humana |
| Un Gato Design System documentado y reutilizable | **Cumplido** | `gds/` con tokens en 3 niveles, 23 componentes, `GDS_FOUNDATION.md` y 12 tests propios | Decidir su ubicación canónica antes de que la webapp lo adopte (BL-023) |

Lo que pedía la misión, punto por punto:

- **De observación a decisión**: la vista Hoy pone primero lo que necesita a Pablo, con la recomendación de la Factory y los botones para responder.
- **Aprobar, rechazar, posponer**, más "Ya lo hice" para las acciones.
- **Cada acción deja un artefacto**: un archivo `RESP-XXX.md` con Estado PENDIENTE que la Factory procesa al iniciar la sesión siguiente (DEC-011).
- **Menos conceptos internos**: los IDs pasan a ser referencias chicas, y estados, etapas y procedencias se dicen en palabras.
- **GDS_FOUNDATION.md** con principios, tokens, tipografía, espaciado, componentes, accesibilidad, lenguaje y gobernanza.

## 2. Micro-ciclos

| Ciclo | Qué hizo | Commits principales |
|---|---|---|
| Recuperación | Reconstruyó el estado desde el repositorio tras la interrupción y planificó 6 ciclos | — |
| MC-1 | Registró el arranque, los riesgos y las lecciones de la interrupción | dev `01ea707` → `5d3a862` |
| MC-2 | Gato Design System 1.0: tokens, componentes, contraste calculado, documento | panel `3984bb1`, `05392ab` · dev `b8ca0a5` |
| MC-3 | Contrato v3: pedidos (`requests/`) y respuestas (`responses/`) | panel `b8e0e08`, `e2275b1` · dev `e5ffb8e` |
| MC-4 | Responder desde el panel: workflow `decision-response` y botones | panel `0775d5d` · dev `cf5a533`, `90fcca6` |
| MC-5 | Centro de Decisiones sobre el GDS: jerarquía, lenguaje, cola, canal visible | panel `4018d5a` … `9c8726b` · dev `8d29395` |
| MC-6 | Revisión de accesibilidad y textos, documentación, CHANGELOG 2.0.0, cierre; procesamiento de RESP-001 | panel `3a9f2ea` … `cfdd1fa` · dev `855104e` … `4d8794c`, `78f7676` … (este informe) |

Cada ciclo tuvo su checkpoint en `status.md` antes de empezar, su commit al terminar y la validación de Pablo antes del siguiente (LES-012).

## 3. Revisión final (MC-6)

**Accesibilidad**:

- Un test nuevo recorre todas las vistas y exige un solo h1 y títulos sin saltear niveles. Encontró dos errores reales que ya están corregidos:
  - en el detalle de un pedido, la tarjeta de decisión iba antes del h1;
  - los `##` del markdown de la memoria salían como h3 bajo un h1.
- Se revisaron con el mismo control las 87 páginas que genera la memoria real: 0 problemas.
- Las tablas del markdown ahora tienen scroll propio en pantallas chicas (criterio 1.4.10) y encabezados con `scope`.
- Verificado y sin cambios: contraste de todos los pares (57, calculado), foco visible, navegación por teclado, `aria-current`, región `aria-live`, íconos decorativos y estados con ícono + texto.
- Los enlaces de referencia (`.gds-ref`) son chicos, pero van dentro del texto. WCAG 2.1 AA no fija tamaño mínimo de objetivo; WCAG 2.2 (2.5.8) exceptúa los enlaces en línea.

**Textos**:

- La procedencia de cada alerta se dice como "Medido en GitHub" o "Declarado en la memoria", ya no "Salud · medido".
- Los chequeos de estado ya no exponen `EN_CURSO` ni `IN_PROGRESS` en el título; el detalle técnico queda en la descripción.
- El pie del panel muestra la versión vigente del GDS.

**Documentación consolidada (BL-024)**:

- README del Centro de Decisiones;
- `ARCHITECTURE.md` con capas, 6 llamadas a la API, orden de Hoy, cola y tabla WCAG;
- `DATA-CONTRACT.md` v3;
- CHANGELOG 2.0.0.

**Tests**: 74 en el panel y 9 en el workflow, todos pasan. Cuando se rompió el código a propósito en 20 puntos clave (16 de MC-5 y 4 de MC-6), los tests detectaron las 20 fallas.

## 4. Números de la misión

| Medida | Antes | Después |
|---|---|---|
| Tests del panel | 27 | 74 (+ 9 del workflow) |
| Pares de contraste calculados | 0 | 57, todos AA |
| Colores fijos en la interfaz | varios por debajo de AA | 0 (lo verifica un test) |
| Llamadas a la API por lectura | 5 | 6 |
| Pasos para responder una decisión | escribir en la conversación | un botón y Submit |
| Decisiones registradas | 9 | 14 |
| Lecciones registradas | 11 | 18 |
| Riesgos registrados | 7 | 15 |

## 5. Qué salió mal y qué se aprendió

| Incidente | Efecto | Lección |
|---|---|---|
| La plataforma se interrumpió a mitad de la misión y no había nada persistido | ~1 h de trabajo perdido | LES-012: checkpoint antes de cada ciclo y commit al terminar |
| Commits intermedios sin todos los archivos (MC-2, MC-3) | CI en rojo en commits intermedios; `main` siempre quedó bien | LES-015: un cambio y sus tests en el mismo commit |
| Una publicación de 14 archivos no entró en un commit (MC-5) | Panel en vivo roto unos 2 minutos | LES-017: partir por dependencias, de modo que cada commit deje el sitio funcionando |
| Escrituras en paralelo a la misma rama (MC-6) | 2 de 3 rechazadas con 409, sin daño | LES-018: escribir en serie y revisar cada respuesta |
| Sin navegador en el entorno de la Factory | La interfaz no se vio en una pantalla real | RSK-015: revisión estructural y visual a cargo de Pablo |

Lo que funcionó y conviene conservar:

- Reconstruir el estado solo desde el repositorio.
- Probar en real un canal que actúa por Pablo solo por el camino de error (LES-016).
- Calcular el contraste en lugar de suponerlo (LES-013).
- Verificar cada archivo publicado por SHA.

## 6. Lo que queda abierto

| Tema | Responsable | Dónde |
|---|---|---|
| Ver el panel en un navegador real, también en el celular | Pablo | RSK-015, BL-016 |
| Proteger `main` de producción | Pablo | REQ-001 |
| Publicar DEV en Vercel y apagar Pages en DEV | Pablo | REQ-002 |
| Indicar cuándo se activa la autonomía aprobada | Pablo | DEC-014 |
| Ubicación canónica del GDS antes de que la webapp lo adopte | Factory propone, Pablo decide | BL-023 |
| CI en rojo en commits intermedios | Factory | RSK-012 |

## 7. Modo operativo futuro

**Autonomía continua acotada**: opción B de REQ-003, aprobada por Pablo el 2026-10-20 (RESP-001); el detalle está en DEC-014.

- **Qué hace la Factory sola**: en cada sesión toma la siguiente tarea del backlog y encadena ciclos completos en DEV, con checkpoint y commit, sin pedir aprobación por ciclo.
- **Qué te pregunta**: todo lo que toque producción, el alcance del producto, dependencias o costos nuevos, la arquitectura, el formato de los datos del usuario o lo que solo vos podés hacer.
- **Cómo te informa**: el panel muestra el avance; cada sesión termina con un resumen en `status.md` y cada hito con un informe como este.
- **Revisión del acuerdo**: después de 3 sesiones.
- **Primeras tareas** al activarse:
  - BL-002: DEV sin Analytics;
  - BL-006: validación automática en gw2-factory-dev;
  - BL-004: documentación de producto sincronizada.

**Activación en espera.** Pablo indicó no iniciar trabajo autónomo, misiones nuevas ni FACTORY-LIVE-001 hasta su validación final. La Factory queda detenida hasta su próxima instrucción.

Recomendación final:

- Activar la autonomía con una instrucción explícita después de la validación visual del panel (BL-016), para que la primera sesión autónoma ya cuente con un panel confirmado en pantalla.
- Mantener el límite de una tarea por vez durante las 3 sesiones de prueba.

## 8. Verificación del ciclo completo de decisiones

Fue la primera decisión real, de punta a punta, con evidencia en GitHub:

| Paso | Qué pasó | Evidencia |
|---|---|---|
| Factory trabaja | Cierra MC-6 y registra el pedido REQ-003 con su recomendación | dev `1caa0e2` (REQ-003), `1386ca0` (DEC-014) |
| Dashboard propone | REQ-003 aparece en "Necesita tu decisión" con los botones A / B / C | panel `cfdd1fa`; el issue #2 lo generó el botón del panel (marca `gds:decision-response`, "desde el Centro de Decisiones") |
| Pablo responde | Aprueba la opción B desde el panel: issue #2, 2026-10-20T05:28:00Z | issue #2 (autor PabloSnchz, OWNER) |
| Canal registra | El workflow `decision-response` escribe RESP-001, comenta el enlace y cierra el issue a las 05:28:13Z (13 s) | dev `a36b68a` (github-actions[bot]) |
| Panel refleja la respuesta | Antes del procesamiento: REQ-003 en "Ya respondiste", "Respondido · la Factory lo está procesando" | simulación con la memoria publicada |
| Factory procesa | RESP-001 → PROCESADA con Efecto; REQ-003 → CERRADA · RESP-001; DEC-014 → ACEPTADA; BL-030 → DONE | dev `49ab3bc`, `ad99877`, `8231b7b`, `768edcd`, `4b1a664` |
| Panel refleja el nuevo estado | REQ-003 en Cerrados, sin respuestas pendientes; DEC-014 aceptada; Salud sin avisos del canal (`req:notclosed`, respuestas sin procesar) | simulación con la memoria publicada (SHA verificados); 0 issues abiertos del canal |
| Factory continúa | Queda en espera por instrucción de Pablo: no toma trabajo autónomo hasta su validación final | `status.md` |

Notas:

- La verificación del panel se hizo con su mismo código (`buildModel` y vistas) sobre los archivos publicados, cuyos SHA coinciden con los de GitHub. No se vio en un navegador: RSK-015 sigue abierto.
- Con esta respuesta se confirmó por primera vez la escritura real del canal (RSK-014).
