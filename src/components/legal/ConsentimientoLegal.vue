<template>
  <!--
    Autorización para el tratamiento de datos (Ley 1581 de 2012, art. 9: previa, expresa e
    informada). Se pide una vez por versión a cada cuenta con sesión que no la haya dado:
    quien se registró antes de existir la política, quien entró con Google sin pasar por el
    formulario, o todos cuando sube VERSION_LEGAL. Queda constancia en consentimientos_legales
    (migración 051), que es la prueba que la ley obliga a conservar.

    Persistente: sin aceptar no se sigue. La salida es cerrar sesión.
    Sin natiscroll a propósito: el cuerpo son dos líneas y una casilla, no desborda ni en un
    iPhone SE (~560 px útiles con la cabecera y el pie).
  -->
  <ModalWrapper
    :show="visible"
    :z-index="70"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
  >
    <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
      <!-- Móvil: [icono | títulos] (sin X: la decisión es obligatoria) -->
      <div class="sm:hidden flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ShieldCheckIcon class="w-5 h-5 text-[color:var(--brand-primary)]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display font-bold text-white text-base leading-tight">Tus datos, bien cuidados</h3>
          <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5">Antes de seguir</p>
        </div>
      </div>
      <!-- Desktop: icono arriba, textos centrados -->
      <div class="hidden sm:flex flex-col items-center text-center px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ShieldCheckIcon class="w-6 h-6 text-[color:var(--brand-primary)]" />
        </div>
        <h3 class="font-display font-bold text-white text-lg leading-tight">Tus datos, bien cuidados</h3>
        <p class="text-xs text-white/85 leading-snug mt-1">Antes de seguir</p>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-white px-5 sm:px-6 pt-5 pb-4">
      <p class="text-sm leading-relaxed text-slate-700">
        Para usar Natillerapp necesitamos tu autorización para tratar tus datos como explicamos en la
        <router-link :to="{ name: 'PoliticaDatos' }" target="_blank" class="consentimiento__enlace">Política de Tratamiento de Datos</router-link>
        y los
        <router-link :to="{ name: 'Terminos' }" target="_blank" class="consentimiento__enlace">Términos y condiciones</router-link>.
      </p>

      <label class="consentimiento__casilla">
        <input v-model="acepta" type="checkbox" class="consentimiento__check" />
        <span>
          Los leí y los acepto. Si administro una natillera, tengo la autorización de mis socios para registrar sus datos.
        </span>
      </label>

      <p v-if="error" class="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{{ error }}</p>
    </div>

    <!-- La barra de Safari tapa el pie de un modal pegado abajo: se suma al padding (manual iOS §4.1) -->
    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 flex gap-3"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary flex-1" :disabled="guardando" @click="salir">Salir</button>
      <button type="button" class="btn-modal-primary flex-[1.4]" :disabled="!acepta || guardando" @click="aceptar">
        {{ guardando ? 'Guardando…' : 'Aceptar y seguir' }}
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { VERSION_LEGAL, CLAVE_CONSENTIMIENTO_REGISTRO } from '../../legal/responsable'

const authStore = useAuthStore()
const router = useRouter()

const falta = ref(false)
const acepta = ref(false)
const guardando = ref(false)
const error = ref('')
const visible = computed(() => falta.value && !!authStore.user?.id)
useBodyScrollLock(visible)
const { tapado } = useTapadoInferior()

const agente = () => (typeof navigator !== 'undefined' ? navigator.userAgent : null)

function leerCasillaDelRegistro() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CONSENTIMIENTO_REGISTRO) || 'null')
    return guardado?.version === VERSION_LEGAL ? guardado : null
  } catch {
    return null
  }
}

async function registrar(origen) {
  const { data, error: err } = await supabase.rpc('registrar_consentimiento_legal', {
    p_version: VERSION_LEGAL,
    p_origen: origen,
    p_user_agent: agente()
  })
  if (err) throw err
  if (!data?.ok) throw new Error(data?.motivo || 'sin_ok')
}

let turno = 0
async function comprobar(usuarioId) {
  const miTurno = ++turno
  falta.value = false
  acepta.value = false
  error.value = ''
  if (!usuarioId) return
  const { data, error: err } = await supabase
    .from('consentimientos_legales')
    .select('id')
    .eq('usuario_id', usuarioId)
    .eq('version', VERSION_LEGAL)
    .limit(1)
  if (miTurno !== turno) return
  if (err) {
    // Sin la tabla (migración 051 sin aplicar) o sin red no se bloquea la app: se pedirá
    // en la próxima entrada. Bloquear a todos por un fallo nuestro sería peor.
    console.warn('No se pudo comprobar la autorización de datos:', err)
    return
  }
  if ((data || []).length > 0) return

  // Marcó la casilla al registrarse: se deja la constancia sin volver a preguntar.
  if (leerCasillaDelRegistro()) {
    try {
      await registrar('registro')
      localStorage.removeItem(CLAVE_CONSENTIMIENTO_REGISTRO)
      return
    } catch (e) {
      console.warn('No se pudo guardar la autorización del registro; se pedirá de nuevo:', e)
    }
  }
  if (miTurno === turno) falta.value = true
}

watch(() => authStore.user?.id, comprobar, { immediate: true })

async function aceptar() {
  if (!acepta.value || guardando.value) return
  guardando.value = true
  error.value = ''
  try {
    await registrar('aviso')
    falta.value = false
  } catch (e) {
    console.error('Error guardando la autorización de datos:', e)
    error.value = 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

async function salir() {
  falta.value = false
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.consentimiento__enlace { font-weight: 700; color: var(--brand-primary); text-decoration: underline; text-underline-offset: 2px; }
.consentimiento__casilla {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: 1rem;
  padding: 0.875rem;
  border-radius: 0.875rem;
  background: #E8F5E9;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #1f2937;
  cursor: pointer;
  touch-action: manipulation;
}
/* 22 px de casilla dentro de una etiqueta que toda ella es tocable (área > 44 px) */
.consentimiento__check {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  margin-top: 0.0625rem;
  accent-color: var(--brand-primary);
}
</style>
