# REQ-007 — ¿Cómo se publica un archivo que pesa más de 40 KB?

- Estado: CERRADA
- Tipo: decisión
- Fecha: 2026-10-21
- Prioridad: ALTO
- Área: actividades y metas
- Relacionado: DEC-021, DEC-022, BL-013, BL-034, BL-005, RSK-018
- Bloquea: actividades y metas
- Cerrado: 2026-10-21 · RESP-007

## Qué pasó

BL-013 (el PSNA del día equivocado) avanzó hasta donde permiten los límites de micro-ciclo:

- la rotación semanal quedó verificada contra la wiki y otras 3 fuentes;
- se corrigieron 15 códigos de waypoint y 2 nombres;
- quedó un test de datos (`assets/data/psna-schedule.json` y `tests/psna-data.test.cjs`).

Lo que falta es el arreglo que vas a notar en la app: calcular el día con la rotación y el cambio de las 08:00 UTC, y leer el archivo propio. Hoy, en cualquier sitio publicado, la app lee el archivo del repo de producción.

Ese arreglo vive en `js/activities.js`, que pesa **59,6 KB**. Para cambiar una línea hay que enviar el archivo completo, y DEC-021 fija un máximo de **40 KB** por micro-ciclo. No hay forma de cumplir ese límite tocando este archivo.

Lo mismo pasa con `index.html` (68,9 KB). Lo necesitan BL-034 (filtro de expansiones) y BL-005 (script duplicado).

## Por qué importa

Hoy la app muestra a todos los usuarios los waypoints de otro día. Mientras el límite se aplique tal cual, ese error no se puede corregir, y tampoco el de las metas de las expansiones nuevas. Los dos son trabajo de producto de prioridad ALTA.

## Riesgo

- Con A: un solo archivo grande por micro-ciclo. Si una interrupción corta la publicación, el archivo queda como estaba o queda completo, porque una escritura es un solo commit. El riesgo es tener el código publicado sin su test durante un micro-ciclo; se mitiga publicando el test justo después y verificando todo en local antes.
- Con B: el riesgo de A, una sola vez. Después los cambios de PSNA vuelven a ser chicos.
- Con C: el error de datos sigue a la vista de todos los usuarios (RSK-018 ALTO, sin mitigación posible).

## Por qué te lo pregunto

El límite de 40 KB lo aprobaste vos en DEC-021, y pediste explícitamente que se cumplan todos los límites a la vez. Hacer una excepción por mi cuenta sería reinterpretar tu regla. Por DEC-022, un conflicto que toca una regla tuya lo decidís vos.

## Opciones

- A — Excepción permanente para archivos indivisibles: un archivo que solo pesa más de 40 KB se publica solo, en su propio micro-ciclo, sin otros archivos, verificado completo en local antes de enviarlo. Su test va en el micro-ciclo siguiente. Para varios archivos sigue valiendo el máximo de 40 KB.
- B — Excepción puntual: se permite una sola vez para sacar el código de PSNA de `js/activities.js` a un archivo propio chico, que el mismo `js/activities.js` carga. Desde ahí, BL-013 sigue dentro del límite. `index.html` necesitaría otra excepción más adelante.
- C — Mantener el límite estricto: BL-013 queda en datos verificados sin efecto en la app, y BL-034 y BL-005 quedan bloqueados.

## Recomendación

A — Cubre `js/activities.js` e `index.html` con una sola regla y mantiene lo que el límite protege: una interrupción nunca deja el repositorio a medias, porque ese micro-ciclo tiene un único commit de contenido. Mientras no respondas, la Factory no toca archivos de más de 40 KB y sigue con tareas que entran en el límite.
