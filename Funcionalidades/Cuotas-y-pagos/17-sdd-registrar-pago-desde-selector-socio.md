# SDD — «Registrar Pago» con selector de socio y cuota (Cuotas)

**Tipo:** especificación de diseño de software (SDD)  
**Vista:** `src/views/cuotas/Cuotas.vue`  
**Rutas:** `/natilleras/:id/cuotas/:mes`  
**Estado:** propuesto (pendiente de implementación)

---

## 1. Objetivo

Ofrecer un atajo explícito para **registrar un pago** sin tener que localizar primero la fila o tarjeta del socio en la lista principal. El flujo guía al usuario en dos pasos (socio → cuota del mes) y reutiliza el **modal de registro de pago** ya existente, con la misma lógica de negocio que hoy dispara `abrirModalPago(cuota)`.

---

## 2. Contexto en el producto

Hoy el registro de pago se abre desde:

- Acciones por cuota en las distintas vistas (tarjetas, lista, tabla, detalle).
- El modal de detalle de cuota incluye un botón «Registrar Pago» que cierra el detalle y abre el modal de pago.

La nueva entrada **no sustituye** esos caminos; los **complementa** para usuarios que piensan en términos de «primero el socio, luego la cuota».

Documentación relacionada:

- [06-registro-pago-orden-prioridades.md](./06-registro-pago-orden-prioridades.md) — orden de imputación y reglas del store.
- [13-modales-edicion-y-flujos-auxiliares.md](./13-modales-edicion-y-flujos-auxiliares.md) — modales auxiliares.
- [14-visual-layout-y-flujos-interaccion.md](./14-visual-layout-y-flujos-interaccion.md) — layout y flujos en pantalla.
- [15-tarjetas-socio-modal-pago-y-comprobante.md](./15-tarjetas-socio-modal-pago-y-comprobante.md) — modal de pago y comprobante.

---

## 3. Alcance

### Incluido

- Botón visible **«Registrar Pago»** en la vista de cuotas del mes.
- **Modal nueva** (primer nivel): selección de **socio** (lista filtrable o buscable, coherente con patrones ya usados en la app).
- Tras elegir socio: mostrar las **cuotas del mismo mes y año** que el período seleccionado en pantalla (`mesSeleccionado` / año operativo de la natillera, alineado con [02-periodo-mes-anio-y-filtrado.md](./02-periodo-mes-anio-y-filtrado.md)).
- Al elegir una **cuota**: cerrar el flujo del selector (o apilar correctamente) y abrir el **modal actual de registro de pago** con esa cuota, equivalente a llamar a `abrirModalPago(cuota)` con el objeto cuota ya cargado en memoria.
- En **móvil**: el botón de entrada al flujo es **flotante (FAB)**, con el **verde / gradiente** ya usado en la pantalla (referencia visual: `from-natillera-600 to-emerald-600`, sombra y anillo similares al botón flotante «Volver arriba» en `Cuotas.vue`).
- En **desktop / tablet (breakpoint acordado con el layout actual, p. ej. `md:`)**: mismo texto **«Registrar Pago»** integrado en la barra de acciones del header (junto a «Generar Cuotas» / acciones admin), sin FAB obligatorio.

### Fuera de alcance (explícito)

- Cambiar el modelo de datos, el store `registrarPago` o el contenido del modal de pago más allá de la **entrada** al flujo.
- Registrar pagos masivos o pagos sin asociar a una cuota concreta del mes.

---

## 4. Actores y permisos

- Misma regla que el resto de acciones de **registro/edición de pago** en la vista: usuarios con rol **visor** (`esVisor`) **no** ven el botón ni el flujo.
- Administradores y roles con permiso de gestión de pagos según la lógica actual de `Cuotas.vue` (alinear con `!esVisor` y cualquier condición adicional ya aplicada a los botones «Pagar» / «Registrar Pago» en la grilla).

---

## 5. Flujo de usuario

```text
[Cuotas del mes]
    → Usuario pulsa «Registrar Pago»
        → Modal A: lista de socios (activos / visibles según reglas actuales de cuotas)
            → Usuario selecciona un socio
                → Modal A muestra (o transiciona a) lista de cuotas de ESE socio
                    en el MES/AÑO del período actual de la pantalla
            → Usuario selecciona una cuota
                → Se cierra Modal A (o queda bajo el stack)
                → Se abre Modal B: registro de pago existente (abrirModalPago)
```

**Navegación hacia atrás dentro de Modal A:** permitir volver de «lista de cuotas del socio» a «lista de socios» sin cerrar todo el flujo hasta que el usuario cancele o complete el pago en Modal B.

---

## 6. Requisitos funcionales

| ID | Requisito |
|----|-----------|
| RF-1 | El texto del botón de entrada debe ser exactamente **«Registrar Pago»** (accesible: `aria-label` coherente si el FAB solo muestra icono). |
| RF-2 | Solo se muestra si el usuario puede registrar pagos (misma política que botones de pago en la lista). |
| RF-3 | La lista de socios debe incluir solo socios que la vista de cuotas ya considera relevantes para el mes (misma fuente que al construir cuotas/agrupaciones; excluir inactivos si así opera hoy la pantalla). |
| RF-4 | Tras seleccionar socio, mostrar **todas las filas de cuota** del período para ese `socio_id` en el mes/año actual (p. ej. natillera quincenal: hasta dos ítems). Cada ítem debe mostrar al menos: identificador de cuota/período, estado (pendiente, mora, pagada, parcial, programada), importe o total a pagar según patrón de la lista principal. |
| RF-5 | Al pulsar una cuota, invocar el mismo pipeline que **abrirModalPago**: preparación (`preparandoModalPago`), carga de actividades/préstamos pendientes, apertura del modal de pago. |
| RF-6 | Si el socio no tiene cuotas en el mes seleccionado: mensaje de estado vacío claro y opción de volver a la lista de socios o cerrar. |
| RF-7 | Si no hay socios elegibles: estado vacío en Modal A con copy breve. |
| RF-8 | Con **mes no seleccionado** o vista en estado de carga inicial: el botón puede permanecer deshabilitado u oculto según decisión de UX (recomendación: oculto o deshabilitado con tooltip hasta tener período válido). |

---

## 7. Diseño de interfaz

### 7.1 Desktop / tablet (`md` y superior)

- Botón secundario o primario según jerarquía visual del header: **«Registrar Pago»** con icono de dinero/comprobante alineado a botones existentes (`btn-primary` o variante verde/emerald si se usa para acción principal de recaudación).
- Ubicación: bloque derecho del header unificado (junto a «Generar Cuotas»), sin tapar el selector de período.

### 7.2 Móvil

- **FAB** fijo, visible en la vista de cuotas del mes cuando aplique RF-2.
- Estilo: gradiente **natillera → emerald**, forma circular o píldora extendida con icono + texto opcional; sombra y `touch-manipulation`; `z-index` por encima del contenido pero **coordinado** con:
  - barra inferior (`MobileBottomNav`, ~`z-[49]`),
  - botón existente «Volver arriba» (`z-[9999]`, `bottom-20 right-4`),
  - modales (`ModalWrapper` / overlays).
- **Recomendación de colisión:** colocar el FAB de «Registrar Pago» en **esquina inferior izquierda** en móvil, o subir/offset verticalmente respecto al «Volver arriba», de modo que no se solapen dos acciones primarias en el mismo punto.

### 7.3 Modal selector (Modal A)

- Implementar con **ModalWrapper** y pautas de [natillerapp-modals](../../.cursor/rules/natillerapp-modals.mdc) / skill de modales: scroll interno, safe-area, bloqueo de scroll del body donde corresponda, comportamiento iOS/Safari ([ios-safari-compat](../../.cursor/rules/ios-safari-compat.mdc)).
- Título sugerido: **«Registrar pago»** o **«Seleccionar socio»** en el primer paso y **«Cuotas de [mes]»** en el segundo.
- Lista con objetivos táctiles adecuados; búsqueda por nombre si la lista es larga (opcional pero deseable).

---

## 8. Diseño técnico (implementación orientativa)

- **Vista:** extender `Cuotas.vue` con estado reactivo (`modalRegistrarPagoSelector`, paso `socio` | `cuotas`, socio seleccionado, etc.) o extraer un componente `RegistrarPagoSelectorModal.vue` para mantener el archivo manejable.
- **Datos:** filtrar `cuotasMesActual` (o el arreglo que ya alimenta la pantalla) por `socio_id` del socio elegido; no requiere nueva query si las cuotas del mes ya están en memoria.
- **Apertura del pago:** función existente `abrirModalPago(cuota)` tras resolver la referencia de cuota completa (mismo shape que en la grilla).
- **Stack de modales:** al abrir Modal B desde Modal A, cerrar Modal A primero para evitar doble overlay y problemas de foco/scroll; documentar en código si se prefiere mantener ambos por requisito de «volver atrás» (en ese caso, definir orden de `z-index` y cierre al finalizar pago).

---

## 9. Casos límite y reglas de negocio

- **Cuota ya pagada:** si desde la lista principal se permite «editar pago» o solo ver, el selector debe **replicar la misma disponibilidad** por ítem (no habilitar «registrar» donde hoy no exista).
- **Cambio de mes mientras Modal A está abierto:** al cerrar o invalidar el modal si el período cambia (watch sobre `mesSeleccionado`).
- **Errores de red** al preparar el modal de pago: reutilizar feedback existente (`preparandoModalPago`, toasts/errores del store).

---

## 10. Criterios de aceptación (pruebas)

1. Usuario no visor ve «Registrar Pago» en desktop en el header y FAB en móvil (cuando hay período válido y datos cargados).  
2. Flujo completo: socio → cuota → modal de pago muestra los mismos totales y opciones que al abrir desde la tarjeta de esa misma cuota.  
3. Visor no accede al flujo.  
4. iOS Safari: scroll del modal selector y del modal de pago sin «fondo que se mueve»; cierre con overlay/back consistente con el resto de modales.  
5. No solapamiento crítico entre FAB, bottom nav y «Volver arriba» en viewports pequeños.

---

## 11. Seguimiento

- Tras implementación, actualizar este documento con el estado **implementado** y enlazar PR o commit.
- Valorar entrada en tours guiados (`tour-cuotas-*`) si el producto lo requiere.
