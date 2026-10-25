<template>
  <!--
    Ficha del usuario para el soporte: quién es, desde dónde entra y con qué
    natilleras trabaja. Va dentro de la cabecera de la conversación, así que
    tiene altura acotada y su propio scroll: una ficha con diez natilleras no
    puede empujar el hilo fuera de la pantalla.
  -->
  <div class="rounded-xl bg-superficie-tarjeta ring-1 ring-borde">
    <CargaCaja v-if="cargando && !ficha" texto="Cargando la ficha" />

    <div v-else-if="fallo" class="flex items-center gap-2 px-3 py-3 text-xs text-texto-secundario">
      <ExclamationTriangleIcon class="h-4 w-4 shrink-0 text-amber-500" />
      <p class="min-w-0 flex-1">{{ fallo }}</p>
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] items-center rounded-full px-3 text-xs font-semibold text-marca-tinta transition hover:bg-superficie-suave touch-manipulation"
        @click="cargar(true)"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="ficha"
      class="max-h-72 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch]"
    >
      <!-- Perfil -->
      <div class="flex items-start gap-2.5">
        <UserCircleIcon class="h-9 w-9 shrink-0 text-texto-tenue" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-texto-fuerte">{{ perfil.nombre || 'Sin nombre' }}</p>
          <p class="truncate text-xs text-texto-suave">{{ perfil.email }}</p>
          <p v-if="perfil.telefono" class="text-xs text-texto-suave">{{ perfil.telefono }}</p>
          <p class="mt-0.5 text-[0.6875rem] text-texto-tenue">
            <span v-if="perfil.creado">Cuenta desde {{ fechaCorta(perfil.creado) }}</span>
            <span v-if="perfil.ultimo_acceso"> · Último ingreso {{ haceCuanto(perfil.ultimo_acceso) }}</span>
            <span v-if="perfil.activo === false" class="font-semibold text-red-600 oscuro:text-red-300"> · Cuenta desactivada</span>
          </p>
        </div>
      </div>

      <!-- Dispositivo de este chat -->
      <div v-if="dispositivoChat?.etiqueta">
        <p class="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-texto-tenue">Escribe desde</p>
        <p class="flex items-center gap-1.5 text-sm text-texto">
          <component :is="iconoDispositivo(dispositivoChat.tipo)" class="h-4 w-4 shrink-0 text-marca-tinta" />
          <span class="min-w-0 flex-1 truncate">{{ dispositivoChat.etiqueta }}</span>
        </p>
      </div>

      <!-- Dispositivos de los últimos 90 días -->
      <div>
        <p class="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-texto-tenue">Dispositivos recientes</p>
        <p v-if="!dispositivos.length" class="text-xs text-texto-suave">Sin ingresos en los últimos 90 días.</p>
        <ul v-else class="space-y-1">
          <li v-for="d in dispositivos" :key="d.etiqueta" class="flex items-center gap-1.5 text-xs text-texto-medio">
            <component :is="iconoDispositivo(d.tipo)" class="h-4 w-4 shrink-0 text-texto-suave" />
            <span class="min-w-0 flex-1 truncate">{{ d.etiqueta }}</span>
            <span class="shrink-0 text-[0.6875rem] text-texto-tenue">
              {{ haceCuanto(d.ultimo) }} · {{ d.ingresos }} {{ d.ingresos === 1 ? 'ingreso' : 'ingresos' }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Natilleras -->
      <div>
        <p class="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-texto-tenue">
          Natilleras ({{ natilleras.length }})
        </p>
        <p v-if="!natilleras.length" class="text-xs text-texto-suave">No administra ni participa en ninguna natillera.</p>
        <ul v-else class="space-y-1">
          <li v-for="n in natilleras" :key="n.id" class="flex items-center gap-2 text-xs">
            <span class="min-w-0 flex-1 truncate text-texto">{{ n.nombre }}</span>
            <span v-if="n.estado && n.estado !== 'activa'" class="shrink-0 text-[0.6875rem] text-texto-tenue">{{ n.estado }}</span>
            <span class="shrink-0 text-[0.6875rem] text-texto-tenue">{{ n.socios }} {{ n.socios === 1 ? 'socio' : 'socios' }}</span>
            <span :class="['shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold', claseRol(n.rol)]">
              {{ ROLES[n.rol] || n.rol }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  ComputerDesktopIcon, DevicePhoneMobileIcon, DeviceTabletIcon, ExclamationTriangleIcon, UserCircleIcon,
} from '@heroicons/vue/24/outline'
import CargaCaja from '../carga/CargaCaja.vue'
import { useSoporteStore } from '../../stores/soporte'

const props = defineProps({
  userId: { type: String, required: true },
  /** Dispositivo del último mensaje del usuario en esta conversación. */
  dispositivoChat: { type: Object, default: null },
})

const ROLES = {
  administrador: 'Administrador',
  co_administrador: 'Coadministrador',
  colaborador: 'Colaborador',
  visor: 'Visor',
  socio: 'Socio',
}

const soporte = useSoporteStore()

const ficha = ref(null)
const cargando = ref(false)
const fallo = ref('')

const perfil = computed(() => ficha.value?.perfil ?? {})
const dispositivos = computed(() => ficha.value?.dispositivos ?? [])
const natilleras = computed(() => ficha.value?.natilleras ?? [])

async function cargar(forzar = false) {
  const pedido = props.userId
  cargando.value = true
  fallo.value = ''
  try {
    const datos = await soporte.detalleUsuario(pedido, { forzar })
    // Se pudo cambiar de conversación mientras llegaba.
    if (pedido === props.userId) ficha.value = datos
  } catch (e) {
    if (pedido === props.userId) fallo.value = e?.message || 'No se pudo cargar la ficha del usuario.'
  } finally {
    if (pedido === props.userId) cargando.value = false
  }
}

watch(() => props.userId, () => {
  ficha.value = null
  cargar()
}, { immediate: true })

function iconoDispositivo(tipo) {
  if (tipo === 'movil') return DevicePhoneMobileIcon
  if (tipo === 'tablet') return DeviceTabletIcon
  return ComputerDesktopIcon
}

function claseRol(rol) {
  if (rol === 'administrador') return 'bg-[#1B5E37]/10 text-marca-tinta'
  if (rol === 'socio') return 'bg-superficie-hundida text-texto-medio'
  return 'bg-sky-50 text-sky-700 oscuro:bg-sky-500/15 oscuro:text-sky-300'
}

function fechaCorta(iso) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
}

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

function haceCuanto(iso) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const minutos = Math.round((fecha.getTime() - Date.now()) / 60000)
  if (Math.abs(minutos) < 60) return relativo.format(minutos, 'minute')
  const horas = Math.round(minutos / 60)
  if (Math.abs(horas) < 24) return relativo.format(horas, 'hour')
  return relativo.format(Math.round(horas / 24), 'day')
}
</script>
