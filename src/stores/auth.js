import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, setAuthStorageMode, clearAuthStorageMode } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'
import { BASE_URL, devLog } from '../config/environment'
import { enviarOTP, verificarOTP, buscarUsuarioPorTelefono, formatearTelefono } from '../services/twilio'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastLoginAudit = ref(null)
  const loginEnCurso = ref(false)

  /**
   * Indica si la hidratación inicial de sesión (onAuthStateChange INITIAL_SESSION) ya finalizó.
   * Mientras sea false, el router guard debe esperar antes de decidir si redirigir al login.
   */
  const initialSessionResolved = ref(false)
  /** Promesa que se resuelve una sola vez cuando INITIAL_SESSION llega. */
  let _initialSessionResolve = null
  const initialSessionReady = new Promise((resolve) => {
    _initialSessionResolve = resolve
  })

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
  
  const needsUsername = computed(() => {
    if (!user.value || !user.value.email_confirmed_at) return false
    return !user.value.user_metadata?.nombre || user.value.user_metadata.nombre.trim() === ''
  })

  async function checkAuth() {
    if (user.value) return
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

  async function login(email, password, options = {}) {
    try {
      loading.value = true
      error.value = null

      const rememberMe = options.rememberMe !== false
      setAuthStorageMode(rememberMe ? 'local' : 'session')

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      // Limpiar timestamp de background de sesiones anteriores para evitar
      // que checkOnStart() dispare logout+reload inmediato tras un login válido.
      // DEBE ejecutarse ANTES de setear user.value, porque el watcher de
      // isAuthenticated se dispara sincrónicamente y llama checkOnStart().
      try { localStorage.removeItem('natillera_background_timestamp') } catch { /* noop */ }

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
      clearAuthStorageMode()

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

  async function updateDisplayName(nombre) {
    try {
      loading.value = true
      error.value = null
      
      if (!nombre || nombre.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres')
      }
      
      const nombreTrimmed = nombre.trim()
      
      // Obtener el usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        throw new Error('No hay usuario autenticado')
      }
      
      // Actualizar user_metadata en Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          nombre: nombreTrimmed
        }
      })
      
      if (updateError) throw updateError
      
      // También actualizar la tabla user_profiles
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          nombre: nombreTrimmed,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
      
      if (profileUpdateError) {
        // Si el perfil no existe, intentar crearlo
        if (profileUpdateError.code === 'PGRST116' || profileUpdateError.message?.includes('No rows')) {
          // Intentar crear el perfil si no existe
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: currentUser.id,
              email: currentUser.email,
              nombre: nombreTrimmed,
              rol: 'usuario',
              activo: true,
              permisos: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (insertError) {
            console.warn('Error creando perfil de usuario:', insertError)
            // No lanzar error aquí, ya que el user_metadata se actualizó correctamente
          }
        } else {
          console.warn('Error actualizando perfil de usuario:', profileUpdateError)
          // No lanzar error aquí, ya que el user_metadata se actualizó correctamente
        }
      }
      
      // Actualizar el usuario en el store
      if (data?.user) {
        user.value = data.user
      } else {
        // Si no viene en la respuesta, obtener la sesión actualizada
        const { data: { session } } = await supabase.auth.getSession()
        user.value = session?.user || null
      }
      
      return { success: true }
    } catch (e) {
      const errorMessage = e?.message || 'Error al actualizar el nombre de usuario'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      
      // Registrar cierre de sesión en auditoría ANTES de cerrar sesión
      // IMPORTANTE: Hacer esto de forma síncrona (con await) para que se complete
      // antes de que auth.uid() se vuelva NULL
      if (user.value) {
        try {
          const auditoria = useAuditoria()
          // Ejecutar de forma síncrona, pero con timeout para no bloquear si hay problemas
          await Promise.race([
            auditoria.registrar({
              tipoAccion: 'REGISTER',
              entidad: 'configuracion',
              descripcion: `Usuario ${user.value.email} cerró sesión en el sistema`,
              detalles: {
                metodo: 'logout',
                user_agent: navigator.userAgent
              }
            }),
            // Timeout de 2 segundos para no bloquear el logout si hay problemas de red
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]).catch(error => {
            // Si falla o hay timeout, solo loguear el error pero continuar con el logout
            console.warn('[Logout] No se pudo registrar auditoría:', error.message)
          })
        } catch (e) {
          // Si hay error, continuar con el logout de todas formas
          console.warn('[Logout] Error registrando auditoría:', e)
        }
      }
      
      // Ahora sí cerrar sesión
      await supabase.auth.signOut()
      clearAuthStorageMode()
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

      setAuthStorageMode('local')

      // URL de redirección según el entorno (desarrollo o producción)
      // Usamos /auth/welcome para que Welcome.vue maneje tanto éxito como errores
      const redirectUrl = `${BASE_URL}/auth/welcome`
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

  /**
   * Verifica si un teléfono pertenece a algún socio de una natillera
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<{success: boolean, esSocio: boolean, error?: string}>}
   */
  async function verificarTelefonoEsSocio(telefono) {
    try {
      if (!telefono || telefono.trim() === '') {
        return { success: false, esSocio: false, error: 'El número de teléfono es requerido' }
      }

      // Normalizar teléfono: remover espacios y caracteres especiales, solo dígitos
      const telefonoLimpio = telefono.replace(/\D/g, '').trim()
      
      if (!telefonoLimpio || telefonoLimpio.length < 10) {
        return { success: false, esSocio: false, error: 'Número de teléfono inválido' }
      }

      // Normalizar para búsqueda: remover código de país si existe (57 para Colombia)
      let telefonoNormalizado = telefonoLimpio
      if (telefonoNormalizado.startsWith('57') && telefonoNormalizado.length > 10) {
        telefonoNormalizado = telefonoNormalizado.substring(2)
      }

      // Buscar socios con ese teléfono
      // Buscar con diferentes formatos posibles (sin código de país, con código, y formato original)
      const { data: socios, error: errorSocios } = await supabase
        .from('socios')
        .select('id, nombre, telefono')
        .or(`telefono.eq.${telefonoNormalizado},telefono.eq.${telefonoLimpio},telefono.eq.${telefono.trim()}`)

      if (errorSocios) {
        console.error('Error buscando socio por teléfono:', errorSocios)
        return { success: false, esSocio: false, error: 'Error al verificar el teléfono' }
      }

      // Verificar si hay al menos un socio con ese teléfono
      let esSocio = false
      if (socios && socios.length > 0) {
        esSocio = true
      } else {
        // Si no se encontró con la búsqueda exacta, obtener todos los socios y comparar manualmente
        // Esto es necesario porque los teléfonos pueden estar almacenados en diferentes formatos
        const { data: todosSocios, error: errorTodos } = await supabase
          .from('socios')
          .select('id, nombre, telefono')
          .limit(1000) // Limitar para evitar cargar demasiados datos
        
        if (!errorTodos && todosSocios) {
          // Comparar teléfonos normalizados
          esSocio = todosSocios.some(socio => {
            if (!socio.telefono) return false
            const socioTelefonoLimpio = socio.telefono.replace(/\D/g, '')
            let socioTelefonoNormalizado = socioTelefonoLimpio
            if (socioTelefonoNormalizado.startsWith('57') && socioTelefonoNormalizado.length > 10) {
              socioTelefonoNormalizado = socioTelefonoNormalizado.substring(2)
            }
            // Comparar tanto el formato normalizado como el formato completo
            return socioTelefonoNormalizado === telefonoNormalizado || 
                   socioTelefonoLimpio === telefonoLimpio ||
                   socio.telefono.trim() === telefono.trim()
          })
        }
      }

      return { 
        success: true, 
        esSocio,
        socios: socios || []
      }
    } catch (e) {
      console.error('Error verificando si el teléfono es socio:', e)
      return { success: false, esSocio: false, error: e.message || 'Error al verificar el teléfono' }
    }
  }

  /**
   * Verifica si un usuario existe por teléfono
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<{success: boolean, existe: boolean, error?: string}>}
   */
  async function verificarUsuarioPorTelefono(telefono) {
    try {
      const busquedaUsuario = await buscarUsuarioPorTelefono(telefono.trim())
      
      if (!busquedaUsuario.success) {
        return { success: false, existe: false, error: busquedaUsuario.error }
      }

      return { 
        success: true, 
        existe: !!busquedaUsuario.user,
        user: busquedaUsuario.user || null
      }
    } catch (e) {
      return { success: false, existe: false, error: e.message }
    }
  }

  /**
   * Envía un código OTP por SMS al número telefónico proporcionado
   * Valida primero si el teléfono ya está asociado a un usuario antes de enviar el SMS
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function enviarOTPTelefono(telefono) {
    try {
      loading.value = true
      error.value = null

      if (!telefono || telefono.trim() === '') {
        return { success: false, error: 'El número de teléfono es requerido' }
      }

      // PRIMERO: Validar si el teléfono ya está asociado a un usuario en user_profiles
      // Esta validación DEBE ejecutarse ANTES de formatear para Twilio
      const busquedaUsuario = await buscarUsuarioPorTelefono(telefono.trim())
      
      console.log('🔍 Búsqueda de usuario por teléfono:', {
        telefonoIngresado: telefono.trim(),
        resultado: busquedaUsuario
      })
      
      // Si se encontró un usuario con email válido, NO enviar SMS
      if (busquedaUsuario.success && busquedaUsuario.user) {
        const usuario = busquedaUsuario.user
        console.log('👤 Usuario encontrado:', {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          telefonoEnBD: usuario.telefono
        })
        
        // Verificar que el usuario tenga email válido (no email temporal)
        if (usuario.email && 
            usuario.email.trim() !== '' && 
            !usuario.email.includes('@natillera.temp') &&
            !usuario.email.startsWith('tel_')) {
          // El teléfono ya está asociado a un usuario registrado con email real
          console.log('❌ Teléfono ya registrado a usuario con email:', usuario.email)
          return { 
            success: false, 
            error: 'YA_REGISTRADO',
            email: usuario.email,
            mensaje: 'Este número de teléfono ya está asociado a una cuenta. Por favor, inicia sesión con tu correo electrónico o con Google.'
          }
        }
      }

      // Si llegamos aquí, el teléfono NO está asociado a un usuario con email válido
      // SEGUNDO: Formatear teléfono para Twilio (solo si pasó la validación)
      const telefonoFormateado = formatearTelefono(telefono.trim())
      if (!telefonoFormateado) {
        return { success: false, error: 'El formato del número de teléfono no es válido' }
      }

      // TERCERO: Validar si el teléfono pertenece a algún socio
      const verificacionSocio = await verificarTelefonoEsSocio(telefono.trim())
      
      if (!verificacionSocio.success) {
        return { 
          success: false, 
          error: verificacionSocio.error || 'Error al verificar el teléfono'
        }
      }

      // Si no es socio, retornar error específico (no continuar con el envío de OTP)
      if (!verificacionSocio.esSocio) {
        return { 
          success: false, 
          error: 'Este número de teléfono no está registrado como socio en ninguna natillera. Por favor, verifica el número o contacta al administrador.'
        }
      }

      // CUARTO: Si es socio y no está asociado a usuario con email válido, enviar OTP
      console.log('✅ Enviando OTP a teléfono:', telefonoFormateado)
      const result = await enviarOTP(telefonoFormateado)
      
      if (!result.success) {
        // Si falla el envío de OTP, mostrar el error de Twilio traducido
        error.value = result.error
        return { success: false, error: result.error }
      }

      console.log('✅ OTP enviado exitosamente')
      return { 
        success: true
      }
    } catch (e) {
      console.error('❌ Error en enviarOTPTelefono:', e)
      const errorMessage = e?.message || 'Error al enviar el código OTP'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión con el usuario admin después de verificar OTP
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function iniciarSesionAdmin() {
    try {
      setAuthStorageMode('local')

      const adminEmail = 'admin@gmail.com'
      const adminPassword = 'admin123*'

      // Iniciar sesión con el usuario admin
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        throw new Error('Error al iniciar sesión con el usuario administrador')
      }

      try { localStorage.removeItem('natillera_background_timestamp') } catch { /* noop */ }
      user.value = loginData.user

      return { 
        success: true
      }
    } catch (e) {
      console.error('Error iniciando sesión con admin:', e)
      return { 
        success: false, 
        error: e.message || 'Error al iniciar sesión'
      }
    }
  }

  /**
   * Actualiza el perfil de usuario con el teléfono
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function actualizarPerfilUsuarioConTelefono(telefono) {
    try {
      if (!telefono || !user.value) {
        return { 
          success: false, 
          error: 'Teléfono y usuario son requeridos' 
        }
      }

      // Normalizar teléfono para almacenamiento
      const { normalizarTelefonoParaBD } = await import('../services/twilio')
      const telefonoNormalizado = normalizarTelefonoParaBD(telefono.trim())
      
      if (!telefonoNormalizado) {
        return { 
          success: false, 
          error: 'Número de teléfono inválido' 
        }
      }

      // Actualizar el perfil de usuario con el teléfono
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ telefono: telefonoNormalizado })
        .eq('id', user.value.id)

      if (updateError) {
        throw updateError
      }

      // Actualizar también en user_metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          telefono: telefonoNormalizado
        }
      })

      if (metadataError) {
        console.error('Error actualizando metadata:', metadataError)
      }

      // Refrescar el usuario para obtener los datos actualizados
      await checkAuth()

      return { 
        success: true
      }
    } catch (e) {
      console.error('Error actualizando perfil de usuario con teléfono:', e)
      return { 
        success: false, 
        error: e.message || 'Error al actualizar perfil de usuario'
      }
    }
  }

  /**
   * Actualiza todos los socios con un teléfono específico para vincular el email
   * @param {string} telefono - Número de teléfono
   * @param {string} email - Email del usuario registrado
   * @returns {Promise<{success: boolean, error?: string, sociosActualizados?: number}>}
   */
  async function actualizarSociosConEmail(telefono, email) {
    try {
      if (!telefono || !email) {
        return { 
          success: false, 
          error: 'Teléfono y email son requeridos' 
        }
      }

      // Normalizar teléfono para búsqueda
      const { normalizarTelefonoParaBD } = await import('../services/twilio')
      const telefonoNormalizado = normalizarTelefonoParaBD(telefono.trim())
      
      if (!telefonoNormalizado) {
        return { 
          success: false, 
          error: 'Número de teléfono inválido' 
        }
      }

      // Buscar todos los socios con ese teléfono
      const { data: socios, error: errorSocios } = await supabase
        .from('socios')
        .select('id, nombre, telefono, email')
        .eq('telefono', telefonoNormalizado)

      if (errorSocios) {
        throw errorSocios
      }

      if (!socios || socios.length === 0) {
        return { 
          success: true, 
          sociosActualizados: 0,
          message: 'No se encontraron socios con ese teléfono'
        }
      }

      // Actualizar todos los socios con el email
      const sociosIds = socios.map(s => s.id)
      const { error: updateError } = await supabase
        .from('socios')
        .update({ email: email.trim() })
        .in('id', sociosIds)

      if (updateError) {
        throw updateError
      }

      return { 
        success: true, 
        sociosActualizados: socios.length
      }
    } catch (e) {
      console.error('Error actualizando socios con email:', e)
      return { 
        success: false, 
        error: e.message || 'Error al actualizar socios'
      }
    }
  }

  /**
   * Verifica un código OTP y crea/inicia sesión con usuario genérico
   * @param {string} telefono - Número de teléfono
   * @param {string} codigo - Código OTP de 6 dígitos
   * @returns {Promise<{success: boolean, error?: string, requiereRegistro?: boolean}>}
   */
  async function verificarOTPTelefono(telefono, codigo) {
    try {
      loading.value = true
      error.value = null

      if (!telefono || telefono.trim() === '') {
        return { success: false, error: 'El número de teléfono es requerido' }
      }

      if (!codigo || codigo.length !== 6) {
        return { success: false, error: 'El código OTP debe tener 6 dígitos' }
      }

      const telefonoFormateado = formatearTelefono(telefono.trim())
      if (!telefonoFormateado) {
        return { success: false, error: 'El formato del número de teléfono no es válido' }
      }

      // Verificar OTP usando Twilio
      const result = await verificarOTP(telefonoFormateado, codigo)
      
      if (!result.success) {
        error.value = result.error
        return { success: false, error: result.error }
      }

      // Buscar usuario por teléfono
      const busquedaUsuario = await buscarUsuarioPorTelefono(telefono.trim())
      
      if (!busquedaUsuario.success) {
        error.value = busquedaUsuario.error || 'Error al buscar usuario'
        return { success: false, error: busquedaUsuario.error || 'Error al buscar usuario' }
      }

      // Siempre iniciar sesión con el usuario admin después de verificar OTP
      const loginAdmin = await iniciarSesionAdmin()
      
      if (!loginAdmin.success) {
        return { 
          success: false, 
          error: loginAdmin.error || 'Error al iniciar sesión'
        }
      }

      // Guardar el teléfono en el store para poder actualizar socios después del registro
      // Usaremos una variable temporal o el localStorage para esto
      if (typeof window !== 'undefined') {
        localStorage.setItem('telefono_pendiente_registro', telefono.trim())
      }

      // Usuario admin autenticado, requiere registro completo
      return { 
        success: true, 
        requiereRegistro: true,
        telefono: telefono.trim()
      }
    } catch (e) {
      const errorMessage = e?.message || 'Error al verificar el código OTP'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión o crea cuenta usando teléfono y código OTP
   * Si el usuario no existe, lo crea con el teléfono como identificador
   * @param {string} telefono - Número de teléfono
   * @param {string} codigo - Código OTP verificado
   * @param {string} nombre - Nombre del usuario (requerido solo para nuevos usuarios)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function loginConTelefono(telefono, codigo, nombre = null) {
    try {
      loading.value = true
      error.value = null

      // Primero verificar el OTP
      const verificacion = await verificarOTPTelefono(telefono, codigo)
      
      if (!verificacion.success) {
        return verificacion
      }

      // Buscar usuario existente
      const busquedaUsuario = await buscarUsuarioPorTelefono(telefono.trim())
      
      if (busquedaUsuario.success && busquedaUsuario.user) {
        // Usuario existe - obtener email y crear sesión
        // Como Supabase requiere email para auth, necesitamos manejar esto diferente
        // Por ahora, retornamos error indicando que necesita vincular teléfono a cuenta existente
        return {
          success: false,
          error: 'Este teléfono está asociado a una cuenta existente. Por favor, inicia sesión con tu email y contraseña, o vincula tu teléfono desde la configuración de tu cuenta.'
        }
      }

      // Usuario no existe - crear nueva cuenta
      // Generar un email temporal basado en el teléfono
      const emailTemporal = `tel_${telefono.replace(/\D/g, '')}@natillera.temp`
      const passwordTemporal = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Validar que se proporcione nombre para nuevos usuarios
      if (!nombre || nombre.trim() === '') {
        return {
          success: false,
          error: 'El nombre es requerido para crear una nueva cuenta'
        }
      }

      // Crear usuario en Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailTemporal,
        password: passwordTemporal,
        options: {
          data: {
            nombre: nombre.trim(),
            telefono: telefono.trim()
          }
        }
      })

      if (signUpError) throw signUpError

      // Actualizar el perfil de usuario con el teléfono
      if (signUpData.user) {
        // Normalizar teléfono para almacenamiento (solo dígitos, sin código de país)
        const { normalizarTelefonoParaBD } = await import('../services/twilio')
        const telefonoNormalizado = normalizarTelefonoParaBD(telefono.trim())
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ telefono: telefonoNormalizado })
          .eq('id', signUpData.user.id)

        if (updateError) {
          console.error('Error actualizando teléfono en perfil:', updateError)
        }

        // Marcar email como confirmado automáticamente (ya que verificamos por SMS)
        // Nota: Esto puede requerir permisos especiales en Supabase
        await supabase.auth.updateUser({
          email_confirm: true
        })
      }

      // Iniciar sesión automáticamente (misma persistencia que “recordarme” activado)
      setAuthStorageMode('local')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: emailTemporal,
        password: passwordTemporal
      })

      if (loginError) throw loginError

      user.value = loginData.user

      // Registrar ingreso en auditoría
      const auditoria = useAuditoria()
      lastLoginAudit.value = Date.now()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'REGISTER',
          entidad: 'configuracion',
          descripcion: `Usuario ${telefono} inició sesión con autenticación por SMS`,
          detalles: {
            metodo: 'sms_otp',
            telefono: telefono.trim(),
            user_agent: navigator.userAgent
          }
        })
      )

      return { success: true }
    } catch (e) {
      const errorMessage = e?.message || 'Error al iniciar sesión con teléfono'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange(async (event, session) => {
    const previousUser = user.value

    if (event === 'SIGNED_IN' && session?.user) {
      try { localStorage.removeItem('natillera_background_timestamp') } catch { /* noop */ }
    }

    user.value = session?.user || null

    // Marcar la hidratación inicial como resuelta (solo la primera vez)
    if (event === 'INITIAL_SESSION') {
      initialSessionResolved.value = true
      if (_initialSessionResolve) {
        _initialSessionResolve()
        _initialSessionResolve = null
      }
    }
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Marcar resuelta también en SIGNED_IN (por si INITIAL_SESSION no llegó antes)
      if (!initialSessionResolved.value) {
        initialSessionResolved.value = true
        if (_initialSessionResolve) {
          _initialSessionResolve()
          _initialSessionResolve = null
        }
      }

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
      lastLoginAudit.value = null
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
    needsUsername,
    initialSessionResolved,
    initialSessionReady,
    checkAuth,
    login,
    register,
    resetPassword,
    updatePassword,
    updateDisplayName,
    logout,
    loginWithGoogle,
    loginEnCurso,
    enviarOTPTelefono,
    verificarOTPTelefono,
    loginConTelefono,
    actualizarSociosConEmail,
    actualizarPerfilUsuarioConTelefono
  }
})

