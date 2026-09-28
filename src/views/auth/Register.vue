<template>
  <!-- La tarjeta blanca la pone AuthLayout -->
  <div class="auth-nova relative">
    <div class="relative z-10">
      <!--
        Cuenta creada: el aviso ocupa todo el sitio del formulario. Antes el formulario
        volvía a aparecer vacío con el aviso chiquito abajo y parecía que el registro había
        fallado.
      -->
      <section v-if="successMessage" class="registro-listo" aria-live="polite">
        <div class="registro-listo__sobre" aria-hidden="true">
          <svg viewBox="0 0 160 128" class="h-full w-full">
            <ellipse cx="80" cy="120" rx="54" ry="5" fill="#1B5E37" opacity="0.12" />
            <!-- Carta que asoma del sobre -->
            <g class="registro-listo__carta">
              <rect x="38" y="16" width="84" height="70" rx="8" fill="#ffffff" stroke="#cfe3d5" stroke-width="2" />
              <rect x="50" y="30" width="44" height="6" rx="3" fill="#1B5E37" opacity="0.85" />
              <rect x="50" y="43" width="60" height="5" rx="2.5" fill="#cfe3d5" />
              <rect x="50" y="54" width="52" height="5" rx="2.5" fill="#cfe3d5" />
              <circle cx="104" cy="33" r="7" fill="#6fcf97" />
              <path d="M100.5 33l2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <!-- Sobre -->
            <path d="M22 58l58 38 58-38v50a8 8 0 01-8 8H30a8 8 0 01-8-8z" fill="#1B5E37" />
            <path d="M22 108l46-32M138 108L92 76" stroke="#154a2d" stroke-width="2" stroke-linecap="round" />
            <path d="M22 58l58 38 58-38" fill="none" stroke="#2f7d4f" stroke-width="2" stroke-linejoin="round" />
          </svg>
        </div>

        <h2 class="nova-section-title">¡Revisa tu correo!</h2>
        <p class="registro-listo__texto">
          Tu cuenta está creada. Te enviamos un enlace de confirmación a
        </p>
        <p class="registro-listo__correo">{{ emailRegistrado }}</p>

        <ol class="registro-listo__pasos">
          <li><span>1</span>Abre el correo de Natillerapp.</li>
          <li><span>2</span>Toca el enlace para confirmar tu cuenta.</li>
          <li><span>3</span>Vuelve e inicia sesión.</li>
        </ol>

        <div class="registro-listo__spam" role="note">
          <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p>
            <strong>¿No te llega?</strong> Revisa la carpeta de <strong>spam</strong> o
            <strong>correo no deseado</strong>. Puede tardar hasta 5 minutos.
          </p>
        </div>

        <div class="mt-6 space-y-3">
          <router-link to="/auth/login" class="nova-btn-primary w-full text-center no-underline inline-flex items-center justify-center gap-2">
            Ir a iniciar sesión
          </router-link>
          <router-link to="/" class="nova-btn-outline no-underline">
            <HomeIcon class="h-5 w-5" aria-hidden="true" />
            Volver a la página de inicio
          </router-link>
        </div>
      </section>

      <template v-else>
      <header class="text-center mb-5">
        <h2 class="nova-section-title">Crear cuenta</h2>
      </header>

      <!--
        Google va primero: en celulares bajos, debajo del formulario quedaba fuera de la
        pantalla y la gente no sabía que existía. Arriba, las dos opciones se ven sin
        desplazar: Google y, debajo, «o con tu correo».
      -->
      <!-- PWA instalada en iOS: la sesión de Google se quedaría en Safari (ver auth.js) -->
      <p v-if="sinGoogle" class="text-center text-xs" style="color: hsl(var(--muted-foreground))">
        {{ AVISO_GOOGLE_IOS_INSTALADA }}
      </p>
      <button
        v-else
        type="button"
        @click="handleGoogleLogin"
        :disabled="authStore.loading"
        class="nova-btn-outline disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar con Google
      </button>
      <p v-if="errorGoogle" class="nova-alert nova-alert--error mt-3 text-sm font-medium">{{ errorGoogle }}</p>

      <div class="relative my-4 flex items-center gap-3">
        <div class="flex-1 h-px bg-[hsl(var(--border))]" />
        <span class="text-xs font-semibold shrink-0" style="color: hsl(var(--muted-foreground))">o con tu correo</span>
        <div class="flex-1 h-px bg-[hsl(var(--border))]" />
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="nova-label">Nombre completo</label>
          <input v-model="nombre" type="text" class="nova-input" placeholder="Tu nombre" required autocomplete="name" />
        </div>

        <div>
          <label class="nova-label">Correo electrónico</label>
          <input v-model="email" type="email" class="nova-input" placeholder="tu@correo.com" required autocomplete="email" />
        </div>

        <div>
          <label class="nova-label">Contraseña</label>
          <div class="nova-input-shell relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="flex-1 min-w-0 border-0 bg-transparent px-3 py-3 pr-12 text-base focus:ring-0 focus:outline-none"
              style="color: hsl(var(--foreground))"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center z-10 transition-colors"
              style="color: hsl(var(--muted-foreground))"
              aria-label="Mostrar u ocultar contraseña"
            >
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="nova-label">Confirmar contraseña</label>
          <div class="nova-input-shell relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="flex-1 min-w-0 border-0 bg-transparent px-3 py-3 pr-12 text-base focus:ring-0 focus:outline-none"
              style="color: hsl(var(--foreground))"
              placeholder="Repite tu contraseña"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center z-10 transition-colors"
              style="color: hsl(var(--muted-foreground))"
              aria-label="Mostrar u ocultar contraseña"
            >
              <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="nova-alert nova-alert--error">
          <p class="text-sm font-medium">{{ errorMessage }}</p>
        </div>

        <!-- Autorización previa y expresa (Ley 1581): sin marcarla no se crea la cuenta -->
        <label ref="casillaLegalRef" class="registro-legal" :class="{ 'registro-legal--resaltada': resaltarLegal }">
          <input ref="checkLegalRef" v-model="aceptaLegal" type="checkbox" class="registro-legal__check" />
          <span>
            Acepto la
            <router-link :to="{ name: 'PoliticaDatos' }" target="_blank" class="nova-link">Política de Tratamiento de Datos</router-link>
            y los
            <router-link :to="{ name: 'Terminos' }" target="_blank" class="nova-link">Términos</router-link>.
          </span>
        </label>

        <button
          type="submit"
          class="nova-btn-primary w-full"
          :disabled="authStore.loading"
        >
          <CargaBoton v-if="authStore.loading" texto="Creando cuenta" />
          <span v-else>Crear cuenta</span>
        </button>

      </form>


      <p class="mt-5 text-center text-sm" style="color: hsl(var(--muted-foreground))">
        ¿Ya tienes cuenta?
        <router-link to="/auth/login" class="nova-link ml-1">Inicia sesión</router-link>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import CargaBoton from '../../components/carga/CargaBoton.vue'
import { ref, watch } from 'vue'
import { useAuthStore, AVISO_GOOGLE_IOS_INSTALADA, googleNoDisponibleAqui } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, HomeIcon } from '@heroicons/vue/24/outline'
import { VERSION_LEGAL, CLAVE_CONSENTIMIENTO_REGISTRO } from '../../legal/responsable'

const authStore = useAuthStore()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref(false)
const emailRegistrado = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const aceptaLegal = ref(false)
const errorGoogle = ref('')
const sinGoogle = googleNoDisponibleAqui()
const resaltarLegal = ref(false)
const casillaLegalRef = ref(null)
const checkLegalRef = ref(null)

const MENSAJE_FALTA_LEGAL = 'Para crear tu cuenta debes aceptar la Política de Tratamiento de Datos y los Términos.'

// La constancia se guarda en la base de datos al entrar por primera vez (ConsentimientoLegal):
// antes de confirmar el correo no hay sesión con que escribirla.
function recordarAceptacion() {
  try {
    localStorage.setItem(CLAVE_CONSENTIMIENTO_REGISTRO, JSON.stringify({ version: VERSION_LEGAL, fecha: new Date().toISOString() }))
  } catch {
    // Sin almacenamiento (modo privado): el aviso se lo pedirá al entrar.
  }
}

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = false

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (!aceptaLegal.value) {
    errorMessage.value = MENSAJE_FALTA_LEGAL
    return
  }
  recordarAceptacion()

  const result = await authStore.register(email.value, password.value, nombre.value)
  
  if (result.success) {
    // Guardar el email antes de limpiar el formulario
    emailRegistrado.value = email.value
    successMessage.value = true
    // Limpiar el formulario
    nombre.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    // No redirigir al dashboard - el usuario debe validar su email primero
  } else {
    errorMessage.value = result.error
  }
}

// Google está arriba y la casilla legal abajo: sin marcarla, el aviso sale junto al botón
// y se lleva al usuario hasta la casilla, resaltada, para que sepa dónde marcar.
function senalarCasillaLegal() {
  errorGoogle.value = 'Antes de continuar, marca abajo la casilla de Política de Tratamiento de Datos y Términos.'
  resaltarLegal.value = true
  casillaLegalRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  checkLegalRef.value?.focus({ preventScroll: true })
}

watch(aceptaLegal, acepta => {
  if (!acepta) return
  errorGoogle.value = ''
  resaltarLegal.value = false
})

async function handleGoogleLogin() {
  errorMessage.value = ''
  errorGoogle.value = ''
  if (!aceptaLegal.value) {
    senalarCasillaLegal()
    return
  }
  recordarAceptacion()
  const result = await authStore.loginWithGoogle()
  
  if (!result.success) {
    errorGoogle.value = result.error || 'Error al iniciar sesión con Google'
  }
}
</script>

<style scoped>
.registro-legal { display: flex; gap: 0.625rem; align-items: flex-start; font-size: 0.875rem; line-height: 1.45; color: hsl(var(--muted-foreground)); cursor: pointer; touch-action: manipulation; }
.registro-legal--resaltada { margin: -0.5rem; padding: 0.5rem; border-radius: var(--radius); background: #fff8e6; box-shadow: 0 0 0 2px #f5b83d; }
.registro-legal__check { width: 1.375rem; height: 1.375rem; flex-shrink: 0; margin-top: 0.0625rem; accent-color: #1B5E37; }

.registro-listo { display: flex; flex-direction: column; align-items: center; text-align: center; }
.registro-listo__sobre { width: 9.5rem; height: 7.6rem; margin-bottom: 0.75rem; }
/* La carta sube y baja despacio dentro del sobre: dice «te llegó algo» sin distraer */
.registro-listo__carta { -webkit-animation: carta-asoma 2.8s ease-in-out infinite; animation: carta-asoma 2.8s ease-in-out infinite; transform: translate3d(0, 0, 0); }
@-webkit-keyframes carta-asoma { 0%, 100% { -webkit-transform: translate3d(0, 6px, 0); transform: translate3d(0, 6px, 0); } 50% { -webkit-transform: translate3d(0, -4px, 0); transform: translate3d(0, -4px, 0); } }
@keyframes carta-asoma { 0%, 100% { transform: translate3d(0, 6px, 0); } 50% { transform: translate3d(0, -4px, 0); } }
@media (prefers-reduced-motion: reduce) { .registro-listo__carta { -webkit-animation: none; animation: none; } }
.registro-listo__texto { margin-top: 0.5rem; font-size: 0.9375rem; line-height: 1.5; color: hsl(var(--muted-foreground)); }
.registro-listo__correo { margin-top: 0.25rem; max-width: 100%; overflow-wrap: anywhere; font-weight: 700; font-size: 1rem; color: #1B5E37; }
.registro-listo__pasos { margin-top: 1.25rem; width: 100%; display: flex; flex-direction: column; gap: 0.625rem; text-align: left; font-size: 0.9375rem; color: hsl(var(--foreground)); }
.registro-listo__pasos li { display: flex; align-items: center; gap: 0.75rem; }
.registro-listo__pasos span { display: inline-flex; width: 1.75rem; height: 1.75rem; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 9999px; background: #E8F5E9; color: #1B5E37; font-weight: 800; font-size: 0.8125rem; }
.registro-listo__spam { margin-top: 1.25rem; width: 100%; display: flex; gap: 0.625rem; align-items: flex-start; text-align: left; padding: 0.875rem 1rem; border-radius: var(--radius); border: 1px solid #f5d38a; background: #fff8e6; color: #7a5200; font-size: 0.875rem; line-height: 1.45; }
</style>
