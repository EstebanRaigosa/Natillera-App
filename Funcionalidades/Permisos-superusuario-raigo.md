# Permisos especiales — superusuario (`raigo.16@gmail.com`)

En el código, el correo **`raigo.16@gmail.com`** se usa como **superusuario**: acciones de soporte, auditoría global y operaciones que no deben estar disponibles para el resto de administradores. La comprobación es casi siempre **literal** (string fijo, a veces con `toLowerCase().trim()`).

**Nota de mantenimiento:** cambiar el correo implica buscar en todo el repo `raigo.16@gmail.com` y alinear políticas RLS / funciones SQL (`REGLAS_DESARROLLO.md` menciona `public.es_superusuario()` en base de datos).

---

## Resumen por área

| Área | Archivo / store | Qué obtiene solo este usuario |
|------|-------------------|-------------------------------|
| **Listado de natilleras** | `stores/natilleras.js` (`fetchNatilleras`) | Ve **todas** las natilleras (no solo `admin_id = user.id`). El resto solo ve las propias; se excluyen duplicados por colaboraciones. |
| **Reasignar administrador** | `stores/natilleras.js` (`reasignarNatillera`) | Solo el superusuario puede ejecutar la acción (error si no). UI en **Configuración** de la natillera. |
| **Eliminar natillera** | `stores/natilleras.js` (`eliminarNatillera`) | Puede eliminar **cualquier** natillera; otros solo la suya. |
| **Sidebar / contexto** | `layouts/DashboardLayout.vue` (`isSuperAdmin`) | Si la API de permisos no respondió, se infiere **administrador** en rutas de natilleras ajenas para poder navegar. |
| **Dashboard (inicio)** | `views/Dashboard.vue` (`esUsuarioRaigo`) | Pines de natilleras, borde **teal** en tarjetas cuyo propietario **no** es raigo, cinta “De otro usuario”, migración localStorage→Supabase, carga de emails de propietarios. |
| **Detalle natillera** | `views/natilleras/NatilleraDetalle.vue` | **Recordatorio personal** (modal, persistencia en Supabase, solo ese email). |
| **Cuotas** | `views/cuotas/Cuotas.vue` (`esUsuarioAdmin`) | **Generar cuotas**, **borrar cuotas pendientes del mes**, checkbox **No calcular multa** por cuota. |
| **Cuadre de caja** | `views/cuadre/CuadreCaja.vue` | Cuenta como **admin** aunque no sea `admin_id` de la natillera; `puedeGestionarCuotas` y permisos amplios. |
| **Cierre de natillera** | `views/natilleras/NatilleraCierre.vue` | `esAdmin` incluye superusuario → puede operar cierre como si fuera el dueño. |
| **Configuración** | `views/natilleras/NatilleraConfiguracion.vue` | Bloque **Reasignar administrador** (UI + flujo). |
| **Auditoría** | `views/auditoria/Auditoria.vue` | Filtros extra: **Natillera** y **Usuario** (lista global). |
| **Soporte / chat interno** | `stores/support.js` | Solo ese email ve contador y gestión de mensajes de soporte. |
| **Data admin / Chat admin** | `views/admin/DataAdmin.vue`, `ChatAdmin.vue` | `ALLOWED_EMAIL` — acceso a pantallas de administración de datos y chat. |
| **Base de datos** | `migrations/007_prestamos_rls_insert_policy.sql` (ejemplo) | Políticas RLS que permiten INSERT condicionado al email del superusuario. |

---

## Detalle por componente

### `Cuotas.vue` — `esUsuarioAdmin`

```js
authStore.userEmail === 'raigo.16@gmail.com'
```

- Botones **Generar cuotas** y **Borrar cuotas del mes** (además de `!esVisor`).
- Checkbox **No calcular multa** en cada tarjeta de cuota (doc [11-borrado-cuotas-y-permisos](./Cuotas-y-pagos/11-borrado-cuotas-y-permisos.md), [04-sanciones](./Cuotas-y-pagos/04-sanciones-multas-reglas-calculo.md)).

### `Dashboard.vue` — `esUsuarioRaigo`

Comparación con `toLowerCase().trim()` al mismo correo.

- **Pinear** natilleras y UI asociada (iconos, eliminar pin).
- **Borde teal** cuando la natillera es de **otro** propietario (no raigo) para distinguirlas visualmente.
- **Cinta** “De otro usuario” en tarjetas ajenas.
- Lógica de exclusión/listado pensada para que el superusuario no mezcle contextos indebidos al pinar.

### `NatilleraDetalle.vue` — recordatorio

Constante `RECORDATORIO_EMAIL = 'raigo.16@gmail.com'`: modal y persistencia de recordatorios personales; resto de usuarios no ve el control.

### `natilleras` store

- **Carga:** query sin filtrar por `admin_id` si `esSuperUsuario`.
- **`reasignarNatillera`:** guard de superusuario obligatorio.
- **`eliminarNatillera`:** superusuario o admin de la natillera.

### `Auditoria.vue`

`esSuperUsuario`: segunda fila de filtros (natillera + usuario).

### Admin y soporte

- `DataAdmin.vue` / `ChatAdmin.vue`: entrada condicionada a `ALLOWED_EMAIL`.
- `support.js`: `isAdmin()` para contador y operaciones sobre `chat_messages`.

---

## Qué **no** implica

- **Rol visor** (`esVisor`) sigue ocultando acciones de edición aunque exista un superusuario en otras pantallas; en Cuotas, generar/borrar/multa siguen condicionados a `esUsuarioAdmin` y no visor.
- Sustituir el email por una **tabla de roles** en BD sería un refactor aparte; hoy el modelo es **hardcode** + RLS/funciones SQL donde aplica.
