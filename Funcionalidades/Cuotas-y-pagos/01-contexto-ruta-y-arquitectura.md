# 01 — Contexto, ruta y arquitectura

## Ubicación en el producto

- **Ruta:** `natilleras/:id/cuotas/:mes` (nombre de ruta `Cuotas` en `src/router/index.js`).
- **Vista principal:** `src/views/cuotas/Cuotas.vue`.
- **Navegación previa:** desde `CuotasMeses.vue` (`/natilleras/:id/cuotas`) el usuario elige un mes; la app navega a `/natilleras/:id/cuotas/:mes`.

## Props y parámetros

La vista define:

```js
defineProps({
  id: String,    // id de la natillera
  mes: String    // mes 1–12 desde la ruta
})
```

También se usa `route.params` como respaldo (`const id = props.id || route.params.id`).

## Dependencias principales

| Módulo | Uso |
|--------|-----|
| `useCuotasStore` | Lista de cuotas, `fetchCuotasNatillera`, `generarCuotasPeriodo`, `registrarPago`, `calcularSancionesTotales`, `actualizarCuota`, etc. |
| `useNatillerasStore` | Contexto de natillera (p. ej. admin). |
| `useSociosStore` | Flujos de socio en modales. |
| `useColaboradoresStore` | Datos de colaboradores si aplica. |
| `useAuthStore` | Usuario y email. |
| `supabase` | Consultas directas desde la vista (actividades, préstamos, historial, borrado masivo en algunos casos). |
| `useAuditoria` | Registro de auditoría en borrados y acciones sensibles. |

## Ciclo de vida de carga (resumen)

1. **`cargarNatillera()`** — Una consulta a `natilleras` (con caché en memoria `natilleraConfigCache`) para: nombre, `mes_inicio`, `mes_fin`, `anio` / `anio_inicio`, `reglas_multas`. Con ello se fijan `diasGracia`, `sancionesActivas`, `anioNatillera` y el `mesSeleccionado` (desde ruta o mes actual dentro del rango).
2. **`cuotasStore.fetchCuotasNatillera(id)`** — Carga `socios_natillera` + `cuotas` y ejecuta (salvo `skipMoraUpdate`) actualización automática de mora y recálculo de multas.
3. **`cargarConteoSocios()`** — Conteo de socios activos mensuales vs quincenales para textos del modal de generación y verificación de cuotas faltantes.
4. Tras tener datos, **`recalcularSancionesMes()`** si las sanciones están activas.
5. Cargas diferidas según interacción: actividades por socio/cuota, cuotas de préstamos, historial de pagos al abrir modales.

## Pantallas y modales relevantes (funcional)

- Selector de mes (móvil/desktop), resumen de tarjetas (pagadas / pendientes / mora / total recaudado / %).
- Panel de filtros (estado, periodicidad, tipo de pago, búsqueda).
- Vistas de lista: tarjetas, Excel (desktop), lista compacta, agrupada por socio.
- Modal **Generar cuotas** (fechas quincenales, mes, todos los socios o un socio).
- Modal **Registrar pago** (valor, tipo efectivo/transferencia, actividades, préstamos, confirmación).
- Modal **Editar pago/cuota**, **detalle cuota**, **comprobante**, **exportar Excel**, **borrar cuotas del mes**, **detalle/editar socio** (flujos auxiliares).

## Archivos de código clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/views/cuotas/Cuotas.vue` | UI, reglas de presentación, muchos cálculos de UI, integración actividades/préstamos, GMF, confirmación de pago. |
| `src/stores/cuotas.js` | Persistencia cuotas, mora, sanciones, `registrarPago`, generación masiva, utilidades por sanción, historial. |

## Sincronización store ↔ vista

- El store mantiene `cuotas` como lista plana con `socio_natillera` embebido por fila.
- La vista filtra por `mes`/`anio` con `getCuotasPorMes` y aplica reglas extra (socios inactivos, `estadoReal`).
