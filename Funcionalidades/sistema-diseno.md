# Sistema de Diseño — Natillerapp

Referencia única para color, tipografía, espaciado, componentes e interacción
en la app. La fuente canónica de verdad está en
[`src/style.css`](../src/style.css); este documento explica el _porqué_ y
cómo aplicar el sistema. Para modales hay además dos skills vivas:
`natillerapp-modals` (`.claude/skills/`) y `ios-safari-compat`.

> **Estado actual.** El patrón está validado en los **modales** (header verde
> bosque + cuerpo blanco + CTA pill). Las vistas **Socios**, **Actividades**,
> **Cuotas** y **Préstamos** aún usan gradientes mixtos legacy y deben migrar
> a las clases `.ds-*` definidas aquí.

---

## 1. Principios

1. **Una sola tipografía: Mulish.** Variable 200–1000 + itálicas. Sirve para
   títulos, cuerpo y etiquetas técnicas (con tracking ancho). Cero variantes
   de fuente extra → menos peso, más coherencia.
2. **Verde bosque `#1B5E37` como única expresión de marca.** Sin gradientes
   teal/emerald en superficies primarias. El gradiente queda reservado para
   acentos (CTA accent naranja) y efectos de fondo decorativos puntuales.
3. **iOS-first.** Áreas táctiles ≥ 44 px, `font-size` ≥ 16 px en inputs,
   `100dvh`, `env(safe-area-inset-*)`, `translate3d(0,0,0)` en cards modales.
   Reglas completas en la skill `ios-safari-compat`.
4. **Un patrón, un componente.** Si el modal lo resolvió, la vista lo hereda
   con el mismo lenguaje (icono marca + título + subtítulo + acciones).
5. **Migración progresiva.** Las clases legacy (`.btn-primary`, `.card`,
   `.stat-card`, `.nova-*`) **siguen funcionando**. Las nuevas `.ds-*`
   conviven; cada vista se migra cuando se toque.

---

## 2. Tokens

### 2.1 Tipografía

```
--font-display       → 'Mulish', system-ui, …    (títulos, h1–h6, números KPI)
--font-body          → 'Mulish', system-ui, …    (texto general, inputs)
--font-brand-mono    → 'Mulish', system-ui, …    (alias para overlines/etiquetas
                                                   técnicas; usar tracking ancho
                                                   y uppercase con .ds-overline)
```

Mulish es **una sola fuente** que cubre todo. El alias `--font-brand-mono`
existe solo para no romper utilidades existentes; visualmente es Mulish con
`letter-spacing: 0.16em` + `text-transform: uppercase`.

**Escala recomendada (clases Tailwind):**

| Uso                 | Móvil          | ≥ sm           | Peso | Tracking  |
|---------------------|----------------|----------------|------|-----------|
| Title de página H1  | `text-xl`      | `text-2xl`     | 800  | `-0.01em` |
| Title sección       | `text-lg`      | `text-xl`      | 700  | `-0.01em` |
| Title card          | `text-base`    | `text-lg`      | 700  | normal    |
| Cuerpo              | `text-sm`      | `text-base`    | 400  | normal    |
| Cuerpo secundario   | `text-xs`      | `text-sm`      | 400  | normal    |
| Overline / tag      | `text-[11px]`  | `text-xs`      | 700  | `0.16em` + uppercase |
| KPI numérico        | `text-2xl`     | `text-3xl`     | 800  | `-0.02em` |

### 2.2 Color

#### Marca (verde bosque)

| Token                       | Valor      | Uso                                    |
|-----------------------------|------------|----------------------------------------|
| `--brand-primary`           | `#1B5E37`  | CTA primario, header de modal, iconos  |
| `--brand-primary-hover`     | `#154a2d`  | hover                                  |
| `--brand-primary-active`    | `#124228`  | active / pressed                       |
| `--brand-primary-soft`      | `#E8F5E9`  | callouts, fondos suaves                |
| `--brand-primary-soft-2`    | `#d6ecd9`  | hover sobre soft                       |
| `--brand-shell-deep`        | `#0f3d22`  | shell de navegación                    |
| `--brand-backdrop-sage`     | `#C8D9C8`  | velo salvia para modales (70 %)        |

#### Escala paleta (Tailwind via `@theme`)

| Familia          | 50 → 900  | Uso                                    |
|------------------|-----------|----------------------------------------|
| `natillera-*`    | verde     | superficies/borders del ecosistema marca |
| `accent-*`       | naranja   | CTA secundario (Actividades), highlights |

#### Estados semánticos

| Token              | Valor      | Uso        |
|--------------------|------------|------------|
| `--brand-success`  | `#15803d`  | confirmaciones |
| `--brand-warning`  | `#b45309`  | atención    |
| `--brand-danger`   | `#dc2626`  | error / destructivo |
| `--brand-info`     | `#1d4ed8`  | informativo |

> **Anti-patrón.** No usar gradientes `from-emerald-50/50 to-teal-100/70`
> ni `from-natillera-200/30 to-emerald-200/20` como fondo de **superficies
> primarias** (page header, cards de KPI). Quedan solo para halos
> decorativos detrás (z-index negativo) si se necesita textura.

### 2.3 Superficies y sombras

| Token                       | Valor                                  |
|-----------------------------|----------------------------------------|
| `--surface-canvas`          | `hsl(220 13% 92%)` (lienzo del panel)  |
| `--surface-card`            | `#ffffff`                              |
| `--surface-muted`           | `#f8fafc`                              |
| `--surface-divider`         | `rgba(15, 23, 42, 0.08)`               |
| `--surface-divider-strong`  | `rgba(15, 23, 42, 0.12)` (inputs)      |
| `--shadow-xs`               | tarjetas en reposo                     |
| `--shadow-sm`               | hover suave / inputs focus             |
| `--shadow-md`               | cards elevated / hover de KPI          |
| `--shadow-lg`               | empty states / modales                 |
| `--shadow-brand`            | CTA primario (tinte verde)             |

Las sombras están **tintadas con verde marca** (`rgba(15, 83, 45, …)`) para
mantener cohesión incluso fuera del foco visual.

### 2.4 Radios

| Token            | Valor    | Uso                                       |
|------------------|----------|-------------------------------------------|
| `--radius-sm`    | 8 px     | chips, inputs pequeños                    |
| `--radius-md`    | 12 px    | inputs estándar, botones rectangulares    |
| `--radius-lg`    | 16 px    | cards de contenido                        |
| `--radius-xl`    | 20 px    | page headers, modales (esquinas superiores) |
| `--radius-2xl`   | 24 px    | empty states, hero cards                  |
| `--radius-pill`  | 9999 px  | CTA principal, badges                     |

### 2.5 Áreas táctiles y espaciado

| Token            | Valor    | Uso                                       |
|------------------|----------|-------------------------------------------|
| `--tap-min`      | 44 px    | mínimo iOS — botones X, ghost, secundarios |
| `--tap-cta`      | 48 px    | CTA primario                              |

Inputs: `padding: 0.75rem 1rem` y `font-size: 16px` (evita zoom Safari).

---

## 3. Componentes (`.ds-*`)

Implementados como `@layer components` en `src/style.css`. Conviven con las
clases legacy; usar **siempre `.ds-*`** en código nuevo.

### 3.1 Page header

**Patrón unificado para Socios, Actividades, Cuotas, Préstamos.** Reemplaza
los headers con gradiente teal de hoy.

```html
<header class="ds-page-header">
  <div class="ds-page-header__row">
    <div class="ds-page-header__lead">
      <BackButton :to="…" :inline="true" />
      <div class="ds-page-header__icon">
        <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div class="min-w-0">
        <h1 class="ds-page-header__title">Socios</h1>
        <p class="ds-page-header__sub">Gestiona los participantes y sus cuotas</p>
      </div>
    </div>
    <div class="ds-page-header__actions">
      <button class="ds-btn ds-btn--secondary">Importar CSV</button>
      <button class="ds-btn ds-btn--primary">
        <PlusIcon class="w-5 h-5" /> Agregar Socio
      </button>
    </div>
  </div>
</header>
```

### 3.2 Botones

| Clase                       | Uso                                      |
|-----------------------------|------------------------------------------|
| `.ds-btn .ds-btn--primary`  | CTA principal (verde marca, sombra brand) |
| `.ds-btn .ds-btn--secondary`| CTA secundaria (blanco + borde verde)    |
| `.ds-btn .ds-btn--ghost`    | acción terciaria sobre fondo claro       |
| `.ds-btn .ds-btn--danger`   | borrar / acción destructiva              |
| `.ds-btn .ds-btn--accent`   | naranja (Actividades, highlights)        |
| `.ds-btn--block`            | modificador: ocupa todo el ancho         |

Características: pill (`rounded-full`), `min-height: 44 px` (`48 px` para
primary), `active:scale(0.98)`, `touch-action: manipulation`,
`-webkit-tap-highlight-color: transparent`.

### 3.3 Tarjetas

| Clase                  | Uso                                         |
|------------------------|---------------------------------------------|
| `.ds-card`             | tarjeta base (lista, detalle inline)        |
| `.ds-card.ds-card--hover` | con elevación al pasar el ratón          |
| `.ds-card.ds-card--elevated` | sombra md desde el inicio              |
| `.ds-card.ds-card--brand` | gradiente blanco→verde muy sutil + borde marca (resaltar destacados) |

### 3.4 Stat card (KPI)

```html
<div class="ds-stat-card">
  <div class="ds-stat-card__icon">
    <BanknotesIcon class="w-5 h-5" />
  </div>
  <p class="ds-stat-card__value">${{ formatMoney(totalPrestado) }}</p>
  <p class="ds-stat-card__label">Prestado</p>
</div>
```

Reemplaza los KPIs con cuatro gradientes distintos (natillera/accent/blue/green)
en Préstamos. La diferenciación se hace con **iconos** y semántica, no con
colores arbitrarios.

### 3.5 Empty state

Patrón validado en _Sin socios_ (NatilleraDetalle) y `UsernameModal`. Útil
también como vista cero de páginas completas.

```html
<div class="ds-empty-state">
  <div class="ds-empty-state__header">
    <div class="ds-empty-state__icon-wrap">
      <UsersIcon class="w-7 h-7" />
    </div>
    <h3 class="ds-empty-state__title">No hay socios registrados</h3>
    <p class="ds-empty-state__subtitle">
      Agrega el primer socio para comenzar a gestionar las cuotas
    </p>
  </div>
  <div class="ds-empty-state__body">
    <button class="ds-btn ds-btn--primary ds-btn--block">
      <PlusIcon class="w-5 h-5" /> Agregar Primer Socio
    </button>
  </div>
</div>
```

### 3.6 Inputs y formularios

```html
<label class="ds-label">Nombre <span class="text-red-500">*</span></label>
<input v-model="nombre" class="ds-input" :class="{ 'ds-input--error': error }" />
```

### 3.7 Badges, callout, overline

```html
<span class="ds-badge ds-badge--brand">Mensual</span>
<span class="ds-badge ds-badge--success">Pagada</span>

<div class="ds-callout">
  <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
  <div>
    <span class="ds-callout__title">Importante</span>
    <span>Este nombre se mostrará en el perfil.</span>
  </div>
</div>

<span class="ds-overline">Filtros</span>
```

---

## 4. Modales

**Estado: estandarizados.** No requieren cambios; cualquier modal nuevo o
editado debe seguir el patrón de la skill `natillerapp-modals`:

- `<ModalWrapper>` siempre.
- Cabecera marca compacta (~20 % menor que la histórica): móvil = una fila
  (icono + textos + X), desktop = bloque centrado (icono arriba, textos
  debajo, X en flex — **nunca `position: absolute`** sobre la card en iOS).
- Cuerpo blanco, **un solo scroll**, acciones al final dentro del mismo
  cuerpo (no pie fijo salvo excepción justificada).
- Backdrop salvia 70 % (`bg-[#C8D9C8]/70` Android/desktop;
  `.modal-wrapper-ios__backdrop--sage` en iOS).
- `useBodyScrollLock(refBoolean)` siempre.

Las clases `.ds-btn--primary`, `.ds-callout`, `.ds-input`, `.ds-label`
también se aplican dentro de modales para reforzar consistencia.

---

## 4.bis Nati-Notificación

Sistema de toast del DS. Reemplaza al antiguo `NotificationToast.vue` (que
mezclaba 4 paletas con gradientes y glows incompatibles con la identidad
verde bosque + Mulish).

### Variantes

| Variante       | Color barra/icon         | Uso                                       | Duración default |
|----------------|--------------------------|-------------------------------------------|------------------|
| `informacion`  | `--brand-primary`        | mensaje neutro / confirmación blanda      | 5000 ms          |
| `exito`        | `--brand-success`        | acción completada con éxito               | 4500 ms          |
| `alerta`       | `--brand-warning` ámbar  | advertencia, requiere atención            | 6500 ms          |
| `critica`      | `--brand-danger` rojo    | error grave / acción destructiva          | 8000 ms          |

> El tipo `critica` añade además un sutil tinte rosado al fondo de la card y
> dispara `role="alert"` + `aria-live="assertive"` para lectores de pantalla.

### Anatomía

- Card blanca, borde sutil, **sombra `lg`** tintada en verde marca.
- **Riel lateral izquierdo** (4 px) en color de variante.
- **Barra de progreso superior** (2 px, mismo color) que indica el tiempo
  restante; se oculta con `prefers-reduced-motion`.
- Icono `outline` (Heroicons) en cuadrado redondeado con fondo soft.
- Título Mulish 700, mensaje Mulish 400 en gris pizarra.
- Botón cerrar (X) ghost con área táctil cómoda.
- Stack vertical en la esquina superior derecha (con safe-area), expansión
  full-width bajo 480 px.
- Animación: entrada `translate3d(110%, 0, 0)` con curva spring suave;
  salida con fade lateral; respeta `prefers-reduced-motion`.

### API (Pinia store)

```js
import { useNotificationStore } from '@/stores/notifications'

const nati = useNotificationStore()

// Canónica (recomendada para código nuevo)
nati.informacion('Cambios guardados')
nati.exito('Pago registrado', 'Listo')
nati.alerta('La cuota mensual vence mañana')
nati.critica('No se pudo conectar con el servidor', 'Sin conexión')

// Personalizada
nati.show({
  type: 'alerta',
  title: 'Atención',
  message: 'Esta acción no se puede deshacer',
  duration: 10000   // 0 = no auto-cerrar
})

// Utilidades
nati.remove(id)
nati.clear()
```

### Compatibilidad legacy

Las llamadas existentes `success/error/warning/info` siguen funcionando
como alias:

| Legacy            | Variante DS    |
|-------------------|----------------|
| `success(msg)`    | `exito`        |
| `error(msg)`      | `critica`      |
| `warning(msg)`    | `alerta`       |
| `info(msg)`       | `informacion`  |

No es necesario migrar las 196 llamadas existentes; se pueden ir cambiando
a la API canónica de forma orgánica al tocar cada vista.

### Archivos

| Archivo                                       | Rol                                  |
|-----------------------------------------------|--------------------------------------|
| `src/components/NatiNotificacion.vue`         | Componente del toast (variantes CSS) |
| `src/stores/notifications.js`                 | Pinia store + API canónica + alias   |
| `src/App.vue`                                 | Montaje único `<NatiNotificacion />` |

---

## 5. Plan de migración (vistas pendientes)

Migración por vista, en este orden (impacto visual descendente):

### 5.1 Socios — `src/views/socios/Socios.vue`

- [ ] Header: reemplazar `bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 …`
      y el icono `bg-emerald-500` por `.ds-page-header` + `.ds-page-header__icon`.
- [ ] Botón _Agregar Socio_ → `.ds-btn .ds-btn--primary`.
- [ ] Botón _Importar CSV_ → `.ds-btn .ds-btn--secondary`.
- [ ] Empty state «No hay socios» → `.ds-empty-state`.
- [ ] Card socio: simplificar gradiente
      `from-white via-natillera-50/30 to-emerald-50/20` → `.ds-card`.
- [ ] Quitar las elipses gigantes de `from-natillera-200/30 to-emerald-200/20`
      en el fondo (`-z-10`); con la paleta unificada ya no aportan jerarquía.

### 5.2 Cuotas — `src/views/cuotas/Cuotas.vue`

- [ ] Headers desktop y móvil → `.ds-page-header` (mantiene las dos variantes
      sm:hidden / hidden sm:block).
- [ ] CTA «Generar Cuotas» / «Registrar Pago» → `.ds-btn--primary` (sin
      gradiente custom `from-natillera-600 to-emerald-600`).
- [ ] CTA «Borrar Cuotas» → `.ds-btn--danger`.
- [ ] Tabs de meses tipo carpeta: mantener (es UX clara), pero alinear el
      borde activo a `var(--brand-primary)`.

### 5.3 Préstamos — `src/views/prestamos/Prestamos.vue`

- [ ] Header → `.ds-page-header`.
- [ ] Botón «Nuevo Préstamo» → `.ds-btn--primary`.
- [ ] Cuatro KPIs (Total Préstamos / Prestado / Pagado / Intereses) →
      `.ds-stat-card`. Diferenciar por icono, no por gradiente. Si se
      requiere acento numérico (intereses ganados), usar `.ds-stat-card`
      con valor en `var(--brand-success)` puntual.
- [ ] Empty state → `.ds-empty-state`.

### 5.4 Actividades — `src/views/actividades/Actividades.vue`

- [ ] Header → `.ds-page-header` (mantener icono `--brand-primary`; el
      acento naranja queda solo para el CTA).
- [ ] CTA «Nueva Actividad» → `.ds-btn--accent` (única vista con accent;
      es intencional: rifas/eventos rompen la rutina de pagos).
- [ ] Modal de bienvenida ya cumple el patrón modales — **no tocar**.

---

## 6. Reglas obligatorias (resumen operativo)

1. **Tipografía:** Mulish para todo. No volver a importar Outfit / DM Sans /
   Inter / DM Mono / JetBrains Mono.
2. **Color marca:** usar tokens `--brand-*`. No hardcodear `#1B5E37` /
   `#154a2d` / `#C8D9C8` en templates nuevos — referenciar siempre los tokens
   o las clases utilitarias `.ds-*`.
3. **Botones:** `.ds-btn--primary` para CTA principal de página/modal; pill,
   min-height 48 px (44 px en variantes secundarias), sin transform en
   hover (`active:scale(0.98)` solo).
4. **Inputs:** `font-size: 16px` mínimo (vía `.ds-input`). No aplicar
   `appearance: none` a `<select>` global.
5. **Modales:** `<ModalWrapper>` + skill `natillerapp-modals`.
6. **iOS:** `100dvh` con fallbacks, `env(safe-area-inset-*)`,
   `touch-action: manipulation`, `useBodyScrollLock`. Detalles en skill
   `ios-safari-compat`.
7. **Accesibilidad:** área táctil ≥ 44×44 px, `aria-label` en botones-icono,
   contraste AA (verde marca contra blanco supera 7:1).

---

## 7. Anti-patrones a retirar

- Gradientes `from-emerald-50/50 to-teal-100/70` o
  `from-natillera-200/30 to-emerald-200/20` en superficies primarias.
- KPIs con cuatro paletas distintas (natillera + accent + blue + green) sin
  semántica clara.
- `bg-emerald-500` directo en iconos del header (debe ser `--brand-primary`).
- `font-display` apuntando a Outfit / DM Sans (ya migrado a Mulish; cualquier
  archivo que aún declare la fuente literalmente debe limpiarse).
- Headers de modal con cuerpo gradiente `from-natillera-700 to-natillera-800`
  → usar plano `var(--brand-primary)` (`#1B5E37`).
- Áreas táctiles < 44 px en móvil.

---

## 8. Referencia rápida de archivos

| Archivo                                             | Rol                                            |
|-----------------------------------------------------|------------------------------------------------|
| `src/style.css`                                     | Tokens (`@theme`, `:root`) + utilidades `.ds-*` |
| `src/components/ModalWrapper.vue`                   | Wrapper canónico de modales                    |
| `.claude/skills/natillerapp-modals/SKILL.md`        | Patrón de modales (paso a paso)                |
| `~/.claude/skills/ios-safari-compat/SKILL.md`       | Reglas iOS/Safari                              |
| `Funcionalidades/sistema-diseno.md`                 | Este documento                                 |
