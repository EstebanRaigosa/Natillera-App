<template>
  <!-- Verificación de acceso -->
  <div v-if="!hasAccess" class="max-w-6xl mx-auto p-4 sm:p-6">
    <div class="card text-center py-12">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XMarkIcon class="w-8 h-8 text-red-600" />
      </div>
      <h2 class="text-2xl font-display font-bold text-gray-800 mb-2">
        Acceso Denegado
      </h2>
      <p class="text-gray-600">
        No tienes permisos para acceder a esta sección.
      </p>
      <router-link
        to="/dashboard"
        class="btn-primary mt-6 inline-block"
      >
        Volver al Dashboard
      </router-link>
    </div>
  </div>

  <!-- Contenido principal (solo si tiene acceso) -->
  <div v-else class="max-w-6xl mx-auto p-4 sm:p-6">
    <div class="mb-6">
      <Breadcrumbs />
      <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2">
        Centro de Soporte
      </h1>
      <p class="text-gray-600">Gestiona las consultas y mensajes de los usuarios</p>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-3 items-center">
        <button
          @click="filter = 'all'"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all',
            filter === 'all' 
              ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Todos ({{ allMessages.length }})
        </button>
        <button
          @click="filter = 'unread'"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all',
            filter === 'unread' 
              ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Sin responder ({{ unreadCount }})
        </button>
        <button
          @click="filter = 'answered'"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all',
            filter === 'answered' 
              ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Respondidos ({{ answeredCount }})
        </button>
      </div>
    </div>

    <!-- Lista de tickets -->
    <div class="space-y-4">
      <div
        v-for="conversation in filteredConversations"
        :key="conversation.userId"
        class="card hover:shadow-xl transition-all cursor-pointer border-l-4"
        :class="[
          conversation.hasResponse ? 'border-l-green-500' : 'border-l-red-500'
        ]"
        @click="selectConversation(conversation)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {{ conversation.userEmail?.[0]?.toUpperCase() || 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-800 truncate">{{ conversation.userEmail || 'Usuario' }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(conversation.lastMessageDate) }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-700 line-clamp-2 mb-2">
              {{ getMessagePreview(conversation.lastMessage) }}
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-semibold',
                  conversation.hasResponse 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                ]"
              >
                {{ conversation.hasResponse ? 'Respondido' : 'Sin responder' }}
              </span>
              <span v-if="getAttachmentsCount(conversation.lastMessage) > 0" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <PaperClipIcon class="w-3 h-3" />
                {{ getAttachmentsCount(conversation.lastMessage) }} archivo{{ getAttachmentsCount(conversation.lastMessage) !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
            <button
              v-if="conversation.hasResponse"
              @click.stop="confirmDelete(conversation)"
              :disabled="isDeleting"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar ticket"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredConversations.length === 0" class="card text-center py-12">
        <p class="text-gray-500">No hay tickets para mostrar</p>
      </div>
    </div>

    <!-- Modal de ticket detallado -->
    <div
      v-if="selectedConversation"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="selectedConversation = null"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-natillera-500 to-emerald-600 p-6 text-white flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div class="flex-1">
            <h3 class="font-bold text-xl mb-1">Consulta de Soporte</h3>
            <p class="text-sm text-white/90">{{ selectedConversation.userEmail }}</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Botón para abrir Gmail -->
            <a
              :href="`mailto:${selectedConversation.userEmail}?subject=Re: Consulta Natillerapp`"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
              title="Responder desde tu correo"
            >
              <EnvelopeIcon class="w-5 h-5" />
              Responder en Gmail
            </a>
            <button
              @click="selectedConversation = null"
              class="w-9 h-9 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido del ticket -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          <!-- Mensaje del usuario -->
          <div
            v-for="msg in selectedConversation.messages.filter(m => m.is_from_user)"
            :key="msg.id"
            class="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {{ selectedConversation.userEmail?.[0]?.toUpperCase() || 'U' }}
                </div>
                <div>
                  <p class="font-semibold text-gray-800">{{ selectedConversation.userEmail }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(msg.created_at) }}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Consulta del usuario
              </span>
            </div>
            
            <!-- Mensaje -->
            <div class="mb-4">
              <p class="text-gray-700 whitespace-pre-wrap">{{ getMessageText(msg.message) }}</p>
            </div>

            <!-- Archivos adjuntos -->
            <div v-if="getAttachments(msg.message).length > 0" class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Archivos adjuntos</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="(file, index) in getAttachments(msg.message)"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-natillera-300 transition-colors"
                >
                  <div class="flex-shrink-0">
                    <div v-if="file.type?.startsWith('image/')" class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon class="w-5 h-5 text-blue-600" />
                    </div>
                    <div v-else class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DocumentIcon class="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ file.size }}</p>
                  </div>
                  <a
                    :href="file.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-shrink-0 px-3 py-1.5 bg-natillera-500 hover:bg-natillera-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ArrowDownTrayIcon class="w-4 h-4" />
                    Descargar
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Respuestas del admin -->
          <div
            v-for="msg in selectedConversation.messages.filter(m => !m.is_from_user)"
            :key="msg.id"
            class="bg-natillera-50 rounded-xl p-5 shadow-sm border border-natillera-200"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-natillera-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p class="font-semibold text-gray-800">Soporte <AppBrand /></p>
                  <p class="text-xs text-gray-500">{{ formatDate(msg.created_at) }}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Respuesta
              </span>
            </div>
            <p class="text-gray-700 whitespace-pre-wrap">{{ msg.response || msg.message }}</p>
          </div>
        </div>

        <!-- Footer informativo -->
        <div class="border-t border-gray-200 p-6 bg-white rounded-b-2xl flex-shrink-0">
          <div class="text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-natillera-50 border border-natillera-200 rounded-xl">
              <EnvelopeIcon class="w-5 h-5 text-natillera-600" />
              <p class="text-sm text-natillera-700 font-medium">
                Responde desde tu correo a <strong>{{ selectedConversation.userEmail }}</strong>
              </p>
            </div>
            <p class="text-xs text-gray-500">
              💡 Los mensajes nuevos se envían automáticamente a tu correo para que puedas responder directamente.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 p-4 sm:p-5 text-white">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <TrashIcon class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-lg">Confirmar eliminación</h3>
                <p class="text-sm text-white/90">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-4 sm:p-6">
            <p class="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar todos los mensajes del ticket de
              <strong class="text-gray-900">{{ conversationToDelete?.userEmail || 'este usuario' }}</strong>?
            </p>
            <p class="text-sm text-gray-500">
              Se eliminarán {{ conversationToDelete?.messageCount || 0 }} mensaje{{ conversationToDelete?.messageCount !== 1 ? 's' : '' }} permanentemente.
            </p>
          </div>

          <!-- Acciones -->
          <div class="p-4 sm:p-6 bg-gray-50 flex gap-3">
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!isDeleting" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isDeleting ? 'Eliminando...' : 'Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import { useSupportStore } from '../../stores/support'
import { useNotificationStore } from '../../stores/notifications'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import AppBrand from '../../components/AppBrand.vue'
import { ChevronRightIcon, XMarkIcon, PaperClipIcon, TrashIcon, EnvelopeIcon, DocumentIcon, PhotoIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { generateShortTicketNumber, generateSupportSubject, generateSupportEmailBody } from '../../utils/ticketHelper'
import emailjs from '@emailjs/browser'

const authStore = useAuthStore()
const supportStore = useSupportStore()
const notificationStore = useNotificationStore()
const filter = ref('all')
const allMessages = ref([])
const selectedConversation = ref(null)
const hasAccess = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const conversationToDelete = ref(null)
const replyMessage = ref('')
const isSendingReply = ref(false)

// Email permitido para acceder
const ALLOWED_EMAIL = 'raigo.16@gmail.com'

// Verificar acceso
async function checkAccess() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === ALLOWED_EMAIL) {
      hasAccess.value = true
    } else {
      hasAccess.value = false
    }
  } catch (error) {
    console.error('Error verificando acceso:', error)
    hasAccess.value = false
  }
}

// Función para extraer archivos del mensaje
function getAttachments(message) {
  if (!message) return []
  
  const attachments = []
  const lines = message.split('\n')
  let inAttachmentsSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.includes('📎 Archivos adjuntos:')) {
      inAttachmentsSection = true
      continue
    }
    
    if (inAttachmentsSection && line.match(/^\d+\.\s+/)) {
      // Formato: "1. nombre (tamaño)\nurl"
      const match = line.match(/^\d+\.\s+(.+?)\s+\((.+?)\)/)
      if (match && i + 1 < lines.length) {
        const name = match[1].trim()
        const size = match[2].trim()
        const url = lines[i + 1].trim()
        
        if (url.startsWith('http')) {
          attachments.push({
            name,
            size,
            url,
            type: name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? 'image/' : 'application/'
          })
          i++ // Saltar la línea de URL
        }
      }
    }
  }
  
  return attachments
}

// Función para contar archivos
function getAttachmentsCount(message) {
  return getAttachments(message).length
}

// Función para obtener solo el texto del mensaje (sin archivos)
function getMessageText(message) {
  if (!message) return ''
  
  const lines = message.split('\n')
  const textLines = []
  let inAttachmentsSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.includes('📎 Archivos adjuntos:')) {
      inAttachmentsSection = true
      continue
    }
    
    if (inAttachmentsSection) {
      // Si es una línea de archivo o URL, saltarla
      if (line.match(/^\d+\.\s+/) || line.trim().startsWith('http')) {
        continue
      }
      // Si encontramos una línea vacía después de archivos, puede ser el final
      if (line.trim() === '' && i > 0 && lines[i - 1].trim().startsWith('http')) {
        continue
      }
    }
    
    if (!inAttachmentsSection || line.trim() !== '') {
      textLines.push(line)
    }
  }
  
  return textLines.join('\n').trim()
}

// Función para obtener preview del mensaje (sin archivos)
function getMessagePreview(message) {
  const text = getMessageText(message)
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// Función para obtener el número de ticket
function getTicketNumber(conversation) {
  if (!conversation || !conversation.userEmail) return 'XXXXX'
  return generateShortTicketNumber(conversation.userEmail)
}

// Función para validar y limitar el mensaje
function validateReplyMessage() {
  const message = replyMessage.value
  if (message.length > 500) {
    replyMessage.value = message.substring(0, 500)
  }
}

// Función para formatear el mensaje (convierte saltos de línea a HTML)
function formatMessageHTML(replyMessage) {
  // Convertir saltos de línea a <br> y escapar HTML básico
  return replyMessage
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\r\n/g, '<br>')
}

// Función para generar el HTML del correo desde la plantilla
function generateEmailHTML(ticketNumber, replyMessage, userEmail) {
  // Convertir saltos de línea a <br>
  const formattedMessage = replyMessage
    .replace(/\n/g, '<br>')
    .replace(/\r\n/g, '<br>')
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Respuesta Ticket de Soporte - Natillerapp</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #cbd5e1 0%, #e5e7eb 50%, #a7f3d0 100%); font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #cbd5e1 0%, #e5e7eb 50%, #a7f3d0 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid rgba(255, 255, 255, 0.5); overflow: hidden;">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                🌱 <span style="color: #ffffff;">Natiller</span><span style="color: #d1fae5;">app</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95); font-weight: 500;">
                Soporte Técnico
              </p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 50px 40px;">
              
              <!-- Badge de Ticket -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                      <span style="font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                        Ticket #${ticketNumber}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Icono de soporte -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; display: inline-block; box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.3); position: relative;">
                      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px;">
                        💬
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Título -->
              <h2 style="margin: 0 0 20px 0; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 700; color: #1f2937; text-align: center; line-height: 1.3;">
                Respuesta a tu solicitud de soporte
              </h2>

              <!-- Mensaje principal -->
              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                Hola,
              </p>
              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: left;">
                Gracias por contactarnos. Hemos revisado tu solicitud de soporte <strong style="color: #16a34a;">#${ticketNumber}</strong> y estamos aquí para ayudarte.
              </p>

              <!-- Área de respuesta -->
              <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #22c55e;">
                <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Nuestra respuesta:
                </p>
                <div style="padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #374151;">
                    ${formattedMessage}
                  </p>
                </div>
              </div>

              <!-- Información adicional -->
              <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #92400e; text-align: center; font-weight: 600;">
                  ℹ️ Información importante
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f; text-align: center;">
                  Por favor, mantén este ticket de referencia (#${ticketNumber}) en todas tus respuestas para un seguimiento más eficiente.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                <strong>¿Necesitas más ayuda?</strong><br>
                Responde a este correo y nuestro equipo te asistirá lo antes posible.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                © 2024 <span style="color: #111827;">Natiller</span><span style="color: #22c55e;">app</span>. Plataforma de Ahorro Comunitario Digital. 🌱
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Función para generar el enlace de Gmail con número de ticket
function getGmailReplyLink(conversation) {
  if (!conversation || !conversation.userEmail) {
    return '#'
  }
  
  const ticketNumber = generateShortTicketNumber(conversation.userEmail)
  const subject = generateSupportSubject(ticketNumber)
  const body = generateSupportEmailBody(ticketNumber, conversation.userEmail)
  
  // Obtener el primer mensaje del usuario (si existe)
  const userMessage = conversation.messages?.find(m => m.is_from_user)
  const messagePreview = userMessage?.message ? getMessageText(userMessage.message).substring(0, 200) : ''
  
  // Construir el body completo
  const fullBody = body + (messagePreview ? messagePreview + '\n\n' : '')
  
  // Crear el enlace de Gmail
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(conversation.userEmail)}&from=${encodeURIComponent('soporte@natillerapp.com')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`
  
  return gmailUrl
}

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = 'service_vngs31j'
// IMPORTANTE: Crea un nuevo template en EmailJS para respuestas
// Instrucciones completas en: supabase/email-templates/EMAILJS_SETUP.md
// Template ID del nuevo template (reemplázalo cuando lo crees)
const EMAILJS_TEMPLATE_ID_REPLY = 'template_support_reply' // TODO: Reemplazar con tu Template ID real
// Template existente (como fallback temporal)
const EMAILJS_TEMPLATE_ID_EXISTING = 'template_gfc5jhh'
const EMAILJS_PUBLIC_KEY = 'qI_IDO-PxHnYZy8Cg'
const SENDER_EMAIL = 'soporte@natillerapp.com'
const SENDER_NAME = 'Soporte Natillerapp'

// Función para enviar respuesta por EmailJS
async function sendReply(conversation) {
  // Validación mejorada
  const messageTrimmed = replyMessage.value.trim()
  
  if (!conversation || !conversation.userEmail) {
    notificationStore.error('Error: No se puede identificar el destinatario', 'Error')
    return
  }
  
  if (!messageTrimmed || messageTrimmed.length < 5) {
    notificationStore.error('El mensaje debe tener al menos 5 caracteres', 'Error')
    return
  }
  
  if (messageTrimmed.length > 500) {
    notificationStore.error('El mensaje no puede tener más de 500 caracteres', 'Error')
    return
  }

  isSendingReply.value = true

  try {
    const ticketNumber = getTicketNumber(conversation)
    const subject = generateSupportSubject(ticketNumber)
    // Formatear solo el mensaje, no todo el HTML (la plantilla está en EmailJS)
    const formattedMessage = formatMessageHTML(messageTrimmed)

    // Verificar que el ticketNumber se genere correctamente
    if (!ticketNumber || ticketNumber === 'XXXXX') {
      console.error('Error: No se pudo generar el número de ticket')
      notificationStore.error('Error: No se pudo generar el número de ticket', 'Error')
      isSendingReply.value = false
      return
    }

    // Log para debugging
    console.log('Enviando correo:', {
      to: conversation.userEmail,
      subject: subject,
      ticketNumber: ticketNumber,
      ticket_number: ticketNumber, // Verificar ambos nombres
      messageLength: messageTrimmed.length,
      formattedMessagePreview: formattedMessage.substring(0, 50)
    })

    // Enviar correo usando EmailJS
    // La plantilla HTML completa está en EmailJS, solo enviamos las variables
    // IMPORTANTE: Los nombres de las variables deben coincidir exactamente con {{variable}} en EmailJS
    const templateParams = {
      to_email: conversation.userEmail,
      to_name: conversation.userEmail.split('@')[0],
      from_email: SENDER_EMAIL,
      from_name: SENDER_NAME,
      reply_to: SENDER_EMAIL,
      subject: subject,
      // Solo el contenido del mensaje formateado (la plantilla está en EmailJS)
      message_html: formattedMessage,
      ticket_number: ticketNumber, // Esta variable debe estar en el template como {{ticket_number}}
      ticketNumber: ticketNumber, // También enviar sin guión por si acaso
      message_text: messageTrimmed.replace(/\n/g, ' ').substring(0, 200),
      // Campos para el template existente (fallback)
      message: `Ticket #${ticketNumber}\n\n${messageTrimmed}\n\n---\nEste correo fue enviado desde el centro de soporte de Natillerapp.\nRemitente: ${SENDER_NAME} (${SENDER_EMAIL})`,
      timestamp: new Date().toLocaleString('es-CO')
    }

    // Log completo de los parámetros que se envían
    console.log('Template params completos:', templateParams)

    // Intentar enviar con el template de respuestas
    let emailSent = false
    try {
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_REPLY,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )
      console.log('Correo enviado exitosamente:', result)
      emailSent = true
    } catch (emailError) {
      console.error('Error con template de respuestas:', emailError)
      
      // Si el template nuevo no existe o falla, usar el existente (fallback)
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID_EXISTING,
          {
            message: `Ticket #${ticketNumber}\n\n${messageTrimmed}\n\n---\nEste correo fue enviado desde el centro de soporte de Natillerapp.\nRemitente: ${SENDER_NAME} (${SENDER_EMAIL})`,
            from_name: SENDER_NAME,
            from_email: SENDER_EMAIL,
            to_email: conversation.userEmail,
            timestamp: new Date().toLocaleString('es-CO'),
            reply_to: SENDER_EMAIL
          },
          EMAILJS_PUBLIC_KEY
        )
        console.log('Correo enviado exitosamente con template fallback')
        emailSent = true
        
        // Mostrar advertencia de que se usó el template básico
        notificationStore.info(
          'Respuesta enviada exitosamente usando template básico. Para usar la plantilla HTML completa, verifica la configuración del template en EmailJS.',
          'Nota'
        )
      } catch (fallbackError) {
        console.error('Error también con template fallback:', fallbackError)
        throw fallbackError // Re-lanzar el error para que se maneje en el catch principal
      }
    }

    // Si no se envió el correo, lanzar error
    if (!emailSent) {
      throw new Error('No se pudo enviar el correo con ningún template disponible')
    }

    // Guardar la respuesta en la base de datos
    const userMessages = conversation.messages?.filter(m => m.is_from_user) || []
    if (userMessages.length > 0) {
      // Actualizar el primer mensaje del usuario con la respuesta
      const firstUserMessage = userMessages[0]
      
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({
          response: messageTrimmed,
          updated_at: new Date().toISOString()
        })
        .eq('id', firstUserMessage.id)

      if (updateError) {
        console.error('Error guardando respuesta:', updateError)
      }
    }

    // Cargar mensajes actualizados
    await loadMessages()

    // Actualizar la conversación seleccionada
    const updatedConversations = conversations.value
    const updatedConv = updatedConversations.find(
      c => (c.userId === conversation.userId) || 
           (!c.userId && c.userEmail === conversation.userEmail)
    )
    if (updatedConv) {
      selectedConversation.value = updatedConv
    }

    // Limpiar el formulario
    replyMessage.value = ''

    notificationStore.success(
      `Respuesta enviada exitosamente a ${conversation.userEmail}`,
      'Éxito'
    )
  } catch (error) {
    console.error('Error enviando respuesta:', error)
    
    // Extraer mensaje de error más detallado
    let errorMessage = 'Error desconocido'
    if (error?.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.text || error.response.statusText}`
    } else if (error?.text) {
      errorMessage = error.text
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    console.error('Detalles del error:', {
      error,
      message: errorMessage,
      templateParams: {
        to_email: conversation.userEmail,
        ticket_number: ticketNumber,
        subject: subject
      }
    })
    
    notificationStore.error(
      `Error al enviar la respuesta: ${errorMessage}. Por favor verifica la configuración de EmailJS.`,
      'Error'
    )
  } finally {
    isSendingReply.value = false
  }
}

const conversations = computed(() => {
  const grouped = {}
  
  allMessages.value.forEach(msg => {
    // Usar user_email como clave principal (más confiable que user_id)
    // Si no hay user_email, usar user_id, y si tampoco hay, usar 'unknown'
    const groupKey = msg.user_email || msg.user_id || 'unknown'
    
    if (!grouped[groupKey]) {
      // Inicializar el grupo con los datos del primer mensaje
      grouped[groupKey] = {
        userId: msg.user_id || null,
        userEmail: msg.user_email || 'Usuario sin correo',
        messages: [],
        hasResponse: false,
        lastMessage: '',
        lastMessageDate: null
      }
    }
    
    // Agregar el mensaje al grupo
    grouped[groupKey].messages.push(msg)
    
    // Verificar si tiene respuesta
    if (msg.response) {
      grouped[groupKey].hasResponse = true
    }
    
    // Actualizar último mensaje y fecha
    if (!grouped[groupKey].lastMessageDate || new Date(msg.created_at) > new Date(grouped[groupKey].lastMessageDate)) {
      grouped[groupKey].lastMessage = msg.message
      grouped[groupKey].lastMessageDate = msg.created_at
    }
  })
  
  return Object.values(grouped).map(conv => ({
    ...conv,
    messageCount: conv.messages.length,
    messages: conv.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  })).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate))
})

const filteredConversations = computed(() => {
  if (filter.value === 'unread') {
    return conversations.value.filter(c => !c.hasResponse)
  }
  if (filter.value === 'answered') {
    return conversations.value.filter(c => c.hasResponse)
  }
  return conversations.value
})

const unreadCount = computed(() => conversations.value.filter(c => !c.hasResponse).length)
const answeredCount = computed(() => conversations.value.filter(c => c.hasResponse).length)

async function loadMessages() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    allMessages.value = data.map(msg => ({
      ...msg,
      user_email: msg.user_email || `Usuario ${msg.user_id?.substring(0, 8) || 'Desconocido'}`
    }))
    
    supportStore.loadUnreadCount()
  } catch (error) {
    console.error('Error cargando mensajes:', error)
    allMessages.value = []
  }
}

function selectConversation(conversation) {
  selectedConversation.value = conversation
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function confirmDelete(conversation) {
  conversationToDelete.value = conversation
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  conversationToDelete.value = null
}

async function deleteConversation(conversation) {
  if (isDeleting.value) return
  
  isDeleting.value = true
  
  try {
    let query = supabase.from('chat_messages').delete()
    
    if (conversation.userId) {
      query = query.eq('user_id', conversation.userId)
    } else if (conversation.userEmail) {
      query = query.eq('user_email', conversation.userEmail)
    } else {
      throw new Error('No se puede identificar la conversación')
    }

    const { error } = await query

    if (error) throw error

    if (selectedConversation.value && 
        ((conversation.userId && selectedConversation.value.userId === conversation.userId) ||
         (!conversation.userId && selectedConversation.value.userEmail === conversation.userEmail))) {
      selectedConversation.value = null
    }

    await loadMessages()
    
    showDeleteConfirm.value = false
    conversationToDelete.value = null
    
    notificationStore.success('Ticket eliminado exitosamente', 'Éxito')
  } catch (error) {
    console.error('Error eliminando ticket:', error)
    notificationStore.error('Error al eliminar el ticket. Por favor intenta de nuevo.', 'Error')
  } finally {
    isDeleting.value = false
  }
}

async function executeDelete() {
  if (!conversationToDelete.value) return
  await deleteConversation(conversationToDelete.value)
}

onMounted(async () => {
  await checkAccess()
  if (hasAccess.value) {
    supportStore.resetUnreadCount()
    loadMessages()
    setInterval(loadMessages, 5000)
  }
})
</script>
