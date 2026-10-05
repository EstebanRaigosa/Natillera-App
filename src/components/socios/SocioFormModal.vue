<template>
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera marca (compacta ~20% según skill: X siempre en flex, nunca absolute) -->
    <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
      <!-- Móvil: una sola fila [icono | títulos | X] -->
      <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
        <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
          <PencilIcon v-if="esEdicion" class="w-5 h-5 text-[color:var(--brand-primary)]" />
          <UserPlusIcon v-else class="w-5 h-5 text-[color:var(--brand-primary)]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display font-bold text-white text-base leading-tight">
            {{ esEdicion ? 'Editar socio' : 'Agregar socio' }}
          </h3>
          <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
            {{ esEdicion ? 'Actualiza los datos del participante' : 'Completa los datos para registrar' }}
          </p>
        </div>
        <button
          type="button"
          class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Cerrar"
          :disabled="guardando"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Desktop / tablet: bloque centrado [w-11 vacío | centro icono+títulos | X w-11] -->
      <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
        <div class="flex-1 min-w-0 flex flex-col items-center text-center">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
            <PencilIcon v-if="esEdicion" class="w-6 h-6 text-[color:var(--brand-primary)]" />
            <UserPlusIcon v-else class="w-6 h-6 text-[color:var(--brand-primary)]" />
          </div>
          <h3 class="font-display font-bold text-white text-lg leading-tight">
            {{ esEdicion ? 'Editar socio' : 'Agregar socio' }}
          </h3>
          <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
            {{ esEdicion ? 'Actualiza los datos del participante' : 'Completa los datos para registrar un nuevo socio' }}
          </p>
        </div>
        <button
          type="button"
          class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Cerrar"
          :disabled="guardando"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="areaScroll"
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="programarNatiscroll"
      >
        <form
          
          class="space-y-5 px-5 sm:px-6 pt-5 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))]"
          @submit.prevent="emit('guardar')"
        >
          <!-- Avatar -->
          <div>
            <label class="ds-label">Avatar del socio</label>
            <div class="flex items-center gap-3">
              <img
                :src="getAvatarUrl(form.avatar_seed || 'nuevo', form.avatar_seed, form.avatar_style)"
                alt="Avatar seleccionado"
                class="w-14 h-14 rounded-full bg-[color:var(--brand-primary-soft)] border border-[color:var(--surface-divider-strong)] object-cover flex-shrink-0"
              />
              <button
                type="button"
                class="ds-btn ds-btn--secondary"
                :aria-expanded="mostrarAvatares"
                @click="mostrarAvatares = !mostrarAvatares"
              >
                <SparklesIcon class="w-4 h-4" />
                {{ mostrarAvatares ? 'Ocultar opciones' : 'Cambiar avatar' }}
              </button>
            </div>
            <div
              v-show="mostrarAvatares"
              class="mt-3 rounded-[var(--radius-md)] border border-[color:var(--surface-divider)] bg-[color:var(--surface-muted)] overflow-hidden"
            >
              <div class="grid grid-cols-5 gap-2 p-3 max-h-52 overflow-y-auto">
                <button
                  v-for="seed in avatarSeeds"
                  :key="seed"
                  type="button"
                  :aria-label="`Elegir avatar ${seed}`"
                  :class="[
                    'p-1 rounded-[var(--radius-md)] transition-all touch-manipulation',
                    form.avatar_seed === seed
                      ? 'ring-2 ring-[color:var(--brand-primary)] bg-superficie-tarjeta'
                      : 'hover:bg-white/70 oscuro:hover:bg-superficie-tarjeta/70'
                  ]"
                  @click="form.avatar_seed = seed; mostrarAvatares = false"
                >
                  <img
                    :src="getAvatarUrl(seed, seed, form.avatar_style)"
                    :alt="seed"
                    class="w-10 h-10 rounded-[var(--radius-sm)] object-cover"
                    loading="lazy"
                    @error="handleAvatarError($event, seed)"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Nombre -->
          <div>
            <label for="agregar-socio-nombre" class="ds-label">
              Nombre completo <span class="text-[color:var(--brand-danger)] oscuro:text-peligro">*</span>
            </label>
            <input
              id="agregar-socio-nombre"
              ref="inputNombre"
              v-model="form.nombre"
              type="text"
              class="ds-input"
              placeholder="Ej: María García"
              required
            />
          </div>

          <!-- Periodicidad -->
          <div>
            <label class="ds-label">Periodicidad de pago</label>
            <div :class="periodicidadNatillera === 'mensual' ? '' : 'grid grid-cols-2 gap-2.5'">
              <button
                type="button"
                :disabled="periodicidadNatillera === 'mensual'"
                :class="[
                  'periodicidad-opcion',
                  form.periodicidad === 'mensual' ? 'periodicidad-opcion--activa' : '',
                  periodicidadNatillera === 'mensual' ? 'periodicidad-opcion--unica' : ''
                ]"
                @click="periodicidadNatillera !== 'mensual' && (form.periodicidad = 'mensual')"
              >
                <CalendarIcon class="w-5 h-5 flex-shrink-0" />
                <div class="min-w-0 flex-1 text-left">
                  <p class="font-semibold text-sm leading-tight">Mensual</p>
                  <p class="text-[0.6875rem] text-slate-500 oscuro:text-texto-suave mt-0.5">1 cuota por mes</p>
                </div>
                <span
                  v-if="periodicidadNatillera === 'mensual'"
                  class="ds-badge ds-badge--brand flex-shrink-0"
                >
                  Único
                </span>
                <CheckCircleIcon
                  v-else-if="form.periodicidad === 'mensual'"
                  class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta flex-shrink-0"
                />
              </button>
              <button
                v-if="periodicidadNatillera === 'quincenal'"
                type="button"
                :class="[
                  'periodicidad-opcion',
                  form.periodicidad === 'quincenal' ? 'periodicidad-opcion--activa' : ''
                ]"
                @click="form.periodicidad = 'quincenal'"
              >
                <CalendarDaysIcon class="w-5 h-5 flex-shrink-0" />
                <div class="min-w-0 flex-1 text-left">
                  <p class="font-semibold text-sm leading-tight">Quincenal</p>
                  <p class="text-[0.6875rem] text-slate-500 oscuro:text-texto-suave mt-0.5">2 cuotas por mes</p>
                </div>
                <CheckCircleIcon
                  v-if="form.periodicidad === 'quincenal'"
                  class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta flex-shrink-0"
                />
              </button>
            </div>
            <p v-if="periodicidadNatillera === 'mensual'" class="text-xs text-slate-500 oscuro:text-texto-suave mt-2">
              Esta natillera está configurada como mensual.
            </p>
          </div>

          <!-- Cuota (campo destacado) -->
          <div class="cuota-bloque">
            <label for="agregar-socio-cuota" class="ds-label flex items-center gap-1.5">
              <CurrencyDollarIcon class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" />
              {{ textoLabelCuota }} <span class="text-[color:var(--brand-danger)] oscuro:text-peligro">*</span>
            </label>
            <div class="relative">
              <span class="cuota-bloque__prefix">$</span>
              <input
                id="agregar-socio-cuota"
                :value="formatearValorCuota(form.valor_cuota)"
                type="text"
                inputmode="numeric"
                class="ds-input cuota-bloque__input"
                placeholder="120.000"
                required
                @input="handleValorCuotaInput($event)"
                @focus="seleccionarMontoCuota"
                @click="seleccionarMontoCuota"
                @blur="handleValorCuotaBlur"
              />
            </div>
            <p class="text-xs text-[color:var(--brand-primary)] oscuro:text-marca-tinta mt-2">
              Valor que el socio aportará en cada período.
            </p>

            <!-- Aviso al editar (callout warning consistente con DS) -->
            <div v-if="esEdicion" class="cuota-aviso">
              <ExclamationTriangleIcon class="w-4 h-4 text-amber-700 oscuro:text-amber-300 flex-shrink-0 mt-0.5" />
              <p class="text-xs text-amber-800 oscuro:text-amber-300 flex-1 leading-snug">
                Este cambio afectará todas las cuotas generadas para este socio.
              </p>
              <div class="relative flex-shrink-0">
                <button
                  type="button"
                  data-advertencia-button
                  class="inline-flex items-center justify-center w-11 h-11 -m-2 text-amber-700 oscuro:text-amber-300 hover:text-amber-900 oscuro:hover:text-amber-300 hover:bg-amber-100 oscuro:hover:bg-amber-500/15 rounded-full transition-colors touch-manipulation"
                  title="Ver más detalles"
                  aria-label="Ver detalles del impacto"
                  @click.stop="mostrarAdvertenciaCuota = !mostrarAdvertenciaCuota"
                >
                  <InformationCircleIcon class="w-4 h-4" />
                </button>
                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 translate-y-2 scale-95"
                  enter-to-class="opacity-100 translate-y-0 scale-100"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0 scale-100"
                  leave-to-class="opacity-0 translate-y-2 scale-95"
                >
                  <div
                    v-show="mostrarAdvertenciaCuota"
                    data-advertencia-tooltip
                    class="absolute bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-2rem)] p-3 bg-amber-50 oscuro:bg-amber-500/15 border border-amber-200 oscuro:border-amber-500/30 rounded-[var(--radius-md)] shadow-xl z-50"
                    @click.stop
                  >
                    <div class="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-amber-50 oscuro:bg-amber-500/15 border-r border-b border-amber-200 oscuro:border-amber-500/30"></div>
                    <p class="text-xs font-semibold text-amber-900 oscuro:text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                      Al modificar este valor:
                    </p>
                    <ul class="text-[11px] text-amber-800 oscuro:text-amber-300 space-y-1.5 leading-relaxed">
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-600 oscuro:text-amber-300 mt-0.5 flex-shrink-0">•</span>
                        <span>Se actualizarán <strong>todas las cuotas</strong> generadas para este socio.</span>
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-600 oscuro:text-amber-300 mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Valor mayor:</strong> las cuotas pagadas pasan a pagos parciales.</span>
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-600 oscuro:text-amber-300 mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Valor menor:</strong> se mantienen pagadas con nota.</span>
                      </li>
                    </ul>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!--
            Natillera que empezó antes de pasarse a la app: las cuotas de los meses anteriores
            se generan igual y, sin esto, el socio nace en mora aunque ya las haya pagado.
            Solo al crear, y solo si la natillera ya empezó (lo decide quien abre el modal).
          -->
          <div v-if="!esEdicion && ofrecerAlDia" class="al-dia" :class="{ 'is-activo': form.al_dia }">
            <label class="al-dia__check">
              <input v-model="form.al_dia" type="checkbox" class="al-dia__input" />
              <span class="min-w-0">
                <span class="al-dia__titulo">Ya está al día con las cuotas anteriores</span>
                <span class="al-dia__texto">Se registran como pagadas, cada una en su fecha límite y sin multa.</span>
              </span>
            </label>
            <div v-if="form.al_dia" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 pl-8">
              <span class="text-xs font-semibold text-slate-600 oscuro:text-texto-secundario">Cómo pagó</span>
              <SwitchSegmentado v-model="form.al_dia_forma_pago" :opciones="OPCIONES_FORMA_PAGO" />
              <!-- Opcional, como en el pago normal: el 4×1000 solo aplica a transferencias -->
              <label v-if="form.al_dia_forma_pago === 'transferencia'" class="flex min-h-[44px] cursor-pointer touch-manipulation items-center gap-2 text-sm font-semibold text-slate-700 oscuro:text-texto-medio">
                <input v-model="form.al_dia_4x1000" type="checkbox" class="h-5 w-5 rounded border-borde-fuerte accent-[#1B5E37]" />
                Cobrar 4×1000
              </label>
            </div>
          </div>

          <!-- Teléfono -->
          <div>
            <label for="agregar-socio-telefono" class="ds-label flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5">
                <PhoneIcon class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" />
                Teléfono / WhatsApp <span class="text-[color:var(--brand-danger)] oscuro:text-peligro">*</span>
              </span>
              <span class="text-[0.6875rem] font-normal text-slate-500 oscuro:text-texto-suave">único por socio</span>
            </label>
            <div class="flex gap-2">
              <input
                id="agregar-socio-telefono"
                v-model="form.telefono"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                class="ds-input flex-1"
                :class="{ 'ds-input--error': errorTelefonoDuplicado || !!errorFormatoTelefono }"
                :aria-invalid="errorTelefonoDuplicado || !!errorFormatoTelefono"
                aria-describedby="agregar-socio-telefono-ayuda"
                placeholder="3001234567"
                required
                @blur="emit('update:telefonoTocado', true)"
              />
              <button
                v-if="contactPickerDisponible"
                type="button"
                class="ds-btn ds-btn--secondary flex-shrink-0 !px-3"
                title="Seleccionar contacto del teléfono"
                aria-label="Seleccionar contacto"
                @click.stop.prevent="abrirSelectorContactos"
              >
                <UserIcon class="w-4 h-4" />
                <span class="hidden sm:inline">Contactos</span>
              </button>
            </div>
            <p v-if="errorTelefonoDuplicado" id="agregar-socio-telefono-ayuda" class="text-xs text-[color:var(--brand-danger)] oscuro:text-peligro font-medium mt-1.5">
              Este número de teléfono ya está registrado para otro socio.
            </p>
            <p v-else-if="errorFormatoTelefono" id="agregar-socio-telefono-ayuda" class="text-xs text-[color:var(--brand-danger)] oscuro:text-peligro font-medium mt-1.5">
              {{ errorFormatoTelefono }}
            </p>
            <p v-else id="agregar-socio-telefono-ayuda" class="text-xs text-slate-500 oscuro:text-texto-suave mt-1.5 leading-snug">
              Celular de 10 dígitos, único por socio. Si es de otro país, escríbelo con + y el indicativo (+52…). Se usa para WhatsApp y para que entre a la app.
              <span v-if="contactPickerDisponible" class="block">
                Usa el botón “Contactos” para elegir desde tu agenda.
              </span>
            </p>
          </div>

          <!-- Información de contacto adicional (colapsable) -->
          <div class="rounded-[var(--radius-lg)] border border-[color:var(--surface-divider)] overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[color:var(--surface-muted)] hover:bg-[color:var(--brand-primary-soft)] transition-colors text-left touch-manipulation min-h-[48px]"
              :aria-expanded="mostrarContacto"
              @click="mostrarContacto = !mostrarContacto"
            >
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 oscuro:text-texto-medio">
                <EnvelopeIcon class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" />
                Información de contacto adicional
                <span class="text-slate-400 oscuro:text-texto-tenue font-normal">(opcional)</span>
              </span>
              <ChevronDownIcon
                :class="['w-5 h-5 text-slate-400 oscuro:text-texto-tenue transition-transform flex-shrink-0', mostrarContacto ? 'rotate-180' : '']"
              />
            </button>
            <div v-show="mostrarContacto" class="p-4 space-y-4 border-t border-[color:var(--surface-divider)]">
              <div>
                <label for="agregar-socio-email" class="ds-label">Correo electrónico</label>
                <input
                  id="agregar-socio-email"
                  v-model="form.email"
                  type="email"
                  class="ds-input"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label for="agregar-socio-documento" class="ds-label">Documento de identidad</label>
                <input
                  id="agregar-socio-documento"
                  v-model="form.documento"
                  type="text"
                  class="ds-input"
                  placeholder="Cédula (opcional)"
                />
              </div>
            </div>
          </div>

          <!-- Error global -->
          <div v-if="error" class="ds-callout bg-[#fee2e2] oscuro:bg-red-500/15 text-[#991b1b] oscuro:text-red-300" role="alert">
            <ExclamationCircleIcon class="w-5 h-5 ds-callout__icon text-[#b91c1c] oscuro:text-red-300" />
            <div>{{ error }}</div>
          </div>

          <!-- Acciones (mismo scroll, safe-area) -->
          <div class="pt-4 border-t border-[color:var(--surface-divider)] space-y-2.5">
            <!-- El admin es el responsable de los datos de sus socios (Ley 1581): lo declara al registrarlos -->
            <p v-if="!esEdicion" class="text-xs text-slate-500 oscuro:text-texto-suave">
              Al agregarlo confirmas que tienes su autorización para registrar sus datos.
            </p>
            <button
              type="submit"
              class="btn-modal-primary relative w-full overflow-hidden"
              :disabled="guardando"
            >
              <span :class="['inline-flex items-center justify-center gap-2 transition-opacity', guardando ? 'opacity-0' : 'opacity-100']">
                <CheckIcon class="w-5 h-5" />
                {{ esEdicion ? 'Guardar cambios' : 'Agregar socio' }}
              </span>
              <span
                v-if="guardando"
                class="absolute inset-0 inline-flex items-center justify-center gap-2"
              >
                <CargaBoton pequena />
                <span>Guardando…</span>
              </span>
            </button>
            <button
              type="button"
              class="btn-modal-secondary w-full"
              :disabled="guardando"
              @click="cerrar"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div
        v-show="hayNatiscroll"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        aria-hidden="true"
      >
        <div
          class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
          aria-hidden="true"
        />
        <div
          class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
        >
          <div
            class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
          >
            <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
              Desliza para ver más
            </p>
            <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
          </div>
        </div>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import {
  CalendarDaysIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilIcon,
  PhoneIcon,
  SparklesIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import CargaBoton from '../carga/CargaBoton.vue'
import SwitchSegmentado from '../SwitchSegmentado.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { detectIosPlatform } from '../../composables/useIsIos'
import { useNotificationStore } from '../../stores/notifications'
import { normalizarCelular, errorCelular } from '../../utils/telefono'
import { avatarSeeds, getAvatarUrl } from '../../utils/avatarSocio'

/*
 * Formulario de socio (agregar y editar), compartido por Socios y Cuotas.
 *
 * Solo pinta y maneja lo propio del formulario (avatar, cuota con separadores, selector de
 * contactos, avisos). Guardar lo decide quien lo abre: emite `guardar` y recibe `guardando`
 * y `error`. Así Socios conserva su flujo de alta (con progreso y recorrido) y Cuotas solo
 * edita, pero las dos usan el mismo formulario y la misma regla de edición (useEditarSocio).
 *
 * `form` es un objeto reactivo del padre y se edita en sitio: es el estado del formulario,
 * y el padre lo necesita tal cual para guardar.
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  /** Reactivo con la forma de `formularioSocioVacio()`. */
  form: { type: Object, required: true },
  esEdicion: { type: Boolean, default: false },
  /** Periodicidad de la natillera: si es mensual, el socio solo puede ser mensual. */
  periodicidadNatillera: { type: String, default: 'mensual' },
  guardando: { type: Boolean, default: false },
  error: { type: String, default: '' },
  errorTelefonoDuplicado: { type: Boolean, default: false },
  /** El aviso de formato del teléfono sale al salir del campo o al llegar a 10 dígitos. */
  telefonoTocado: { type: Boolean, default: false },
  /** Mostrar «Ya está al día»: la natillera ya empezó y el socio nacería con cuotas vencidas. */
  ofrecerAlDia: { type: Boolean, default: false }
})

const OPCIONES_FORMA_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' }
]

const emit = defineEmits(['guardar', 'cerrar', 'update:telefonoTocado', 'selector-contactos'])

const notificationStore = useNotificationStore()

const mostrarAvatares = ref(false)
const mostrarContacto = ref(false)
const mostrarAdvertenciaCuota = ref(false)
const inputNombre = ref(null)

const errorFormatoTelefono = computed(() => {
  const escrito = props.form.telefono || ''
  if (!props.telefonoTocado && normalizarCelular(escrito).length < 10) return ''
  return errorCelular(escrito)
})

const textoLabelCuota = computed(() => {
  if (props.form.periodicidad === 'quincenal') return 'Valor de la cuota quincenal'
  if (props.form.periodicidad === 'semanal') return 'Valor de la cuota semanal'
  return 'Valor de la cuota mensual'
})

function cerrar() {
  if (props.guardando) return
  emit('cerrar')
}

useBodyScrollLock(computed(() => props.show))

// ---- Natiscroll («Desliza para ver más») ----
const areaScroll = ref(null)
const hayNatiscroll = ref(false)
let rafNatiscroll = null

function actualizarNatiscroll() {
  const el = areaScroll.value
  if (!el || !props.show) {
    hayNatiscroll.value = false
    return
  }
  hayNatiscroll.value = el.scrollHeight > el.clientHeight + 1 && el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscroll() {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(() => {
    rafNatiscroll = null
    actualizarNatiscroll()
  })
}

watch(() => props.show, abierto => {
  if (!abierto) {
    hayNatiscroll.value = false
    mostrarAvatares.value = false
    mostrarContacto.value = false
    mostrarAdvertenciaCuota.value = false
    return
  }
  nextTick(() => {
    programarNatiscroll()
    requestAnimationFrame(() => {
      // Sin scroll: en iOS el foco con scroll mueve la hoja entera.
      try {
        inputNombre.value?.focus({ preventScroll: true })
      } catch {
        inputNombre.value?.focus()
      }
    })
  })
})

watch([mostrarContacto, mostrarAvatares, () => props.esEdicion], () => {
  if (props.show) nextTick(() => programarNatiscroll())
}, { flush: 'post' })

// ---- Cuota con separadores de miles ----
// Formatear valor de cuota con separadores de miles
function formatearValorCuota(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor de cuota
function handleValorCuotaInput(event) {
  const valorOriginal = event.target.value
  // Remover puntos (separadores de miles) y cualquier carácter no numérico
  const valorLimpio = valorOriginal.replace(/\./g, '').replace(/[^\d]/g, '')
  
  if (valorLimpio === '' || valorLimpio === '0') {
    props.form.valor_cuota = 0
  } else {
    // Usar parseFloat para manejar números grandes correctamente (parseInt tiene límites)
    const numero = parseFloat(valorLimpio)
    if (!isNaN(numero) && numero > 0) props.form.valor_cuota = numero
  }
}

function seleccionarMontoCuota(event) {
  const input = event?.target
  if (!input || typeof input.select !== 'function') return
  // El click puede mover el cursor después de seleccionar; diferimos el select()
  setTimeout(() => input.select(), 0)
}

// Manejar blur del input para validar el valor final
function handleValorCuotaBlur(event) {
  // Si el valor es 0, asegurar que el campo esté vacío visualmente
  if (props.form.valor_cuota === 0) {
    event.target.value = ''
  }
}

function handleAvatarError(event, seed) {
  // Si falla la carga, intentar con un seed por defecto
  const img = event.target
  const fallbackSeed = seed || img.alt || 'default'
  // Intentar con un seed simple sin caracteres especiales
  const simpleSeed = fallbackSeed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  img.src = getAvatarUrl(simpleSeed, simpleSeed, 'adventurer')
}

// ---- Selector de contactos (Contact Picker API: solo Chrome/Edge en Android) ----
const contactPickerDisponible = ref(false)
const razonNoDisponible = ref('')

// Función auxiliar para detectar si estamos en un dispositivo móvil
// detectIosPlatform cubre el iPad que se anuncia como MacIntel, que el regex dejaba fuera.
function esDispositivoMovil() {
  if (detectIosPlatform()) return true
  if (/Android/i.test(navigator.userAgent)) return true
  return window.innerWidth <= 768 && 'ontouchstart' in window
}

// Detectar Safari (macOS / iOS) — no soporta Contact Picker API.
function esSafari() {
  const ua = navigator.userAgent || ''
  // Safari sin ser Chrome/Edge/Opera/Brave/Firefox
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|EdgiOS|FxiOS|OPR|OPiOS|Brave/i.test(ua)
}

function detectarSelectorContactos() {
  // Lista de exclusión: contextos donde la Contact Picker API NO existe.
  // Ocultar el botón directamente para no exponer una funcionalidad rota.
  if (detectIosPlatform()) {
    razonNoDisponible.value = 'iOS no soporta la selección de contactos vía web.'
    contactPickerDisponible.value = false
    return
  }
  if (esSafari()) {
    razonNoDisponible.value = 'Safari no soporta la selección de contactos vía web.'
    contactPickerDisponible.value = false
    return
  }

  // Solo dispositivos móviles (la API es exclusivamente móvil; en desktop no existe).
  const esMovil = esDispositivoMovil()
  if (!esMovil) {
    razonNoDisponible.value = 'La función de contactos solo está disponible en dispositivos móviles'
    contactPickerDisponible.value = false
    return
  }

  // Requiere contexto seguro (HTTPS o localhost).
  if (!window.isSecureContext) {
    razonNoDisponible.value = 'Necesitas HTTPS para usar el selector de contactos.'
    contactPickerDisponible.value = false
    return
  }

  // Verificación final: la API debe existir y exponer un método select/pick callable.
  try {
    const contactsApi = navigator.contacts
    if (contactsApi && typeof contactsApi.select === 'function') {
      contactPickerDisponible.value = true
      razonNoDisponible.value = ''
    } else if (contactsApi && typeof contactsApi.pick === 'function') {
      contactPickerDisponible.value = true
      razonNoDisponible.value = ''
    } else {
      contactPickerDisponible.value = false
      razonNoDisponible.value = 'Esta función requiere Chrome o Edge actualizados en Android.'
    }
  } catch {
    contactPickerDisponible.value = false
    razonNoDisponible.value = 'No se pudo verificar la API de contactos en este navegador.'
  }
}

onMounted(detectarSelectorContactos)

// Función para abrir el selector de contactos del dispositivo móvil
async function abrirSelectorContactos() {
  // Activar la bandera ANTES de cualquier acción async para que cualquier
  // popstate disparado por el browser durante el ciclo del picker se ignore.
  emit('selector-contactos', true)

  try {
    // El Contact Picker API requiere contexto seguro (HTTPS o localhost)
    if (!window.isSecureContext) {
      notificationStore.error(
        'Necesitas abrir la app por HTTPS para usar el selector de contactos.',
        'Conexión no segura',
        3500
      )
      return
    }

    // Verificar si la API está disponible
    if (!('contacts' in navigator)) {
      notificationStore.error(
        'El selector de contactos no está disponible en este navegador',
        'Función no disponible',
        3000
      )
      return
    }

    let contactos = null

    // Intentar usar la Contact Picker API estándar (Chrome/Edge en Android)
    if ('select' in navigator.contacts) {
      try {
        const props = ['tel']
        const opts = { multiple: false }
        contactos = await navigator.contacts.select(props, opts)
      } catch (error) {
        console.error('Error al usar navigator.contacts.select:', error)
        // Intentar con API alternativa
        if ('pick' in navigator.contacts) {
          contactos = await navigator.contacts.pick({ filterBy: ['tel'], multiple: false })
        }
      }
    } else if ('pick' in navigator.contacts) {
      // API alternativa
      contactos = await navigator.contacts.pick({ filterBy: ['tel'], multiple: false })
    }

    if (contactos && contactos.length > 0) {
      const contacto = contactos[0]
      
      // Extraer el número de teléfono - manejar diferentes formatos de respuesta
      let numeroTelefono = ''
      
      // Formato 1: contacto.tel (array de strings)
      if (contacto.tel && Array.isArray(contacto.tel) && contacto.tel.length > 0) {
        numeroTelefono = contacto.tel[0]
      } 
      // Formato 2: contacto.tel (string único)
      else if (contacto.tel && typeof contacto.tel === 'string') {
        numeroTelefono = contacto.tel
      }
      // Formato 3: contacto.phoneNumbers (array de objetos)
      else if (contacto.phoneNumbers && Array.isArray(contacto.phoneNumbers) && contacto.phoneNumbers.length > 0) {
        const phoneNumber = contacto.phoneNumbers[0]
        numeroTelefono = phoneNumber.value || phoneNumber.number || phoneNumber.tel || phoneNumber
      }
      // Formato 4: contacto.phoneNumber (string único)
      else if (contacto.phoneNumber && typeof contacto.phoneNumber === 'string') {
        numeroTelefono = contacto.phoneNumber
      }

      if (numeroTelefono) {
        // Limpiar y formatear el número
        props.form.telefono = normalizarCelular(numeroTelefono)
        
        // También intentar llenar el nombre si está vacío
        if (!props.form.nombre) {
          if (contacto.name) {
            props.form.nombre = Array.isArray(contacto.name) ? contacto.name[0] : contacto.name
          } else if (contacto.displayName) {
            props.form.nombre = contacto.displayName
          } else if (contacto.givenName) {
            const nombreCompleto = [contacto.givenName, contacto.familyName].filter(Boolean).join(' ')
            if (nombreCompleto) {
              props.form.nombre = nombreCompleto
            }
          }
        }

        // También intentar llenar el email si está vacío
        if (!props.form.email) {
          if (contacto.email) {
            props.form.email = Array.isArray(contacto.email) ? contacto.email[0] : contacto.email
          } else if (contacto.emails && Array.isArray(contacto.emails) && contacto.emails.length > 0) {
            const emailObj = contacto.emails[0]
            props.form.email = emailObj.value || emailObj.address || emailObj
          }
        }

        notificationStore.success(
          'Contacto seleccionado correctamente',
          'Éxito',
          2000
        )
      } else {
        notificationStore.warning(
          'El contacto seleccionado no tiene número de teléfono',
          'Sin teléfono',
          3000
        )
      }
    } else {
      // El usuario canceló la selección - no mostrar error
    }
  } catch (error) {
    console.error('Error al abrir selector de contactos:', error)
    
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
      notificationStore.warning(
        'Permiso denegado o acción cancelada',
        'Acceso a contactos',
        3000
      )
    } else if (error.name === 'NotSupportedError') {
      notificationStore.error(
        'El selector de contactos no está soportado en este dispositivo',
        'Función no soportada',
        3000
      )
    } else {
      notificationStore.error(
        'Error al acceder a los contactos: ' + (error.message || 'Error desconocido'),
        'Error',
        4000
      )
    }
  } finally {
    // Quien abre el formulario decide cuánto más ignorar el popstate tras cerrar el picker.
    emit('selector-contactos', false)
  }
}

// ---- Tooltip del aviso de cuota ----
// Listener para cerrar el tooltip cuando se hace click fuera
let clickOutsideListener = null

watch(mostrarAdvertenciaCuota, (isOpen) => {
  if (isOpen) {
    // Agregar listener después de que Vue renderice
    nextTick(() => {
      clickOutsideListener = (event) => {
        const tooltip = document.querySelector('[data-advertencia-tooltip]')
        const button = event.target.closest('[data-advertencia-button]')
        
        if (tooltip && !tooltip.contains(event.target) && !button) {
          mostrarAdvertenciaCuota.value = false
        }
      }
      document.addEventListener('click', clickOutsideListener)
    })
  } else {
    // Remover listener cuando se cierra
    if (clickOutsideListener) {
      document.removeEventListener('click', clickOutsideListener)
      clickOutsideListener = null
    }
  }
})

onUnmounted(() => {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  if (clickOutsideListener) document.removeEventListener('click', clickOutsideListener)
})
</script>

<style scoped>
/* «Ya está al día» (solo al crear): tarjeta con casilla; se tiñe de verde al marcarla */
.al-dia {
  border: 1px solid var(--surface-divider);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.875rem;
  background: #fff;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.al-dia.is-activo {
  border-color: rgba(27, 94, 55, 0.35);
  background: #f0f7f2;
}
.al-dia__check {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-height: 44px;
  cursor: pointer;
  touch-action: manipulation;
}
.al-dia__input {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
  border-radius: 0.25rem;
  accent-color: var(--brand-primary);
}
.al-dia__titulo {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}
.al-dia__texto {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

/* Selector de periodicidad (Mensual / Quincenal) — tonos verde marca */
.periodicidad-opcion {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 0.875rem;
  min-height: 56px;
  background: #fff;
  border: 1.5px solid var(--surface-divider-strong);
  border-radius: var(--radius-lg);
  color: #475569;
  cursor: pointer;
  transition: border-color var(--transition-base),
              background-color var(--transition-base),
              box-shadow var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  text-align: left;
}
.periodicidad-opcion:hover:not(:disabled) {
  border-color: rgba(27, 94, 55, 0.40);
}
.periodicidad-opcion--activa {
  border-color: var(--brand-primary);
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.10);
}
.periodicidad-opcion--activa > svg:first-child { color: var(--brand-primary); }
.periodicidad-opcion--unica {
  cursor: default;
  opacity: 0.95;
}

/* Bloque destacado de la cuota */
.cuota-bloque {
  padding: 1rem;
  background: var(--brand-primary-soft);
  border: 1px solid rgba(27, 94, 55, 0.18);
  border-radius: var(--radius-lg);
}
.cuota-bloque__prefix {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
  pointer-events: none;
}
.cuota-bloque__input {
  padding-left: 1.875rem;
  font-size: 1.0625rem;
  font-weight: 700;
}

/* Aviso warning dentro de la cuota (al editar) */
.cuota-aviso {
  margin-top: 0.625rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: rgba(254, 243, 199, 0.7);
  border: 1px solid rgba(180, 83, 9, 0.25);
  border-radius: var(--radius-md);
}

/* iOS: forzar GPU en elementos del modal con transforms/transitions */
@supports (-webkit-touch-callout: none) {
  .periodicidad-opcion,
  .cuota-bloque__input { -webkit-transform: translate3d(0, 0, 0); }
}

/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
:where([data-tema=oscuro]) .al-dia:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .al-dia.is-activo:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
  background: var(--marca-suave);
}
:where([data-tema=oscuro]) .al-dia__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .al-dia__texto:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .periodicidad-opcion:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .periodicidad-opcion:hover:not(:disabled):not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .periodicidad-opcion--activa:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .periodicidad-opcion--activa > svg:first-child:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .cuota-bloque:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .cuota-bloque__prefix:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .cuota-aviso:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  border: 1px solid var(--alerta-borde);
}
</style>
