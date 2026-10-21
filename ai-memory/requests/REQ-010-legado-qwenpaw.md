# REQ-010 — ¿Aprobás el plan para el legado de QwenPaw: migrar lo útil y después archivar los dos repos?

- Estado: ABIERTA
- Tipo: decisión
- Fecha: 2026-10-21
- Prioridad: ALTO
- Área: producto
- Relacionado: FACTORY-ASSET-001, BL-001, RSK-002, RSK-008, RSK-016, RSK-018, BL-004
- Bloquea: la migración (MIG-1 a MIG-6) y el archivo de gw2-wallet-agents y gw2-agents-dashboard

## Qué pasó

Diste de baja a QwenPaw y me pediste analizar sus dos repositorios, solo para proponer (FACTORY-ASSET-001). El informe completo está en `missions/FACTORY-ASSET-001-informe.md`. En corto:

- **Vale migrar:**
  - unos 90 archivos de tests del producto (DEV tiene 12);
  - los generadores de datos de la Armería;
  - hechos de la API verificados (por ejemplo, el logro 9472 del modo legendario de Nexus);
  - documentación más nueva que la de DEV;
  - un arreglo en los totales de la Armería;
  - un panel de Homestead completo, que nunca validaste.
- **No vale migrar:**
  - las conexiones nuevas con la API que descargan datos sin mostrarlos;
  - unos 2 MB de bitácoras del sistema de agentes;
  - todo gw2-agents-dashboard.

## Por qué importa

La red de tests y los generadores de la Armería son lo que más le falta hoy a La Bóveda para cambiar código con seguridad y mantener los datos al día. Mientras tanto, gw2-wallet-agents sigue publicando una copia vieja de La Bóveda en el mismo dominio que producción.

## Riesgo

- **Hoy:**
  - la copia publicada en `pablosnchz.github.io/gw2-wallet-agents/` comparte con producción los datos guardados en el navegador (API keys, cuentas, theme) y tiene el selector de themes de antes de FEAT-004;
  - el workflow de métricas de agents no tiene la protección por repositorio de DEV y puede estar mandando datos al GA4 de producción. No lo puedo verificar: no veo GitHub Actions.
- **Al migrar:** un test viejo que falla puede dejar DEV en rojo. Solo publico tandas que pasan en local.
- **Al archivar:** nada se pierde. Un repo archivado se lee igual y se puede desarchivar.

## Por qué te lo pregunto

Los dos repositorios y su GitHub Pages son tuyos. Archivarlos y apagar Pages solo lo podés hacer vos, y que el legado deje de existir como entorno es una decisión estratégica (DEC-018). La revisión de cada test y de cada archivo la hago yo.

## Opciones

- A — Plan completo: migro lo útil a gw2-factory-dev en el orden del informe (MIG-1 a MIG-6) y, al terminar, apagás Pages y archivás los dos repos.
- B — Migrar sin archivar: migro lo útil y los repos quedan como están, publicados.
- C — Archivar ya: apagás Pages y archivás ahora, y migro después leyendo los repos archivados.
- D — Posponer: no se toca nada por ahora.

## Recomendación

A, con un ajuste: apagá ya el GitHub Pages de los dos repos (Settings → Pages → Unpublish site). No depende de la migración y cierra hoy el riesgo de los datos compartidos. Archivar va al final, cuando te avise que MIG-6 terminó.
