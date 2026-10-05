<template>
  <!--
    Sanciones del socio, explicadas. Lo abre «Aportes» del portal cuando el admin deja
    ver el detalle (config_portal_socio.mostrar_sanciones). Dos partes: cómo maneja la
    natillera las sanciones (sus reglas, en palabras) y cada sanción desglosada.
  -->
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="32rem"
    @close="emit('cerrar')"
  >
    <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
      <!-- Móvil: [icono | títulos | X] -->
      <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
        <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ScaleIcon class="w-5 h-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display font-bold text-white text-base leading-tight">Tus sanciones</h3>
          <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">Cómo se calcularon, una por una</p>
        </div>
        <button type="button" class="sanc-x" aria-label="Cerrar" @click="emit('cerrar')">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      <!-- Desktop: [hueco | icono + títulos | X] -->
      <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
        <div class="flex-1 min-w-0 flex flex-col items-center text-center">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ScaleIcon class="w-6 h-6 text-[#1B5E37]" />
          </div>
          <h3 class="font-display font-bold text-white text-lg leading-tight">Tus sanciones</h3>
          <p class="text-xs text-white/85 leading-snug mt-1">Cómo se calcularon, una por una</p>
        </div>
        <button type="button" class="sanc-x" aria-label="Cerrar" @click="emit('cerrar')">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] bg-superficie-suave px-4 pt-4 pb-6 space-y-4"
        @scroll.passive="onScroll"
      >
        <!-- Resumen -->
        <div v-if="filas.length" class="grid grid-cols-3 gap-2">
          <div class="sanc-cifra">
            <span class="sanc-cifra__etiqueta">Pagado</span>
            <strong class="sanc-cifra__valor text-texto-fuerte">${{ formatMoney(totalPagado) }}</strong>
          </div>
          <div class="sanc-cifra">
            <span class="sanc-cifra__etiqueta">Pendiente</span>
            <strong class="sanc-cifra__valor" :class="totalPendiente > 0 ? 'text-peligro' : 'text-texto-fuerte'">
              ${{ formatMoney(totalPendiente) }}
            </strong>
          </div>
          <div class="sanc-cifra">
            <span class="sanc-cifra__etiqueta">Cuotas</span>
            <strong class="sanc-cifra__valor text-texto-fuerte">{{ filas.length }}</strong>
          </div>
        </div>

        <!-- Cómo funcionan en esta natillera -->
        <section class="sanc-card">
          <h4 class="sanc-card__titulo">
            <InformationCircleIcon class="h-5 w-5 flex-shrink-0 text-marca-tinta" aria-hidden="true" />
            Cómo funcionan las sanciones en {{ natilleraNombre || 'tu natillera' }}
          </h4>

          <p v-if="!reglas.activa" class="mt-2 text-sm leading-relaxed text-texto-secundario">
            Tu natillera no cobra sanciones por pagar tarde.
          </p>

          <ol v-else class="mt-3 space-y-3">
            <li class="sanc-regla">
              <span class="sanc-regla__icono"><CalendarDaysIcon class="h-4 w-4" /></span>
              <p>
                <strong>Plazo.</strong>
                <template v-if="reglas.diasGracia > 0">
                  Después de la fecha límite de cada cuota tienes
                  <strong>{{ reglas.diasGracia }} {{ reglas.diasGracia === 1 ? 'día' : 'días' }} de gracia</strong>
                  sin sanción.
                </template>
                <template v-else>
                  No hay días de gracia: la sanción corre desde el día siguiente a la fecha límite.
                </template>
              </p>
            </li>

            <li class="sanc-regla">
              <span class="sanc-regla__icono"><ScaleIcon class="h-4 w-4" /></span>
              <div class="min-w-0">
                <p v-if="reglas.tipo === 'simple'">
                  <strong>Sanción fija.</strong> Cada cuota pagada fuera de plazo tiene una sanción de
                  <strong>${{ formatMoney(reglas.valorFijo) }}</strong>.
                </p>
                <p v-else-if="reglas.tipo === 'diaria'">
                  <strong>Sanción por día.</strong> Se cobran
                  <strong>${{ formatMoney(reglas.valorPorDia) }}</strong> por cada día de retraso.
                </p>
                <template v-else>
                  <p>
                    <strong>Sanción escalonada.</strong> Cuantas más cuotas tengas en mora, mayor la
                    sanción de cada una:
                  </p>
                  <ul class="sanc-tramos">
                    <li v-for="t in tramos" :key="t.desde">
                      <span>{{ etiquetaTramo(t) }}</span>
                      <strong class="tabular-nums">${{ formatMoney(t.valor) }}</strong>
                    </li>
                  </ul>
                </template>
              </div>
            </li>

            <li v-if="reglas.intereses.activo && reglas.intereses.valor > 0" class="sanc-regla">
              <span class="sanc-regla__icono"><ClockIcon class="h-4 w-4" /></span>
              <p>
                <strong>Intereses.</strong> Además, por cada
                <strong>{{ reglas.intereses.dias }} {{ reglas.intereses.dias === 1 ? 'día' : 'días' }}</strong>
                en mora se suman <strong>${{ formatMoney(reglas.intereses.valor) }}</strong>.
              </p>
            </li>

            <li v-if="reglas.devolucion.activo && reglas.devolucion.cuotasLimite > 0" class="sanc-regla">
              <span class="sanc-regla__icono sanc-regla__icono--alerta"><ExclamationTriangleIcon class="h-4 w-4" /></span>
              <p>
                <strong>Mora excesiva.</strong> Si acumulas
                <strong>{{ reglas.devolucion.cuotasLimite }} cuotas</strong> sin pagar, la natillera
                puede devolverte lo ahorrado con una multa del
                <strong>{{ reglas.devolucion.porcentaje }}%</strong><template v-if="reglas.devolucion.sinUtilidades">
                  y sin las utilidades</template>.
              </p>
            </li>
          </ol>
        </section>

        <!-- Detalle por cuota -->
        <section v-if="filas.length" class="space-y-2.5">
          <h4 class="px-1 text-[0.6875rem] font-bold uppercase tracking-wide text-texto-suave">Detalle por cuota</h4>

          <article v-for="f in filas" :key="f.cuota.id" class="sanc-card">
            <header class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-display text-[0.9375rem] font-bold text-texto-fuerte">{{ formatoPeriodoCuota(f.cuota) }}</p>
                <p class="mt-0.5 text-xs leading-snug text-texto-suave">
                  <template v-if="f.d.inicioMora">En mora desde el {{ formatDate(f.d.inicioMora) }}</template>
                  <template v-if="f.d.pagadaEl"> · pagaste el {{ formatDate(f.d.pagadaEl) }}</template>
                </p>
              </div>
              <span :class="['sanc-estado', `sanc-estado--${f.estado}`]">{{ ETIQUETA_ESTADO[f.estado] }}</span>
            </header>

            <p v-if="f.d.diasRetraso != null" class="sanc-dias">
              <ClockIcon class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>
                <strong class="tabular-nums">{{ f.d.diasRetraso }} {{ f.d.diasRetraso === 1 ? 'día' : 'días' }}</strong>
                de retraso{{ f.d.pagadaEl ? '' : ' hasta hoy' }}
              </span>
            </p>

            <dl class="sanc-desglose">
              <div class="sanc-desglose__fila">
                <dt>
                  Base
                  <span class="sanc-desglose__nota">{{ f.d.explicacionBase }}</span>
                </dt>
                <dd>${{ formatMoney(f.d.base) }}</dd>
              </div>
              <div v-if="f.d.intereses > 0" class="sanc-desglose__fila">
                <dt>
                  {{ f.d.etiquetaExtra }}
                  <span v-if="reglas.intereses.activo && f.d.periodos > 0 && f.d.valorPorPeriodo > 0" class="sanc-desglose__nota">
                    {{ f.d.periodos }} × ${{ formatMoney(f.d.valorPorPeriodo) }}
                    (uno cada {{ f.d.diasPorPeriodo }} {{ f.d.diasPorPeriodo === 1 ? 'día' : 'días' }})
                  </span>
                </dt>
                <dd>${{ formatMoney(f.d.intereses) }}</dd>
              </div>
              <div class="sanc-desglose__fila sanc-desglose__fila--total">
                <dt>Sanción</dt>
                <dd>${{ formatMoney(f.d.total || f.d.pagado) }}</dd>
              </div>
              <div v-if="f.d.pagado > 0" class="sanc-desglose__fila">
                <dt>Pagaste</dt>
                <dd class="text-exito">${{ formatMoney(f.d.pagado) }}</dd>
              </div>
              <div v-if="f.d.pendiente > 0" class="sanc-desglose__fila">
                <dt>Te falta</dt>
                <dd class="text-peligro">${{ formatMoney(f.d.pendiente) }}</dd>
              </div>
            </dl>

            <!-- Los intereses de una cuota se cortan cuando vence la siguiente en mora (stores/cuotas.js,
                 cálculo por tramos): sin decirlo, «148 días» con «7 intereses» parece un error -->
            <p v-if="cortadaPorSiguiente(f)" class="sanc-nota">
              Los intereses de esta cuota corren hasta que vence tu siguiente cuota en mora; desde ahí
              los cobra esa otra cuota, para no cobrarte dos veces los mismos días.
            </p>
            <p v-if="f.d.condonada" class="sanc-nota">
              Tu administrador no te cobró esta sanción.
            </p>
          </article>
        </section>

        <p v-else-if="reglas.activa" class="sanc-card text-center text-sm text-texto-secundario">
          No has tenido sanciones. ¡Sigue así!
        </p>

        <p class="px-1 text-[0.6875rem] leading-relaxed text-texto-tenue">
          Las cifras son las que registró tu administrador. Si algo no te cuadra, pregúntale por el chat de soporte de tu natillera o directamente.
        </p>
      </div>
      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- Pie fijo. `align="bottom"`: la barra de Safari lo tapa, se suma lo que mide (§4.1) -->
    <div
      class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-primary w-full" @click="emit('cerrar')">Entendido</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, toRef } from 'vue'
import {
  CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon, InformationCircleIcon, ScaleIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { formatoPeriodoCuota } from '../../composables/useEstadoSocio'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate } from '../../utils/formatDate'
import { desglosarSancion, normalizarReglas, ordinal, tramosEscalonada } from '../../utils/desgloseSanciones'

const props = defineProps({
  show: { type: Boolean, default: false },
  cuotas: { type: Array, default: () => [] },
  reglasMultas: { type: Object, default: null },
  natilleraNombre: { type: String, default: '' },
})
const emit = defineEmits(['cerrar'])

const ETIQUETA_ESTADO = { pagada: 'Pagada', pendiente: 'Pendiente', parcial: 'Abonada', condonada: 'No cobrada' }

const reglas = computed(() => normalizarReglas(props.reglasMultas))
const tramos = computed(() => tramosEscalonada(reglas.value.niveles))

function etiquetaTramo(t) {
  if (t.hasta == null) return t.desde === 1 ? 'Cualquier cuota en mora' : `Desde la ${ordinal(t.desde)} cuota en mora`
  if (t.desde === t.hasta) return `${t.desde === 1 ? 'Primera' : `La ${ordinal(t.desde)}`} cuota en mora`
  return `De la ${ordinal(t.desde)} a la ${ordinal(t.hasta)} cuota en mora`
}

// Cuotas con sanción, de la más reciente a la más antigua
const filas = computed(() => {
  const hoy = new Date()
  return props.cuotas
    .map((cuota) => ({ cuota, d: desglosarSancion(cuota, reglas.value, hoy) }))
    .filter((f) => f.d)
    .map((f) => ({
      ...f,
      estado: f.d.condonada ? 'condonada' : f.d.pendiente <= 0 ? 'pagada' : f.d.pagado > 0 ? 'parcial' : 'pendiente',
    }))
    .reverse()
})

function cortadaPorSiguiente(f) {
  const d = f.d
  if (!reglas.value.intereses.activo || !d.diasRetraso || d.diasPorPeriodo <= 0) return false
  return (d.periodos + 1) * d.diasPorPeriodo <= d.diasRetraso
}

const totalPagado = computed(() => filas.value.reduce((s, f) => s + f.d.pagado, 0))
const totalPendiente = computed(() => filas.value.reduce((s, f) => s + f.d.pendiente, 0))

const show = toRef(props, 'show')
useBodyScrollLock(show)
const { scrollRef, hayMas, onScroll } = useNatiscroll(show)
const { tapado } = useTapadoInferior()
</script>

<style scoped>
.sanc-x {
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: rgb(255 255 255 / 0.95);
  touch-action: manipulation;
}
.sanc-x:hover { background: rgb(255 255 255 / 0.15); }

.sanc-card {
  border-radius: 1rem;
  border: 1px solid var(--borde);
  background: var(--superficie-tarjeta);
  padding: 0.875rem 1rem;
}
.sanc-card__titulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--texto-fuerte);
}

.sanc-cifra {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  border-radius: 0.875rem;
  border: 1px solid var(--borde);
  background: var(--superficie-tarjeta);
  padding: 0.625rem 0.75rem;
  min-width: 0;
}
.sanc-cifra__etiqueta {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--texto-suave);
}
.sanc-cifra__valor {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.sanc-regla {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--texto-secundario);
}
.sanc-regla strong { color: var(--texto-fuerte); }
.sanc-regla__icono {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: var(--marca-suave);
  color: var(--marca-texto);
}
.sanc-regla__icono--alerta { background: var(--alerta-suave); color: var(--alerta); }

.sanc-tramos {
  margin-top: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--borde);
  overflow: hidden;
}
.sanc-tramos li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}
.sanc-tramos li + li { border-top: 1px solid var(--borde-suave); }

.sanc-estado {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 0.1875rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 800;
}
.sanc-estado--pagada { background: var(--exito-suave); color: var(--exito); }
.sanc-estado--pendiente { background: var(--peligro-suave); color: var(--peligro); }
.sanc-estado--parcial { background: var(--alerta-suave); color: var(--alerta); }
.sanc-estado--condonada { background: var(--info-suave); color: var(--info); }

.sanc-dias {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  color: var(--texto-secundario);
}
.sanc-dias strong { color: var(--texto-fuerte); }

.sanc-desglose {
  margin-top: 0.625rem;
  border-radius: 0.75rem;
  background: var(--superficie-suave);
  padding: 0.25rem 0.75rem;
}
.sanc-desglose__fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.4375rem 0;
  font-size: 0.8125rem;
}
.sanc-desglose__fila + .sanc-desglose__fila { border-top: 1px dashed var(--borde); }
.sanc-desglose__fila dt { color: var(--texto-secundario); min-width: 0; }
.sanc-desglose__fila dd { flex-shrink: 0; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--texto-fuerte); }
.sanc-desglose__nota { display: block; font-size: 0.6875rem; color: var(--texto-suave); }
.sanc-desglose__fila--total dt,
.sanc-desglose__fila--total dd { font-weight: 800; color: var(--texto-fuerte); }

.sanc-nota {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--info);
}
</style>
