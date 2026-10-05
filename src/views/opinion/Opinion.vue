<template>
  <div class="mx-auto max-w-xl space-y-5 pb-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton to="/dashboard" :inline="true" />
          <div class="ds-page-header__icon">
            <ChatBubbleBottomCenterTextIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">Tu opinión</h1>
            <p class="ds-page-header__sub hidden sm:block">Cuéntanos cómo te ha ido con Natillerapp</p>
          </div>
        </div>
      </div>
    </header>

    <CargaCaja v-if="cargando" texto="Abriendo tu opinión" />

    <section v-else class="rounded-2xl border border-borde bg-superficie-tarjeta p-4 shadow-sm sm:p-6">
      <h2 class="font-display text-lg font-bold text-texto-fuerte">¿Cómo ha sido tu experiencia?</h2>

      <div class="mt-4 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Calificación de 1 a 5">
        <button
          v-for="c in CARAS"
          :key="c.nota"
          type="button"
          role="radio"
          :aria-checked="nota === c.nota"
          :aria-label="`${c.nota} de 5: ${c.texto}`"
          class="flex min-h-[72px] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-colors"
          :class="nota === c.nota
            ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-marca-suave'
            : 'border-borde bg-superficie-tarjeta hover:border-[#1B5E37]/40 oscuro:hover:border-marca-tinta/40'"
          @click="elegirNota(c.nota)"
        >
          <span class="text-2xl leading-none sm:text-3xl" aria-hidden="true">{{ c.cara }}</span>
          <span class="text-[11px] font-semibold" :class="nota === c.nota ? 'text-marca-tinta' : 'text-texto-suave'">{{ c.texto }}</span>
        </button>
      </div>

      <p v-if="notaGuardada" class="mt-3 flex items-center gap-1.5 text-sm font-medium text-marca-tinta">
        <CheckCircleIcon class="h-4 w-4 flex-shrink-0" />
        Guardamos tu calificación. ¡Gracias!
      </p>

      <label for="opinion-comentario" class="mt-5 block text-sm font-semibold text-texto">
        ¿Quieres contarnos algo más? <span class="font-normal text-texto-suave">(opcional)</span>
      </label>
      <!-- 16 px: con menos, iOS hace zoom al enfocar -->
      <textarea
        id="opinion-comentario"
        v-model="comentario"
        rows="5"
        maxlength="2000"
        class="mt-2 w-full rounded-xl border border-borde-fuerte px-3 py-2.5 text-base text-texto-fuerte focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
        placeholder="Qué te ha gustado, qué te ha costado o qué te gustaría que tuviera"
      />
      <p class="mt-1 text-right text-xs text-texto-tenue">{{ comentario.length }}/2000</p>

      <p v-if="error" class="mt-2 text-sm font-medium text-red-700 oscuro:text-red-300">{{ error }}</p>

      <button
        type="button"
        class="btn-modal-primary mt-4 w-full"
        :disabled="!nota || guardando"
        @click="guardarComentario"
      >
        <CargaBoton v-if="guardando" pequena />
        {{ guardando ? 'Enviando…' : comentarioGuardado ? 'Actualizar comentario' : 'Enviar comentario' }}
      </button>
      <p v-if="comentarioGuardado" class="mt-3 text-center text-sm text-texto-secundario">
        Recibimos tu comentario. Lo leeremos con calma.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChatBubbleBottomCenterTextIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import CargaBoton from '../../components/carga/CargaBoton.vue'
import { supabase } from '../../lib/supabase'

const CARAS = [
  { nota: 1, cara: '😞', texto: 'Mala' },
  { nota: 2, cara: '😕', texto: 'Regular' },
  { nota: 3, cara: '😐', texto: 'Normal' },
  { nota: 4, cara: '🙂', texto: 'Buena' },
  { nota: 5, cara: '🤩', texto: 'Excelente' }
]

const route = useRoute()
const cargando = ref(true)
const guardando = ref(false)
const nota = ref(null)
const comentario = ref('')
const notaGuardada = ref(false)
const comentarioGuardado = ref(false)
const error = ref('')

// El enlace del correo trae el id del envío; el de prueba trae «prueba» y cuenta como suelto.
const correoId = /^[0-9a-f-]{36}$/i.test(String(route.query.c || '')) ? String(route.query.c) : null
let usuarioId = null

async function guardar(campos) {
  const { error: e } = await supabase
    .from('opiniones_plataforma')
    .upsert({ user_id: usuarioId, correo_id: correoId, ...campos }, { onConflict: 'user_id,correo_id' })
  if (e) throw e
}

async function elegirNota(n) {
  nota.value = n
  error.value = ''
  try {
    await guardar({ nota: n })
    notaGuardada.value = true
  } catch (e) {
    error.value = 'No pudimos guardar tu calificación. Intenta de nuevo.'
    console.error('Error guardando la nota:', e)
  }
}

async function guardarComentario() {
  if (!nota.value) return
  guardando.value = true
  error.value = ''
  try {
    await guardar({ nota: nota.value, comentario: comentario.value.trim() || null })
    notaGuardada.value = true
    comentarioGuardado.value = true
  } catch (e) {
    error.value = 'No pudimos enviar tu comentario. Intenta de nuevo.'
    console.error('Error guardando el comentario:', e)
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  usuarioId = user?.id ?? null

  // Si ya había opinado sobre este correo, se muestra lo suyo para que lo corrija.
  let consulta = supabase.from('opiniones_plataforma').select('nota, comentario').eq('user_id', usuarioId)
  consulta = correoId ? consulta.eq('correo_id', correoId) : consulta.is('correo_id', null)
  const { data: previa } = await consulta.maybeSingle()
  if (previa) {
    nota.value = previa.nota
    comentario.value = previa.comentario || ''
    comentarioGuardado.value = !!previa.comentario
  }
  cargando.value = false

  // La carita que tocó en el correo se guarda al llegar: cuenta aunque no escriba nada.
  const desdeCorreo = Number(route.query.nota)
  if (desdeCorreo >= 1 && desdeCorreo <= 5) await elegirNota(desdeCorreo)
})
</script>
