# Especificaciones

Carpeta de **especificaciones funcionales** de Natillerapp. Cada especificación describe
**qué debe hacer** una funcionalidad (comportamiento, reglas de negocio, criterios de
aceptación) **antes o durante** su desarrollo.

> Diferencia con `Funcionalidades/`: allí se documenta lo que **ya está construido**
> (descripción del código actual). Aquí se define lo que **debe construirse** y sirve de
> contrato para revisión y pruebas.

## Estructura

```
Especificaciones/
├── README.md                       ← este índice
├── _plantilla-especificacion.md    ← plantilla base (copiar para cada nueva spec)
└── <funcionalidad>/
    ├── especificacion.md           ← la especificación
    ├── revision.md                 ← informe del agente revisor-especificacion
    └── casos-de-prueba.md          ← salida del agente casos-de-prueba
```

## Flujo de trabajo

El ciclo tiene **dos entradas** y **dos retornos**. Diagrama:
https://claude.ai/code/artifact/20cb4a0d-4a5b-4467-9642-6775bb4040ea

**Entradas**

| Entrada | Qué hace el paso 1 |
|---------|--------------------|
| Funcionalidad **por construir** | Define el comportamiento deseado antes de desarrollar |
| Funcionalidad **ya construida** | Documenta lo verificado en el código y especifica solo los vacíos |

**Pasos**

1. **Especificar** — copiar `_plantilla-especificacion.md` a
   `Especificaciones/<funcionalidad>/especificacion.md` y completarla **leyendo el código real**.
   Cada requisito lleva estado: 🟢 construido · 🟡 parcial · 🔴 por construir.
   Una especificación nunca describe lo que se supone que hace el código: describe lo verificado.
2. **Desarrollar** — solo lo marcado 🔴. Si todo estaba construido, este paso se salta y la
   especificación pasa directo a revisión como auditoría.
3. **Revisar** — agente `revisor-especificacion` → `revision.md`.
4. **Probar** — agente `casos-de-prueba` → `casos-de-prueba.md`. Corre en paralelo al paso 3.
5. **Cerrar** — corregir los hallazgos bloqueantes y volver al paso 3 hasta que no queden.

**Retornos** (la parte que importa: una revisión que nunca devuelve nada no está revisando)

- Especificación incompleta o ambigua → vuelve al **paso 1**.
- Hallazgos bloqueantes o requisitos sin cobertura → vuelven al **paso 2**.

Los agentes **no se lanzan solos** al terminar una especificación: se invocan cuando se pidan.

## Reglas para toda especificación

- Cada requisito tiene **ID estable** (`RF-01`, `RN-03`, `RNF-02`) — los agentes los usan
  como referencia cruzada. Nunca reciclar un ID.
- Los criterios de aceptación se escriben en formato **Dado / Cuando / Entonces**.
- Toda spec con UI debe declarar explícitamente su comportamiento en **móvil (iOS/Safari)**
  y desktop; aplica `CLAUDE.md` §1 y la skill `ios-safari-compat`.
- Toda spec que incluya modales referencia la skill `natillerapp-modals`.
- Lo que quede **fuera de alcance** se escribe; no se deja implícito.

## Índice de especificaciones

| Funcionalidad | Estado | Especificación | Revisión | Casos de prueba |
|---------------|--------|----------------|----------|-----------------|
| Chat de soporte | Borrador v2.0 · 3 preguntas abiertas | [especificacion.md](./chat-soporte/especificacion.md) | pendiente | pendiente |
| Portal del Socio | Borrador | [especificacion.md](./portal-socio/especificacion.md) | pendiente | pendiente |
| Eliminar pago de cuota | v1.3 · pendiente RF-12 | [especificacion.md](./eliminar-pago-cuota/especificacion.md) | pendiente | pendiente |
| Préstamos | [Benchmark competitivo v1.0](./prestamos/benchmark-competitivo.md) · spec por escribir | — | — | — |
