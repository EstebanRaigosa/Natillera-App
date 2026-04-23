<template>
  <div class="dash-empty-natilleras">
    <!-- Ilustración: círculo punteado + menta + alcancía -->
    <div class="dash-empty-natilleras__illustration" aria-hidden="true">
      <div class="dash-empty-natilleras__ring-outer">
        <div class="dash-empty-natilleras__ring-inner">
          <PiggyBankIcon class="dash-empty-natilleras__piggy" />
        </div>
      </div>
    </div>

    <h3 class="dash-empty-natilleras__title">
      {{ title }}
    </h3>
    <p class="dash-empty-natilleras__desc">
      {{ description }}
    </p>

    <router-link
      :to="ctaTo"
      class="dash-empty-natilleras__cta"
    >
      <span class="dash-empty-natilleras__cta-icon" aria-hidden="true">+</span>
      <span>{{ ctaLabel }}</span>
    </router-link>

    <div v-if="showComoFunciona" class="dash-empty-natilleras__divider" role="presentation" />

    <section v-if="showComoFunciona" class="dash-empty-natilleras__how" aria-labelledby="dash-empty-how-heading">
      <h4 id="dash-empty-how-heading" class="dash-empty-natilleras__how-title">
        Como funciona
      </h4>
      <ul class="dash-empty-natilleras__how-list">
        <li class="dash-empty-natilleras__how-item">
          <UserPlusIcon class="dash-empty-natilleras__how-icon" aria-hidden="true" />
          <span>Invita a los socios de tu grupo para que se unan</span>
        </li>
        <li class="dash-empty-natilleras__how-item">
          <CalendarIcon class="dash-empty-natilleras__how-icon" aria-hidden="true" />
          <span>Define la cuota y la periodicidad de los pagos</span>
        </li>
        <li class="dash-empty-natilleras__how-item">
          <PresentationChartLineIcon class="dash-empty-natilleras__how-icon" aria-hidden="true" />
          <span>Lleva el control de pagos, multas y sorteos</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { UserPlusIcon, CalendarIcon, PresentationChartLineIcon } from '@heroicons/vue/24/outline'
import PiggyBankIcon from './icons/PiggyBankIcon.vue'

defineProps({
  title: {
    type: String,
    default: 'Aún no tienes natilleras',
  },
  description: {
    type: String,
    default:
      'Crea tu primera natillera para empezar a administrar los aportes y pagos de tu grupo.',
  },
  ctaLabel: {
    type: String,
    default: 'Crear mi primera natillera',
  },
  ctaTo: {
    type: [String, Object],
    default: '/natilleras/crear',
  },
  showComoFunciona: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.dash-empty-natilleras {
  --dash-empty-bg: hsl(120 12% 97%);
  --dash-empty-mint: hsl(152 42% 88%);
  --dash-empty-forest: hsl(152 55% 24%);
  --dash-empty-forest-hover: hsl(152 58% 20%);
  --dash-empty-pig: hsl(152 50% 28%);
  --dash-empty-section: hsl(215 18% 38%);
  --dash-empty-muted: hsl(215 9% 46%);

  max-width: 26rem;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1.5rem 2.25rem;
  text-align: center;
  background: var(--dash-empty-bg);
  border-radius: 1rem;
  border: 1px solid hsl(120 8% 90%);
}

@media (min-width: 640px) {
  .dash-empty-natilleras {
    max-width: 28rem;
    padding: 2.5rem 2rem 2.5rem;
    border-radius: 1.125rem;
  }
}

.dash-empty-natilleras__illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 1.75rem;
}

.dash-empty-natilleras__ring-outer {
  width: 7.25rem;
  height: 7.25rem;
  border-radius: 50%;
  border: 2px dashed hsl(120 6% 78%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

@media (min-width: 640px) {
  .dash-empty-natilleras__ring-outer {
    width: 7.75rem;
    height: 7.75rem;
  }
}

.dash-empty-natilleras__ring-inner {
  width: 5.25rem;
  height: 5.25rem;
  border-radius: 50%;
  background: var(--dash-empty-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .dash-empty-natilleras__ring-inner {
    width: 5.5rem;
    height: 5.5rem;
  }
}

.dash-empty-natilleras__piggy {
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--dash-empty-pig);
}

@media (min-width: 640px) {
  .dash-empty-natilleras__piggy {
    width: 2.625rem;
    height: 2.625rem;
  }
}

.dash-empty-natilleras__title {
  margin: 0;
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: hsl(220 14% 14%);
}

@media (min-width: 640px) {
  .dash-empty-natilleras__title {
    font-size: 1.5rem;
  }
}

.dash-empty-natilleras__desc {
  margin: 0.875rem auto 0;
  max-width: 22rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--dash-empty-muted);
  font-weight: 400;
}

.dash-empty-natilleras__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
  width: 100%;
  max-width: 20rem;
  padding: 0.875rem 1.5rem;
  border-radius: 9999px;
  background: var(--dash-empty-forest);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 6px 20px hsla(152, 45%, 18%, 0.28);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}

.dash-empty-natilleras__cta:hover {
  background: var(--dash-empty-forest-hover);
  box-shadow: 0 8px 24px hsla(152, 45%, 16%, 0.32);
}

.dash-empty-natilleras__cta:active {
  transform: scale(0.98);
}

.dash-empty-natilleras__cta-icon {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
  margin-top: -0.05em;
}

.dash-empty-natilleras__divider {
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  height: 1px;
  width: 100%;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;
  background: hsl(120 8% 88%);
}

.dash-empty-natilleras__how {
  text-align: left;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;
}

.dash-empty-natilleras__how-title {
  margin: 0 0 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--dash-empty-section);
}

.dash-empty-natilleras__how-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dash-empty-natilleras__how-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: hsl(220 12% 26%);
  font-weight: 500;
}

.dash-empty-natilleras__how-icon {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  color: hsl(152 52% 32%);
  margin-top: 0.1rem;
}
</style>
