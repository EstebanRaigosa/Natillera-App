<template>
  <div class="auth-layout-root">
    <!-- BETA badge -->
    <div class="auth-beta-badge">
      <div class="auth-beta-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full">
        <span class="auth-beta-pill__dot" aria-hidden="true" />
        BETA V0.6
      </div>
    </div>

    <!-- DESKTOP: Two panel layout -->
    <div class="auth-desktop">
      <!-- Left brand panel -->
      <div class="auth-brand-panel">
        <div class="auth-brand-panel__bg" aria-hidden="true">
          <!-- Círculos sobrios: sin blur/bokeh, tonos mate y tenues -->
          <div class="auth-disc auth-disc--1"></div>
          <div class="auth-disc auth-disc--2"></div>
          <div class="auth-disc auth-disc--3"></div>
          <div class="auth-disc auth-disc--4"></div>
          <div class="auth-disc auth-disc--5"></div>
        </div>

        <div class="auth-brand-content">
          <div class="auth-brand-stack">
            <!-- Logo + Brand -->
            <div class="auth-brand-row">
              <div class="auth-isotipo-ring">
                <img
                  :src="logoIconSrc"
                  alt="Natillerapp"
                  class="auth-isotipo-img"
                  width="112"
                  height="112"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <h1 class="auth-brand-title">
                <AppBrand class="text-white" />
              </h1>
            </div>

            <p class="auth-subtitle">
              Ahorro Comunitario
            </p>

            <p class="auth-description">
              Digitalizando la tradición paisa del ahorro<br>comunitario
            </p>

            <div class="auth-features">
              <div class="auth-feature-badge">
                <svg class="auth-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Transparencia total</span>
              </div>
              <div class="auth-feature-badge">
                <svg class="auth-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Ahorro seguro</span>
              </div>
              <div class="auth-feature-badge">
                <svg class="auth-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Comunidad unida</span>
              </div>
            </div>
          </div>

          <p class="auth-copyright">
            &copy; {{ currentYear }} NatilleraApp
          </p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="auth-form-panel">
        <div class="auth-form-container">
          <router-view />
        </div>
      </div>
    </div>

    <!-- MOBILE: Stacked layout -->
    <div class="auth-mobile">
      <!-- Compact header -->
      <div class="auth-mobile-header">
        <div class="auth-mobile-header__bg" aria-hidden="true">
          <div class="auth-disc auth-disc--m1"></div>
          <div class="auth-disc auth-disc--m2"></div>
        </div>
        <div
          class="relative z-10 flex flex-col items-center gap-1 px-4 pb-5 sm:pb-6 sm:gap-1.5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:pt-[max(1.5rem,env(safe-area-inset-top,0px))]"
        >
          <div class="auth-brand-row auth-brand-row--mobile">
            <div class="auth-isotipo-ring auth-isotipo-ring--mobile">
              <img
                :src="logoIconSrc"
                alt="Natillerapp"
                class="auth-isotipo-img"
                width="104"
                height="104"
                decoding="async"
                draggable="false"
              />
            </div>
            <h1 class="auth-brand-title--mobile">
              <AppBrand class="text-white" />
            </h1>
          </div>
          <p class="auth-subtitle auth-subtitle--sm">
            Ahorro Comunitario
          </p>
        </div>
      </div>

      <!-- Form area -->
      <div class="auth-mobile-form">
        <router-view />
        <p class="auth-mobile-tagline">
          Plataforma de gestión de natilleras
        </p>
        <router-link
          :to="{ name: 'QueEsNatillerapp' }"
          class="auth-mobile-about-link"
        >
          ¿Qué es Natillerapp?
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppBrand from '../components/AppBrand.vue'
import logoIconSrc from '../../assets/logo_icon.png'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
@reference "../style.css";

.auth-layout-root {
  /* Textos sobre panel oscuro: contraste legible */
  --auth-brand-mint: hsl(131 38% 82%);
  --auth-brand-mint-muted: hsl(131 28% 68%);
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
}

.auth-beta-badge {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top, 0px));
  right: max(1rem, env(safe-area-inset-right, 0px));
  z-index: 50;
}

.auth-beta-pill {
  background: hsla(131, 35%, 16%, 0.92);
  border: 1px solid hsla(131, 28%, 34%, 0.65);
  color: hsl(131 25% 92%);
  letter-spacing: 0.04em;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 12px hsla(0, 0%, 0%, 0.2);
}

.auth-beta-pill__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: hsl(131 55% 42%);
  box-shadow: 0 0 0 1px hsla(131, 40%, 35%, 0.4);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   DESKTOP (lg+)
   ═══════════════════════════════════════════ */
.auth-desktop {
  display: none;
}

@media (min-width: 1024px) {
  .auth-desktop {
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
  }
}

/* ── Left brand panel ── */
.auth-brand-panel {
  position: relative;
  flex: 1.35 1 0;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.auth-brand-panel__bg,
.auth-mobile-header__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  /* Verde bosque oscuro pero visible (antes ~2% L parecía negro puro en muchas pantallas) */
  background: linear-gradient(
    168deg,
    hsl(132 36% 9%) 0%,
    hsl(130 34% 11%) 38%,
    hsl(131 32% 12%) 62%,
    hsl(128 36% 10%) 100%
  );
}

/* Círculos decorativos: mate, tenues, sin blur ni resplandor (no bokeh) */
.auth-disc {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.auth-disc--1 {
  width: min(100vw, 480px);
  height: min(100vw, 480px);
  top: -22%;
  right: -26%;
  background: radial-gradient(
    circle at 38% 40%,
    hsla(131, 16%, 24%, 0.55) 0%,
    hsla(131, 14%, 18%, 0.38) 52%,
    hsla(131, 12%, 14%, 0.2) 100%
  );
}

.auth-disc--2 {
  width: min(85vw, 380px);
  height: min(85vw, 380px);
  bottom: -16%;
  left: -30%;
  background: radial-gradient(
    circle at 52% 48%,
    hsla(128, 14%, 22%, 0.48) 0%,
    hsla(131, 12%, 16%, 0.3) 55%,
    hsla(131, 10%, 13%, 0.14) 100%
  );
}

.auth-disc--3 {
  width: 220px;
  height: 220px;
  top: 40%;
  left: -10%;
  background: hsla(131, 12%, 20%, 0.42);
}

.auth-disc--4 {
  width: 160px;
  height: 160px;
  top: 10%;
  right: 6%;
  background: hsla(131, 11%, 21%, 0.36);
}

.auth-disc--5 {
  width: 100px;
  height: 100px;
  bottom: 22%;
  right: 14%;
  background: hsla(131, 10%, 19%, 0.45);
}

.auth-disc--m1 {
  width: 240px;
  height: 240px;
  top: -48%;
  right: -38%;
  background: radial-gradient(
    circle at 42% 42%,
    hsla(131, 15%, 23%, 0.5) 0%,
    hsla(131, 12%, 15%, 0.22) 100%
  );
}

.auth-disc--m2 {
  width: 180px;
  height: 180px;
  bottom: -48%;
  left: -32%;
  background: radial-gradient(
    circle at 50% 50%,
    hsla(128, 13%, 21%, 0.44) 0%,
    hsla(131, 11%, 14%, 0.2) 100%
  );
}

/* ── Content: bloque principal centrado; copyright anclado al fondo del panel ── */
.auth-brand-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  min-height: 0;
  width: 100%;
  padding: 2.5rem 2rem;
}

.auth-brand-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1 1 auto;
  min-height: 0;
  justify-content: center;
  max-width: 100%;
  gap: 1.25rem;
}

.auth-brand-row {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 0;
}

.auth-brand-row--mobile {
  column-gap: 0;
}

/* ── Isotipo: halo suave para que el PNG oscuro no “desaparezca” en el verde ── */
.auth-isotipo-ring {
  position: relative;
  width: 7rem;
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-inline-end: -0.35rem;
}

.auth-isotipo-ring::before {
  content: '';
  position: absolute;
  inset: -6%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    hsla(131, 40%, 96%, 0.14) 0%,
    hsla(131, 35%, 40%, 0.08) 45%,
    transparent 70%
  );
  z-index: 0;
  pointer-events: none;
}

/* Cabecera auth (móvil / tablet apilada): logo más legible en pantallas táctiles */
.auth-isotipo-ring--mobile {
  width: 6.5rem;
  height: 6.5rem;
  margin-inline-end: -0.3rem;
}

@media (min-width: 640px) {
  .auth-isotipo-ring--mobile {
    width: 7rem;
    height: 7rem;
    margin-inline-end: -0.35rem;
  }
}

.auth-isotipo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 20px hsla(131, 50%, 8%, 0.85))
    drop-shadow(0 0 28px hsla(0, 0%, 100%, 0.12));
}

/* ── Brand title ── */
.auth-brand-title {
  margin: 0;
  padding: 0;
  font-size: clamp(1.875rem, 2.5vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.auth-brand-title--mobile {
  margin: 0;
  padding: 0;
  font-size: clamp(1.875rem, 5.5vw, 2.375rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

@media (min-width: 640px) {
  .auth-brand-title--mobile {
    font-size: clamp(2.125rem, 4.2vw, 2.625rem);
  }
}

/* ── "AHORRO COMUNITARIO" ── */
.auth-subtitle {
  margin-top: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.32em;
  color: var(--auth-brand-mint-muted);
}

.auth-subtitle--sm {
  margin-top: 0;
  font-size: 0.6rem;
  letter-spacing: 0.27em;
  color: hsl(131 26% 72%);
}

@media (min-width: 640px) {
  .auth-subtitle--sm {
    font-size: 0.65rem;
    letter-spacing: 0.28em;
  }
}

/* ── Descripción ── */
.auth-description {
  margin-top: 0;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  color: hsla(0, 0%, 100%, 0.88);
  max-width: 400px;
  font-family: var(--font-display, 'Outfit', sans-serif);
}

/* ── Badges tipo píldora, sobrios ── */
.auth-features {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  margin-top: 0.25rem;
}

.auth-feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1.35rem;
  border-radius: 9999px;
  background: hsla(131, 28%, 18%, 0.85);
  border: 1px solid hsla(131, 26%, 36%, 0.65);
  color: var(--auth-brand-mint);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.auth-feature-badge:hover {
  background: hsla(131, 30%, 22%, 0.9);
  border-color: hsla(131, 28%, 42%, 0.7);
}

.auth-feature-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  flex-shrink: 0;
  color: hsl(131 36% 74%);
  stroke-width: 1.65;
}

/* ── Copyright (pie del panel izquierdo) ── */
.auth-copyright {
  flex-shrink: 0;
  margin: 0;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: hsl(131 14% 58%);
}

/* ── Right form panel ── */
.auth-form-panel {
  flex: 1 1 0;
  min-width: min(100%, 22rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  overflow-y: auto;
}

.auth-form-container {
  width: 100%;
  max-width: 420px;
}

/* ═══════════════════════════════════════════
   MOBILE (<1024px)
   ═══════════════════════════════════════════ */
.auth-mobile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

@media (min-width: 1024px) {
  .auth-mobile {
    display: none;
  }
}

.auth-mobile-header {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  min-height: 11rem;
}

@media (min-width: 640px) {
  .auth-mobile-header {
    min-height: 12rem;
  }
}

.auth-mobile-form {
  flex: 1;
  background: hsl(131 10% 98.5%);
  padding: 1.25rem 1rem max(2rem, calc(1rem + env(safe-area-inset-bottom, 0px)));
  margin-top: -0.75rem;
  position: relative;
  z-index: 5;
  border-radius: 0.75rem 0.75rem 0 0;
}

@media (min-width: 640px) {
  .auth-mobile-form {
    padding: 1.5rem 1.5rem max(2rem, calc(1rem + env(safe-area-inset-bottom, 0px)));
    max-width: 460px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
}

/* Solo móvil: línea de contexto bajo el formulario */
.auth-mobile-tagline {
  margin: 1.25rem 0 0;
  padding: 0 0.25rem;
  text-align: center;
  font-size: 0.6875rem;
  line-height: 1.35;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: hsl(131 10% 42% / 0.88);
}

.auth-mobile-about-link {
  display: block;
  margin-top: 0.5rem;
  padding: 0 0.25rem 0.25rem;
  text-align: center;
  font-size: 0.6875rem;
  line-height: 1.35;
  font-weight: 600;
  color: hsl(131 55% 28%);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: hsl(131 40% 38% / 0.4);
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

.auth-mobile-about-link:hover {
  color: hsl(131 60% 22%);
  text-decoration-color: hsl(131 50% 30% / 0.65);
}

@media (max-width: 1023px) {
  .auth-beta-badge {
    top: max(0.75rem, env(safe-area-inset-top, 0px));
    left: max(0.75rem, env(safe-area-inset-left, 0px));
    right: auto;
  }
}
</style>
