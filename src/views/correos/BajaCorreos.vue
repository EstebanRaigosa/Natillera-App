<template>
  <!--
    Destino del enlace «Darte de baja» de los correos de novedades y encuestas.
    Funciona sin iniciar sesión: el token del enlace identifica a la persona.

    La baja NO se hace al abrir la página sino al pulsar el botón. Los filtros
    de seguridad del correo (Outlook, antivirus corporativos) abren los enlaces
    por su cuenta para revisarlos; si cargar la página diera de baja, se daría
    de baja a gente que nunca lo pidió.
  -->
  <div class="baja">
    <div class="baja__tarjeta">
      <header class="baja__cabecera">
        <span class="baja__icono" aria-hidden="true">
          <EnvelopeIcon class="h-7 w-7" />
        </span>
        <p class="baja__overline">Correos de Natillerapp</p>
        <h1 class="baja__titulo">{{ titulo }}</h1>
      </header>

      <div class="baja__cuerpo" aria-live="polite">
        <!-- Enlace roto o copiado a medias -->
        <div v-if="!tokenValido || estado === 'invalido'" class="text-center">
          <p class="text-sm leading-relaxed text-texto-secundario">
            Este enlace no es válido. Si quieres dejar de recibir correos, entra a la app y
            desactívalos en <strong>Mi cuenta</strong>.
          </p>
          <router-link to="/mi-cuenta" class="ds-btn ds-btn--secondary mt-5 w-full">Ir a Mi cuenta</router-link>
        </div>

        <!-- Antes de decidir -->
        <div v-else-if="estado === 'pregunta'" class="text-center">
          <p class="text-sm leading-relaxed text-texto-secundario">
            Dejarás de recibir encuestas y novedades de la app. Los correos de soporte, que
            responden a algo que tú pediste, te seguirán llegando.
          </p>
          <button
            type="button"
            class="ds-btn ds-btn--primary mt-5 w-full touch-manipulation"
            :disabled="guardando"
            @click="cambiar(false)"
          >
            <CargaBoton v-if="guardando" texto="Dando de baja…" />
            <template v-else>Darme de baja</template>
          </button>
        </div>

        <!-- Hecho: de baja -->
        <div v-else-if="estado === 'baja'" class="text-center">
          <span class="baja__check" aria-hidden="true"><CheckIcon class="h-8 w-8" /></span>
          <p class="mt-4 text-sm leading-relaxed text-texto-secundario">
            Listo<span v-if="correo">: <strong>{{ correo }}</strong></span> no recibirá más
            encuestas ni novedades. Puedes volver a activarlos cuando quieras en Mi cuenta.
          </p>
          <button
            type="button"
            class="baja__enlace mt-3"
            :disabled="guardando"
            @click="cambiar(true)"
          >
            Fue un error, quiero seguir recibiéndolos
          </button>
        </div>

        <!-- Hecho: suscrito otra vez -->
        <div v-else-if="estado === 'suscrito'" class="text-center">
          <span class="baja__check" aria-hidden="true"><CheckIcon class="h-8 w-8" /></span>
          <p class="mt-4 text-sm leading-relaxed text-texto-secundario">
            Perfecto, seguirás recibiendo nuestros correos.
          </p>
        </div>

        <p v-if="error" class="baja__error" role="alert">
          <ExclamationTriangleIcon class="h-4 w-4 shrink-0" />
          <span>{{ error }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CheckIcon, EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../../lib/supabase'
import CargaBoton from '../../components/carga/CargaBoton.vue'

const route = useRoute()

const token = String(route.query.t ?? '')
const tokenValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)

const estado = ref('pregunta')   // pregunta · baja · suscrito · invalido
const correo = ref('')
const guardando = ref(false)
const error = ref('')

const titulo = computed(() => {
  if (!tokenValido || estado.value === 'invalido') return 'Enlace no válido'
  if (estado.value === 'baja') return 'Te diste de baja'
  if (estado.value === 'suscrito') return 'Sigues suscrito'
  return '¿Dejar de recibir correos?'
})

async function cambiar(recibir) {
  guardando.value = true
  error.value = ''
  try {
    const { data, error: e } = await supabase.rpc('correos_baja_por_token', { p_token: token, p_recibir: recibir })
    if (e) throw e
    if (!data?.ok) {
      estado.value = 'invalido'
      return
    }
    correo.value = data.correo || ''
    estado.value = data.recibir ? 'suscrito' : 'baja'
  } catch {
    error.value = 'No pudimos guardar el cambio. Revisa tu conexión e inténtalo de nuevo.'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
/* Pantalla completa: dvh con respaldo para Safari antiguo, y márgenes de safe-area. */
.baja {
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
.baja__tarjeta {
  width: 100%;
  max-width: 26rem;
  border-radius: var(--radius-xl, 1.25rem);
  border: 1px solid rgba(15, 83, 45, 0.1);
  background: #fff;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.baja__cabecera {
  padding: 1.75rem 1.5rem 1.5rem;
  text-align: center;
  background: var(--brand-primary);
  color: #fff;
}
/* tema-fijo-inicio: icono en círculo blanco sobre la cabecera verde */
.baja__icono {
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
.baja__overline {
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.baja__titulo {
  margin-top: 0.25rem;
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.2;
}
.baja__cuerpo {
  padding: 1.5rem;
}
.baja__check {
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
.baja__enlace {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  touch-action: manipulation;
}
.baja__error {
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

/* Modo oscuro: solo lo que cambia (skill natillerapp-modo-oscuro §2.5). */
:where([data-tema=oscuro]) .baja {
  background: linear-gradient(180deg, var(--superficie-hundida) 0%, var(--superficie-lienzo) 100%);
}
:where([data-tema=oscuro]) .baja__tarjeta { border-color: var(--borde); background: var(--superficie-tarjeta); }
:where([data-tema=oscuro]) .baja__error { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .baja__enlace { color: var(--marca-tinta); }
</style>
