# LES-022 — Un borrador que sobrevive a una interrupción es una pista, no una base

- Fecha de registro: 2026-10-20
- Origen: FACTORY-DASHBOARD-REFINEMENT-001, recuperación de SD-2

## Qué pasó

Una interrupción de plataforma cortó SD-2 a las ~14:50. En el repositorio quedaba solo el checkpoint (SD-1 hecho, SD-2 en curso); del panel no se había publicado nada. El borrador local de 4 archivos sí sobrevivió, con 70 de 74 tests pasando.

Antes de usarlo se hizo lo siguiente:

- se comparó por SHA con lo publicado: la base no había cambiado y solo diferían los 4 archivos del borrador;
- se revisó como trabajo ajeno, en la etapa REVIEW.

La revisión encontró 3 problemas que los tests no veían:

- publicado tal cual, el panel habría ocultado el único pedido real de Pablo (REQ-004), porque no tenía la sección nueva;
- el código citaba DEC-018, que todavía no existía en la memoria: habría aparecido como referencia rota;
- una decisión sin pedido podía volver a colarse como línea de `status.md`.

Mientras tanto había llegado una respuesta de Pablo (RESP-003) que también había que procesar primero.

## Lección

- Al recuperar, el estado sale del repositorio. Lo que quedó en local se trata como **borrador sin revisar**, aunque lo haya escrito la propia Factory minutos antes (LES-014).
- Cuando el panel endurece una regla sobre la memoria, **primero se publica la memoria que ya cumple la regla y después el código**. Al revés, el panel castiga a la memoria real durante la transición.
- Un SHA calculado justo después de editar puede leer el archivo a mitad de escritura. Si no coincide con lo publicado, se recalcula antes de suponer un error.

## Cómo aplicar

- Recuperación:
  1. leer status, backlog e índice;
  2. revisar los commits de los dos repos;
  3. procesar las respuestas pendientes;
  4. comparar lo local por SHA;
  5. revisar el borrador en la etapa REVIEW;
  6. recién entonces publicar.
- Un cambio de contrato se publica en este orden: memoria compatible → código → tests → documentación. Cada commit deja el sitio funcionando (LES-017). CI puede quedar en rojo unos minutos entre el código y los tests: se avisa en el informe.
