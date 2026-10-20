# LES-018 — Las escrituras a una misma rama se hacen en serie

- Fecha de registro: 2026-10-20
- Origen: FACTORY-001B MC-6

## Qué pasó

Para acelerar, se publicaron tres archivos del panel con tres llamadas en paralelo a la API de GitHub (README, CHANGELOG e `index.html`). Cada llamada crea su propio commit sobre `main`. La primera que llegó movió la rama, y las otras dos fallaron con **409** porque esperaban el commit anterior.

No hubo daño: GitHub rechazó las escrituras sin aplicar nada, se repitieron en serie y los SHA se verificaron. Pero el resultado parcial podría haber pasado inadvertido si no se leía cada respuesta.

## Lección

- La API de contenidos de GitHub hace un commit por llamada. Dos escrituras a la misma rama nunca pueden ir en paralelo.
- Paralelizar sirve para leer, nunca para escribir.

## Cómo aplicar

- Publicar de a un archivo, esperando la respuesta de cada uno, en el orden de dependencias de LES-017.
- Revisar cada respuesta: un 409 no escribió nada y hay que repetirlo. Al final, verificar los SHA de todo el conjunto (LES-015).
