<template>
  <!--
    Guía rápida de Cuotas: carrusel de pasos con mini-mockups FIELES a la app (pestañas
    folder, botón «Registrar Pago», selector socio→cuota, modal de pago, comprobante,
    grid de meses). Cada paso reproduce el flujo real por sub-etapas animadas (CSS + un
    temporizador que avanza las sub-pantallas). Usa ModalWrapper, useBodyScrollLock y el
    patrón natiscroll de la skill natillerapp-modals.
  -->
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- ── Cabecera marca (móvil = fila) ── -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
      <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <SparklesIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">¿Cómo funciona Cuotas?</h3>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">Guía rápida · {{ pasoActivo + 1 }} de {{ pasos.length }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
    <!-- ── Cabecera marca (desktop = icono arriba + textos centrados) ── -->
    <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="flex items-start px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div class="w-11 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <SparklesIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">¿Cómo funciona Cuotas?</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">Guía rápida · {{ pasoActivo + 1 }} de {{ pasos.length }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cuerpo scrolleable + natiscroll ── -->
    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="onScroll"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <Transition :name="dir === 1 ? 'ayuda-slide-next' : 'ayuda-slide-prev'" mode="out-in">
          <div :key="pasoActivo" class="px-5 pt-5 pb-6">
            <!-- ══════════ Escenario (mockup fiel) ══════════ -->
            <div class="ayuda-stage">

              <!-- 0 · Intro: mini pantalla de Cuotas -->
              <template v-if="paso.escena === 'intro'">
                <div class="ph ayuda-float">
                  <div class="ph-topbar"><span class="ph-topbar-title">Cuotas y Pagos</span><span class="ph-cal"><CalendarDaysIcon class="h-3 w-3 text-[#1B5E37]" /></span></div>
                  <div class="ph-tabs">
                    <span class="ph-tab">Ene</span>
                    <span class="ph-tab ph-tab--on">Feb</span>
                    <span class="ph-tab">Mar</span>
                  </div>
                  <div class="ph-card">
                    <span class="ph-ava"></span>
                    <span class="ph-lines"><i></i><i></i></span>
                    <span class="ph-pay">$ Pagar</span>
                  </div>
                </div>
              </template>

              <!-- 1 · Registrar pago (botón → socio → cuota → pago → comprobante) -->
              <template v-else-if="paso.escena === 'registrar'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <!-- sub 0: pantalla de Cuotas con el botón «Registrar Pago» en su sitio (cabecera) -->
                      <template v-if="sub === 0">
                        <div class="ph-topbar">
                          <span class="ph-topbar-title">Cuotas y Pagos</span>
                          <span class="ph-cal"><CalendarDaysIcon class="h-3 w-3 text-[#1B5E37]" /></span>
                        </div>
                        <div class="ph-cta ph-cta--top">
                          <BanknotesIcon class="h-3.5 w-3.5 text-white" />
                          Registrar Pago
                          <span class="ayuda-tap-ring"></span>
                        </div>
                        <div class="ph-tabs ph-tabs--sm">
                          <span class="ph-tab ph-tab--on">Feb</span>
                          <span class="ph-tab">Mar</span>
                        </div>
                        <div class="ph-card ph-card--flat">
                          <span class="ph-ava ph-ava--sm"></span>
                          <span class="ph-lines"><i></i><i></i></span>
                        </div>
                        <span class="ayuda-finger" style="top:3rem;left:50%;margin-left:-0.7rem"></span>
                      </template>
                      <!-- sub 1: selector de socio -->
                      <template v-else-if="sub === 1">
                        <div class="ph-sheet-head">Registrar pago</div>
                        <div class="ph-search"><MagnifyingGlassIcon class="h-3 w-3 text-gray-400" /><i></i></div>
                        <div class="ph-socio">
                          <span class="ph-ava ph-ava--sm"></span>
                          <span class="ph-socio-info"><b></b><em>Mensual</em></span>
                          <ChevronRightIcon class="h-3.5 w-3.5 text-gray-400" />
                          <span class="ayuda-tap-ring" style="left:auto;right:1.2rem"></span>
                        </div>
                        <span class="ayuda-finger" style="top:5.4rem;right:1.4rem"></span>
                      </template>
                      <!-- sub 2: selector de cuota -->
                      <template v-else-if="sub === 2">
                        <div class="ph-sheet-head">Cuotas del mes</div>
                        <div class="ph-cuota">
                          <div class="ph-cuota-top">
                            <span class="ph-cuota-title">Febrero 2026</span>
                            <span class="ph-badge ph-badge--pend">Pendiente</span>
                          </div>
                          <div class="ph-cuota-total"><span>Total a pagar</span><b>$ 50.000</b></div>
                          <span class="ayuda-tap-ring" style="top:auto;bottom:0.6rem"></span>
                        </div>
                        <span class="ayuda-finger" style="bottom:1.1rem;left:50%;margin-left:-0.7rem"></span>
                      </template>
                      <!-- sub 3: modal de pago + comprobante -->
                      <template v-else>
                        <div class="ph-sheet-head">Registrar Pago</div>
                        <div class="ph-pago-amount"><span>Total a cobrar</span><b>$ 50.000</b></div>
                        <div class="ph-cta ph-cta--confirm">
                          <CheckIcon class="h-3.5 w-3.5 text-white" />
                          Registrar Pago
                        </div>
                        <div class="ph-done-badge"><CheckIcon class="h-4 w-4 text-white" /></div>
                      </template>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 2 · Pago desde la tarjeta del socio (tocar tarjeta → cuotas del socio → cuota → pago) -->
              <template v-else-if="paso.escena === 'tarjeta'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <!-- sub 0: se toca la tarjeta completa del socio en la lista -->
                      <template v-if="sub === 0">
                        <div class="ph-list-label">Lista de socios</div>
                        <div class="ph-socio-card ph-socio-card--mora">
                          <span class="ph-ava-round ph-ring-red"></span>
                          <div class="ph-sc-info">
                            <b></b>
                            <div class="ph-sc-badges">
                              <span class="ph-badge ph-badge--mora">En Mora</span>
                              <span class="ph-badge ph-badge--muted">Mensual</span>
                            </div>
                          </div>
                          <div class="ph-sc-right">
                            <span class="ph-sc-amount">$ 50.000</span>
                            <div class="ph-progress"><i style="width:35%;background:#ef4444"></i></div>
                          </div>
                          <span class="ayuda-tap-ring" style="top:50%;left:50%"></span>
                        </div>
                        <div class="ph-socio-card ph-socio-card--ok ph-dim">
                          <span class="ph-ava-round ph-ring-green"></span>
                          <div class="ph-sc-info"><b></b><div class="ph-sc-badges"><span class="ph-badge ph-badge--ok">Al día</span></div></div>
                        </div>
                        <span class="ayuda-finger" style="top:3.4rem;left:50%;margin-left:-0.7rem"></span>
                      </template>
                      <!-- sub 1: modal «Cuotas del socio» → se toca la fila de la cuota -->
                      <template v-else-if="sub === 1">
                        <div class="ph-sheet-head ph-sheet-head--socio">
                          <span class="ph-ava-round ph-ava-round--xs"></span>
                          Cuotas del socio
                        </div>
                        <div class="ph-cuota-row ph-cuota-row--pend">
                          <span class="ph-cuota-emoji">💚</span>
                          <div class="ph-cuota-row-info"><b>Mensual</b><em>Febrero 2026</em></div>
                          <span class="ph-badge ph-badge--pend">Pendiente</span>
                          <ChevronRightIcon class="h-3 w-3 text-gray-400 shrink-0" />
                          <span class="ayuda-tap-ring" style="top:50%;left:50%"></span>
                        </div>
                        <div class="ph-cuota-row ph-cuota-row--ok ph-dim">
                          <span class="ph-cuota-emoji">🌿</span>
                          <div class="ph-cuota-row-info"><b>Mensual</b><em>Marzo 2026</em></div>
                          <span class="ph-badge ph-badge--ok">Pagada</span>
                        </div>
                        <span class="ayuda-finger" style="top:3.6rem;left:50%;margin-left:-0.7rem"></span>
                      </template>
                      <!-- sub 2: modal de pago -->
                      <template v-else-if="sub === 2">
                        <div class="ph-sheet-head">Registrar Pago</div>
                        <div class="ph-pago-amount"><span>Total a cobrar</span><b>$ 50.000</b></div>
                        <div class="ph-cta ph-cta--confirm">
                          <CheckIcon class="h-3.5 w-3.5 text-white" />
                          Registrar Pago
                          <span class="ayuda-tap-ring" style="top:auto;bottom:0.1rem"></span>
                        </div>
                        <span class="ayuda-finger" style="bottom:0.6rem;left:50%;margin-left:-0.7rem"></span>
                      </template>
                      <!-- sub 3: comprobante -->
                      <template v-else>
                        <div class="ph-comprobante">
                          <div class="ph-done-badge ph-done-badge--big"><CheckIcon class="h-6 w-6 text-white" /></div>
                          <span class="ph-comprobante-txt">¡Pago registrado!</span>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 3 · Cambiar de mes con las pestañas (folder) -->
              <template v-else-if="paso.escena === 'tabs'">
                <div class="ph ph--tabs">
                  <div class="ph-topbar">
                    <span class="ph-topbar-title">Cuotas y Pagos</span>
                    <span class="ph-cal"><CalendarDaysIcon class="h-3 w-3 text-[#1B5E37]" /></span>
                  </div>
                  <div class="ph-folder">
                    <span
                      v-for="(m, i) in tabsMeses"
                      :key="m.lbl"
                      class="ph-folder-tab"
                      :class="{ 'ph-folder-tab--on': i === sub }"
                    >
                      <span class="ph-folder-emoji">{{ m.emoji }}</span>
                      <span class="ph-folder-lbl">{{ m.lbl }}</span>
                      <span class="ph-folder-dot" :class="m.dot"></span>
                    </span>
                  </div>
                  <div class="ph-folder-panel"></div>
                  <span class="ayuda-finger ayuda-finger--swipe2"></span>
                </div>
              </template>

              <!-- 4 · Botón de calendario -->
              <template v-else-if="paso.escena === 'calendario'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <!-- sub 0: header con botón de calendario -->
                      <template v-if="sub === 0">
                        <div class="ph-topbar">
                          <span class="ph-topbar-title">Cuotas y Pagos</span>
                          <span class="ph-cal ph-cal--target">
                            <CalendarDaysIcon class="h-3.5 w-3.5 text-[#1B5E37]" />
                            <span class="ayuda-tap-ring" style="width:2rem;height:2rem;margin:-1rem 0 0 -1rem"></span>
                          </span>
                        </div>
                        <div class="ph-tabs ph-tabs--sm">
                          <span class="ph-tab ph-tab--on">Feb</span>
                          <span class="ph-tab">Mar</span>
                        </div>
                        <div class="ph-card ph-card--flat"><span class="ph-ava ph-ava--sm"></span><span class="ph-lines"><i></i><i></i></span></div>
                        <span class="ayuda-finger" style="top:1.9rem;right:0.9rem"></span>
                      </template>
                      <!-- sub 1: grid de meses -->
                      <template v-else>
                        <div class="ph-sheet-head">Selecciona el mes</div>
                        <div class="ph-mesgrid">
                          <span
                            v-for="n in 6"
                            :key="n"
                            class="ph-mescell"
                            :class="{ 'ph-mescell--on': n === 2 }"
                          >
                            <span class="ph-mescell-dot"></span>
                            {{ mesesCorto[n - 1] }}
                          </span>
                          <span class="ayuda-tap-ring" style="top:2.1rem;left:3rem"></span>
                        </div>
                        <span class="ayuda-finger" style="top:3.1rem;left:2.7rem"></span>
                      </template>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 5 · Listo -->
              <template v-else>
                <div class="ayuda-done">
                  <div class="ayuda-done-ring"></div>
                  <div class="ayuda-done-badge2"><CheckIcon class="h-8 w-8 text-white" /></div>
                </div>
              </template>
            </div>

            <!-- Texto del paso -->
            <div class="mt-5 text-center">
              <div class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1">
                <component :is="paso.icon" class="h-4 w-4 text-[#1B5E37]" />
                <span class="font-display text-xs font-semibold text-[#1B5E37]">{{ paso.tag }}</span>
              </div>
              <h4 class="font-display text-lg font-bold leading-snug text-gray-800">{{ paso.titulo }}</h4>
              <p class="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-gray-600">{{ paso.descripcion }}</p>
            </div>
          </div>
        </Transition>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- ── Footer de acciones ── -->
    <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-3 pb-[max(1.1rem,env(safe-area-inset-bottom))]">
      <div class="mb-3 flex items-center justify-center gap-1.5">
        <button
          v-for="(p, i) in pasos"
          :key="p.escena"
          type="button"
          class="ayuda-dot touch-manipulation"
          :class="{ 'ayuda-dot--on': i === pasoActivo }"
          :aria-label="`Ir al paso ${i + 1}`"
          @click="irA(i)"
        />
      </div>
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" @click="atrasOSaltar">
          {{ pasoActivo === 0 ? 'Saltar' : 'Atrás' }}
        </button>
        <button type="button" class="btn-modal-primary flex-1" @click="siguienteOListo">
          {{ esUltimo ? '¡Entendido!' : 'Siguiente' }}
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import ModalWrapper from './ModalWrapper.vue'
import NatiscrollHint from './NatiscrollHint.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { useNatiscroll } from '../composables/useNatiscroll'
import {
  SparklesIcon,
  XMarkIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  RectangleGroupIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const showRef = computed(() => props.show)
useBodyScrollLock(showRef)

const mesesCorto = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
const tabsMeses = [
  { emoji: '🌱', lbl: 'Ene', dot: 'ph-dot--green' },
  { emoji: '💚', lbl: 'Feb', dot: 'ph-dot--amber' },
  { emoji: '🌿', lbl: 'Mar', dot: 'ph-dot--green' }
]

const pasos = [
  {
    escena: 'intro',
    icon: SparklesIcon,
    tag: 'Bienvenido',
    titulo: 'Paga las cuotas de cada socio, mes a mes',
    descripcion: 'Aquí registras el pago de las cuotas de cada socio en cada mes. Hay 2 formas distintas de pagar: te las mostramos en unos segundos. Desliza o toca «Siguiente».',
    subCount: 1
  },
  {
    escena: 'registrar',
    icon: BanknotesIcon,
    tag: 'Opción 1 de 2',
    titulo: 'Opción 1: botón «Registrar Pago»',
    descripcion: 'La 1ª forma de pagar: toca «Registrar Pago» (arriba), elige el socio, elige la cuota del mes y confirma. Verás el comprobante al final.',
    subCount: 4,
    subMs: 1900
  },
  {
    escena: 'tarjeta',
    icon: CurrencyDollarIcon,
    tag: 'Opción 2 de 2',
    titulo: 'Opción 2: desde la tarjeta del socio',
    descripcion: 'La 2ª forma, más directa: toca la tarjeta del socio en la lista, toca la cuota que quieras pagar y confirma. Mismo resultado y comprobante.',
    subCount: 4,
    subMs: 1800
  },
  {
    escena: 'tabs',
    icon: RectangleGroupIcon,
    tag: 'Cambiar periodo',
    titulo: 'Cambia de mes con las pestañas',
    descripcion: 'Desliza la fila de meses y toca la pestaña que quieras. La seleccionada resalta y la lista se actualiza sola.',
    subCount: 3,
    subMs: 1400
  },
  {
    escena: 'calendario',
    icon: CalendarDaysIcon,
    tag: 'Cambiar periodo',
    titulo: 'O usa el botón de calendario',
    descripcion: 'Toca el icono de calendario para abrir el selector de meses y saltar directo a cualquier periodo.',
    subCount: 2,
    subMs: 2100
  },
  {
    escena: 'listo',
    icon: CheckCircleIcon,
    tag: 'Listo',
    titulo: '¡Ya sabes lo esencial!',
    descripcion: 'Puedes registrar pagos y moverte por los meses. Toca «Entendido» para empezar.',
    subCount: 1
  }
]

const pasoActivo = ref(0)
const dir = ref(1) // 1 = avanzar, -1 = retroceder (transición entre pasos)
const sub = ref(0) // sub-etapa dentro del paso animado
const paso = computed(() => pasos[pasoActivo.value])
const esUltimo = computed(() => pasoActivo.value === pasos.length - 1)

const { scrollRef, hayMas, onScroll, remedir } = useNatiscroll(showRef)

// ── Temporizador de sub-etapas (reproduce el flujo real paso a paso) ──
let subTimer = null
function detenerSub() {
  if (subTimer != null) {
    clearInterval(subTimer)
    subTimer = null
  }
}
function arrancarSub() {
  detenerSub()
  sub.value = 0
  const n = paso.value.subCount || 1
  if (n <= 1) return
  subTimer = setInterval(() => {
    sub.value = (sub.value + 1) % n
  }, paso.value.subMs || 1800)
}

function irA(i) {
  if (i === pasoActivo.value) return
  dir.value = i > pasoActivo.value ? 1 : -1
  pasoActivo.value = i
}
function siguienteOListo() {
  if (esUltimo.value) return cerrar()
  dir.value = 1
  pasoActivo.value++
}
function atrasOSaltar() {
  if (pasoActivo.value === 0) return cerrar()
  dir.value = -1
  pasoActivo.value--
}
function cerrar() {
  emit('close')
}

// Swipe horizontal para cambiar de paso
let touchX = 0
let touchY = 0
function onTouchStart(e) {
  const t = e.changedTouches[0]
  touchX = t.clientX
  touchY = t.clientY
}
function onTouchEnd(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - touchX
  const dy = t.clientY - touchY
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return // ignora scroll vertical
  if (dx < 0) siguienteOListo()
  else atrasOSaltar()
}

watch(
  () => props.show,
  (v) => {
    if (v) {
      pasoActivo.value = 0
      dir.value = 1
      arrancarSub()
    } else {
      detenerSub()
    }
  }
)
watch(pasoActivo, () => {
  arrancarSub()
  nextTick(() => remedir())
})
onUnmounted(detenerSub)
</script>

<style scoped>
/* ══════════ Escenario ══════════ */
.ayuda-stage {
  position: relative;
  width: 100%;
  height: 12rem;
  border-radius: 1.25rem;
  background: linear-gradient(160deg, #f3f8f4 0%, #e6f1e9 100%);
  border: 1px solid rgba(27, 94, 55, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* ── Marco tipo teléfono ── */
.ph {
  position: relative;
  width: 12.5rem;
  height: 10.25rem;
  background: #fbfdfb;
  border-radius: 1.1rem;
  border: 1px solid rgba(27, 94, 55, 0.14);
  box-shadow: 0 12px 28px -16px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  padding: 0.6rem;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
.ph--tabs { display: flex; flex-direction: column; justify-content: flex-start; padding: 0.7rem 0.55rem 0; }
.ph-screen {
  position: absolute;
  inset: 0;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* ── Indicador de toque ── */
.ayuda-tap-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2.6rem;
  height: 2.6rem;
  margin: -1.3rem 0 0 -1.3rem;
  border-radius: 9999px;
  border: 2px solid rgba(22, 163, 74, 0.6);
  -webkit-animation: ayudaTapRing 2s ease-out infinite;
  animation: ayudaTapRing 2s ease-out infinite;
  pointer-events: none;
}
@-webkit-keyframes ayudaTapRing { 0%, 55% { opacity: 0; -webkit-transform: scale(0.4); } 65% { opacity: 0.9; -webkit-transform: scale(0.6); } 100% { opacity: 0; -webkit-transform: scale(1.7); } }
@keyframes ayudaTapRing { 0%, 55% { opacity: 0; transform: scale(0.4); } 65% { opacity: 0.9; transform: scale(0.6); } 100% { opacity: 0; transform: scale(1.7); } }
.ayuda-finger {
  position: absolute;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(22, 101, 52, 0.9));
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
  pointer-events: none;
  z-index: 5;
  -webkit-animation: ayudaTapMove 1.9s ease-in-out infinite;
  animation: ayudaTapMove 1.9s ease-in-out infinite;
}
@-webkit-keyframes ayudaTapMove { 0%, 55% { -webkit-transform: translate3d(0, 0.4rem, 0) scale(1); opacity: 0.95; } 68% { -webkit-transform: translate3d(0, 0, 0) scale(0.82); } 82%, 100% { -webkit-transform: translate3d(0, 0.4rem, 0) scale(1); opacity: 0.95; } }
@keyframes ayudaTapMove { 0%, 55% { transform: translate3d(0, 0.4rem, 0) scale(1); opacity: 0.95; } 68% { transform: translate3d(0, 0, 0) scale(0.82); } 82%, 100% { transform: translate3d(0, 0.4rem, 0) scale(1); opacity: 0.95; } }

/* ── Barra superior (header Cuotas) ── */
.ph-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.1rem 0.15rem 0.35rem; }
.ph-topbar-title { font-size: 0.6rem; font-weight: 800; color: #166534; font-family: inherit; }
.ph-cal { width: 1.4rem; height: 1.4rem; border-radius: 0.45rem; background: #fff; border: 1px solid rgba(22, 163, 74, 0.3); display: flex; align-items: center; justify-content: center; position: relative; }
.ph-cal--target { box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25); }

/* ── Pestañas folder ── */
.ph-tabs { display: flex; gap: 0.25rem; align-items: flex-end; }
.ph-tabs--sm { transform: scale(0.95); transform-origin: left; }
.ph-tab {
  flex: 1;
  text-align: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: #4b5563;
  background: #eaf5ee;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.28rem 0;
}
.ph-tab--on { background: #fff; color: #166534; padding: 0.42rem 0; box-shadow: 0 -4px 10px -6px rgba(0, 0, 0, 0.2); }

/* ── Tarjeta genérica (lista) ── */
.ph-card { display: flex; align-items: center; gap: 0.45rem; background: #fff; border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 0.7rem; padding: 0.45rem; box-shadow: 0 4px 12px -8px rgba(0, 0, 0, 0.2); }
.ph-card--flat { box-shadow: none; }
.ph-ava { width: 1.9rem; height: 1.9rem; border-radius: 0.55rem; background: linear-gradient(135deg, #bbf7d0, #4ade80); flex-shrink: 0; border: 1px solid rgba(22, 163, 74, 0.3); }
.ph-ava--sm { width: 1.6rem; height: 1.6rem; border-radius: 0.45rem; }
.ph-lines { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 0; }
.ph-lines i { display: block; height: 0.42rem; border-radius: 9999px; background: #d7e6dc; width: 4.5rem; }
.ph-lines i.short { width: 2.6rem; background: #e6eef0; }
.ph-pay { font-size: 0.55rem; font-weight: 800; color: #fff; background: #16a34a; padding: 0.25rem 0.5rem; border-radius: 0.45rem; flex-shrink: 0; }

/* ── Botón CTA (Registrar Pago, ds-btn--primary) ── */
.ph-cta {
  position: relative;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 1.85rem;
  border-radius: 0.6rem;
  background: #1b5e37;
  color: #fff;
  font-size: 0.66rem;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px rgba(27, 94, 55, 0.6);
}
.ph-cta--confirm { background: #16a34a; margin-top: 0.4rem; }

/* ── Encabezado de hoja (modal) ── */
.ph-sheet-head {
  margin: -0.6rem -0.6rem 0.5rem;
  background: #1b5e37;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  text-align: center;
  padding: 0.4rem;
  border-radius: 0.55rem 0.55rem 0 0;
}

/* ── Búsqueda ── */
.ph-search { display: flex; align-items: center; gap: 0.3rem; border: 1.5px solid #e5e7eb; border-radius: 0.5rem; padding: 0.3rem 0.4rem; background: #fff; }
.ph-search i { display: block; height: 0.4rem; width: 3.5rem; border-radius: 9999px; background: #e5e7eb; }

/* ── Fila de socio (selector) ── */
.ph-socio { position: relative; display: flex; align-items: center; gap: 0.4rem; background: #f6f7f8; border: 1.5px solid transparent; border-radius: 0.6rem; padding: 0.4rem; }
.ph-socio-info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
.ph-socio-info b { display: block; height: 0.45rem; width: 4rem; border-radius: 9999px; background: #cfd8d3; }
.ph-socio-info em { font-style: normal; font-size: 0.5rem; color: #9ca3af; }

/* ── Tarjeta de cuota (selector) ── */
.ph-cuota { position: relative; background: #fff; border: 1.5px solid #e5e7eb; border-left: 3px solid #16a34a; border-radius: 0.55rem; padding: 0.45rem 0.5rem; }
.ph-cuota-top { display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; }
.ph-cuota-title { font-size: 0.6rem; font-weight: 800; color: #111827; }
.ph-badge { font-size: 0.5rem; font-weight: 800; padding: 0.1rem 0.35rem; border-radius: 0.35rem; }
.ph-badge--pend { background: #f3f4f6; color: #374151; }
.ph-cuota-total { display: flex; align-items: baseline; justify-content: space-between; margin-top: 0.35rem; }
.ph-cuota-total span { font-size: 0.5rem; color: #9ca3af; }
.ph-cuota-total b { font-size: 0.72rem; font-weight: 800; color: #15803d; }

/* ── Monto de pago ── */
.ph-pago-amount { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.55rem; padding: 0.5rem; text-align: center; }
.ph-pago-amount span { display: block; font-size: 0.5rem; color: #6b7280; }
.ph-pago-amount b { font-size: 1rem; font-weight: 800; color: #15803d; }

/* ── Comprobante / check ── */
.ph-done-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  background: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.45);
  -webkit-animation: ayudaPop 1.9s ease-in-out infinite;
  animation: ayudaPop 1.9s ease-in-out infinite;
}
.ph-comprobante { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; height: 100%; }
.ph-done-badge--big { position: static; width: 3rem; height: 3rem; -webkit-animation: ayudaDonePop 1.8s ease-out; animation: ayudaDonePop 1.8s ease-out; }
.ph-comprobante-txt { font-size: 0.72rem; font-weight: 800; color: #15803d; font-family: inherit; }
@-webkit-keyframes ayudaPop { 0%, 70%, 100% { -webkit-transform: scale(1); } 82% { -webkit-transform: scale(1.22); } }
@keyframes ayudaPop { 0%, 70%, 100% { transform: scale(1); } 82% { transform: scale(1.22); } }

/* ── Botón CTA en su ubicación real (cabecera, ancho completo) ── */
.ph-cta--top { margin-top: 0.15rem; }

/* ── Etiqueta de sección ── */
.ph-list-label { font-size: 0.5rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.03em; padding-left: 0.1rem; }

/* ── Tarjeta de socio en la lista (borde de estado, avatar, badges, barra de progreso) ── */
.ph-socio-card { position: relative; display: flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid rgba(0, 0, 0, 0.06); border-left: 4px solid #ef4444; border-radius: 0.6rem; padding: 0.45rem 0.5rem; box-shadow: 0 4px 12px -8px rgba(0, 0, 0, 0.2); }
.ph-socio-card--mora { border-left-color: #ef4444; background: #fef2f2; }
.ph-socio-card--ok { border-left-color: #22c55e; background: #f0fdf4; }
.ph-dim { opacity: 0.5; }
.ph-ava-round { width: 1.9rem; height: 1.9rem; border-radius: 9999px; background: linear-gradient(135deg, #bbf7d0, #4ade80); flex-shrink: 0; }
.ph-ring-red { box-shadow: 0 0 0 2px #fecaca; }
.ph-ring-green { box-shadow: 0 0 0 2px #86efac; }
.ph-sc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.ph-sc-info b { display: block; height: 0.5rem; width: 3.2rem; border-radius: 9999px; background: #cbd5d1; }
.ph-sc-badges { display: flex; gap: 0.2rem; }
.ph-sc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
.ph-sc-amount { font-size: 0.62rem; font-weight: 800; color: #111827; }
.ph-progress { width: 3rem; height: 0.28rem; border-radius: 9999px; background: #e5e7eb; overflow: hidden; }
.ph-progress i { display: block; height: 100%; border-radius: 9999px; }

/* Variantes de badge */
.ph-badge--mora { background: #fee2e2; color: #b91c1c; }
.ph-badge--muted { background: #f3f4f6; color: #6b7280; }
.ph-badge--ok { background: #dcfce7; color: #15803d; }

/* ── Cabecera de hoja con avatar (modal «Cuotas del socio») ── */
.ph-sheet-head--socio { display: flex; align-items: center; justify-content: center; gap: 0.35rem; }
.ph-ava-round--xs { width: 1.1rem; height: 1.1rem; box-shadow: none; }

/* ── Fila de cuota (modal «Cuotas del socio») ── */
.ph-cuota-row { position: relative; display: flex; align-items: center; gap: 0.35rem; background: #fff; border: 1px solid #e5e7eb; border-left: 3px solid #f97316; border-radius: 0.55rem; padding: 0.4rem 0.45rem; }
.ph-cuota-row--pend { border-left-color: #f97316; background: #fff7ed; }
.ph-cuota-row--ok { border-left-color: #22c55e; background: #f0fdf4; }
.ph-cuota-emoji { font-size: 0.85rem; line-height: 1; }
.ph-cuota-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ph-cuota-row-info b { font-size: 0.6rem; font-weight: 800; color: #1f2937; }
.ph-cuota-row-info em { font-style: normal; font-size: 0.5rem; color: #9ca3af; }

/* ── Folder tabs (paso pestañas) ── */
.ph-folder { display: flex; gap: 0.3rem; align-items: flex-end; height: 3.6rem; }
.ph-folder-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  height: 2.6rem;
  background: #eaf5ee;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: none;
  border-radius: 0.6rem 0.6rem 0 0;
  transition: all 0.3s ease;
}
.ph-folder-tab--on { height: 3.3rem; background: #fff; box-shadow: 0 -6px 14px -8px rgba(0, 0, 0, 0.25); }
.ph-folder-emoji { font-size: 0.85rem; line-height: 1; }
.ph-folder-lbl { font-size: 0.6rem; font-weight: 800; color: #4b5563; }
.ph-folder-tab--on .ph-folder-lbl { color: #166534; }
.ph-folder-dot { width: 0.4rem; height: 0.4rem; border-radius: 9999px; box-shadow: 0 0 0 1.5px #fff; }
.ph-dot--green { background: #16a34a; }
.ph-dot--amber { background: #f59e0b; }
.ph-folder-panel { flex: 1; background: #fff; border-radius: 0 0 0.7rem 0.7rem; border: 1px solid rgba(0, 0, 0, 0.06); border-top: none; margin-top: -1px; box-shadow: 0 8px 18px -12px rgba(0, 0, 0, 0.2); }
.ayuda-finger--swipe2 { top: 4.6rem; left: 1.4rem; -webkit-animation: ayudaSwipe2 4.2s ease-in-out infinite; animation: ayudaSwipe2 4.2s ease-in-out infinite; }
@-webkit-keyframes ayudaSwipe2 { 0%, 100% { -webkit-transform: translate3d(0, 0, 0); } 50% { -webkit-transform: translate3d(7rem, 0, 0); } }
@keyframes ayudaSwipe2 { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(7rem, 0, 0); } }

/* ── Grid de meses (calendario) ── */
.ph-mesgrid { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.3rem; }
.ph-mescell { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem; font-size: 0.55rem; font-weight: 800; color: #374151; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.45rem; padding: 0.35rem 0.4rem; }
.ph-mescell-dot { width: 0.35rem; height: 0.35rem; border-radius: 9999px; background: #16a34a; }
.ph-mescell--on { background: #ecfdf5; border-color: #34d399; box-shadow: 0 0 0 1.5px rgba(52, 211, 153, 0.5); color: #047857; }

/* ── Listo ── */
.ayuda-done { position: relative; width: 5rem; height: 5rem; }
.ayuda-done-badge2 {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #1b5e37;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px -10px rgba(27, 94, 55, 0.6);
  -webkit-animation: ayudaDonePop 2.4s ease-in-out infinite;
  animation: ayudaDonePop 2.4s ease-in-out infinite;
}
@-webkit-keyframes ayudaDonePop { 0% { -webkit-transform: scale(0.6); opacity: 0; } 22%, 100% { -webkit-transform: scale(1); opacity: 1; } }
@keyframes ayudaDonePop { 0% { transform: scale(0.6); opacity: 0; } 22%, 100% { transform: scale(1); opacity: 1; } }
.ayuda-done-ring { position: absolute; inset: 0; border-radius: 9999px; border: 3px solid rgba(27, 94, 55, 0.5); -webkit-animation: ayudaTapRing 2.4s ease-out infinite; animation: ayudaTapRing 2.4s ease-out infinite; }

.ayuda-float { -webkit-animation: ayudaFloat 3s ease-in-out infinite; animation: ayudaFloat 3s ease-in-out infinite; }
@-webkit-keyframes ayudaFloat { 0%, 100% { -webkit-transform: translate3d(0, 0, 0); } 50% { -webkit-transform: translate3d(0, -5px, 0); } }
@keyframes ayudaFloat { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -5px, 0); } }

/* ══════════ Puntos de progreso ══════════ */
.ayuda-dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: #d1d5db; transition: all 0.25s ease; }
.ayuda-dot--on { width: 1.35rem; background: #1b5e37; }

/* ══════════ Transición sub-pantallas (hoja que sube) ══════════ */
.ayuda-rise-enter-active, .ayuda-rise-leave-active { transition: opacity 0.32s ease, -webkit-transform 0.32s ease; transition: opacity 0.32s ease, transform 0.32s ease; }
.ayuda-rise-enter-from { opacity: 0; -webkit-transform: translate3d(0, 14px, 0); transform: translate3d(0, 14px, 0); }
.ayuda-rise-leave-to { opacity: 0; -webkit-transform: translate3d(0, -8px, 0); transform: translate3d(0, -8px, 0); }

/* ══════════ Transición entre pasos ══════════ */
.ayuda-slide-next-enter-active, .ayuda-slide-next-leave-active,
.ayuda-slide-prev-enter-active, .ayuda-slide-prev-leave-active {
  transition: opacity 0.25s ease, -webkit-transform 0.25s ease;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.ayuda-slide-next-enter-from { opacity: 0; -webkit-transform: translate3d(24px, 0, 0); transform: translate3d(24px, 0, 0); }
.ayuda-slide-next-leave-to { opacity: 0; -webkit-transform: translate3d(-24px, 0, 0); transform: translate3d(-24px, 0, 0); }
.ayuda-slide-prev-enter-from { opacity: 0; -webkit-transform: translate3d(-24px, 0, 0); transform: translate3d(-24px, 0, 0); }
.ayuda-slide-prev-leave-to { opacity: 0; -webkit-transform: translate3d(24px, 0, 0); transform: translate3d(24px, 0, 0); }

@media (prefers-reduced-motion: reduce) {
  .ayuda-tap-ring, .ayuda-finger, .ayuda-float, .ph-done-badge, .ayuda-done-badge2,
  .ayuda-done-ring, .ayuda-finger--swipe2, .ph-done-badge--big {
    -webkit-animation: none !important;
    animation: none !important;
  }
}
</style>
