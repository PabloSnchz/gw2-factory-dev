# Respuestas de Pablo

Acá queda registrada cada respuesta de Pablo a un pedido de la Factory (`../requests/`).
La Factory las lee al empezar cada sesión, aplica lo decidido y las marca como `PROCESADA` (DEC-011).

## Cómo responder (desde el panel — camino principal, DEC-012)

1. En el panel, en **Necesita tu decisión**, tocá el botón de tu respuesta (por ejemplo **Ya lo hice**, **Aprobar B (recomendada)**, **Posponer 7 días**).
2. Se abre GitHub con un issue ya completo. Si querés, escribí un comentario (o cambiá la fecha de `hasta`). Tocá **Submit new issue**.
3. En un minuto el workflow `decision-response` crea acá el `RESP-XXX.md`, comenta el enlace en el issue y lo cierra. Tocá **Refrescar** en el panel: el pedido pasa a **Ya respondiste**.

Si algo no cuadra (pedido inexistente o cerrado, opción que no existe), el workflow lo explica en un comentario del issue y lo deja abierto: editá el issue y se vuelve a procesar.
Solo se aceptan issues del dueño del repositorio con la marca `gds:decision-response`.

## Cómo responder (manual, alternativa)

Si el workflow no está disponible, se puede responder creando un archivo:

1. En esta carpeta: **Add file → Create new file**.
2. Nombre: `RESP-XXX.md`, con el número siguiente al último que exista (por ejemplo `RESP-001.md`).
3. Pegá la plantilla, completala y hacé **Commit changes** en `main`.

```
# RESP-001 — Respuesta a REQ-002

- Estado: PENDIENTE
- Fecha: 2026-10-20T10:30Z
- Solicitud: REQ-002
- Respuesta: DONE
- Opción: —

## Comentario

Lo que quieras agregar (por ejemplo, la dirección de Vercel).
```

## Valores

| Campo | Valores |
|---|---|
| Respuesta | `APPROVED` (aprobar) · `REJECTED` (rechazar) · `POSTPONED` (posponer) · `DONE` (acción hecha) |
| Opción | La letra elegida (`A`, `B`, …) cuando el pedido tiene opciones; `—` si no aplica. Aprobar sin letra = aprobar la recomendación |
| Hasta | Solo para `POSTPONED`: fecha `AAAA-MM-DD` en la que el pedido vuelve a aparecer |
| Estado | Siempre `PENDIENTE` al responder. La Factory lo cambia a `PROCESADA` |

Si algo queda mal escrito, el panel lo muestra en Salud y la Factory no lo procesa hasta que se corrija.
