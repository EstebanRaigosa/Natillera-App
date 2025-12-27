# 🌱 Natillera - Plataforma de Ahorro Comunitario

Plataforma web gratuita para gestionar natilleras comunitarias con cuotas personalizadas por socio, préstamos internos, actividades y más.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)

## ✨ Características

- 📊 **Dashboard intuitivo** - Visualiza el estado de tus natilleras
- 👥 **Gestión de socios** - Cuotas individuales personalizadas
- 💰 **Control de pagos** - Registro de cuotas, pagos parciales y mora
- 🏦 **Préstamos internos** - Con cálculo de intereses
- 🎟️ **Actividades** - Rifas, bingos y eventos que generan fondos
- 📱 **WhatsApp** - Envío manual de recordatorios
- 🔐 **Autenticación** - Login con email o Google

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
cd natillera-app
npm install
```

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve al SQL Editor y ejecuta el contenido de `supabase/schema.sql`
4. Copia la URL y la clave anónima del proyecto

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

### 5. Construir para producción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
natillera-app/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── layouts/          # Layouts de la app
│   ├── lib/              # Cliente de Supabase
│   ├── router/           # Configuración de rutas
│   ├── stores/           # Pinia stores
│   ├── views/            # Páginas de la aplicación
│   │   ├── auth/         # Login y registro
│   │   ├── natilleras/   # Gestión de natilleras
│   │   ├── socios/       # Gestión de socios
│   │   ├── cuotas/       # Gestión de cuotas
│   │   ├── prestamos/    # Préstamos internos
│   │   └── actividades/  # Rifas, eventos, etc.
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── supabase/
│   └── schema.sql        # Esquema de base de datos
└── package.json
```

## 🗄️ Modelo de Datos

| Tabla | Descripción |
|-------|-------------|
| `natilleras` | Información de cada natillera |
| `socios` | Datos personales de participantes |
| `socios_natillera` | Relación socio-natillera con cuota individual |
| `cuotas` | Cuotas generadas por período |
| `prestamos` | Préstamos internos del fondo |
| `pagos_prestamo` | Abonos a préstamos |
| `multas` | Multas aplicadas |
| `actividades` | Rifas, eventos, ventas |
| `historial` | Auditoría de acciones |

## 🌐 Despliegue Gratuito

### Frontend (Netlify)

1. Conecta tu repositorio en [Netlify](https://netlify.com)
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Backend (Supabase)

El backend ya está alojado en Supabase de forma gratuita.

## 📱 Notificaciones WhatsApp

El sistema genera mensajes prellenados que se abren en WhatsApp Web/App para envío manual. Esto cumple con:

- ✅ Costo cero
- ✅ Legalidad (sin APIs no autorizadas)
- ✅ Control humano
- ✅ Cero riesgo de bloqueo

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea tu rama de feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## 🌱 Filosofía

La plataforma está diseñada para ser:

- **Comunitaria** - Para el beneficio de todos
- **Gratuita** - Sin costos ocultos
- **Transparente** - Toda la información visible
- **Fácil de usar** - Accesible para todos
- **Solidaria** - Promoviendo la cultura del ahorro

---

Hecho con ❤️ para las comunidades de ahorro
