<template>
  <!-- Botón flotante del formulario de contacto -->
  <Teleport to="body">
    <div class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] safe-area-bottom">
      <!-- Botón para abrir/cerrar formulario -->
      <button
        v-if="!isOpen"
        @click="isOpen = true; resetForm()"
        class="group relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-natillera-500 to-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-white touch-manipulation"
      >
      <!-- Efecto de pulso -->
      <div class="absolute inset-0 bg-gradient-to-r from-natillera-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
      
      <ChatBubbleLeftRightIcon class="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
      
      <!-- Tooltip -->
      <div class="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div class="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
          ¿Necesitas ayuda?
          <div class="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </div>
    </button>

    <!-- Ventana del formulario de contacto -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[calc(100vh-6rem)] sm:max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[9999] safe-area-bottom"
      >
        <!-- Header del formulario -->
        <div class="bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-600 p-4 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <EnvelopeIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-base">Crear Ticket de Soporte</h3>
              <p class="text-xs text-white/90">Describe detalladamente tu consulta</p>
            </div>
          </div>
          <button
            @click="isOpen = false; resetForm()"
            class="w-9 h-9 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center relative z-10"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Contenido del formulario -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          <!-- Vista de confirmación después de enviar -->
          <div v-if="mensajeEnviado" class="space-y-4">
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircleIcon class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold text-gray-800 mb-2">
                ¡Mensaje enviado exitosamente!
              </h3>
              <p class="text-sm text-gray-600 mb-6">
                Te responderemos pronto a tu correo electrónico
              </p>
            </div>

            <!-- Resumen del mensaje enviado -->
            <div class="bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-2xl p-4 border border-natillera-200/50 shadow-lg">
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Correo de respuesta</p>
                  <p class="text-sm font-bold text-natillera-700 break-all">{{ resumenEnvio.email }}</p>
                </div>
                <div class="pt-3 border-t border-gray-200">
                  <p class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Descripción del ticket</p>
                  <p class="text-sm text-gray-700 whitespace-pre-wrap bg-white/50 rounded-lg p-3 border border-gray-200">{{ resumenEnvio.mensaje }}</p>
                  <p v-if="resumenEnvio.archivos > 0" class="text-xs text-gray-600 mt-2">
                    📎 {{ resumenEnvio.archivos }} {{ resumenEnvio.archivos === 1 ? 'archivo adjunto' : 'archivos adjuntos' }}
                  </p>
                </div>
                <div class="pt-3 border-t border-gray-200">
                  <p class="text-xs text-gray-500">
                    Enviado el {{ formatDate(resumenEnvio.fecha) }} a las {{ formatTime(resumenEnvio.fecha) }}
                  </p>
                </div>
              </div>
            </div>

            <button
              @click="isOpen = false; resetForm()"
              class="w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Cerrar
            </button>
          </div>

          <!-- Formulario de contacto -->
          <div v-else class="space-y-4">
            <!-- Mensaje informativo -->
            <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50/50 border-2 border-blue-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <InformationCircleIcon class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-blue-800 mb-1">
                    Crear un ticket de soporte
                  </p>
                  <p class="text-xs text-blue-700 leading-relaxed">
                    Por favor, ingresa tu <strong>correo electrónico</strong> y describe detalladamente tu consulta, problema o solicitud. Entre más información proporciones, más rápido podremos ayudarte.
                  </p>
                </div>
              </div>
            </div>

            <!-- Campo de email (siempre visible) -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">
                Correo electrónico para respuesta <span class="text-red-500">*</span>
              </label>
              <input
                v-model="userEmail"
                type="email"
                placeholder="tu@correo.com"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 outline-none text-sm transition-all"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-500': emailError
                }"
                :disabled="isSending"
                required
                @blur="validateEmail"
              />
              <p v-if="emailError" class="text-xs text-red-600 font-medium">{{ emailError }}</p>
              <p v-else class="text-xs text-gray-600 font-medium">
                📧 <strong>Se enviará la respuesta a este correo electrónico.</strong> Asegúrate de ingresar un correo válido y revisar tu bandeja de entrada.
              </p>
            </div>

            <!-- Campo honeypot (oculto para bots) -->
            <div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
              <label for="website-url">URL del sitio web</label>
              <input
                id="website-url"
                v-model="honeypotField"
                type="text"
                name="website-url"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <!-- Mensaje de rate limiting -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="rateLimitError" class="bg-gradient-to-br from-red-50 via-rose-50 to-red-50/50 border-2 border-red-300 rounded-xl p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <ShieldCheckIcon class="w-6 h-6 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-red-800">
                      Demasiados intentos
                    </p>
                    <p class="text-xs text-red-700">
                      {{ rateLimitError }}
                    </p>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Zona de drag and drop para archivos -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="[
                'relative border-2 border-dashed rounded-lg px-2 py-1.5 transition-all',
                isDragging 
                  ? 'border-natillera-500 bg-natillera-50/50' 
                  : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50'
              ]"
            >
              <input
                ref="fileInputRef"
                type="file"
                multiple
                @change="handleFileSelect"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              />
              
              <!-- Vista cuando no hay archivos -->
              <div v-if="attachedFiles.length === 0" class="text-center py-0.5">
                <div class="flex flex-col items-center gap-1">
                  <div class="w-8 h-8 bg-natillera-100 rounded-full flex items-center justify-center">
                    <PaperClipIcon class="w-4 h-4 text-natillera-600" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-700">
                      Arrastra archivos aquí o
                      <button
                        type="button"
                        @click="fileInputRef?.click()"
                        :disabled="isSending || uploadingFiles"
                        class="text-natillera-600 hover:text-natillera-700 font-bold underline"
                      >
                        haz clic para seleccionar
                      </button>
                    </p>
                    <p class="text-[10px] text-gray-500 mt-0.5">
                      Imágenes, PDFs, documentos (máx. 10MB por archivo)
                    </p>
                  </div>
                </div>
              </div>

              <!-- Vista cuando hay archivos seleccionados -->
              <div v-else class="space-y-1">
                <div class="flex items-center justify-between mb-0.5">
                  <p class="text-xs font-semibold text-gray-700">
                    {{ attachedFiles.length }} {{ attachedFiles.length === 1 ? 'archivo adjunto' : 'archivos adjuntos' }}
                  </p>
                  <button
                    type="button"
                    @click="fileInputRef?.click()"
                    :disabled="isSending || uploadingFiles"
                    class="text-[10px] text-natillera-600 hover:text-natillera-700 font-semibold underline"
                  >
                    Agregar más
                  </button>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="(file, index) in attachedFiles"
                    :key="index"
                    class="flex items-center gap-1.5 p-1 bg-white rounded-md border border-gray-200 hover:border-natillera-300 transition-colors"
                  >
                    <!-- Icono según tipo de archivo -->
                    <div class="flex-shrink-0">
                      <div v-if="file.type?.startsWith('image/')" class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <PhotoIcon class="w-4 h-4 text-blue-600" />
                      </div>
                      <div v-else class="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <DocumentIcon class="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <!-- Información del archivo -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-800 truncate">
                        {{ file.name }}
                      </p>
                      <p class="text-[10px] text-gray-500">
                        {{ formatFileSize(file.size) }}
                        <span v-if="file.uploading" class="ml-1.5 text-natillera-600">Subiendo...</span>
                        <span v-else-if="file.uploaded" class="ml-1.5 text-green-600">✓ Subido</span>
                        <span v-else-if="file.error" class="ml-1.5 text-red-600">✗ Error</span>
                      </p>
                    </div>
                    <!-- Botón para eliminar -->
                    <button
                      type="button"
                      @click="removeFile(index)"
                      :disabled="isSending || uploadingFiles || file.uploading"
                      class="flex-shrink-0 p-0.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircleIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campo de mensaje -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">
                Descripción detallada del ticket <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="userMessage"
                rows="8"
                placeholder="Describe tu consulta, problema o solicitud. Incluye información relevante como pasos que ya intentaste, mensajes de error, capturas de pantalla, etc."
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 outline-none text-sm transition-all resize-none"
                :disabled="isSending"
                required
              ></textarea>
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium text-gray-500">
                  {{ userMessage.length }} caracteres
                </p>
                <p class="text-xs text-gray-400">
                  Mientras más detalle, mejor atención
                </p>
              </div>
            </div>

            <!-- Botón de envío -->
            <button
              @click="sendMessage"
              :disabled="!canSendMessage || isSending"
              class="w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
            >
              <PaperAirplaneIcon v-if="!isSending" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isSending ? 'Enviando...' : 'Enviar mensaje' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Teleport } from 'vue'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, EnvelopeIcon, CheckCircleIcon, InformationCircleIcon, ShieldCheckIcon, PaperClipIcon, XCircleIcon, PhotoIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import emailjs from '@emailjs/browser'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const isOpen = ref(false)
const isSending = ref(false)
const mensajeEnviado = ref(false)
const userEmail = ref('')
const userMessage = ref('')
const emailError = ref('')
const honeypotField = ref('') // Campo honeypot para detectar bots
const formStartTime = ref(null) // Tiempo cuando se abre el formulario
const rateLimitError = ref('')
const resumenEnvio = ref({
  email: '',
  mensaje: '',
  fecha: null
})
const attachedFiles = ref([]) // Archivos adjuntos
const isDragging = ref(false) // Estado de drag and drop
const fileInputRef = ref(null) // Referencia al input de archivos
const uploadingFiles = ref(false) // Estado de subida de archivos

// Configuración de rate limiting (localStorage)
const RATE_LIMIT_KEY = 'chat_rate_limit'
const MAX_REQUESTS = 5 // Máximo de intentos
const TIME_WINDOW = 15 * 60 * 1000 // 15 minutos en milisegundos
const MIN_SUBMIT_TIME = 200 // Mínimo 0.2 segundos (200ms)

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = 'service_vngs31j'
const EMAILJS_TEMPLATE_ID = 'template_pw6wq9z'
const EMAILJS_PUBLIC_KEY = 'qI_IDO-PxHnYZy8Cg'

// Correo remitente
const SENDER_EMAIL = 'soporte@natillerapp.com'
const SENDER_NAME = 'Soporte Natillera'

// Rate limiting frontend (localStorage)
function checkRateLimit() {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY)
    if (!stored) return true

    const data = JSON.parse(stored)
    const now = Date.now()

    // Si pasó la ventana de tiempo, resetear
    if (now - data.firstAttempt > TIME_WINDOW) {
      localStorage.removeItem(RATE_LIMIT_KEY)
      return true
    }

    // Si se excedió el límite
    if (data.count >= MAX_REQUESTS) {
      const timeRemaining = Math.ceil((TIME_WINDOW - (now - data.firstAttempt)) / 1000 / 60)
      rateLimitError.value = `Demasiados intentos. Por favor espera ${timeRemaining} minutos antes de intentar de nuevo.`
      return false
    }

    return true
  } catch (error) {
    console.error('Error en rate limiting:', error)
    return true // Permitir si hay error
  }
}

function recordRateLimit() {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY)
    const now = Date.now()

    if (!stored) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        firstAttempt: now,
        lastAttempt: now,
        count: 1
      }))
    } else {
      const data = JSON.parse(stored)
      // Si pasó la ventana, resetear
      if (now - data.firstAttempt > TIME_WINDOW) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          firstAttempt: now,
          lastAttempt: now,
          count: 1
        }))
      } else {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          firstAttempt: data.firstAttempt,
          lastAttempt: now,
          count: data.count + 1
        }))
      }
    }
  } catch (error) {
    console.error('Error guardando rate limit:', error)
  }
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function validateEmail() {
  const email = userEmail.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    emailError.value = 'El correo electrónico es requerido'
    return false
  }
  
  if (!emailRegex.test(email)) {
    emailError.value = 'Por favor ingresa un correo electrónico válido'
    return false
  }
  
  emailError.value = ''
  return true
}

const canSendMessage = computed(() => {
  if (isSending.value) return false
  if (rateLimitError.value) return false
  
  // Validar email sin mostrar error (solo verificar formato básico)
  const email = userEmail.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) return false
  
  if (!userMessage.value.trim()) return false
  
  // Validar tiempo mínimo (debe haber pasado al menos 200ms desde que se abrió)
  if (formStartTime.value && Date.now() - formStartTime.value < MIN_SUBMIT_TIME) {
    return false
  }
  
  return true
})

function resetForm() {
  userEmail.value = authStore.isAuthenticated ? (authStore.userEmail || '') : ''
  userMessage.value = ''
  emailError.value = ''
  honeypotField.value = '' // Resetear honeypot
  formStartTime.value = Date.now() // Registrar tiempo de apertura del formulario
  rateLimitError.value = ''
  mensajeEnviado.value = false
  attachedFiles.value = []
  isDragging.value = false
  uploadingFiles.value = false
  resumenEnvio.value = {
    email: '',
    mensaje: '',
    fecha: null
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  addFiles(files)
  // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleFileDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files || [])
  addFiles(files)
}

function addFiles(files) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const MAX_FILES = 5
  
  files.forEach(file => {
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      notificationStore.warning(
        `El archivo "${file.name}" excede el tamaño máximo de 10MB`,
        'Archivo muy grande'
      )
      return
    }
    
    // Validar cantidad máxima
    if (attachedFiles.value.length >= MAX_FILES) {
      notificationStore.warning(
        `Solo puedes adjuntar un máximo de ${MAX_FILES} archivos`,
        'Límite de archivos'
      )
      return
    }
    
    // Agregar archivo
    attachedFiles.value.push({
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: false,
      uploaded: false,
      error: false,
      url: null
    })
  })
}

function removeFile(index) {
  attachedFiles.value.splice(index, 1)
}


async function sendMessage() {
  if (!canSendMessage.value || isSending.value) return

  // Validación 1: Honeypot - Si el campo está lleno, es un bot
  if (honeypotField.value && honeypotField.value.trim() !== '') {
    // Silenciosamente rechazar (no mostrar error para no revelar el honeypot)
    console.warn('Bot detectado por honeypot')
    return
  }

  // Validación 2: Rate limiting frontend
  if (!checkRateLimit()) {
    return
  }

  // Validación 3: Tiempo mínimo (debe haber pasado al menos 200ms)
  if (!formStartTime.value || Date.now() - formStartTime.value < MIN_SUBMIT_TIME) {
    notificationStore.warning('Por favor completa el formulario correctamente.', 'Validación requerida')
    return
  }

  // Validar email
  if (!validateEmail()) {
    notificationStore.warning('Por favor ingresa un correo electrónico válido', 'Email inválido')
    return
  }

  // Validar que haya un mensaje
  if (!userMessage.value.trim()) {
    notificationStore.warning(
      'Por favor ingresa un mensaje',
      'Mensaje requerido'
    )
    return
  }

  const messageText = userMessage.value.trim()
  const email = userEmail.value.trim()
  const submitTimeMs = Date.now() - formStartTime.value
  isSending.value = true
  uploadingFiles.value = true
  rateLimitError.value = ''

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Subir archivos primero si hay alguno
    const fileUrls = []
    if (attachedFiles.value.length > 0) {
      for (let i = 0; i < attachedFiles.value.length; i++) {
        const fileItem = attachedFiles.value[i]
        fileItem.uploading = true
        fileItem.error = false
        
        try {
          // Generar nombre único para el archivo
          const fileExt = fileItem.file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `support/${userId || 'anonymous'}/${fileName}`
          
          // Subir archivo a Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('support-files')
            .upload(filePath, fileItem.file, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadError) {
            throw uploadError
          }
          
          // Obtener URL pública del archivo
          const { data: { publicUrl } } = supabase.storage
            .from('support-files')
            .getPublicUrl(filePath)
          
          fileItem.uploaded = true
          fileItem.url = publicUrl
          fileUrls.push({
            name: fileItem.name,
            url: publicUrl,
            size: fileItem.size,
            type: fileItem.type
          })
        } catch (uploadError) {
          console.error('Error subiendo archivo:', uploadError)
          fileItem.error = true
          fileItem.uploading = false
          notificationStore.warning(
            `Error al subir "${fileItem.name}". El mensaje se enviará sin este archivo.`,
            'Error de archivo'
          )
        } finally {
          fileItem.uploading = false
        }
      }
    }
    
    uploadingFiles.value = false

    // Construir mensaje con información de archivos si hay
    let finalMessage = messageText
    if (fileUrls.length > 0) {
      finalMessage += '\n\n📎 Archivos adjuntos:\n'
      fileUrls.forEach((file, index) => {
        finalMessage += `${index + 1}. ${file.name} (${formatFileSize(file.size)})\n${file.url}\n`
      })
    }

    // Validación server-side usando función de Supabase
    const { data: validationResult, error: validationError } = await supabase.rpc(
      'insert_chat_message_with_validation',
      {
        p_user_id: userId,
        p_user_email: email,
        p_message: finalMessage,
        p_submit_time_ms: submitTimeMs,
        p_client_ip: null // Supabase manejará la IP automáticamente
      }
    )

    if (validationError) {
      console.error('Error de validación:', validationError)
      throw new Error(validationError.message || 'Error al validar el mensaje')
    }

    // Verificar resultado de la validación
    // validationResult es un JSONB directamente
    const result = validationResult || {}
    
    if (result.success === false) {
      if (result.error === 'rate_limit') {
        rateLimitError.value = result.message || 'Demasiados intentos. Por favor espera unos minutos.'
        // Actualizar localStorage con el bloqueo
        if (result.retry_after_minutes) {
          const now = Date.now()
          localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
            firstAttempt: now,
            lastAttempt: now,
            count: MAX_REQUESTS,
            blockedUntil: now + (result.retry_after_minutes * 60 * 1000)
          }))
        }
        notificationStore.error(result.message || 'Demasiados intentos', 'Rate limit')
        return
      } else {
        notificationStore.error(result.message || 'Error al validar el mensaje', 'Error de validación')
        return
      }
    }

    // Registrar rate limit en frontend
    recordRateLimit()

    // Enviar email usando EmailJS (en segundo plano)
    // El correo llega a raigo.16@gmail.com para que puedas responder directamente
    const emailParams = {
      message: finalMessage,
      from_name: email,
      from_email: SENDER_EMAIL,
      to_email: 'raigo.16@gmail.com', // Correo donde recibirás las notificaciones
      timestamp: new Date().toLocaleString('es-CO'),
      reply_to: email // Para que puedas responder directamente al usuario
    }
    
    console.log('Enviando email con EmailJS:', {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      to_email: emailParams.to_email,
      from_email: emailParams.from_email,
      message_length: finalMessage.length
    })
    
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams,
      EMAILJS_PUBLIC_KEY
    )
      .then((result) => {
        console.log('✅ Email enviado exitosamente:', result)
      })
      .catch((err) => {
        console.error('❌ Error enviando email:', err)
        console.error('Detalles del error:', {
          status: err?.status,
          text: err?.text,
          message: err?.message
        })
        // No mostrar error al usuario, el mensaje ya se guardó en la BD
      })

    // Guardar resumen para mostrar
    resumenEnvio.value = {
      email: email,
      mensaje: messageText,
      fecha: new Date(),
      archivos: fileUrls.length > 0 ? fileUrls.length : 0
    }

    // Mostrar confirmación
    mensajeEnviado.value = true
    notificationStore.success('Mensaje enviado exitosamente. Te responderemos pronto.', 'Éxito')
  } catch (error) {
    console.error('Error enviando mensaje:', error)
    const errorMessage = error?.message || 'Error desconocido'
    notificationStore.error(
      `Error al enviar mensaje: ${errorMessage}\n\nPor favor verifica tu conexión e intenta de nuevo.`,
      'Error al enviar'
    )
  } finally {
    isSending.value = false
    uploadingFiles.value = false
  }
}

// Inicializar email si está autenticado cuando se abre el formulario
watch(isOpen, (isOpenValue) => {
  if (isOpenValue) {
    // Si está autenticado y no hay email, usar el del store
    if (authStore.isAuthenticated && authStore.userEmail && !userEmail.value) {
      userEmail.value = authStore.userEmail
    }
    // Reiniciar el tiempo cuando se abre el formulario
    formStartTime.value = Date.now()
  }
})
</script>



