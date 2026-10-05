<template>
  <!--
    Página del enlace que el admin comparte en el grupo de WhatsApp. El socio entra con su
    cuenta de siempre (no hay un inicio de sesión aparte para socios) y escribe su
    teléfono: si coincide con un socio de la natillera, queda una solicitud que el admin
    aprueba viendo con qué cuenta se pidió. Hasta entonces no ve nada.
  -->
  <div class="unirme">
    <div class="unirme__tarjeta">
      <header class="unirme__cabecera">
        <span class="unirme__icono" aria-hidden="true">
          <UserGroupIcon class="h-7 w-7" />
        </span>
        <p class="unirme__overline">Invitación</p>
        <h1 class="unirme__titulo">
          {{ natilleraNombre || (cargandoInfo ? 'Cargando…' : 'Natillera') }}
        </h1>
        <p class="unirme__sub">Vincula tu cuenta para ver tu estado de cuenta desde la app</p>
      </header>

      <div class="unirme__cuerpo">
        <!-- Cargando -->
        <CargaCaja v-if="cargandoInfo" texto="Cargando invitación" />

        <!-- Enlace que no existe o que el admin ya cambió -->
        <div v-else-if="!natilleraNombre" class="text-center">
          <p class="font-display text-lg font-bold text-texto-fuerte">Este enlace ya no funciona</p>
          <p class="mt-1 text-sm text-texto-suave">
            Puede que el administrador lo haya cambiado. Pídele el enlace nuevo.
          </p>
          <router-link to="/" class="ds-btn ds-btn--secondary mt-5 w-full">Ir al inicio</router-link>
        </div>

        <!--
          Solicitud enviada: el admin la aprueba viendo con qué cuenta se pidió. Es lo que
          impide que alguien se vincule con el celular de otro socio.
        -->
        <div v-else-if="resultado?.ok && resultado.estado === 'pendiente'" class="text-center" aria-live="polite">
          <span class="unirme__check unirme__check--pendiente" aria-hidden="true">
            <ClockIcon class="h-8 w-8" />
          </span>
          <p class="mt-3 font-display text-xl font-bold text-texto-fuerte">¡Solicitud enviada, {{ primerNombre(resultado.socio) }}!</p>
          <p class="mt-1 text-sm leading-relaxed text-texto-secundario">
            El administrador de <strong>{{ resultado.natillera }}</strong> tiene que aprobarla.
            Cuando lo haga, verás tu estado de cuenta en la pestaña «Como socio» del inicio.
          </p>
          <button type="button" class="ds-btn ds-btn--secondary mt-5 w-full" @click="irAlInicio">Entendido</button>
        </div>

        <!-- Vinculado (ya estaba aprobado) -->
        <div v-else-if="resultado?.ok" class="text-center" aria-live="polite">
          <span class="unirme__check" aria-hidden="true">
            <CheckIcon class="h-8 w-8" />
          </span>
          <p class="mt-3 font-display text-xl font-bold text-texto-fuerte">¡Listo, {{ primerNombre(resultado.socio) }}!</p>
          <p class="mt-1 text-sm text-texto-secundario">Tu cuenta ya está vinculada como socio de <strong>{{ resultado.natillera }}</strong>.</p>
          <p class="mt-4 text-xs text-texto-suave">Tu estado de cuenta está en la pestaña «Como socio» del inicio.</p>
          <button type="button" class="ds-btn ds-btn--primary mt-5 w-full" @click="irAlInicio">Entrar a la app</button>
        </div>

        <!-- Sin sesión: primero entrar (o crear la cuenta) y se vuelve aquí solo -->
        <div v-else-if="!authStore.isAuthenticated">
          <p class="text-sm leading-relaxed text-texto-secundario">
            Para vincularte entra con tu cuenta de Natillerapp. Si todavía no tienes, créala:
            es gratis y toma un minuto.
          </p>
          <div class="mt-5 space-y-2.5">
            <button type="button" class="ds-btn ds-btn--primary w-full" @click="irA('Login')">Iniciar sesión</button>
            <button type="button" class="ds-btn ds-btn--secondary w-full" @click="irA('Register')">Crear mi cuenta</button>
          </div>
        </div>

        <!-- Con sesión: el teléfono -->
        <form v-else @submit.prevent="vincular">
          <label for="unirme-telefono" class="ds-label">Tu número de WhatsApp</label>
          <input
            id="unirme-telefono"
            v-model="telefono"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="300 123 4567"
            class="ds-input"
            :class="{ 'ds-input--error': error }"
            :disabled="vinculando"
            @input="error = null"
          />
          <p class="mt-1.5 text-xs text-texto-suave">El número con el que usas WhatsApp: 10 dígitos, o con + y el indicativo si es de otro país.</p>

          <!-- El aviso tiene título: «no está registrado» es lo que más pasa y debe verse -->
          <div v-if="error" class="unirme__error" role="alert">
            <ExclamationTriangleIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
            <div class="min-w-0">
              <p v-if="error.titulo" class="font-bold">{{ error.titulo }}</p>
              <p>{{ error.texto }}</p>
            </div>
          </div>

          <button type="submit" class="ds-btn ds-btn--primary mt-5 w-full" :disabled="vinculando || !telefono.trim()">
            {{ vinculando ? 'Vinculando…' : 'Vincularme' }}
          </button>

          <p class="mt-4 text-center text-xs text-texto-suave">
            Entraste como <strong class="text-texto-medio">{{ authStore.user?.email }}</strong>.
            <button type="button" class="unirme__enlace" @click="cambiarCuenta">¿No eres tú?</button>
          </p>
        </form>
      </div>
    </div>

    <p class="mt-5 text-center text-xs font-semibold tracking-wide text-marca-tinta/70">Natillerapp</p>
    <p class="mt-2 text-center text-xs text-texto-suave">
      <router-link :to="{ name: 'PoliticaDatos' }" class="unirme__legal">Tratamiento de datos</router-link>
      ·
      <router-link :to="{ name: 'Terminos' }" class="unirme__legal">Términos</router-link>
    </p>

    <!-- Vincularse envía el celular: la autorización va antes (Ley 1581) -->
    <ConsentimientoLegal v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckIcon, ClockIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import { guardarDestinoPendiente, resolvePostLoginLocation } from '../../utils/postLoginRoute'
import ConsentimientoLegal from '../../components/legal/ConsentimientoLegal.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'

const props = defineProps({
  codigo: { type: String, required: true }
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const cargandoInfo = ref(true)
const natilleraNombre = ref('')
const telefono = ref('')
const vinculando = ref(false)
const error = ref(null) // { titulo, texto }
const resultado = ref(null)

const primerNombre = nombre => (nombre || '').trim().split(/\s+/)[0] || ''

async function cargarInfo() {
  cargandoInfo.value = true
  try {
    // La sesión inicial puede no haberse resuelto aún si se abrió el enlace en frío.
    if (!authStore.initialSessionResolved) {
      await Promise.race([authStore.initialSessionReady, new Promise(r => setTimeout(r, 3000))])
    }
    const { data, error: err } = await supabase.rpc('info_invitacion_natillera', { p_codigo: props.codigo })
    if (err) throw err
    natilleraNombre.value = data?.[0]?.natillera_nombre || ''
  } catch (e) {
    console.error('Error cargando la invitación:', e)
    natilleraNombre.value = ''
  } finally {
    cargandoInfo.value = false
  }
}

onMounted(cargarInfo)

// Al volver del login (también el de Google) se regresa a este mismo enlace.
function irA(nombreRuta) {
  guardarDestinoPendiente(route.fullPath)
  router.push({ name: nombreRuta })
}

async function cambiarCuenta() {
  guardarDestinoPendiente(route.fullPath)
  await authStore.logout()
  router.push({ name: 'Login' })
}

const MENSAJES = {
  telefono_invalido: { titulo: 'Número incompleto', texto: 'Escribe tu número de WhatsApp completo: 10 dígitos, o con + y el indicativo si es de otro país.' },
  no_encontrado: { titulo: 'Ese número no está en esta natillera', texto: 'Revisa que sea tu número de WhatsApp. Si lo cambiaste, pídele al administrador que lo actualice.' },
  demasiados_intentos: { titulo: 'Demasiados intentos', texto: 'Espera una hora y vuelve a probar, o habla con el administrador.' },
  vinculado_a_otro: { titulo: 'Ya está vinculado', texto: 'Ese socio ya tiene otra cuenta. Habla con el administrador para que lo revise.' },
  codigo_invalido: { titulo: 'Enlace vencido', texto: 'Pídele al administrador el enlace nuevo.' },
  sin_sesion: { titulo: 'Tu sesión se cerró', texto: 'Vuelve a iniciarla.' }
}
const ERROR_GENERAL = { titulo: '', texto: 'No se pudo vincular. Intenta de nuevo.' }

async function vincular() {
  if (vinculando.value) return
  error.value = null
  // Sin 10 dígitos ni se pregunta: la base de datos diría lo mismo, y así el aviso es inmediato.
  if (telefono.value.replace(/\D/g, '').length < 10) {
    error.value = MENSAJES.telefono_invalido
    return
  }
  vinculando.value = true
  try {
    const { data, error: err } = await supabase.rpc('vincular_socio_por_telefono', {
      p_codigo: props.codigo,
      p_telefono: telefono.value
    })
    if (err) throw err
    if (data?.ok) {
      resultado.value = data
      return
    }
    const mensaje = MENSAJES[data?.motivo] || ERROR_GENERAL
    error.value = { ...mensaje }
    // Avisar antes del bloqueo, no después.
    if (data?.motivo === 'no_encontrado' && data.intentos_restantes > 0 && data.intentos_restantes <= 2) {
      error.value.texto += ` Te ${data.intentos_restantes === 1 ? 'queda 1 intento' : `quedan ${data.intentos_restantes} intentos`}.`
    }
  } catch (e) {
    console.error('Error vinculando socio:', e)
    error.value = { titulo: '', texto: 'No se pudo vincular. Revisa tu conexión e intenta de nuevo.' }
  } finally {
    vinculando.value = false
  }
}

async function irAlInicio() {
  router.replace(await resolvePostLoginLocation(authStore.user))
}
</script>

<style scoped>
/* Pantalla completa: dvh con respaldo para Safari antiguo, y márgenes de safe-area. */
.unirme {
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: max(1.5rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  background: linear-gradient(180deg, #eef7f0 0%, #f8faf9 100%);
}
.unirme__tarjeta {
  width: 100%;
  max-width: 26rem;
  border-radius: var(--radius-xl, 1.25rem);
  border: 1px solid rgba(15, 83, 45, 0.1);
  background: #fff;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.unirme__cabecera {
  padding: 1.75rem 1.5rem 1.5rem;
  text-align: center;
  background: var(--brand-primary);
  color: #fff;
}
/* tema-fijo-inicio: icono en círculo blanco sobre la cabecera verde */
.unirme__icono {
  display: inline-flex;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #fff;
  color: var(--brand-primary);
  box-shadow: var(--shadow-sm);
}
/* tema-fijo-fin */
.unirme__overline {
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.unirme__titulo {
  margin-top: 0.25rem;
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.2;
}
.unirme__sub {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
}
.unirme__cuerpo {
  padding: 1.5rem;
}
.unirme__legal { display: inline-flex; min-height: 2.75rem; align-items: center; padding: 0 0.25rem; text-decoration: underline; text-underline-offset: 2px; }
.unirme__error {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-top: 0.75rem;
  border-radius: var(--radius-md);
  background: #fef2f2;
  padding: 0.625rem 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #991b1b;
}
.unirme__enlace {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  font-weight: 700;
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  touch-action: manipulation;
}
.unirme__check {
  display: inline-flex;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: #fff;
  box-shadow: var(--shadow-brand);
}
.unirme__check--pendiente {
  background: #fef3c7;
  color: #b45309;
  box-shadow: none;
}

/* Modo oscuro: solo lo que cambia (skill natillerapp-modo-oscuro §2.5). La cabecera
   verde, su icono en círculo blanco y el check verde valen igual en los dos modos. */
:where([data-tema=oscuro]) .unirme {
  background: linear-gradient(180deg, var(--superficie-hundida) 0%, var(--superficie-lienzo) 100%);
}
:where([data-tema=oscuro]) .unirme__tarjeta { border-color: var(--borde); background: var(--superficie-tarjeta); }
:where([data-tema=oscuro]) .unirme__error { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .unirme__enlace { color: var(--marca-tinta); }
:where([data-tema=oscuro]) .unirme__check--pendiente { background: var(--alerta-suave); color: var(--alerta); }
</style>
