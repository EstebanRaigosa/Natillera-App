# Especificación — <Nombre de la funcionalidad>

| Campo | Valor |
|-------|-------|
| **Módulo** | <Cuotas / Préstamos / Socios / Actividades / …> |
| **Estado** | Borrador \| En revisión \| Aprobada \| Implementada |
| **Versión** | 1.0 |
| **Fecha** | AAAA-MM-DD |
| **Autor** | <nombre> |
| **Ruta(s) de la app** | `/natilleras/:id/<…>` |
| **Archivos previstos** | `src/views/<…>.vue`, `src/stores/<…>.js` |

---

## 1. Objetivo

Una o dos frases: qué problema resuelve y para quién. Sin detalles de implementación.

## 2. Contexto y alcance

**Dentro del alcance**
- …

**Fuera del alcance** (explícito, no implícito)
- …

**Supuestos**
- …

## 3. Actores y permisos

| Actor | Puede | No puede |
|-------|-------|----------|
| Administrador de natillera | … | … |
| Colaborador | … | … |
| Socio (portal) | … | … |
| Superusuario (`raigo.16@gmail.com`) | … | — |

## 4. Requisitos funcionales

Un requisito por fila. ID estable e irrepetible.

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | El sistema debe … | Must |
| RF-02 | El sistema debe … | Should |

### Detalle por requisito

#### RF-01 — <título>
- **Descripción:** …
- **Entradas:** … (campo, tipo, obligatoriedad, formato)
- **Validaciones:** …
- **Salida / efecto:** …
- **Errores:** qué mensaje se muestra y qué ocurre con el estado.

## 5. Reglas de negocio

| ID | Regla | Origen |
|----|-------|--------|
| RN-01 | … | Config natillera / normativa interna |

Incluir fórmulas exactas (montos, sanciones, fechas, redondeos) y su comportamiento en
bordes: valor cero, valor negativo, mes sin cuotas, socio inactivo, periodicidad quincenal.

## 6. Modelo de datos

| Tabla | Campos usados | Lectura/Escritura | Notas |
|-------|---------------|-------------------|-------|
| `…` | `…` | R / W | … |

Migraciones necesarias: `migrations/<archivo>.sql` (o «ninguna»).

## 7. Interfaz de usuario

- **Layout móvil:** …
- **Layout desktop:** …
- **Estados de pantalla:** carga, vacío, error, sin permisos, éxito.
- **Modales:** listar cada uno; deben usar `ModalWrapper` (skill `natillerapp-modals`).
- **Iconos:** `@heroicons/vue/24/outline`.
- **Color marca:** `#1B5E37`; backdrop salvia `#C8D9C8`.

## 8. Requisitos no funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Funciona en iPhone/Safari sin romper Android (`CLAUDE.md` §1). |
| RNF-02 | Área táctil mínima 44×44 px; inputs con `font-size` ≥ 16 px. |
| RNF-03 | Respeta `env(safe-area-inset-*)` y `100dvh` con fallback. |
| RNF-04 | <rendimiento / límites de datos / accesibilidad> |

## 9. Criterios de aceptación

Formato Dado / Cuando / Entonces. Cada criterio referencia el requisito que valida.

- **CA-01 (RF-01):**
  - *Dado* que …
  - *Cuando* …
  - *Entonces* …

- **CA-02 (RN-01):**
  - *Dado* que …
  - *Cuando* …
  - *Entonces* …

## 10. Casos borde y errores esperados

| # | Situación | Comportamiento esperado |
|---|-----------|-------------------------|
| 1 | Sin conexión a Supabase | … |
| 2 | Natillera con periodicidad quincenal | … |
| 3 | Socio inactivo | … |

## 11. Preguntas abiertas

| # | Pregunta | Responsable | Estado |
|---|----------|-------------|--------|
| 1 | … | … | Abierta |

## 12. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | AAAA-MM-DD | Versión inicial |
