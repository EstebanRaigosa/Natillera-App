<template>
  <div class="space-y-5">
    <!--
      Barra de acción. El título y el subtítulo los pone ya la cabecera del acordeón de
      Configuración, así que aquí solo va el recuento y el botón: repetirlos sobraba.
    -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="min-w-0">
        <p class="ds-overline">Acceso</p>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ colaboradores.length }}
          {{ colaboradores.length === 1 ? 'colaborador invitado' : 'colaboradores invitados' }}
          además del administrador
        </p>
      </div>
      <button
        v-if="!esColaborador && puedeInvitar"
        type="button"
        class="ds-btn ds-btn--primary w-full sm:w-auto"
        @click="abrirModalInvitar"
      >
        <UserPlusIcon class="w-4 h-4 flex-shrink-0" />
        <span class="whitespace-nowrap">Invitar colaborador</span>
      </button>
    </div>

    <!-- Aviso de permisos -->
    <div v-if="!puedeInvitar" class="ds-callout">
      <ExclamationTriangleIcon class="ds-callout__icon w-5 h-5" />
      <p>
        <template v-if="esColaborador">
          <span class="ds-callout__title">Acceso limitado.</span>
          Como colaborador, solo puedes eliminarte a ti mismo de esta natillera. No puedes modificar
          información de otros colaboradores ni editar tu propio rol.
        </template>
        <template v-else>
          <span class="ds-callout__title">Sin permisos.</span>
          Solo el administrador o los co-administradores pueden invitar o modificar colaboradores.
        </template>
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-[color:var(--brand-primary)] border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-500 mt-3 text-sm">Cargando colaboradores…</p>
    </div>

    <!-- Lista de colaboradores -->
    <div v-else class="space-y-3">
      <!--
        Administrador: manda sobre la natillera, así que no puede parecer una fila más de
        la lista. Lleva franja de marca, avatar con anillo y su propia etiqueta.
      -->
      <div class="colab-admin">
        <span class="colab-admin__franja" aria-hidden="true"></span>
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="colab-admin__avatar shrink-0">
            {{ adminInicial }}
            <span class="colab-admin__sello" aria-hidden="true">
              <ShieldCheckIcon class="w-3.5 h-3.5" />
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="ds-overline">Administrador</p>
            <p class="font-display font-bold text-gray-900 truncate leading-tight mt-0.5">{{ adminNombre }}</p>
            <p class="text-sm text-gray-500 truncate">{{ adminEmail }}</p>
          </div>
          <div class="hidden sm:flex items-center gap-1.5 shrink-0 rounded-full bg-white/80 border border-[rgba(27,94,55,0.18)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)]">
            <ShieldCheckIcon class="w-4 h-4" />
            <span>Todos los permisos</span>
          </div>
        </div>
        <p class="sm:hidden mt-3 flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-primary)]">
          <ShieldCheckIcon class="w-4 h-4 shrink-0" />
          Todos los permisos
        </p>
      </div>

      <!-- Lista vacía -->
      <div v-if="colaboradores.length === 0" class="ds-empty-state">
        <div class="ds-empty-state__header">
          <div class="ds-empty-state__icon-wrap">
            <UsersIcon class="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <p class="ds-empty-state__title">Aún no hay colaboradores</p>
          <p class="ds-empty-state__subtitle">Invita a otros usuarios para que puedan acceder a esta natillera</p>
        </div>
        <div v-if="!esColaborador && puedeInvitar" class="ds-empty-state__body">
          <button type="button" class="ds-btn ds-btn--primary" @click="abrirModalInvitar">
            <UserPlusIcon class="w-4 h-4" />
            Invitar colaborador
          </button>
        </div>
      </div>

      <!-- Colaboradores -->
      <TransitionGroup name="list" tag="div" class="space-y-3">
        <div
          v-for="colaborador in colaboradores"
          :key="colaborador.id"
          :class="[
            'ds-card',
            colaborador.estado === 'aceptada'
              ? 'ds-card--hover'
              : colaborador.estado === 'pendiente'
              ? 'border-amber-200 bg-amber-50/40'
              : 'bg-gray-50 opacity-70'
          ]"
        >
          <div class="flex flex-wrap items-start gap-3 sm:gap-4">
            <!-- Avatar -->
            <div :class="[
              'w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold',
              colaborador.estado === 'aceptada'
                ? 'bg-[color:var(--brand-primary)]'
                : colaborador.estado === 'pendiente'
                ? 'bg-amber-500'
                : 'bg-gray-400'
            ]">
              {{ obtenerInicial(colaborador.nombre_usuario || colaborador.email_usuario) }}
            </div>
            <!-- Info -->
            <div class="flex-1 basis-0 min-w-[10rem]">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="font-semibold text-gray-900 truncate">
                  {{ colaborador.nombre_usuario || colaborador.email_usuario }}
                </span>
                <span :class="['ds-badge', obtenerClaseRol(colaborador.rol)]">
                  {{ formatearRol(colaborador.rol) }}
                </span>
                <span :class="['ds-badge', obtenerClaseEstado(colaborador.estado)]">
                  {{ formatearEstado(colaborador.estado) }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate mt-0.5">{{ colaborador.email_usuario }}</p>

              <!-- Permisos en modo compacto -->
              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="(activo, permiso) in colaborador.permisos"
                  :key="permiso"
                  v-show="activo"
                  class="ds-badge ds-badge--muted"
                >
                  {{ formatearPermiso(permiso) }}
                </span>
              </div>
            </div>
            <!-- Acciones -->
            <!--
              En móvil las acciones ocupan una línea propia (w-full): antes compartían fila
              con el nombre y el correo, y todo quedaba espachurrado a 320 px.
            -->
            <div
              v-if="(!esColaborador && puedeInvitar) || (esColaborador && esMiColaborador(colaborador))"
              class="w-full sm:w-auto flex flex-wrap items-center gap-1.5 shrink-0 border-t border-[color:var(--surface-divider)] pt-3 sm:border-0 sm:pt-0"
            >
              <!-- Si es colaborador, solo puede eliminarse a sí mismo -->
              <template v-if="esColaborador && esMiColaborador(colaborador)">
                <button
                  v-if="colaborador.estado === 'aceptada'"
                  type="button"
                  class="colab-accion colab-accion--peligro"
                  title="Eliminarme de esta natillera"
                  aria-label="Eliminarme de esta natillera"
                  @click="confirmarEliminacion(colaborador)"
                >
                  <ArrowRightStartOnRectangleIcon class="w-4 h-4 shrink-0" />
                  <span>Salir</span>
                </button>
              </template>
              <!-- Si tiene permisos completos (admin o co-admin), puede gestionar todos -->
              <template v-else-if="!esColaborador && puedeInvitar">
                <template v-if="colaborador.estado !== 'revocada'">
                  <button
                    v-if="colaborador.estado === 'aceptada' && !esColaborador && miRol !== 'colaborador'"
                    type="button"
                    class="colab-accion colab-accion--marca"
                    title="Editar permisos"
                    aria-label="Editar permisos"
                    @click="abrirModalEditar(colaborador)"
                  >
                    <PencilIcon class="w-4 h-4 shrink-0" />
                    <span>Editar</span>
                  </button>
                  <button
                    v-if="colaborador.estado === 'pendiente'"
                    type="button"
                    class="colab-accion colab-accion--info"
                    title="Reenviar invitación"
                    aria-label="Reenviar invitación"
                    @click="reenviarInvitacion(colaborador)"
                  >
                    <ArrowPathIcon class="w-4 h-4 shrink-0" />
                    <span>Reenviar</span>
                  </button>
                  <button
                    type="button"
                    class="colab-accion colab-accion--aviso"
                    :title="colaborador.estado === 'pendiente' ? 'Cancelar invitación' : 'Revocar acceso'"
                    :aria-label="colaborador.estado === 'pendiente' ? 'Cancelar invitación' : 'Revocar acceso'"
                    @click="confirmarRevocacion(colaborador)"
                  >
                    <NoSymbolIcon class="w-4 h-4 shrink-0" />
                    <span>{{ colaborador.estado === 'pendiente' ? 'Cancelar' : 'Revocar' }}</span>
                  </button>
                </template>
                <!-- Acciones para colaboradores revocados -->
                <template v-else>
                  <button
                    type="button"
                    class="colab-accion colab-accion--info"
                    title="Reenviar invitación"
                    aria-label="Reenviar invitación"
                    @click="reenviarInvitacion(colaborador)"
                  >
                    <ArrowPathIcon class="w-4 h-4 shrink-0" />
                    <span>Reenviar</span>
                  </button>
                  <button
                    type="button"
                    class="colab-accion colab-accion--peligro"
                    title="Eliminar completamente"
                    aria-label="Eliminar completamente"
                    @click="confirmarEliminacion(colaborador)"
                  >
                    <TrashIcon class="w-4 h-4 shrink-0" />
                    <span>Eliminar</span>
                  </button>
                </template>
              </template>
            </div>
          </div>
          <!-- Info de invitación -->
          <div v-if="colaborador.invitado_por_nombre" class="mt-3 pt-3 border-t border-[color:var(--surface-divider)] flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
            <ClockIcon class="w-3.5 h-3.5 shrink-0" />
            <span>Invitado por {{ colaborador.invitado_por_nombre }}</span>
            <span aria-hidden="true">•</span>
            <span>{{ formatearFecha(colaborador.fecha_invitacion) }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!--
      Modal Invitar Colaborador — patrón estándar (skill `natillerapp-modals`):
      ModalWrapper + cabecera marca compacta + un solo cuerpo scrolleable con natiscroll
      + pie de acciones fijo. Antes la card entera hacía scroll con header/footer `sticky`,
      que en iOS se despega dentro de un contenedor con `transform`.
    -->
    <ModalWrapper
      :show="!!modalInvitar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="cerrarModalInvitar"
    >
      <!-- Cabecera marca compacta: X en flex, nunca `absolute` (se desalinea en iOS) -->
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil: una sola fila [icono | títulos | X] -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <UserPlusIcon class="w-5 h-5 text-[color:var(--brand-primary)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight">Invitar colaborador</h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              Define su rol y sus permisos
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="enviandoInvitacion"
            @click="cerrarModalInvitar"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Desktop / tablet: [hueco w-11 | icono + títulos centrados | X w-11] -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <UserPlusIcon class="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">Invitar colaborador</h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[22rem]">
              Invita a un usuario a colaborar en esta natillera y define qué puede hacer
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="enviandoInvitacion"
            @click="cerrarModalInvitar"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable + natiscroll como overlay -->
      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalInvitar"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalInvitar"
        >
          <div class="px-5 sm:px-6 pt-5 pb-5 space-y-5">
            <!-- Email -->
            <div>
              <label class="label font-semibold text-gray-700">Email del usuario *</label>
              <input
                v-model="formulario.email"
                type="email"
                :class="[
                  'ds-input',
                  errorEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="usuario@ejemplo.com"
                required
              />
              <p v-if="errorEmail" class="text-xs text-red-600 mt-1 flex items-center gap-1">
                <ExclamationCircleIcon class="w-4 h-4" />
                {{ errorEmail }}
              </p>
              <p v-else class="text-xs text-gray-500 mt-1">
                El usuario recibirá una notificación para aceptar la invitación
              </p>
            </div>
            <!-- Rol -->
            <div>
              <label class="label font-semibold text-gray-700">Rol *</label>
              <div class="grid grid-cols-1 gap-3 mt-2">
                <div
                  v-for="rol in rolesDisponibles"
                  :key="rol.value"
                  :class="[
                    'rounded-xl border-2 transition-all',
                    formulario.rol === rol.value
                      ? 'border-natillera-400 bg-natillera-50'
                      : 'border-gray-200'
                  ]"
                >
                  <label
                    :class="[
                      'relative flex items-start p-4 cursor-pointer transition-all touch-manipulation',
                      formulario.rol === rol.value
                        ? ''
                        : 'hover:bg-gray-50'
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formulario.rol"
                      :value="rol.value"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-800">{{ rol.nombre }}</span>
                        <span :class="['ds-badge', obtenerClaseRol(rol.value)]">
                          {{ rol.value }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">{{ rol.descripcion }}</p>
                    </div>
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3',
                      formulario.rol === rol.value
                        ? 'border-natillera-500 bg-natillera-500'
                        : 'border-gray-300'
                    ]">
                      <CheckIcon v-if="formulario.rol === rol.value" class="w-3 h-3 text-white" />
                    </div>
                  </label>
                  
                  <!-- Permisos personalizados (desplegados dentro de cada opción de rol) -->
                  <Transition name="fade">
                    <div v-if="(formulario.rol === 'colaborador' || formulario.rol === 'visor') && formulario.rol === rol.value" class="px-4 pb-4 border-t border-natillera-200 mt-2 pt-4">
                      <label class="text-sm font-semibold text-gray-700 mb-3 block">Permisos específicos</label>
                      
                      <!-- Para colaborador: switches con Gestionar/Consultar -->
                      <div v-if="formulario.rol === 'colaborador'" class="space-y-4">
                        <div
                          v-for="(info, permiso) in permisosEditables"
                          :key="permiso"
                          class="p-4 bg-white rounded-lg border border-gray-200"
                        >
                          <h4 class="text-sm font-semibold text-gray-800 mb-3">{{ nombresPermisos[permiso] || info.nombre }}</h4>
                          <div class="flex items-center justify-between gap-4">
                            <span class="text-sm text-gray-600 flex-1">Consultar</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                v-model="formulario.permisos[permiso].consultar"
                                class="sr-only peer"
                              />
                              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-natillera-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-natillera-500"></div>
                            </label>
                          </div>
                          <div class="flex items-center justify-between gap-4 mt-3">
                            <span class="text-sm text-gray-600 flex-1">Gestionar</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                v-model="formulario.permisos[permiso].gestionar"
                                class="sr-only peer"
                              />
                              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-natillera-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-natillera-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Para visor: checkboxes simples con "Ver [Nombre]" -->
                      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label
                          v-for="(info, permiso) in permisosEditables"
                          :key="permiso"
                          class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            v-model="formulario.permisos[permiso]"
                            class="w-4 h-4 rounded border-gray-300 text-natillera-500 focus:ring-natillera-500"
                          />
                          <div class="flex-1 min-w-0">
                            <span class="text-sm font-medium text-gray-700">Ver {{ nombresPermisos[permiso] || info.nombre }}</span>
                            <p class="text-xs text-gray-500 truncate">{{ info.descripcion }}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
            <!-- Notas -->
            <div>
              <label class="label font-semibold text-gray-700">Notas (opcional)</label>
              <textarea
                v-model="formulario.notas"
                class="ds-input min-h-[80px]"
                placeholder="Notas sobre este colaborador..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Natiscroll: solo mientras quede contenido por debajo -->
        <div
          v-show="hayNatiscrollModalInvitar"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent" aria-hidden="true" />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-12">
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

      <!-- Pie de acciones fijo: siempre visible, con safe-area -->
      <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2.5">
        <button
          type="button"
          class="btn-modal-secondary flex-1"
          :disabled="enviandoInvitacion"
          @click="cerrarModalInvitar"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-modal-primary flex-1"
          :disabled="!formulario.email || enviandoInvitacion"
          @click="enviarInvitacion"
        >
          {{ enviandoInvitacion ? 'Enviando…' : 'Enviar invitación' }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Editar Colaborador -->
    <ModalWrapper
      :show="!!(modalEditar && !esColaborador && miRol !== 'colaborador')"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      card-max-width="32rem"
      @close="cerrarModalEditar"
    >
            <!-- Header -->
            <div class="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
              <h3 class="text-lg font-display font-bold">Editar Colaborador</h3>
              <p class="text-sm text-white/80">{{ colaboradorEditando?.email_usuario }}</p>
              <button
                @click="cerrarModalEditar"
                class="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
            <!-- Contenido -->
            <div class="p-6 space-y-5">
              <!-- Rol -->
              <div>
                <label class="label font-semibold text-gray-700">Rol</label>
                <div class="grid grid-cols-1 gap-3 mt-2">
                  <div
                    v-for="rol in rolesDisponibles"
                    :key="rol.value"
                    :class="[
                      'rounded-xl border-2 transition-all',
                      formularioEditar.rol === rol.value
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200'
                    ]"
                  >
                    <label
                      :class="[
                        'relative flex items-start p-4 cursor-pointer transition-all',
                        formularioEditar.rol === rol.value
                          ? ''
                          : 'hover:bg-gray-50'
                      ]"
                    >
                      <input
                        type="radio"
                        v-model="formularioEditar.rol"
                        :value="rol.value"
                        class="sr-only"
                      />
                      <div class="flex-1">
                        <span class="font-semibold text-gray-800">{{ rol.nombre }}</span>
                        <p class="text-sm text-gray-500 mt-1">{{ rol.descripcion }}</p>
                      </div>
                    </label>
                    
                    <!-- Permisos (desplegados dentro de cada opción de rol) -->
                    <Transition name="fade">
                      <div v-if="(formularioEditar.rol === 'colaborador' || formularioEditar.rol === 'visor') && formularioEditar.rol === rol.value" class="px-4 pb-4 border-t border-blue-200 mt-2 pt-4">
                        <label class="text-sm font-semibold text-gray-700 mb-3 block">Permisos</label>
                        
                        <!-- Para colaborador: switches con Gestionar/Consultar -->
                        <div v-if="formularioEditar.rol === 'colaborador'" class="space-y-4">
                          <div
                            v-for="(info, permiso) in permisosEditables"
                            :key="permiso"
                            class="p-4 bg-white rounded-lg border border-gray-200"
                          >
                            <h4 class="text-sm font-semibold text-gray-800 mb-3">{{ nombresPermisos[permiso] || info.nombre }}</h4>
                            <div class="flex items-center justify-between gap-4">
                              <span class="text-sm text-gray-600 flex-1">Consultar</span>
                              <label class="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  v-model="formularioEditar.permisos[permiso].consultar"
                                  class="sr-only peer"
                                />
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                              </label>
                            </div>
                            <div class="flex items-center justify-between gap-4 mt-3">
                              <span class="text-sm text-gray-600 flex-1">Gestionar</span>
                              <label class="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  v-model="formularioEditar.permisos[permiso].gestionar"
                                  class="sr-only peer"
                                />
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Para visor: checkboxes simples con "Ver [Nombre]" -->
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label
                            v-for="(info, permiso) in permisosEditables"
                            :key="permiso"
                            class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              v-model="formularioEditar.permisos[permiso]"
                              class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span class="text-sm font-medium text-gray-700">Ver {{ nombresPermisos[permiso] || info.nombre }}</span>
                          </label>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
            <!-- Footer -->
            <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                @click="cerrarModalEditar"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="guardarCambios"
                :disabled="guardandoCambios"
                class="btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-50"
              >
                {{ guardandoCambios ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </ModalWrapper>
    <!-- Modal Confirmar Revocación -->
    <ModalWrapper
      :show="!!modalRevocar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
      card-max-width="28rem"
      @close="cerrarModalRevocar"
    >
            <div class="p-6 text-center">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon class="w-8 h-8 text-red-500" />
              </div>
              <h3 class="text-lg font-display font-bold text-gray-800 mb-2">
                {{ colaboradorRevocando?.estado === 'pendiente' ? '¿Cancelar invitación?' : '¿Revocar acceso?' }}
              </h3>
              <p class="text-gray-500 mb-6">
                {{ colaboradorRevocando?.estado === 'pendiente'
                  ? `La invitación a ${colaboradorRevocando?.email_usuario} será cancelada.`
                  : `${colaboradorRevocando?.nombre_usuario || colaboradorRevocando?.email_usuario} ya no tendrá acceso a esta natillera.`
                }}
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="cerrarModalRevocar"
                  class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="ejecutarRevocacion"
                  :disabled="revocando"
                  class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ revocando ? 'Procesando...' : (colaboradorRevocando?.estado === 'pendiente' ? 'Cancelar Invitación' : 'Revocar Acceso') }}
                </button>
              </div>
            </div>
        </ModalWrapper>
    <!-- Modal Confirmar Eliminación -->
    <ModalWrapper
      :show="!!modalEliminar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
      card-max-width="28rem"
      @close="cerrarModalEliminar"
    >
            <div class="p-6 text-center">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <TrashIcon class="w-8 h-8 text-red-500" />
              </div>
              <h3 class="text-lg font-display font-bold text-gray-800 mb-2">
                {{ esColaborador && esMiColaborador(colaboradorEliminando) ? '¿Salir de esta natillera?' : '¿Eliminar completamente?' }}
              </h3>
              <p class="text-gray-500 mb-2">
                <template v-if="esColaborador && esMiColaborador(colaboradorEliminando)">
                  Se eliminará tu acceso a esta natillera. Ya no podrás ver ni gestionar información de esta natillera.
                </template>
                <template v-else>
                  Se eliminará completamente a <strong>{{ colaboradorEliminando?.nombre_usuario || colaboradorEliminando?.email_usuario }}</strong> de la lista de colaboradores.
                </template>
              </p>
              <p class="text-sm text-red-600 font-medium mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="cerrarModalEliminar"
                  class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="ejecutarEliminacion"
                  :disabled="eliminando"
                  class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ eliminando ? 'Eliminando...' : 'Eliminar Completamente' }}
                </button>
              </div>
            </div>
        </ModalWrapper>
    <!-- Notificación -->
    <Teleport to="body">
      <Transition name="notification">
        <div
          v-if="notificacion"
          :class="[
            'fixed bottom-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-xl max-w-md',
            notificacion.tipo === 'exito' 
              ? 'bg-green-500 text-white' 
              : notificacion.tipo === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          ]"
        >
          <div class="flex items-center gap-3">
            <CheckCircleIcon v-if="notificacion.tipo === 'exito'" class="w-6 h-6" />
            <ExclamationCircleIcon v-else-if="notificacion.tipo === 'info'" class="w-6 h-6" />
            <XCircleIcon v-else class="w-6 h-6" />
            <span>{{ notificacion.mensaje }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useColaboradoresStore, PERMISOS_DISPONIBLES, PERMISOS_POR_ROL } from '../stores/colaboradores'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import ModalWrapper from './ModalWrapper.vue'
import { supabase } from '../lib/supabase'
import {
  UserPlusIcon,
  UsersIcon,
  ChevronDownIcon,
  NoSymbolIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
const props = defineProps({
  natilleraId: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    default: ''
  },
  adminEmail: {
    type: String,
    default: ''
  },
  adminNombre: {
    type: String,
    default: ''
  },
  esAdmin: {
    type: Boolean,
    default: false
  }
})
const colaboradoresStore = useColaboradoresStore()
// Estado
const loading = ref(true)
const colaboradores = computed(() => colaboradoresStore.colaboradores)
const modalInvitar = ref(false)
const modalEditar = ref(false)
const modalRevocar = ref(false)
const modalEliminar = ref(false)
// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalInvitar)

/*
 * Natiscroll del modal de invitar. El cuerpo cambia de alto al elegir rol (los permisos
 * se despliegan dentro de la opción), así que además del scroll hay que volver a medir
 * cuando cambia `formulario.rol`; si no, el velo se queda puesto sin overflow real.
 */
const scrollAreaModalInvitar = ref(null)
const hayNatiscrollModalInvitar = ref(false)
let rafNatiscrollModalInvitar = null

function actualizarNatiscrollModalInvitar() {
  const el = scrollAreaModalInvitar.value
  if (!el || !modalInvitar.value) {
    hayNatiscrollModalInvitar.value = false
    return
  }
  hayNatiscrollModalInvitar.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalInvitar() {
  if (rafNatiscrollModalInvitar != null) cancelAnimationFrame(rafNatiscrollModalInvitar)
  rafNatiscrollModalInvitar = requestAnimationFrame(() => {
    rafNatiscrollModalInvitar = null
    actualizarNatiscrollModalInvitar()
  })
}

watch(modalInvitar, (abierto) => {
  if (!abierto) {
    hayNatiscrollModalInvitar.value = false
    return
  }
  nextTick(() => programarNatiscrollModalInvitar())
})

onUnmounted(() => {
  if (rafNatiscrollModalInvitar != null) cancelAnimationFrame(rafNatiscrollModalInvitar)
})
useBodyScrollLock(modalEditar)
useBodyScrollLock(modalRevocar)
useBodyScrollLock(modalEliminar)
const colaboradorEditando = ref(null)
const colaboradorRevocando = ref(null)
const colaboradorEliminando = ref(null)
const enviandoInvitacion = ref(false)
const guardandoCambios = ref(false)
const revocando = ref(false)
const reenviando = ref(false)
const eliminando = ref(false)
const notificacion = ref(null)
const puedeInvitar = ref(false)
const errorEmail = ref(null)
const miRol = ref(null)
const miUsuarioId = ref(null)
const miEmail = ref(null)
const esColaborador = computed(() => miRol.value === 'colaborador')
// Formulario invitar
const formulario = ref({
  email: '',
  rol: 'visor',
  permisos: { ...PERMISOS_POR_ROL.visor },
  notas: ''
})
// Formulario editar
const formularioEditar = ref({
  rol: 'visor',
  permisos: {}
})
// Roles disponibles
const rolesDisponibles = [
  {
    value: 'co_administrador',
    nombre: 'Co-Administrador',
    descripcion: 'Tiene todos los permisos excepto eliminar la natillera'
  },
  {
    value: 'colaborador',
    nombre: 'Colaborador',
    descripcion: 'Permisos personalizados según tus necesidades'
  },
  {
    value: 'visor',
    nombre: 'Visor',
    descripcion: 'Solo puede ver la información, sin hacer cambios'
  }
]
// Permisos editables (todos excepto 'ver')
const permisosEditables = computed(() => {
  const editables = {}
  Object.entries(PERMISOS_DISPONIBLES).forEach(([key, value]) => {
    if (key !== 'ver') {
      editables[key] = value
    }
  })
  return editables
})
// Mapeo de nombres de permisos para mostrar
const nombresPermisos = {
  editar_socios: 'Socios',
  gestionar_cuotas: 'Cuotas',
  gestionar_prestamos: 'Préstamos',
  gestionar_actividades: 'Actividades',
  ver_auditoria: 'Auditoría',
  configurar: 'Configuración'
}
// Función para inicializar permisos con estructura gestionar/consultar
function inicializarPermisosColaborador(permisosBase) {
  const permisos = {}
  Object.keys(permisosEditables.value).forEach(permiso => {
    // Si el permiso base es true, activar ambos gestionar y consultar
    // Si es false, solo consultar activo por defecto (como pidió el usuario)
    const valorBase = permisosBase[permiso] || false
    permisos[permiso] = {
      gestionar: valorBase,
      consultar: true // Consultar siempre activo por defecto
    }
  })
  return permisos
}
// Función para convertir permisos de estructura antigua a nueva (para compatibilidad)
function normalizarPermisos(permisos, rol) {
  if (rol === 'colaborador') {
    // Si ya tiene la estructura nueva (con gestionar/consultar), mantenerla
    // Si tiene estructura antigua (booleanos), convertirla
    const normalizados = {}
    Object.keys(permisosEditables.value).forEach(permiso => {
      if (permisos[permiso] && typeof permisos[permiso] === 'object' && 'gestionar' in permisos[permiso]) {
        normalizados[permiso] = permisos[permiso]
      } else {
        const valor = permisos[permiso] || false
        normalizados[permiso] = {
          gestionar: valor,
          consultar: valor || true // Si gestionar está activo, consultar también
        }
      }
    })
    return normalizados
  }
  // Para otros roles (visor, etc.), mantener estructura simple
  return permisos
}
// Función para convertir permisos de estructura nueva a antigua (para guardar)
function convertirPermisosParaGuardar(permisos, rol) {
  if (rol === 'colaborador') {
    const convertidos = {}
    Object.keys(permisos).forEach(permiso => {
      if (permisos[permiso] && typeof permisos[permiso] === 'object' && 'gestionar' in permisos[permiso]) {
        // Si tiene gestionar o consultar, el permiso está activo
        convertidos[permiso] = permisos[permiso].gestionar || permisos[permiso].consultar
      } else {
        convertidos[permiso] = permisos[permiso]
      }
    })
    return convertidos
  }
  // Para visor y otros roles, mantener estructura simple
  return permisos
}
// Computed
const adminInicial = computed(() => 
  obtenerInicial(props.adminNombre || props.adminEmail)
)
// Helpers
function obtenerInicial(texto) {
  if (!texto) return '?'
  return texto.charAt(0).toUpperCase()
}
function formatearRol(rol) {
  const nombres = {
    co_administrador: 'Co-Admin',
    colaborador: 'Colaborador',
    visor: 'Visor'
  }
  return nombres[rol] || rol
}
function obtenerClaseRol(rol) {
  const clases = {
    co_administrador: 'ds-badge--brand',
    colaborador: 'ds-badge--info',
    visor: 'ds-badge--muted'
  }
  return clases[rol] || 'ds-badge--muted'
}
function formatearEstado(estado) {
  const nombres = {
    pendiente: 'Pendiente',
    aceptada: 'Activo',
    rechazada: 'Rechazada',
    revocada: 'Revocado'
  }
  return nombres[estado] || estado
}
function obtenerClaseEstado(estado) {
  const clases = {
    pendiente: 'ds-badge--warning',
    aceptada: 'ds-badge--success',
    rechazada: 'ds-badge--danger',
    revocada: 'ds-badge--muted'
  }
  return clases[estado] || 'ds-badge--muted'
}
function formatearPermiso(permiso) {
  const nombres = {
    ver: 'Ver',
    editar_socios: 'Socios',
    gestionar_cuotas: 'Cuotas',
    gestionar_prestamos: 'Préstamos',
    gestionar_actividades: 'Actividades',
    ver_auditoria: 'Auditoría',
    configurar: 'Configurar'
  }
  return nombres[permiso] || permiso
}
function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
// Modal Invitar
function abrirModalInvitar() {
  formulario.value = {
    email: '',
    rol: 'visor',
    permisos: { ...PERMISOS_POR_ROL.visor },
    notas: ''
  }
  errorEmail.value = null
  modalInvitar.value = true
}
function cerrarModalInvitar() {
  modalInvitar.value = false
  errorEmail.value = null
}
// Watch para actualizar permisos cuando cambia el rol
watch(() => formulario.value.rol, (nuevoRol) => {
  // El bloque de permisos se despliega/colapsa: el alto del cuerpo cambia.
  nextTick(() => programarNatiscrollModalInvitar())
  if (nuevoRol === 'colaborador') {
    formulario.value.permisos = inicializarPermisosColaborador(PERMISOS_POR_ROL[nuevoRol])
  } else {
    formulario.value.permisos = { ...PERMISOS_POR_ROL[nuevoRol] }
  }
})
watch(() => formularioEditar.value.rol, (nuevoRol) => {
  if (nuevoRol === 'colaborador') {
    formularioEditar.value.permisos = inicializarPermisosColaborador(PERMISOS_POR_ROL[nuevoRol])
  } else {
    formularioEditar.value.permisos = { ...PERMISOS_POR_ROL[nuevoRol] }
  }
})
// Limpiar error cuando cambia el email
watch(() => formulario.value.email, () => {
  if (errorEmail.value) {
    errorEmail.value = null
  }
})
async function enviarInvitacion() {
  if (!formulario.value.email) return
  // Limpiar error previo
  errorEmail.value = null
  enviandoInvitacion.value = true
  
  try {
    // Convertir permisos para guardar (de estructura nueva a antigua si es colaborador)
    const permisosParaGuardar = convertirPermisosParaGuardar(formulario.value.permisos, formulario.value.rol)
    
    const resultado = await colaboradoresStore.invitarColaborador(props.natilleraId, {
      email: formulario.value.email,
      rol: formulario.value.rol,
      permisos: permisosParaGuardar,
      notas: formulario.value.notas
    })
    if (resultado.success) {
      mostrarNotificacion('exito', 'Invitación enviada correctamente')
      cerrarModalInvitar()
      await cargarColaboradores()
    } else {
      // Si el error es sobre email/usuario, mostrarlo en el campo
      if (resultado.error && (
        resultado.error.includes('no está registrado') ||
        resultado.error.includes('ya es colaborador') ||
        resultado.error.includes('Ya existe una invitación')
      )) {
        errorEmail.value = resultado.error
      } else {
        mostrarNotificacion('error', resultado.error || 'Error al enviar invitación')
      }
    }
  } catch (e) {
    // Si el error es sobre email/usuario, mostrarlo en el campo
    if (e.message && (
      e.message.includes('no está registrado') ||
      e.message.includes('ya es colaborador') ||
      e.message.includes('Ya existe una invitación')
    )) {
      errorEmail.value = e.message
    } else {
      mostrarNotificacion('error', e.message || 'Error al enviar invitación')
    }
  } finally {
    enviandoInvitacion.value = false
  }
}
// Modal Editar
function abrirModalEditar(colaborador) {
  // Si es colaborador, no puede editar
  if (esColaborador.value) {
    mostrarNotificacion('error', 'No tienes permisos para editar colaboradores')
    return
  }
  
  colaboradorEditando.value = colaborador
  const permisosNormalizados = normalizarPermisos(colaborador.permisos, colaborador.rol)
  formularioEditar.value = {
    rol: colaborador.rol,
    permisos: permisosNormalizados
  }
  modalEditar.value = true
}
function cerrarModalEditar() {
  modalEditar.value = false
  colaboradorEditando.value = null
}
async function guardarCambios() {
  if (!colaboradorEditando.value) return
  // Si es colaborador, no puede editar
  if (esColaborador.value) {
    mostrarNotificacion('error', 'No tienes permisos para editar colaboradores')
    cerrarModalEditar()
    return
  }
  guardandoCambios.value = true
  try {
    // Convertir permisos para guardar (de estructura nueva a antigua si es colaborador)
    const permisosParaGuardar = convertirPermisosParaGuardar(formularioEditar.value.permisos, formularioEditar.value.rol)
    
    const resultado = await colaboradoresStore.actualizarColaborador(
      colaboradorEditando.value.id,
      {
        rol: formularioEditar.value.rol,
        permisos: permisosParaGuardar
      }
    )
    if (resultado.success) {
      mostrarNotificacion('exito', 'Cambios guardados correctamente')
      cerrarModalEditar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al guardar cambios')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al guardar cambios')
  } finally {
    guardandoCambios.value = false
  }
}
// Modal Revocar
function confirmarRevocacion(colaborador) {
  colaboradorRevocando.value = colaborador
  modalRevocar.value = true
}
function cerrarModalRevocar() {
  modalRevocar.value = false
  colaboradorRevocando.value = null
}
async function ejecutarRevocacion() {
  if (!colaboradorRevocando.value) return
  revocando.value = true
  try {
    let resultado
    if (colaboradorRevocando.value.estado === 'pendiente') {
      resultado = await colaboradoresStore.eliminarColaborador(colaboradorRevocando.value.id)
    } else {
      resultado = await colaboradoresStore.revocarColaborador(colaboradorRevocando.value.id)
    }
    if (resultado.success) {
      mostrarNotificacion('exito', 
        colaboradorRevocando.value.estado === 'pendiente' 
          ? 'Invitación cancelada' 
          : 'Acceso revocado correctamente'
      )
      cerrarModalRevocar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al procesar')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al procesar')
  } finally {
    revocando.value = false
  }
}
async function reenviarInvitacion(colaborador) {
  if (!colaborador) return
  reenviando.value = true
  try {
    let resultado
    
    if (colaborador.estado === 'revocada') {
      // Reenviar invitación a colaborador revocado
      resultado = await colaboradoresStore.reenviarInvitacionColaborador(colaborador.id)
    } else if (colaborador.estado === 'pendiente') {
      // Reenviar invitación pendiente (lógica existente o nueva según necesidad)
      // Por ahora, si ya está pendiente, simplemente informamos
      mostrarNotificacion('info', 'La invitación ya está pendiente')
      return
    } else {
      mostrarNotificacion('error', 'No se puede reenviar invitación a un colaborador activo')
      return
    }
    if (resultado.success) {
      mostrarNotificacion('exito', 'Invitación reenviada correctamente')
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al reenviar invitación')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al reenviar invitación')
  } finally {
    reenviando.value = false
  }
}
// Modal Eliminar
function confirmarEliminacion(colaborador) {
  colaboradorEliminando.value = colaborador
  modalEliminar.value = true
}
function cerrarModalEliminar() {
  modalEliminar.value = false
  colaboradorEliminando.value = null
}
async function ejecutarEliminacion() {
  if (!colaboradorEliminando.value) return
  eliminando.value = true
  try {
    const resultado = await colaboradoresStore.eliminarColaborador(colaboradorEliminando.value.id)
    if (resultado.success) {
      if (esColaborador.value && esMiColaborador(colaboradorEliminando.value)) {
        mostrarNotificacion('exito', 'Has salido de esta natillera')
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        mostrarNotificacion('exito', 'Colaborador eliminado completamente')
      }
      cerrarModalEliminar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al eliminar colaborador')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al eliminar colaborador')
  } finally {
    eliminando.value = false
  }
}
function mostrarNotificacion(tipo, mensaje) {
  notificacion.value = { tipo, mensaje }
  setTimeout(() => {
    notificacion.value = null
  }, 4000)
}
async function cargarColaboradores() {
  loading.value = true
  await colaboradoresStore.fetchColaboradores(props.natilleraId)
  loading.value = false
}
// Verificar si un colaborador es el usuario actual
function esMiColaborador(colaborador) {
  if (!miUsuarioId.value && !miEmail.value) return false
  
  // Verificar por usuario_id si existe
  if (colaborador.usuario_id && miUsuarioId.value) {
    return colaborador.usuario_id === miUsuarioId.value
  }
  
  // Verificar por email si no hay usuario_id (invitación pendiente)
  if (colaborador.email_usuario && miEmail.value) {
    return colaborador.email_usuario.toLowerCase() === miEmail.value.toLowerCase()
  }
  
  return false
}
async function obtenerMiRolYUsuario() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      miUsuarioId.value = null
      miEmail.value = null
      miRol.value = null
      return
    }
    
    miUsuarioId.value = user.id
    miEmail.value = user.email || null
    
    // Si es admin, no necesitamos verificar rol
    if (props.esAdmin || props.adminId === user.id) {
      miRol.value = 'administrador'
      return
    }
    
    // Obtener el rol del usuario en la natillera
    const rol = await colaboradoresStore.obtenerMiRol(props.natilleraId)
    miRol.value = rol
  } catch (e) {
    console.error('Error obteniendo rol del usuario:', e)
    miUsuarioId.value = null
    miEmail.value = null
    miRol.value = null
  }
}
async function verificarPermisos() {
  if (props.esAdmin) {
    puedeInvitar.value = true
    return
  }
  
  // Asegurarse de que el rol esté actualizado
  if (!miRol.value) {
    await obtenerMiRolYUsuario()
  }
  
  // Si es colaborador, nunca puede invitar o editar, incluso si tiene el permiso configurar
  if (miRol.value === 'colaborador' || esColaborador.value) {
    puedeInvitar.value = false
    return
  }
  
  puedeInvitar.value = await colaboradoresStore.tienePermiso(props.natilleraId, 'configurar')
}
onMounted(async () => {
  await obtenerMiRolYUsuario()
  await verificarPermisos()
  await cargarColaboradores()
})
// Watch para recargar cuando cambia la natillera
watch(() => props.natilleraId, async () => {
  await obtenerMiRolYUsuario()
  await verificarPermisos()
  await cargarColaboradores()
})
// Exponer método para abrir modal desde el componente padre
defineExpose({
  abrirModalInvitar
})
</script>
<style scoped>
/* Tarjeta del administrador: mismo lenguaje que `ds-card--brand`, con más peso visual. */
.colab-admin {
  position: relative;
  overflow: hidden;
  padding: 1rem 1rem 1rem 1.375rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(27, 94, 55, 0.22);
  background: linear-gradient(135deg, #f3faf5 0%, #fff 55%);
  box-shadow: var(--shadow-sm);
}
@media (min-width: 640px) {
  .colab-admin { padding: 1.25rem 1.25rem 1.25rem 1.625rem; }
}
.colab-admin__franja {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.3125rem;
  height: 100%;
  background: var(--brand-primary);
}
.colab-admin__avatar {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px #fff, 0 0 0 4px rgba(27, 94, 55, 0.25);
}
/* Sello sobre el avatar: se ve de un vistazo quién es el dueño de la natillera. */
.colab-admin__sello {
  position: absolute;
  right: -0.1875rem;
  bottom: -0.1875rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
}

/*
 * Botones de acción de cada colaborador. Pastilla con el color de su intención siempre
 * visible (antes eran iconos grises que solo se teñían al pasar el ratón, invisible en
 * táctil). 44 px de alto: el mínimo que pide el manual de iOS.
 */
.colab-accion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0 0.75rem;
  border-radius: 9999px;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--transition-base),
              border-color var(--transition-base),
              color var(--transition-base),
              box-shadow var(--transition-base),
              transform var(--transition-fast);
}
.colab-accion:active { transform: scale(0.96); }
.colab-accion:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.colab-accion--marca {
  color: var(--brand-primary);
  background: var(--brand-primary-soft);
  border-color: rgba(27, 94, 55, 0.18);
}
.colab-accion--marca:hover {
  background: var(--brand-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px -6px rgba(27, 94, 55, 0.55);
}

.colab-accion--info {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: rgba(29, 78, 216, 0.18);
}
.colab-accion--info:hover {
  background: #1d4ed8;
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px -6px rgba(29, 78, 216, 0.55);
}

.colab-accion--aviso {
  color: #b45309;
  background: #fffbeb;
  border-color: rgba(180, 83, 9, 0.2);
}
.colab-accion--aviso:hover {
  background: #b45309;
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px -6px rgba(180, 83, 9, 0.55);
}

.colab-accion--peligro {
  color: #b91c1c;
  background: #fef2f2;
  border-color: rgba(185, 28, 28, 0.18);
}
.colab-accion--peligro:hover {
  background: #b91c1c;
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px -6px rgba(185, 28, 28, 0.55);
}

/* El icono de reenviar gira al pasar por encima: refuerza que la acción se repite. */
.colab-accion--info:hover svg {
  transform: rotate(180deg);
}
.colab-accion svg {
  transition: transform var(--transition-base);
}

/* Sin animaciones para quien las haya desactivado en el sistema. */
@media (prefers-reduced-motion: reduce) {
  .colab-accion,
  .colab-accion svg {
    transition: none;
  }
  .colab-accion:active { transform: none; }
  .colab-accion--info:hover svg { transform: none; }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>