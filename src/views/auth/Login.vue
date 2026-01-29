<template>
  <div class="w-full">
    <!-- Contenedor glassmorphism -->
    <div class="login-form-container bg-white/75 backdrop-blur-2xl rounded-3xl border-2 border-emerald-200/30 p-5 sm:p-5 lg:p-8 relative overflow-hidden sm:max-h-[90vh] overflow-y-auto" style="box-shadow: 0 20px 60px -15px rgba(16, 185, 129, 0.3), 0 10px 40px -10px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.1), 0 25px 80px -20px rgba(0, 0, 0, 0.15);">
      <!-- Tinte verde difuminado y transparente -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-200/25 via-emerald-300/20 to-teal-200/25 backdrop-blur-[80px] rounded-3xl pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-emerald-100/20 via-emerald-200/15 to-emerald-300/20 backdrop-blur-[60px] rounded-3xl pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-bl from-transparent via-emerald-200/10 to-transparent backdrop-blur-[40px] rounded-3xl pointer-events-none"></div>
      <!-- Efecto de brillo glass adicional -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/30 via-emerald-50/25 to-teal-50/25 rounded-3xl pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-3xl pointer-events-none"></div>
      
      <div class="relative z-10">
        <!-- Header con animación - centrado -->
        <div class="flex flex-col items-center gap-1 sm:gap-1.5 mb-3 sm:mb-3 animate-fade-in-up">
          <div class="relative text-center">
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-natillera-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-1 blur-[0.5px] drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              Iniciar Sesión
            </h2>
            <div class="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-natillera-400 via-emerald-400 to-teal-400 rounded-full transform scale-x-0 animate-scale-x"></div>
          </div>
          
          <div class="relative inline-flex items-center gap-1 sm:gap-1.5 lg:gap-1 xl:gap-1.5 px-2.5 sm:px-3 lg:px-1.5 xl:px-3 py-1 sm:py-1.5 lg:py-0.5 xl:py-1.5 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border border-amber-200 rounded-full shadow-sm transform hover:scale-105 transition-transform duration-300">
            <span class="relative flex items-center gap-1 sm:gap-1.5 lg:gap-0.5 xl:gap-1.5 text-amber-700 text-[9px] sm:text-[10px] lg:text-[8px] xl:text-[10px] font-bold uppercase tracking-wider">
              <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-1 lg:h-1 xl:w-1.5 xl:h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-1 lg:h-1 xl:w-1.5 xl:h-1.5 bg-amber-500 rounded-full absolute"></span>
              Versión Beta
            </span>
          </div>
        </div>

      <!-- Selector de método de login -->
      <div class="mb-2 sm:mb-3 animate-fade-in-up">
        <div class="relative flex gap-1.5 sm:gap-2 lg:gap-1 xl:gap-1.5 p-1 sm:p-1.5 lg:p-[3px] xl:p-1.5 bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-200/50">
          <!-- Efecto de fondo animado para el botón activo -->
          <div 
          :class="[
            'absolute top-1 sm:top-1.5 lg:top-[3px] xl:top-1.5 bottom-1 sm:bottom-1.5 lg:bottom-[3px] xl:bottom-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500 shadow-lg transition-all duration-300 ease-out',
            loginMethod === 'email' ? 'left-1 sm:left-1.5 lg:left-[3px] xl:left-1.5 right-1/2' : 'left-1/2 right-1 sm:right-1.5 lg:right-[3px] xl:right-1.5'
          ]"
          ></div>
          
          <button
          type="button"
          @click="loginMethod = 'email'; resetearEstadoTelefono()"
          :class="[
            'relative z-10 flex-1 flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-1.5 xl:gap-2 py-2.5 sm:py-3 lg:py-1.5 xl:py-3 px-3 sm:px-4 lg:px-2.5 xl:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base lg:text-[11px] xl:text-base transition-all duration-300',
            loginMethod === 'email' 
              ? 'text-white shadow-sm sm:shadow-md transform scale-[1.01] sm:scale-[1.02]' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 active:bg-white/70'
          ]"
        >
          <svg 
            :class="[
              'w-4 h-4 sm:w-5 sm:h-5 lg:w-3 lg:h-3 xl:w-5 xl:h-5 transition-all duration-300 flex-shrink-0',
              loginMethod === 'email' ? 'text-white' : 'text-natillera-600'
            ]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
          </svg>
          <span class="font-bold whitespace-nowrap">Email</span>
        </button>
        
        <!-- Botón de teléfono - FUNCIONALIDAD COMENTADA TEMPORALMENTE -->
        <!-- Para reactivar, agregar en la línea siguiente: @click="loginMethod = 'telefono'; resetearEstadoTelefono()" -->
        <button
          type="button"
          :class="[
            'relative z-10 flex-1 flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-1.5 xl:gap-2 py-2.5 sm:py-3 lg:py-1.5 xl:py-3 px-3 sm:px-4 lg:px-2.5 xl:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base lg:text-[11px] xl:text-base transition-all duration-300',
            loginMethod === 'telefono' 
              ? 'text-white shadow-sm sm:shadow-md transform scale-[1.01] sm:scale-[1.02]' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 active:bg-white/70'
          ]"
        >
          <svg 
            :class="[
              'w-4 h-4 sm:w-5 sm:h-5 lg:w-3 lg:h-3 xl:w-5 xl:h-5 transition-all duration-300 flex-shrink-0',
              loginMethod === 'telefono' ? 'text-white' : 'text-natillera-600'
            ]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          <span class="font-bold whitespace-nowrap">Teléfono</span>
          </button>
        </div>
      </div>

      <!-- Mensaje informativo si el teléfono ya está registrado -->
      <Transition name="error-slide">
        <div v-if="telefonoYaRegistrado && loginMethod === 'email'" class="relative overflow-hidden p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 via-indigo-50/95 to-purple-50 border border-blue-200/80 rounded-xl shadow-lg shadow-blue-500/10 animate-fade-in-up mb-3 sm:mb-4">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 animate-shimmer"></div>
          <div class="relative flex items-start gap-2 sm:gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-blue-800 font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">Cuenta ya registrada</p>
              <p class="text-blue-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                Este número de teléfono ya está asociado a una cuenta. Por favor, inicia sesión con tu correo electrónico o con Google.
              </p>
              <div class="flex flex-col gap-1.5 sm:gap-2">
                <p class="text-[10px] sm:text-xs text-blue-600" v-if="emailTelefonoRegistrado">
                  Email asociado: <strong>{{ enmascararEmail(emailTelefonoRegistrado) }}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Formulario de Login por Email -->
      <form v-if="loginMethod === 'email'" @submit.prevent="handleLogin" class="space-y-4 sm:space-y-3 animate-fade-in-up stagger-1">
        <!-- Campo Email -->
        <div class="group">
          <label class="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-1.5 flex items-center gap-1 sm:gap-1.5">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
          </svg>
            Correo electrónico
          </label>
          <div class="relative">
            <input 
            v-model="email"
            type="email" 
            class="w-full px-3 sm:px-4 py-3.5 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-natillera-500 focus:border-natillera-500 transition-all duration-200 placeholder:text-gray-500 text-base sm:text-base text-gray-900 transition-colors hover:border-natillera-400"
            placeholder="tu@correo.com"
            required
          />
          </div>
        </div>

      <!-- Campo Contraseña -->
      <div class="group">
        <label class="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-1 flex items-center gap-1 sm:gap-1.5">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Contraseña
        </label>
        <div class="relative flex w-full min-w-0 overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:ring-1 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-colors hover:border-emerald-400">
          <input 
            v-model="password"
            :type="showPassword ? 'text' : 'password'" 
            class="flex-1 min-w-0 border-0 bg-transparent px-3 sm:px-4 py-3.5 sm:py-3 pr-12 text-base text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none"
            placeholder="Ingrese su contraseña"
            required
          />
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 flex w-12 flex-shrink-0 items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 active:scale-95 z-10"
            aria-label="Mostrar/ocultar contraseña"
          >
            <EyeIcon v-if="!showPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
        </div>
        <!-- Enlace olvidé contraseña -->
        <div class="mt-2 sm:mt-1 text-right">
          <button
            type="button"
            @click="showForgotPasswordModal = true"
            class="text-xs sm:text-sm text-natillera-600 hover:text-natillera-700 font-medium transition-colors underline-offset-2 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <!-- Mensaje de error con animación mejorado -->
      <Transition name="error-slide">
        <div v-if="errorMessage" class="relative overflow-hidden p-2.5 sm:p-3 bg-gradient-to-br from-red-50 via-red-50/95 to-rose-50 border border-red-200/80 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in-up">
          <!-- Efecto de fondo animado -->
          <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-shimmer"></div>
          
          <!-- Contenido -->
          <div class="relative flex items-start gap-3">
            <!-- Icono mejorado -->
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md shadow-red-500/30">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Mensaje -->
            <div class="flex-1 min-w-0">
              <p class="text-red-800 font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">Error de autenticación</p>
              <p class="text-red-700 text-xs sm:text-sm leading-relaxed">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón de envío mejorado -->
      <button 
        type="submit" 
        class="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 via-natillera-500 to-teal-500 text-white font-semibold rounded-xl py-4 sm:py-3.5 sm:mt-6 sm:mb-4 text-base sm:text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        :disabled="authStore.loading"
      >
        <!-- Efecto shimmer -->
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <span v-if="authStore.loading" class="relative z-10 animate-spin">
          <svg class="w-5 h-5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else class="relative z-10 flex items-center gap-1.5 sm:gap-2">
          <svg class="w-5 h-5 sm:w-5 sm:h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          Ingresar
        </span>
      </button>
      </form>

      <!-- Separador (solo para login por email) -->
      <div v-if="loginMethod === 'email'" class="relative my-2.5 sm:my-3 animate-fade-in-up stagger-2">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300/50"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="px-5 py-1.5 bg-white/90 backdrop-blur-sm text-xs sm:text-sm text-gray-600 font-medium rounded-full border border-gray-200/50 shadow-sm">O continúa con</span>
        </div>
      </div>

      <!-- Botón de Google (solo para login por email) -->
      <button
        v-if="loginMethod === 'email'"
        @click="handleGoogleLogin"
        :disabled="authStore.loading"
        class="group relative w-full flex items-center justify-center gap-2 sm:gap-2.5 px-4 py-4 sm:py-2.5 bg-white border-2 border-gray-300 rounded-xl font-semibold text-base sm:text-sm text-gray-800 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-fade-in-up stagger-2"
      >
      <!-- Logo de Google -->
      <svg class="w-6 h-6 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
        <span class="whitespace-nowrap">Continuar con Google</span>
      </button>

      <!-- Formulario de Login por Teléfono con OTP -->
      <div v-else class="space-y-3 sm:space-y-4 animate-fade-in-up stagger-1">
        <!-- Paso 1: Ingresar teléfono y enviar OTP -->
        <div v-if="otpStep === 'telefono'" class="space-y-4 sm:space-y-5">
          <div class="group">
            <label class="block text-base sm:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
              Número de teléfono
            </label>
            <div class="relative">
              <input 
                v-model="telefono"
                type="tel" 
                class="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 transition-all duration-200 placeholder:text-gray-400 text-base sm:text-lg text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-natillera-300 focus:scale-[1.02] focus:shadow-xl focus:shadow-natillera-500/20"
                placeholder="300 123 4567"
                required
              />
            </div>
            <p class="mt-1 text-xs sm:text-sm text-gray-500">Ingresa tu número de teléfono. Te enviaremos un código de verificación por SMS.</p>
          </div>

        <button 
          type="button"
          @click="handleEnviarOTP"
          :disabled="authStore.loading || !telefono.trim()"
          class="group relative w-full overflow-hidden bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 text-white font-semibold rounded-xl py-2.5 sm:py-3 shadow-lg shadow-natillera-500/30 hover:shadow-xl hover:shadow-natillera-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span v-if="authStore.loading" class="relative z-10 animate-spin">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-else class="relative z-10 flex items-center gap-1.5 sm:gap-2">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Enviar código
          </span>
        </button>
      </div>

      <!-- Paso 2: Verificar código OTP -->
      <div v-else-if="otpStep === 'codigo'" class="space-y-4 sm:space-y-5">
        <div class="text-center mb-2 sm:mb-3">
          <div class="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2 shadow-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-sm sm:text-base font-bold text-gray-800 mb-0.5">Código enviado</h3>
          <p class="text-xs text-gray-600">
            Ingresa el código de 6 dígitos que enviamos a<br/>
            <span class="font-semibold text-gray-800">{{ telefono }}</span>
          </p>
        </div>

        <div class="group">
          <label class="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5 flex items-center gap-1 sm:gap-1.5">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            Código de verificación
          </label>
          <div class="relative">
            <input 
              v-model="codigoOTP"
              type="text" 
              maxlength="6"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 transition-all duration-200 placeholder:text-gray-400 text-center text-lg sm:text-xl font-bold tracking-widest text-gray-900 transition-all duration-300 hover:shadow-md hover:border-natillera-300 focus:scale-[1.01] focus:shadow-lg focus:shadow-natillera-500/20"
              placeholder="000000"
              required
              @input="codigoOTP = codigoOTP.replace(/\D/g, '')"
            />
          </div>
          <p class="mt-1 sm:mt-1.5 text-center">
            <button
              type="button"
              @click="handleReenviarOTP"
              :disabled="authStore.loading || contadorReenvio > 0"
              class="text-xs sm:text-sm text-natillera-600 hover:text-natillera-700 font-medium transition-colors underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ contadorReenvio > 0 ? `Reenviar código en ${contadorReenvio}s` : 'Reenviar código' }}
            </button>
          </p>
        </div>

        <button 
          type="button"
          @click="handleVerificarOTP"
          :disabled="authStore.loading || codigoOTP.length !== 6"
          class="group relative w-full overflow-hidden bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 text-white font-semibold rounded-xl py-2.5 sm:py-3 shadow-lg shadow-natillera-500/30 hover:shadow-xl hover:shadow-natillera-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span v-if="authStore.loading" class="relative z-10 animate-spin">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-else class="relative z-10 flex items-center gap-1.5 sm:gap-2">
            Verificar código
          </span>
        </button>

        <button 
          type="button"
          @click="otpStep = 'telefono'; codigoOTP = ''"
          class="w-full text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          ← Cambiar número de teléfono
        </button>
      </div>


      <!-- Mensaje de error para login por teléfono -->
      <Transition name="error-slide">
        <div v-if="errorMessageOTP && !telefonoYaRegistrado" class="relative overflow-hidden p-3 sm:p-4 bg-gradient-to-br from-red-50 via-red-50/95 to-rose-50 border border-red-200/80 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in-up">
          <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-shimmer"></div>
          <div class="relative flex items-start gap-2 sm:gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md shadow-red-500/30">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-red-800 font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">Error</p>
              <p class="text-red-700 text-xs sm:text-sm leading-relaxed">{{ errorMessageOTP }}</p>
            </div>
          </div>
        </div>
      </Transition>
      </div>

      <!-- Enlace de registro -->
      <div class="mt-2.5 sm:mt-3 text-center animate-fade-in-up stagger-3">
        <p class="text-xs sm:text-sm text-gray-600">
          ¿No tienes cuenta? 
          <router-link 
            to="/auth/register" 
            class="relative inline-flex items-center gap-1 text-natillera-600 font-semibold hover:text-natillera-700 transition-colors group"
          >
            <span>Regístrate aquí</span>
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-natillera-600 group-hover:w-full transition-all duration-300"></span>
          </router-link>
        </p>
      </div>
      </div>
    </div>

    <!-- Log de información del sistema (solo visible en dev mode) -->
    <div v-if="isDevMode" class="fixed top-2 left-2 z-50">
      <div class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1">
          <span class="text-emerald-400">Resolución:</span>
          <span class="text-white">{{ screenInfo.resolution }}</span>
          <span class="hidden sm:inline text-gray-400">|</span>
          <span class="text-emerald-400">Navegador:</span>
          <span class="text-white">{{ screenInfo.browser }}</span>
        </div>
      </div>
    </div>

    <!-- Modal de Olvidé mi contraseña -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showForgotPasswordModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeForgotPasswordModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-600 p-5 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-lg">Recuperar Contraseña</h3>
                  <p class="text-sm text-white/90">Te enviaremos un enlace para restablecerla</p>
                </div>
              </div>
              <button
                @click="closeForgotPasswordModal"
                class="w-9 h-9 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-5 space-y-4">
            <!-- Vista de éxito -->
            <div v-if="forgotPasswordSuccess" class="text-center py-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 class="text-lg font-display font-bold text-gray-800 mb-2">
                ¡Email enviado!
              </h4>
              <p class="text-sm text-gray-600 mb-2">
                Hemos enviado un enlace de recuperación a <strong class="text-gray-800">{{ forgotPasswordEmail }}</strong>
              </p>
              <!-- Aviso de tiempo de espera -->
              <div class="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-xs text-amber-700 font-medium">
                  El correo puede demorar hasta 5 minutos en llegar
                </p>
              </div>
              <p class="text-xs text-gray-500">
                Revisa tu bandeja de entrada y carpeta de spam. Haz clic en el enlace para restablecer tu contraseña.
              </p>
              <button
                @click="closeForgotPasswordModal"
                class="mt-5 w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Entendido
              </button>
            </div>

            <!-- Formulario -->
            <form v-else @submit.prevent="handleForgotPassword" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="forgotPasswordEmail"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 outline-none text-sm transition-all"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-500': forgotPasswordError
                  }"
                  :disabled="authStore.loading"
                  required
                />
                <p v-if="forgotPasswordError" class="mt-1 text-xs text-red-600">{{ forgotPasswordError }}</p>
                <p v-else class="mt-1 text-xs text-gray-500">
                  Ingresa el correo electrónico asociado a tu cuenta
                </p>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="closeForgotPasswordModal"
                  :disabled="authStore.loading"
                  class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="authStore.loading || !forgotPasswordEmail.trim()"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span v-else>Enviar enlace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal bloqueante de registro (no se puede cerrar) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showRegistroModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self.prevent
        @keydown.esc.prevent
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-600 p-5 text-white">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-lg">Completa tu registro</h3>
                <p class="text-sm text-white/90">Debes registrarte para continuar</p>
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6 space-y-4">
            <div class="text-center mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Tu número de teléfono ha sido verificado. Para continuar, completa tu registro con tu correo electrónico o con Google.
              </p>
              <p class="text-xs text-gray-500">
                Teléfono: <span class="font-semibold text-gray-700">{{ telefono }}</span>
              </p>
            </div>

            <!-- Opciones de registro -->
            <div class="space-y-3">
              <!-- Botón de registro con correo -->
              <router-link
                to="/auth/register"
                @click="showRegistroModal = false"
                class="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-natillera-500/30 hover:shadow-xl hover:shadow-natillera-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
                <span>Registrarse con correo</span>
              </router-link>

              <!-- Separador -->
              <div class="relative my-3">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white text-gray-500 font-medium">O</span>
                </div>
              </div>

              <!-- Botón de Google -->
              <button
                @click="handleGoogleLoginFromModal"
                :disabled="authStore.loading"
                class="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <!-- Logo de Google -->
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Registrarse con Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../lib/supabase'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { isDev, isLocalhost } from '../../config/environment'

const router = useRouter()
const authStore = useAuthStore()

// Detectar modo desarrollo
const isDevMode = isDev || isLocalhost

// Información de pantalla y navegador (para visualización en dev mode y consola)
const screenInfo = ref({
  resolution: '',
  browser: ''
})

function detectarNavegador() {
  const userAgent = navigator.userAgent
  let browser = 'Desconocido'
  
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox'
  } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browser = 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari'
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera'
  }
  
  return browser
}

function actualizarInfoPantalla() {
  const resolution = `${window.innerWidth} x ${window.innerHeight}`
  const browser = detectarNavegador()
  
  // Actualizar ref para visualización en dev mode
  if (isDevMode) {
    screenInfo.value = {
      resolution,
      browser
    }
  }
  
  // Siempre loguear en consola
  console.log('%c📱 Información del Sistema', 'color: #22c55e; font-weight: bold; font-size: 14px;')
  console.log(`%cResolución: %c${resolution}`, 'color: #86efac; font-weight: bold;', 'color: #ffffff;')
  console.log(`%cNavegador: %c${browser}`, 'color: #86efac; font-weight: bold;', 'color: #ffffff;')
  console.log('─'.repeat(50))
}

onMounted(() => {
  actualizarInfoPantalla()
  window.addEventListener('resize', actualizarInfoPantalla)
})

onUnmounted(() => {
  window.removeEventListener('resize', actualizarInfoPantalla)
})

// Watcher para cerrar el modal cuando el usuario se autentica (solo si no es el admin)
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && showRegistroModal.value) {
    // Solo cerrar el modal si el usuario NO es admin@gmail.com
    // Si es admin, el modal debe permanecer abierto hasta que se registre
    if (authStore.userEmail && authStore.userEmail !== 'admin@gmail.com') {
      showRegistroModal.value = false
      // Redirigir al dashboard después de un breve delay para que el modal se cierre
      setTimeout(() => {
        router.push('/dashboard')
      }, 300)
    }
  }
})

// Prevenir que se cierre el modal con ESC
const handleEsc = (e) => {
  if (e.key === 'Escape' && showRegistroModal.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})

// Login por email
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const showForgotPasswordModal = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordError = ref('')
const forgotPasswordSuccess = ref(false)

// Login por teléfono
const loginMethod = ref('email') // 'email' o 'telefono'
const telefono = ref('')
const codigoOTP = ref('')
const otpStep = ref('telefono') // 'telefono', 'codigo'
const errorMessageOTP = ref('')
const nombreUsuario = ref('')
const contadorReenvio = ref(0)
const showRegistroModal = ref(false) // Modal bloqueante para registro
const telefonoYaRegistrado = ref(false) // Indica si el teléfono ya está registrado
const emailTelefonoRegistrado = ref('') // Email asociado al teléfono
let intervaloReenvio = null

function closeForgotPasswordModal() {
  showForgotPasswordModal.value = false
  forgotPasswordEmail.value = ''
  forgotPasswordError.value = ''
  forgotPasswordSuccess.value = false
}

async function handleForgotPassword() {
  forgotPasswordError.value = ''
  
  if (!forgotPasswordEmail.value.trim()) {
    forgotPasswordError.value = 'Por favor ingresa tu correo electrónico'
    return
  }

  const result = await authStore.resetPassword(forgotPasswordEmail.value.trim())
  
  if (result.success) {
    forgotPasswordSuccess.value = true
  } else {
    forgotPasswordError.value = result.error || 'Error al enviar el email de recuperación'
  }
}

async function handleLogin() {
  errorMessage.value = ''
  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = result.error
  }
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  const result = await authStore.loginWithGoogle()
  
  if (!result.success) {
    errorMessage.value = result.error || 'Error al iniciar sesión con Google'
  }
}

async function handleGoogleLoginFromModal() {
  showRegistroModal.value = false
  await handleGoogleLogin()
}

// Funciones para login por teléfono
async function handleEnviarOTP() {
  errorMessageOTP.value = ''
  telefonoYaRegistrado.value = false
  emailTelefonoRegistrado.value = ''
  
  if (!telefono.value.trim()) {
    errorMessageOTP.value = 'Por favor ingresa tu número de teléfono'
    return
  }

  const result = await authStore.enviarOTPTelefono(telefono.value.trim())
  
  if (result.success) {
    // Si el teléfono pertenece a un socio y no está registrado, enviar OTP y mostrar paso de verificación
    otpStep.value = 'codigo'
    iniciarContadorReenvio()
  } else {
    // Verificar si el error es porque el teléfono ya está registrado
    if (result.error === 'YA_REGISTRADO') {
      // Mostrar mensaje de alerta primero
      telefonoYaRegistrado.value = true
      emailTelefonoRegistrado.value = result.email || ''
      errorMessageOTP.value = ''
      
      // NO prellenar el email - dejar los campos limpios por seguridad
      // El usuario debe ingresar su email manualmente
      
      // Cambiar inmediatamente a la vista de email
      // Usar nextTick para asegurar que el cambio se haga después del render actual
      await nextTick()
      // Cambiar a método de login por email
      loginMethod.value = 'email'
      // Limpiar el teléfono del formulario de teléfono
      telefono.value = ''
      otpStep.value = 'telefono'
      // Limpiar campos de email y password por seguridad
      email.value = ''
      password.value = ''
      // Mantener el mensaje de alerta visible en la vista de email
      // El mensaje se mostrará porque telefonoYaRegistrado sigue siendo true
    } else {
      errorMessageOTP.value = result.error || 'Error al enviar el código OTP'
    }
  }
}

async function handleReenviarOTP() {
  if (contadorReenvio.value > 0) return
  
  errorMessageOTP.value = ''
  codigoOTP.value = ''
  
  const result = await authStore.enviarOTPTelefono(telefono.value.trim())
  
  if (result.success) {
    iniciarContadorReenvio()
  } else {
    errorMessageOTP.value = result.error || 'Error al reenviar el código OTP'
  }
}

async function handleVerificarOTP() {
  errorMessageOTP.value = ''
  
  if (!codigoOTP.value || codigoOTP.value.length !== 6) {
    errorMessageOTP.value = 'Por favor ingresa el código de 6 dígitos'
    return
  }

  const result = await authStore.verificarOTPTelefono(telefono.value.trim(), codigoOTP.value)
  
  if (result.success) {
    if (result.requiereRegistro) {
      // Usuario genérico creado y autenticado, mostrar modal de registro
      showRegistroModal.value = true
    } else {
      // Usuario existe y está autenticado, redirigir al dashboard
      router.push('/dashboard')
    }
  } else {
    errorMessageOTP.value = result.error || 'Código OTP inválido. Por favor verifica el código e inténtalo nuevamente.'
  }
}

async function handleCrearCuenta() {
  errorMessageOTP.value = ''
  
  if (!nombreUsuario.value.trim()) {
    errorMessageOTP.value = 'Por favor ingresa tu nombre completo'
    return
  }

  const result = await authStore.loginConTelefono(
    telefono.value.trim(),
    codigoOTP.value,
    nombreUsuario.value.trim()
  )
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMessageOTP.value = result.error || 'Error al crear la cuenta'
  }
}

function iniciarContadorReenvio() {
  contadorReenvio.value = 60 // 60 segundos
  if (intervaloReenvio) {
    clearInterval(intervaloReenvio)
  }
  intervaloReenvio = setInterval(() => {
    contadorReenvio.value--
    if (contadorReenvio.value <= 0) {
      clearInterval(intervaloReenvio)
      intervaloReenvio = null
    }
  }, 1000)
}

// Limpiar intervalo al desmontar componente
onUnmounted(() => {
  if (intervaloReenvio) {
    clearInterval(intervaloReenvio)
  }
})

// Función para enmascarar email para seguridad
function enmascararEmail(email) {
  if (!email || !email.includes('@')) {
    return email
  }
  
  const [localPart, domain] = email.split('@')
  
  if (localPart.length <= 2) {
    // Si el nombre de usuario es muy corto, mostrar solo el dominio
    return `***@${domain}`
  } else if (localPart.length <= 4) {
    // Si es corto, mostrar primero y último carácter
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`
  } else {
    // Mostrar primeros 3 caracteres y últimos 2 antes del @
    const inicio = localPart.substring(0, 3)
    const fin = localPart.substring(localPart.length - 2)
    return `${inicio}***${fin}@${domain}`
  }
}

// Resetear estado cuando cambia el método de login
function resetearEstadoTelefono() {
  telefono.value = ''
  codigoOTP.value = ''
  otpStep.value = 'telefono'
  errorMessageOTP.value = ''
  nombreUsuario.value = ''
  contadorReenvio.value = 0
  telefonoYaRegistrado.value = false
  emailTelefonoRegistrado.value = ''
  if (intervaloReenvio) {
    clearInterval(intervaloReenvio)
    intervaloReenvio = null
  }
}
</script>
