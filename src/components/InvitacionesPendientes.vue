<template>
  <div v-if="invitaciones.length > 0" class="space-y-2.5">
    <!-- Cabecera solo si el bloque no va dentro de la sección «Invitaciones» del layout -->
    <div v-if="!omitOuterHeading" class="flex items-center justify-between px-0.5">
      <h3 class="font-display text-sm font-bold tracking-tight text-[#166534]">
        Invitaciones
      </h3>
      <span
        class="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-[#166534] px-2 text-xs font-bold text-white tabular-nums shadow-sm"
      >
        {{ invitaciones.length }}
      </span>
    </div>

    <article
      v-for="invitacion in invitaciones"
      :key="invitacion.id"
      class="overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.13] to-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_4px_14px_rgba(0,0,0,0.12)] backdrop-blur-sm"
    >
      <div class="p-2.5">
        <div class="flex gap-2.5">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#166534] text-white shadow-md ring-1 ring-white/15"
            aria-hidden="true"
          >
            <BuildingLibraryIcon class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-display text-sm font-bold leading-tight text-white">
              {{ invitacion.natillera_nombre }}
            </p>
            <p class="mt-1">
              <span
                class="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-50 ring-1 ring-white/10"
              >
                <component
                  :is="iconoRolInvitacion(invitacion.rol)"
                  class="h-3 w-3 shrink-0 text-emerald-200"
                  aria-hidden="true"
                />
                <span class="truncate">{{ formatearRol(invitacion.rol).toUpperCase() }}</span>
              </span>
            </p>
            <p class="mt-2 text-[11px] leading-snug text-emerald-100/90">
              Invitado por
              <span class="break-all font-semibold text-white">{{ emailInvitadorDestacado(invitacion) }}</span>
            </p>
            <div
              v-if="invitacion.notas"
              class="mt-2 rounded-lg border border-amber-300/25 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-snug text-amber-50/95"
            >
              <span class="font-semibold text-amber-100">Mensaje: </span>
              <span class="whitespace-pre-wrap break-words">{{ invitacion.notas }}</span>
            </div>
          </div>
        </div>

        <div class="mt-3 flex flex-col gap-2">
          <button
            type="button"
            @click="aceptar(invitacion)"
            :disabled="procesando === invitacion.id"
            class="flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#166534] px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/10 transition hover:bg-[#145a2d] disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
          >
            <span v-if="procesando !== invitacion.id">Aceptar</span>
            <span v-else class="flex items-center gap-2">
              <svg class="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando…
            </span>
          </button>
          <button
            type="button"
            @click="abrirModalRechazar(invitacion)"
            :disabled="procesando === invitacion.id"
            class="flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
          >
            Rechazar
          </button>
        </div>

        <p
          class="mt-2 text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-emerald-200/50"
        >
          {{ textoExpiracion(invitacion) }}
        </p>
      </div>
    </article>

    <RechazarInvitacionConfirmModal
      :invitacion="invitacionARechazar"
      :loading="!!invitacionARechazar && procesando === invitacionARechazar.id"
      @close="cerrarModalRechazar"
      @confirm="confirmarRechazar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useColaboradoresStore } from '../stores/colaboradores'
import { useNatillerasStore } from '../stores/natilleras'
import { useNotificationStore } from '../stores/notifications'
import {
  formatearRolColaboradorInvitacion as formatearRol,
  emailInvitadorDestacado,
  textoExpiracionInvitacionColaborador as textoExpiracion,
} from '../utils/invitacionesColaborador'
import RechazarInvitacionConfirmModal from './RechazarInvitacionConfirmModal.vue'
import {
  BuildingLibraryIcon,
  EyeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  omitOuterHeading: { type: Boolean, default: false }
})

const colaboradoresStore = useColaboradoresStore()
const natillerasStore = useNatillerasStore()
const notificationStore = useNotificationStore()

const procesando = ref(null)
const invitacionARechazar = ref(null)

const invitaciones = computed(() => colaboradoresStore.misInvitaciones)

function iconoRolInvitacion(rol) {
  if (rol === 'visor') return EyeIcon
  if (rol === 'co_administrador') return ShieldCheckIcon
  return UsersIcon
}

async function aceptar(invitacion) {
  try {
    procesando.value = invitacion.id

    const resultado = await colaboradoresStore.aceptarInvitacion(invitacion.token_invitacion)

    if (resultado.success) {
      notificationStore.success(
        `Ahora eres colaborador de "${resultado.data.natillera_nombre}"`,
        '¡Invitación aceptada!'
      )
      await natillerasStore.fetchNatillerasCompartidas()
    } else {
      notificationStore.error(resultado.error || 'Error al aceptar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al aceptar la invitación')
  } finally {
    procesando.value = null
  }
}

function abrirModalRechazar(invitacion) {
  invitacionARechazar.value = invitacion
}

function cerrarModalRechazar() {
  if (procesando.value) return
  invitacionARechazar.value = null
}

async function confirmarRechazar() {
  const inv = invitacionARechazar.value
  if (!inv) return

  try {
    procesando.value = inv.id

    const resultado = await colaboradoresStore.rechazarInvitacion(inv.token_invitacion)

    if (resultado.success) {
      invitacionARechazar.value = null
      notificationStore.info('Invitación rechazada')
    } else {
      notificationStore.error(resultado.error || 'Error al rechazar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al rechazar la invitación')
  } finally {
    procesando.value = null
  }
}

onMounted(async () => {
  await colaboradoresStore.fetchMisInvitaciones()
})
</script>
