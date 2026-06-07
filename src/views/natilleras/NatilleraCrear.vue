<template>
  <div class="crear-natillera-wizard min-h-screen min-h-[100dvh] pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] font-[family-name:var(--font-body)]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 relative">
      <div class="pt-3 sm:pt-4 mb-6">
        <div class="flex flex-row items-center gap-3 sm:gap-4">
          <BackButton to="/dashboard" :inline="true" />
          <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div
              class="hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-natillera-100 items-center justify-center flex-shrink-0 border border-natillera-200/80"
              aria-hidden="true"
            >
              <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-natillera-700" />
            </div>
            <div class="min-w-0">
              <h1 class="font-display text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Crear <span class="text-natillera-700">Natillera</span>
              </h1>
              <p class="hidden sm:block text-gray-500 text-sm mt-0.5">
                Configura tu nuevo grupo de ahorro en 4 pasos simples
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stepper en caja -->
      <div
        class="mb-6 sm:mb-8 rounded-2xl border border-gray-200 bg-white px-3 py-4 sm:px-6 sm:py-5 shadow-sm"
      >
        <div class="relative flex items-start justify-between gap-1 sm:gap-2">
          <div
            class="absolute top-[18px] sm:top-5 left-[12%] right-[12%] h-px bg-gray-200 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <template v-for="(step, index) in steps" :key="step.id">
            <button
              type="button"
              :disabled="isStepperStepDisabled(index + 1)"
              :title="isStepperStepDisabled(index + 1) ? 'Completa los pasos anteriores para acceder a este paso' : undefined"
              @click="goToStep(index + 1)"
              :class="[
                'relative z-10 flex flex-1 flex-col items-center gap-2 min-w-0 group',
                isStepperStepDisabled(index + 1) ? 'cursor-not-allowed opacity-45' : ''
              ]"
            >
              <span
                :class="[
                  'min-h-[44px] min-w-[44px] w-11 h-11 sm:min-h-[44px] sm:min-w-[44px] sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-all touch-manipulation',
                  currentStep > index + 1
                    ? 'bg-[#166534] text-white shadow-sm'
                    : currentStep === index + 1
                      ? 'bg-[#166534] text-white shadow-md ring-4 ring-[#166534]/15'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 group-hover:border-gray-300'
                ]"
              >
                <CheckIcon v-if="currentStep > index + 1" class="w-4 h-4 sm:w-5 sm:h-5" />
                <span v-else>{{ index + 1 }}</span>
              </span>
              <div class="text-center px-0.5">
                <p
                  :class="[
                    'text-[10px] sm:text-xs font-medium leading-tight',
                    currentStep === index + 1 ? 'text-natillera-700' : 'text-gray-400'
                  ]"
                >
                  Paso {{ index + 1 }}
                </p>
                <p
                  :class="[
                    'text-[11px] sm:text-sm font-semibold leading-snug mt-0.5 line-clamp-2',
                    currentStep === index + 1 ? 'text-gray-900' : 'text-gray-400'
                  ]"
                >
                  {{ step.label }}
                </p>
              </div>
            </button>
          </template>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="wizard-form-shell rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:min-h-[420px]">
          <!-- Barra lateral (mismo verde que el shell / sidebar app) -->
          <aside
            class="wizard-form-sidebar relative shrink-0 px-6 py-8 sm:px-8 sm:py-10 lg:w-[min(100%,280px)] xl:w-[300px] text-white overflow-hidden"
          >
            <div
              class="pointer-events-none absolute bottom-0 right-0 w-40 h-40 opacity-40"
              style="
                background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
                background-size: 10px 10px;
              "
              aria-hidden="true"
            />
            <p class="text-xs font-medium text-white/80 uppercase tracking-wide">
              {{ currentStepMeta.kicker }}
            </p>
            <div
              class="mt-1 flex flex-row items-start gap-4 lg:mt-1 lg:flex-col lg:items-stretch lg:gap-0"
            >
              <p
                class="shrink-0 text-5xl font-bold font-display tabular-nums tracking-tight sm:text-6xl"
              >
                {{ currentStepMeta.num }}
              </p>
              <div class="min-w-0 flex-1 pt-0.5 lg:w-full lg:max-w-none lg:pt-0">
                <h2 class="text-lg font-bold font-display leading-snug lg:mt-8">
                  {{ currentStepMeta.title }}
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-white/85 lg:max-w-[16rem]">
                  {{ currentStepMeta.desc }}
                </p>
              </div>
            </div>
          </aside>

          <div class="flex-1 min-w-0 px-5 py-6 sm:px-8 sm:py-8 lg:py-10">
      <!-- Paso 1: Información básica -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <div v-show="currentStep === 1" key="step1" class="wizard-step-content">
          <div class="space-y-5">
        <div class="relative">
          <label class="label flex items-center gap-2 text-gray-900 font-semibold">
            Nombre de la natillera <span class="text-natillera-600">*</span>
          </label>
          <div class="relative">
            <input 
              v-model="wizardForm.nombre"
              type="text" 
              class="input-field peer rounded-xl border-gray-200 text-base md:text-sm"
              placeholder="Ej: Natillera Familia González"
              autocomplete="off"
              maxlength="60"
              required
            />
          </div>
          <p
            id="wizard-nombre-charcount"
            class="mt-1 text-xs text-gray-500 tabular-nums"
            aria-live="polite"
          >{{ nombreCharCount }}/60 caracteres</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div class="relative group">
            <label class="label text-gray-900 font-semibold">Fecha de inicio <span class="text-natillera-600">*</span></label>
            <div class="relative">
              <input 
                v-model="wizardForm.fecha_inicio"
                type="date" 
                lang="es-CO"
                class="input-field peer rounded-xl border-gray-200"
                required
              />
            </div>
          </div>

          <div class="relative group">
            <label class="label text-gray-900 font-semibold">Periodicidad <span class="text-natillera-600">*</span></label>
            <div class="relative">
              <select v-model="wizardForm.periodicidad" class="input-field peer appearance-none cursor-pointer rounded-xl border-gray-200" required>
                <option value="">Selecciona...</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-natillera-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <label class="label text-gray-900 font-semibold">Descripción <span class="text-gray-400 font-normal">(opcional)</span></label>
          <textarea 
            v-model="wizardForm.descripcion"
            class="input-field peer resize-none rounded-xl border-gray-200 text-base md:text-sm"
            rows="3"
            maxlength="200"
            placeholder="Describe el propósito de esta natillera (opcional)"
            autocomplete="off"
          ></textarea>
          <p
            id="wizard-desc-charcount"
            class="mt-1 text-xs text-gray-500 tabular-nums"
            aria-live="polite"
          >{{ descripcionCharCount }}/200 caracteres</p>
        </div>
          </div>
        </div>
      </Transition>

      <!-- Paso 2: Configuración del Período -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <div v-show="currentStep === 2" key="step2" class="wizard-step-content space-y-6">
      <div class="relative p-4 sm:p-6 rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden">
        <div class="relative">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5 text-base sm:text-lg">
            <div class="p-1.5 bg-[#166534] rounded-lg shadow-sm">
              <CalendarDaysIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span>Período de la <span class="text-natillera-700">Natillera</span></span>
          </h3>
          
          <div class="space-y-3 sm:space-y-5">
            <div class="p-3 sm:p-4 bg-white border border-natillera-100 rounded-xl">
              <p class="text-xs sm:text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-natillera-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Selecciona el <strong>período de duración</strong> de la natillera (mes y año de inicio y fin). Los valores se calculan automáticamente y puedes ajustarlos desde aquí o más adelante.</span>
              </p>
            </div>

            <!-- Mes y Año de Inicio -->
            <div class="grid grid-cols-2 gap-2 sm:gap-4">
              <div class="relative">
                <label class="label text-gray-900 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-natillera-500"></span>
                  <span class="hidden sm:inline">Mes de Inicio</span>
                  <span class="sm:hidden">Mes Inicio</span>
                  <span class="text-natillera-600">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="wizardForm.mes_inicio" class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5 rounded-xl">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="relative">
                <label class="label text-gray-900 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-natillera-500"></span>
                  <span class="hidden sm:inline">Año de Inicio</span>
                  <span class="sm:hidden">Año Inicio</span>
                  <span class="text-natillera-600">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="wizardForm.anio_inicio" class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5 rounded-xl">
                    <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mes y Año de Fin -->
            <div class="grid grid-cols-2 gap-2 sm:gap-4">
              <div class="relative">
                <label class="label text-gray-900 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-natillera-600"></span>
                  <span class="hidden sm:inline">Mes de Fin</span>
                  <span class="sm:hidden">Mes Fin</span>
                  <span class="text-natillera-600">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="wizardForm.mes_fin" class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5 rounded-xl">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="relative">
                <label class="label text-gray-900 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-natillera-600"></span>
                  <span class="hidden sm:inline">Año de Fin</span>
                  <span class="sm:hidden">Año Fin</span>
                  <span class="text-natillera-600">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="wizardForm.anio" class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5 rounded-xl">
                    <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen del período -->
            <div class="p-3 sm:p-4 bg-natillera-50 border border-natillera-100 rounded-lg sm:rounded-xl">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg sm:text-xl">📅</span>
                  <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <strong class="text-natillera-900">{{ meses.find(m => m.value === wizardForm.mes_inicio)?.label }} {{ wizardForm.anio_inicio }}</strong>
                    <span class="text-gray-500">→</span>
                    <strong class="text-natillera-800">{{ meses.find(m => m.value === wizardForm.mes_fin)?.label }} {{ wizardForm.anio }}</strong>
                  </div>
                </div>
                <span class="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full self-start sm:self-auto">
                  {{ cantidadMeses }} {{ cantidadMeses === 1 ? 'mes' : 'meses' }}
                </span>
              </div>
            </div>

            <!-- Nota sobre período que cruza años -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-2"
              enter-to-class="opacity-100 max-h-20 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-20 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-2"
            >
              <div v-if="wizardForm.anio_inicio !== wizardForm.anio" class="p-2.5 sm:p-3 bg-amber-50/80 border border-amber-200/50 rounded-lg sm:rounded-xl">
                <p class="text-xs text-amber-700 flex items-start gap-2 leading-relaxed">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>Este período cruza de un año a otro. Ideal para natilleras que inician en diciembre y terminan el año siguiente.</span>
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
        </div>
      </Transition>

      <!-- Paso 3: Reglas de multas -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <div v-show="currentStep === 3" key="step3" class="wizard-step-content space-y-6">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-[#166534] rounded-lg shadow-sm">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Multas</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-300">
              <label for="multa_activa" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="wizardForm.multa_activa"
                  id="multa_activa"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-[#166534] peer-checked:shadow-lg peer-checked:shadow-natillera-900/25 peer-focus:ring-2 peer-focus:ring-natillera-500/40 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="wizardForm.multa_activa" class="w-4 h-4 text-natillera-700 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="wizardForm.multa_activa" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-800 font-semibold group-hover:text-gray-900 transition-colors text-sm sm:text-base">
                  Aplicar multas por pago tardío
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="wizardForm.multa_activa" class="space-y-5">
                <!-- Días de gracia -->
                <div class="relative">
                  <label class="label text-gray-900 font-semibold">Días de gracia</label>
                  <div class="relative">
                    <input 
                      v-model.number="wizardForm.dias_gracia"
                      type="number" 
                      class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 rounded-xl"
                      placeholder="3"
                      min="0"
                    />
                  </div>
                </div>

                <!-- Tipo de sanción -->
                <div class="p-4 bg-white rounded-xl border border-gray-200">
                  <label class="label font-semibold text-gray-900 mb-3 block">Tipo de Sanción</label>
                  <div class="grid grid-cols-3 gap-1.5 sm:gap-3">
                    <button 
                      type="button"
                      @click="wizardForm.tipo_sancion = 'simple'"
                      :class="['py-3 px-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-left transition-all min-w-0 min-h-[72px] sm:min-h-0', wizardForm.tipo_sancion === 'simple' ? 'border-natillera-600 bg-natillera-50' : 'border-gray-200 bg-white hover:border-natillera-200']"
                    >
                      <CurrencyDollarIcon class="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 flex-shrink-0" :class="wizardForm.tipo_sancion === 'simple' ? 'text-natillera-700' : 'text-gray-400'" />
                      <p class="font-semibold text-xs sm:text-sm text-gray-800 truncate">Simple</p>
                      <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Valor fijo</p>
                    </button>
                    <button 
                      type="button"
                      @click="wizardForm.tipo_sancion = 'escalonada'"
                      :class="['py-3 px-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-left transition-all min-w-0 min-h-[72px] sm:min-h-0', wizardForm.tipo_sancion === 'escalonada' ? 'border-natillera-600 bg-natillera-50' : 'border-gray-200 bg-white hover:border-natillera-200']"
                    >
                      <ChartBarIcon class="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 flex-shrink-0" :class="wizardForm.tipo_sancion === 'escalonada' ? 'text-natillera-700' : 'text-gray-400'" />
                      <p class="font-semibold text-xs sm:text-sm text-gray-800 truncate">Escalonada</p>
                      <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Progresiva</p>
                    </button>
                    <button 
                      type="button"
                      @click="wizardForm.tipo_sancion = 'diaria'"
                      :class="['py-3 px-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-left transition-all min-w-0 min-h-[72px] sm:min-h-0', wizardForm.tipo_sancion === 'diaria' ? 'border-natillera-600 bg-natillera-50' : 'border-gray-200 bg-white hover:border-natillera-200']"
                    >
                      <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 flex-shrink-0" :class="wizardForm.tipo_sancion === 'diaria' ? 'text-natillera-700' : 'text-gray-400'" />
                      <p class="font-semibold text-xs sm:text-sm text-gray-800 truncate">Diaria</p>
                      <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Por día de mora</p>
                    </button>
                  </div>
                </div>

                <!-- Simple -->
                <div v-if="wizardForm.tipo_sancion === 'simple'" class="space-y-4">
                  <div class="p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-900">Valor de multa por mora</label>
                    <div class="relative mt-2">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        :value="formatearValorMulta(wizardForm.valor_multa)"
                        @input="handleValorMultaInput"
                        type="text" 
                        inputmode="numeric"
                        class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 pl-8 w-full max-w-[200px] rounded-xl" 
                        placeholder="5.000"
                      />
                    </div>
                  </div>
                  
                  <!-- Resumen Simple -->
                  <div class="p-3 bg-natillera-50 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <CurrencyDollarIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-natillera-900 mb-1">Resumen: Sanción Simple</p>
                        <p class="text-xs text-gray-700">
                          Se aplicará un valor fijo de <strong>${{ formatMoney(wizardForm.valor_multa) }}</strong> por cada cuota en mora.
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Info adicional -->
                  <div class="p-3 bg-natillera-50/80 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <p class="text-xs text-gray-700">
                        💡 Puedes configurar <strong>intereses adicionales por días</strong> y <strong>devolución por mora excesiva</strong> en la sección de Configuración → Sanciones por mora.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Diaria -->
                <div v-if="wizardForm.tipo_sancion === 'diaria'" class="space-y-4">
                  <div class="p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-900">Valor por día de mora</label>
                    <p class="text-xs text-gray-500 mb-2">Por cada día de atraso se suma este valor a la sanción.</p>
                    <div class="relative mt-2">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        :value="formatearValorMulta(wizardForm.valor_multa_diaria)"
                        @input="handleValorMultaDiariaInput"
                        type="text" 
                        inputmode="numeric"
                        class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 pl-8 w-full max-w-[200px] rounded-xl" 
                        placeholder="500"
                      />
                    </div>
                  </div>
                  <!-- Resumen Diaria -->
                  <div class="p-3 bg-natillera-50 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <ClockIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-natillera-900 mb-1">Resumen: Sanción Diaria</p>
                        <p class="text-xs text-gray-700">
                          Se sumará <strong>${{ formatMoney(wizardForm.valor_multa_diaria) }}</strong> por cada día de mora después del vencimiento (y días de gracia).
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Info adicional -->
                  <div class="p-3 bg-natillera-50/80 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <p class="text-xs text-gray-700">
                        💡 Puedes configurar <strong>devolución por mora excesiva</strong> en la sección de Configuración → Sanciones por mora.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Escalonada -->
                <div v-if="wizardForm.tipo_sancion === 'escalonada'" class="space-y-4">
                  <!-- Tabla niveles -->
                  <div class="p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-900 mb-3 block">Intereses por cuotas vencidas</label>
                    <div class="space-y-3">
                      <div v-for="(nivel, index) in wizardForm.niveles_sancion" :key="index" class="flex items-center gap-3">
                        <span class="text-sm text-gray-600 w-20 flex-shrink-0">{{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}</span>
                        <div class="relative flex-1 min-w-0">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input 
                            v-model.number="nivel.valor" 
                            type="number" 
                            min="0" 
                            class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 pl-7 py-2.5 sm:py-1.5 text-base sm:text-sm w-full rounded-xl" 
                          />
                        </div>
                        <button 
                          v-if="wizardForm.niveles_sancion.length > 1" 
                          @click="eliminarNivel(index)" 
                          type="button"
                          class="text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <XMarkIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button 
                      v-if="wizardForm.niveles_sancion.length < 10" 
                      @click="agregarNivel" 
                      type="button"
                      class="mt-3 text-sm text-natillera-700 hover:text-natillera-800 font-medium flex items-center gap-1 transition-colors"
                    >
                      <PlusIcon class="w-4 h-4" /> Agregar nivel
                    </button>
                  </div>

                  <!-- Resumen Escalonada -->
                  <div class="p-3 bg-natillera-50 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <ChartBarIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-natillera-900 mb-1">Resumen: Sanción Escalonada</p>
                        <p class="text-xs text-gray-700 mb-2">
                          El valor de la multa aumenta según la cantidad de cuotas en mora del socio:
                        </p>
                        <div class="space-y-1">
                          <div v-for="(nivel, index) in wizardForm.niveles_sancion.slice(0, 3)" :key="index" class="text-xs text-gray-700">
                            • {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}: <strong>${{ formatMoney(nivel.valor) }}</strong>
                          </div>
                          <p v-if="wizardForm.niveles_sancion.length > 3" class="text-xs text-natillera-700 italic">
                            ... y {{ wizardForm.niveles_sancion.length - 3 }} nivel{{ wizardForm.niveles_sancion.length - 3 > 1 ? 'es' : '' }} más
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Info adicional -->
                  <div class="p-3 bg-natillera-50/80 rounded-lg border border-natillera-100">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-4 h-4 text-natillera-700 mt-0.5 flex-shrink-0" />
                      <p class="text-xs text-gray-700">
                        💡 Puedes configurar <strong>intereses adicionales por días</strong> y <strong>devolución por mora excesiva</strong> en la sección de Configuración → Sanciones por mora.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>

      <!-- Generación automática de cuotas (oculta en creación; configurable en Configuración de la natillera) -->
      <div v-if="false" class="relative p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border-2 border-emerald-100/50 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 animate-fade-in-up stagger-5 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-emerald-800 flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5 text-base sm:text-lg">
            <div class="p-1 sm:p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-md">
              <SparklesIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span>Generación de Cuotas Automáticas</span>
          </h3>
          
          <div class="space-y-3 sm:space-y-4">
            <!-- Toggle con mejor soporte móvil -->
            <div class="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100/50">
              <!-- Switch mejorado para móvil (usando botón en lugar de checkbox) -->
              <button 
                type="button"
                @click="wizardForm.cuotas_automaticas = !wizardForm.cuotas_automaticas"
                :class="[
                  'relative flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2',
                  wizardForm.cuotas_automaticas 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30' 
                    : 'bg-gray-300'
                ]"
              >
                <span 
                  :class="[
                    'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center',
                    wizardForm.cuotas_automaticas ? 'left-[22px]' : 'left-0.5'
                  ]"
                >
                  <svg v-if="wizardForm.cuotas_automaticas" class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </span>
              </button>
              
              <div class="flex-1 min-w-0">
                <span class="text-gray-700 font-semibold text-sm sm:text-base block mb-1">
                  Generar cuotas automáticamente
                </span>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Al agregar un nuevo socio, se crearán todas sus cuotas del período
                </p>
              </div>
            </div>

            <!-- Información explicativa -->
            <div class="p-3 sm:p-4 bg-emerald-50/80 border border-emerald-200/50 rounded-lg sm:rounded-xl">
              <p class="text-xs sm:text-sm text-emerald-700 flex items-start gap-2 leading-relaxed">
                <SparklesIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Las cuotas se generarán desde <strong>{{ meses.find(m => m.value === wizardForm.mes_inicio)?.label }} {{ wizardForm.anio_inicio }}</strong> hasta <strong>{{ meses.find(m => m.value === wizardForm.mes_fin)?.label }} {{ wizardForm.anio }}</strong>, 
                  respetando la periodicidad configurada.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Paso 4: Reglas de Préstamos -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <div v-show="currentStep === 4" key="step4" class="wizard-step-content space-y-6">
      <!-- Reglas de intereses (préstamos) -->
      <div class="relative p-5 sm:p-6 rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden">
        <div class="relative">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-[#166534] rounded-lg shadow-sm">
              <CurrencyDollarIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Préstamos</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-300">
              <label for="prestamos_activos" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="wizardForm.prestamos_activos"
                  id="prestamos_activos"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-[#166534] peer-checked:shadow-lg peer-checked:shadow-natillera-900/25 peer-focus:ring-2 peer-focus:ring-natillera-500/40 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="wizardForm.prestamos_activos" class="w-4 h-4 text-natillera-700 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="wizardForm.prestamos_activos" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-800 font-semibold group-hover:text-gray-900 transition-colors text-sm sm:text-base">
                  Permitir préstamos internos
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="wizardForm.prestamos_activos" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="label text-gray-900 font-semibold">Interés mensual (%)</label>
                  <div class="relative">
                    <input 
                      v-model.number="wizardForm.interes_prestamo"
                      type="number" 
                      class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 rounded-xl"
                      placeholder="2"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </div>
                </div>
                <div class="relative">
                  <label class="label text-gray-900 font-semibold">Plazo máximo (meses)</label>
                  <div class="relative">
                    <input 
                      v-model.number="wizardForm.plazo_maximo"
                      type="number" 
                      class="input-field bg-white border-gray-200 focus:border-natillera-500 focus:ring-natillera-500/25 rounded-xl"
                      placeholder="6"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
        </div>
      </Transition>

          </div>
        </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="error" class="mx-5 sm:mx-8 mb-4 p-4 bg-red-50/90 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </Transition>

      <div class="flex flex-col gap-4 px-5 py-4 sm:px-8 sm:py-5 border-t border-gray-200 bg-gray-50/50">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p class="text-sm text-gray-500 text-center sm:text-left shrink-0">
          Paso {{ currentStep }} de {{ steps.length }}
        </p>
        <div class="flex flex-row flex-wrap items-stretch justify-end gap-3 w-full sm:w-auto sm:flex-1 sm:min-w-0">
        <router-link
          v-if="currentStep === 1"
          to="/natilleras"
          class="btn-secondary wizard-footer-btn-outline flex-1 min-w-0 sm:flex-none sm:w-auto flex items-center justify-center text-center"
        >
          Cancelar
        </router-link>
        <button
          v-if="currentStep > 1"
          type="button"
          @click="goPrevious"
          class="btn-secondary wizard-footer-btn-outline flex-1 min-w-0 sm:flex-none sm:w-auto flex items-center justify-center gap-2"
        >
          <ChevronLeftIcon class="w-5 h-5 shrink-0" />
          Anterior
        </button>
        <button
          v-if="currentStep < 4"
          type="button"
          @click="goNext"
          class="wizard-btn-primary wizard-footer-btn-primary flex-1 min-w-0 sm:flex-none sm:w-auto sm:min-w-[152px] flex items-center justify-center gap-2 font-semibold text-white shadow-sm"
        >
          Siguiente
          <ChevronRightIcon class="w-5 h-5 shrink-0" />
        </button>
        <button
          v-if="currentStep === 4"
          type="submit"
          class="wizard-btn-primary wizard-footer-btn-primary flex-1 min-w-0 sm:flex-none sm:w-auto sm:min-w-[192px] flex items-center justify-center gap-2 font-semibold text-white shadow-sm disabled:opacity-60"
          :disabled="natillerasStore.loading"
        >
          <svg v-if="natillerasStore.loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>{{ natillerasStore.loading ? 'Creando...' : 'Crear Natillera' }}</span>
        </button>
        </div>
        </div>
      </div>
    </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { Transition } from 'vue'

import BackButton from '../../components/BackButton.vue'
import { 
  BanknotesIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  SparklesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { parseDateLocal, formatDateToLocalISO, getCurrentDateISO } from '../../utils/formatDate'

const router = useRouter()
const natillerasStore = useNatillerasStore()

const error = ref('')
const currentStep = ref(1)

const steps = [
  { id: 'basica', label: 'Datos básicos' },
  { id: 'periodo', label: 'Período' },
  { id: 'multas', label: 'Multas' },
  { id: 'prestamos', label: 'Préstamos' }
]

const stepMetaList = [
  { kicker: 'Paso 1', num: '01', title: 'Datos básicos', desc: 'Empecemos por lo esencial de tu natillera.' },
  { kicker: 'Paso 2', num: '02', title: 'Período', desc: 'Define el mes y año de inicio y fin de la natillera.' },
  { kicker: 'Paso 3', num: '03', title: 'Multas', desc: 'Configura sanciones por pago tardío si aplica.' },
  { kicker: 'Paso 4', num: '04', title: 'Préstamos', desc: 'Activa préstamos internos y sus condiciones.' }
]

const currentStepMeta = computed(() => stepMetaList[currentStep.value - 1] || stepMetaList[0])

function scrollWizardToTop() {
  const main =
    document.querySelector('main.overflow-y-auto') ||
    document.querySelector('main')
  if (main instanceof HTMLElement) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

watch(currentStep, () => {
  nextTick(scrollWizardToTop)
})

/** Mensaje de error si el paso no cumple validación; null si es válido */
function getStepValidationError(step) {
  if (step === 1) {
    if (!wizardForm.nombre?.trim()) return 'El nombre de la natillera es obligatorio.'
    if (!wizardForm.fecha_inicio) return 'La fecha de inicio es obligatoria.'
    if (!wizardForm.periodicidad) return 'Selecciona la periodicidad.'
  }
  if (step === 2) {
    if (!wizardForm.mes_inicio || !wizardForm.anio_inicio || !wizardForm.mes_fin || !wizardForm.anio) {
      return 'Completa mes y año de inicio y fin del período.'
    }
  }
  return null
}

function canNavigateToStep(targetStep) {
  if (targetStep < 1 || targetStep > 4) return false
  if (targetStep <= currentStep.value) return true
  for (let s = 1; s < targetStep; s++) {
    if (getStepValidationError(s)) return false
  }
  return true
}

function isStepperStepDisabled(stepNumber) {
  if (stepNumber <= currentStep.value) return false
  return !canNavigateToStep(stepNumber)
}

function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 4) return
  if (stepNumber === currentStep.value) return
  if (stepNumber < currentStep.value) {
    currentStep.value = stepNumber
    error.value = ''
    return
  }
  if (!canNavigateToStep(stepNumber)) {
    for (let s = 1; s < stepNumber; s++) {
      const msg = getStepValidationError(s)
      if (msg) {
        error.value = msg
        return
      }
    }
    return
  }
  currentStep.value = stepNumber
  error.value = ''
}

function validateStep(step) {
  const msg = getStepValidationError(step)
  if (msg) {
    error.value = msg
    return false
  }
  error.value = ''
  return true
}

function goNext() {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < 4) {
    currentStep.value++
    nextTick(scrollWizardToTop)
  }
}

function goPrevious() {
  if (currentStep.value <= 1) return
  currentStep.value--
  nextTick(scrollWizardToTop)
}

// Configuración de meses
const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

// Generar lista de años (desde 2 años atrás hasta 5 años adelante)
const anioActual = new Date().getFullYear()
const aniosDisponibles = computed(() => {
  const anios = []
  for (let i = anioActual - 2; i <= anioActual + 5; i++) {
    anios.push(i)
  }
  return anios
})

const wizardForm = reactive({
  nombre: '',
  fecha_inicio: getCurrentDateISO(),
  periodicidad: 'mensual',
  descripcion: '',
  // Período
  mes_inicio: new Date().getMonth() + 1, // Mes actual (1-12)
  anio_inicio: new Date().getFullYear(),
  mes_fin: 11, // Noviembre por defecto
  anio: new Date().getFullYear(),
  // Generación automática de cuotas
  cuotas_automaticas: true,
  // Multas
  multa_activa: true,
  tipo_sancion: 'simple', // 'simple', 'escalonada' o 'diaria'
  valor_multa: 5000,
  valor_multa_diaria: 500,
  dias_gracia: 3,
  niveles_sancion: [
    { cuotas: 1, valor: 4000 },
    { cuotas: 2, valor: 4500 },
    { cuotas: 3, valor: 5000 },
    { cuotas: 4, valor: 6000 }
  ],
  // Préstamos
  prestamos_activos: true,
  interes_prestamo: 2,
  plazo_maximo: 6
})

const nombreCharCount = computed(() => String(wizardForm.nombre ?? '').length)
const descripcionCharCount = computed(() => String(wizardForm.descripcion ?? '').length)

// Calcular automáticamente el período cuando cambia la fecha de inicio
watch(() => wizardForm.fecha_inicio, (nuevaFecha) => {
  if (nuevaFecha) {
    // Usar parseDateLocal para evitar problemas de zona horaria
    const fecha = parseDateLocal(nuevaFecha)
    if (!fecha || isNaN(fecha.getTime())) return
    
    const mes = fecha.getMonth() + 1 // getMonth() devuelve 0-11
    const anio = fecha.getFullYear()
    
    wizardForm.mes_inicio = mes
    wizardForm.anio_inicio = anio
    
    // Si el mes de inicio es diciembre, el año principal es el siguiente
    if (mes === 12) {
      wizardForm.anio = anio + 1
    } else {
      wizardForm.anio = anio
    }
  }
}, { immediate: true })

// Formatear dinero
function formatMoney(value) {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}

// Formatear valor de multa para el input
function formatearValorMulta(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor de multa
function handleValorMultaInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    wizardForm.valor_multa = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      wizardForm.valor_multa = numero
    }
  }
}

// Manejar input del valor de multa diaria
function handleValorMultaDiariaInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    wizardForm.valor_multa_diaria = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      wizardForm.valor_multa_diaria = numero
    }
  }
}

// Funciones para manejar niveles de sanción escalonada
function agregarNivel() {
  const ultimoNivel = wizardForm.niveles_sancion[wizardForm.niveles_sancion.length - 1]
  wizardForm.niveles_sancion.push({
    cuotas: ultimoNivel.cuotas + 1,
    valor: ultimoNivel.valor + 500
  })
}

function eliminarNivel(index) {
  if (wizardForm.niveles_sancion.length > 1) {
    wizardForm.niveles_sancion.splice(index, 1)
  }
}

// Calcular el número de meses del período
const cantidadMeses = computed(() => {
  if (wizardForm.anio_inicio === wizardForm.anio) {
    // Mismo año
    return wizardForm.mes_fin >= wizardForm.mes_inicio 
      ? wizardForm.mes_fin - wizardForm.mes_inicio + 1 
      : 12 - wizardForm.mes_inicio + wizardForm.mes_fin + 1
  } else if (wizardForm.anio > wizardForm.anio_inicio) {
    // Período cruza años
    const mesesPrimerAnio = 12 - wizardForm.mes_inicio + 1
    const mesesSegundoAnio = wizardForm.mes_fin
    const aniosIntermedios = (wizardForm.anio - wizardForm.anio_inicio - 1) * 12
    return mesesPrimerAnio + mesesSegundoAnio + aniosIntermedios
  }
  return 0
})

async function handleSubmit() {
  error.value = ''

  // Debug: Verificar la fecha antes de enviar
  console.log('📅 Fecha de inicio antes de enviar:', wizardForm.fecha_inicio)
  console.log('📅 Tipo de fecha:', typeof wizardForm.fecha_inicio)

  // Estructurar reglas_multas correctamente para activar las multas en la configuración
  const reglasMultas = wizardForm.multa_activa ? {
    activa: true,
    dias_gracia: wizardForm.dias_gracia,
    sanciones: {
      activa: true, // Esto activa las multas en la configuración
      tipo: wizardForm.tipo_sancion, // 'simple', 'escalonada' o 'diaria'
      valorFijo: wizardForm.tipo_sancion === 'simple' ? wizardForm.valor_multa : (wizardForm.niveles_sancion[0]?.valor || 0),
      valorPorDia: wizardForm.tipo_sancion === 'diaria' ? wizardForm.valor_multa_diaria : undefined,
      niveles: wizardForm.tipo_sancion === 'escalonada' ? wizardForm.niveles_sancion : [
        { cuotas: 1, valor: wizardForm.valor_multa },
        { cuotas: 2, valor: wizardForm.valor_multa },
        { cuotas: 3, valor: wizardForm.valor_multa },
        { cuotas: 4, valor: wizardForm.valor_multa }
      ],
      interesesAdicionales: {
        activo: false,
        dias: 2,
        valor: 500
      },
      devolucion: {
        activo: false,
        cuotasLimite: 5,
        porcentajeMulta: 25,
        sinUtilidades: true
      }
    }
  } : { 
    activa: false,
    sanciones: {
      activa: false
    }
  }

  // Extraer año, mes y día directamente del string para evitar cualquier problema de zona horaria
  // El input de tipo date devuelve un string YYYY-MM-DD que ya está en hora local
  let fechaInicioFinal = wizardForm.fecha_inicio
  if (typeof wizardForm.fecha_inicio === 'string' && wizardForm.fecha_inicio.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
    // El string ya está en formato YYYY-MM-DD, usarlo directamente
    // Esto evita cualquier procesamiento que pueda causar problemas de zona horaria
    fechaInicioFinal = wizardForm.fecha_inicio
  } else {
    // Si no está en formato string YYYY-MM-DD, formatearlo
    fechaInicioFinal = formatDateToLocalISO(wizardForm.fecha_inicio)
  }

  const datos = {
    nombre: wizardForm.nombre,
    // Enviar la fecha directamente como string YYYY-MM-DD
    // Supabase maneja correctamente los strings YYYY-MM-DD para campos DATE
    fecha_inicio: fechaInicioFinal,
    periodicidad: wizardForm.periodicidad,
    descripcion: wizardForm.descripcion,
    avatar_seed: wizardForm.nombre, // Usar el nombre como seed del avatar
    // Período
    mes_inicio: wizardForm.mes_inicio,
    anio_inicio: wizardForm.anio_inicio,
    mes_fin: wizardForm.mes_fin,
    anio: wizardForm.anio,
    // Generación automática de cuotas
    cuotas_automaticas: wizardForm.cuotas_automaticas,
    // Reglas
    reglas_multas: reglasMultas,
    reglas_interes: wizardForm.prestamos_activos ? {
      activo: true,
      porcentaje: wizardForm.interes_prestamo,
      plazo_maximo: wizardForm.plazo_maximo
    } : { activo: false }
  }

  // Debug: Verificar los datos que se envían
  console.log('📤 Datos a enviar:', datos)
  console.log('📤 Fecha de inicio en datos:', datos.fecha_inicio)

  const result = await natillerasStore.crearNatillera(datos)

  if (result.success) {
    // Debug: Verificar la fecha que se guardó
    console.log('✅ Natillera creada:', result.data)
    console.log('📅 Fecha de inicio guardada:', result.data.fecha_inicio)
    // Validar que el ID sea válido antes de navegar
    if (result.data.id && result.data.id !== 'undefined' && result.data.id !== 'null') {
      router.push(`/natilleras/${result.data.id}`)
    } else {
      console.warn('ID de natillera inválido después de crear, redirigiendo al dashboard', result.data.id)
      router.push('/dashboard')
    }
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.crear-natillera-wizard {
  background: linear-gradient(180deg, hsl(220 13% 96%) 0%, hsl(220 14% 94%) 100%);
}

.wizard-form-sidebar {
  background: #166534;
}

/* Píldoras: secundarios un poco más compactos; primario (Siguiente/Crear) un poco más grande */
.wizard-footer-btn-outline {
  border-radius: 9999px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.wizard-btn-primary {
  background: #166534;
  color: #fff;
  border-radius: 9999px;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.wizard-footer-btn-primary {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  line-height: 1.375rem;
}

.wizard-btn-primary:hover:not(:disabled) {
  background: #145a2d;
  box-shadow: 0 4px 14px rgba(22, 101, 52, 0.28);
}

.wizard-btn-primary:focus-visible {
  outline: 2px solid var(--color-natillera-400, #4ade80);
  outline-offset: 2px;
}

.wizard-step-content {
  animation: wizard-fade-in 0.35s ease-out;
}

@keyframes wizard-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación de pulso lento para decoraciones */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Animación de entrada escalonada */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
.stagger-7 { animation-delay: 0.7s; }
.stagger-8 { animation-delay: 0.8s; }

/* Animación scale-x para la línea decorativa */
@keyframes scale-x {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.animate-scale-x {
  animation: scale-x 0.8s ease-out 0.3s forwards;
}

/* Animación de entrada para el icono de check */
@keyframes scale-in {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* Animación shimmer para el toggle */
@keyframes shimmer-toggle {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer-toggle {
  animation: shimmer-toggle 2s ease-in-out infinite;
}
</style>

