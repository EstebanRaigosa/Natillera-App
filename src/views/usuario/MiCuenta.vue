<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-gray-800 sm:text-3xl">Mi cuenta</h1>
      <p class="mt-1 text-gray-500">Tus datos y tus preferencias personales</p>
    </div>

    <!-- ── Identidad ── -->
    <div class="card">
      <!-- En móvil, avatar y datos comparten fila y el botón salta a la siguiente
           (`flex-wrap` + `w-full`). Antes era una columna y el nombre quedaba debajo
           del avatar, gastando dos líneas de alto para nada. -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <img
          :src="avatar"
          :alt="auth.userName || ''"
          class="h-16 w-16 shrink-0 rounded-full ring-2 ring-[#1B5E37]/15"
          width="64"
          height="64"
          decoding="async"
          draggable="false"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-lg font-bold text-gray-900">{{ auth.userName }}</p>
          <p class="truncate text-sm text-gray-500">{{ auth.userEmail }}</p>
        </div>
        <button
          type="button"
          class="btn-modal-secondary w-full shrink-0 !min-h-[44px] px-4 text-sm sm:w-auto"
          @click="editandoNombre = true"
        >
          <PencilSquareIcon class="mr-1.5 h-4 w-4" />
          Cambiar nombre
        </button>
      </div>
    </div>

    <!--
      Preferencias personales. Viven aquí y no en /configuracion a propósito:
      esa pantalla guarda los mensajes por defecto, el periodo y los días de
      gracia, que son ajustes de la natillera y valen para todo el mundo. Los
      avisos push y el botón flotante son de esta persona y de este dispositivo.
    -->
    <AjustesNotificaciones />
    <AjustesBotonSoporte />

    <!-- ── Tus datos (Ley 1581): qué aceptaste y cómo ejercer tus derechos ── -->
    <section class="card">
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B5E37]">
          <ShieldCheckIcon class="h-5 w-5" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-lg font-bold text-gray-900">Tus datos</h2>
          <p class="text-sm text-gray-500">
            <template v-if="aceptadoEn">Aceptaste la política el {{ aceptadoEn }}.</template>
            <template v-else>Puedes consultar, corregir o pedir que borremos tus datos.</template>
          </p>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <router-link :to="{ name: 'PoliticaDatos' }" class="btn-modal-secondary !min-h-[44px] px-4 text-sm">Política de datos</router-link>
        <router-link :to="{ name: 'Terminos' }" class="btn-modal-secondary !min-h-[44px] px-4 text-sm">Términos</router-link>
        <a :href="enlaceSolicitud" class="btn-modal-primary !min-h-[44px] px-4 text-sm">Pedir mis datos o borrarlos</a>
      </div>
    </section>

    <UsernameModal :show="editandoNombre" @close="editandoNombre = false" @saved="editandoNombre = false" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PencilSquareIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import AjustesNotificaciones from '../../components/soporte/AjustesNotificaciones.vue'
import AjustesBotonSoporte from '../../components/soporte/AjustesBotonSoporte.vue'
import UsernameModal from '../../components/UsernameModal.vue'
import { useAuthStore } from '../../stores/auth'
import { getAvatarUrl } from '../../utils/avatars'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/formatDate'
import { RESPONSABLE, VERSION_LEGAL } from '../../legal/responsable'

const auth = useAuthStore()
const editandoNombre = ref(false)

const avatar = computed(() => getAvatarUrl(auth.userEmail || auth.userName))

// Fecha en que aceptó la versión vigente (la constancia que exige la ley).
const aceptadoEn = ref('')
watch(() => auth.user?.id, async usuarioId => {
  aceptadoEn.value = ''
  if (!usuarioId) return
  const { data } = await supabase
    .from('consentimientos_legales')
    .select('aceptado_en')
    .eq('usuario_id', usuarioId)
    .eq('version', VERSION_LEGAL)
    .limit(1)
  aceptadoEn.value = data?.[0]?.aceptado_en ? formatDate(data[0].aceptado_en) : ''
}, { immediate: true })

// Consulta o reclamo por correo, con lo que la ley pide ya escrito para que solo complete.
const enlaceSolicitud = computed(() => {
  const asunto = 'Solicitud sobre mis datos personales'
  const cuerpo = [
    'Hola, quiero (marca una): conocer mis datos / corregirlos / que los borren / revocar la autorización.',
    '',
    `Nombre: ${auth.userName || ''}`,
    `Correo de la cuenta: ${auth.userEmail || ''}`,
    'Número de documento: ',
    'Detalle: '
  ].join('\n')
  return `mailto:${RESPONSABLE.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
})
</script>
