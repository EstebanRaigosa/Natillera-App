# Natillerapp — guía para Claude Code

Aplicación Vue 3 + Tailwind + Supabase para gestión de natilleras (grupos de ahorro).

## Reglas obligatorias en cada cambio

### 1. Compatibilidad iOS / Safari (sin romper Android)

Todo componente, vista, modal, overlay, pantalla de carga o CSS que se cree o modifique **debe funcionar correctamente en iPhone y Safari** sin romper Android.

**Reglas rápidas:**

1. **Viewport**: usar `100dvh` con fallback `100vh` y `-webkit-fill-available` en alturas full-screen.
2. **Safe-area**: respetar `env(safe-area-inset-*)` en bordes pegados a pantalla (bottom nav, footers de modales, headers sticky).
3. **Modales**: preferir `<ModalWrapper>`. Si un caso legítimo no puede usarlo, documentar el porqué en un comentario y aplicar manualmente las reglas (translate3d, safe-area, touch, dvh).
4. **Inputs**: `font-size` >= 16 px para evitar zoom en iOS. No aplicar `appearance: none` a `<select>` globalmente.
5. **Touch**: `touch-action: manipulation` en botones; handlers `@touchstart` con `.passive` si no usan `preventDefault()`.
6. **Botones**: área táctil mínima 44×44 px.
7. **Scroll lock**: usar `useBodyScrollLock(refBoolean)` en modales.
8. **CSS iOS**: acotar con `@supports (-webkit-touch-callout: none)`. No usar `opacity: 1 !important` ni `display: block !important` en reglas genéricas (rompe transiciones Vue y layouts flex).
9. **Backdrop-filter**: en iOS, reducir blur o reemplazar con fondo sólido.
10. **Animaciones**: prefijo `-webkit-` en keyframes que usen transform; usar `translate3d(0,0,0)` para forzar GPU.

**Para detalle técnico, patrones y arquitectura del proyecto** → invocar la skill **`ios-safari-compat`** (en `~/.claude/skills/ios-safari-compat/SKILL.md`).

### 2. Modales y overlays

Al **crear, modificar o editar** cualquier modal, diálogo u overlay equivalente, es **obligatorio** invocar la skill **`natillerapp-modals`** (en `.claude/skills/natillerapp-modals/SKILL.md`).

Patrón base: `ModalWrapper` con cabecera marca **compacta** (~20 % menos que la referencia clásica), **móvil = fila** (icono + títulos + X en la misma línea), **desktop = icono arriba y textos centrados debajo** con X en flex (sin `absolute` en iOS), **un solo scroll** que incluye contenido y **acciones al final** (no pie fijo salvo excepción), safe-area en el bloque de acciones, `useBodyScrollLock`, props `align` / `persistent` / `ios-soft-backdrop` según corresponda.

**No** sustituir `ModalWrapper` por un `div` fijo genérico sin justificación en comentario y sin cubrir iOS.

## Stack del proyecto

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Estilos**: Tailwind 4 (preferir clases Tailwind sobre CSS custom)
- **Estado**: Pinia (stores en `src/stores/`)
- **Backend**: Supabase (`@supabase/supabase-js`)
- **Build**: Vite

## Convenciones

- Vistas en `src/views/`, componentes en `src/components/`, composables en `src/composables/`, stores en `src/stores/`.
- **Iconos**: `@heroicons/vue/24/outline` por defecto (solid solo cuando aporte contraste).
- **Color marca**: verde `#1B5E37` (cabeceras de modal); velo salvia `#C8D9C8` para backdrops.
- **Fuente título**: `font-display`; cuerpo: default sans.

## Commits (Conventional Commits)

Formato: `<type>[optional scope]: <description>` en imperativo, sin punto final.

- `fix:` parcha un bug
- `feat:` introduce funcionalidad
- Otros: `chore:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

Ej: `feat(cuotas): tratar mensual en quincenal como 2 quincenas para sanción`.

## Skills disponibles

- **`natillerapp-modals`** (proyecto) — patrón obligatorio para modales.
- **`ios-safari-compat`** (usuario) — checklist y patrones iOS/Safari.
