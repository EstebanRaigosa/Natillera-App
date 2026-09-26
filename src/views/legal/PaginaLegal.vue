<template>
  <!--
    Página pública (sin sesión) para la Política de Tratamiento de Datos y los Términos.
    Un solo componente para los dos: el contenido vive en src/legal/documentos.js.
  -->
  <div class="legal">
    <header class="legal__barra">
      <router-link to="/" class="legal__marca" aria-label="Ir al inicio de Natillerapp">
        <img :src="logoIconSrc" alt="" width="36" height="36" class="h-9 w-9 object-contain" />
        <span class="font-display text-lg font-extrabold text-[color:var(--brand-primary)]">Natillerapp</span>
      </router-link>
      <nav class="legal__cambio" aria-label="Documentos legales">
        <router-link :to="{ name: 'PoliticaDatos' }" class="legal__pestana" active-class="is-activa">Datos personales</router-link>
        <router-link :to="{ name: 'Terminos' }" class="legal__pestana" active-class="is-activa">Términos</router-link>
      </nav>
    </header>

    <main class="legal__hoja">
      <p class="ds-overline">Versión {{ doc.version }}</p>
      <h1 class="legal__titulo">{{ doc.titulo }}</h1>
      <p class="legal__intro">{{ doc.intro }}</p>

      <!-- Índice: cada sección a un toque -->
      <nav class="legal__indice" aria-label="Contenido">
        <a v-for="s in doc.secciones" :key="s.id" :href="`#${s.id}`" class="legal__indice-item" @click.prevent="irA(s.id)">{{ s.titulo }}</a>
      </nav>

      <section v-for="(s, i) in doc.secciones" :id="s.id" :key="s.id" class="legal__seccion">
        <h2 class="legal__subtitulo"><span class="legal__numero">{{ i + 1 }}</span>{{ s.titulo }}</h2>
        <template v-for="(b, j) in s.bloques" :key="j">
          <ul v-if="b.lista" class="legal__lista">
            <li v-for="(item, k) in b.lista" :key="k">{{ item }}</li>
          </ul>
          <p v-else class="legal__parrafo">{{ b }}</p>
        </template>
      </section>

      <footer class="legal__pie">
        <p>Vigente desde el {{ doc.vigenteDesde }}.</p>
        <router-link v-if="esPolitica" :to="{ name: 'Terminos' }" class="legal__enlace">Leer los Términos y condiciones</router-link>
        <router-link v-else :to="{ name: 'PoliticaDatos' }" class="legal__enlace">Leer la Política de Tratamiento de Datos</router-link>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { POLITICA_DATOS, TERMINOS } from '../../legal/documentos'
import logoIconSrc from '../../../assets/logo_icon.png'

const route = useRoute()
const esPolitica = computed(() => route.name === 'PoliticaDatos')
const doc = computed(() => (esPolitica.value ? POLITICA_DATOS : TERMINOS))

// Sin cambiar la URL: el hash lo usa el router y romper el «atrás» no vale la pena.
function irA(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.legal {
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  background: var(--app-canvas-surface, #e8eaee);
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}
.legal__barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  max-width: 48rem;
  margin: 0 auto 1rem;
}
.legal__marca { display: inline-flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; }
.legal__cambio {
  display: inline-flex;
  gap: 0.1875rem;
  padding: 0.25rem;
  border: 1px solid var(--surface-divider);
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.05);
}
.legal__pestana {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  padding: 0 0.875rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.legal__pestana.is-activa { background: var(--brand-primary); color: #fff; }

.legal__hoja {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
  border: 1px solid var(--surface-divider);
  border-radius: var(--radius-xl);
  background: #fff;
  box-shadow: var(--shadow-sm);
}
@media (min-width: 640px) {
  .legal__hoja { padding: 2.25rem 2.5rem; }
}
.legal__titulo {
  margin-top: 0.375rem;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #0f172a;
}
@media (min-width: 640px) {
  .legal__titulo { font-size: 2rem; }
}
.legal__intro { margin-top: 0.75rem; font-size: 1rem; line-height: 1.6; color: #334155; }

.legal__indice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 1.25rem 0 0.5rem;
  padding: 0.875rem;
  border-radius: var(--radius-lg);
  background: #f4f8f5;
}
.legal__indice-item {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  padding: 0 0.875rem;
  border-radius: 9999px;
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--brand-primary);
  touch-action: manipulation;
}

.legal__seccion { padding-top: 1.5rem; scroll-margin-top: 1rem; }
.legal__subtitulo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 800;
  color: #0f172a;
}
.legal__numero {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--brand-primary-soft);
  font-size: 0.8125rem;
  color: var(--brand-primary);
}
.legal__parrafo { margin-top: 0.625rem; font-size: 0.9375rem; line-height: 1.65; color: #334155; }
.legal__lista { margin-top: 0.625rem; padding-left: 1.25rem; list-style: disc; }
.legal__lista li { margin-top: 0.375rem; font-size: 0.9375rem; line-height: 1.6; color: #334155; }
.legal__lista li::marker { color: var(--brand-primary); }

.legal__pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--surface-divider);
  font-size: 0.8125rem;
  color: #64748b;
}
.legal__enlace { min-height: 2.75rem; display: inline-flex; align-items: center; font-weight: 700; color: var(--brand-primary); }
</style>
