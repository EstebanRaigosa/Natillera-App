import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'
import { BASE_URL, devLog } from '../config/environment'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastLoginAudit = ref(null) // Para evitar duplicados

  const isEmailConfirmed = computed(() => {
    if (!user.value) return false
    return !!user.value.email_confirmed_at
  })

  const isAuthenticated = computed(() => {
    if (!user.value) return false
    return !!user.value.email_confirmed_at
  })
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.user_metadata?.nombre || user.value?.email?.split('@')[0] || 'Usuario')

  async function checkAuth() {
    try {
      loading.value = true
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
    } catch (e) {
      console.error('Error verificando autenticación:', e)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Función helper para traducir errores de Supabase
  function translateAuthError(error) {
    const errorMessage = error?.message || error || ''
    
    // Mapeo de errores comunes de Supabase a español
    const errorMap = {
      'Invalid login credentials': 'Las credenciales ingresadas no son válidas. Por favor, verifica tu correo electrónico y contraseña.',
      'invalid login credentials': 'Las credenciales ingresadas no son válidas. Por favor, verifica tu correo electrónico y contraseña.',
      'Email not confirmed': 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
      'User not found': 'No se encontró una cuenta con este correo electrónico.',
      'Invalid email': 'El formato del correo electrónico no es válido.',
      'Password is required': 'La contraseña es requerida.',
      'Email is required': 'El correo electrónico es requerido.'
    }
    
    // Buscar coincidencias parciales o exactas
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }
    
    // Si no hay traducción, retornar el mensaje original
    return errorMessage
  }

  async function login(email, password) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      user.value = data.user
      
      // Verificar si el email está confirmado
      if (!data.user.email_confirmed_at) {
        // Cerrar sesión si el email no está confirmado
        await supabase.auth.signOut()
        user.value = null
        return { success: false, error: 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.' }
      }
      
      // Registrar ingreso al sistema en auditoría
      // Se registra aquí para login con email/password, y en onAuthStateChange para OAuth
      const auditoria = useAuditoria()
      lastLoginAudit.value = Date.now()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'REGISTER',
          entidad: 'configuracion',
          descripcion: `Usuario ${data.user.email} inició sesión en el sistema`,
          detalles: {
            metodo: 'email_password',
            user_agent: navigator.userAgent
          }
        })
      )
      
      return { success: true }
    } catch (e) {
      const translatedError = translateAuthError(e)
      error.value = translatedError
      return { success: false, error: translatedError }
    } finally {
      loading.value = false
    }
  }

async function register(email, password, nombre) {
    try {
      loading.value = true
      error.value = null
      
      // URL de redirección según el entorno (desarrollo o producción)
      const redirectUrl = `${BASE_URL}/auth/welcome`
      devLog('Registro - URL de redirección:', redirectUrl)
      
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre
          },
          emailRedirectTo: redirectUrl
        }
      })
      
      if (authError) throw authError
      
      // No establecer user.value aquí para evitar que se considere autenticado
      // Cerrar sesión inmediatamente después del registro
      if (data.user) {
        await supabase.auth.signOut()
      }
      
      return { success: true, requiresEmailConfirmation: true }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email) {
    try {
      loading.value = true
      error.value = null
      
      // URL de redirección según el entorno (desarrollo o producción)
      const redirectUrl = `${BASE_URL}/auth/reset-password`
      devLog('Reset Password - URL de redirección:', redirectUrl)
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })
      
      if (resetError) throw resetError
      
      return { success: true }
    } catch (e) {
      const errorMessage = e?.message || 'Error al enviar el email de recuperación'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword) {
    try {
      loading.value = true
      error.value = null
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
      
      // Actualizar el usuario en el store
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
      
      return { success: true }
    } catch (e) {
      const errorMessage = e?.message || 'Error al actualizar la contraseña'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      
      // Registrar cierre de sesión en auditoría antes de cerrar
      if (user.value) {
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(
          auditoria.registrar({
            tipoAccion: 'REGISTER',
            entidad: 'configuracion',
            descripcion: `Usuario ${user.value.email} cerró sesión en el sistema`,
            detalles: {
              metodo: 'logout',
              user_agent: navigator.userAgent
            }
          })
        )
      }
      
      await supabase.auth.signOut()
      user.value = null
    } catch (e) {
      console.error('Error al cerrar sesión:', e)
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    try {
      loading.value = true
      error.value = null
      
      // URL de redirección según el entorno (desarrollo o producción)
      const redirectUrl = `${BASE_URL}/dashboard`
      devLog('Google OAuth - URL de redirección:', redirectUrl)
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (authError) throw authError
      
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange(async (event, session) => {
    const previousUser = user.value
    user.value = session?.user || null
    
    // Registrar eventos de autenticación en auditoría
    // Solo registrar SIGNED_IN si es un nuevo usuario (no una actualización de sesión)
    if (event === 'SIGNED_IN' && session?.user) {
      // Evitar duplicados: solo registrar si el usuario cambió o si no se ha registrado en los últimos 5 segundos
      const now = Date.now()
      const shouldAudit = 
        previousUser?.id !== session.user.id || 
        !lastLoginAudit.value || 
        (now - lastLoginAudit.value) > 5000
      
      if (shouldAudit) {
        lastLoginAudit.value = now
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(
          auditoria.registrar({
            tipoAccion: 'REGISTER',
            entidad: 'configuracion',
            descripcion: `Usuario ${session.user.email} inició sesión en el sistema`,
            detalles: {
              metodo: 'oauth_or_session_refresh',
              user_agent: navigator.userAgent,
              event_type: event
            }
          })
        )
      }
    } else if (event === 'SIGNED_OUT' && previousUser) {
      // Registrar cierre de sesión solo si había un usuario anterior
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'REGISTER',
          entidad: 'configuracion',
          descripcion: `Usuario ${previousUser.email} cerró sesión en el sistema`,
          detalles: {
            metodo: 'session_expired_or_logout',
            user_agent: navigator.userAgent,
            event_type: event
          }
        })
      )
      lastLoginAudit.value = null // Resetear cuando se cierra sesión
    }
  })

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isEmailConfirmed,
    userEmail,
    userName,
    checkAuth,
    login,
    register,
    resetPassword,
    updatePassword,
    logout,
    loginWithGoogle
  }
})

