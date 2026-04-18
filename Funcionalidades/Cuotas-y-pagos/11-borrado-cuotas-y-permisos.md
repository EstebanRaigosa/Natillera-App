# 11 — Borrado de cuotas del mes y permisos

**Superusuario (mismo correo en toda la app):** inventario completo de pantallas, stores y controles en [Permisos-superusuario-raigo.md](../Permisos-superusuario-raigo.md).

## Borrado masivo: `borrarCuotasMes`

**Quién:** Botón visible si **`!esVisor && esUsuarioAdmin`** (`computed`: `authStore.userEmail === 'raigo.16@gmail.com'` en `Cuotas.vue`).

**Condición:** Debe haber **`cuotasPendientesMes.length > 0`**.

**`cuotasPendientesMes`:** cuotas del mes cuyo `estado` es `pendiente`, `mora` o `programada` — **excluye** `pagada` y `parcial`.

### Operación en base de datos

1. Calcula **`anioCorrecto`** con `calcularAnioMes`.
2. Obtiene todos los `socios_natillera` de la natillera (para auditoría).
3. **SELECT** cuotas a eliminar: mismo mes/año, estados en `['pendiente','mora','programada']`.
4. **DELETE** con los mismos filtros (por `socio_natillera_id` in list).
5. **Auditoría** masiva con listado de ids y socios.
6. **`fetchCuotasNatillera(id)`** y **`recalcularSancionesMes()`**.

## Rol visor

**`esVisor`:** `miRol === 'visor'` → oculta acciones de generar/borrar/editar según la plantilla (el visor ve listados y resúmenes según diseño).

## Admin natillera

**`esAdmin`:** `natillera.admin_id === usuarioAutenticado.id` — usado en otros contextos de la vista (colaboradores / socios).

## Toggle `no_calcular_multa`

Pensado para el mismo email **admin** `raigo.16@gmail.com` (`esUsuarioAdmin`).

## Notas de seguridad

Las políticas **RLS** en Supabase deben restringir delete/update; la documentación de código asume que el cliente autenticado tiene permisos. Para replicar en backend, validar rol en Edge Function o RPC.
