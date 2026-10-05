<template>
  <!--
    Solicitudes de socios para usar la app. Vive en el layout del panel: sale sola al
    entrar si hay solicitudes nuevas, desde cualquier pantalla, y también al tocar el
    aviso push (`?solicitudes=1`). Antes solo se veían entrando a Socios, y nadie se
    enteraba. Patrón de modal estándar (skill natillerapp-modals).
  -->
  <ModalWrapper
    :show="abierto"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="28rem"
    @close="cerrarMasTarde"
  >
    <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
      <!-- Móvil: [icono | títulos | X] -->
      <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
        <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
          <UserPlusIcon class="w-5 h-5 text-[color:var(--brand-primary)]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display font-bold text-white text-base leading-tight">Quieren usar la app</h3>
          <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">{{ subtitulo }}</p>
        </div>
        <button type="button" class="solicitudes-modal__x" aria-label="Cerrar" @click="cerrarMasTarde">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      <!-- Desktop: [hueco | icono + títulos | X] -->
      <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
        <div class="flex-1 min-w-0 flex flex-col items-center text-center">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
            <UserPlusIcon class="w-6 h-6 text-[color:var(--brand-primary)]" />
          </div>
          <h3 class="font-display font-bold text-white text-lg leading-tight">Quieren usar la app</h3>
          <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">{{ subtitulo }}</p>
        </div>
        <button type="button" class="solicitudes-modal__x" aria-label="Cerrar" @click="cerrarMasTarde">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="areaScroll"
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
        @scroll.passive="programarNatiscroll"
      >
        <div class="ds-callout">
          <ShieldCheckIcon class="ds-callout__icon w-5 h-5" />
          <p>
            <span class="ds-callout__title">Revisa la cuenta.</span>
            Aprueba solo si el nombre, el correo o el celular son de ese socio. Si el celular coincidió con otro, elige el socio correcto antes de aprobar.
          </p>
        </div>

        <section v-for="grupo in grupos" :key="grupo.natilleraId">
          <h4 v-if="grupos.length > 1" class="ds-overline mb-2">{{ grupo.nombre }}</h4>
          <ul class="space-y-2.5">
            <SolicitudVinculoItem
              v-for="sol in grupo.solicitudes"
              :key="sol.id"
              :solicitud="sol"
              :socios="sociosPorNatillera[sol.natillera_id] || []"
              :ocupado="ocupado"
              @aprobar="socioId => resolver(sol, true, { socioId })"
              @rechazar="resolver(sol, false)"
            />
          </ul>
        </section>

        <!--
          Avisos push: sin ellos el admin solo se entera al abrir la app. Se ofrece aquí
          porque es justo el momento en que se entiende para qué sirven.
        -->
        <div v-if="push.soportado.value && push.configurado.value && push.estado.value === 'sin_conceder'" class="solicitudes-modal__push">
          <BellAlertIcon class="w-5 h-5 shrink-0 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" aria-hidden="true" />
          <p class="min-w-0 flex-1 text-sm text-slate-700 oscuro:text-texto-medio">Recibe un aviso en el celular cuando alguien pida entrar.</p>
          <!-- Sin await antes: en Safari el permiso solo se pide pegado al toque -->
          <button type="button" class="solicitudes-modal__push-boton" :disabled="push.ocupado.value" @click="push.activar()">
            {{ push.ocupado.value ? 'Activando…' : 'Activar' }}
          </button>
        </div>
        <p v-else-if="push.estado.value === 'requiere_instalar'" class="text-xs text-slate-500 oscuro:text-texto-suave">
          Para recibir avisos en el iPhone, instala la app: Compartir → «Agregar a pantalla de inicio».
        </p>
      </div>

      <!-- Natiscroll -->
      <div v-show="hayNatiscroll" class="pointer-events-none absolute inset-x-0 bottom-0 z-10" aria-hidden="true">
        <div class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent" />
        <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
          <div class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20">
            <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white">Desliza para ver más</p>
            <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
          </div>
        </div>
      </div>
    </div>

    <!-- Pie fijo. `align="bottom"`: la barra de Safari lo tapa, se suma lo que mide (§4.1) -->
    <div
      class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 flex flex-row gap-2.5"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="cerrarMasTarde">Más tarde</button>
      <button
        v-if="solicitudes.length > 1"
        type="button"
        class="btn-modal-primary flex-[1.4]"
        :disabled="ocupado"
        @click="aprobarTodas"
      >
        {{ ocupado ? 'Aprobando…' : `Aprobar todas (${solicitudes.length})` }}
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellAlertIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import SolicitudVinculoItem from './SolicitudVinculoItem.vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { usePush } from '../../composables/usePush'
import { cargarSolicitudesPendientes, cargarSociosParaVincular, resolverSolicitudVinculo, suscribirSolicitudesVinculo, EVENTO_SOLICITUDES, EVENTO_SOLICITUDES_CAMBIO } from '../../composables/useSolicitudesVinculo'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificaciones = useNotificationStore()
const { tapado } = useTapadoInferior()
const push = usePush()

const solicitudes = ref([])
// Socios de cada natillera con solicitudes, para poder elegir otro al aprobar.
const sociosPorNatillera = ref({})
const abierto = ref(false)
const ocupado = ref(false)
useBodyScrollLock(abierto)

// «Más tarde» no vuelve a abrirla en esta sesión para las MISMAS solicitudes; una nueva sí.
const CLAVE_VISTAS = 'natillerapp_solicitudes_vinculo_vistas'
function idsVistas() {
  try { return new Set(JSON.parse(sessionStorage.getItem(CLAVE_VISTAS) || '[]')) } catch { return new Set() }
}
function marcarVistas() {
  try { sessionStorage.setItem(CLAVE_VISTAS, JSON.stringify(solicitudes.value.map(s => s.id))) } catch { /* sin almacenamiento */ }
}

const subtitulo = computed(() => {
  const n = solicitudes.value.length
  return n === 1 ? '1 socio quiere ver su estado de cuenta' : `${n} socios quieren ver su estado de cuenta`
})

const grupos = computed(() => {
  const mapa = new Map()
  for (const s of solicitudes.value) {
    if (!mapa.has(s.natillera_id)) mapa.set(s.natillera_id, { natilleraId: s.natillera_id, nombre: s.natillera_nombre, solicitudes: [] })
    mapa.get(s.natillera_id).solicitudes.push(s)
  }
  return [...mapa.values()]
})

let ultimaCarga = 0
async function cargar({ forzarAbrir = false } = {}) {
  if (!authStore.isAuthenticated || !authStore.user?.id) return
  ultimaCarga = Date.now()
  try {
    solicitudes.value = await cargarSolicitudesPendientes({ usuarioId: authStore.user.id })
  } catch (e) {
    console.error('Error cargando solicitudes de vínculo:', e)
    return
  }
  if (solicitudes.value.length === 0) {
    abierto.value = false
    return
  }
  cargarSociosDeSolicitudes()
  const vistas = idsVistas()
  const hayNuevas = solicitudes.value.some(s => !vistas.has(s.id))
  if (forzarAbrir || hayNuevas) {
    abierto.value = true
    push.comprobar?.()
  }
}

async function cargarSociosDeSolicitudes() {
  const ids = [...new Set(solicitudes.value.map(s => s.natillera_id))]
  const resultados = await Promise.all(ids.map(id => cargarSociosParaVincular(id).catch(() => [])))
  sociosPorNatillera.value = Object.fromEntries(ids.map((id, i) => [id, resultados[i]]))
}

function cerrarMasTarde() {
  if (ocupado.value) return
  marcarVistas()
  abierto.value = false
}

async function resolver(sol, aprobar, { silencioso = false, socioId = null } = {}) {
  ocupado.value = true
  try {
    const r = await resolverSolicitudVinculo(sol, aprobar, socioId)
    if (!r.ok) {
      if (!silencioso) notificaciones.warning('Ese socio ya está vinculado a otra cuenta', 'No se aprobó')
      return false
    }
    // Aprobar descarta las demás solicitudes del socio vinculado (lo hace la base de datos).
    solicitudes.value = solicitudes.value.filter(s => (aprobar ? s.id !== sol.id && s.socio_id !== r.socioId : s.id !== sol.id))
    const socios = sociosPorNatillera.value[sol.natillera_id] || []
    const elegido = socios.find(o => o.id === r.socioId)
    if (elegido) elegido.vinculado = true
    if (!silencioso) {
      const nombre = elegido?.nombre || sol.socio_nombre
      notificaciones.success(aprobar ? `${nombre} ya puede usar la app` : 'Solicitud rechazada', aprobar ? 'Aprobado' : 'Rechazada')
    }
    if (solicitudes.value.length === 0) abierto.value = false
    return true
  } catch (e) {
    console.error('Error resolviendo solicitud:', e)
    if (!silencioso) notificaciones.error('No se pudo resolver la solicitud', 'Error')
    return false
  } finally {
    ocupado.value = false
  }
}

async function aprobarTodas() {
  // Una por socio: si dos cuentas pidieron el mismo, se aprueba la más antigua.
  const vistos = new Set()
  const lista = solicitudes.value.filter(s => (vistos.has(s.socio_id) ? false : vistos.add(s.socio_id)))
  let aprobadas = 0
  for (const sol of lista) {
    if (await resolver(sol, true, { silencioso: true })) aprobadas++
  }
  notificaciones.success(`${aprobadas} ${aprobadas === 1 ? 'socio aprobado' : 'socios aprobados'}`, 'Listo')
}

// El aviso push abre la app con `?solicitudes=1`: mostrarla aunque ya se hubiera visto.
watch(() => route.query.solicitudes, (valor) => {
  if (valor !== '1') return
  cargar({ forzarAbrir: true })
  const { solicitudes: _, ...resto } = route.query
  router.replace({ query: resto })
}, { immediate: true })

/*
 * Tiempo real: cuando un socio pide unirse, el aviso aparece solo, sin recargar. Se
 * suscribe mientras haya sesión y avisa a las vistas abiertas (Socios, Invitar socios)
 * para que refresquen su lista.
 */
let cerrarTiempoReal = null
function alCambiarEnVivo() {
  cargar()
  window.dispatchEvent(new CustomEvent(EVENTO_SOLICITUDES_CAMBIO))
}
function conectarTiempoReal() {
  cerrarTiempoReal?.()
  cerrarTiempoReal = authStore.isAuthenticated ? suscribirSolicitudesVinculo(alCambiarEnVivo) : null
}

watch(() => authStore.isAuthenticated, (si) => {
  conectarTiempoReal()
  if (si) cargar()
})

// Otra vista (Socios) resolvió alguna: quitarla de aquí también.
function alResolverFuera(evento) {
  const sol = evento.detail?.solicitud
  if (!sol) return
  solicitudes.value = solicitudes.value.filter(s => (evento.detail.aprobada ? s.socio_id !== sol.socio_id : s.id !== sol.id))
  if (solicitudes.value.length === 0) abierto.value = false
}

// Al volver a la app (la PWA estaba en segundo plano), revisar si llegaron nuevas.
function alVolver() {
  if (document.visibilityState === 'visible' && Date.now() - ultimaCarga > 60_000) cargar()
}

onMounted(() => {
  cargar()
  conectarTiempoReal()
  window.addEventListener(EVENTO_SOLICITUDES, alResolverFuera)
  document.addEventListener('visibilitychange', alVolver)
})
onUnmounted(() => {
  cerrarTiempoReal?.()
  window.removeEventListener(EVENTO_SOLICITUDES, alResolverFuera)
  document.removeEventListener('visibilitychange', alVolver)
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
})

// Natiscroll
const areaScroll = ref(null)
const hayNatiscroll = ref(false)
let rafNatiscroll = null
function programarNatiscroll() {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(() => {
    rafNatiscroll = null
    const el = areaScroll.value
    hayNatiscroll.value = !!el && abierto.value &&
      el.scrollHeight > el.clientHeight + 1 && el.scrollTop + el.clientHeight < el.scrollHeight - 1
  })
}
watch([abierto, () => solicitudes.value.length, () => push.estado.value], () => {
  if (!abierto.value) {
    hayNatiscroll.value = false
    return
  }
  nextTick(programarNatiscroll)
}, { flush: 'post' })
</script>

<style scoped>
.solicitudes-modal__x {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.95);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.solicitudes-modal__x:hover { background: rgba(255, 255, 255, 0.15); }
.solicitudes-modal__push {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 0.875rem;
  background: var(--brand-primary-soft);
}
.solicitudes-modal__push-boton {
  flex-shrink: 0;
  min-height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  touch-action: manipulation;
}
</style>
