<template>
  <!--
    Visor de adjuntos A PANTALLA COMPLETA.

    Excepción justificada a la skill natillerapp-modals (que exige ModalWrapper):
    la rama iOS de ModalWrapper impone con `!important` una tarjeta blanca de
    28 rem, `max-height: min(90dvh, …)`, borde y sombra. Eso es exactamente lo
    contrario de lo que necesita una foto: dentro de esa tarjeta la imagen se ve
    pequeña y rodeada de cromo. Por eso este overlay se monta a mano, y por eso
    aplica una por una las reglas que ModalWrapper daría gratis:

      · `100dvh` con fallback `100vh` y `-webkit-fill-available`,
      · `translate3d(0,0,0)` para que iOS lo componga en GPU,
      · `env(safe-area-inset-*)` en las barras de controles,
      · botones de 44×44 con `touch-action: manipulation`,
      · `useBodyScrollLock` y cierre con Esc y con toque en el fondo.

    El fondo es negro y no el velo salvia de marca: teñir de verde una foto
    falsea sus colores, que es justo lo que se viene a mirar. Es la razón por la
    que todos los visores de imagen del mundo usan negro.
  -->
  <Teleport to="body">
    <Transition name="visor-adjunto">
      <div
        v-if="show"
        class="visor-adjunto"
        role="dialog"
        aria-modal="true"
        :aria-label="`Adjunto ${adjunto?.nombre || ''}`"
        @click.self="$emit('cerrar')"
      >
        <!-- ── Barra superior: nombre y cerrar ── -->
        <div class="visor-adjunto__barra visor-adjunto__barra--arriba" @click.self="$emit('cerrar')">
          <p class="min-w-0 flex-1 truncate text-sm font-semibold text-white drop-shadow">
            {{ adjunto?.nombre }}
          </p>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 touch-manipulation"
            aria-label="Cerrar"
            @click="$emit('cerrar')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- ── Contenido ── -->
        <div v-if="cargando" class="visor-adjunto__centro" @click.self="$emit('cerrar')">
          <svg class="h-7 w-7 animate-spin text-white/80" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="fallo" class="visor-adjunto__centro" @click.self="$emit('cerrar')">
          <div class="max-w-xs px-6 text-center">
            <ExclamationTriangleIcon class="mx-auto h-9 w-9 text-amber-400" />
            <p class="mt-3 text-sm text-white/90">{{ fallo }}</p>
          </div>
        </div>

        <!-- Imagen: ocupa todo lo que puede. Un toque alterna entre ajustada y
             ampliada, porque en un overlay fijo iOS no da el pinch nativo. -->
        <div
          v-else-if="modo === 'imagen'"
          ref="scrollRef"
          :class="['visor-adjunto__lienzo', ampliada ? 'visor-adjunto__lienzo--ampliada' : '']"
          @click.self="$emit('cerrar')"
        >
          <img
            :src="url"
            :alt="adjunto?.nombre"
            :class="ampliada ? 'w-[200%] max-w-none select-none' : 'max-h-full max-w-full select-none object-contain'"
            @click.stop="alternarZoom"
            @error="fallo = 'No se pudo mostrar la imagen.'"
          />
        </div>

        <!-- Texto plano: panel legible, no negro sobre negro. -->
        <div v-else-if="modo === 'texto'" class="visor-adjunto__documento">
          <div
            ref="scrollRef"
            class="h-full overflow-y-auto overscroll-contain bg-white px-4 py-4 [-webkit-overflow-scrolling:touch]"
            @scroll.passive="onScroll"
          >
            <pre class="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-gray-800">{{ textoPlano }}</pre>
          </div>
          <NatiscrollHint :show="hayMas" />
        </div>

        <!-- PDF embebido (fuera de iOS, donde el visor integrado solo pinta la
             primera página dentro de un iframe). -->
        <div v-else-if="modo === 'pdf'" class="visor-adjunto__documento">
          <iframe :src="url" :title="adjunto?.nombre" class="h-full w-full border-0 bg-white" />
        </div>

        <div v-else class="visor-adjunto__centro" @click.self="$emit('cerrar')">
          <div class="max-w-xs px-6 text-center">
            <DocumentIcon class="mx-auto h-9 w-9 text-white/70" />
            <p class="mt-3 text-sm text-white/90">Este archivo se abre fuera de la app.</p>
          </div>
        </div>

        <!-- ── Barra inferior: tamaño y abrir ── -->
        <div class="visor-adjunto__barra visor-adjunto__barra--abajo" @click.self="$emit('cerrar')">
          <span class="min-w-0 flex-1 truncate text-xs text-white/70">{{ detalle }}</span>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full bg-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/30 disabled:opacity-40 touch-manipulation"
            :disabled="!url"
            @click="abrirFuera"
          >
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
            Abrir
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  ArrowTopRightOnSquareIcon, DocumentIcon, ExclamationTriangleIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useIsIos } from '../../composables/useIsIos'
import { esImagen, esPdf, esTexto, formatearTamano } from '../../utils/adjuntosSoporte'
import { useSoporteStore } from '../../stores/soporte'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** { nombre, mime, bytes, ruta } o, si aún se está subiendo, con `_previsualizacion` */
  adjunto: { type: Object, default: null },
})

const emit = defineEmits(['cerrar'])

const soporte = useSoporteStore()
const isIos = useIsIos()

const abierto = computed(() => props.show)
useBodyScrollLock(abierto)

// El natiscroll solo tiene sentido en el modo texto; en el resto el scrollRef
// no es un contenedor recorrible y el composable simplemente no mide nada.
const { scrollRef, hayMas, onScroll } = useNatiscroll(abierto)

const url = ref('')
const textoPlano = ref('')
const cargando = ref(false)
const fallo = ref('')
const ampliada = ref(false)

const modo = computed(() => {
  const mime = props.adjunto?.mime
  if (esImagen(mime)) return 'imagen'
  if (esTexto(mime)) return 'texto'
  if (esPdf(mime)) return isIos.value ? 'externo' : 'pdf'
  return 'externo'
})

const detalle = computed(() => {
  const partes = []
  if (props.adjunto?.bytes) partes.push(formatearTamano(props.adjunto.bytes))
  if (modo.value === 'imagen') partes.push(ampliada.value ? 'Toca para ajustar' : 'Toca para ampliar')
  return partes.join(' · ')
})

function alternarZoom() {
  ampliada.value = !ampliada.value
}

const MAX_CARACTERES_TEXTO = 20000

watch(() => [props.show, props.adjunto], async () => {
  if (!props.show || !props.adjunto) return

  url.value = ''
  textoPlano.value = ''
  fallo.value = ''
  ampliada.value = false

  // Un adjunto que todavía se está subiendo ya tiene su copia local: no hay
  // nada que pedir al servidor.
  if (props.adjunto._previsualizacion) {
    url.value = props.adjunto._previsualizacion
    return
  }
  // La burbuja ya tenía firmada la miniatura: se reutiliza para que la foto
  // aparezca al instante en vez de esperar otra vuelta al servidor.
  if (props.adjunto._urlFirmada && modo.value === 'imagen') {
    url.value = props.adjunto._urlFirmada
    return
  }
  if (!props.adjunto.ruta) {
    fallo.value = 'Este archivo aún se está enviando.'
    return
  }

  cargando.value = true
  try {
    url.value = await soporte.urlFirmada(props.adjunto.ruta)
    if (modo.value === 'texto') {
      const respuesta = await fetch(url.value)
      if (!respuesta.ok) throw new Error('descarga fallida')
      const contenido = await respuesta.text()
      textoPlano.value = contenido.length > MAX_CARACTERES_TEXTO
        ? `${contenido.slice(0, MAX_CARACTERES_TEXTO)}\n\n… (archivo recortado; ábrelo para verlo completo)`
        : contenido
    }
  } catch {
    fallo.value = 'No se pudo abrir el archivo. Puede que ya no exista.'
  } finally {
    cargando.value = false
  }
}, { immediate: true })

function abrirFuera() {
  if (!url.value) return
  window.open(url.value, '_blank', 'noopener,noreferrer')
}

/*
 * Esc cierra. ModalWrapper mantiene una pila para que solo se cierre la modal
 * de arriba; aquí basta con registrar el listener mientras el visor está
 * abierto, porque siempre es la capa superior: se abre desde el hilo, y nada se
 * abre encima de él.
 */
function alPulsarTecla(evento) {
  if (evento.key === 'Escape' || evento.key === 'Esc') {
    evento.stopPropagation()
    emit('cerrar')
  }
}

watch(() => props.show, (visible) => {
  if (typeof document === 'undefined') return
  if (visible) document.addEventListener('keydown', alPulsarTecla)
  else document.removeEventListener('keydown', alPulsarTecla)
}, { immediate: true })

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', alPulsarTecla)
})
</script>

<style scoped>
.visor-adjunto {
  position: fixed;
  inset: 0;
  z-index: 90;
  width: 100vw;
  /* Orden importante: el navegador se queda con la última que entiende. */
  height: 100vh;
  height: -webkit-fill-available;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
  overscroll-behavior: contain;
  /* Composición en GPU: sin esto, iOS repinta el overlay en cada scroll. */
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.visor-adjunto__barra {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-left: max(0.75rem, env(safe-area-inset-left));
  padding-right: max(0.75rem, env(safe-area-inset-right));
}

.visor-adjunto__barra--arriba {
  padding-top: max(0.75rem, env(safe-area-inset-top));
  padding-bottom: 0.75rem;
}

.visor-adjunto__barra--abajo {
  padding-top: 0.75rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}

.visor-adjunto__centro {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visor-adjunto__lienzo {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 0.5rem;
  /* Ajustada no hay nada que desplazar: se corta el gesto aquí en vez de
     bloquearlo con un listener no pasivo (§6 y §11 del manual iOS). */
  touch-action: none;
}

/* Ampliada: la imagen desborda y el lienzo se convierte en el que hace scroll. */
.visor-adjunto__lienzo--ampliada {
  display: block;
  overflow: auto;
  padding: 0;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /* Ampliada sí se recorre, en los dos ejes. */
  touch-action: pan-x pan-y;
}

.visor-adjunto__documento {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

/* Entrada y salida: se desvanece y crece un pelo, en GPU. */
.visor-adjunto-enter-active,
.visor-adjunto-leave-active {
  transition: opacity 0.18s ease;
}

.visor-adjunto-enter-active .visor-adjunto__lienzo img,
.visor-adjunto-leave-active .visor-adjunto__lienzo img {
  transition: -webkit-transform 0.18s ease;
  transition: transform 0.18s ease;
}

.visor-adjunto-enter-from,
.visor-adjunto-leave-to {
  opacity: 0;
}

.visor-adjunto-enter-from .visor-adjunto__lienzo img,
.visor-adjunto-leave-to .visor-adjunto__lienzo img {
  -webkit-transform: scale3d(0.96, 0.96, 1);
  transform: scale3d(0.96, 0.96, 1);
}

@media (prefers-reduced-motion: reduce) {
  .visor-adjunto-enter-active,
  .visor-adjunto-leave-active,
  .visor-adjunto-enter-active .visor-adjunto__lienzo img,
  .visor-adjunto-leave-active .visor-adjunto__lienzo img {
    transition: none;
  }
}
</style>
