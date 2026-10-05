<template>
  <!--
    `--tapado-inferior` lo publica ModalWrapper en Safari de iOS (barra de
    direcciones inferior, que no es safe-area); fuera de un modal vale 0.
  -->
  <div
    class="flex-shrink-0 border-t border-borde bg-superficie-tarjeta px-3 pt-3 pb-[calc(max(0.75rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))]"
  >
    <!--
      Solo lectura: se explica el motivo en lugar de dejar un campo muerto
      (RN-08). `textoAccion` ofrece la salida que sí existe —abrir otra
      conversación—, porque desde RN-06 un hilo cerrado no se retoma escribiendo
      en él: un campo bloqueado sin alternativa deja al usuario sin saber qué
      hacer con lo que venía a contar.
    -->
    <div v-if="bloqueado" class="rounded-xl bg-superficie-suave px-3 py-3 ring-1 ring-borde">
      <div class="flex items-start gap-2 text-xs text-texto-secundario">
        <LockClosedIcon class="mt-0.5 h-4 w-4 shrink-0 text-texto-tenue" />
        <p class="min-w-0 flex-1">{{ motivoBloqueo }}</p>
      </div>
      <button
        v-if="textoAccion"
        type="button"
        class="mt-2.5 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border border-marca-tinta px-4 text-sm font-semibold text-marca-tinta transition hover:bg-[#1B5E37]/5 touch-manipulation sm:w-auto"
        @click="$emit('accion')"
      >
        <PlusIcon class="mr-1.5 h-4 w-4" />
        {{ textoAccion }}
      </button>
    </div>

    <template v-else>
      <!-- Sin conexión: se avisa antes de escribir, no después de fallar -->
      <div v-if="sinConexion" class="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 oscuro:bg-amber-500/15 px-3 py-2 text-xs text-amber-800 oscuro:text-amber-300 ring-1 ring-amber-200 oscuro:ring-amber-500/30">
        <ExclamationTriangleIcon class="h-4 w-4 shrink-0" />
        <span>Sin conexión. Lo que escribas se enviará solo cuando vuelva la red.</span>
      </div>

      <!--
        Adjuntos elegidos, antes de subir. Las imágenes se ven: comprobar de un
        vistazo que la captura es la correcta evita el mensaje de después
        («perdón, era la otra pantalla»).
      -->
      <ul v-if="archivos.length" class="mb-2 flex flex-wrap gap-2">
        <li
          v-for="(elegido, indice) in archivos"
          :key="`${elegido.archivo.name}-${indice}`"
          class="relative"
        >
          <div
            v-if="elegido.previa"
            class="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-borde"
          >
            <img
              :src="elegido.previa"
              :alt="elegido.archivo.name"
              :class="['h-full w-full object-cover', elegido.preparando ? 'opacity-60' : '']"
            />
            <span
              v-if="elegido.preparando"
              class="absolute inset-0 flex items-center justify-center bg-black/25"
              aria-label="Preparando el archivo"
            >
              <svg class="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          </div>
          <div
            v-else
            class="flex h-16 max-w-[10rem] items-center gap-1.5 rounded-xl bg-superficie-hundida px-2.5 text-xs text-texto-medio ring-1 ring-borde"
          >
            <PaperClipIcon class="h-4 w-4 shrink-0 text-texto-suave" />
            <span class="min-w-0 flex-1 truncate">{{ elegido.archivo.name }}</span>
          </div>

          <!-- Botón de quitar: área táctil de 44 px lograda con un padding
               transparente; el círculo visible es más pequeño para no tapar la
               miniatura. -->
          <button
            type="button"
            class="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center text-texto-suave touch-manipulation"
            :aria-label="`Quitar ${elegido.archivo.name}`"
            @click="quitarArchivo(indice)"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-superficie-tarjeta shadow ring-1 ring-borde transition hover:bg-superficie-hundida">
              <XMarkIcon class="h-3.5 w-3.5" />
            </span>
          </button>
        </li>
      </ul>

      <div class="relative flex items-end gap-2">
        <!--
          Respuestas predefinidas (solo soporte): al escribir «/» se abre la lista
          de comandos y, al elegir uno, sus variantes. @mousedown.prevent mantiene
          el foco en el campo: en iOS, perderlo cierra el teclado a cada toque.
        -->
        <div
          v-if="menuAbierto"
          ref="menu"
          id="menu-respuestas"
          role="listbox"
          :aria-label="comandoElegido ? `Variantes de /${comandoElegido.comando}` : 'Respuestas predefinidas'"
          class="absolute inset-x-0 bottom-full z-20 mb-2 max-h-72 overflow-y-auto overscroll-contain rounded-2xl bg-superficie-tarjeta py-1.5 shadow-lg ring-1 ring-borde [-webkit-overflow-scrolling:touch]"
        >
          <template v-if="!comandoElegido">
            <p class="px-3 pb-1 pt-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-texto-tenue">Respuestas predefinidas</p>
            <p v-if="!comandosFiltrados.length" class="px-3 py-2.5 text-sm text-texto-suave">
              Ningún comando empieza por «/{{ consultaBarra }}».
            </p>
            <button
              v-for="(respuesta, indice) in comandosFiltrados"
              :key="respuesta.comando"
              type="button"
              role="option"
              :aria-selected="indice === indiceActivo"
              :data-indice="indice"
              :class="[
                'flex min-h-[2.75rem] w-full items-center gap-2 px-3 py-2 text-left transition touch-manipulation',
                indice === indiceActivo ? 'bg-[#1B5E37]/10' : 'hover:bg-superficie-suave',
              ]"
              @mousedown.prevent
              @mouseenter="indiceActivo = indice"
              @click="elegirComando(respuesta)"
            >
              <span class="shrink-0 font-mono text-sm font-semibold text-marca-tinta">/{{ respuesta.comando }}</span>
              <span class="min-w-0 flex-1 truncate text-xs text-texto-suave">{{ respuesta.descripcion }}</span>
              <span class="shrink-0 text-[0.6875rem] text-texto-tenue">{{ respuesta.variantes.length }}</span>
            </button>
          </template>

          <template v-else>
            <div class="flex items-center gap-1 px-1.5 pb-1">
              <button
                type="button"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-texto-suave transition hover:bg-superficie-hundida touch-manipulation"
                aria-label="Volver a los comandos"
                @mousedown.prevent
                @click="volverAComandos"
              >
                <ChevronLeftIcon class="h-4 w-4" />
              </button>
              <p class="min-w-0 flex-1 truncate text-xs text-texto-suave">
                <span class="font-mono font-semibold text-marca-tinta">/{{ comandoElegido.comando }}</span>
                · elige una variante
              </p>
            </div>
            <button
              v-for="(variante, indice) in variantesRellenas"
              :key="indice"
              type="button"
              role="option"
              :aria-selected="indice === indiceActivo"
              :data-indice="indice"
              :class="[
                'block min-h-[2.75rem] w-full border-t border-borde-suave px-3 py-2.5 text-left transition touch-manipulation',
                indice === indiceActivo ? 'bg-[#1B5E37]/10' : 'hover:bg-superficie-suave',
              ]"
              @mousedown.prevent
              @mouseenter="indiceActivo = indice"
              @click="insertarRespuesta(variante)"
            >
              <span class="block text-[0.6875rem] font-semibold text-texto-tenue">Variante {{ indice + 1 }}</span>
              <span class="mt-0.5 block text-sm leading-snug text-texto">{{ variante }}</span>
            </button>
          </template>
        </div>

        <button
          v-if="respuestas.length"
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-texto-suave transition hover:bg-superficie-hundida disabled:opacity-40 touch-manipulation"
          :class="menuAbierto ? 'bg-[#1B5E37]/10 text-marca-tinta' : ''"
          aria-label="Respuestas predefinidas"
          title="Respuestas predefinidas (escribe /)"
          :disabled="enviando"
          @mousedown.prevent
          @click="abrirRespuestas"
        >
          <BoltIcon class="h-5 w-5" />
        </button>

        <button
          v-if="permiteAdjuntos"
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-texto-suave transition hover:bg-superficie-hundida disabled:opacity-40 touch-manipulation"
          aria-label="Adjuntar archivo"
          :disabled="enviando || archivos.length >= MAX_ADJUNTOS"
          @click="entradaArchivos?.click()"
        >
          <PaperClipIcon class="h-5 w-5" />
        </button>

        <input
          ref="entradaArchivos"
          type="file"
          class="hidden"
          multiple
          :accept="MIMES_SELECTOR.join(',')"
          @change="elegirArchivos"
        />

        <!--
          text-base (16 px) es obligatorio: con menos, iOS hace zoom al enfocar el
          campo y deja la pantalla descolocada (RNF-02).
          No se deshabilita durante el envío: un campo `disabled` pierde el foco,
          iOS cierra el teclado y el focus() posterior (fuera del gesto) no lo
          reabre. El doble envío lo impide `puedeEnviar`, que mira `enviando`, y
          `readonly` evita que lo tecleado mientras tanto se pierda al limpiar el
          borrador cuando el envío se confirma (readonly conserva el foco).
        -->
        <textarea
          ref="campo"
          :value="modelValue"
          rows="1"
          :maxlength="MAX_CUERPO"
          :placeholder="marcador"
          class="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-borde-fuerte bg-superficie-tarjeta px-4 py-2.5 text-base leading-snug text-texto-fuerte outline-none transition placeholder:text-texto-tenue focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:ring-2 focus:ring-[#1B5E37]/30"
          enterkeyhint="send"
          :readonly="enviando"
          :aria-busy="enviando ? 'true' : 'false'"
          :aria-expanded="menuAbierto ? 'true' : 'false'"
          :aria-controls="menuAbierto ? 'menu-respuestas' : undefined"
          :aria-autocomplete="respuestas.length ? 'list' : undefined"
          @input="alEscribir"
          @keydown="alTecla"
          @click="detectarBarra"
          @focus="cancelarCierreMenu"
          @blur="cerrarMenuAlSalir"
        />

        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B5E37] text-white shadow-sm transition hover:bg-[#155a32] disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
          aria-label="Enviar mensaje"
          :disabled="!puedeEnviar"
          @click="intentarEnviar"
        >
          <PaperAirplaneIcon v-if="!enviando" class="h-5 w-5" />
          <CargaBoton v-else pequena />
        </button>
      </div>

      <p v-if="cercaDelLimite" class="mt-1 px-1 text-right text-[0.6875rem] text-texto-suave">
        {{ modelValue.length }} / {{ MAX_CUERPO }}
      </p>
    </template>
  </div>
</template>

<script setup>
import CargaBoton from '../carga/CargaBoton.vue'
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  BoltIcon, ChevronLeftIcon, ExclamationTriangleIcon, LockClosedIcon, PaperAirplaneIcon,
  PaperClipIcon, PlusIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import { MAX_ADJUNTOS, MIMES_SELECTOR, useSoporteStore } from '../../stores/soporte'
import { comprimirImagen, crearVistaPrevia, esHeic, esImagen, revocarVistasPrevias } from '../../utils/adjuntosSoporte'
import { useNotificationStore } from '../../stores/notifications'
import { filtrarComandos, rellenarRespuesta } from '../../utils/respuestasSoporte'

const MAX_CUERPO = 4000

const props = defineProps({
  modelValue: { type: String, default: '' },
  enviando: { type: Boolean, default: false },
  bloqueado: { type: Boolean, default: false },
  motivoBloqueo: { type: String, default: 'Esta conversación está archivada y no admite mensajes nuevos.' },
  /** Si viene informado, se ofrece una salida bajo el motivo del bloqueo. */
  textoAccion: { type: String, default: '' },
  permiteAdjuntos: { type: Boolean, default: true },
  marcador: { type: String, default: 'Escribe tu mensaje…' },
  minimo: { type: Number, default: 1 },
  /** Respuestas predefinidas (`/comando`). Vacío = sin comandos: así queda en la pantalla del usuario. */
  respuestas: { type: Array, default: () => [] },
  /** Valores de los marcadores de las respuestas, p. ej. { nombre: 'María' }. */
  variablesRespuesta: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'enviar', 'accion'])

const soporte = useSoporteStore()
const notificaciones = useNotificationStore()

const campo = ref(null)
const entradaArchivos = ref(null)
const archivos = ref([])   // { archivo: File, previa: string|null }

// Handlers con nombre: los anónimos no se pueden quitar, y este componente es un
// modal que se monta y desmonta. Con funciones inline cada apertura del redactor
// dejaba dos listeners más colgados en window para siempre.
const sinConexion = ref(typeof navigator !== 'undefined' && navigator.onLine === false)
const alConectar = () => { sinConexion.value = false }
const alDesconectar = () => { sinConexion.value = true }
if (typeof window !== 'undefined') {
  window.addEventListener('online', alConectar)
  window.addEventListener('offline', alDesconectar)
}

const preparandoAdjuntos = computed(() => archivos.value.some((a) => a.preparando))

const puedeEnviar = computed(() =>
  !props.enviando
  && !preparandoAdjuntos.value
  && props.modelValue.trim().length >= props.minimo)

const cercaDelLimite = computed(() => props.modelValue.length > MAX_CUERPO - 200)

function alEscribir(evento) {
  emit('update:modelValue', evento.target.value)
  ajustarAlto(evento.target)
  comandoElegido.value = null
  detectarBarra()
}

// El campo crece con el texto hasta el máximo de la clase (max-h-32).
function ajustarAlto(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// ---- Respuestas predefinidas ----------------------------------------------

const menu = ref(null)
/** Lo escrito tras la «/» junto al cursor; null si el cursor no está en un comando. */
const consultaBarra = ref(null)
const comandoElegido = ref(null)
const indiceActivo = ref(0)

const comandosFiltrados = computed(() => filtrarComandos(consultaBarra.value || ''))
const variantesRellenas = computed(() =>
  (comandoElegido.value?.variantes ?? []).map((v) => rellenarRespuesta(v, props.variablesRespuesta)))
const opcionesMenu = computed(() => (comandoElegido.value ? variantesRellenas.value : comandosFiltrados.value))
const menuAbierto = computed(() =>
  props.respuestas.length > 0 && !props.bloqueado && consultaBarra.value !== null)

/** Posición de la «/» del comando que se está escribiendo, o -1. */
function inicioBarra() {
  const el = campo.value
  if (!el) return -1
  const antes = el.value.slice(0, el.selectionStart ?? el.value.length)
  const encontrado = antes.match(/(^|\s)\/([\p{L}\p{N}]*)$/u)
  return encontrado ? antes.length - encontrado[2].length - 1 : -1
}

function detectarBarra() {
  if (!props.respuestas.length) return
  const inicio = inicioBarra()
  const el = campo.value
  const nueva = inicio < 0 ? null : el.value.slice(inicio + 1, el.selectionStart ?? el.value.length)
  if (nueva !== consultaBarra.value) indiceActivo.value = 0
  consultaBarra.value = nueva
}

function cerrarMenu() {
  cancelarCierreMenu()
  consultaBarra.value = null
  comandoElegido.value = null
}

// Al salir del campo el menú se cierra con un respiro: en Safari de iOS el toque
// en una opción puede quitarle el foco al campo antes de que llegue el clic, y
// cerrar en el acto se comería la elección.
let temporizadorCierre = null
function cerrarMenuAlSalir() {
  cancelarCierreMenu()
  temporizadorCierre = setTimeout(cerrarMenu, 200)
}
function cancelarCierreMenu() {
  clearTimeout(temporizadorCierre)
  temporizadorCierre = null
}

// Enviado o vaciado desde fuera: no queda ningún comando que completar.
watch(() => props.modelValue, (texto) => { if (!texto) cerrarMenu() })

function elegirComando(respuesta) {
  comandoElegido.value = respuesta
  indiceActivo.value = 0
  if (menu.value) menu.value.scrollTop = 0
}

function volverAComandos() {
  comandoElegido.value = null
  indiceActivo.value = 0
}

/** Cambia «/comando» por el texto elegido y deja el cursor al final de lo insertado. */
function insertarRespuesta(texto) {
  const el = campo.value
  const inicio = inicioBarra()
  if (!el || inicio < 0) return
  const fin = el.selectionStart ?? el.value.length
  const nuevo = el.value.slice(0, inicio) + texto + el.value.slice(fin)
  emit('update:modelValue', nuevo.slice(0, MAX_CUERPO))
  cerrarMenu()
  nextTick(() => {
    const posicion = Math.min(inicio + texto.length, MAX_CUERPO)
    el.focus()
    el.setSelectionRange(posicion, posicion)
    ajustarAlto(el)
  })
}

/** Botón del rayo: escribe la «/» donde está el cursor para abrir el menú. */
function abrirRespuestas() {
  const el = campo.value
  if (!el) return
  if (menuAbierto.value) {
    el.focus()
    return
  }
  const cursor = el.selectionStart ?? el.value.length
  const antes = el.value.slice(0, cursor)
  const separador = antes && !/\s$/.test(antes) ? ' ' : ''
  const nuevo = `${antes}${separador}/${el.value.slice(cursor)}`
  emit('update:modelValue', nuevo)
  nextTick(() => {
    const posicion = antes.length + separador.length + 1
    el.focus()
    el.setSelectionRange(posicion, posicion)
    detectarBarra()
  })
}

function moverActivo(paso) {
  const total = opcionesMenu.value.length
  if (!total) return
  indiceActivo.value = (indiceActivo.value + paso + total) % total
  nextTick(() => {
    // Desplazamiento manual dentro del menú: scrollIntoView movería también la
    // página o el modal en Safari de iOS.
    const lista = menu.value
    const fila = lista?.querySelector(`[data-indice="${indiceActivo.value}"]`)
    if (!lista || !fila) return
    if (fila.offsetTop < lista.scrollTop) lista.scrollTop = fila.offsetTop
    else if (fila.offsetTop + fila.offsetHeight > lista.scrollTop + lista.clientHeight) {
      lista.scrollTop = fila.offsetTop + fila.offsetHeight - lista.clientHeight
    }
  })
}

function alTecla(evento) {
  if (menuAbierto.value) {
    if (evento.key === 'ArrowDown') { evento.preventDefault(); moverActivo(1); return }
    if (evento.key === 'ArrowUp') { evento.preventDefault(); moverActivo(-1); return }
    if (evento.key === 'Escape') {
      evento.preventDefault()
      if (comandoElegido.value) volverAComandos()
      else cerrarMenu()
      return
    }
    if ((evento.key === 'Enter' || evento.key === 'Tab') && !evento.shiftKey && opcionesMenu.value.length) {
      evento.preventDefault()
      if (comandoElegido.value) insertarRespuesta(variantesRellenas.value[indiceActivo.value])
      else elegirComando(comandosFiltrados.value[indiceActivo.value])
      return
    }
  }
  // Las flechas mueven el cursor: puede entrar o salir de un «/comando».
  if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') nextTick(detectarBarra)
  if (evento.key === 'Enter' && !evento.shiftKey && !evento.ctrlKey && !evento.altKey && !evento.metaKey) {
    evento.preventDefault()
    intentarEnviar()
  }
}

/*
 * El archivo se prepara al elegirlo, no al enviarlo.
 *
 * Comprimir en el momento del envío dejaba el mensaje escrito esperando a que
 * una foto de varios megas se encogiera y subiera. Haciéndolo aquí, mientras el
 * usuario todavía está escribiendo, al pulsar enviar el archivo ya está listo y
 * el envío es inmediato. De paso, el límite de 5 MB se mide sobre lo que de
 * verdad va a viajar.
 */
function elegirArchivos(evento) {
  const elegidos = Array.from(evento.target.files ?? [])
  evento.target.value = ''

  for (const archivo of elegidos) {
    if (archivos.value.length >= MAX_ADJUNTOS) {
      notificaciones.alerta(`Puedes adjuntar hasta ${MAX_ADJUNTOS} archivos por mensaje.`)
      break
    }
    // El tipo se comprueba antes de nada, indicando el motivo (caso borde 8).
    const problema = soporte.validarTipoArchivo(archivo)
    if (problema) {
      notificaciones.alerta(problema)
      continue
    }

    /*
     * `reactive` y no un objeto suelto: `prepararImagen` lo modifica al terminar de
     * comprimir. Sobre un objeto normal (guardado en la lista como está) Vue no se
     * enteraba de `preparando = false`: la miniatura se quedaba «cargando» y el botón de
     * enviar bloqueado para siempre, aunque la foto ya estuviera lista.
     */
    const entrada = reactive({ archivo, previa: crearVistaPrevia(archivo), preparando: esImagen(archivo.type) })
    archivos.value.push(entrada)

    if (entrada.preparando) prepararImagen(entrada)
    else rechazarSiPesaDemasiado(entrada)
  }
}

async function prepararImagen(entrada) {
  try {
    const listo = await comprimirImagen(entrada.archivo)
    // El usuario pudo quitarlo mientras se comprimía.
    if (!archivos.value.includes(entrada)) return
    entrada.archivo = listo
    if (esHeic(listo.type)) avisarHeicSinConvertir(entrada)
  } finally {
    entrada.preparando = false
    rechazarSiPesaDemasiado(entrada)
  }
}

/*
 * El navegador no supo decodificar la foto HEIC (Safari < 17, Chrome). Un HEIC
 * se envía como estaba —el servidor lo admite—, pero se avisa de que quizá no se
 * vea en todos lados; HEIF el servidor no lo admite, así que se quita.
 */
function avisarHeicSinConvertir(entrada) {
  const nombre = entrada.archivo.name
  if (entrada.archivo.type === 'image/heic') {
    notificaciones.alerta(`No pudimos convertir «${nombre}» a JPG: se enviará como HEIC y puede que no se vea en todos los equipos.`)
    return
  }
  const indice = archivos.value.indexOf(entrada)
  if (indice >= 0) quitarArchivo(indice)
  notificaciones.alerta(`No pudimos convertir «${nombre}». Elige la foto desde la galería o guárdala como JPG.`)
}

function rechazarSiPesaDemasiado(entrada) {
  const problema = soporte.validarTamanoArchivo(entrada.archivo)
  if (!problema) return
  const indice = archivos.value.indexOf(entrada)
  if (indice >= 0) quitarArchivo(indice)
  notificaciones.alerta(problema)
}

function quitarArchivo(indice) {
  const [fuera] = archivos.value.splice(indice, 1)
  revocarVistasPrevias([fuera?.previa])
}

function soltarVistasPrevias() {
  revocarVistasPrevias(archivos.value.map((a) => a.previa))
}

// Las miniaturas son objetos en memoria del navegador: si no se sueltan, se
// quedan hasta recargar la página. Y los listeners de conexión se retiran aquí
// para que no se acumulen en cada apertura del redactor.
onBeforeUnmount(() => {
  cancelarCierreMenu()
  soltarVistasPrevias()
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', alConectar)
    window.removeEventListener('offline', alDesconectar)
  }
})

/*
 * Si el foco estaba en el campo al enviar (Enter), se le asegura al terminar;
 * pulsando el botón de enviar el foco estaba en el botón, y ahí no lo robamos.
 * El campo ya no se deshabilita, así que normalmente el foco no llega a irse y
 * el teclado de iOS sigue abierto; esto cubre el caso de que algo lo quite.
 */
let teniaFoco = false

function intentarEnviar() {
  if (!puedeEnviar.value) return
  teniaFoco = typeof document !== 'undefined' && document.activeElement === campo.value
  emit('enviar', { cuerpo: props.modelValue.trim(), archivos: archivos.value.map((a) => a.archivo) })
}

watch(() => props.enviando, (enviandoAhora, enviandoAntes) => {
  if (!enviandoAntes || enviandoAhora || !teniaFoco) return
  teniaFoco = false
  // Vale igual cuando el envío falla y el texto vuelve al campo.
  nextTick(() => {
    if (document.activeElement !== campo.value) campo.value?.focus()
  })
})

/** El padre la llama cuando el envío se confirma: el texto solo se borra entonces. */
function limpiar() {
  // Las vistas previas locales ya no hacen falta: el hilo pinta las suyas con
  // el mensaje recién enviado.
  soltarVistasPrevias()
  archivos.value = []
  if (campo.value) campo.value.style.height = 'auto'
}

function enfocar() {
  campo.value?.focus()
}

defineExpose({ limpiar, enfocar })
</script>
