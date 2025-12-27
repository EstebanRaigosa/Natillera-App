<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <router-link :to="`/natilleras/${id}`" class="text-natillera-600 hover:text-natillera-700 font-medium inline-flex items-center gap-1 mb-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Volver a natillera
        </router-link>
        <h1 class="text-3xl font-display font-bold text-gray-800">
          Cuotas y Pagos
        </h1>
        <p class="text-gray-500 mt-1">
          Gestiona los cobros y registra pagos
        </p>
      </div>
      <button @click="modalGenerarCuotas = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Generar Cuotas
      </button>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="stat-value text-natillera-600">{{ resumen.pagadas }}</p>
        <p class="stat-label">Pagadas</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-amber-600">{{ resumen.pendientes }}</p>
        <p class="stat-label">Pendientes</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-red-600">{{ resumen.enMora }}</p>
        <p class="stat-label">En Mora</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-purple-600">{{ resumen.porcentajeRecaudado.toFixed(0) }}%</p>
        <p class="stat-label">Recaudado</p>
      </div>
    </div>

    <!-- Lista de cuotas -->
    <div v-if="cuotasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando cuotas...</p>
    </div>

    <div v-else-if="cuotasStore.cuotas.length === 0" class="card text-center py-12">
      <CurrencyDollarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        No hay cuotas generadas
      </h3>
      <p class="text-gray-500 mt-2 mb-6">
        Genera las cuotas del período para comenzar a registrar pagos
      </p>
      <button @click="modalGenerarCuotas = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Generar Cuotas
      </button>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="cuota in cuotasStore.cuotas" 
        :key="cuota.id"
        class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div 
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center',
              cuota.estado === 'pagada' ? 'bg-green-100' : 
              cuota.estado === 'mora' ? 'bg-red-100' : 
              cuota.estado === 'parcial' ? 'bg-amber-100' : 'bg-gray-100'
            ]"
          >
            <component 
              :is="cuota.estado === 'pagada' ? CheckCircleIcon : 
                   cuota.estado === 'mora' ? ExclamationCircleIcon : ClockIcon"
              :class="[
                'w-6 h-6',
                cuota.estado === 'pagada' ? 'text-green-600' : 
                cuota.estado === 'mora' ? 'text-red-600' : 
                cuota.estado === 'parcial' ? 'text-amber-600' : 'text-gray-400'
              ]"
            />
          </div>
          <div>
            <p class="font-medium text-gray-800">
              {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
            </p>
            <p class="text-sm text-gray-500">
              Vence: {{ formatDate(cuota.fecha_limite) }}
              <span v-if="cuota.descripcion" class="ml-2 text-gray-400">• {{ cuota.descripcion }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</p>
            <p class="text-sm" :class="cuota.valor_pagado > 0 ? 'text-green-600' : 'text-gray-400'">
              Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
            </p>
          </div>
          
          <span 
            :class="[
              'badge',
              cuota.estado === 'pagada' ? 'badge-success' : 
              cuota.estado === 'mora' ? 'badge-danger' : 
              cuota.estado === 'parcial' ? 'badge-warning' : 'badge-info'
            ]"
          >
            {{ cuota.estado }}
          </span>

          <button 
            v-if="cuota.estado !== 'pagada'"
            @click="abrirModalPago(cuota)"
            class="btn-primary py-2 px-4 text-sm"
          >
            Registrar Pago
          </button>

          <button 
            v-if="cuota.estado === 'pagada'"
            @click="reenviarComprobante(cuota)"
            class="flex items-center gap-1 py-2 px-3 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Reenviar comprobante"
          >
            <ArrowPathIcon class="w-4 h-4" />
            Reenviar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Generar Cuotas -->
    <div v-if="modalGenerarCuotas" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalGenerarCuotas = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Generar Cuotas del Período
        </h3>

        <form @submit.prevent="handleGenerarCuotas" class="space-y-4">
          <div>
            <label class="label">Fecha límite de pago *</label>
            <input 
              v-model="formCuotas.fecha_limite"
              type="date" 
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="label">Descripción del período</label>
            <input 
              v-model="formCuotas.descripcion"
              type="text" 
              class="input-field"
              placeholder="Ej: Cuota Enero 2025"
            />
          </div>

          <p class="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
            Se generarán cuotas para todos los socios activos según su valor de cuota individual.
          </p>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalGenerarCuotas = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="cuotasStore.loading"
            >
              {{ cuotasStore.loading ? 'Generando...' : 'Generar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Registrar Pago -->
    <div v-if="modalPago" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalPago = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Registrar Pago
        </h3>

        <div class="bg-gray-50 p-4 rounded-xl mb-6">
          <p class="font-medium text-gray-800">{{ cuotaSeleccionada?.socio_natillera?.socio?.nombre }}</p>
          <p class="text-sm text-gray-500">
            Cuota: ${{ formatMoney(cuotaSeleccionada?.valor_cuota) }} • 
            Pendiente: ${{ formatMoney((cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)) }}
          </p>
        </div>

        <form @submit.prevent="handleRegistrarPago" class="space-y-4">
          <div>
            <label class="label">Valor del pago *</label>
            <input 
              v-model.number="formPago.valor"
              type="number" 
              class="input-field"
              :placeholder="`Máx: ${(cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)}`"
              :max="(cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)"
              min="1"
              required
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalPago = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="cuotasStore.loading"
            >
              {{ cuotasStore.loading ? 'Registrando...' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación de Pago con Comprobante Visual -->
    <div v-if="modalConfirmacion" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrarConfirmacion"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-4 text-center">
          ¡Pago Registrado! 🎉
        </h3>

        <!-- Comprobante Visual (esto se convierte en imagen) -->
        <div 
          id="comprobante-pago"
          ref="comprobanteRef"
          class="rounded-2xl overflow-hidden mb-4"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
        >
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 24px; color: white;">
            <!-- Header del comprobante -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">✓</span>
                </div>
                <span style="font-weight: bold; font-size: 18px;">Natillera</span>
              </div>
              <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Comprobante de Pago</span>
            </div>

            <!-- Nombre de la natillera -->
            <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Natillera</p>
              <p style="font-weight: 600; font-size: 18px; margin: 4px 0 0 0;">{{ natilleraNombre || 'Mi Natillera' }}</p>
            </div>

            <!-- Valor grande -->
            <div style="text-align: center; padding: 24px 0;">
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0;">Valor Pagado</p>
              <p style="font-size: 48px; font-weight: bold; margin: 0; letter-spacing: -2px;">
                ${{ formatMoney(pagoRegistrado?.valor) }}
              </p>
            </div>

            <!-- Detalles -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Socio</p>
                <p style="font-weight: 600; margin: 4px 0 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ pagoRegistrado?.socioNombre }}</p>
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Cuota</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.descripcionCuota || 'Cuota mensual' }}</p>
              </div>
            </div>

            <!-- Fecha -->
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Fecha de Pago</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.fecha }}</p>
              </div>
              <div style="text-align: right;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Estado</p>
                <p style="font-weight: 600; color: #a7f3d0; margin: 4px 0 0 0;">✓ Pagado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="space-y-3">
          <button 
            @click="descargarComprobante"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Generando...' : 'Descargar Imagen' }}
          </button>

          <button 
            v-if="pagoRegistrado?.socioTelefono"
            @click="compartirWhatsApp"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <ChatBubbleLeftIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Preparando...' : '📲 Compartir por WhatsApp' }}
          </button>
          
          <button 
            @click="cerrarConfirmacion"
            class="btn-secondary w-full"
          >
            Cerrar
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center mt-4">
          💡 En celular podrás enviar la imagen directamente a WhatsApp
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { supabase } from '../../lib/supabase'
// Ya no necesitamos html2canvas, dibujamos directamente en canvas
import { 
  ArrowLeftIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()

const modalGenerarCuotas = ref(false)
const modalPago = ref(false)
const modalConfirmacion = ref(false)
const cuotaSeleccionada = ref(null)
const pagoRegistrado = ref(null)
const natilleraNombre = ref('')
const comprobanteRef = ref(null)
const generandoImagen = ref(false)

const formCuotas = reactive({
  fecha_limite: '',
  descripcion: ''
})

const formPago = reactive({
  valor: 0
})

const id = props.id || route.params.id

const resumen = computed(() => cuotasStore.calcularResumenCuotas())

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function abrirModalPago(cuota) {
  cuotaSeleccionada.value = cuota
  formPago.valor = cuota.valor_cuota - (cuota.valor_pagado || 0)
  modalPago.value = true
}

async function handleGenerarCuotas() {
  const result = await cuotasStore.generarCuotasPeriodo(
    id,
    formCuotas.fecha_limite,
    formCuotas.descripcion
  )

  if (result.success) {
    modalGenerarCuotas.value = false
    formCuotas.fecha_limite = ''
    formCuotas.descripcion = ''
    // Recargar cuotas
    cuotasStore.fetchCuotasNatillera(id)
  } else {
    alert('Error: ' + result.error)
  }
}

async function handleRegistrarPago() {
  if (!cuotaSeleccionada.value) return

  const valorPagado = formPago.valor
  const socioNombre = cuotaSeleccionada.value.socio_natillera?.socio?.nombre
  const socioTelefono = cuotaSeleccionada.value.socio_natillera?.socio?.telefono
  const descripcionCuota = cuotaSeleccionada.value.descripcion || formatDate(cuotaSeleccionada.value.fecha_limite)

  const result = await cuotasStore.registrarPago(
    cuotaSeleccionada.value.id,
    valorPagado
  )

  if (result.success) {
    // Guardar info del pago para el modal de confirmación
    pagoRegistrado.value = {
      socioNombre,
      socioTelefono,
      valor: valorPagado,
      descripcionCuota,
      fecha: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    modalPago.value = false
    modalConfirmacion.value = true
    cuotaSeleccionada.value = null
    
    // Recargar cuotas para actualizar el resumen
    cuotasStore.fetchCuotasNatillera(id)
  } else {
    alert('Error: ' + result.error)
  }
}

function generarImagenComprobante() {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const width = 480
      const height = 680
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // === FONDO DEGRADADO MODERNO ===
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0f172a')
      bgGradient.addColorStop(0.5, '#1e293b')
      bgGradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // === EFECTOS DE LUZ (glassmorphism style) ===
      // Luz superior derecha
      const light1 = ctx.createRadialGradient(width - 80, 100, 0, width - 80, 100, 200)
      light1.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      light1.addColorStop(1, 'transparent')
      ctx.fillStyle = light1
      ctx.fillRect(0, 0, width, height)
      
      // Luz inferior izquierda
      const light2 = ctx.createRadialGradient(80, height - 150, 0, 80, height - 150, 180)
      light2.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      light2.addColorStop(1, 'transparent')
      ctx.fillStyle = light2
      ctx.fillRect(0, 0, width, height)
      
      // === HEADER MINIMALISTA ===
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 26px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Natillera', 32, 50)
      
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '13px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('Comprobante de Pago', width - 32, 50)
      
      // Línea decorativa
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(1, '#10b981')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 70)
      ctx.lineTo(width - 32, 70)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 485
      const cardMargin = 24
      
      // Borde con gradiente
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.stroke()
      
      // Fondo de la tarjeta (glassmorphism)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      
      // === NOMBRE DE LA NATILLERA ===
      ctx.fillStyle = '#64748b'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('NATILLERA', cardInnerX, cardY + 40)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(natilleraNombre.value || 'Mi Natillera', cardInnerX, cardY + 68)
      
      // === VALOR PAGADO (HERO) ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('VALOR PAGADO', width/2, cardY + 115)
      
      // Valor grande con gradiente
      const valorText = '$' + formatMoney(pagoRegistrado.value?.valor)
      ctx.font = 'bold 52px Arial'
      const valorGradient = ctx.createLinearGradient(0, cardY + 120, 0, cardY + 175)
      valorGradient.addColorStop(0, '#059669')
      valorGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = valorGradient
      ctx.fillText(valorText, width/2, cardY + 170)
      
      // Badge de verificación
      ctx.fillStyle = '#dcfce7'
      ctx.beginPath()
      ctx.roundRect(width/2 - 60, cardY + 185, 120, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 13px Arial'
      ctx.fillText('Pago Verificado', width/2, cardY + 206)
      
      // === DETALLES EN CARDS ===
      const detailsY = cardY + 240
      
      // Card: Socio
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(pagoRegistrado.value?.socioNombre || 'Socio', cardInnerX + 18, detailsY + 46)
      
      // Card: Cuota
      const cuotaY = detailsY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, cuotaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTO / CUOTA', cardInnerX + 18, cuotaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(pagoRegistrado.value?.descripcionCuota || 'Cuota mensual', cardInnerX + 18, cuotaY + 46)
      
      // Card: Fecha
      const fechaY = cuotaY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA Y HORA DEL PAGO', cardInnerX + 18, fechaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 15px Arial'
      ctx.fillText(pagoRegistrado.value?.fecha || 'Fecha no disponible', cardInnerX + 18, fechaY + 46)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      const btnY = fechaY + 85
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX + cardInnerWidth, btnY)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      // === FOOTER ===
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Gracias por tu aporte a la comunidad', width/2, height - 42)
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px Arial'
      ctx.fillText('natillera.app', width/2, height - 20)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
      resolve(null)
    }
  })
}

async function descargarComprobante() {
  console.log('Iniciando descarga...')
  
  if (!comprobanteRef.value) {
    alert('Error: El comprobante no está listo. Intenta de nuevo.')
    return
  }
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    
    if (!canvas) {
      throw new Error('No se pudo generar el canvas')
    }
    
    console.log('Convirtiendo a imagen...')
    
    // Convertir a imagen y descargar
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-') || 'pago'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Descarga completada')
  } catch (e) {
    console.error('Error completo:', e)
    alert('Error al generar la imagen: ' + e.message)
  } finally {
    generandoImagen.value = false
  }
}

async function compartirWhatsApp() {
  if (!pagoRegistrado.value) return
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    const archivo = new File([blob], `comprobante-${Date.now()}.png`, { type: 'image/png' })
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Comprobante de Pago',
        text: `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera "${natilleraNombre.value}".\n\n¡Gracias por estar al día! 🙌`
      })
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago. ¡Gracias por estar al día! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
      
      alert('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
      if (telefono) {
        const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera.\n\n¡Gracias por estar al día! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagen.value = false
  }
}

function cerrarConfirmacion() {
  modalConfirmacion.value = false
  pagoRegistrado.value = null
}

function reenviarComprobante(cuota) {
  // Preparar datos del pago para mostrar el comprobante
  pagoRegistrado.value = {
    socioNombre: cuota.socio_natillera?.socio?.nombre,
    socioTelefono: cuota.socio_natillera?.socio?.telefono,
    valor: cuota.valor_pagado || cuota.valor_cuota,
    descripcionCuota: cuota.descripcion || formatDate(cuota.fecha_limite),
    fecha: cuota.fecha_pago 
      ? new Date(cuota.fecha_pago).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Fecha no registrada'
  }
  
  modalConfirmacion.value = true
}

async function cargarNatillera() {
  const { data } = await supabase
    .from('natilleras')
    .select('nombre')
    .eq('id', id)
    .single()
  
  if (data) {
    natilleraNombre.value = data.nombre
  }
}

onMounted(() => {
  cuotasStore.fetchCuotasNatillera(id)
  cargarNatillera()
})
</script>

