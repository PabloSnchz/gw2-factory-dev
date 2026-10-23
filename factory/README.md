# Canal de parches de la Factory (DEC-035)

Cambia archivos que no entran en una publicación de la Factory (~64 KB, LES-028) publicando solo el cambio. Lo aplica `.github/workflows/factory-patch.yml` con `.github/scripts/factory-patch.cjs` y `apply-patch.cjs`. Solo en DEV.

## Un parche

`factory/patches/PATCH-NNN.json` (número nuevo, nunca se reutiliza):

```json
{
  "id": "PATCH-010",
  "summary": "qué cambia y por qué",
  "files": [
    {
      "path": "index.html",
      "base_sha": "<blob sha actual del archivo, el que muestra GitHub>",
      "ops": [
        { "op": "replace", "anchor": "texto exacto", "text": "texto nuevo" },
        { "op": "insert_before", "anchor": "...", "text": "..." },
        { "op": "insert_after", "anchor": "...", "text": "..." },
        { "op": "delete", "anchor": "..." }
      ]
    }
  ]
}
```

## Reglas (si una falla, no cambia nada)

- Cada ancla aparece **exactamente una vez** en el archivo, en el momento de su operación. Las operaciones van en orden, cada una sobre el resultado de la anterior.
- `base_sha` tiene que ser el blob actual: un parche sobre otra versión, o ya aplicado, se rechaza.
- Todo o nada, también entre archivos. El texto es literal. Máximo 50 operaciones.
- Solo app y documentación: `index.html`, `js/`, `css/`, `assets/`, `docs/`, `tests/`, `tools/`, `ai-memory/`, `CHANGELOG.md`, `README.md`. Nunca `.github/` ni `factory/`.
- Después de aplicar: `node --check` de los `.js` y la suite de `app-checks`. Si la suite pasaba y deja de pasar, o falla algo que antes pasaba, se restaura y se rechaza.

## Resultado

Cada parche deja `factory/patches/RESULT-NNN.md` (commit de `github-actions[bot]`): APLICADO con el blob antes y después y el estado de la suite, o RECHAZADO con el motivo. Si el parche cambió algo que se publica, el workflow republica DEV.

## Recuperación

- RESULT aplicado → seguir. Rechazado → leer el motivo y mandar un parche nuevo (otro número).
- Sin RESULT → el workflow no corrió o falló antes de escribir. El parche sigue pendiente y lo procesa la próxima corrida (otro PATCH, o «Run workflow» en Actions). Nunca se aplica dos veces: lo impide `base_sha`.
