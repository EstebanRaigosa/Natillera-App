<template>
  <!--
    Administradores de la natillera: el dueño, su equipo (co-administradores, colaboradores y
    visores), las invitaciones pendientes y quienes ya no tienen acceso. Antes era una modal
    (ColaboradoresManager) montada oculta en el detalle; ahora es una página con una sección
    por tarea, edición y confirmaciones en la misma fila y el formulario de invitar al lado.

    Quién gestiona (mismo criterio que tenía la modal): el dueño y quien tenga el permiso
    `configurar`, salvo el rol colaborador, que solo puede salirse. La base de datos (RLS)
    es la que manda; esto solo decide qué botones se ven.

    La invitación se hace a un correo con cuenta en Natillerapp: le aparece al entrar. Además,
    ahora el enlace `/invitacion/<token>` se puede copiar o mandar por WhatsApp.
  -->
  <div class="mx-auto max-w-6xl space-y-5 pb-6 sm:space-y-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <ShieldCheckIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Administradores</h1>
            <p class="ds-page-header__sub truncate">{{ nombreNatillera }}</p>
          </div>
        </div>
      </div>
    </header>

    <CargaCaja v-if="cargando" texto="Cargando el equipo" />

    <template v-else>
      <div v-if="!puedeGestionar" class="ds-callout">
        <InformationCircleIcon class="ds-callout__icon h-5 w-5" />
        <p>
          <span class="ds-callout__title">Solo lectura.</span>
          Tu permiso en Administradores es de solo ver.
        </p>
      </div>

      <!-- Resumen -->
      <section class="adm-resumen" aria-label="Resumen">
        <p class="font-display text-2xl font-extrabold tabular-nums text-slate-900">
          {{ activos.length + 1 }} <span class="text-base font-semibold text-slate-400">{{ activos.length + 1 === 1 ? 'persona administra' : 'personas administran' }}</span>
        </p>
        <ul class="adm-resumen__cifras">
          <li><span class="adm-punto adm-punto--dueno" aria-hidden="true" />1 dueño</li>
          <li v-for="r in conteoRoles" :key="r.rol"><span class="adm-punto" :class="`adm-punto--${r.rol}`" aria-hidden="true" /><strong class="tabular-nums">{{ r.cantidad }}</strong> {{ r.texto }}</li>
          <li v-if="pendientes.length > 0"><span class="adm-punto adm-punto--pendiente" aria-hidden="true" /><strong class="tabular-nums">{{ pendientes.length }}</strong> por aceptar</li>
        </ul>
      </section>

      <!--
        Móvil: una columna (invitar, equipo, pendientes, sin acceso). Desde 1024 px, listas a la
        izquierda e «Invitar» fija a la derecha: el contenedor de listas pasa de `display: contents`
        a columna propia.
      -->
      <div class="adm-cuerpo">
        <div class="adm-cuerpo__listas">
          <!-- Equipo -->
          <section class="adm-seccion adm-seccion--equipo">
            <div class="adm-seccion__cabeza">
              <h2 class="adm-seccion__titulo">Equipo <span class="adm-conteo">{{ activos.length + 1 }}</span></h2>
            </div>
            <ul class="adm-lista">
              <!-- El dueño: no se edita ni se revoca desde aquí (se reasigna en Configuración) -->
              <li class="adm-fila">
                <div class="adm-fila__principal">
                  <span class="adm-avatar adm-avatar--dueno" aria-hidden="true">{{ inicial(admin.nombre || admin.email) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="adm-fila__nombre">{{ admin.nombre || admin.email || 'Dueño' }} <span v-if="soyDueno" class="adm-yo">Tú</span></p>
                    <p class="adm-fila__dato">{{ admin.email }}</p>
                  </div>
                  <span class="ds-badge ds-badge--brand shrink-0">Dueño</span>
                </div>
              </li>

              <li v-for="c in activos" :key="c.id" class="adm-fila">
                <div class="adm-fila__principal">
                  <span class="adm-avatar" :class="`adm-avatar--${c.rol}`" aria-hidden="true">{{ inicial(c.nombre_usuario || c.email_usuario) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="adm-fila__nombre">
                      {{ c.nombre_usuario || c.email_usuario }}
                      <span v-if="esYo(c)" class="adm-yo">Tú</span>
                    </p>
                    <p class="adm-fila__dato">{{ c.email_usuario }}</p>
                    <p class="adm-fila__permisos">{{ resumenPermisos(c) }}</p>
                  </div>
                  <span class="ds-badge shrink-0" :class="ROLES[c.rol]?.badge">{{ ROLES[c.rol]?.corto || c.rol }}</span>
                  <div v-if="accion?.id !== c.id" class="adm-fila__acciones">
                    <!-- El dueño gestiona a todos; los demás no tocan co-administradores ni a sí mismos (igual que la base de datos) -->
                    <template v-if="puedeGestionar && (soyDueno || (c.rol !== 'co_administrador' && !esYo(c)))">
                      <button type="button" class="adm-icono" :aria-label="`Cambiar rol y permisos de ${c.nombre_usuario || c.email_usuario}`" title="Cambiar rol y permisos" @click="abrirEdicion(c)">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button type="button" class="adm-icono adm-icono--peligro" :aria-label="`Quitar el acceso a ${c.nombre_usuario || c.email_usuario}`" title="Quitar acceso" @click="accion = { id: c.id, modo: 'revocar' }">
                        <NoSymbolIcon class="h-5 w-5" />
                      </button>
                    </template>
                    <button v-else-if="esYo(c)" type="button" class="adm-salir" @click="accion = { id: c.id, modo: 'salir' }">Salir</button>
                  </div>
                </div>

                <!-- Cambiar rol y permisos -->
                <div v-if="accion?.id === c.id && accion.modo === 'editar'" class="adm-panel">
                  <EditorRol v-model:rol="edicion.rol" v-model:niveles="edicion.niveles" :nombre-grupo="`rol-${c.id}`" :permitir-co-admin="soyDueno" />
                  <div class="mt-3 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="accion = null">Cancelar</button>
                    <button type="button" class="btn-modal-primary flex-1" :disabled="ocupado" @click="guardarEdicion(c)">{{ ocupado ? 'Guardando…' : 'Guardar' }}</button>
                  </div>
                </div>

                <!-- Quitar acceso -->
                <div v-else-if="accion?.id === c.id && accion.modo === 'revocar'" class="adm-panel adm-panel--peligro">
                  <p class="text-sm text-red-800">¿Quitarle el acceso? Podrás invitarlo de nuevo.</p>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="accion = null">Cancelar</button>
                    <button type="button" class="adm-boton-peligro flex-1" :disabled="ocupado" @click="revocar(c)">{{ ocupado ? 'Quitando…' : 'Quitar acceso' }}</button>
                  </div>
                </div>

                <!-- Salirme (colaborador sobre su propia fila) -->
                <div v-else-if="accion?.id === c.id && accion.modo === 'salir'" class="adm-panel adm-panel--peligro">
                  <p class="text-sm text-red-800">¿Salir de esta natillera? Dejarás de verla.</p>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="accion = null">Cancelar</button>
                    <button type="button" class="adm-boton-peligro flex-1" :disabled="ocupado" @click="salirme(c)">{{ ocupado ? 'Saliendo…' : 'Salir' }}</button>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <!-- Invitaciones pendientes -->
          <section v-if="pendientes.length > 0" class="adm-seccion adm-seccion--pendientes">
            <div class="adm-seccion__cabeza">
              <h2 class="adm-seccion__titulo">Por aceptar <span class="adm-conteo adm-conteo--pendiente">{{ pendientes.length }}</span></h2>
            </div>
            <ul class="adm-lista">
              <li v-for="c in pendientes" :key="c.id" class="adm-fila">
                <div class="adm-fila__principal">
                  <span class="adm-avatar adm-avatar--pendiente" aria-hidden="true"><ClockIcon class="h-5 w-5" /></span>
                  <div class="min-w-0 flex-1">
                    <p class="adm-fila__nombre">{{ c.email_usuario }}</p>
                    <p class="adm-fila__dato">{{ ROLES[c.rol]?.nombre || c.rol }} · invitado el {{ fecha(c.fecha_invitacion) }}</p>
                  </div>
                  <div v-if="puedeGestionar && accion?.id !== c.id" class="adm-fila__acciones">
                    <button type="button" class="adm-icono" :aria-label="`Copiar el enlace de invitación de ${c.email_usuario}`" title="Copiar enlace" @click="copiarEnlace(c)">
                      <CheckIcon v-if="copiado === c.id" class="h-5 w-5" />
                      <ClipboardDocumentIcon v-else class="h-5 w-5" />
                    </button>
                    <button type="button" class="adm-icono adm-icono--whatsapp" :aria-label="`Avisar a ${c.email_usuario} por WhatsApp`" title="Avisar por WhatsApp" @click="avisarWhatsApp(c)">
                      <ChatBubbleLeftIcon class="h-5 w-5" />
                    </button>
                    <button type="button" class="adm-icono adm-icono--peligro" :aria-label="`Cancelar la invitación de ${c.email_usuario}`" title="Cancelar invitación" @click="accion = { id: c.id, modo: 'cancelar' }">
                      <XMarkIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div v-if="accion?.id === c.id && accion.modo === 'cancelar'" class="adm-panel adm-panel--peligro">
                  <p class="text-sm text-red-800">¿Cancelar esta invitación? El enlace dejará de servir.</p>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="accion = null">No</button>
                    <button type="button" class="adm-boton-peligro flex-1" :disabled="ocupado" @click="eliminar(c, 'Invitación cancelada')">{{ ocupado ? 'Cancelando…' : 'Sí, cancelar' }}</button>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <!-- Sin acceso: revocados y rechazados, plegado para no estorbar -->
          <section v-if="sinAcceso.length > 0" class="adm-seccion adm-seccion--sin">
            <button type="button" class="adm-plegable" :aria-expanded="verSinAcceso" @click="verSinAcceso = !verSinAcceso">
              <span class="adm-seccion__titulo">Sin acceso <span class="adm-conteo">{{ sinAcceso.length }}</span></span>
              <ChevronDownIcon class="h-5 w-5 text-slate-400 transition-transform" :class="{ 'rotate-180': verSinAcceso }" aria-hidden="true" />
            </button>
            <ul v-if="verSinAcceso" class="adm-lista">
              <li v-for="c in sinAcceso" :key="c.id" class="adm-fila">
                <div class="adm-fila__principal">
                  <span class="adm-avatar adm-avatar--sin" aria-hidden="true">{{ inicial(c.nombre_usuario || c.email_usuario) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="adm-fila__nombre">{{ c.nombre_usuario || c.email_usuario }}</p>
                    <p class="adm-fila__dato">{{ c.estado === 'rechazada' ? 'Rechazó la invitación' : 'Se le quitó el acceso' }}</p>
                  </div>
                  <div v-if="puedeGestionar && accion?.id !== c.id" class="adm-fila__acciones">
                    <button
                      v-if="c.estado === 'revocada'"
                      type="button"
                      class="adm-icono"
                      :aria-label="`Invitar de nuevo a ${c.email_usuario}`"
                      title="Invitar de nuevo"
                      :disabled="ocupado"
                      @click="reinvitar(c)"
                    >
                      <ArrowPathIcon class="h-5 w-5" />
                    </button>
                    <button type="button" class="adm-icono adm-icono--peligro" :aria-label="`Borrar a ${c.email_usuario} de la lista`" title="Borrar de la lista" @click="accion = { id: c.id, modo: 'borrar' }">
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div v-if="accion?.id === c.id && accion.modo === 'borrar'" class="adm-panel adm-panel--peligro">
                  <p class="text-sm text-red-800">¿Borrarlo de la lista? No se puede deshacer.</p>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn-modal-secondary flex-1" :disabled="ocupado" @click="accion = null">No</button>
                    <button type="button" class="adm-boton-peligro flex-1" :disabled="ocupado" @click="eliminar(c, 'Borrado de la lista')">{{ ocupado ? 'Borrando…' : 'Sí, borrar' }}</button>
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <!-- Invitar -->
        <aside v-if="puedeGestionar" class="adm-seccion adm-invitar">
          <!-- Recién invitado: el enlace para avisarle -->
          <template v-if="recienInvitado">
            <div class="flex items-center gap-3">
              <span class="adm-avatar adm-avatar--listo" aria-hidden="true"><CheckIcon class="h-5 w-5" /></span>
              <div class="min-w-0">
                <h2 class="adm-seccion__titulo">Invitación creada</h2>
                <p class="adm-fila__dato">{{ recienInvitado.email_usuario }} la verá al entrar a la app.</p>
              </div>
            </div>
            <button type="button" class="ds-btn ds-btn--block adm-btn-whatsapp" @click="avisarWhatsApp(recienInvitado)">
              <ChatBubbleLeftIcon class="h-4 w-4" aria-hidden="true" />
              Avisarle por WhatsApp
            </button>
            <button type="button" class="ds-btn ds-btn--secondary ds-btn--block" @click="copiarEnlace(recienInvitado)">
              <CheckIcon v-if="copiado === recienInvitado.id" class="h-4 w-4" aria-hidden="true" />
              <ClipboardDocumentIcon v-else class="h-4 w-4" aria-hidden="true" />
              {{ copiado === recienInvitado.id ? 'Enlace copiado' : 'Copiar enlace' }}
            </button>
            <button type="button" class="adm-texto-boton" @click="nuevaInvitacion">Invitar a otra persona</button>
          </template>

          <!-- Móvil: plegado tras un botón para no empujar el equipo hacia abajo -->
          <template v-else>
            <button type="button" class="adm-plegable adm-plegable--invitar" :aria-expanded="formularioAbierto" @click="formularioAbierto = !formularioAbierto">
              <span class="adm-seccion__titulo"><UserPlusIcon class="h-5 w-5 text-[color:var(--brand-primary)]" aria-hidden="true" /> Invitar a alguien</span>
              <ChevronDownIcon class="h-5 w-5 text-slate-400 transition-transform lg:hidden" :class="{ 'rotate-180': formularioAbierto }" aria-hidden="true" />
            </button>
            <form v-show="formularioAbierto || esEscritorio" class="space-y-4" @submit.prevent="invitar">
              <div>
                <label for="adm-correo" class="ds-label">Correo de su cuenta en Natillerapp</label>
                <input
                  id="adm-correo"
                  v-model="invitacion.email"
                  type="email"
                  inputmode="email"
                  autocomplete="off"
                  autocapitalize="off"
                  placeholder="nombre@correo.com"
                  class="ds-input"
                  :class="{ 'ds-input--error': errorCorreo }"
                  @input="errorCorreo = ''"
                />
                <p v-if="errorCorreo" class="mt-1.5 text-sm text-red-700" role="alert">{{ errorCorreo }}</p>
              </div>
              <EditorRol v-model:rol="invitacion.rol" v-model:niveles="invitacion.niveles" nombre-grupo="rol-nuevo" :permitir-co-admin="soyDueno" />
              <button type="submit" class="btn-modal-primary w-full" :disabled="ocupado || !invitacion.email.trim()">
                {{ ocupado ? 'Invitando…' : 'Invitar' }}
              </button>
            </form>
          </template>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  InformationCircleIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import EditorRol from '../../components/colaboradores/EditorRol.vue'
import { supabase } from '../../lib/supabase'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { usePermisosNatillera } from '../../composables/usePermisosNatillera'
import { MODULOS, nivelesDePermisos, permisosParaGuardar } from '../../permisos/modulos'
import { useNotificationStore } from '../../stores/notifications'
import { ROLES } from '../../components/colaboradores/roles'

const props = defineProps({ id: { type: String, required: true } })
const id = props.id

const router = useRouter()
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()
const notificationStore = useNotificationStore()

const cargando = ref(true)
const miUsuario = ref(null)
const soyDueno = ref(false)
// Invitar y cambiar permisos es gestionar «Administradores»; con «Ver» la página es de consulta.
const permisosNat = usePermisosNatillera(id)
const puedeGestionar = computed(() => permisosNat.cargado.value && permisosNat.puedeGestionar('administradores'))
const admin = ref({ nombre: '', email: '' })
const accion = ref(null) // { id, modo: 'editar' | 'revocar' | 'salir' | 'cancelar' | 'borrar' }
const ocupado = ref(false)
const verSinAcceso = ref(false)
const copiado = ref(null)
let temporizadorCopiado = null

const nombreNatillera = computed(() =>
  natillerasStore.natilleraActual?.id === id ? natillerasStore.natilleraActual.nombre : ''
)

// El formulario se abre solo en escritorio (hay espacio a la derecha); en móvil va plegado.
const esEscritorio = ref(false)
let consulta = null
const alCambiarAncho = () => { esEscritorio.value = !!consulta?.matches }

// ─── Listas ───
const colaboradores = computed(() => colaboradoresStore.colaboradores || [])
const activos = computed(() => colaboradores.value.filter(c => c.estado === 'aceptada'))
const pendientes = computed(() => colaboradores.value.filter(c => c.estado === 'pendiente'))
const sinAcceso = computed(() => colaboradores.value.filter(c => c.estado === 'revocada' || c.estado === 'rechazada'))
const conteoRoles = computed(() =>
  Object.entries(ROLES)
    .map(([rol, r]) => {
      const cantidad = activos.value.filter(c => c.rol === rol).length
      return { rol, cantidad, texto: cantidad === 1 ? r.uno.toLowerCase() : r.varios.toLowerCase() }
    })
    .filter(r => r.cantidad > 0)
)

const inicial = texto => (texto || '?').trim().charAt(0).toUpperCase()
const fecha = f => (f ? new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '')
const esYo = c => !!miUsuario.value && (c.usuario_id === miUsuario.value.id ||
  (!!c.email_usuario && c.email_usuario.toLowerCase() === (miUsuario.value.email || '').toLowerCase()))

// Una línea con lo que puede hacer: qué gestiona y qué solo ve.
function resumenPermisos(c) {
  if (c.rol === 'co_administrador') return 'Todo, menos cerrar la natillera'
  if (c.rol === 'visor') return 'Solo ver'
  const niveles = nivelesDePermisos(c.rol, c.permisos)
  const con = nivel => MODULOS.filter(m => niveles[m.clave] === nivel).map(m => m.nombre).join(', ')
  const partes = []
  if (con('gestionar')) partes.push(`Gestiona: ${con('gestionar')}`)
  if (con('ver')) partes.push(`Ve: ${con('ver')}`)
  return partes.join(' · ') || 'Sin acceso a ninguna opción'
}

// ─── Editar rol y permisos ───
const edicion = ref({ rol: 'visor', niveles: {} })

function abrirEdicion(c) {
  edicion.value = { rol: c.rol, niveles: nivelesDePermisos(c.rol, c.permisos) }
  accion.value = { id: c.id, modo: 'editar' }
}

async function guardarEdicion(c) {
  ocupado.value = true
  try {
    const r = await colaboradoresStore.actualizarColaborador(c.id, {
      rol: edicion.value.rol,
      permisos: permisosParaGuardar(edicion.value.rol, edicion.value.niveles)
    })
    if (!r.success) throw new Error(r.error)
    accion.value = null
    notificationStore.success('Cambios guardados', 'Listo')
    await cargarEquipo()
  } catch (e) {
    notificationStore.error(e.message || 'No se pudieron guardar los cambios', 'Error')
  } finally {
    ocupado.value = false
  }
}

async function revocar(c) {
  ocupado.value = true
  try {
    const r = await colaboradoresStore.revocarColaborador(c.id)
    if (!r.success) throw new Error(r.error)
    accion.value = null
    notificationStore.success('Ya no tiene acceso', 'Acceso quitado')
    await cargarEquipo()
  } catch (e) {
    notificationStore.error(e.message || 'No se pudo quitar el acceso', 'Error')
  } finally {
    ocupado.value = false
  }
}

async function eliminar(c, mensaje) {
  ocupado.value = true
  try {
    const r = await colaboradoresStore.eliminarColaborador(c.id)
    if (!r.success) throw new Error(r.error)
    accion.value = null
    notificationStore.success(mensaje, 'Listo')
    await cargarEquipo()
  } catch (e) {
    notificationStore.error(e.message || 'No se pudo completar', 'Error')
  } finally {
    ocupado.value = false
  }
}

async function salirme(c) {
  ocupado.value = true
  try {
    const r = await colaboradoresStore.eliminarColaborador(c.id)
    if (!r.success) throw new Error(r.error)
    notificationStore.success('Saliste de la natillera', 'Listo')
    router.push('/dashboard')
  } catch (e) {
    notificationStore.error(e.message || 'No se pudo salir', 'Error')
  } finally {
    ocupado.value = false
  }
}

async function reinvitar(c) {
  ocupado.value = true
  try {
    const r = await colaboradoresStore.reenviarInvitacionColaborador(c.id)
    if (!r.success) throw new Error(r.error)
    notificationStore.success('Invitación enviada de nuevo', 'Listo')
    await cargarEquipo()
  } catch (e) {
    notificationStore.error(e.message || 'No se pudo invitar de nuevo', 'Error')
  } finally {
    ocupado.value = false
  }
}

// ─── Invitar ───
const formularioAbierto = ref(false)
const invitacion = ref({ email: '', rol: 'visor', niveles: nivelesDePermisos('visor', {}) })
const errorCorreo = ref('')
const recienInvitado = ref(null)
// Errores que son del correo: se muestran bajo el campo, no como aviso flotante.
const ERRORES_DE_CORREO = ['no está registrado', 'ya es colaborador', 'Ya existe una invitación']

async function invitar() {
  const email = invitacion.value.email.trim().toLowerCase()
  if (!email) return
  errorCorreo.value = ''
  ocupado.value = true
  try {
    const r = await colaboradoresStore.invitarColaborador(id, {
      email,
      rol: invitacion.value.rol,
      permisos: permisosParaGuardar(invitacion.value.rol, invitacion.value.niveles)
    })
    if (!r.success) throw new Error(r.error)
    recienInvitado.value = { id: r.data?.id, email_usuario: email, rol: invitacion.value.rol, token_invitacion: r.data?.token_invitacion }
    await cargarEquipo()
  } catch (e) {
    const mensaje = e.message || 'No se pudo invitar'
    if (ERRORES_DE_CORREO.some(t => mensaje.includes(t))) errorCorreo.value = mensaje
    else notificationStore.error(mensaje, 'Error')
  } finally {
    ocupado.value = false
  }
}

function nuevaInvitacion() {
  recienInvitado.value = null
  invitacion.value = { email: '', rol: 'visor', niveles: nivelesDePermisos('visor', {}) }
  formularioAbierto.value = true
}

// ─── Compartir la invitación ───
const enlaceDe = c => (c?.token_invitacion ? `${window.location.origin}/invitacion/${c.token_invitacion}` : '')

function textoInvitacion(c) {
  const rol = ROLES[c.rol]?.nombre?.toLowerCase() || 'colaborador'
  return [
    `Hola 👋 Te invité como ${rol} de la natillera${nombreNatillera.value ? ` *${nombreNatillera.value}*` : ''} en Natillerapp.`,
    '',
    enlaceDe(c)
      ? `Acéptala aquí: ${enlaceDe(c)}`
      : 'Entra a la app con tu cuenta y la verás en el inicio.'
  ].join('\n')
}

async function copiarEnlace(c) {
  const texto = enlaceDe(c)
  if (!texto) {
    notificationStore.info('La invitación le aparece al entrar a la app', 'Sin enlace')
    return
  }
  try {
    await navigator.clipboard.writeText(texto)
    copiado.value = c.id
    clearTimeout(temporizadorCopiado)
    temporizadorCopiado = setTimeout(() => { copiado.value = null }, 2500)
  } catch {
    notificationStore.info(texto, 'Copia el enlace')
  }
}

/*
 * El menú del sistema deja elegir el chat; sin él (escritorio), wa.me abre WhatsApp para
 * escogerlo. Nada asíncrono antes de `navigator.share`: Safari exige que vaya pegado al toque.
 */
function avisarWhatsApp(c) {
  const texto = textoInvitacion(c)
  const abrirWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  if (navigator.share) {
    navigator.share({ text: texto }).catch(err => {
      if (err?.name !== 'AbortError') abrirWhatsApp()
    })
    return
  }
  abrirWhatsApp()
}

// ─── Carga ───
async function cargarEquipo() {
  await colaboradoresStore.fetchColaboradores(id)
}

async function cargarAdmin(adminId) {
  if (!adminId) return
  const { data } = await supabase.from('user_profiles').select('email, nombre').eq('id', adminId).maybeSingle()
  admin.value = { nombre: data?.nombre || '', email: data?.email || '' }
}

onMounted(async () => {
  consulta = window.matchMedia('(min-width: 1024px)')
  alCambiarAncho()
  consulta.addEventListener?.('change', alCambiarAncho)

  const necesitaNatillera = natillerasStore.natilleraActual?.id !== id
  const [{ data: { user } }] = await Promise.all([
    supabase.auth.getUser(),
    necesitaNatillera
      ? supabase.from('natilleras').select('*').eq('id', id).maybeSingle().then(({ data }) => {
          if (data) natillerasStore.natilleraActual = data
        })
      : Promise.resolve(),
    cargarEquipo()
  ])
  miUsuario.value = user
  const natillera = natillerasStore.natilleraActual
  await cargarAdmin(natillera?.admin_id)

  soyDueno.value = !!user && natillera?.admin_id === user.id
  cargando.value = false
})

onUnmounted(() => {
  consulta?.removeEventListener?.('change', alCambiarAncho)
  clearTimeout(temporizadorCopiado)
})
</script>

<style scoped>
/* ─── Resumen ─── */
.adm-resumen {
  padding: 1rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
.adm-resumen__cifras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 1rem;
  margin: 0.625rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: #475569;
}
.adm-resumen__cifras li { display: inline-flex; align-items: center; gap: 0.375rem; }
.adm-resumen__cifras strong { color: #0f172a; }
.adm-punto { width: 0.625rem; height: 0.625rem; border-radius: 9999px; background: #cbd5e1; }
.adm-punto--dueno { background: var(--brand-primary); }
.adm-punto--co_administrador { background: #16a34a; }
.adm-punto--colaborador { background: #1d4ed8; }
.adm-punto--visor { background: #94a3b8; }
.adm-punto--pendiente { background: #d97706; }

/* ─── Cuerpo: una columna en móvil (con orden propio), dos desde 1024 px ─── */
.adm-cuerpo { display: flex; flex-direction: column; gap: 1.25rem; }
.adm-cuerpo__listas { display: contents; }
.adm-invitar { order: 1; }
.adm-seccion--equipo { order: 2; }
.adm-seccion--pendientes { order: 3; }
.adm-seccion--sin { order: 4; }
@media (min-width: 1024px) {
  .adm-cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22rem;
    align-items: start;
    gap: 1.5rem;
  }
  .adm-cuerpo__listas { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
  .adm-invitar { position: sticky; top: 1rem; }
}

/* ─── Secciones ─── */
.adm-seccion {
  padding: 1rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
@media (min-width: 640px) {
  .adm-seccion { padding: 1.25rem; }
}
.adm-seccion--pendientes { border-color: rgba(180, 83, 9, 0.25); background: #fffbeb; }
.adm-seccion__cabeza { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.adm-seccion__titulo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: #0f172a;
}
.adm-conteo {
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
.adm-conteo--pendiente { background: #fef3c7; color: #92400e; }
.adm-plegable {
  display: flex;
  width: 100%;
  min-height: 2.75rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 1024px) {
  /* En escritorio el formulario siempre está abierto: el título deja de ser botón */
  .adm-plegable--invitar { pointer-events: none; }
}

/* ─── Filas ─── */
.adm-lista { margin: 0.5rem 0 0; padding: 0; list-style: none; }
.adm-fila { padding: 0.75rem 0; list-style: none; }
.adm-fila + .adm-fila { border-top: 1px solid var(--surface-divider); }
.adm-fila__principal { display: flex; align-items: center; gap: 0.75rem; }
.adm-avatar {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #e2e8f0;
  font-family: var(--font-display);
  font-weight: 800;
  color: #475569;
}
.adm-avatar--dueno { background: var(--brand-primary); color: #fff; }
.adm-avatar--co_administrador { background: #dcfce7; color: #166534; }
.adm-avatar--colaborador { background: #dbeafe; color: #1e40af; }
.adm-avatar--pendiente { background: #fef3c7; color: #92400e; }
.adm-avatar--listo { background: #dcfce7; color: #166534; }
.adm-fila__nombre { font-size: 0.9375rem; font-weight: 700; line-height: 1.3; color: #0f172a; overflow-wrap: anywhere; }
.adm-fila__dato { overflow: hidden; font-size: 0.8125rem; text-overflow: ellipsis; white-space: nowrap; color: #64748b; }
.adm-fila__permisos { margin-top: 0.125rem; font-size: 0.75rem; color: #475569; }
.adm-yo {
  margin-left: 0.25rem;
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  background: var(--brand-primary-soft);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--brand-primary);
  vertical-align: middle;
}
.adm-fila__acciones { display: flex; flex-shrink: 0; gap: 0.125rem; }
.adm-icono {
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
.adm-icono:hover { background: var(--brand-primary-soft); }
.adm-icono:disabled { opacity: 0.5; }
.adm-icono--peligro { color: #b91c1c; }
.adm-icono--peligro:hover { background: #fef2f2; }
.adm-icono--whatsapp { color: #16a34a; }
.adm-icono--whatsapp:hover { background: #dcfce7; }
.adm-salir {
  min-height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  background: #fef2f2;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b91c1c;
  touch-action: manipulation;
}

/* ─── Paneles en línea ─── */
.adm-panel { margin-top: 0.75rem; padding: 0.875rem; border-radius: 0.875rem; background: #f4f8f5; }
.adm-panel--peligro { background: #fef2f2; }
.adm-boton-peligro {
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
.adm-boton-peligro:disabled { opacity: 0.5; }

/* ─── Invitar ─── */
.adm-invitar { display: flex; flex-direction: column; gap: 0.875rem; }
.adm-btn-whatsapp {
  background: #16a34a;
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(22, 163, 74, 0.32);
}
.adm-btn-whatsapp:hover { background: #15803d; }
.adm-texto-boton {
  min-height: 2.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--brand-primary);
  touch-action: manipulation;
}
</style>
