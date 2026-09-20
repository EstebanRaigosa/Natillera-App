<template>
  <!--
    Modal de apertura de conversación (RF-01). Sigue el patrón obligatorio de la
    skill natillerapp-modals: ModalWrapper + cabecera marca compacta (móvil =
    fila, desktop = icono arriba con textos centrados) + cuerpo scrolleable con
    natiscroll + footer de acciones fijo con safe-area.
  -->
  <ModalWrapper
    :show="show"
    :z-index="80"
    align="bottom"
    :persistent="enviando"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- ── Cabecera marca (móvil = fila) ── -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
      <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <LifebuoyIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">Escribir a soporte</h3>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">Te respondemos dentro de la app</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cabecera marca (desktop = icono arriba + textos centrados) ── -->
    <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="flex items-start px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div class="w-11 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <LifebuoyIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">Escribir a soporte</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">Te respondemos dentro de la app</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
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
        class="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-5 pb-6 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="onScroll"
      >
        <div>
          <label for="soporte-asunto" class="mb-1.5 block text-sm font-semibold text-gray-800">
            ¿Sobre qué es?
          </label>
          <input
            id="soporte-asunto"
            v-model="asunto"
            type="text"
            maxlength="120"
            placeholder="Ej. No puedo registrar un pago"
            class="w-full rounded-xl border-2 border-gray-200 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition focus:border-[#1B5E37] focus:ring-2 focus:ring-[#1B5E37]/30"
            :disabled="enviando"
          />
          <p v-if="errores.asunto" class="mt-1 text-xs text-red-600">{{ errores.asunto }}</p>
        </div>

        <div>
          <label for="soporte-categoria" class="mb-1.5 block text-sm font-semibold text-gray-800">
            Categoría
          </label>
          <!-- select nativo a propósito: en iOS abre el selector del sistema -->
          <select
            id="soporte-categoria"
            v-model="categoria"
            class="w-full rounded-xl border-2 border-gray-200 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition focus:border-[#1B5E37] focus:ring-2 focus:ring-[#1B5E37]/30"
            :disabled="enviando"
          >
            <option v-for="opcion in CATEGORIAS" :key="opcion.valor" :value="opcion.valor">
              {{ opcion.etiqueta }}
            </option>
          </select>
        </div>

        <div>
          <label for="soporte-cuerpo" class="mb-1.5 block text-sm font-semibold text-gray-800">
            Cuéntanos qué pasa
          </label>
          <textarea
            id="soporte-cuerpo"
            v-model="cuerpo"
            rows="5"
            maxlength="4000"
            placeholder="Cuanto más detalle, mejor: qué hacías, qué esperabas y qué ocurrió."
            class="w-full resize-y rounded-xl border-2 border-gray-200 bg-white px-3.5 py-3 text-base leading-relaxed text-gray-900 outline-none transition focus:border-[#1B5E37] focus:ring-2 focus:ring-[#1B5E37]/30"
            :disabled="enviando"
          />
          <div class="mt-1 flex items-start justify-between gap-3">
            <p v-if="errores.cuerpo" class="text-xs text-red-600">{{ errores.cuerpo }}</p>
            <span class="ml-auto shrink-0 text-[0.6875rem] text-gray-500">{{ cuerpo.length }} / 4000</span>
          </div>
        </div>

        <div class="rounded-xl bg-[#E8F5E9] px-3.5 py-3 ring-1 ring-[#1B5E37]/10">
          <p class="text-xs leading-relaxed text-gray-700">
            Escribes como <span class="font-semibold">{{ correo }}</span>. Solo tú y el soporte de
            Natillerapp veis esta conversación.
          </p>
        </div>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- ── Footer de acciones fijo ── -->
    <div class="flex-shrink-0 space-y-3 border-t border-gray-200 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" :disabled="enviando" @click="cerrar">
          Cancelar
        </button>
        <button type="button" class="btn-modal-primary flex-1" :disabled="enviando" @click="enviarFormulario">
          {{ enviando ? 'Enviando…' : 'Enviar' }}
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { LifebuoyIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { CATEGORIAS } from '../../stores/soporte'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  show: { type: Boolean, default: false },
  enviando: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'crear'])

const auth = useAuthStore()
const correo = computed(() => auth.userEmail || 'tu cuenta')

const modalAbierta = computed(() => props.show)
useBodyScrollLock(modalAbierta)
const { scrollRef, hayMas, onScroll } = useNatiscroll(modalAbierta)

const asunto = ref('')
const categoria = ref('error')
const cuerpo = ref('')
const errores = reactive({ asunto: '', cuerpo: '' })

// El borrador NO se limpia al cerrar: si el usuario cierra sin querer, al volver
// a abrir sigue ahí. Solo se vacía cuando el envío se confirma (RF-01).
watch(() => props.show, (visible) => {
  if (visible) {
    errores.asunto = ''
    errores.cuerpo = ''
  }
})

function validar() {
  errores.asunto = ''
  errores.cuerpo = ''

  const a = asunto.value.trim()
  const c = cuerpo.value.trim()

  // Validación de cliente por comodidad; la que cuenta es la del servidor (RF-01).
  if (a.length < 5) errores.asunto = 'El asunto necesita al menos 5 caracteres'
  else if (a.length > 120) errores.asunto = 'El asunto admite hasta 120 caracteres'

  if (c.length < 10) errores.cuerpo = 'Cuéntanos un poco más: al menos 10 caracteres'

  return !errores.asunto && !errores.cuerpo
}

function enviarFormulario() {
  if (!validar()) return
  emit('crear', {
    asunto: asunto.value.trim(),
    categoria: categoria.value,
    cuerpo: cuerpo.value.trim(),
  })
}

/** La llama el padre solo cuando el servidor confirma la creación. */
function limpiar() {
  asunto.value = ''
  cuerpo.value = ''
  categoria.value = 'error'
}

function cerrar() {
  if (props.enviando) return
  emit('close')
}

defineExpose({ limpiar })
</script>
