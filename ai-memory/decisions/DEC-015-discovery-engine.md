# DEC-015 — Discovery Engine: la Factory descubre oportunidades sin un agente nuevo

- Estado: ACEPTADA — encargada por Pablo en FACTORY-RESEARCH-001 (2026-10-20). Punto 5 definido por Pablo en RESP-004 (2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Cómo encuentra trabajo nuevo la Factory cuando el backlog no alcanza
- Misión: FACTORY-RESEARCH-001
- Relacionadas: DEC-014 (autonomía), DEC-016 (límites y promoción), DEC-017 (gobierno del backlog)

## Contexto

Con autonomía continua acotada (DEC-014), la Factory toma trabajo del backlog READY. Si el backlog se vacía, se queda sin trabajo valioso. En el sistema histórico un Product Owner investigaba la comunidad y las herramientas y alimentaba un PRE_BACKLOG que llegó a 3766 líneas: se generaban ideas mucho más rápido de lo que se cerraban.

Pablo pidió recuperar la capacidad de descubrir sin recrear el Product Owner, sin un agente nuevo y sin crecimiento descontrolado.

## Decisión

### 1. Discovery es una actividad de la Factory, no un rol

- La etapa PRODUCT del ciclo se extiende hacia afuera: además de evaluar el trabajo existente, busca oportunidades nuevas.
- Discovery se ejecuta en **rondas** acotadas dentro de una sesión, con el mismo checkpoint y commit de cualquier micro-ciclo.
- No hay coordinación, colas entre agentes ni roles nuevos.

### 2. Dónde vive

- `ai-memory/discovery.md`: oportunidades abiertas (`DISC-XXX`, estados PENDIENTE y ANALIZADO) y la fecha de la última ronda.
- `ai-memory/discovery-archive.md`: todo lo que salió de discovery (PROMOVIDO, ARCHIVADO, DESCARTADO), con fecha, motivo y responsable. Nada se borra.
- Una oportunidad promovida se convierte en una tarea `BL-XXX` y su DISC pasa al archivo con el enlace.

### 3. Fuentes, en orden de rendimiento

| Familia | Fuente | Qué aporta | Confiabilidad | Acceso de la Factory |
|---|---|---|---|---|
| **Producto (primero)** | Datos estáticos del repo (`assets/*.json`, `assets/data/*.json`) contra la wiki y las notas de actualización | Datos vencidos o incorrectos que el usuario ve hoy | Alta | Directo |
| Producto | backlog, roadmap, lessons, features, risks, comentarios del código ("Próximas funciones", TODO) | Deuda, promesas incumplidas, riesgos sin tarea | Alta | Directo |
| Ecosistema | Notas de actualización oficiales (wiki "Game updates", foro "Game Update Notes", noticias) | Contenido nuevo que la app no cubre (expansiones, metas, festivales) | Alta | Búsqueda web |
| Ecosistema | API: `wiki/API:Changelog`, foro "API Development", `api.guildwars2.com/v2` | Endpoints nuevos, cambios o roturas de la API | Alta | Búsqueda web |
| Herramientas | gw2efficiency, gw2.app (también en español), GW2Timer, Blish HUD (módulos y descargas), canicraft.com, gw2.guildwars.games/es, GW2Treasures | Qué ya existe, qué falta, demanda medible (descargas) | Media | Búsqueda web |
| Comunidad | Reddit r/Guildwars2, foros oficiales en inglés y español | Fricciones y pedidos repetidos | Media, con ruido | Búsqueda web (lectura parcial) |
| Comunidad | Discords públicos, GitHub discussions | Pedidos de nicho | Variable | **Sin acceso directo**: solo si Pablo trae el dato |

Regla: una señal de comunidad sola no alcanza para ALTA. Hace falta evidencia observable, como votos, descargas, un pedido repetido o un dato verificable.

### 4. Cuándo investigar

Discovery puede correr si se cumple alguna de estas condiciones (DEC-016 fija los umbrales):

- READY ≤ 3;
- no hay tareas en curso;
- se cerró una misión;
- quedó tiempo libre entre micro-ciclos.

### 5. Qué detiene discovery

Definido por Pablo en RESP-004 (2026-10-20), que reemplaza la lista original. La Factory puede investigar mientras:

- no haya riesgos CRÍTICOS abiertos;
- haya capacidad en READY (READY < 5);
- la propia tarea de discovery no esté bloqueada.

Y además:

- las decisiones pendientes **no** detienen discovery, salvo que bloqueen directamente la investigación;
- las acciones humanas **no** detienen discovery;
- las validaciones funcionales **no** detienen discovery;
- las decisiones estratégicas solo detienen **el área afectada**.

Lista original, reemplazada: READY > 5, riesgos CRÍTICOS, decisiones humanas pendientes, tareas bloqueadas. Leídas al pie de la letra, las dos últimas casi nunca dejaban investigar (REQ-004).

### 6. Cómo es una ronda

1. **Mantenimiento antes de buscar.**
   - Archivar los DISC sin movimiento en 30 días.
   - Fusionar los duplicados.
   - Recalcular el modo de DEC-016.
2. **Tope por ronda.**
   - Como máximo **3 DISC nuevos** y **1 ronda por sesión**.
   - En modo restringido, solo se registran oportunidades de prioridad ALTA.
3. **Fuentes por ronda.** Se consultan 2 familias. Producto va siempre, porque es la que más rinde; la otra va rotando. Así una sola ronda no consume la sesión.
4. **Evaluación.** Cada oportunidad responde las seis preguntas: problema, quién se beneficia, valor, alternativa, prioridad y costo. Si no puede responderlas, no entra.
5. **Registro de la ronda.** Se anota en `discovery.md` (fecha, familias y resultado), aunque no haya encontrado nada.

## Alternativas descartadas

- **Recrear un Product Owner como agente**: lo prohíbe la misión y reintroduce coordinación.
- **Investigar en cada sesión sin límite**: es exactamente lo que generó las 3766 líneas.
- **No investigar y esperar ideas de Pablo**: deja a la Factory sin trabajo cuando el backlog se vacía.

## Consecuencias

- La ronda inicial (2026-10-20) encontró dos errores de datos que el usuario ve hoy: la rotación del PSNA, que va a BL-013, y las metas de las expansiones recientes, que van a BL-034. Ninguno era una función nueva. Ver LES-021.
- El test de memoria en CI verifica los límites duros (DEC-016), así el crecimiento no depende de la disciplina de nadie.
