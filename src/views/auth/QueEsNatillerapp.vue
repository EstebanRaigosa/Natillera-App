<template>
  <main class="animate-fade-in-up">
    <article class="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-white/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(34,197,94,0.05)] overflow-hidden">
      <!-- Brillo sutil superior -->
      <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" aria-hidden="true" />

      <!-- Cabecera del artículo -->
      <header class="relative bg-gradient-to-br from-natillera-500/15 via-emerald-500/10 to-teal-500/15 border-b border-natillera-200/60 px-5 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-7">
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-natillera-400/50 via-emerald-400/50 to-teal-400/50 rounded-full" aria-hidden="true" />
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-gray-800 mb-1 drop-shadow-sm">
          ¿Qué es Natillerapp?
        </h1>
        <p class="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
          La <strong>plataforma</strong> y <strong>aplicación</strong> para gestionar tu <strong>natillera</strong> desde el celular o la computadora.
        </p>
      </header>

      <!-- Contenedor secciones: en web 2 columnas para aprovechar espacio -->
      <div class="relative px-5 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-7 space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <!-- Qué es una natillera -->
        <section class="relative rounded-xl bg-gradient-to-br from-white/80 to-natillera-50/30 border border-natillera-100/80 p-4 sm:p-5 lg:p-6 shadow-lg shadow-natillera-900/5">
          <div class="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-natillera-400 to-natillera-600" aria-hidden="true" />
          <h2 class="flex items-center gap-3 text-base sm:text-lg font-display font-semibold text-natillera-800 mb-2 pl-1">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-natillera-400/20 to-natillera-600/20 text-natillera-600 shadow-inner border border-natillera-200/50 text-lg">🌱</span>
            ¿Qué es una natillera?
          </h2>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed pl-1">
            Una <strong>natillera</strong> es un grupo de ahorro colectivo donde varias personas aportan dinero de forma periódica.
            Es una tradición muy común en Colombia y otros países para ahorrar en comunidad, hacer préstamos entre socios y organizar
            actividades. Con Natillerapp puedes llevar tu <strong>natillera</strong> de forma digital, transparente y ordenada.
          </p>
        </section>

        <!-- Por qué usar la plataforma -->
        <section class="relative rounded-xl bg-gradient-to-br from-white/80 to-emerald-50/30 border border-emerald-100/80 p-4 sm:p-5 lg:p-6 shadow-lg shadow-emerald-900/5">
          <div class="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" aria-hidden="true" />
          <h2 class="flex items-center gap-3 text-base sm:text-lg font-display font-semibold text-natillera-800 mb-2 pl-1">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 text-emerald-600 shadow-inner border border-emerald-200/50 text-lg">📱</span>
            ¿Por qué usar esta plataforma?
          </h2>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 pl-1">
            Natillerapp es una <strong>plataforma</strong> gratuita pensada para que administres una o varias <strong>natilleras</strong>
            sin complicarte. La <strong>aplicación</strong> funciona en el celular y en la computadora: entras con tu cuenta, creas o te unes
            a una <strong>natillera</strong>, y desde ahí gestionas socios, cuotas, préstamos y actividades.
          </p>
          <ul class="space-y-2.5 text-sm sm:text-base text-gray-700 pl-1">
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-natillera-100 flex items-center justify-center text-natillera-600 text-xs font-bold shadow-sm">✓</span>
              <span>Lleva el control de <strong>cuotas</strong> y aportes por socio.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-natillera-100 flex items-center justify-center text-natillera-600 text-xs font-bold shadow-sm">✓</span>
              <span>Registra <strong>préstamos</strong> entre socios de la natillera.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-natillera-100 flex items-center justify-center text-natillera-600 text-xs font-bold shadow-sm">✓</span>
              <span>Organiza <strong>actividades</strong> y rifas de tu grupo.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-natillera-100 flex items-center justify-center text-natillera-600 text-xs font-bold shadow-sm">✓</span>
              <span>Todo en una sola <strong>aplicación</strong>, sin papeles ni planillas.</span>
            </li>
          </ul>
        </section>

        <!-- Cómo funciona la aplicación (ancho completo en web) -->
        <section class="relative rounded-xl bg-gradient-to-br from-white/80 to-teal-50/30 border border-teal-100/80 p-4 sm:p-5 lg:p-6 shadow-lg shadow-teal-900/5 lg:col-span-2">
          <div class="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-teal-400 to-teal-600" aria-hidden="true" />
          <h2 class="flex items-center gap-3 text-base sm:text-lg font-display font-semibold text-natillera-800 mb-2 pl-1">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 text-teal-600 shadow-inner border border-teal-200/50 text-lg">⚡</span>
            ¿Cómo funciona la aplicación?
          </h2>
          <p class="text-sm sm:text-base text-gray-700 leading-relaxed pl-1">
            La <strong>aplicación</strong> Natillerapp es muy sencilla: te registras, creas tu primera <strong>natillera</strong>
            (o te unes por invitación), agregas a los socios y empiezas a cargar las cuotas y los préstamos. La <strong>plataforma</strong>
            te muestra resúmenes, estados de pago y quién debe qué. Puedes usarla desde el celular cuando estés en la reunión de la
            <strong>natillera</strong> o desde la computadora para revisar todo con calma. Es una <strong>aplicación</strong> de
            ahorro colectivo pensada para que tu grupo trabaje en equipo sin líos.
          </p>
        </section>

        <!-- CTA (ancho completo en web) -->
        <section class="pt-2 pb-1 lg:col-span-2">
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-natillera-50 via-white to-emerald-50 border-2 border-natillera-200/70 p-5 sm:p-6 lg:p-7 shadow-[0_8px_30px_rgba(34,197,94,0.12)]">
            <div class="absolute inset-0 bg-gradient-to-r from-natillera-400/5 via-transparent to-emerald-400/5 pointer-events-none" aria-hidden="true" />
            <p class="relative text-sm sm:text-base text-gray-700 mb-4">
              ¿Listo para gestionar tu <strong>natillera</strong>? Entra a la <strong>plataforma</strong> y crea tu cuenta en segundos.
            </p>
            <div class="relative flex flex-col sm:flex-row gap-3">
              <RouterLink
                to="/auth/login"
                class="btn-primary flex items-center justify-center gap-2 text-center shadow-lg shadow-natillera-500/25"
              >
                Iniciar sesión
              </RouterLink>
              <RouterLink
                to="/auth/register"
                class="btn-secondary flex items-center justify-center gap-2 text-center border-2 hover:shadow-md transition-shadow"
              >
                Crear cuenta
              </RouterLink>
            </div>
          </div>
        </section>
      </div>
    </article>

    <!-- Enlace para volver -->
    <p class="text-center mt-5">
      <RouterLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 text-sm text-white/95 hover:text-white font-medium px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all drop-shadow-md"
      >
        ← Volver al inicio
      </RouterLink>
    </p>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
