<template>
  <!--
    Guía rápida de Conciliación, para móvil: carrusel de pasos con mini-mockups fieles a
    la pantalla (filas por forma de pago, campo «hay de verdad», veredicto de colores,
    libro con saldo corrido, cierre de corte). Cada paso reproduce el flujo real por
    sub-etapas animadas (CSS + un temporizador que avanza las sub-pantallas).

    Existe porque el recorrido con foco (`RecorridoGuiado`) no funciona en pantalla
    estrecha: la burbuja del paso tapa justo lo que está señalando y la mayoría de los
    objetivos no caben en el hueco iluminado. Aquí no se señala nada real, se dibuja.

    Mismo patrón que `CuotasAyudaModal`: ModalWrapper, useBodyScrollLock y natiscroll,
    según la skill natillerapp-modals.
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
      <div class="flex min-h-[4.2rem] items-center gap-2 pb-3 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <ScaleIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <!--
          El título va corto y el contexto baja al subtítulo: «¿Cómo funciona
          Conciliación?» a 16px no cabe en la línea que le deja el icono y la X, y al
          partirse en dos la cabecera crecía por encima de su alto mínimo y quedaba
          descuadrada. En escritorio sí cabe entero.
        -->
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">¿Cómo funciona?</h3>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">
            Conciliación · paso {{ pasoActivo + 1 }} de {{ pasos.length }}
          </p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-white transition hover:bg-white/15"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cabecera marca (desktop = icono arriba + textos centrados) ── -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] text-white sm:block">
      <div class="flex items-start px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div class="w-11 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <ScaleIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">¿Cómo funciona Conciliación?</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">Guía rápida · {{ pasoActivo + 1 }} de {{ pasos.length }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-white transition hover:bg-white/15"
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
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="onScroll"
        @touchstart.passive="alEmpezarToque"
        @touchend.passive="alAcabarToque"
      >
        <Transition :name="dir === 1 ? 'ayuda-slide-next' : 'ayuda-slide-prev'" mode="out-in">
          <div :key="pasoActivo" class="px-5 pb-6 pt-5">
            <!-- ══════════ Escenario (mockup dibujado) ══════════ -->
            <div class="ayuda-stage">
              <!-- 0 · Intro: el panel del corte con sus tres formas -->
              <template v-if="paso.escena === 'intro'">
                <div class="ph ayuda-float">
                  <div class="ph-topbar">
                    <span class="ph-topbar-title">Conciliación</span>
                    <span class="ph-cal"><CalendarDaysIcon class="h-3 w-3 text-[#1B5E37]" /></span>
                  </div>
                  <div class="ph-fila">
                    <div class="ph-fila-top">
                      <span class="ph-forma ph-forma--verde">Efectivo</span>
                      <span class="ph-chip ph-chip--ok">Cuadra</span>
                    </div>
                    <div class="ph-par">
                      <div>
                        <span class="ph-mini-lbl">Debería haber</span>
                        <span class="ph-mini-val">$ 1.234.000</span>
                      </div>
                      <div>
                        <span class="ph-mini-lbl">Hay de verdad</span>
                        <span class="ph-campo">1.234.000</span>
                      </div>
                    </div>
                  </div>
                  <div class="ph-fila ph-dim">
                    <div class="ph-fila-top">
                      <span class="ph-forma ph-forma--azul">Transferencia</span>
                      <span class="ph-chip ph-chip--ok">Cuadra</span>
                    </div>
                  </div>
                  <div class="ph-fila ph-dim">
                    <div class="ph-fila-top">
                      <span class="ph-forma">Total</span>
                      <span class="ph-chip ph-chip--ok">Cuadra</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 1 · Contar: la app pone «debería haber», tú pones «hay de verdad» -->
              <template v-else-if="paso.escena === 'contar'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <!-- sub 0: la app ya trae su cifra y el campo está vacío -->
                      <template v-if="sub === 0">
                        <span class="ph-paso-lbl">La app calcula</span>
                        <div class="ph-fila">
                          <div class="ph-fila-top">
                            <span class="ph-forma ph-forma--verde">Efectivo</span>
                          </div>
                          <div class="ph-par">
                            <div>
                              <span class="ph-mini-lbl">Debería haber</span>
                              <span class="ph-mini-val ph-mini-val--pop">$ 1.234.000</span>
                            </div>
                            <div>
                              <span class="ph-mini-lbl">Hay de verdad</span>
                              <span class="ph-campo ph-campo--vacio">0</span>
                            </div>
                          </div>
                        </div>
                        <span class="ph-origen">Saldo al inicio + lo registrado después</span>
                      </template>

                      <!-- sub 1: cuentas el dinero y lo escribes -->
                      <template v-else-if="sub === 1">
                        <span class="ph-paso-lbl">Tú cuentas y escribes</span>
                        <div class="ph-fila">
                          <div class="ph-fila-top">
                            <span class="ph-forma ph-forma--verde">Efectivo</span>
                          </div>
                          <div class="ph-par">
                            <div>
                              <span class="ph-mini-lbl">Debería haber</span>
                              <span class="ph-mini-val">$ 1.234.000</span>
                            </div>
                            <div>
                              <span class="ph-mini-lbl">Hay de verdad</span>
                              <span class="ph-campo ph-campo--foco">
                                1.234.000<i class="ph-caret"></i>
                                <span class="ayuda-tap-ring"></span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <span class="ayuda-finger" style="bottom: 2.1rem; right: 1.6rem"></span>
                      </template>

                      <!-- sub 2: el veredicto aparece solo -->
                      <template v-else>
                        <span class="ph-paso-lbl">La diferencia sale sola</span>
                        <div class="ph-fila">
                          <div class="ph-fila-top">
                            <span class="ph-forma ph-forma--verde">Efectivo</span>
                            <span class="ph-chip ph-chip--ok ph-chip--pop">Cuadra $ 0</span>
                          </div>
                          <div class="ph-par">
                            <div>
                              <span class="ph-mini-lbl">Debería haber</span>
                              <span class="ph-mini-val">$ 1.234.000</span>
                            </div>
                            <div>
                              <span class="ph-mini-lbl">Hay de verdad</span>
                              <span class="ph-campo">1.234.000</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 2 · Veredicto: los tres colores, con su cifra real cambiando -->
              <template v-else-if="paso.escena === 'veredicto'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <span class="ph-paso-lbl">{{ veredicto.leyenda }}</span>
                      <div class="ph-fila" :class="veredicto.filaClase">
                        <div class="ph-fila-top">
                          <span class="ph-forma ph-forma--verde">Efectivo</span>
                          <span class="ph-chip ph-chip--pop" :class="veredicto.chipClase">
                            {{ veredicto.etiqueta }} {{ veredicto.importe }}
                          </span>
                        </div>
                        <div class="ph-par">
                          <div>
                            <span class="ph-mini-lbl">Debería haber</span>
                            <span class="ph-mini-val">$ 1.234.000</span>
                          </div>
                          <div>
                            <span class="ph-mini-lbl">Hay de verdad</span>
                            <span class="ph-campo">{{ veredicto.contado }}</span>
                          </div>
                        </div>
                      </div>
                      <span class="ph-origen">{{ veredicto.explicacion }}</span>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 3 · El libro: filtrar y seguir el saldo hasta el descuadre -->
              <template v-else-if="paso.escena === 'libro'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <!-- sub 0: rango rápido -->
                      <template v-if="sub === 0">
                        <span class="ph-paso-lbl">Acota el periodo</span>
                        <div class="ph-presets">
                          <span class="ph-preset ph-preset--on">Periodo<br />abierto</span>
                          <span class="ph-preset">Este mes</span>
                          <span class="ph-preset">
                            Todo
                            <span class="ayuda-tap-ring" style="width: 1.8rem; height: 1.8rem; margin: -0.9rem 0 0 -0.9rem"></span>
                          </span>
                        </div>
                        <div class="ph-buscador">
                          <MagnifyingGlassIcon class="h-3 w-3 text-gray-400" />
                          <i></i>
                        </div>
                        <span class="ayuda-finger" style="top: 3.1rem; right: 1.6rem"></span>
                      </template>

                      <!-- sub 1: los demás filtros, plegados -->
                      <template v-else-if="sub === 1">
                        <span class="ph-paso-lbl">O filtra por socio y concepto</span>
                        <div class="ph-buscador">
                          <MagnifyingGlassIcon class="h-3 w-3 text-gray-400" />
                          <i></i>
                        </div>
                        <div class="ph-mas">
                          <span class="ph-mas-txt">
                            <FunnelIcon class="h-2.5 w-2.5 text-gray-400" />
                            Más filtros
                          </span>
                          <span class="ph-mas-num">3</span>
                          <span class="ayuda-tap-ring" style="left: auto; right: 1rem"></span>
                        </div>
                        <div class="ph-mini-campo"></div>
                        <div class="ph-mini-campo ph-mini-campo--corto"></div>
                        <span class="ayuda-finger" style="top: 3.4rem; right: 1.2rem"></span>
                      </template>

                      <!-- sub 2: el libro con su saldo corrido -->
                      <template v-else-if="sub === 2">
                        <span class="ph-paso-lbl">Cada línea deja su saldo</span>
                        <div class="ph-apunte">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo">$ 1.150.000</span>
                        </div>
                        <div class="ph-apunte">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo">$ 1.200.000</span>
                        </div>
                        <div class="ph-apunte">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo">$ 1.234.000</span>
                        </div>
                      </template>

                      <!-- sub 3: la línea donde deja de cuadrar -->
                      <template v-else>
                        <span class="ph-paso-lbl">Baja hasta donde deja de cuadrar</span>
                        <div class="ph-apunte ph-dim">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo">$ 1.150.000</span>
                        </div>
                        <div class="ph-apunte ph-apunte--mal">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo ph-apunte-saldo--mal">$ 1.180.000</span>
                          <span class="ayuda-tap-ring" style="top: 50%; left: 50%"></span>
                        </div>
                        <div class="ph-apunte ph-dim">
                          <span class="ph-apunte-txt"></span>
                          <span class="ph-apunte-saldo">$ 1.214.000</span>
                        </div>
                        <span class="ph-origen ph-origen--mal">Aquí está la diferencia</span>
                      </template>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- 4 · Sellar: congelar las cifras y dejar firma -->
              <template v-else-if="paso.escena === 'sellar'">
                <div class="ph">
                  <Transition name="ayuda-rise">
                    <div :key="sub" class="ph-screen">
                      <template v-if="sub === 0">
                        <span class="ph-paso-lbl">Cuando estés conforme</span>
                        <div class="ph-umbral">
                          <span>Pedir nota si supera</span>
                          <span class="ph-umbral-box">$ 5.000</span>
                        </div>
                        <div class="ph-cta">
                          <LockClosedIcon class="h-3 w-3 text-white" />
                          Cerrar corte
                          <span class="ayuda-tap-ring"></span>
                        </div>
                        <span class="ayuda-finger" style="bottom: 0.6rem; left: 50%; margin-left: -0.7rem"></span>
                      </template>

                      <template v-else>
                        <span class="ph-paso-lbl">Queda firmado</span>
                        <div class="ph-firma">
                          <CheckIcon class="h-3 w-3 shrink-0 text-[#15803d]" />
                          <span>Corte del 5 sep · cuadró</span>
                        </div>
                        <div class="ph-firma ph-firma--muted">
                          <ClockIcon class="h-3 w-3 shrink-0 text-gray-400" />
                          <span>Revisó Ana · 5 sep, 7:40 p. m.</span>
                        </div>
                        <span class="ph-origen">Y se abre un periodo nuevo</span>
                        <div class="ph-done-badge"><CheckIcon class="h-4 w-4 text-white" /></div>
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
                <component :is="paso.icono" class="h-4 w-4 text-[#1B5E37]" />
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
    <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-3">
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
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import {
  ScaleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  LockClosedIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const showRef = computed(() => props.show)
useBodyScrollLock(showRef)

const pasos = [
  {
    escena: 'intro',
    icono: ScaleIcon,
    tag: 'Para qué sirve',
    titulo: 'Comprueba que la caja cuadra',
    descripcion: 'Compara lo que la app tiene registrado con el dinero que hay de verdad, por separado en efectivo y en la cuenta. Desliza o toca «Siguiente».',
    subCount: 1
  },
  {
    escena: 'contar',
    icono: BanknotesIcon,
    tag: 'Lo único que haces',
    titulo: 'Tú cuentas; la diferencia sale sola',
    descripcion: 'La app pone «debería haber». Tú cuentas el dinero y escribes cuánto hay. Es el único dato que tecleas en esta pantalla.',
    subCount: 3,
    subMs: 2000
  },
  {
    escena: 'veredicto',
    icono: ArrowsRightLeftIcon,
    tag: 'Cómo se lee',
    titulo: 'Verde cuadra, ámbar sobra, rojo falta',
    descripcion: 'Cada forma de pago lleva su veredicto en la cabecera, así que la fila se resume sola sin tener que leerla entera.',
    subCount: 3,
    subMs: 2200
  },
  {
    escena: 'libro',
    icono: MagnifyingGlassIcon,
    tag: 'Si no cuadra',
    titulo: 'Búscalo en el libro del periodo',
    descripcion: 'Acota por fecha, busca por socio o concepto y sigue el saldo línea a línea: donde deja de cuadrar está la diferencia.',
    subCount: 4,
    subMs: 1900
  },
  {
    escena: 'sellar',
    icono: LockClosedIcon,
    tag: 'Cerrar',
    titulo: 'Sella el corte y queda firmado',
    descripcion: 'Cerrar el corte congela las cifras, guarda quién revisó y qué explicó, y abre un periodo nuevo desde esa fecha.',
    subCount: 2,
    subMs: 2400
  },
  {
    escena: 'listo',
    icono: CheckCircleIcon,
    tag: 'Listo',
    titulo: '¡Ya sabes lo esencial!',
    descripcion: 'Cuenta, escribe y cierra. Toca «Entendido» para empezar.',
    subCount: 1
  }
]

const pasoActivo = ref(0)
const dir = ref(1) // 1 = avanzar, -1 = retroceder (transición entre pasos)
const sub = ref(0) // sub-etapa dentro del paso animado
const paso = computed(() => pasos[pasoActivo.value])
const esUltimo = computed(() => pasoActivo.value === pasos.length - 1)

/** Los tres desenlaces del paso «veredicto», uno por sub-etapa. */
const VEREDICTOS = [
  {
    leyenda: 'Contaste lo mismo',
    etiqueta: 'Cuadra',
    importe: '$ 0',
    contado: '1.234.000',
    chipClase: 'ph-chip--ok',
    filaClase: 'ph-fila--ok',
    explicacion: 'Todo lo registrado está en la caja'
  },
  {
    leyenda: 'Contaste de más',
    etiqueta: 'Sobra',
    importe: '+$ 20.000',
    contado: '1.254.000',
    chipClase: 'ph-chip--sobra',
    filaClase: 'ph-fila--sobra',
    explicacion: 'Hay dinero sin registrar todavía'
  },
  {
    leyenda: 'Contaste de menos',
    etiqueta: 'Falta',
    importe: '−$ 20.000',
    contado: '1.214.000',
    chipClase: 'ph-chip--falta',
    filaClase: 'ph-fila--falta',
    explicacion: 'Algo salió sin quedar anotado'
  }
]
const veredicto = computed(() => VEREDICTOS[sub.value] || VEREDICTOS[0])

const { scrollRef, hayMas, onScroll, remedir } = useNatiscroll(showRef)

// ── Temporizador de sub-etapas (reproduce el flujo real paso a paso) ──
let temporizadorSub = null
function detenerSub() {
  if (temporizadorSub != null) {
    clearInterval(temporizadorSub)
    temporizadorSub = null
  }
}
function arrancarSub() {
  detenerSub()
  sub.value = 0
  const cuantas = paso.value.subCount || 1
  if (cuantas <= 1) return
  temporizadorSub = setInterval(() => {
    sub.value = (sub.value + 1) % cuantas
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

// ── Swipe horizontal para cambiar de paso ──
let toqueX = 0
let toqueY = 0
function alEmpezarToque(e) {
  const t = e.changedTouches[0]
  toqueX = t.clientX
  toqueY = t.clientY
}
function alAcabarToque(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - toqueX
  const dy = t.clientY - toqueY
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return // ignora el scroll vertical
  if (dx < 0) siguienteOListo()
  else atrasOSaltar()
}

watch(
  () => props.show,
  (abierto) => {
    if (!abierto) return detenerSub()
    pasoActivo.value = 0
    dir.value = 1
    arrancarSub()
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
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
.ph-screen {
  position: absolute;
  inset: 0;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

/* ── Barra superior ── */
.ph-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.1rem 0.15rem 0.2rem; }
.ph-topbar-title { font-size: 0.6rem; font-weight: 800; color: #166534; }
.ph-cal { width: 1.4rem; height: 1.4rem; border-radius: 0.45rem; background: #fff; border: 1px solid rgba(22, 163, 74, 0.3); display: flex; align-items: center; justify-content: center; }

/* ── Etiqueta de la etapa, arriba de la escena ── */
.ph-paso-lbl { font-size: 0.5rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.03em; }

/* ── Fila de una forma de pago (el bloque compacto de móvil) ── */
.ph-fila {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-left: 3px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.35rem 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.ph-fila--ok { border-left-color: #16a34a; background: #f0fdf4; }
.ph-fila--sobra { border-left-color: #f59e0b; background: #fffbeb; }
.ph-fila--falta { border-left-color: #ef4444; background: #fef2f2; }
.ph-fila-top { display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; }
.ph-forma { font-size: 0.58rem; font-weight: 800; color: #4b5563; }
.ph-forma--verde { color: #15803d; }
.ph-forma--azul { color: #1d4ed8; }
.ph-dim { opacity: 0.45; }

/* ── Veredicto ── */
.ph-chip { font-size: 0.5rem; font-weight: 800; padding: 0.1rem 0.35rem; border-radius: 0.35rem; white-space: nowrap; }
.ph-chip--ok { background: #d1fae5; color: #065f46; }
.ph-chip--sobra { background: #fef3c7; color: #78350f; }
.ph-chip--falta { background: #fee2e2; color: #991b1b; }
.ph-chip--pop { -webkit-animation: ayudaPop 2s ease-in-out infinite; animation: ayudaPop 2s ease-in-out infinite; }
@-webkit-keyframes ayudaPop { 0%, 70%, 100% { -webkit-transform: scale(1); } 82% { -webkit-transform: scale(1.18); } }
@keyframes ayudaPop { 0%, 70%, 100% { transform: scale(1); } 82% { transform: scale(1.18); } }

/* ── Par «debería haber» / «hay de verdad» ── */
.ph-par { display: flex; align-items: flex-end; gap: 0.35rem; }
.ph-par > div { flex: 1; min-width: 0; }
.ph-mini-lbl { display: block; font-size: 0.45rem; color: #9ca3af; line-height: 1.2; }
.ph-mini-val { display: block; font-size: 0.62rem; font-weight: 800; color: #15803d; }
.ph-mini-val--pop { -webkit-animation: ayudaPop 2s ease-in-out infinite; animation: ayudaPop 2s ease-in-out infinite; }
.ph-campo {
  position: relative;
  display: flex;
  align-items: center;
  height: 1.15rem;
  padding: 0 0.25rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.35rem;
  background: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  color: #111827;
}
.ph-campo--vacio { color: #d1d5db; }
.ph-campo--foco { border-color: #1b5e37; box-shadow: 0 0 0 2px rgba(27, 94, 55, 0.18); }
.ph-caret {
  width: 1px;
  height: 0.6rem;
  margin-left: 1px;
  background: #1b5e37;
  -webkit-animation: ayudaCaret 1s steps(1, end) infinite;
  animation: ayudaCaret 1s steps(1, end) infinite;
}
@-webkit-keyframes ayudaCaret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes ayudaCaret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

/* ── Pie explicativo dentro de la maqueta ── */
.ph-origen { font-size: 0.45rem; color: #9ca3af; text-align: center; margin-top: auto; }
.ph-origen--mal { color: #b91c1c; font-weight: 800; }

/* ── Rango rápido y filtros ── */
.ph-presets { display: flex; gap: 0.2rem; }
.ph-preset {
  position: relative;
  flex: 1;
  text-align: center;
  font-size: 0.45rem;
  font-weight: 800;
  line-height: 1.15;
  color: #4b5563;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.35rem;
  padding: 0.25rem 0.1rem;
}
.ph-preset--on { background: #1b5e37; color: #fff; border-color: #1b5e37; }
.ph-buscador { display: flex; align-items: center; gap: 0.3rem; border: 1.5px solid #e5e7eb; border-radius: 0.4rem; padding: 0.25rem 0.3rem; background: #fff; }
.ph-buscador i { display: block; height: 0.38rem; width: 3.2rem; border-radius: 9999px; background: #e5e7eb; }
.ph-mas { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.4rem; padding: 0.28rem 0.3rem; }
.ph-mas-txt { display: flex; align-items: center; gap: 0.2rem; font-size: 0.5rem; font-weight: 800; color: #4b5563; }
.ph-mas-num { font-size: 0.45rem; font-weight: 800; color: #fff; background: #1b5e37; border-radius: 9999px; padding: 0.05rem 0.25rem; }
.ph-mini-campo { height: 0.85rem; border-radius: 0.3rem; background: #f3f4f6; border: 1px solid #e5e7eb; }
.ph-mini-campo--corto { width: 60%; }

/* ── Apuntes del libro con su saldo corrido ── */
.ph-apunte { position: relative; display: flex; align-items: center; gap: 0.3rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.4rem; padding: 0.28rem 0.3rem; }
.ph-apunte--mal { border-color: #fca5a5; background: #fef2f2; }
.ph-apunte-txt { flex: 1; min-width: 0; height: 0.38rem; border-radius: 9999px; background: #dbe5df; }
.ph-apunte-saldo { font-size: 0.5rem; font-weight: 800; color: #374151; white-space: nowrap; }
.ph-apunte-saldo--mal { color: #b91c1c; }

/* ── Cerrar corte ── */
.ph-umbral { display: flex; align-items: center; justify-content: space-between; gap: 0.3rem; font-size: 0.45rem; color: #6b7280; }
.ph-umbral-box { font-size: 0.5rem; font-weight: 800; color: #111827; border: 1px solid #e5e7eb; border-radius: 0.3rem; background: #fff; padding: 0.15rem 0.3rem; }
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
.ph-firma { display: flex; align-items: center; gap: 0.3rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.4rem; padding: 0.3rem; font-size: 0.48rem; font-weight: 700; color: #15803d; }
.ph-firma--muted { background: #f9fafb; border-color: #e5e7eb; color: #6b7280; }
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

/* ══════════ Transición de sub-pantallas (hoja que sube) ══════════ */
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
  .ayuda-done-ring, .ph-chip--pop, .ph-mini-val--pop, .ph-caret {
    -webkit-animation: none !important;
    animation: none !important;
  }
}
</style>
