<template>
  <div class="card">
    <div class="mb-5 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
        <BellAlertIcon class="h-5 w-5 text-white" />
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-lg font-bold text-gray-800">Avisos de soporte</h2>
        <p class="text-sm text-gray-500">Recibe una notificación cuando el soporte responda</p>
      </div>
    </div>

    <!-- Cada navegador es una suscripción independiente: se dice explícitamente
         para que nadie espere que activarlo aquí valga en su otro teléfono. -->
    <p class="mb-4 text-sm leading-relaxed text-gray-600">
      Este ajuste vale solo para <span class="font-semibold">este dispositivo</span>.
      Si usas Natillerapp en otro teléfono o navegador, actívalo también allí.
    </p>

    <!-- Activo -->
    <div v-if="estado === 'activo'" class="flex flex-col gap-3 rounded-xl bg-[#E8F5E9] p-4 ring-1 ring-[#1B5E37]/15 sm:flex-row sm:items-center">
      <CheckCircleIcon class="h-6 w-6 shrink-0 text-[#1B5E37]" />
      <p class="min-w-0 flex-1 text-sm text-gray-700">
        Las notificaciones están <span class="font-semibold">activas</span> en este dispositivo.
      </p>
      <button
        type="button"
        class="btn-modal-secondary shrink-0 !min-h-[44px] px-4 text-sm"
        :disabled="ocupado"
        @click="desactivarAvisos"
      >
        {{ ocupado ? 'Desactivando…' : 'Desactivar' }}
      </button>
    </div>

    <!-- Se puede pedir permiso -->
    <div v-else-if="estado === 'sin_conceder'" class="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 sm:flex-row sm:items-center">
      <BellSlashIcon class="h-6 w-6 shrink-0 text-gray-400" />
      <p class="min-w-0 flex-1 text-sm text-gray-700">
        Sin avisos. Si no los activas, te escribiremos por correo cuando respondamos.
      </p>
      <!-- El permiso se pide SOLO aquí, tras esta pulsación: pedirlo al cargar
           la app lo deniega de por vida en la mayoría de navegadores (RF-13). -->
      <button
        type="button"
        class="btn-modal-primary shrink-0 !min-h-[44px] px-4 text-sm"
        :disabled="ocupado || !configurado"
        @click="activarAvisos"
      >
        {{ ocupado ? 'Activando…' : 'Activar avisos' }}
      </button>
    </div>

    <!-- iOS sin instalar: Safari solo admite push desde la pantalla de inicio -->
    <div v-else-if="estado === 'requiere_instalar'" class="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
      <div class="flex items-start gap-3">
        <DevicePhoneMobileIcon class="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-blue-900">Instala la app para recibir avisos</p>
          <p class="mt-1 text-sm leading-relaxed text-blue-800">
            En iPhone y iPad, Safari solo envía notificaciones si Natillerapp está
            en la pantalla de inicio. Pulsa <span class="font-semibold">Compartir</span> y luego
            <span class="font-semibold">«Añadir a pantalla de inicio»</span>. Mientras tanto, te
            avisaremos por correo.
          </p>
          <!-- Variante `header`: pastilla verde de marca. La variante `sidebar`
               es texto blanco sobre fondo translúcido y aquí sería ilegible. -->
          <div class="mt-3">
            <InstallPwaButton variant="header" />
          </div>
        </div>
      </div>
    </div>

    <!-- Denegado: no se vuelve a preguntar, se explica cómo revertirlo -->
    <div v-else-if="estado === 'denegado'" class="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <div class="flex items-start gap-3">
        <ExclamationTriangleIcon class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-amber-900">Los avisos están bloqueados</p>
          <p class="mt-1 text-sm leading-relaxed text-amber-800">
            Este navegador tiene las notificaciones denegadas para Natillerapp, y por eso no se
            te puede volver a preguntar desde aquí. Para permitirlas: abre los ajustes del sitio
            (el icono a la izquierda de la dirección web), busca
            <span class="font-semibold">Notificaciones</span> y cámbialo a
            <span class="font-semibold">Permitir</span>. Después, recarga esta página.
          </p>
        </div>
      </div>
    </div>

    <!-- No soportado -->
    <div v-else class="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
      <div class="flex items-start gap-3">
        <InformationCircleIcon class="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
        <p class="text-sm leading-relaxed text-gray-600">
          Este navegador no admite notificaciones push. Todo lo demás funciona con normalidad y
          te avisaremos por correo cuando el soporte responda.
        </p>
      </div>
    </div>

    <p v-if="!configurado" class="mt-3 text-xs text-amber-700">
      Falta configurar <code class="rounded bg-gray-100 px-1">VITE_VAPID_PUBLIC_KEY</code> en el
      entorno; sin ella no se pueden activar los avisos.
    </p>
    <p v-if="error" class="mt-3 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  BellAlertIcon, BellSlashIcon, CheckCircleIcon, DevicePhoneMobileIcon,
  ExclamationTriangleIcon, InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import InstallPwaButton from '../InstallPwaButton.vue'
import { usePush } from '../../composables/usePush'
import { useNotificationStore } from '../../stores/notifications'

const { estado, ocupado, error, configurado, comprobar, activar, desactivar } = usePush()
const notificaciones = useNotificationStore()

onMounted(() => { comprobar() })

async function activarAvisos() {
  const listo = await activar()
  if (listo) notificaciones.exito('Avisos activados en este dispositivo.')
  else if (estado.value === 'denegado') {
    notificaciones.alerta('El navegador bloqueó los avisos. Puedes permitirlos desde los ajustes del sitio.')
  }
}

async function desactivarAvisos() {
  const listo = await desactivar()
  if (listo) notificaciones.informacion('Avisos desactivados en este dispositivo.')
}
</script>
