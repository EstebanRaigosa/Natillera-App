# 📊 Análisis Completo del Sistema - Natillera App

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Modelo de Datos](#modelo-de-datos)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Flujos de Trabajo](#flujos-de-trabajo)
8. [Sistema de Seguridad y Permisos](#sistema-de-seguridad-y-permisos)
9. [Sistema de Auditoría](#sistema-de-auditoría)
10. [Reglas de Negocio](#reglas-de-negocio)
11. [APIs y Servicios](#apis-y-servicios)
12. [Despliegue y Configuración](#despliegue-y-configuración)
13. [Mantenimiento y Extensibilidad](#mantenimiento-y-extensibilidad)

---

## 🎯 Visión General

**Natillera App** es una plataforma web gratuita diseñada para gestionar natilleras comunitarias (sistemas de ahorro rotativo). El sistema permite a los administradores gestionar socios, cuotas personalizadas, préstamos internos, actividades generadoras de fondos y mantener un control completo de la contabilidad del fondo común.

### Objetivo Principal
Facilitar la gestión administrativa de natilleras comunitarias mediante una interfaz intuitiva, automatización de procesos y trazabilidad completa de todas las operaciones financieras.

### Características Clave
- ✅ Gestión completa de socios con cuotas individuales personalizadas
- ✅ Sistema de cuotas con estados automáticos (Programada, Pendiente, Mora, Pagada)
- ✅ Préstamos internos con cálculo de intereses (simple y compuesto)
- ✅ Sistema de multas y sanciones configurables
- ✅ Actividades generadoras de fondos (rifas, eventos, etc.)
- ✅ Comprobantes de pago y abonos con códigos únicos
- ✅ Sistema de auditoría completo
- ✅ Notificaciones vía WhatsApp (manual)
- ✅ Permisos de superusuario para administración global

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

El sistema sigue una **arquitectura de aplicación de página única (SPA)** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Views   │  │  Stores  │  │Components│             │
│  │  (UI)    │  │  (State) │  │ (Reuse)  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                     │
│       └─────────────┴─────────────┘                     │
│                    │                                     │
│              ┌─────▼─────┐                              │
│              │  Router   │                              │
│              │  (Vue)    │                              │
│              └─────┬─────┘                              │
└────────────────────┼────────────────────────────────────┘
                     │
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────┐
│              BACKEND (Supabase)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │   Auth       │  │   Storage    │ │
│  │  (Database)  │  │   (Users)    │  │   (Files)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS)                 │  │
│  │         Políticas de Seguridad                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Patrón de Diseño

- **Frontend**: Arquitectura basada en componentes (Vue 3 Composition API)
- **Estado Global**: Pinia stores para gestión de estado reactivo
- **Backend**: Supabase como BaaS (Backend as a Service)
- **Base de Datos**: PostgreSQL con Row Level Security (RLS)
- **Autenticación**: Supabase Auth con email/password y OAuth

### Flujo de Datos

```
Usuario → Vista (Vue Component) 
    → Store (Pinia) 
    → Supabase Client 
    → PostgreSQL Database
    → RLS Policies (Validación)
    → Respuesta → Store → Vista → Usuario
```

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vue.js** | 3.5.24 | Framework principal (Composition API) |
| **Vue Router** | 4.6.4 | Enrutamiento y navegación |
| **Pinia** | 3.0.4 | Gestión de estado global |
| **TailwindCSS** | 4.1.18 | Framework de estilos utility-first |
| **@heroicons/vue** | 2.2.0 | Iconos SVG |
| **html2canvas** | 1.4.1 | Generación de imágenes de comprobantes |
| **xlsx** / **xlsx-js-style** | 0.18.5 / 1.2.0 | Exportación a Excel |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Supabase** | 2.89.0 | BaaS (Backend as a Service) |
| **PostgreSQL** | (via Supabase) | Base de datos relacional |
| **Supabase Auth** | (via Supabase) | Autenticación y autorización |
| **Row Level Security** | (PostgreSQL) | Seguridad a nivel de fila |

### Herramientas de Desarrollo

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Vite** | 7.2.4 | Build tool y dev server |
| **PostCSS** | 8.5.6 | Procesamiento de CSS |
| **Autoprefixer** | 10.4.23 | Compatibilidad de CSS |

---

## 📁 Estructura del Proyecto

```
natillera-app/
├── public/                          # Archivos estáticos
│   ├── favicon.svg
│   └── vite.svg
│
├── src/                             # Código fuente principal
│   ├── assets/                      # Recursos estáticos (imágenes, etc.)
│   │   └── vue.svg
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── ChatWidget.vue          # Widget de chat de soporte
│   │   ├── DatePicker.vue          # Selector de fechas
│   │   ├── HelloWorld.vue          # Componente de ejemplo
│   │   └── NotificationToast.vue   # Notificaciones toast
│   │
│   ├── composables/                 # Composables Vue (lógica reutilizable)
│   │   └── useAuditoria.js         # Sistema de auditoría
│   │
│   ├── layouts/                     # Layouts de la aplicación
│   │   ├── AuthLayout.vue          # Layout para autenticación
│   │   └── DashboardLayout.vue     # Layout principal del dashboard
│   │
│   ├── lib/                         # Librerías y configuraciones
│   │   └── supabase.js             # Cliente de Supabase
│   │
│   ├── router/                      # Configuración de rutas
│   │   └── index.js                # Definición de rutas y guards
│   │
│   ├── stores/                      # Pinia stores (estado global)
│   │   ├── auth.js                 # Autenticación y sesión
│   │   ├── configuracion.js         # Configuración general
│   │   ├── cuotas.js               # Gestión de cuotas
│   │   ├── natilleras.js            # Gestión de natilleras
│   │   ├── notifications.js        # Sistema de notificaciones
│   │   ├── socios.js               # Gestión de socios
│   │   ├── support.js               # Sistema de soporte
│   │   └── users.js                # Gestión de usuarios
│   │
│   ├── utils/                       # Utilidades y helpers
│   │   ├── avatars.js              # Generación de avatares
│   │   ├── formatDate.js           # Formateo de fechas
│   │   └── ticketHelper.js         # Helpers para tickets de soporte
│   │
│   ├── views/                       # Vistas/páginas de la aplicación
│   │   ├── actividades/            # Gestión de actividades
│   │   │   └── Actividades.vue
│   │   ├── admin/                  # Panel de administración
│   │   │   ├── ChatAdmin.vue       # Chat de administración
│   │   │   └── DataAdmin.vue       # Administración de datos
│   │   ├── auditoria/              # Sistema de auditoría
│   │   │   └── Auditoria.vue
│   │   ├── auth/                   # Autenticación
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── ResetPassword.vue
│   │   │   └── Welcome.vue
│   │   ├── configuracion/          # Configuración
│   │   │   └── Configuracion.vue
│   │   ├── cuotas/                 # Gestión de cuotas
│   │   │   ├── Cuotas.vue          # Vista de cuotas por mes
│   │   │   └── CuotasMeses.vue     # Vista de meses
│   │   ├── natilleras/             # Gestión de natilleras
│   │   │   ├── NatilleraConfiguracion.vue
│   │   │   ├── NatilleraCrear.vue
│   │   │   ├── NatilleraDetalle.vue
│   │   │   └── Natilleras.vue
│   │   ├── prestamos/              # Gestión de préstamos
│   │   │   └── Prestamos.vue
│   │   ├── socios/                 # Gestión de socios
│   │   │   └── Socios.vue
│   │   ├── usuarios/               # Gestión de usuarios
│   │   │   └── Usuarios.vue
│   │   └── Dashboard.vue           # Dashboard principal
│   │
│   ├── App.vue                     # Componente raíz
│   ├── main.js                     # Punto de entrada
│   └── style.css                   # Estilos globales
│
├── supabase/                        # Configuración de base de datos
│   ├── migrations/                 # Migraciones SQL
│   │   ├── create_auditoria_system.sql
│   │   ├── add_full_superuser_permissions.sql
│   │   ├── add_codigo_comprobante.sql
│   │   └── ... (más migraciones)
│   ├── email-templates/            # Plantillas de email
│   └── schema.sql                  # Esquema principal de BD
│
├── .env                            # Variables de entorno (no en repo)
├── index.html                      # HTML principal
├── netlify.toml                    # Configuración de Netlify
├── package.json                    # Dependencias del proyecto
├── postcss.config.js               # Configuración de PostCSS
├── vite.config.js                  # Configuración de Vite
├── README.md                       # Documentación básica
├── REGLAS.md                       # Reglas de negocio
└── ANALISIS_SISTEMA.md             # Este documento
```

---

## 🗄️ Modelo de Datos

### Diagrama de Entidad-Relación

```
┌─────────────┐
│   users     │ (auth.users - Supabase)
│  (auth)     │
└──────┬──────┘
       │
       │ admin_id
       │
┌──────▼──────────┐
│   natilleras     │
│─────────────────│
│ id (PK)         │
│ admin_id (FK)   │
│ nombre          │
│ periodicidad    │
│ reglas_multas   │ (JSONB)
│ reglas_interes  │ (JSONB)
│ estado          │
└──────┬──────────┘
       │
       │ natillera_id
       │
┌──────▼──────────────┐      ┌─────────────┐
│  socios_natillera   │──────│   socios    │
│─────────────────────│      │─────────────│
│ id (PK)             │      │ id (PK)     │
│ natillera_id (FK)   │      │ nombre      │
│ socio_id (FK)       │      │ documento   │
│ valor_cuota_        │      │ telefono    │
│   individual        │      │ email       │
│ periodicidad        │      └─────────────┘
│ estado              │
└──────┬──────────────┘
       │
       │ socio_natillera_id
       │
┌──────▼──────────┐      ┌──────────────┐
│    cuotas      │      │  prestamos   │
│────────────────│      │──────────────│
│ id (PK)        │      │ id (PK)      │
│ socio_natillera│      │ socio_natillera_id
│   _id (FK)     │      │ monto        │
│ valor_cuota    │      │ interes      │
│ valor_pagado   │      │ saldo_actual │
│ fecha_limite   │      │ estado       │
│ estado         │      └──────┬───────┘
│ codigo_comprobante│          │
└──────────────────┘          │ prestamo_id
                              │
                    ┌─────────▼──────────┐
                    │  pagos_prestamo   │
                    │───────────────────│
                    │ id (PK)           │
                    │ prestamo_id (FK)  │
                    │ valor              │
                    │ codigo_comprobante│
                    └───────────────────┘
```

### Tablas Principales

#### 1. `natilleras`
Almacena la información de cada natillera.

**Campos principales:**
- `id` (UUID): Identificador único
- `admin_id` (UUID): Referencia al usuario administrador
- `nombre` (VARCHAR): Nombre de la natillera
- `periodicidad` (VARCHAR): 'semanal', 'quincenal', 'mensual'
- `reglas_multas` (JSONB): Configuración de multas y sanciones
- `reglas_interes` (JSONB): Configuración de intereses
- `estado` (VARCHAR): 'activa', 'cerrada', 'pausada'
- `mes_inicio`, `mes_fin`, `anio`: Período de operación

**Relaciones:**
- `admin_id` → `auth.users(id)`
- Una natillera tiene muchos `socios_natillera`
- Una natillera tiene muchas `actividades`

#### 2. `socios`
Datos personales de los participantes.

**Campos principales:**
- `id` (UUID): Identificador único
- `nombre` (VARCHAR): Nombre completo
- `documento` (VARCHAR): Documento único
- `telefono` (VARCHAR): Teléfono de contacto
- `email` (VARCHAR): Email de contacto

**Relaciones:**
- Un socio puede estar en múltiples natilleras (a través de `socios_natillera`)

#### 3. `socios_natillera`
Relación entre socios y natilleras con configuración individual.

**Campos principales:**
- `id` (UUID): Identificador único
- `natillera_id` (UUID): Referencia a la natillera
- `socio_id` (UUID): Referencia al socio
- `valor_cuota_individual` (DECIMAL): Valor de cuota personalizado
- `periodicidad` (VARCHAR): 'mensual' o 'quincenal'
- `estado` (VARCHAR): 'activo' o 'inactivo'

**Relaciones:**
- `natillera_id` → `natilleras(id)`
- `socio_id` → `socios(id)`
- Un `socio_natillera` tiene muchas `cuotas`
- Un `socio_natillera` tiene muchos `prestamos`

#### 4. `cuotas`
Cuotas generadas para cada socio por período.

**Campos principales:**
- `id` (UUID): Identificador único
- `socio_natillera_id` (UUID): Referencia al socio en la natillera
- `valor_cuota` (DECIMAL): Valor total de la cuota
- `valor_pagado` (DECIMAL): Valor pagado hasta el momento
- `fecha_limite` (DATE): Fecha límite de pago
- `fecha_pago` (TIMESTAMP): Fecha y hora del pago
- `mes`, `anio`, `quincena`: Identificación del período
- `estado` (VARCHAR): 'pendiente', 'pagada', 'parcial', 'mora', 'programada'
- `valor_multa` (DECIMAL): Multa aplicada si está en mora
- `codigo_comprobante` (VARCHAR): Código único del comprobante

**Relaciones:**
- `socio_natillera_id` → `socios_natillera(id)`

#### 5. `prestamos`
Préstamos internos del fondo común.

**Campos principales:**
- `id` (UUID): Identificador único
- `socio_natillera_id` (UUID): Socio que recibe el préstamo
- `monto` (DECIMAL): Monto total del préstamo
- `interes` (DECIMAL): Porcentaje de interés
- `saldo_actual` (DECIMAL): Saldo pendiente
- `estado` (VARCHAR): 'pendiente', 'activo', 'pagado', 'cancelado'
- `tipo_interes` (VARCHAR): 'simple' o 'compuesto'
- `interes_anticipado` (BOOLEAN): Si el interés se cobra al inicio
- `interes_total` (DECIMAL): Total de intereses calculados

**Relaciones:**
- `socio_natillera_id` → `socios_natillera(id)`
- Un préstamo tiene muchos `pagos_prestamo`

#### 6. `pagos_prestamo`
Abonos realizados a los préstamos.

**Campos principales:**
- `id` (UUID): Identificador único
- `prestamo_id` (UUID): Referencia al préstamo
- `valor` (DECIMAL): Valor del abono
- `fecha` (TIMESTAMP): Fecha del abono
- `codigo_comprobante` (VARCHAR): Código único del comprobante

**Relaciones:**
- `prestamo_id` → `prestamos(id)`

#### 7. `multas`
Multas aplicadas a socios.

**Campos principales:**
- `id` (UUID): Identificador único
- `socio_natillera_id` (UUID): Socio al que se aplica
- `valor` (DECIMAL): Valor de la multa
- `motivo` (TEXT): Razón de la multa
- `pagada` (BOOLEAN): Si la multa fue pagada

#### 8. `actividades`
Rifas, eventos y otras actividades generadoras de fondos.

**Campos principales:**
- `id` (UUID): Identificador único
- `natillera_id` (UUID): Natillera a la que pertenece
- `tipo` (VARCHAR): Tipo de actividad
- `descripcion` (TEXT): Descripción de la actividad
- `ingresos` (DECIMAL): Ingresos generados
- `gastos` (DECIMAL): Gastos incurridos
- `utilidad` (DECIMAL): Utilidad neta

#### 9. `auditoria`
Sistema completo de auditoría y trazabilidad.

**Campos principales:**
- `id` (UUID): Identificador único
- `usuario_id` (UUID): Usuario que realizó la acción
- `usuario_email` (VARCHAR): Email del usuario (backup)
- `natillera_id` (UUID): Natillera relacionada
- `tipo_accion` (VARCHAR): 'CREATE', 'UPDATE', 'DELETE', 'GENERATE', 'REGISTER', 'DOWNLOAD', 'SEND', 'RESEND', etc.
- `entidad` (VARCHAR): Tipo de entidad afectada
- `entidad_id` (UUID): ID de la entidad afectada
- `descripcion` (TEXT): Descripción legible de la acción
- `datos_anteriores` (JSONB): Estado anterior (para UPDATE)
- `datos_nuevos` (JSONB): Estado nuevo
- `cambios` (JSONB): Solo los campos que cambiaron
- `detalles` (JSONB): Información adicional
- `created_at` (TIMESTAMP): Fecha y hora del registro

#### 10. `historial_comprobantes`
Historial de cambios en códigos de comprobantes de cuotas.

**Campos principales:**
- `id` (UUID): Identificador único
- `cuota_id` (UUID): Referencia a la cuota
- `codigo_comprobante_anterior` (VARCHAR): Código anterior
- `codigo_comprobante_nuevo` (VARCHAR): Código nuevo
- `valor_pagado_anterior` (DECIMAL): Valor pagado anterior
- `valor_pagado_nuevo` (DECIMAL): Valor pagado nuevo
- `motivo` (VARCHAR): Razón del cambio
- `fecha_actualizacion` (TIMESTAMP): Fecha del cambio

#### 11. `historial_comprobantes_prestamo`
Historial de cambios en códigos de comprobantes de abonos.

**Campos principales:**
- Similar a `historial_comprobantes` pero para abonos de préstamos
- `pago_prestamo_id` (UUID): Referencia al pago

---

## ⚙️ Funcionalidades Principales

### 1. Gestión de Natilleras

**Creación de Natilleras:**
- Configuración de nombre, descripción, período de operación
- Definición de periodicidad (semanal, quincenal, mensual)
- Configuración de reglas de multas y sanciones
- Configuración de reglas de intereses para préstamos
- Asignación de administrador

**Configuración:**
- Reglas de multas (simple o escalonada)
- Días de gracia antes de aplicar multas
- Intereses adicionales por días de mora
- Reglas de intereses para préstamos
- Reasignación de natilleras (solo superusuario)

**Estados:**
- `activa`: Natillera en operación normal
- `cerrada`: Natillera finalizada
- `pausada`: Natillera temporalmente suspendida

### 2. Gestión de Socios

**Agregar Socios:**
- Registro de datos personales (nombre, documento, teléfono, email)
- Asignación de valor de cuota individual
- Configuración de periodicidad individual (mensual o quincenal)
- Generación automática de avatar único

**Características:**
- Un socio puede estar en múltiples natilleras
- Cada socio puede tener un valor de cuota diferente
- Cada socio puede tener periodicidad diferente
- Búsqueda y filtrado de socios
- Edición y eliminación de socios

### 3. Sistema de Cuotas

**Generación de Cuotas:**
- Generación automática por mes
- Soporte para periodicidad mensual y quincenal
- Cálculo automático de fechas límite
- Migración automática al cambiar periodicidad
- Preservación de pagos al migrar

**Estados de Cuotas:**
1. **Programada**: `fecha_actual < (fecha_limite - dias_gracia)`
2. **Pendiente**: `(fecha_limite - dias_gracia) <= fecha_actual <= fecha_limite`
3. **En Mora**: `fecha_actual > fecha_limite`
4. **Pagada**: `valor_pagado >= valor_cuota`
5. **Parcial**: `0 < valor_pagado < valor_cuota`

**Registro de Pagos:**
- Registro de pagos completos y parciales
- Generación automática de código único de comprobante
- Actualización automática de estado
- Cálculo automático de multas si aplica
- Registro de fecha de pago

**Comprobantes:**
- Generación de comprobantes visuales (imagen PNG)
- Código único alfanumérico de 8 caracteres
- Descarga de comprobantes
- Envío por WhatsApp (manual)
- Reenvío de comprobantes
- Historial de cambios de códigos

**Multas y Sanciones:**
- Multas simples (valor fijo)
- Multas escalonadas (según cantidad de cuotas en mora)
- Intereses adicionales por días de mora
- Aplicación automática al pasar a estado "mora"
- Recalculación dinámica de multas

### 4. Sistema de Préstamos

**Tipos de Préstamos:**
- **Interés Simple**: Se calcula sobre el monto inicial solamente
- **Interés Compuesto**: Se calcula sobre el capital + intereses acumulados

**Modalidades de Interés:**
- **Interés Anticipado**: Los intereses se descuentan al inicio del préstamo
- **Interés Mes Vencido**: Los intereses se calculan sobre lo pagado

**Funcionalidades:**
- Creación de préstamos con cálculo automático de intereses
- Cálculo por monto a recibir (interés anticipado)
- Registro de abonos con actualización de saldo
- Generación de comprobantes de abono
- Historial completo de pagos
- Edición y eliminación de préstamos y abonos
- Cálculo de intereses ganados

**Estados:**
- `pendiente`: Préstamo creado pero no activo
- `activo`: Préstamo en curso
- `pagado`: Préstamo completamente pagado
- `cancelado`: Préstamo cancelado

### 5. Actividades

**Tipos de Actividades:**
- Rifas
- Bingos
- Eventos
- Ventas
- Otros

**Funcionalidades:**
- Registro de ingresos y gastos
- Cálculo automático de utilidad
- Asociación a natilleras
- Historial de actividades

### 6. Sistema de Auditoría

**Tipos de Acciones Registradas:**
- `CREATE`: Creación de entidades
- `UPDATE`: Actualización de entidades
- `DELETE`: Eliminación de entidades
- `GENERATE`: Generación de cuotas, comprobantes, etc.
- `REGISTER`: Registro de pagos
- `DOWNLOAD`: Descarga de comprobantes
- `SEND`: Envío de comprobantes
- `RESEND`: Reenvío de comprobantes

**Entidades Auditadas:**
- natilleras
- socios
- socios_natillera
- cuotas
- pago
- comprobante
- prestamo
- pago_prestamo
- actividad
- multa
- configuracion

**Información Registrada:**
- Usuario que realizó la acción
- Fecha y hora exacta
- Descripción legible
- Datos anteriores y nuevos (para UPDATE)
- Solo campos que cambiaron (para UPDATE)
- Detalles adicionales específicos
- Natillera relacionada

**Características:**
- Registro en segundo plano (no bloquea la UI)
- Validación de UUIDs
- Manejo de errores silencioso
- Filtrado y búsqueda avanzada
- Acceso de superusuario a toda la auditoría

### 7. Sistema de Comprobantes

**Comprobantes de Pago de Cuotas:**
- Código único alfanumérico (8 caracteres)
- Generación automática al registrar pago
- Imagen PNG descargable
- Información del socio, valor, fecha, estado
- Soporte para pagos parciales
- Historial de cambios de código

**Comprobantes de Abono a Préstamo:**
- Código único alfanumérico
- Generación automática al registrar abono
- Imagen PNG descargable
- Información del préstamo, saldo anterior/nuevo
- Historial de cambios de código

**Funcionalidades:**
- Descarga de comprobantes
- Envío por WhatsApp (manual, con mensaje prellenado)
- Reenvío de comprobantes
- Búsqueda por código de comprobante
- Auditoría de descargas y envíos

### 8. Sistema de Notificaciones

**WhatsApp:**
- Generación de mensajes prellenados
- Apertura automática de WhatsApp Web/App
- Envío manual (no automatizado)
- Soporte para recordatorios de pago
- Envío de comprobantes

**Notificaciones en App:**
- Sistema de toasts para feedback inmediato
- Notificaciones de éxito, error, advertencia
- Notificaciones persistentes

### 9. Dashboard y Reportes

**Dashboard Principal:**
- Resumen de todas las natilleras
- Estadísticas globales
- Acceso rápido a funcionalidades

**Dashboard por Natillera:**
- Resumen financiero
- Estado de cuotas
- Préstamos activos
- Actividades recientes
- Socios en mora destacados

**Exportación:**
- Exportación a Excel de cuotas
- Exportación de reportes financieros

---

## 🔄 Flujos de Trabajo

### Flujo 1: Creación y Configuración de Natillera

```
1. Usuario crea cuenta → Autenticación
2. Usuario crea natillera → Configuración básica
3. Usuario configura reglas → Multas e intereses
4. Usuario agrega socios → Con cuotas individuales
5. Usuario genera cuotas → Por mes/período
6. Sistema actualiza estados → Automáticamente
```

### Flujo 2: Registro de Pago

```
1. Usuario selecciona cuota → Vista de cuotas
2. Usuario ingresa valor → Pago completo o parcial
3. Sistema registra pago → Actualiza valor_pagado
4. Sistema genera código → Código único de comprobante
5. Sistema actualiza estado → Pagada/Parcial
6. Sistema calcula multas → Si aplica
7. Sistema muestra comprobante → Modal de confirmación
8. Usuario descarga/envía → Comprobante
9. Sistema registra auditoría → Acción DOWNLOAD/SEND
```

### Flujo 3: Gestión de Préstamo

```
1. Usuario crea préstamo → Selecciona socio y monto
2. Sistema calcula intereses → Simple o compuesto
3. Sistema registra préstamo → Estado "activo"
4. Usuario registra abono → Valor del abono
5. Sistema actualiza saldo → Saldo_actual - valor
6. Sistema genera comprobante → Código único
7. Sistema verifica estado → Pagado si saldo = 0
8. Sistema registra auditoría → Acción REGISTER
```

### Flujo 4: Cambio de Periodicidad

```
1. Usuario cambia periodicidad → De mensual a quincenal (o viceversa)
2. Sistema detecta cambio → Compara periodicidad anterior
3. Sistema migra pagos → Suma o divide según caso
4. Sistema elimina cuotas antiguas → Con auditoría
5. Sistema crea cuotas nuevas → Con pagos migrados
6. Sistema registra auditoría → Acción cambio_periodicidad
```

### Flujo 5: Aplicación de Multas

```
1. Sistema verifica fechas → Diariamente
2. Sistema identifica cuotas en mora → fecha_actual > fecha_limite
3. Sistema obtiene configuración → Reglas de multas
4. Sistema calcula multa → Simple o escalonada
5. Sistema aplica multa → Actualiza valor_multa
6. Sistema calcula intereses adicionales → Si aplica
7. Sistema actualiza estado → A "mora"
```

---

## 🔐 Sistema de Seguridad y Permisos

### Autenticación

**Métodos de Autenticación:**
- Email/Password (Supabase Auth)
- OAuth (Google) - Configurable
- Recuperación de contraseña
- Confirmación de email

**Gestión de Sesión:**
- Tokens JWT gestionados por Supabase
- Refresh tokens automáticos
- Logout seguro
- Verificación de sesión en cada navegación

### Autorización (Row Level Security)

**Políticas RLS Implementadas:**

#### 1. Natilleras
- **SELECT**: Usuarios ven solo sus natilleras (admin_id = auth.uid()) o superusuario ve todas
- **INSERT**: Usuarios pueden crear natilleras (admin_id = auth.uid())
- **UPDATE**: Usuarios actualizan sus natilleras o superusuario actualiza todas
- **DELETE**: Usuarios eliminan sus natilleras o superusuario elimina todas

#### 2. Socios
- **SELECT**: Lectura pública (todos pueden ver)
- **INSERT**: Usuarios autenticados pueden crear
- **UPDATE**: Usuarios autenticados pueden actualizar o superusuario actualiza todas
- **DELETE**: Solo superusuario o admin de natillera relacionada

#### 3. Socios_Natillera
- **SELECT**: Usuarios ven socios de sus natilleras o superusuario ve todos
- **INSERT**: Usuarios agregan socios a sus natilleras o superusuario agrega a todas
- **UPDATE**: Usuarios actualizan socios de sus natilleras o superusuario actualiza todos
- **DELETE**: Usuarios eliminan socios de sus natilleras o superusuario elimina todos

#### 4. Cuotas
- **SELECT**: Usuarios ven cuotas de sus natilleras o superusuario ve todas
- **ALL**: Usuarios gestionan cuotas de sus natilleras o superusuario gestiona todas

#### 5. Préstamos
- **SELECT**: Usuarios ven préstamos de sus natilleras o superusuario ve todos
- **ALL**: Usuarios gestionan préstamos de sus natilleras o superusuario gestiona todos

#### 6. Pagos_Prestamo
- **SELECT**: Usuarios ven pagos de préstamos de sus natilleras o superusuario ve todos
- **INSERT**: Usuarios insertan pagos en préstamos de sus natilleras o superusuario inserta en todos
- **UPDATE**: Usuarios actualizan pagos de préstamos de sus natilleras o superusuario actualiza todos
- **DELETE**: Usuarios eliminan pagos de préstamos de sus natilleras o superusuario elimina todos

#### 7. Multas
- **ALL**: Usuarios gestionan multas de sus natilleras o superusuario gestiona todas

#### 8. Actividades
- **SELECT**: Usuarios ven actividades de sus natilleras o superusuario ve todas
- **ALL**: Usuarios gestionan actividades de sus natilleras o superusuario gestiona todas

#### 9. Auditoría
- **SELECT**: Usuarios ven auditoría de sus natilleras, donde ellos realizaron acciones, o superusuario ve toda
- **INSERT**: Usuarios autenticados pueden insertar registros
- **UPDATE**: Solo superusuario
- **DELETE**: Solo superusuario

### Superusuario

**Función:** `public.es_superusuario()`

**Email del Superusuario:** `raigo.16@gmail.com`

**Permisos:**
- Acceso completo (SELECT, INSERT, UPDATE, DELETE) a todas las tablas
- Puede ver, crear, modificar y eliminar cualquier registro
- Acceso a toda la auditoría del sistema
- Puede reasignar natilleras a otros usuarios
- Puede eliminar cualquier natillera, socio, cuota, préstamo, etc.

**Implementación:**
- Función SQL que verifica el email del usuario actual
- Integrada en todas las políticas RLS
- Verificación en el frontend para funcionalidades especiales

---

## 📝 Sistema de Auditoría

### Arquitectura del Sistema de Auditoría

El sistema de auditoría está diseñado para registrar **todas** las acciones realizadas en el sistema, proporcionando trazabilidad completa.

### Composable: `useAuditoria`

**Ubicación:** `src/composables/useAuditoria.js`

**Funciones Principales:**

1. **`registrar(params)`**: Función principal para registrar cualquier acción
   - Valida UUIDs
   - Obtiene información del usuario
   - Obtiene nombre de la natillera
   - Calcula cambios (para UPDATE)
   - Inserta registro en tabla `auditoria`

2. **`registrarCreacion()`**: Registra creación de entidades
3. **`registrarActualizacion()`**: Registra actualizaciones con cálculo de cambios
4. **`registrarEliminacion()`**: Registra eliminaciones
5. **`registrarGeneracion()`**: Registra generaciones (cuotas, comprobantes)
6. **`registrarPago()`**: Registra pagos
7. **`obtenerHistorial()`**: Obtiene historial con filtros

**Función Helper:**
- **`registrarAuditoriaEnSegundoPlano()`**: Ejecuta auditoría sin bloquear la UI

### Tipos de Acciones

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `CREATE` | Creación de entidades | Crear natillera, socio, préstamo, etc. |
| `UPDATE` | Actualización de entidades | Editar datos, cambiar estados |
| `DELETE` | Eliminación de entidades | Eliminar registros |
| `GENERATE` | Generación automática | Generar cuotas, comprobantes |
| `REGISTER` | Registro de pagos | Registrar pago de cuota, abono |
| `DOWNLOAD` | Descarga de comprobantes | Descargar comprobante |
| `SEND` | Envío de comprobantes | Enviar por WhatsApp |
| `RESEND` | Reenvío de comprobantes | Reenviar comprobante existente |

### Estructura de Registro de Auditoría

```javascript
{
  usuario_id: UUID,              // ID del usuario que realizó la acción
  usuario_email: String,         // Email del usuario (backup)
  natillera_id: UUID,            // ID de la natillera relacionada
  natillera_nombre: String,      // Nombre de la natillera (backup)
  tipo_accion: String,            // Tipo de acción (CREATE, UPDATE, etc.)
  entidad: String,                // Tipo de entidad (cuota, prestamo, etc.)
  entidad_id: UUID,               // ID de la entidad afectada
  descripcion: String,            // Descripción legible
  datos_anteriores: JSONB,       // Estado anterior (para UPDATE)
  datos_nuevos: JSONB,           // Estado nuevo
  cambios: JSONB,                // Solo campos que cambiaron
  detalles: JSONB,               // Información adicional
  created_at: Timestamp          // Fecha y hora
}
```

### Ejemplos de Uso

**Registrar creación:**
```javascript
const auditoria = useAuditoria()
await auditoria.registrarCreacion(
  'natillera',
  natilleraId,
  'Se creó la natillera "Ahorro Comunitario"',
  datosNatillera,
  natilleraId
)
```

**Registrar actualización:**
```javascript
await auditoria.registrarActualizacion(
  'cuota',
  cuotaId,
  'Se actualizó cuota de Juan Pérez',
  datosAnteriores,
  datosNuevos,
  natilleraId
)
```

**Registrar descarga de comprobante:**
```javascript
await auditoria.registrar({
  tipoAccion: 'DOWNLOAD',
  entidad: 'comprobante',
  entidadId: cuotaId,
  descripcion: 'Se descargó comprobante de pago',
  natilleraId: id,
  detalles: { codigo_comprobante: 'ABC12345', ... }
})
```

---

## 📋 Reglas de Negocio

### Estados de Cuotas

**Definición según REGLAS.md:**

1. **Programada**: `fecha_actual < (fecha_limite - dias_gracia)`
   - La cuota está programada para el futuro
   - Aún no es momento de pagar

2. **Pendiente**: `(fecha_limite - dias_gracia) <= fecha_actual <= fecha_limite`
   - La cuota está dentro del período de pago
   - Puede pagarse sin multa

3. **En Mora**: `fecha_actual > fecha_limite`
   - La fecha límite ha pasado
   - Se aplican multas automáticamente

4. **Pagada**: `valor_pagado >= valor_cuota`
   - La cuota está completamente pagada
   - Incluye multas si aplican

5. **Parcial**: `0 < valor_pagado < valor_cuota`
   - Hay un pago parcial
   - El estado puede ser Pendiente o Mora según la fecha

### Sistema de Multas

**Configuración (JSONB en `reglas_multas`):**

```json
{
  "activa": true,
  "dias_gracia": 3,
  "sanciones": {
    "tipo": "simple" | "escalonada",
    "valorFijo": 5000,
    "niveles": [
      { "cuotas": 1, "valor": 5000 },
      { "cuotas": 2, "valor": 10000 },
      { "cuotas": 3, "valor": 15000 }
    ],
    "interesesAdicionales": {
      "activo": true,
      "dias": 2,
      "valor": 1000
    }
  }
}
```

**Cálculo de Multas:**
- **Simple**: Valor fijo por cuota en mora
- **Escalonada**: Valor según cantidad de cuotas en mora del mismo socio
- **Intereses Adicionales**: Se suman cada X días después de la fecha límite

### Sistema de Intereses para Préstamos

**Tipos de Interés:**

1. **Interés Simple:**
   ```
   Interés = Monto × (Tasa / 100)
   ```

2. **Interés Compuesto:**
   ```
   Interés = Monto × ((1 + Tasa/100)^Períodos - 1)
   ```

**Modalidades:**

1. **Interés Anticipado:**
   - Los intereses se descuentan al inicio
   - El socio recibe: `Monto - Intereses`
   - El fondo presta: `Monto`

2. **Interés Mes Vencido:**
   - Los intereses se calculan sobre lo pagado
   - Se cobran al final de cada período

### Códigos de Comprobante

**Formato:**
- 8 caracteres alfanuméricos
- Caracteres permitidos: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Excluye: `I`, `O`, `0`, `1` (para evitar confusión)

**Generación:**
- Aleatorio
- Verificación de unicidad en base de datos
- Reintentos automáticos si hay colisión

**Historial:**
- Se guarda código anterior y nuevo cuando cambia
- Permite búsqueda por código antiguo
- Motivo del cambio registrado

---

## 🔌 APIs y Servicios

### Supabase Client

**Configuración:** `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Operaciones Principales

**Autenticación:**
```javascript
// Login
await supabase.auth.signInWithPassword({ email, password })

// Registro
await supabase.auth.signUp({ email, password })

// Logout
await supabase.auth.signOut()

// Obtener sesión
await supabase.auth.getSession()
```

**Consultas a Base de Datos:**
```javascript
// SELECT
await supabase
  .from('tabla')
  .select('*')
  .eq('campo', valor)

// INSERT
await supabase
  .from('tabla')
  .insert({ campo: valor })

// UPDATE
await supabase
  .from('tabla')
  .update({ campo: nuevoValor })
  .eq('id', id)

// DELETE
await supabase
  .from('tabla')
  .delete()
  .eq('id', id)
```

### Stores (Pinia)

**Estructura de un Store:**

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useMiStore = defineStore('miStore', () => {
  // Estado
  const datos = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const total = computed(() => datos.value.length)

  // Acciones
  async function fetchDatos() {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('tabla')
        .select('*')
      if (err) throw err
      datos.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { datos, loading, error, total, fetchDatos }
})
```

**Stores Principales:**

1. **`auth.js`**: Autenticación y sesión de usuario
2. **`natilleras.js`**: Gestión de natilleras
3. **`socios.js`**: Gestión de socios
4. **`cuotas.js`**: Gestión de cuotas y pagos
5. **`configuracion.js`**: Configuración general
6. **`notifications.js`**: Sistema de notificaciones
7. **`support.js`**: Sistema de soporte
8. **`users.js`**: Gestión de usuarios

---

## 🚀 Despliegue y Configuración

### Variables de Entorno

**Archivo `.env`:**
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

### Despliegue en Netlify

**Configuración (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Pasos:**
1. Conectar repositorio en Netlify
2. Configurar variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Base de Datos (Supabase)

**Migraciones:**
1. Ejecutar `supabase/schema.sql` primero
2. Ejecutar migraciones en orden cronológico
3. Verificar políticas RLS
4. Configurar funciones de superusuario

**Migraciones Importantes:**
- `create_auditoria_system.sql`: Sistema de auditoría
- `add_full_superuser_permissions.sql`: Permisos de superusuario
- `add_codigo_comprobante.sql`: Códigos de comprobante
- `add_comprobante_actions_to_auditoria.sql`: Acciones de comprobantes

---

## 🔧 Mantenimiento y Extensibilidad

### Extensión del Sistema

**Agregar Nueva Funcionalidad:**

1. **Crear Store (si es necesario):**
   ```javascript
   // src/stores/nuevaFuncionalidad.js
   export const useNuevaFuncionalidadStore = defineStore('nuevaFuncionalidad', () => {
     // Implementación
   })
   ```

2. **Crear Vista:**
   ```javascript
   // src/views/nuevaFuncionalidad/NuevaFuncionalidad.vue
   ```

3. **Agregar Ruta:**
   ```javascript
   // src/router/index.js
   {
     path: 'nueva-funcionalidad',
     name: 'NuevaFuncionalidad',
     component: NuevaFuncionalidad
   }
   ```

4. **Crear Migración (si necesita BD):**
   ```sql
   -- supabase/migrations/add_nueva_funcionalidad.sql
   ```

5. **Agregar Auditoría:**
   ```javascript
   const auditoria = useAuditoria()
   registrarAuditoriaEnSegundoPlano(
     auditoria.registrar({ ... })
   )
   ```

### Mejores Prácticas

1. **Siempre registrar auditoría** para acciones importantes
2. **Usar stores de Pinia** para estado compartido
3. **Validar permisos** antes de operaciones sensibles
4. **Manejar errores** de forma elegante
5. **Usar composables** para lógica reutilizable
6. **Documentar funciones** complejas
7. **Seguir convenciones** de nombres de Vue 3

### Puntos de Extensión

1. **Sistema de Notificaciones Automáticas:**
   - Integración con APIs de WhatsApp (Twilio, etc.)
   - Notificaciones por email
   - Notificaciones push

2. **Reportes Avanzados:**
   - Gráficos y visualizaciones
   - Reportes personalizados
   - Exportación a PDF

3. **Integraciones:**
   - Pasarelas de pago
   - Sistemas contables
   - APIs bancarias

4. **Funcionalidades Adicionales:**
   - Sistema de votaciones
   - Calendario de eventos
   - Chat interno
   - Documentos compartidos

---

## 📊 Métricas y Monitoreo

### Métricas Clave del Sistema

- **Usuarios activos**: Número de usuarios autenticados
- **Natilleras activas**: Natilleras en estado "activa"
- **Cuotas pendientes**: Cuotas no pagadas
- **Préstamos activos**: Préstamos en curso
- **Fondo total**: Suma de todos los fondos de natilleras
- **Intereses generados**: Total de intereses de préstamos

### Logging

- **Consola del navegador**: Logs de desarrollo
- **Auditoría**: Registro de todas las acciones
- **Errores**: Capturados y registrados en auditoría

---

## 🔍 Análisis de Seguridad

### Medidas de Seguridad Implementadas

1. **Row Level Security (RLS)**: Seguridad a nivel de fila en PostgreSQL
2. **Autenticación JWT**: Tokens seguros gestionados por Supabase
3. **Validación de UUIDs**: Verificación de IDs válidos
4. **Políticas de acceso**: Restricción de acceso por usuario
5. **Superusuario**: Control centralizado de permisos especiales
6. **Auditoría completa**: Trazabilidad de todas las acciones

### Vulnerabilidades Potenciales

1. **XSS**: Mitigado por Vue.js (escapado automático)
2. **CSRF**: Mitigado por Supabase (tokens seguros)
3. **SQL Injection**: Mitigado por Supabase (prepared statements)
4. **Exposición de datos**: Mitigado por RLS

---

## 📚 Referencias y Recursos

### Documentación Externa

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Archivos de Referencia en el Proyecto

- `README.md`: Guía rápida de inicio
- `REGLAS.md`: Reglas de negocio detalladas
- `supabase/schema.sql`: Esquema completo de base de datos
- `supabase/migrations/`: Historial de cambios en BD

---

## 🎯 Conclusiones

**Natillera App** es un sistema robusto y completo para la gestión de natilleras comunitarias, con:

- ✅ Arquitectura moderna y escalable
- ✅ Seguridad implementada a múltiples niveles
- ✅ Trazabilidad completa mediante auditoría
- ✅ Interfaz intuitiva y responsive
- ✅ Funcionalidades completas para gestión financiera
- ✅ Sistema de permisos flexible
- ✅ Extensibilidad para futuras funcionalidades

El sistema está diseñado para ser mantenible, escalable y fácil de extender, siguiendo las mejores prácticas de desarrollo moderno.

---

**Última actualización:** Diciembre 2024  
**Versión del sistema:** 0.0.0 (desarrollo activo)  
**Mantenido por:** Equipo de desarrollo Natillera

