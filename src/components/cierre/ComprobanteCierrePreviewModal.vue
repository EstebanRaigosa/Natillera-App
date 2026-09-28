<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <DocumentTextIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Vista previa</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">Así lo recibirá {{ nombre }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cabecera desktop: icono arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <DocumentTextIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Vista previa</h2>
          <p class="mt-1 max-w-full truncate text-xs leading-snug text-white/80">Así lo recibirá {{ nombre }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#eef2ee] px-4 pb-4 pt-4 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <ComprobanteCierreSocio
          v-if="dato"
          :dato="dato"
          :periodicidad="periodicidad"
          :tipos-utilidad="tiposUtilidad"
          :etiquetas-utilidad="etiquetasUtilidad"
          :fluido="true"
          class="shadow-sm"
        />
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 space-y-2 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <p v-if="errorImagen" class="text-center text-xs text-red-700">{{ errorImagen }}</p>
      <!-- Reserva si falla el menú de compartir: desde el `.catch` Safari bloquea el
           `window.open` (ya no hay toque), así que se ofrece un enlace para tocar. -->
      <p v-if="reservaWhatsApp" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900" role="status">
        No se pudo abrir el menú de compartir. Descarga la imagen y adjúntala en el chat.
        <a :href="reservaWhatsApp" target="_blank" rel="noopener" class="inline-flex min-h-11 touch-manipulation items-center font-semibold text-[#1B5E37] underline">Abrir WhatsApp</a>
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          class="btn-descargar flex-1"
          :disabled="!archivo"
          @click="descargar"
        >
          <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
          Descargar
        </button>
        <button
          v-if="telefono"
          type="button"
          class="btn-compartir flex-1"
          :disabled="!archivo"
          @click="enviarWhatsApp"
        >
          <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
          {{ archivo ? 'WhatsApp' : 'Preparando…' }}
        </button>
      </div>
    </div>
  </ModalWrapper>

  <!--
    Copia a 400px fijos, fuera de la pantalla, que es la que se convierte en imagen: la
    vista previa se ajusta al ancho del modal y saldría distinta en cada teléfono.
  -->
  <div v-if="show && dato" class="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
    <div ref="capturaRef">
      <ComprobanteCierreSocio
        :dato="dato"
        :periodicidad="periodicidad"
        :tipos-utilidad="tiposUtilidad"
        :etiquetas-utilidad="etiquetasUtilidad"
      />
    </div>
  </div>
</template>

<script setup>
import { numeroWhatsApp } from '../../utils/telefono'
import { detectIosPlatform } from '../../composables/useIsIos'
import { computed, nextTick, ref, watch } from 'vue'
import { toPng } from 'html-to-image'
import { ArrowDownTrayIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import IconoWhatsApp from '../iconos/IconoWhatsApp.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import ComprobanteCierreSocio from './ComprobanteCierreSocio.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'

const props = defineProps({
  show: { type: Boolean, default: false },
  dato: { type: Object, default: null },
  periodicidad: { type: String, default: 'mensual' },
  tiposUtilidad: { type: Array, default: () => [] },
  etiquetasUtilidad: { type: Object, default: () => ({}) },
  /** Mensaje que acompaña la imagen en WhatsApp. */
  texto: { type: String, default: '' }
})

const emit = defineEmits(['close', 'descargado', 'sin-compartir'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

const capturaRef = ref(null)
const dataUrl = ref('')
const archivo = ref(null)
const errorImagen = ref('')
/** Enlace a WhatsApp que se ofrece si el menú de compartir falla. */
const reservaWhatsApp = ref(null)

const nombre = computed(() => props.dato?.socio?.nombre || 'el socio')
const telefono = computed(() => (props.dato?.socio?.telefono || '').replace(/\D/g, ''))
const nombreArchivo = computed(() =>
  `comprobante-cierre-${(props.dato?.socio?.nombre || 'socio').trim().replace(/\s+/g, '-')}.png`
)

/*
 * La imagen se genera al abrir, no al tocar «Enviar». Safari solo deja abrir el menú de
 * compartir si `navigator.share` se llama pegado al toque; con el `await` de generar la
 * imagen por delante, el gesto caduca y el share se rechaza sin preguntar.
 */
let generacion = 0
watch(
  () => [props.show, props.dato],
  async ([abierto]) => {
    dataUrl.value = ''
    archivo.value = null
    errorImagen.value = ''
    reservaWhatsApp.value = null
    if (!abierto || !props.dato) return
    const turno = ++generacion
    await nextTick()
    try {
      const url = await toPng(capturaRef.value, { pixelRatio: 2, cacheBust: true, backgroundColor: '#ffffff' })
      if (turno !== generacion) return
      const blob = await (await fetch(url)).blob()
      if (turno !== generacion) return
      dataUrl.value = url
      archivo.value = new File([blob], nombreArchivo.value, { type: 'image/png' })
    } catch (error) {
      console.error('Error generando imagen de comprobante:', error)
      if (turno === generacion) errorImagen.value = 'No se pudo preparar la imagen. Cierra y vuelve a intentarlo.'
    }
  },
  { immediate: true }
)

function descargar() {
  if (!dataUrl.value) return
  // En iOS `a.download` con un data URL abre la imagen en otra pestaña en lugar de
  // guardarla; la hoja de compartir ofrece «Guardar imagen». Sin `await` antes: gesto.
  const archivos = archivo.value ? { files: [archivo.value] } : null
  if (archivos && detectIosPlatform() && navigator.canShare?.(archivos)) {
    navigator.share(archivos).then(() => emit('descargado'), () => {})
    return
  }
  const enlace = document.createElement('a')
  enlace.download = nombreArchivo.value
  enlace.href = dataUrl.value
  enlace.click()
  emit('descargado')
}

function enviarWhatsApp() {
  if (!archivo.value || !telefono.value) return
  const datos = { files: [archivo.value], title: 'Comprobante de cierre', text: props.texto }
  // Sin nada asíncrono antes: ver el comentario de la generación.
  if (navigator.canShare?.(datos)) {
    reservaWhatsApp.value = null
    navigator.share(datos).catch(error => {
      // Cancelar el menú de compartir no es un error.
      if (error?.name === 'AbortError') return
      reservaWhatsApp.value = `https://wa.me/${numeroWhatsApp(telefono.value)}?text=${encodeURIComponent(props.texto)}`
    })
    return
  }
  abrirWhatsAppConTexto()
}

// Escritorio (o navegador sin compartir archivos): se descarga la imagen y se abre el
// chat con el texto; la imagen hay que adjuntarla a mano.
function abrirWhatsAppConTexto() {
  descargar()
  const numero = numeroWhatsApp(telefono.value)
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(props.texto)}`, '_blank')
  emit('sin-compartir')
}
</script>
