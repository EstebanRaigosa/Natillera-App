import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentUserProfile = ref(null)

  // Obtener perfil del usuario actual
  async function getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      currentUserProfile.value = data
      return data
    } catch (e) {
      console.error('Error obteniendo perfil del usuario:', e)
      return null
    }
  }

  // Verificar si el usuario tiene un permiso específico
  function hasPermission(permission) {
    if (!currentUserProfile.value) return false
    
    // Super admin tiene todos los permisos
    if (currentUserProfile.value.rol === 'super_admin') return true
    
    // Verificar permiso específico
    const permisos = currentUserProfile.value.permisos || {}
    return permisos[permission] === true
  }

  // Verificar si el usuario tiene un rol específico
  function hasRole(role) {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.rol === role
  }

  // Verificar si es admin o super admin
  function isAdmin() {
    if (!currentUserProfile.value) return false
    return ['super_admin', 'admin'].includes(currentUserProfile.value.rol)
  }

  // Obtener todos los usuarios (solo para admins)
  async function fetchUsers() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      users.value = data || []
      return { success: true, data: users.value }
    } catch (e) {
      error.value = e.message
      console.error('Error obteniendo usuarios:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar perfil de usuario desde el panel de administración.
   *
   * Va por `admin_actualizar_perfil` y no por un UPDATE directo porque `rol`,
   * `activo` y `permisos` ya no son escribibles desde el cliente: cualquiera
   * podía nombrarse `super_admin` con una línea en la consola del navegador y
   * quedarse con la bandeja de soporte entera (migración 028).
   */
  async function updateUserProfile(userId, updates) {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase.rpc('admin_actualizar_perfil', {
        p_user_id:  userId,
        p_nombre:   updates.nombre ?? null,
        p_rol:      updates.rol ?? null,
        p_activo:   updates.activo ?? null,
        p_permisos: updates.permisos ?? null,
      })

      if (updateError) throw updateError

      // La función devuelve solo los campos que toca; el resto se conserva de
      // la fila que ya teníamos para no dejar la lista a medias.
      const index = users.value.findIndex(u => u.id === userId)
      const fusionado = { ...(index !== -1 ? users.value[index] : {}), ...data }

      if (index !== -1) {
        users.value[index] = fusionado
      }

      // Si es el usuario actual, actualizar su perfil
      if (userId === currentUserProfile.value?.id) {
        currentUserProfile.value = { ...currentUserProfile.value, ...data }
      }

      return { success: true, data: fusionado }
    } catch (e) {
      error.value = e.message
      console.error('Error actualizando perfil:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Actualizar permisos de un usuario
  async function updateUserPermissions(userId, permisos) {
    try {
      loading.value = true
      error.value = null

      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('permisos')
        .eq('id', userId)
        .single()

      const permisosActuales = currentProfile?.permisos || {}
      const nuevosPermisos = { ...permisosActuales, ...permisos }

      return await updateUserProfile(userId, { permisos: nuevosPermisos })
    } catch (e) {
      error.value = e.message
      console.error('Error actualizando permisos:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Activar/desactivar usuario
  async function toggleUserStatus(userId, activo) {
    return await updateUserProfile(userId, { activo })
  }

  // Cambiar rol de usuario
  async function changeUserRole(userId, nuevoRol) {
    return await updateUserProfile(userId, { rol: nuevoRol })
  }

  // Actualizar último acceso
  async function updateLastAccess(userId) {
    try {
      await supabase
        .from('user_profiles')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userId)
    } catch (e) {
      console.error('Error actualizando último acceso:', e)
    }
  }

  return {
    users,
    currentUserProfile,
    loading,
    error,
    getCurrentUserProfile,
    hasPermission,
    hasRole,
    isAdmin,
    fetchUsers,
    updateUserProfile,
    updateUserPermissions,
    toggleUserStatus,
    changeUserRole,
    updateLastAccess
  }
})

