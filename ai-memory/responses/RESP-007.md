# RESP-007 — Aprobada: REQ-007

- Estado: PROCESADA
- Fecha: 2026-10-21T00:47Z
- Solicitud: REQ-007
- Respuesta: APPROVED
- Opción: A
- Issue: https://github.com/PabloSnchz/gw2-factory-dev/issues/6
- Autor: PabloSnchz

## Comentario

Desde el panel, sin comentario (issue #6, 00:47Z). En la conversación, a las 00:51Z, Pablo agregó las condiciones que siguen; la Factory las registra con su texto (LES-023).

APROBADA la opción A.

Nueva interpretación de DEC-021: los límites del micro-ciclo siguen vigentes. Sin embargo, cuando un único archivo supera por sí solo el límite de 40 KB:

- el archivo puede ocupar un micro-ciclo completo;
- debe ser el único archivo funcional modificado;
- debe tener revisión dedicada;
- debe tener validación dedicada;
- debe tener publicación dedicada.

Esta excepción aplica únicamente a archivos cuyo tamaño individual supera el límite. No aplica a grupos de archivos.

Continuar con BL-013 utilizando esta regla.

## Efecto

Procesada por la Factory el 2026-10-21T00:55Z (G6-A).

- REQ-007 queda CERRADA con referencia a esta respuesta.
- BL-013 vuelve a IN_PROGRESS: el área "actividades y metas" deja de estar detenida.
- DEC-021 recibe la excepción en G6-B, con el texto de Pablo (LES-023: el comentario es normativo).
- El canal del panel funcionó de punta a punta: el workflow escribió la respuesta como PENDIENTE y la Factory la procesó al iniciar el trabajo (DEC-011, DEC-012).
- Lectura de "único archivo funcional": en ese micro-ciclo no cambia ningún otro archivo de la app ni de tests. `status.md` se escribe igual, antes y después, porque es el checkpoint y no es funcional. El test del cambio va en el micro-ciclo siguiente.
- La excepción también habilita `index.html` (68,9 KB) para BL-034 y BL-005, con la misma regla.
