<template>
  <!--
    Cómo instalar la PWA en iPhone, en tres pasos animados.
    En iOS no existe el prompt nativo de instalación: hay que enseñar el gesto,
    y un dibujo del recorrido se entiende mucho antes que tres frases.

    Es un mockup en CSS, sin imágenes ni vídeo, como los de CuotasAyudaModal.
  -->
  <div class="instalar-ios">
    <div class="instalar-ios__telefono" aria-hidden="true">
      <span class="instalar-ios__isla" />

      <!-- Pantalla de inicio: aparece en el último paso -->
      <div class="instalar-ios__inicio" :class="{ 'is-visible': paso === 2 }">
        <div class="instalar-ios__inicio-rejilla">
          <span v-for="n in 3" :key="`a${n}`" class="instalar-ios__app-fantasma" />
          <span class="instalar-ios__app-nati">
            <span class="instalar-ios__app-punto" />
          </span>
          <span v-for="n in 2" :key="`b${n}`" class="instalar-ios__app-fantasma" />
        </div>
        <p class="instalar-ios__inicio-nombre">Natillerapp</p>
      </div>

      <!-- Safari con la app abierta -->
      <div class="instalar-ios__safari" :class="{ 'is-oculto': paso === 2 }">
        <div class="instalar-ios__cabecera">
          <span class="instalar-ios__logo" />
          <span class="instalar-ios__titulo" />
        </div>
        <div class="instalar-ios__contenido">
          <span class="instalar-ios__linea" style="width: 78%" />
          <span class="instalar-ios__linea" style="width: 55%" />
          <span class="instalar-ios__tarjeta" />
          <span class="instalar-ios__linea" style="width: 64%" />
        </div>

        <!-- Barra inferior de Safari, con el botón Compartir -->
        <div class="instalar-ios__barra">
          <span class="instalar-ios__flecha">‹</span>
          <span class="instalar-ios__url">natillerapp</span>
          <span class="instalar-ios__compartir" :class="{ 'is-activo': paso === 0 }">
            <ShareIosGlyph class="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <!-- Hoja de compartir: sube en el paso 2 -->
      <div class="instalar-ios__hoja" :class="{ 'is-abierta': paso === 1 }">
        <span class="instalar-ios__asa" />
        <div class="instalar-ios__opcion"><span class="instalar-ios__opcion-texto" style="width: 52%" /></div>
        <div class="instalar-ios__opcion"><span class="instalar-ios__opcion-texto" style="width: 44%" /></div>
        <div class="instalar-ios__opcion is-destacada">
          <span class="instalar-ios__opcion-etiqueta">Añadir a pantalla de inicio</span>
          <span class="instalar-ios__mas">+</span>
        </div>
        <div class="instalar-ios__opcion"><span class="instalar-ios__opcion-texto" style="width: 38%" /></div>
      </div>

      <!-- El dedo: se coloca donde toca según el paso -->
      <span class="instalar-ios__dedo" :class="`is-paso-${paso}`" />
    </div>

    <!-- Pie: paso actual y navegación manual -->
    <div class="instalar-ios__pie">
      <p class="instalar-ios__leyenda">{{ leyendas[paso] }}</p>
      <div class="instalar-ios__puntos">
        <button
          v-for="(l, i) in leyendas"
          :key="i"
          type="button"
          class="instalar-ios__punto"
          :class="{ 'is-activo': paso === i }"
          :aria-label="`Paso ${i + 1}: ${l}`"
          @click="fijarPaso(i)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ShareIosGlyph from './icons/ShareIosGlyph.vue'

const leyendas = [
  'Toca Compartir en la barra de Safari',
  'Elige «Añadir a pantalla de inicio»',
  'Listo: queda como una app más',
]

const paso = ref(0)
let temporizador = null

/*
 * Se avanza con JS y transiciones CSS, no con una animación de 9 segundos: así
 * los pasos se pueden fijar tocando los puntos, y quien prefiera menos
 * movimiento se queda en el paso que elija.
 */
const reducirMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true

function arrancar() {
  if (reducirMovimiento()) return
  detener()
  temporizador = setInterval(() => { paso.value = (paso.value + 1) % leyendas.length }, 2600)
}

function detener() {
  if (temporizador) { clearInterval(temporizador); temporizador = null }
}

/** Tocar un punto fija ese paso y deja de avanzar solo: manda quien mira. */
function fijarPaso(i) {
  detener()
  paso.value = i
}

onMounted(arrancar)
onBeforeUnmount(detener)
</script>

<style scoped>
.instalar-ios {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.instalar-ios__telefono {
  position: relative;
  width: 152px;
  height: 286px;
  border-radius: 1.75rem;
  background: #fff;
  border: 3px solid #1f2937;
  box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  flex-shrink: 0;
}

.instalar-ios__isla {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 46px;
  height: 12px;
  margin-left: -23px;
  border-radius: 9999px;
  background: #1f2937;
  z-index: 5;
}

/* ── Safari ─────────────────────────────────────────────── */
.instalar-ios__safari {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.instalar-ios__safari.is-oculto {
  opacity: 0;
  transform: scale(0.94);
}

.instalar-ios__cabecera {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 22px 10px 8px;
  background: #1b5e37;
}

.instalar-ios__logo {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #fff;
}

.instalar-ios__titulo {
  width: 54px;
  height: 7px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
}

.instalar-ios__contenido {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 10px;
}

.instalar-ios__linea {
  height: 6px;
  border-radius: 9999px;
  background: #e5e7eb;
}

.instalar-ios__tarjeta {
  height: 38px;
  border-radius: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.instalar-ios__barra {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.instalar-ios__flecha {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1;
}

.instalar-ios__url {
  flex: 1;
  font-size: 8px;
  color: #6b7280;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  padding: 3px 7px;
  text-align: center;
}

.instalar-ios__compartir {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #1b5e37;
  transition: background 0.3s ease, transform 0.3s ease;
}

.instalar-ios__compartir.is-activo {
  background: rgba(27, 94, 55, 0.14);
  transform: scale(1.14);
}

/* ── Hoja de compartir ──────────────────────────────────── */
.instalar-ios__hoja {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  padding: 8px 8px 12px;
  border-radius: 1rem 1rem 0 0;
  background: #f3f4f6;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -8px 20px -10px rgba(0, 0, 0, 0.3);
  transform: translate3d(0, 100%, 0);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.instalar-ios__hoja.is-abierta {
  transform: translate3d(0, 0, 0);
}

.instalar-ios__asa {
  display: block;
  width: 28px;
  height: 3px;
  margin: 0 auto 8px;
  border-radius: 9999px;
  background: #d1d5db;
}

.instalar-ios__opcion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
  margin-bottom: 4px;
  border-radius: 0.4rem;
  background: #fff;
}

.instalar-ios__opcion-texto {
  height: 5px;
  border-radius: 9999px;
  background: #e5e7eb;
}

.instalar-ios__opcion.is-destacada {
  background: #e8f5e9;
  outline: 1.5px solid #1b5e37;
}

.instalar-ios__opcion-etiqueta {
  font-size: 7.5px;
  font-weight: 700;
  color: #1b5e37;
  white-space: nowrap;
}

.instalar-ios__mas {
  font-size: 11px;
  font-weight: 700;
  color: #1b5e37;
  line-height: 1;
}

/* ── Pantalla de inicio ─────────────────────────────────── */
.instalar-ios__inicio {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 14px;
  background: linear-gradient(160deg, #123a24 0%, #1b5e37 55%, #2a7f4d 100%);
  opacity: 0;
  transition: opacity 0.45s ease;
}

.instalar-ios__inicio.is-visible {
  opacity: 1;
}

.instalar-ios__inicio-rejilla {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.instalar-ios__app-fantasma {
  aspect-ratio: 1;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.16);
}

.instalar-ios__app-nati {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.6rem;
  background: #fff;
  box-shadow: 0 6px 14px -4px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.4);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.3s ease 0.15s;
}

.instalar-ios__inicio.is-visible .instalar-ios__app-nati {
  transform: scale(1);
  opacity: 1;
}

.instalar-ios__app-punto {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: #1b5e37;
}

.instalar-ios__inicio-nombre {
  font-size: 8px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s ease 0.35s;
}

.instalar-ios__inicio.is-visible .instalar-ios__inicio-nombre {
  opacity: 1;
}

/* ── Dedo ───────────────────────────────────────────────── */
.instalar-ios__dedo {
  position: absolute;
  z-index: 6;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background: rgba(31, 41, 55, 0.28);
  border: 2px solid rgba(255, 255, 255, 0.9);
  /* translate3d: capa propia, imprescindible para que iOS no lo dibuje a saltos */
  transform: translate3d(0, 0, 0);
  transition: top 0.5s cubic-bezier(0.22, 1, 0.36, 1), left 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}

.instalar-ios__dedo.is-paso-0 { top: 246px; left: 116px; opacity: 1; }
.instalar-ios__dedo.is-paso-1 { top: 196px; left: 60px;  opacity: 1; }
.instalar-ios__dedo.is-paso-2 { top: 150px; left: 60px;  opacity: 0; }

/* ── Pie ────────────────────────────────────────────────── */
.instalar-ios__pie {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.instalar-ios__leyenda {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  min-height: 2.2em;
}

.instalar-ios__puntos {
  display: flex;
  gap: 0.5rem;
}

.instalar-ios__punto {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 0;
  touch-action: manipulation;
}

.instalar-ios__punto::after {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #d1d5db;
  transition: background 0.25s ease, width 0.25s ease;
}

.instalar-ios__punto.is-activo::after {
  width: 18px;
  border-radius: 9999px;
  background: #1b5e37;
}

@media (prefers-reduced-motion: reduce) {
  .instalar-ios__safari,
  .instalar-ios__hoja,
  .instalar-ios__inicio,
  .instalar-ios__app-nati,
  .instalar-ios__dedo,
  .instalar-ios__inicio-nombre {
    transition: none;
  }
}
</style>
