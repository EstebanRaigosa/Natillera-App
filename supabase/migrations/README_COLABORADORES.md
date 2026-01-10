# Sistema de Colaboradores para Natilleras

Este documento describe cómo implementar el sistema de colaboradores que permite a múltiples usuarios acceder y gestionar una misma natillera con permisos granulares.

## Archivos de Migración

Ejecuta estos archivos en orden en el **Supabase SQL Editor**:

### 1. `create_natillera_colaboradores.sql`
Crea la tabla de colaboradores y funciones auxiliares:
- `natillera_colaboradores`: Tabla principal con invitaciones y permisos
- `tiene_acceso_natillera()`: Función para verificar acceso
- `tiene_permiso_natillera()`: Función para verificar permisos específicos
- `obtener_rol_natillera()`: Función para obtener el rol del usuario
- `aceptar_invitacion_colaborador()`: Función RPC para aceptar invitaciones
- `rechazar_invitacion_colaborador()`: Función RPC para rechazar invitaciones
- Vista `vista_colaboradores_natillera`: Vista con información expandida

### 2. `update_rls_for_colaboradores.sql`
Actualiza todas las políticas RLS para soportar colaboradores:
- Políticas actualizadas para `natilleras`, `socios_natillera`, `cuotas`, `prestamos`, `pagos_prestamo`, `multas`, `actividades`, `historial`, `auditoria`
- Funciones auxiliares para obtener `natillera_id` desde IDs relacionados

## Roles Disponibles

| Rol | Descripción |
|-----|-------------|
| `co_administrador` | Todos los permisos excepto eliminar la natillera |
| `colaborador` | Permisos personalizados según configuración |
| `visor` | Solo lectura, sin capacidad de modificar |

## Permisos Granulares

| Permiso | Descripción |
|---------|-------------|
| `ver` | Puede ver la información de la natillera |
| `editar_socios` | Puede agregar, editar y eliminar socios |
| `gestionar_cuotas` | Puede registrar pagos, multas y gestionar cuotas |
| `gestionar_prestamos` | Puede crear y gestionar préstamos |
| `gestionar_actividades` | Puede crear y gestionar actividades |
| `ver_auditoria` | Puede ver el historial de cambios |
| `configurar` | Puede modificar configuración y gestionar colaboradores |

## Estados de Invitación

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Invitación enviada, esperando respuesta |
| `aceptada` | Usuario aceptó la invitación |
| `rechazada` | Usuario rechazó la invitación |
| `revocada` | Admin revocó el acceso del colaborador |

## Flujo de Uso

1. **Invitar colaborador**: El admin envía invitación desde la configuración de la natillera
2. **Notificación**: El usuario invitado ve la invitación en su sidebar
3. **Aceptar/Rechazar**: El usuario puede aceptar o rechazar la invitación
4. **Acceso**: Si acepta, la natillera aparece en su lista de "Compartidas Conmigo"
5. **Gestión**: El colaborador puede realizar acciones según sus permisos

## Verificación de Permisos en el Frontend

```javascript
// En un componente Vue
import { useColaboradoresStore } from '@/stores/colaboradores'

const colaboradoresStore = useColaboradoresStore()

// Verificar un permiso específico
const puedeGestionarCuotas = await colaboradoresStore.tienePermiso(natilleraId, 'gestionar_cuotas')

// Obtener el rol del usuario
const miRol = await colaboradoresStore.obtenerMiRol(natilleraId)

// Obtener todos mis permisos en una natillera
const misPermisos = await colaboradoresStore.obtenerMisPermisos(natilleraId)
```

## Notas Importantes

1. El **administrador original** (admin_id) siempre tiene todos los permisos
2. El **superusuario** (configurado en el código) tiene acceso a todo
3. Los colaboradores solo ven las natilleras donde fueron aceptados
4. Revocar el acceso no elimina el registro, solo cambia el estado a `revocada`
5. Los permisos se almacenan como JSONB para flexibilidad futura

