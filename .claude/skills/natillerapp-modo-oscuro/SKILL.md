---
name: natillerapp-modo-oscuro
description: >-
  Reglas del modo claro/oscuro en Natillerapp: colores por función (tokens),
  variante `oscuro:`, CSS scoped con bloque :where([data-tema=oscuro]),
  comprobantes siempre en claro, activación por ruta (meta.temaOscuro) y el
  proceso para migrar una vista con los scripts de scripts/tema/. Aplica al
  crear o modificar cualquier vista, componente, modal o CSS, y al migrar una
  pantalla al modo oscuro.
---

# Modo claro / oscuro — Natillerapp

Plan y estado: `docs/plan-modo-oscuro.md`. Tokens: `src/style.css`, bloque «COLORES POR FUNCIÓN».
Lógica: `src/composables/useTema.js`. Tabla de equivalencias: `scripts/tema/equivalencias.mjs`.

## 1. Cómo funciona (no cambiarlo sin actualizar esta skill)

- `<html data-tema="claro|oscuro">` lo pone `useTema()`. Preferencia del usuario: `claro`, `oscuro` o `auto` (por defecto, el del dispositivo). Se guarda en `localStorage` y en `user_profiles.tema`.
- **El oscuro solo se aplica en rutas con `meta: { temaOscuro: true }`.** Una vista sin migrar se pinta entera en claro, marco y modales incluidos. Así nunca hay mezcla.
- Un bloque con `data-tema="claro"` se queda en claro aunque la página esté en oscuro (comprobantes).
- Los tokens valen en claro **exactamente** el color de Tailwind que reemplazan. Migrar una vista no puede cambiar nada en modo claro.

## 2. Reglas para código nuevo o modificado (toda la app, migrada o no)

1. **Superficies, textos y bordes neutros van con tokens**, nunca con blanco o gris fijo:

   | En vez de | Usar |
   |---|---|
   | `bg-white` | `bg-superficie-tarjeta` |
   | `bg-gray-50` · `bg-gray-100` | `bg-superficie-suave` · `bg-superficie-hundida` |
   | menú, popover, dropdown | `bg-superficie-elevada` |
   | `bg-gray-200` · `bg-gray-300` (pistas, rellenos) | `bg-borde` · `bg-borde-fuerte` |
   | `text-gray-900/800/700/600/500/400` | `text-texto-fuerte` / `text-texto` / `text-texto-medio` / `text-texto-secundario` / `text-texto-suave` / `text-texto-tenue` |
   | `border-gray-100/200/300` (y `divide-`, `ring-`) | `border-borde-suave` / `border-borde` / `border-borde-fuerte` |
   | `text-[#1B5E37]` sobre una superficie | `text-marca-tinta` (y `border-marca-tinta-borde`) |
   | `bg-[#E8F5E9]` | `bg-marca-suave` |
   | velo `bg-[#C8D9C8]/70` | `bg-velo-modal` |
   | estados: fondo suave + texto | `bg-exito-suave text-exito`, `alerta`, `peligro`, `info` (+ `border-*-borde`) |

2. **Variables de marca como texto:** `--brand-primary`, `--brand-success`, `--brand-warning` y `--brand-danger` NO cambian en oscuro, porque también pintan fondos de botones y cabeceras. Como texto o borde sobre una superficie no se leen (≈2–3,5:1). Por eso `text-[color:var(--brand-primary)]` lleva `oscuro:text-marca-tinta` (y `--brand-success` → `exito`, `warning` → `alerta`, `danger` → `peligro`), y en CSS `color: var(--brand-*)` lleva su override.
2. **El verde de marca y lo que va encima no cambian.** Cabeceras de modal `bg-[#1B5E37]`, botones primarios, shell de navegación: el verde se queda y `text-white` / `bg-white/NN` encima también.
3. **Pizarra (`slate`) y verdes de texto sin token exacto:** se deja la clase de claro y se añade su `oscuro:` al lado (`text-slate-500 oscuro:text-texto-suave`, `text-[#166534] oscuro:text-marca-tinta`).
   **Colores de estado y acento** (emerald, amber, red, sky, natillera, accent…), una sola regla para toda la app, que aplica `migrar-colores.mjs`:

   | Clase de claro | Se le añade |
   |---|---|
   | fondo pastel `bg-c-50` / `bg-c-100` | `oscuro:bg-c-500/15` |
   | texto `text-c-600` … `text-c-900` | `oscuro:text-c-300` |
   | borde `border-c-100` … `border-c-300` | `oscuro:border-c-500/30` |

   Los tonos sólidos (botón `bg-emerald-600 text-white`) y los fondos de marca (`bg-[#166534]`, degradados verdes) no cambian.
4. **La variante es `oscuro:`, nunca `dark:`.** `dark:` sigue a `prefers-color-scheme` e ignora la preferencia del usuario y la regla por ruta.
5. **CSS scoped:** no reescribir las reglas de claro. Al final del `<style>` va un bloque «Modo oscuro» con solo lo que cambia:
   ```css
   :where([data-tema=oscuro]) .mi-tarjeta { background: var(--superficie-tarjeta); color: var(--texto); }
   ```
   `:where()` no suma especificidad: la regla pesa lo mismo que la original y gana por ir después. Las variantes compuestas (`.padre--mora .hijo`) se repiten con el mismo compuesto. En CSS nuevo, usar directamente `var(--token)`.
   - **Herramienta:** `node scripts/tema/proponer-oscuro.mjs [--aplicar] <archivo>` propone el bloque, traduciendo cada color por luminosidad, croma y tono. Con `--aplicar` reemplaza el bloque propuesto anterior. Hay que revisar la propuesta: no sabe qué va sobre el verde de marca, ni si un modificador necesita su propia regla.
   - **Ajustes a mano en un `<style>` con bloque propuesto:** marca la declaración de claro con `/* tema-fijo: motivo */` (la herramienta la salta) y escribe el override oscuro **justo debajo de esa regla de claro**. Lo que se escriba después del bloque propuesto se pierde al regenerarlo.
   - **Modificadores:** si la regla base tiene override, cada modificador (`--positive`, `.is-activo`…) necesita el suyo; si no, la base oscura lo pisa.
6. **Comprobantes e imágenes compartidas, siempre en claro:** el nodo que captura `toPng` / `html-to-image` lleva `data-tema="claro"`. El modal que lo muestra puede ir en oscuro; la tarjeta capturada no.
7. **Excepción deliberada:** comentario `tema-fijo: <motivo>` en la línea de la clase o hasta 3 líneas antes; así cubre el elemento y su icono. Si la etiqueta ocupa varias líneas, pon la clase cerca del comentario: los scripts no miran más arriba. Vale en el template (`<!-- tema-fijo: … -->`) y en el `<style>` (`/* tema-fijo: … */`). Ejemplos: un círculo blanco con icono verde sobre la cabecera de marca, el fondo blanco del visor de PDF o la pantalla de carga verde noche. Para un bloque entero del `<style>` (una ilustración que dibuja una pantalla en claro), `/* tema-fijo-inicio: motivo */` … `/* tema-fijo-fin */`, y el elemento de la ilustración con `data-tema="claro"`. Sin motivo no vale. El revisor ya ignora solo `color: #fff` (texto blanco, siempre sobre marca) y los velos negros.
   - **Nunca** metas el comentario entre un `v-if` y su `v-else`: Vue deja de verlos como pareja y la plantilla no compila. Tampoco dentro de una etiqueta de varias líneas. Si hace falta, junta la etiqueta en una línea para que quede a menos de 3 líneas del comentario.
   - Dentro de un elemento blanco `tema-fijo` (círculo sobre la marca), su icono **no** lleva `oscuro:text-*`: sobre el blanco, el color aclarado se pierde. El revisor da error.
8. **Contraste:** en oscuro, el texto debe leerse (AA, 4.5:1). Nada de `#1B5E37` como texto sobre `--superficie-*` oscura: para eso está `--marca-tinta`.
9. **iOS** (además del checklist de CLAUDE.md §1): no poner colores de fondo fijos en `html` o `body` (los da el token de lienzo); `color-scheme` lo gestiona `useTema`; no añadir `!important` genéricos.
10. **Tokens nuevos** solo en `src/style.css`: valor claro, valor oscuro y `@theme inline`. Documentarlos en la tabla de la cabecera del bloque.

## 3. Proceso para migrar una vista

1. **Reclamar** la vista en la tabla de reparto del plan (`docs/plan-modo-oscuro.md` §8). Nadie toca archivos que no tiene asignados.
2. **Paso mecánico:** `node scripts/tema/migrar-colores.mjs <vista.vue> <componentes propios…>`
   **CSS scoped:** `node scripts/tema/proponer-oscuro.mjs --aplicar <archivo>` y revisar la propuesta (regla 5).
3. **Paso manual** guiado por `node scripts/tema/revisar-colores.mjs <archivos>`:
   - errores de neutros que el script no resolvió (con opacidad, `text-gray-300`…);
   - `bg-white/NN`: ¿va sobre verde (se queda) o sobre superficie (token)?;
   - hex en clases: token o `oscuro:`;
   - bloque «Modo oscuro» del `<style>`;
   - `data-tema="claro"` en cada nodo capturado a imagen.
4. `revisar-colores.mjs` **sin errores** y `npx vite build --outDir <carpeta propia>` en verde. No compilar en `dist/`: lo comparten las sesiones.
5. **Marcar la ruta** con `temaOscuro: true` en `src/router/index.js`. Lo hace solo el responsable del router (§8 del plan); el resto se lo pide.
6. **Revisión independiente:** el agente `revisor-modo-oscuro` revisa el lote antes de darlo por hecho.
7. Decir en la respuesta qué se validó y qué no. Mientras no se pruebe en dispositivo, es revisión de código, no prueba visual.
