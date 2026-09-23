<template>
  <div class="notificar mx-auto max-w-6xl space-y-5 pb-6 sm:space-y-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <BellAlertIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">Notificar</h1>
            <p class="ds-page-header__sub hidden sm:block">
              Estado de cuenta de cada socio, listo para descargar o mandar por WhatsApp
            </p>
          </div>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="cargar">
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': cargando }" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sin permiso: la barra lateral ya oculta la opción, pero la URL se puede escribir a mano -->
    <section v-if="!cargando && sinPermiso" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap">
          <LockClosedIcon class="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <h2 class="ds-empty-state__title">No tienes permiso para notificar</h2>
        <p class="ds-empty-state__subtitle">Pídele al administrador de la natillera que te lo active.</p>
      </div>
    </section>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
    >
      {{ error }}
      <button type="button" class="ml-2 font-semibold underline" @click="cargar">Reintentar</button>
    </div>

    <!--
      Dos columnas en escritorio (lista | estado del socio). En móvil es una sola: el
      socio elegido vive en la URL (?socio=), así que el gesto de volver de iOS y el
      botón atrás de Android regresan a la lista sin lógica propia.
    -->
    <div v-else class="notificar__grid">
      <!-- ─── Lista de socios ─── -->
      <section
        class="notificar__lista"
        :class="{ 'is-oculta-movil': socioElegidoId }"
        aria-label="Socios"
      >
        <!-- Resumen: a quién conviene escribir hoy -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            v-for="tarjeta in tarjetasResumen"
            :key="tarjeta.valor"
            type="button"
            class="notificar-kpi"
            :class="[`notificar-kpi--${tarjeta.tono}`, { 'is-selected': kpiActivo(tarjeta.valor) }]"
            :aria-pressed="kpiActivo(tarjeta.valor)"
            @click="alternarFiltro(tarjeta.valor)"
          >
            <span class="notificar-kpi__valor tabular-nums">{{ cargando ? '–' : tarjeta.cantidad }}</span>
            <span class="notificar-kpi__etiqueta">{{ tarjeta.etiqueta }}</span>
          </button>
        </div>

        <!-- Buscador: flex, sin iconos con absolute (se descolocan en Safari al enfocar) -->
        <label class="notificar-buscar">
          <MagnifyingGlassIcon class="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
          <input
            v-model="busqueda"
            type="text"
            inputmode="search"
            enterkeyhint="search"
            autocomplete="off"
            placeholder="Buscar por nombre o teléfono"
            class="notificar-buscar__input"
            aria-label="Buscar socio"
          />
          <button
            v-if="busqueda"
            type="button"
            class="notificar-buscar__limpiar"
            aria-label="Borrar búsqueda"
            @click="busqueda = ''"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </label>

        <p class="flex items-center justify-between gap-2 px-1 text-xs text-gray-500">
          <span>Mostrando: <strong class="text-gray-800">{{ etiquetaFiltro }}</strong></span>
          <button
            v-if="filtro !== 'todos'"
            type="button"
            class="min-h-[2.75rem] font-semibold text-[color:var(--brand-primary)] touch-manipulation"
            @click="filtro = 'todos'"
          >
            Ver todos
          </button>
          <button
            v-else
            type="button"
            class="min-h-[2.75rem] font-semibold text-[color:var(--brand-primary)] touch-manipulation"
            @click="filtro = FILTRO_INICIAL"
          >
            Solo los que deben
          </button>
        </p>

        <!-- Esqueleto mientras carga: reserva el alto de la lista -->
        <ul v-if="cargando" class="notificar-filas" aria-hidden="true">
          <li v-for="n in 6" :key="n" class="notificar-fila notificar-fila--esqueleto">
            <span class="h-11 w-11 shrink-0 rounded-full bg-gray-200/80" />
            <span class="flex-1 space-y-2">
              <span class="block h-3.5 w-2/3 rounded bg-gray-200/80" />
              <span class="block h-3 w-1/3 rounded bg-gray-200/70" />
            </span>
          </li>
        </ul>

        <ul v-else-if="sociosVisibles.length > 0" class="notificar-filas">
          <li v-for="sn in sociosVisibles" :key="sn.id">
            <button
              type="button"
              class="notificar-fila"
              :class="{ 'is-selected': String(socioElegidoId) === String(sn.id) }"
              :aria-current="String(socioElegidoId) === String(sn.id) ? 'true' : undefined"
              @click="elegirSocio(sn)"
            >
              <img
                :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)"
                :alt="''"
                class="h-11 w-11 shrink-0 rounded-full border border-gray-200 bg-white object-cover"
                loading="lazy"
              />
              <span class="min-w-0 flex-1 text-left">
                <span class="block truncate font-semibold text-gray-900">{{ sn.socio?.nombre || 'Socio' }}</span>
                <span class="block truncate text-xs text-gray-500">
                  {{ sn.socio?.telefono || 'Sin teléfono' }}
                </span>
              </span>
              <span class="notificar-estado" :class="`notificar-estado--${semaforo(sn).tono}`">
                {{ semaforo(sn).texto }}
              </span>
              <ChevronRightIcon class="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <div v-else class="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center">
          <UsersIcon class="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p class="text-sm font-medium text-gray-600">
            {{ busqueda
              ? 'Nadie coincide con la búsqueda'
              : filtro === 'con_deuda' ? '¡Nadie debe cuotas! Todos están al día' : 'No hay socios en este grupo' }}
          </p>
        </div>
      </section>

      <!-- ─── Estado del socio elegido ─── -->
      <section
        class="notificar__detalle"
        :class="{ 'is-oculta-movil': !socioElegidoId }"
        aria-live="polite"
      >
        <!-- Nada elegido (solo escritorio: en móvil esta columna no se ve) -->
        <div v-if="!socioElegidoId" class="notificar-vacio">
          <div class="notificar-vacio__icono">
            <DocumentCheckIcon class="h-8 w-8" />
          </div>
          <p class="font-display text-lg font-bold text-gray-900">Elige un socio</p>
          <p class="mt-1 max-w-xs text-sm text-gray-500">
            Verás su estado de cuenta tal como le llegará: ahorro, cuotas, sanciones,
            actividades y préstamos.
          </p>
        </div>

        <template v-else>
          <!-- Volver a la lista: solo móvil; en escritorio la lista sigue al lado -->
          <button type="button" class="notificar-volver" @click="volverALista">
            <ChevronLeftIcon class="h-5 w-5" />
            Todos los socios
          </button>

          <div class="notificar-ficha">
            <img
              :src="getAvatarUrl(socioElegido?.socio?.nombre || socioElegidoId, socioElegido?.socio?.avatar_seed)"
              alt=""
              class="h-14 w-14 shrink-0 rounded-full border-2 border-white bg-white object-cover shadow-sm"
            />
            <div class="min-w-0 flex-1">
              <p class="ds-overline">Estado de cuenta</p>
              <h2 class="truncate font-display text-lg font-bold leading-tight text-gray-900 sm:text-xl">
                {{ socioElegido?.socio?.nombre || estado?.socio?.nombre || 'Socio' }}
              </h2>
              <p class="truncate text-sm text-gray-500">
                {{ socioElegido?.socio?.telefono || 'Sin teléfono registrado' }}
              </p>
            </div>
          </div>

          <div v-if="calculandoEstado" class="notificar-cargando">
            <span class="notificar-cargando__rueda" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-600">Calculando su estado…</p>
          </div>

          <div v-else-if="errorEstado" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ errorEstado }}
            <button type="button" class="ml-2 font-semibold underline" @click="calcularEstado">Reintentar</button>
          </div>

          <template v-else-if="estado">
            <!-- 4×1000: lo paga solo quien consigna por transferencia; se decide al enviar -->
            <label v-if="(estado.totalAPagar || 0) > 0" class="notificar-4x1000">
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-bold text-gray-900">Incluir 4×1000</span>
                <span class="block text-xs text-gray-500">
                  {{ incluir4x1000 ? `Suma $${formatMoney(estado.valor4x1000 || 0)} por pago con transferencia` : 'Para pagos en efectivo' }}
                </span>
              </span>
              <input v-model="incluir4x1000" type="checkbox" role="switch" class="notificar-switch__input" />
              <span class="notificar-switch" aria-hidden="true" />
            </label>

            <div class="notificar-preview">
              <ComprobanteEstadoSocio :estado="estado" :incluir4x1000="incluir4x1000" :fluido="true" />
            </div>

            <!--
              Acciones al final del comprobante, en móvil y en escritorio. Antes en móvil
              flotaban sobre la navegación; se prefieren aquí, donde termina lo que se envía.
            -->
            <div class="notificar-acciones">
              <button
                type="button"
                class="ds-btn ds-btn--secondary flex-1"
                :disabled="!imagen"
                @click="descargar"
              >
                <ArrowDownTrayIcon class="h-5 w-5" />
                Descargar
              </button>
              <button type="button" class="notificar-whatsapp flex-1" :disabled="!imagen" @click="enviarWhatsApp">
                <!-- Logo de WhatsApp: el globo genérico de Heroicons no se reconocía -->
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.45-9.44 9.45zm8.04-17.49A11.3 11.3 0 0 0 12.04.67C5.77.67.67 5.77.67 12.04c0 2 .52 3.96 1.52 5.68L.57 23.33l5.74-1.5a11.34 11.34 0 0 0 5.72 1.46h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.9-3.33-8.05z"/></svg>
                {{ imagen ? 'WhatsApp' : 'Preparando…' }}
              </button>
            </div>
          </template>
        </template>
      </section>
    </div>


    <!--
      Copia del ticket a 380 px fijos, fuera de pantalla: es la que se convierte en imagen.
      La vista previa se ajusta al ancho disponible y saldría distinta en cada teléfono.
    -->
    <div v-if="estado" class="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
      <div ref="ticketRef" style="padding: 16px; background: #eef2ee;">
        <ComprobanteEstadoSocio :estado="estado" :incluir4x1000="incluir4x1000" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toPng } from 'html-to-image'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BellAlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import ComprobanteEstadoSocio from '../../components/estado/ComprobanteEstadoSocio.vue'
import { supabase } from '../../lib/supabase'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { calcularEstadoSocio, cargarSemaforoCuotas, textoEstadoSocio } from '../../composables/useEstadoSocio'
import { getAvatarUrl } from '../../utils/avatars'
import { formatMoney } from '../../utils/formatMoney'

const route = useRoute()
const router = useRouter()
const colaboradoresStore = useColaboradoresStore()

const id = computed(() => route.params.id)
const socioElegidoId = computed(() => route.query.socio || null)

const cargando = ref(true)
const error = ref(null)
const sinPermiso = ref(false)
const natillera = ref(null)
const socios = ref([])
const semaforoPorSocio = ref({})

const busqueda = ref('')
/*
 * Por defecto solo los que deben (en mora o con cuota pendiente): son a quienes se
 * notifica. Los que están al día quedan a un toque, en «Ver todos» o en su tarjeta.
 */
const FILTRO_INICIAL = 'con_deuda'
const filtro = ref(FILTRO_INICIAL)

// ─── Carga ───
async function cargar() {
  cargando.value = true
  error.value = null
  sinPermiso.value = false
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const [natRes, sociosRes] = await Promise.all([
      supabase.from('natilleras').select('id, nombre, admin_id, reglas_multas').eq('id', id.value).single(),
      supabase
        .from('socios_natillera')
        .select('id, estado, valor_cuota_individual, socio:socios(id, nombre, telefono, avatar_seed)')
        .eq('natillera_id', id.value)
    ])
    if (natRes.error) throw natRes.error
    if (sociosRes.error) throw sociosRes.error
    natillera.value = natRes.data

    const esSuperUsuario = (user?.email || '').toLowerCase().trim() === 'raigo.16@gmail.com'
    const esAdmin = natRes.data.admin_id === user?.id || esSuperUsuario
    if (!esAdmin) {
      const permisos = await colaboradoresStore.obtenerMisPermisos(id.value, { user, skipAdminCheck: true })
      if (permisos?.permisos?.notificar !== true) {
        sinPermiso.value = true
        return
      }
    }

    socios.value = (sociosRes.data || [])
      .slice()
      .sort((a, b) => (a.socio?.nombre || '').localeCompare(b.socio?.nombre || '', 'es'))

    const diasGracia = natRes.data.reglas_multas?.dias_gracia || 3
    semaforoPorSocio.value = await cargarSemaforoCuotas(socios.value.map(s => s.id), diasGracia)
  } catch (e) {
    console.error('Error cargando Notificar:', e)
    error.value = 'No se pudo cargar la lista de socios.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

// ─── Lista, filtros y semáforo ───
function semaforo(sn) {
  const fila = semaforoPorSocio.value[sn.id]
  if (!fila) return { tono: 'neutro', texto: '—', grupo: 'al_dia' }
  if (fila.mora > 0) {
    return { tono: 'mora', texto: fila.mora === 1 ? '1 en mora' : `${fila.mora} en mora`, grupo: 'mora' }
  }
  if (fila.pendientes > 0) {
    return { tono: 'pendiente', texto: fila.pendientes === 1 ? '1 pendiente' : `${fila.pendientes} pendientes`, grupo: 'pendiente' }
  }
  return { tono: 'al-dia', texto: 'Al día', grupo: 'al_dia' }
}

const conteos = computed(() => {
  const total = { mora: 0, pendiente: 0, al_dia: 0 }
  socios.value.forEach(sn => { total[semaforo(sn).grupo]++ })
  return total
})

const tarjetasResumen = computed(() => [
  { valor: 'mora', etiqueta: 'En mora', tono: 'mora', cantidad: conteos.value.mora },
  { valor: 'pendiente', etiqueta: 'Pendientes', tono: 'pendiente', cantidad: conteos.value.pendiente },
  { valor: 'al_dia', etiqueta: 'Al día', tono: 'al-dia', cantidad: conteos.value.al_dia }
])

const etiquetaFiltro = computed(() => {
  if (filtro.value === 'todos') return 'Todos los socios'
  if (filtro.value === 'con_deuda') return 'En mora y pendientes'
  return tarjetasResumen.value.find(t => t.valor === filtro.value)?.etiqueta || ''
})

// Con el filtro inicial se iluminan a la vez «En mora» y «Pendientes»: es lo que se ve.
function kpiActivo(valor) {
  if (filtro.value === 'con_deuda') return valor === 'mora' || valor === 'pendiente'
  return filtro.value === valor
}

// Tocar la tarjeta ya elegida vuelve al filtro inicial, no a «todos».
function alternarFiltro(valor) {
  filtro.value = filtro.value === valor ? FILTRO_INICIAL : valor
}

const sociosVisibles = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return socios.value.filter(sn => {
    const grupo = semaforo(sn).grupo
    if (filtro.value === 'con_deuda' && grupo === 'al_dia') return false
    if (filtro.value !== 'todos' && filtro.value !== 'con_deuda' && grupo !== filtro.value) return false
    if (!texto) return true
    return (sn.socio?.nombre || '').toLowerCase().includes(texto) || (sn.socio?.telefono || '').includes(texto)
  })
})

const socioElegido = computed(() => socios.value.find(s => String(s.id) === String(socioElegidoId.value)) || null)

function elegirSocio(sn) {
  // En escritorio se reemplaza: no tiene sentido llenar el historial al pasar de un socio a otro.
  const enEscritorio = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches
  const destino = { query: { ...route.query, socio: sn.id } }
  if (enEscritorio && socioElegidoId.value) router.replace(destino)
  else router.push(destino)
}

function volverALista() {
  // Si se entró a la ficha desde la lista, volver es retroceder; si llegó con enlace directo, quitar el socio.
  if (window.history.state?.back) {
    router.back()
    return
  }
  const { socio, ...resto } = route.query
  router.replace({ query: resto })
}

// ─── Estado del socio elegido ───
const estado = ref(null)
const calculandoEstado = ref(false)
const errorEstado = ref(null)
const incluir4x1000 = ref(true)
let turnoEstado = 0

async function calcularEstado() {
  errorEstado.value = null
  estado.value = null
  if (!socioElegidoId.value || !natillera.value) return
  const turno = ++turnoEstado
  const sn = socioElegido.value || { id: socioElegidoId.value, socio: { nombre: 'Socio' } }
  calculandoEstado.value = true
  try {
    const resultado = await calcularEstadoSocio(sn, natillera.value)
    if (turno !== turnoEstado) return
    estado.value = resultado
    incluir4x1000.value = true
  } catch (e) {
    if (turno !== turnoEstado) return
    console.error('Error calculando el estado del socio:', e)
    errorEstado.value = 'No se pudo calcular el estado de este socio.'
  } finally {
    if (turno === turnoEstado) calculandoEstado.value = false
  }
}

watch([socioElegidoId, natillera], () => {
  calcularEstado()
  // En móvil la ficha reemplaza la lista: empezar arriba, no a media página.
  if (socioElegidoId.value) window.scrollTo?.({ top: 0 })
})

// ─── Imagen para compartir ───
const ticketRef = ref(null)
const imagen = ref(null)
let turnoImagen = 0

function nombreArchivo() {
  const nombre = (estado.value?.socio?.nombre || 'socio').trim().replace(/\s+/g, '-')
  return `estado-socio-${nombre}.png`
}

/*
 * La imagen se genera en cuanto hay estado y cada vez que cambia el 4×1000, no al tocar
 * «Enviar»: Safari solo abre el menú de compartir si `navigator.share` va pegado al
 * toque, y el `await` de generar la imagen hacía caducar el gesto.
 */
async function prepararImagen() {
  imagen.value = null
  if (!estado.value) return
  const turno = ++turnoImagen
  try {
    await nextTick()
    if (!ticketRef.value) return
    const dataUrl = await toPng(ticketRef.value, { backgroundColor: '#eef2ee', pixelRatio: 2, cacheBust: true })
    const blob = await (await fetch(dataUrl)).blob()
    if (turno !== turnoImagen) return
    imagen.value = { dataUrl, archivo: new File([blob], nombreArchivo(), { type: 'image/png' }) }
  } catch (e) {
    console.error('Error generando la imagen del estado:', e)
  }
}

watch([estado, incluir4x1000], prepararImagen)

function descargar() {
  if (!imagen.value) return
  const enlace = document.createElement('a')
  enlace.download = nombreArchivo()
  enlace.href = imagen.value.dataUrl
  enlace.click()
}

function enviarWhatsApp() {
  const datosEstado = estado.value
  const img = imagen.value
  if (!datosEstado || !img) return
  const telefono = (socioElegido.value?.socio?.telefono || datosEstado.socio?.telefono || '').replace(/\D/g, '')
  const texto = textoEstadoSocio(datosEstado, incluir4x1000.value)
  const datos = { files: [img.archivo], title: 'Estado de cuenta', text: texto }
  // Sin menú de compartir (escritorio): se descarga la imagen y, si hay número, se abre el chat.
  const abrirChat = () => {
    descargar()
    if (!telefono) {
      alert('La imagen se descargó. El socio no tiene teléfono registrado: envíala desde WhatsApp.')
      return
    }
    const numero = telefono.length === 10 ? '57' + telefono : telefono
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
    alert('La imagen se descargó. Adjúntala en WhatsApp para enviarla al socio.')
  }
  // Nada asíncrono antes del share: ver `prepararImagen`.
  if (navigator.canShare?.(datos)) {
    navigator.share(datos).catch(err => {
      if (err?.name !== 'AbortError') abrirChat()
    })
    return
  }
  abrirChat()
}
</script>

<style scoped>
/* ─── Estructura ─── */
.notificar__grid {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 1024px) {
  .notificar__grid {
    grid-template-columns: minmax(0, 23rem) minmax(0, 1fr);
    align-items: start;
  }
  /* La lista acompaña al hacer scroll; el `sticky` va en la columna, no dentro de un
     contenedor con overflow (ahí Safari lo ignora, manual §15). */
  .notificar__lista {
    position: sticky;
    top: 1rem;
  }
}
.notificar__lista,
.notificar__detalle {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-width: 0;
}

/* ─── KPIs / filtros rápidos ─── */
.notificar-kpi {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  min-height: 4.5rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-fast);
}
.notificar-kpi:active { transform: scale(0.98); }
.notificar-kpi__valor {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}
.notificar-kpi__etiqueta {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}
.notificar-kpi--mora .notificar-kpi__valor { color: #b91c1c; }
.notificar-kpi--pendiente .notificar-kpi__valor { color: #b45309; }
.notificar-kpi--al-dia .notificar-kpi__valor { color: var(--brand-primary); }
.notificar-kpi--mora.is-selected { border-color: #fca5a5; background: #fef2f2; box-shadow: 0 0 0 1px #fca5a5 inset; }
.notificar-kpi--pendiente.is-selected { border-color: #fcd34d; background: #fffbeb; box-shadow: 0 0 0 1px #fcd34d inset; }
.notificar-kpi--al-dia.is-selected { border-color: rgba(27, 94, 55, 0.4); background: var(--brand-primary-soft); box-shadow: 0 0 0 1px rgba(27, 94, 55, 0.4) inset; }

/* ─── Buscador ─── */
.notificar-buscar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem 0 0.875rem;
  min-height: 3rem;
  border-radius: 9999px;
  border: 1px solid var(--surface-divider-strong);
  background: #fff;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.notificar-buscar:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.12);
}
.notificar-buscar__input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 1rem; /* iOS: con menos de 16 px hace zoom al enfocar */
  color: #0f172a;
  padding: 0.625rem 0;
}
.notificar-buscar__input:focus { box-shadow: none; }
.notificar-buscar__limpiar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 9999px;
  color: #94a3b8;
  touch-action: manipulation;
}

/* ─── Filas ─── */
.notificar-filas {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.notificar-fila {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 4rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base);
}
.notificar-fila:hover { border-color: rgba(27, 94, 55, 0.3); box-shadow: var(--shadow-sm); }
.notificar-fila:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; }
.notificar-fila.is-selected {
  border-color: var(--brand-primary);
  background: var(--brand-primary-soft);
  box-shadow: 0 0 0 1px var(--brand-primary) inset;
}
.notificar-fila--esqueleto {
  cursor: default;
  -webkit-animation: notificar-pulso 1.4s ease-in-out infinite;
  animation: notificar-pulso 1.4s ease-in-out infinite;
}

/* ─── Semáforo ─── */
.notificar-estado {
  flex-shrink: 0;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
}
.notificar-estado--mora { background: #fee2e2; color: #991b1b; }
.notificar-estado--pendiente { background: #fef3c7; color: #92400e; }
.notificar-estado--al-dia { background: #dcfce7; color: #166534; }
.notificar-estado--neutro { background: #f1f5f9; color: #64748b; }

/* ─── Detalle ─── */
.notificar-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 24rem;
  padding: 2rem;
  text-align: center;
  border-radius: var(--radius-xl, 1.25rem);
  border: 1px dashed rgba(27, 94, 55, 0.25);
  background: linear-gradient(180deg, #f6fbf7 0%, #fff 100%);
}
.notificar-vacio__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.875rem;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: #fff;
  box-shadow: var(--shadow-brand);
}
.notificar-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0 0.75rem 0 0.375rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--brand-primary);
  background: var(--brand-primary-soft);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.notificar-ficha {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(27, 94, 55, 0.18);
  background: linear-gradient(135deg, #eef7f0 0%, #fff 70%);
  box-shadow: var(--shadow-xs);
}
.notificar-cargando {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
}
.notificar-cargando__rueda {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 3px solid rgba(27, 94, 55, 0.15);
  border-top-color: var(--brand-primary);
  -webkit-animation: notificar-giro 0.8s linear infinite;
  animation: notificar-giro 0.8s linear infinite;
}
.notificar-preview {
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: #eef2ee;
}

/* ─── Interruptor 4×1000 ─── */
.notificar-4x1000 {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: #fff;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.notificar-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  margin: 0;
}
.notificar-switch {
  position: relative;
  flex-shrink: 0;
  width: 3rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: #cbd5e1;
  transition: background-color var(--transition-base);
}
.notificar-switch::after {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  transition: transform var(--transition-base);
}
.notificar-switch__input:checked + .notificar-switch { background: var(--brand-primary); }
.notificar-switch__input:checked + .notificar-switch::after { transform: translateX(1.25rem); }
.notificar-switch__input:focus-visible + .notificar-switch { outline: 2px solid var(--brand-primary); outline-offset: 2px; }

/* ─── Acciones ─── */
.notificar-acciones {
  display: flex;
  gap: 0.75rem;
}
/* Verde de WhatsApp. Antes era #128C7E, el verde azulado de su marca antigua, que en
   pantalla se leía como azul. #1DA851 se reconoce como WhatsApp y el texto blanco en
   negrita sigue siendo legible (el #25D366 oficial deja el blanco sin contraste). */
.notificar-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: var(--tap-min);
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  border: 0;
  background: #1da851;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.9375rem;
  box-shadow: 0 6px 16px -6px rgba(29, 168, 81, 0.6);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--transition-base), transform var(--transition-fast);
}
.notificar-whatsapp:hover:not(:disabled) { background: #179245; }
.notificar-whatsapp:active:not(:disabled) { transform: scale(0.98); }
.notificar-whatsapp:disabled { opacity: 0.5; cursor: not-allowed; }

/*
 * Qué se ve en cada ancho. Va AL FINAL a propósito: pisa el `display` de las reglas de
 * arriba y, con la misma especificidad, gana la que va después. Tampoco se usa
 * `lg:hidden` de Tailwind: vive en `@layer utilities` y este CSS sin capa le gana.
 */
@media (max-width: 1023px) {
  .notificar__lista.is-oculta-movil,
  .notificar__detalle.is-oculta-movil { display: none; }
}
@media (min-width: 1024px) {
  .notificar-volver { display: none; }
}

/* ─── Animaciones ─── */
@-webkit-keyframes notificar-giro { to { -webkit-transform: rotate(360deg); } }
@keyframes notificar-giro { to { transform: rotate(360deg); } }
@-webkit-keyframes notificar-pulso { 50% { opacity: 0.55; } }
@keyframes notificar-pulso { 50% { opacity: 0.55; } }

@media (prefers-reduced-motion: reduce) {
  .notificar-kpi,
  .notificar-fila,
  .notificar-switch,
  .notificar-switch::after,
  .notificar-whatsapp { transition: none; }
  .notificar-kpi:active,
  .notificar-whatsapp:active:not(:disabled) { transform: none; }
  .notificar-fila--esqueleto,
  .notificar-cargando__rueda { -webkit-animation: none; animation: none; }
}
</style>
