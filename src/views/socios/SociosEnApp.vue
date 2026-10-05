<template>
  <!--
    Socios en la app: quién ya entra a ver su estado de cuenta, quién pidió acceso y quién
    falta. Antes era una modal dentro de Socios con todo en un solo scroll y mucho texto;
    ahora es una página con una sección por tarea y lo mínimo escrito.

    Un solo enlace por natillera (`/unirme/<código>`): cada socio entra con su cuenta, escribe
    su celular y el admin aprueba viendo con qué cuenta se pidió. Invitar a uno por uno usa
    wa.me (sin API de WhatsApp: cero costo).
  -->
  <div class="mx-auto max-w-6xl space-y-5 pb-6 sm:space-y-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <UserPlusIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Invitar socios</h1>
            <p class="ds-page-header__sub">Para que vean su portal · {{ nombreNatillera }}</p>
          </div>
        </div>
      </div>
    </header>

    <CargaCaja v-if="cargando" texto="Cargando socios" />

    <template v-else>
      <div v-if="!puedeGestionar" class="ds-callout">
        <InformationCircleIcon class="ds-callout__icon h-5 w-5" />
        <p><span class="ds-callout__title">Solo lectura.</span> Tu permiso en Socios es de solo ver.</p>
      </div>

      <!-- Avance -->
      <section class="app-avance" aria-label="Avance">
        <div class="flex items-baseline justify-between gap-3">
          <p class="font-display text-2xl font-extrabold tabular-nums text-slate-900 oscuro:text-texto-fuerte">
            {{ conApp.length }} <span class="text-base font-semibold text-slate-400 oscuro:text-texto-tenue">de {{ sociosActivos.length }}</span>
          </p>
          <p class="text-sm font-semibold text-slate-500 oscuro:text-texto-suave">usan la app</p>
        </div>
        <div class="app-avance__barra" aria-hidden="true"><span :style="{ width: porcentaje + '%' }" /></div>
        <ul class="app-avance__cifras">
          <li><span class="app-punto app-punto--con" aria-hidden="true" /><strong class="tabular-nums">{{ conApp.length }}</strong> con la app</li>
          <li v-if="solicitudes.length > 0"><span class="app-punto app-punto--aprobar" aria-hidden="true" /><strong class="tabular-nums">{{ solicitudes.length }}</strong> por aprobar</li>
          <li><span class="app-punto app-punto--sin" aria-hidden="true" /><strong class="tabular-nums">{{ sinApp.length }}</strong> sin la app</li>
        </ul>
      </section>

      <!-- Buscar: filtra las tres listas a la vez (nombre, correo o celular) -->
      <div class="ds-search app-buscar" role="search">
        <MagnifyingGlassIcon class="h-4 w-4" aria-hidden="true" />
        <input
          v-model="busqueda"
          type="text"
          class="ds-search__input"
          placeholder="Buscar por nombre, correo o celular"
          aria-label="Buscar socio por nombre, correo o celular"
          autocomplete="off"
          enterkeyhint="search"
          @keydown.esc="busqueda = ''"
        />
        <button v-if="busqueda" type="button" class="ds-search__clear" aria-label="Limpiar búsqueda" @click="busqueda = ''">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <!--
        Móvil: una columna en este orden (aprobar, invitar, con app, sin app). Desde 1024 px,
        las listas a la izquierda e «Invitar» fija a la derecha: el contenedor de las listas
        pasa de `display: contents` a columna propia.
      -->
      <div class="app-cuerpo">
        <div class="app-cuerpo__listas">
          <!-- Por aprobar: lo único que pide una decisión -->
          <section v-if="solicitudes.length > 0" class="app-seccion app-seccion--aprobar">
            <div class="app-seccion__cabeza">
              <h2 class="app-seccion__titulo">Por aprobar <span class="app-conteo app-conteo--aprobar">{{ solicitudesFiltradas.length }}</span></h2>
              <button
                v-if="puedeGestionar && solicitudes.length > 1"
                type="button"
                class="ds-btn ds-btn--primary"
                :disabled="resolviendo"
                @click="aprobarTodas"
              >
                Aprobar todas
              </button>
            </div>
            <p class="app-seccion__nota">Revisa que la cuenta sea de esa persona.</p>
            <p v-if="solicitudesFiltradas.length === 0" class="app-vacio">Nadie coincide con «{{ busqueda }}».</p>
            <ul v-else class="mt-3 space-y-2.5">
              <SolicitudVinculoItem
                v-for="sol in solicitudesFiltradas"
                :key="sol.id"
                :solicitud="{ ...sol, socio_nombre: nombreSocio(sol.socio_id) }"
                :socios="sociosParaVincular"
                :ocupado="resolviendo || !puedeGestionar"
                @aprobar="socioId => resolver(sol, true, { socioId })"
                @rechazar="resolver(sol, false)"
              />
            </ul>
          </section>

          <!-- Con la app -->
          <section class="app-seccion app-seccion--con">
            <div class="app-seccion__cabeza">
              <h2 class="app-seccion__titulo">Con la app <span class="app-conteo">{{ cuentasFiltradas.length }}</span></h2>
            </div>
            <CargaCaja v-if="cargandoCuentas && cuentas.length === 0" texto="Cargando cuentas" />
            <p v-else-if="cuentas.length === 0" class="app-vacio">Nadie todavía. Comparte el enlace.</p>
            <p v-else-if="cuentasFiltradas.length === 0" class="app-vacio">Nadie coincide con «{{ busqueda }}».</p>
            <ul v-else class="app-lista">
              <li v-for="c in cuentasFiltradas" :key="c.socio_id" class="app-fila">
                <div class="app-fila__principal">
                  <span class="app-avatar" aria-hidden="true">{{ inicial(c.socio_nombre) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="app-fila__nombre">
                      {{ c.socio_nombre }}
                      <span v-if="c.socio_estado !== 'activo'" class="app-etiqueta">Retirado</span>
                    </p>
                    <p class="app-fila__dato">{{ c.cuenta_email || c.cuenta_nombre || 'Sin correo' }}</p>
                  </div>
                  <div v-if="puedeGestionar && editando?.socio_id !== c.socio_id" class="app-fila__acciones">
                    <button
                      type="button"
                      class="app-icono"
                      :aria-label="`Pasar la cuenta de ${c.socio_nombre} a otro socio`"
                      title="Cambiar socio"
                      @click="editando = { socio_id: c.socio_id, modo: 'cambiar', destino: null }"
                    >
                      <ArrowsRightLeftIcon class="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      class="app-icono app-icono--peligro"
                      :aria-label="`Desvincular la cuenta de ${c.socio_nombre}`"
                      title="Desvincular"
                      @click="editando = { socio_id: c.socio_id, modo: 'desvincular' }"
                    >
                      <LinkSlashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <!-- Cambiar a otro socio -->
                <div v-if="editando?.socio_id === c.socio_id && editando.modo === 'cambiar'" class="app-panel">
                  <label class="app-panel__etiqueta" :for="`cambiar-${c.socio_id}`">Pasar esta cuenta a</label>
                  <select :id="`cambiar-${c.socio_id}`" v-model="editando.destino" class="app-select" :disabled="guardando">
                    <option :value="null" disabled>Elige un socio</option>
                    <option v-for="o in sociosLibres" :key="o.id" :value="o.id">{{ o.nombre }}</option>
                  </select>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="guardando" @click="editando = null">Cancelar</button>
                    <button type="button" class="btn-modal-primary flex-1" :disabled="guardando || !editando.destino" @click="cambiarVinculo(c)">
                      {{ guardando ? 'Cambiando…' : 'Cambiar' }}
                    </button>
                  </div>
                </div>

                <!-- Desvincular: confirmación en línea -->
                <div v-else-if="editando?.socio_id === c.socio_id && editando.modo === 'desvincular'" class="app-panel app-panel--peligro">
                  <p class="text-sm text-red-800 oscuro:text-red-300">¿Desvincular? Podrá pedir acceso otra vez.</p>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="guardando" @click="editando = null">Cancelar</button>
                    <button type="button" class="app-boton-peligro flex-1" :disabled="guardando" @click="desvincular(c)">
                      {{ guardando ? 'Desvinculando…' : 'Desvincular' }}
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <!-- Sin la app: a quién falta invitar -->
          <section class="app-seccion app-seccion--sin">
            <div class="app-seccion__cabeza">
              <h2 class="app-seccion__titulo">Sin la app <span class="app-conteo">{{ sinAppFiltrados.length }}</span></h2>
            </div>
            <p v-if="sinApp.length === 0" class="app-vacio">Todos los socios activos ya usan la app.</p>
            <p v-else-if="sinAppFiltrados.length === 0" class="app-vacio">Nadie coincide con «{{ busqueda }}».</p>
            <ul v-else class="app-lista">
              <li v-for="s in sinAppFiltrados" :key="s.id" class="app-fila">
                <div class="app-fila__principal">
                  <span class="app-avatar app-avatar--sin" aria-hidden="true">{{ inicial(s.nombre) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="app-fila__nombre">
                      {{ s.nombre }}
                      <span v-if="s.pidio" class="app-etiqueta app-etiqueta--aprobar">Pidió acceso</span>
                    </p>
                    <p v-if="s.celularValido" class="app-fila__dato tabular-nums">{{ s.telefono }}</p>
                    <p v-else class="app-fila__dato app-fila__dato--aviso">
                      <ExclamationTriangleIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                      Celular incompleto: no podrá vincularse
                    </p>
                  </div>
                  <!-- Invitar a uno: su chat de WhatsApp con el enlace ya escrito -->
                  <a
                    v-if="puedeGestionar && s.celularValido && urlInvitacion && !s.pidio"
                    :href="enlaceWhatsAppSocio(s)"
                    target="_blank"
                    rel="noopener"
                    class="btn-compartir btn-compartir--sm flex-shrink-0"
                    :aria-label="`Invitar a ${s.nombre} por WhatsApp`"
                  >
                    <IconoWhatsApp class="w-4 h-4 flex-shrink-0" />
                    <span>Invitar</span>
                  </a>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <!-- Invitar al grupo -->
        <aside class="app-seccion app-invitar">
          <h2 class="app-seccion__titulo">Invitar al grupo</h2>

          <div v-if="cargandoCodigo" class="app-enlace text-slate-400 oscuro:text-texto-tenue">Preparando enlace…</div>
          <div v-else-if="errorCodigo" class="ds-callout bg-[#fee2e2] oscuro:bg-red-500/15 text-[#991b1b] oscuro:text-red-300" role="alert">
            {{ errorCodigo }}
          </div>
          <template v-else>
            <div class="app-enlace">
              <span class="min-w-0 flex-1 truncate text-[13px] text-slate-700 oscuro:text-texto-medio">{{ urlInvitacion }}</span>
              <button type="button" class="app-enlace__copiar" @click="copiarEnlace">
                <ClipboardDocumentIcon class="h-4 w-4" aria-hidden="true" />
                {{ enlaceCopiado ? 'Copiado' : 'Copiar' }}
              </button>
            </div>
            <button
              type="button"
              class="btn-compartir w-full"
              :disabled="!codigo || !puedeGestionar"
              @click="compartirAlGrupo"
            >
              <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
              Compartir en WhatsApp
            </button>
            <!-- Reserva si falla el menú de compartir: desde el `.catch` Safari bloquea el
                 `window.open` (ya no hay toque), así que se ofrece un enlace para tocar. -->
            <p v-if="reservaWhatsApp" class="rounded-xl border border-amber-200 oscuro:border-amber-500/30 bg-amber-50 oscuro:bg-amber-500/15 px-3 py-2 text-sm text-amber-900 oscuro:text-amber-300" role="status">
              No se pudo abrir el menú de compartir.
              <a :href="reservaWhatsApp" target="_blank" rel="noopener" class="inline-flex min-h-11 touch-manipulation items-center font-semibold text-marca-tinta underline" @click="reservaWhatsApp = null">Abrir WhatsApp</a>
            </p>

            <div v-if="qr" class="app-qr">
              <img :src="qr" alt="Código QR del enlace de invitación" width="160" height="160" />
              <p class="text-xs text-slate-500 oscuro:text-texto-suave">Para escanear en la reunión</p>
            </div>

            <!-- Cambiar el enlace: si se filtró fuera del grupo -->
            <div v-if="puedeGestionar && codigo" class="text-center">
              <button v-if="!confirmandoRegenerar" type="button" class="app-regenerar" @click="confirmandoRegenerar = true">
                Cambiar el enlace
              </button>
              <div v-else class="app-panel text-left">
                <p class="text-sm text-slate-700 oscuro:text-texto-medio">El enlace actual dejará de funcionar. Los ya vinculados siguen igual.</p>
                <div class="mt-2 flex gap-2">
                  <button type="button" class="btn-modal-secondary flex-1" :disabled="regenerando" @click="confirmandoRegenerar = false">No</button>
                  <button type="button" class="btn-modal-primary flex-1" :disabled="regenerando" @click="regenerarEnlace">
                    {{ regenerando ? 'Cambiando…' : 'Sí, cambiarlo' }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { numeroWhatsApp, esTelefonoValido } from '../../utils/telefono'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ArrowsRightLeftIcon,
  ClipboardDocumentIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkSlashIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import IconoWhatsApp from '../../components/iconos/IconoWhatsApp.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import SolicitudVinculoItem from '../../components/vinculo/SolicitudVinculoItem.vue'
import { supabase } from '../../lib/supabase'
import { useSociosStore } from '../../stores/socios'
import { useNatillerasStore } from '../../stores/natilleras'
import { usePermisosNatillera } from '../../composables/usePermisosNatillera'
import { useNotificationStore } from '../../stores/notifications'
import {
  EVENTO_SOLICITUDES,
  EVENTO_SOLICITUDES_CAMBIO,
  resolverSolicitudVinculo,
  cargarCuentasVinculadas,
  cambiarVinculoSocio
} from '../../composables/useSolicitudesVinculo'

const props = defineProps({ id: { type: String, required: true } })
const id = props.id

const sociosStore = useSociosStore()
const natillerasStore = useNatillerasStore()
const notificationStore = useNotificationStore()

const cargando = ref(true)
// Aprobar, invitar y cambiar vínculos es gestionar «Socios»; con «Ver» la página es de consulta.
// Mientras carga se deja gestionar: la base de datos rechaza lo que no se permita.
const permisosNat = usePermisosNatillera(id)
const puedeGestionar = computed(() => permisosNat.puedeGestionar('socios'))

const nombreNatillera = computed(() =>
  natillerasStore.natilleraActual?.id === id ? natillerasStore.natilleraActual.nombre : ''
)

const inicial = nombre => (nombre || '?').trim().charAt(0).toUpperCase()

// ─── Socios ───
// Solo los activos cuentan: a un socio retirado no hay a quién invitar.
const sociosActivos = computed(() =>
  (sociosStore.sociosNatillera || []).filter(sn => sn.estado === 'activo' && sn.socio?.id)
)
const conApp = computed(() => sociosActivos.value.filter(sn => sn.socio.usuario_id))
const porcentaje = computed(() =>
  sociosActivos.value.length > 0 ? Math.round((conApp.value.length / sociosActivos.value.length) * 100) : 0
)
const sinApp = computed(() => {
  const pidieron = new Set(solicitudes.value.map(s => s.socio_id))
  return sociosActivos.value
    .filter(sn => !sn.socio.usuario_id)
    .map(sn => ({
      id: sn.socio.id,
      nombre: sn.socio.nombre || 'Socio',
      telefono: sn.socio.telefono || '',
      celularValido: esTelefonoValido(sn.socio.telefono),
      pidio: pidieron.has(sn.socio.id)
    }))
    // Primero quienes tienen el celular mal: es lo que el admin debe corregir.
    .sort((a, b) => Number(a.celularValido) - Number(b.celularValido) || a.nombre.localeCompare(b.nombre, 'es'))
})

// ─── Búsqueda ───
// Sin tildes ni mayúsculas: «maria» encuentra a «María». En celulares, solo los dígitos.
const busqueda = ref('')
const normalizar = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const terminoBusqueda = computed(() => normalizar(busqueda.value))
function coincide(...campos) {
  const q = terminoBusqueda.value
  if (!q) return true
  const digitos = q.replace(/\D/g, '')
  return campos.some(c => normalizar(c).includes(q) || (digitos.length >= 3 && String(c || '').replace(/\D/g, '').includes(digitos)))
}
const sinAppFiltrados = computed(() => sinApp.value.filter(s => coincide(s.nombre, s.telefono)))

// Todos los socios de la natillera, para elegir a quién vincular una solicitud o una cuenta.
const sociosParaVincular = computed(() =>
  (sociosStore.sociosNatillera || [])
    .filter(sn => sn.socio?.id)
    .map(sn => ({ id: sn.socio.id, nombre: sn.socio.nombre || 'Socio', vinculado: !!sn.socio.usuario_id }))
)
const sociosLibres = computed(() =>
  sociosParaVincular.value.filter(o => !o.vinculado).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
)

function socioDelStore(socioId) {
  return (sociosStore.sociosNatillera || []).find(x => x.socio?.id === socioId)?.socio
}
function nombreSocio(socioId) {
  return socioDelStore(socioId)?.nombre || 'Socio'
}
function marcarVinculo(socio, usuarioId, email) {
  if (!socio) return
  socio.usuario_id = usuarioId
  socio.vinculado_email = email
  socio.vinculado_en = usuarioId ? new Date().toISOString() : null
}

// ─── Enlace de invitación (lo crea la base de datos la primera vez que se pide) ───
const codigo = ref('')
const cargandoCodigo = ref(false)
const errorCodigo = ref('')
const qr = ref('')
const enlaceCopiado = ref(false)
const confirmandoRegenerar = ref(false)
const regenerando = ref(false)
let temporizadorCopiado = null

const urlInvitacion = computed(() => (codigo.value ? `${window.location.origin}/unirme/${codigo.value}` : ''))

async function generarQr() {
  qr.value = ''
  if (!urlInvitacion.value) return
  try {
    // Se carga solo aquí: nadie más en la app necesita la librería.
    const { default: QRCode } = await import('qrcode')
    qr.value = await QRCode.toDataURL(urlInvitacion.value, { margin: 1, width: 320, color: { dark: '#1B5E37', light: '#ffffff' } })
  } catch (e) {
    console.error('No se pudo generar el QR de la invitación:', e)
  }
}

async function cargarCodigo(regenerar = false) {
  errorCodigo.value = ''
  const { data, error } = await supabase.rpc('codigo_invitacion_natillera', { p_natillera_id: id, p_regenerar: regenerar })
  if (error) throw error
  codigo.value = data || ''
  await generarQr()
}

async function prepararEnlace() {
  cargandoCodigo.value = true
  try {
    await cargarCodigo()
  } catch (e) {
    console.error('Error obteniendo el enlace de invitación:', e)
    errorCodigo.value = 'No se pudo preparar el enlace. Revisa tu conexión.'
  } finally {
    cargandoCodigo.value = false
  }
}

async function regenerarEnlace() {
  regenerando.value = true
  try {
    await cargarCodigo(true)
    confirmandoRegenerar.value = false
    enlaceCopiado.value = false
    notificationStore.success('El enlace anterior ya no funciona', 'Enlace cambiado')
  } catch (e) {
    console.error('Error cambiando el enlace de invitación:', e)
    notificationStore.error('No se pudo cambiar el enlace', 'Error')
  } finally {
    regenerando.value = false
  }
}

async function copiarEnlace() {
  if (!urlInvitacion.value) return
  try {
    await navigator.clipboard.writeText(urlInvitacion.value)
    enlaceCopiado.value = true
    clearTimeout(temporizadorCopiado)
    temporizadorCopiado = setTimeout(() => { enlaceCopiado.value = false }, 2500)
  } catch {
    notificationStore.info(urlInvitacion.value, 'Copia el enlace')
  }
}

function textoInvitacion(nombreSocio = '') {
  const natillera = nombreNatillera.value ? `la natillera ${nombreNatillera.value}` : 'nuestra natillera'
  return [
    nombreSocio ? `Hola ${nombreSocio.split(' ')[0]} 👋` : `*${nombreNatillera.value ? `Natillera ${nombreNatillera.value}` : 'Nuestra natillera'} ahora está en Natillerapp* 👋`,
    '',
    `Ya puedes ver tu estado de cuenta de ${natillera} en la app:`,
    '1. Entra a este enlace',
    '2. Inicia sesión (o crea tu cuenta, es gratis)',
    '3. Escribe tu número de WhatsApp',
    '',
    urlInvitacion.value
  ].join('\n')
}

/*
 * Al grupo: el menú del sistema deja elegir el grupo de WhatsApp. Sin menú (escritorio),
 * wa.me sin número abre WhatsApp para escoger el chat. Nada asíncrono antes de
 * `navigator.share`: Safari exige que vaya pegado al toque.
 */
/** Enlace a WhatsApp que se ofrece si el menú de compartir falla. */
const reservaWhatsApp = ref(null)

function compartirAlGrupo() {
  if (!urlInvitacion.value) return
  const texto = textoInvitacion()
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
  reservaWhatsApp.value = null
  if (navigator.share) {
    navigator.share({ text: texto }).catch(err => {
      if (err?.name === 'AbortError') return
      reservaWhatsApp.value = url
    })
    return
  }
  // Sin menú del sistema (escritorio) el `window.open` sí va dentro del toque.
  window.open(url, '_blank')
}

// A uno: un <a> y no window.open, para que Safari no lo trate como ventana emergente.
function enlaceWhatsAppSocio(s) {
  return `https://wa.me/${numeroWhatsApp(s.telefono)}?text=${encodeURIComponent(textoInvitacion(s.nombre))}`
}

// ─── Solicitudes pendientes ───
const solicitudes = ref([])
const resolviendo = ref(false)

async function cargarSolicitudes() {
  const { data, error } = await supabase
    .from('solicitudes_vinculo')
    .select('id, socio_id, usuario_id, cuenta_email, cuenta_nombre, cuenta_telefono, creado_en')
    .eq('natillera_id', id)
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: true })
  if (error) {
    console.error('Error cargando solicitudes de vínculo:', error)
    return
  }
  solicitudes.value = data || []
}

async function resolver(sol, aprobar, { silencioso = false, socioId = null } = {}) {
  resolviendo.value = true
  try {
    // Por el composable: avisa al aviso global para que quite la solicitud también.
    const r = await resolverSolicitudVinculo(sol, aprobar, socioId)
    if (!r.ok) {
      if (!silencioso) notificationStore.warning('Ese socio ya está vinculado a otra cuenta', 'No se aprobó')
      return false
    }
    if (aprobar) {
      marcarVinculo(socioDelStore(r.socioId), sol.usuario_id, sol.cuenta_email)
      // Las demás solicitudes del socio vinculado las rechaza la base de datos.
      solicitudes.value = solicitudes.value.filter(x => x.id !== sol.id && x.socio_id !== r.socioId)
      cargarCuentas()
    } else {
      solicitudes.value = solicitudes.value.filter(x => x.id !== sol.id)
    }
    if (!silencioso) {
      notificationStore.success(
        aprobar ? `${nombreSocio(r.socioId)} ya puede usar la app` : 'Solicitud rechazada',
        aprobar ? 'Aprobado' : 'Rechazada'
      )
    }
    return true
  } catch (e) {
    console.error('Error resolviendo la solicitud:', e)
    if (!silencioso) notificationStore.error('No se pudo resolver la solicitud', 'Error')
    return false
  } finally {
    resolviendo.value = false
  }
}

async function aprobarTodas() {
  // Una por socio: si dos cuentas pidieron el mismo, se aprueba la más antigua.
  const vistos = new Set()
  const aAprobar = solicitudes.value.filter(sol => {
    if (vistos.has(sol.socio_id)) return false
    vistos.add(sol.socio_id)
    return true
  })
  let aprobadas = 0
  for (const sol of aAprobar) {
    if (await resolver(sol, true, { silencioso: true })) aprobadas++
  }
  notificationStore.success(`${aprobadas} ${aprobadas === 1 ? 'socio aprobado' : 'socios aprobados'}`, 'Listo')
}

const solicitudesFiltradas = computed(() =>
  solicitudes.value.filter(sol => coincide(nombreSocio(sol.socio_id), sol.cuenta_nombre, sol.cuenta_email, sol.cuenta_telefono))
)

// ─── Cuentas vinculadas ───
const cuentas = ref([])
const cuentasFiltradas = computed(() =>
  cuentas.value.filter(c => coincide(c.socio_nombre, c.cuenta_nombre, c.cuenta_email, c.cuenta_telefono, c.socio_telefono))
)
const cargandoCuentas = ref(false)
const editando = ref(null) // { socio_id, modo: 'cambiar' | 'desvincular', destino }
const guardando = ref(false)

async function cargarCuentas() {
  cargandoCuentas.value = true
  try {
    cuentas.value = await cargarCuentasVinculadas(id)
  } catch (e) {
    console.error('Error cargando cuentas vinculadas:', e)
  } finally {
    cargandoCuentas.value = false
  }
}

async function cambiarVinculo(cuenta) {
  const destino = editando.value?.destino
  if (!destino) return
  guardando.value = true
  try {
    const r = await cambiarVinculoSocio(cuenta.socio_id, destino)
    if (!r.ok) {
      notificationStore.warning(r.motivo === 'vinculado_a_otro' ? 'Ese socio ya tiene otra cuenta vinculada' : 'No se pudo cambiar el vínculo', 'Sin cambios')
      return
    }
    marcarVinculo(socioDelStore(destino), cuenta.usuario_id, cuenta.cuenta_email)
    marcarVinculo(socioDelStore(cuenta.socio_id), null, null)
    editando.value = null
    notificationStore.success(`La cuenta ahora entra como ${nombreSocio(destino)}`, 'Vínculo cambiado')
    await cargarCuentas()
  } catch (e) {
    console.error('Error cambiando el vínculo:', e)
    notificationStore.error('No se pudo cambiar el vínculo', 'Error')
  } finally {
    guardando.value = false
  }
}

async function desvincular(cuenta) {
  guardando.value = true
  try {
    const { error } = await supabase.rpc('desvincular_socio', { p_socio_id: cuenta.socio_id })
    if (error) throw error
    marcarVinculo(socioDelStore(cuenta.socio_id), null, null)
    cuentas.value = cuentas.value.filter(c => c.socio_id !== cuenta.socio_id)
    editando.value = null
    notificationStore.success(`${cuenta.socio_nombre || 'El socio'} ya no está vinculado`, 'Desvinculado')
  } catch (e) {
    console.error('Error desvinculando:', e)
    notificationStore.error('No se pudo desvincular', 'Error')
  } finally {
    guardando.value = false
  }
}

/*
 * Si se aprueba o rechaza desde el aviso global (layout), reflejarlo aquí sin recargar.
 */
function alResolverFuera(evento) {
  const { solicitud, aprobada } = evento.detail || {}
  if (!solicitud) return
  solicitudes.value = solicitudes.value.filter(s => (aprobada ? s.socio_id !== solicitud.socio_id : s.id !== solicitud.id))
  if (!aprobada) return
  marcarVinculo(socioDelStore(solicitud.socio_id), solicitud.usuario_id, solicitud.cuenta_email)
  cargarCuentas()
}

onMounted(async () => {
  window.addEventListener(EVENTO_SOLICITUDES, alResolverFuera)
  // Llegó una solicitud nueva (tiempo real, desde el aviso global): refrescar la lista.
  window.addEventListener(EVENTO_SOLICITUDES_CAMBIO, cargarSolicitudes)
  const necesitaNatillera = natillerasStore.natilleraActual?.id !== id
  await Promise.all([
    necesitaNatillera
      ? supabase.from('natilleras').select('*').eq('id', id).maybeSingle().then(({ data }) => {
          if (data) natillerasStore.natilleraActual = data
        })
      : Promise.resolve(),
    sociosStore.fetchSociosNatillera(id),
    cargarSolicitudes()
  ])
  cargando.value = false

  cargarCuentas()
  prepararEnlace()
})

onUnmounted(() => {
  window.removeEventListener(EVENTO_SOLICITUDES, alResolverFuera)
  window.removeEventListener(EVENTO_SOLICITUDES_CAMBIO, cargarSolicitudes)
  clearTimeout(temporizadorCopiado)
})
</script>

<style scoped>
/* ─── Avance ─── */
.app-avance {
  padding: 1rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
.app-avance__barra {
  margin-top: 0.625rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgba(27, 94, 55, 0.12);
  overflow: hidden;
}
.app-avance__barra > span {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: var(--brand-primary);
  transition: width 400ms ease;
}
.app-avance__cifras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 1rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: #475569;
}
.app-avance__cifras li { display: inline-flex; align-items: center; gap: 0.375rem; }
.app-avance__cifras strong { color: #0f172a; }
.app-punto { width: 0.625rem; height: 0.625rem; border-radius: 9999px; }
.app-punto--con { background: var(--brand-primary); }
.app-punto--aprobar { background: #d97706; }
.app-punto--sin { background: #cbd5e1; }

.app-buscar { width: 100%; }

/* ─── Cuerpo: una columna en móvil (con orden propio), dos desde 1024 px ─── */
.app-cuerpo { display: flex; flex-direction: column; gap: 1.25rem; }
.app-cuerpo__listas { display: contents; }
.app-seccion--aprobar { order: 1; }
.app-invitar { order: 2; }
.app-seccion--con { order: 3; }
.app-seccion--sin { order: 4; }
@media (min-width: 1024px) {
  .app-cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 21rem;
    align-items: start;
    gap: 1.5rem;
  }
  .app-cuerpo__listas { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
  /* Sin el scroll interno del layout en escritorio, `sticky` la deja a la vista al bajar */
  .app-invitar { position: sticky; top: 1rem; }
}

/* ─── Secciones ─── */
.app-seccion {
  padding: 1rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
@media (min-width: 640px) {
  .app-seccion { padding: 1.25rem; }
}
.app-seccion--aprobar { border-color: rgba(180, 83, 9, 0.25); background: #fffbeb; }
.app-seccion__cabeza { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.app-seccion__titulo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: #0f172a;
}
.app-seccion__nota { margin-top: 0.25rem; font-size: 0.8125rem; color: #92400e; }
.app-conteo {
  min-width: 1.5rem;
  padding: 0.0625rem 0.5rem;
  border-radius: 9999px;
  background: #f1f5f9;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  color: #475569;
}
.app-conteo--aprobar { background: #fef3c7; color: #92400e; }
.app-vacio { margin-top: 0.75rem; font-size: 0.875rem; color: #64748b; }

/* ─── Filas ─── */
.app-lista { margin: 0.5rem 0 0; padding: 0; list-style: none; }
.app-fila { padding: 0.625rem 0; list-style: none; }
.app-fila + .app-fila { border-top: 1px solid var(--surface-divider); }
.app-fila__principal { display: flex; align-items: center; gap: 0.75rem; }
.app-avatar {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--brand-primary);
  font-family: var(--font-display);
  font-weight: 800;
  color: #fff;
}
.app-avatar--sin { background: #e2e8f0; color: #475569; }
.app-fila__nombre { font-size: 0.9375rem; font-weight: 700; line-height: 1.3; color: #0f172a; }
.app-fila__dato { overflow: hidden; font-size: 0.8125rem; text-overflow: ellipsis; white-space: nowrap; color: #64748b; }
.app-fila__dato--aviso { display: flex; align-items: center; gap: 0.25rem; white-space: normal; color: #b45309; }
.app-etiqueta {
  margin-left: 0.25rem;
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  background: #f1f5f9;
  font-size: 0.625rem;
  font-weight: 700;
  color: #64748b;
  vertical-align: middle;
}
.app-etiqueta--aprobar { background: #fef3c7; color: #92400e; }
.app-fila__acciones { display: flex; flex-shrink: 0; gap: 0.25rem; }
.app-icono {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: var(--brand-primary);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.app-icono:hover { background: var(--brand-primary-soft); }
.app-icono--peligro { color: #b91c1c; }
.app-icono--peligro:hover { background: #fef2f2; }

/* ─── Paneles en línea (cambiar / desvincular / cambiar enlace) ─── */
.app-panel { margin-top: 0.625rem; padding: 0.75rem; border-radius: 0.875rem; background: #f4f8f5; }
.app-panel--peligro { background: #fef2f2; }
.app-panel__etiqueta {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
/* 16 px: por debajo, iOS hace zoom al enfocar. Sin appearance:none: el <select> nativo. */
.app-select {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(27, 94, 55, 0.3);
  background: #fff;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  touch-action: manipulation;
}
.app-boton-peligro {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #b91c1c;
  font-weight: 700;
  color: #fff;
  touch-action: manipulation;
}
.app-boton-peligro:disabled { opacity: 0.5; }

/* ─── Invitar ─── */
.app-invitar { display: flex; flex-direction: column; gap: 0.875rem; }
.app-enlace {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0.25rem 0.25rem 0.25rem 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-divider-strong);
  background: #f8fafc;
  font-size: 0.875rem;
}
.app-enlace__copiar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  background: var(--brand-primary);
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.app-qr { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; text-align: center; }
.app-qr img {
  width: 10rem;
  height: 10rem;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: #fff; /* tema-fijo: margen blanco del QR, lo necesita el escáner */
}
.app-regenerar {
  min-height: 2.75rem;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: underline;
  text-underline-offset: 2px;
  touch-action: manipulation;
}

@media (prefers-reduced-motion: reduce) {
  .app-avance__barra > span { transition: none; }
}

/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
:where([data-tema=oscuro]) .app-avance__barra:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
}
:where([data-tema=oscuro]) .app-avance__cifras:not(:where([data-tema=claro] *)) {
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .app-avance__cifras strong:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .app-punto--sin:not(:where([data-tema=claro] *)) {
  background: var(--borde);
}
:where([data-tema=oscuro]) .app-seccion--aprobar:not(:where([data-tema=claro] *)) {
  border-color: var(--alerta-borde);
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .app-seccion__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .app-seccion__nota:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .app-conteo:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .app-conteo--aprobar:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .app-vacio:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .app-avatar--sin:not(:where([data-tema=claro] *)) {
  background: var(--superficie-hundida);
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .app-fila__nombre:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .app-fila__dato:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .app-fila__dato--aviso:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .app-etiqueta:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .app-etiqueta--aprobar:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .app-icono:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .app-icono--peligro:not(:where([data-tema=claro] *)) {
  color: var(--peligro);
}
:where([data-tema=oscuro]) .app-icono--peligro:hover:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
}
:where([data-tema=oscuro]) .app-panel:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
}
:where([data-tema=oscuro]) .app-panel--peligro:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
}
:where([data-tema=oscuro]) .app-panel__etiqueta:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .app-select:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .app-enlace:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
}
:where([data-tema=oscuro]) .app-regenerar:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
</style>
