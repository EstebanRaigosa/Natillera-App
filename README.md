<div align="center">

# 🥧 Natillerapp

**La plataforma para gestionar tu natillera: ahorro colectivo, cuotas, socios y préstamos en un solo lugar.**

Aplicación web instalable (PWA) que funciona en celular y computador — sin planillas de Excel, sin cuadernos, sin cuentas dudosas.

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.89-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-ffd859?style=flat-square&logo=vue.js&logoColor=black)](https://pinia.vuejs.org)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-1B5E37?style=flat-square)](LICENSE)

[🌐 natillerapp.com](https://natillerapp.com) · [📋 Análisis del sistema](ANALISIS_SISTEMA.md) · [📐 Reglas de desarrollo](REGLAS_DESARROLLO.md)

</div>

---

## 🚀 Empezar

### Requisitos

| Requisito | Versión | Notas |
|---|---|---|
| **Node.js** | `>= 18` (recomendado 20/22 LTS) | El proyecto usa ESM (`"type": "module"`) |
| **npm** | `>= 9` | Viene con Node |
| **Proyecto Supabase** | — | URL + `anon key` del proyecto ([supabase.com](https://supabase.com)) |

> 💡 Solo necesitas la **URL** y la **anon key** de Supabase para levantar la app. El resto de variables son opcionales.

### 1 · Instalar dependencias

```bash
npm install
```

### 2 · Configurar variables de entorno

Crea un archivo **`.env`** en la raíz del proyecto:

```env
# ── Obligatorias ─────────────────────────────────────────
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# ── Opcionales ───────────────────────────────────────────
# Verificación por SMS (Twilio Verify). Si se omite, usa la Edge Function del propio proyecto.
VITE_TWILIO_API_URL=
VITE_TWILIO_VERIFICATION_SID=

# Proxy para consultar resultados de Lotería de Medellín (rifas)
VITE_LOTERIA_MEDELLIN_PROXY_URL=

# Host público para HMR cuando expones el dev server con ngrok/túnel
VITE_DEV_PUBLIC_HOST=
```

> ⚠️ **`.env` está en `.gitignore`** — nunca lo subas al repositorio.
> Si faltan las variables de Supabase, la app arranca pero muestra un warning en consola y no podrá autenticar.

### 3 · Preparar la base de datos

Aplica los scripts SQL a tu proyecto Supabase (SQL Editor o CLI). El orden importa:

```
supabase/schema.sql          → esquema base
migrations/001..018_*.sql    → migraciones incrementales, en orden numérico
supabase/migrations/         → migraciones gestionadas por Supabase CLI
```

Los `.sql` sueltos en la raíz (`AGREGAR_CAMPO_*.sql`, `FIX_*.sql`, …) son parches puntuales ya incorporados; consúltalos solo como referencia histórica.

### 4 · Levantar el proyecto

```bash
npm run dev
```

👉 Disponible en **http://localhost:5174** (el dev server escucha en `0.0.0.0`, así que también puedes abrirlo desde el celular en tu LAN: `http://192.168.x.x:5174`).

---

## 📜 Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en el puerto `5174` |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run scrape:loteria` | Actualiza el catálogo de sorteos de la Lotería de Medellín |

---

## ✨ Módulos

| Módulo | Descripción |
|---|---|
| 🏦 **Natilleras** | Crear, configurar, administrar y cerrar natilleras con reparto de utilidades |
| 👥 **Socios** | Gestión de socios, invitaciones y estados |
| 💰 **Cuotas** | Cuotas mensuales/quincenales, moras, sanciones, desglose de pago e impuesto 4×1000 |
| 🤝 **Préstamos** | Solicitud, aprobación, medios de entrega y seguimiento de abonos |
| 🎉 **Actividades** | Actividades y rifas (con integración de Lotería de Medellín) para fondeo del grupo |
| 🧮 **Cuadre de caja** | Conciliación de movimientos y saldos |
| 🔍 **Auditoría** | Trazabilidad de acciones sobre los datos |
| ⚙️ **Configuración** | Parámetros de la natillera y del usuario |
| 🛡️ **Roles** | `admin` · `colaborador` · `socio`, con RLS aplicado en Supabase |

Además: **PWA instalable** con soporte offline, tours guiados de onboarding (`driver.js`), exportación a Excel (`xlsx-js-style`), notificaciones y verificación por SMS vía Twilio.

---

## 🧱 Stack

- **Framework** — Vue 3 (Composition API + `<script setup>`)
- **Estilos** — Tailwind CSS 4
- **Estado** — Pinia (+ `pinia-plugin-persistedstate`)
- **Backend** — Supabase (Postgres, Auth, RLS, Edge Functions)
- **Build** — Vite 5 + `vite-plugin-pwa`
- **Iconos** — Heroicons (`@heroicons/vue/24/outline`)
- **Deploy** — Netlify (`netlify.toml`)

---

## 📁 Estructura

```
src/
├── views/          Vistas por módulo (natilleras, cuotas, prestamos, socios, …)
├── components/     Componentes reutilizables (ModalWrapper, etc.)
├── composables/    Lógica reutilizable (useBodyScrollLock, useNatiscroll, useIsIos, …)
├── stores/         Stores de Pinia (auth, natilleras, cuotas, socios, …)
├── services/       Integraciones externas (twilio)
├── lib/            Cliente de Supabase
├── router/         Rutas y guards
├── config/         Entorno y flags
├── utils/          Utilidades (lotería, fechas, formato)
└── data/           Datos estáticos (catálogo de sorteos)

migrations/         Migraciones SQL incrementales
supabase/           Esquema, migraciones CLI, Edge Functions y plantillas de email
docs/               Documentación técnica
```

---

## 🎨 Convenciones

### Diseño

- **Verde marca** `#1B5E37` · velo salvia `#C8D9C8` para backdrops
- Tipografía de títulos: `font-display` · cuerpo: sans por defecto
- Preferir clases Tailwind sobre CSS custom

### Modales

Todo modal, diálogo u overlay usa **`ModalWrapper`** con el patrón definido en [`.claude/skills/natillerapp-modals`](.claude/skills/natillerapp-modals/SKILL.md): cabecera compacta, un solo scroll, acciones al final, `useBodyScrollLock` y natiscroll cuando el cuerpo es scrolleable.

### iOS / Safari

Es **obligatorio** que todo lo nuevo funcione en iPhone y Safari sin romper Android. Reglas clave: `100dvh` con fallback, `env(safe-area-inset-*)`, inputs con `font-size >= 16px`, `touch-action: manipulation`, área táctil mínima 44×44 px. Detalle completo en [`docs/compatibilidad-ios-safari.md`](docs/compatibilidad-ios-safari.md).

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) en imperativo y sin punto final:

```
feat(cuotas): tratar mensual en quincenal como 2 quincenas para sanción
fix(prestamos): corregir cálculo de saldo tras abono parcial
```

Tipos: `feat` · `fix` · `chore` · `docs` · `style` · `refactor` · `perf` · `test`

---

## 🚢 Deploy

Configurado para **Netlify**:

```toml
command = "npm run build"
publish = "dist"
```

Incluye redirect SPA (`/* → /index.html`) y headers `no-cache` para `sw.js`, `registerSW.js` y `manifest.webmanifest` — críticos para que la PWA reciba actualizaciones. **Recuerda cargar las variables `VITE_*` en el panel de Netlify.**

---

## 📚 Documentación adicional

| Documento | Contenido |
|---|---|
| [`ANALISIS_SISTEMA.md`](ANALISIS_SISTEMA.md) | Análisis funcional completo del sistema |
| [`REGLAS_DESARROLLO.md`](REGLAS_DESARROLLO.md) | Reglas y estándares de desarrollo |
| [`REGLAS.md`](REGLAS.md) | Reglas de negocio de la natillera |
| [`CLAUDE.md`](CLAUDE.md) | Guía para asistentes de IA en este repo |
| [`docs/compatibilidad-ios-safari.md`](docs/compatibilidad-ios-safari.md) | Patrones y checklist iOS/Safari |
| [`SOLUCION_FECHAS_ZONA_HORARIA.md`](SOLUCION_FECHAS_ZONA_HORARIA.md) | Manejo de fechas y zona horaria |

---

<div align="center">

**MIT** © [Esteban Raigosa](https://github.com/EstebanRaigosa) — ver [LICENSE](LICENSE)

Hecho en Colombia 🇨🇴 para que las natilleras sean transparentes.

</div>
