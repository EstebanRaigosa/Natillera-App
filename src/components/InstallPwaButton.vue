<template>
  <!-- Botón visible solo si la app se puede instalar y no está ya instalada -->
  <template v-if="puedeInstalar">
    <!-- Variante header móvil: pill compacto con icono + texto -->
    <button
      v-if="variant === 'header'"
      type="button"
      class="install-pwa-pill touch-manipulation"
      :aria-label="requiereInstruccionesIOS ? 'Cómo instalar la app' : 'Instalar la app'"
      @click="onInstalar"
    >
      <ArrowDownTrayIcon class="h-4 w-4 shrink-0" />
      <span class="hidden min-[360px]:inline">Instalar</span>
    </button>

    <!-- Variante sidebar: fila estilo nav-link, ancho completo -->
    <button
      v-else
      type="button"
      class="install-pwa-sidebar touch-manipulation"
      :aria-label="requiereInstruccionesIOS ? 'Cómo instalar la app' : 'Instalar la app'"
      @click="onInstalar"
    >
      <span class="install-pwa-sidebar__icon" aria-hidden="true">
        <ArrowDownTrayIcon class="h-5 w-5" />
      </span>
      <span class="install-pwa-sidebar__text">
        <span class="install-pwa-sidebar__title">Instalar app</span>
        <span class="install-pwa-sidebar__hint">Acceso directo en tu pantalla</span>
      </span>
    </button>
  </template>

  <!-- Modal de instrucciones para iOS (Safari no dispara el prompt nativo) -->
  <ModalWrapper
    :show="mostrarInstruccionesIOS"
    :z-index="70"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrarInstrucciones"
  >
    <!-- Cabecera marca (flex-shrink-0) -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white">
      <!-- Móvil: una sola fila -->
      <div
        class="flex items-center gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden min-h-[4.2rem]"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <ArrowDownTrayIcon class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1 text-left">
          <h2 class="font-display text-base font-bold leading-tight">Instalar Natillerapp</h2>
          <p class="text-[0.6875rem] text-emerald-100/90 leading-snug">Añádela a tu pantalla de inicio</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrarInstrucciones"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Desktop/tablet: icono arriba, textos centrados, X en tercera columna (flex) -->
      <div
        class="hidden sm:flex items-start px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))]"
      >
        <div class="w-11 shrink-0" aria-hidden="true"></div>
        <div class="flex flex-1 min-w-0 flex-col items-center text-center">
          <span class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <ArrowDownTrayIcon class="h-6 w-6" />
          </span>
          <h2 class="font-display text-lg font-bold leading-tight">Instalar Natillerapp</h2>
          <p class="mt-0.5 text-xs text-emerald-100/90">Añádela a tu pantalla de inicio</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrarInstrucciones"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cuerpo scrolleable + natiscroll -->
    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollArea"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white px-6 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="programarNatiscroll"
      >
        <p class="text-sm text-gray-600">
          En iPhone/iPad la instalación se hace desde <strong class="text-gray-800">Safari</strong> en 3 pasos:
        </p>

        <ol class="mt-4 space-y-3">
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-bold text-[#1B5E37]">1</span>
            <p class="text-sm text-gray-700 leading-snug">
              Toca el botón <strong>Compartir</strong>
              <ShareIosGlyph class="mx-1 inline-block h-4 w-4 -translate-y-0.5 text-[#1B5E37]" />
              en la barra de Safari.
            </p>
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-bold text-[#1B5E37]">2</span>
            <p class="text-sm text-gray-700 leading-snug">
              Desliza y elige <strong>«Añadir a pantalla de inicio»</strong>
              <PlusSmallIcon class="mx-0.5 inline-block h-4 w-4 -translate-y-0.5 text-[#1B5E37]" />.
            </p>
          </li>
          <li class="flex items-start gap-3">
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-bold text-[#1B5E37]">3</span>
            <p class="text-sm text-gray-700 leading-snug">
              Toca <strong>«Añadir»</strong>. Natillerapp quedará como una app en tu inicio.
            </p>
          </li>
        </ol>

        <div class="mt-4 rounded-xl border border-[#C8D9C8] bg-[#E8F5E9] px-4 py-3">
          <p class="text-xs text-[#1B5E37] leading-snug">
            Se abre a pantalla completa, carga más rápido y funciona incluso con conexión débil.
          </p>
        </div>
      </div>

      <!-- Natiscroll: overlay solo si el cuerpo desborda y no se ha llegado al final -->
      <div
        v-show="hayNatiscroll"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        aria-hidden="true"
      >
        <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
        <div class="relative flex justify-center px-5 pb-2 pt-8">
          <span class="rounded-full bg-white/90 px-3 py-1 text-[0.6875rem] font-semibold text-[#1B5E37] shadow-sm">
            Desliza para ver más
          </span>
        </div>
      </div>
    </div>

    <!-- Footer de acciones fijo (safe-area) -->
    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <button type="button" class="btn-modal-primary w-full" @click="cerrarInstrucciones">
        Entendido
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, nextTick, watch, onUnmounted } from 'vue'
import { ArrowDownTrayIcon, XMarkIcon, PlusSmallIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { usePwaInstall } from '../composables/usePwaInstall'
import ShareIosGlyph from './icons/ShareIosGlyph.vue'

const props = defineProps({
  // 'header' → pill compacto; 'sidebar' → fila ancha
  variant: { type: String, default: 'header' },
})

const { puedeInstalar, requiereInstruccionesIOS, instalar } = usePwaInstall()

const mostrarInstruccionesIOS = ref(false)
useBodyScrollLock(mostrarInstruccionesIOS)

async function onInstalar() {
  const resultado = await instalar()
  if (resultado?.outcome === 'ios-instructions') {
    mostrarInstruccionesIOS.value = true
  }
}

function cerrarInstrucciones() {
  mostrarInstruccionesIOS.value = false
}

// --- Natiscroll (velo + «Desliza para ver más») ---
const scrollArea = ref(null)
const hayNatiscroll = ref(false)
let rafId = null

function actualizarNatiscroll() {
  const el = scrollArea.value
  if (!el) {
    hayNatiscroll.value = false
    return
  }
  const hayOverflow = el.scrollHeight > el.clientHeight + 1
  const alFinal = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
  hayNatiscroll.value = hayOverflow && !alFinal
}

function programarNatiscroll() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(actualizarNatiscroll)
}

// Al abrir el modal, medir tras pintar el contenido
watch(mostrarInstruccionesIOS, (abierto) => {
  if (abierto) {
    nextTick(() => programarNatiscroll())
  } else {
    hayNatiscroll.value = false
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
@reference "../style.css";

/* Pill del header: acción de descarga marcada, compacta y con área táctil suficiente */
.install-pwa-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  /* Área táctil mínima 44×44 px (iOS/Safari). */
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0 0.8rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
  background: #1b5e37;
  box-shadow: 0 4px 12px rgba(27, 94, 55, 0.28);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
  touch-action: manipulation;
}

.install-pwa-pill:hover {
  background: #155a32;
  box-shadow: 0 6px 16px rgba(27, 94, 55, 0.34);
}

.install-pwa-pill:active {
  background: #134d2b;
  transform: translateY(1px);
}

.install-pwa-pill:focus-visible {
  outline: 2px solid #1b5e37;
  outline-offset: 2px;
}

/* Fila del sidebar: mismo lenguaje que .nav-link del layout, sobre el shell verde */
.install-pwa-sidebar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  text-align: left;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: background 0.2s ease, border-color 0.2s ease;
  touch-action: manipulation;
}

.install-pwa-sidebar:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.32);
}

.install-pwa-sidebar:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

.install-pwa-sidebar__icon {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.install-pwa-sidebar__text {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.05rem;
}

.install-pwa-sidebar__title {
  font-family: var(--font-display, 'Outfit', system-ui, sans-serif);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #fff;
}

.install-pwa-sidebar__hint {
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.25;
  color: hsla(152, 42%, 78%, 0.92);
}
</style>
