import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'

/**
 * Roles disponibles para colaboradores
 */
export const ROLES_COLABORADOR = {
  CO_ADMINISTRADOR: 'co_administrador',
  COLABORADOR: 'colaborador',
  VISOR: 'visor'
}

/**
 * Permisos disponibles
 */
export const PERMISOS_DISPONIBLES = {
  ver: { nombre: 'Ver', descripcion: 'Puede ver la información de la natillera' },
  editar_socios: { nombre: 'Gestionar Socios', descripcion: 'Puede agregar, editar y eliminar socios' },
  gestionar_cuotas: { nombre: 'Gestionar Cuotas', descripcion: 'Puede registrar pagos, multas y gestionar cuotas' },
  gestionar_prestamos: { nombre: 'Gestionar Préstamos', descripcion: 'Puede crear y gestionar préstamos' },
  gestionar_actividades: { nombre: 'Gestionar Actividades', descripcion: 'Puede crear y gestionar actividades y rifas' },
  ver_auditoria: { nombre: 'Ver Auditoría', descripcion: 'Puede ver el historial de cambios' },
  configurar: { nombre: 'Configurar', descripcion: 'Puede modificar configuración y gestionar colaboradores' }
}

/**
 * Permisos por defecto según el rol
 */
export const PERMISOS_POR_ROL = {
  co_administrador: {
    ver: true,
    editar_socios: true,
    gestionar_cuotas: true,
    gestionar_prestamos: true,
    gestionar_actividades: true,
    ver_auditoria: true,
    configurar: true
  },
  colaborador: {
    ver: true,
    editar_socios: false,
    gestionar_cuotas: true,
    gestionar_prestamos: false,
    gestionar_actividades: false,
    ver_auditoria: false,
    configurar: false
  },
  visor: {
    ver: true,
    editar_socios: false,
    gestionar_cuotas: false,
    gestionar_prestamos: false,
    gestionar_actividades: false,
    ver_auditoria: false,
    configurar: false
  }
}

export const useColaboradoresStore = defineStore('colaboradores', () => {
  // Estado
  const colaboradores = ref([])
  const invitacionesPendientes = ref([])
  const misInvitaciones = ref([])
  const loading = ref(false)
  const error = ref(null)
  const permisoActual = ref(null)

  // Computed
  const colaboradoresActivos = computed(() => 
    colaboradores.value.filter(c => c.estado === 'aceptada')
  )

  const totalColaboradores = computed(() => colaboradoresActivos.value.length)

  /**
   * Obtener colaboradores de una natillera
   */
  async function fetchColaboradores(natilleraId) {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*')
        .eq('natillera_id', natilleraId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      colaboradores.value = data || []
      return { success: true, data: colaboradores.value }
    } catch (e) {
      error.value = e.message
      console.error('Error obteniendo colaboradores:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener invitaciones pendientes para el usuario actual
   */
  async function fetchMisInvitaciones() {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'No autenticado' }

      const { data, error: fetchError } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*')
        .or(`usuario_id.eq.${user.id},email_invitado.eq.${user.email}`)
        .eq('estado', 'pendiente')
        .order('fecha_invitacion', { ascending: false })

      if (fetchError) throw fetchError

      misInvitaciones.value = data || []
      return { success: true, data: misInvitaciones.value }
    } catch (e) {
      error.value = e.message
      console.error('Error obteniendo mis invitaciones:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Invitar a un colaborador a una natillera
   */
  async function invitarColaborador(natilleraId, datos) {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Buscar si el usuario ya existe por email en auth.users
      // y crear su perfil si no existe
      let usuarioId = null
      if (datos.email) {
        const { data: usuarioData, error: userError } = await supabase
          .rpc('buscar_usuario_por_email', {
            p_email: datos.email.toLowerCase().trim()
          })
        
        // Verificar si hay un error en la consulta
        if (userError) {
          throw userError
        }
        
        // Verificar si el usuario existe
        if (!usuarioData || usuarioData.length === 0 || !usuarioData[0].existe) {
          throw new Error('Este correo no está registrado como usuario')
        }
        
        usuarioId = usuarioData[0].usuario_id
      }

      // Verificar si ya existe una invitación para este usuario/email
      const { data: existente } = await supabase
        .from('natillera_colaboradores')
        .select('id, estado')
        .eq('natillera_id', natilleraId)
        .or(
          usuarioId 
            ? `usuario_id.eq.${usuarioId}` 
            : `email_invitado.eq.${datos.email.toLowerCase().trim()}`
        )
        .single()

      if (existente) {
        if (existente.estado === 'aceptada') {
          throw new Error('Este correo ya es colaborador de esta natillera')
        }
        if (existente.estado === 'pendiente') {
          throw new Error('Ya existe una invitación pendiente para este correo')
        }
      }

      // Determinar permisos según el rol
      let permisos = datos.permisos || PERMISOS_POR_ROL[datos.rol] || PERMISOS_POR_ROL.visor

      // Crear la invitación
      const invitacion = {
        natillera_id: natilleraId,
        usuario_id: usuarioId,
        email_invitado: datos.email?.toLowerCase().trim(),
        rol: datos.rol || 'visor',
        permisos,
        invitado_por: user.id,
        notas: datos.notas,
        estado: 'pendiente'
      }

      const { data, error: insertError } = await supabase
        .from('natillera_colaboradores')
        .insert(invitacion)
        .select(`
          *,
          natillera:natilleras(nombre)
        `)
        .single()

      if (insertError) throw insertError

      // Agregar a la lista local
      colaboradores.value.unshift({
        ...data,
        nombre_usuario: datos.email,
        email_usuario: datos.email
      })

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'CREATE',
          entidad: 'colaborador',
          entidadId: data.id,
          descripcion: `Se invitó a ${datos.email} como ${datos.rol} a la natillera`,
          natilleraId,
          detalles: { rol: datos.rol, permisos }
        })
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      console.error('Error invitando colaborador:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aceptar una invitación
   */
  async function aceptarInvitacion(tokenInvitacion) {
    try {
      loading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('aceptar_invitacion_colaborador', { p_token: tokenInvitacion })

      if (rpcError) throw rpcError

      if (!data.success) {
        throw new Error(data.error || 'Error al aceptar la invitación')
      }

      // Actualizar lista local
      const index = misInvitaciones.value.findIndex(i => i.token_invitacion === tokenInvitacion)
      if (index !== -1) {
        misInvitaciones.value.splice(index, 1)
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'UPDATE',
          entidad: 'colaborador',
          descripcion: `Se aceptó la invitación para colaborar en ${data.natillera_nombre}`,
          natilleraId: data.natillera_id,
          detalles: { rol: data.rol }
        })
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      console.error('Error aceptando invitación:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Rechazar una invitación
   */
  async function rechazarInvitacion(tokenInvitacion) {
    try {
      loading.value = true
      error.value = null

      const { data, error: rpcError } = await supabase
        .rpc('rechazar_invitacion_colaborador', { p_token: tokenInvitacion })

      if (rpcError) throw rpcError

      if (!data.success) {
        throw new Error(data.error || 'Error al rechazar la invitación')
      }

      // Actualizar lista local
      const index = misInvitaciones.value.findIndex(i => i.token_invitacion === tokenInvitacion)
      if (index !== -1) {
        misInvitaciones.value.splice(index, 1)
      }

      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('Error rechazando invitación:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar permisos de un colaborador
   */
  async function actualizarColaborador(colaboradorId, datos) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos anteriores para auditoría
      const { data: datosAnteriores } = await supabase
        .from('natillera_colaboradores')
        .select('*')
        .eq('id', colaboradorId)
        .single()

      // Si se cambia el rol, actualizar permisos según el nuevo rol
      let permisos = datos.permisos
      if (datos.rol && datos.rol !== datosAnteriores?.rol) {
        permisos = datos.permisos || PERMISOS_POR_ROL[datos.rol] || datosAnteriores.permisos
      }

      const actualizacion = {
        ...datos,
        permisos,
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('natillera_colaboradores')
        .update(actualizacion)
        .eq('id', colaboradorId)
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar en la lista local
      const index = colaboradores.value.findIndex(c => c.id === colaboradorId)
      if (index !== -1) {
        colaboradores.value[index] = { ...colaboradores.value[index], ...data }
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarActualizacion(
          'colaborador',
          colaboradorId,
          'Se actualizaron los permisos del colaborador',
          datosAnteriores,
          data,
          datosAnteriores?.natillera_id
        )
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      console.error('Error actualizando colaborador:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Revocar acceso a un colaborador
   */
  async function revocarColaborador(colaboradorId) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos para auditoría
      const { data: colaborador } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*')
        .eq('id', colaboradorId)
        .single()

      const { error: updateError } = await supabase
        .from('natillera_colaboradores')
        .update({ 
          estado: 'revocada',
          updated_at: new Date().toISOString()
        })
        .eq('id', colaboradorId)

      if (updateError) throw updateError

      // Actualizar en la lista local
      const index = colaboradores.value.findIndex(c => c.id === colaboradorId)
      if (index !== -1) {
        colaboradores.value[index].estado = 'revocada'
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'DELETE',
          entidad: 'colaborador',
          entidadId: colaboradorId,
          descripcion: `Se revocó el acceso de ${colaborador?.nombre_usuario || colaborador?.email_usuario}`,
          natilleraId: colaborador?.natillera_id,
          detalles: { colaborador }
        })
      )

      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('Error revocando colaborador:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Reenviar invitación a un colaborador revocado
   */
  async function reenviarInvitacionColaborador(colaboradorId) {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Obtener datos del colaborador para auditoría
      const { data: colaborador } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*')
        .eq('id', colaboradorId)
        .single()

      if (!colaborador) {
        throw new Error('Colaborador no encontrado')
      }

      if (colaborador.estado !== 'revocada') {
        throw new Error('Solo se puede reenviar invitación a colaboradores revocados')
      }

      // Generar nuevo token y reactivar la invitación
      const { data, error: updateError } = await supabase
        .from('natillera_colaboradores')
        .update({
          estado: 'pendiente',
          token_invitacion: crypto.randomUUID(),
          fecha_invitacion: new Date().toISOString(),
          invitado_por: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', colaboradorId)
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar en la lista local
      const index = colaboradores.value.findIndex(c => c.id === colaboradorId)
      if (index !== -1) {
        colaboradores.value[index] = {
          ...colaboradores.value[index],
          estado: 'pendiente',
          fecha_invitacion: data.fecha_invitacion,
          token_invitacion: data.token_invitacion
        }
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'UPDATE',
          entidad: 'colaborador',
          entidadId: colaboradorId,
          descripcion: `Se reenvió la invitación a ${colaborador?.nombre_usuario || colaborador?.email_usuario}`,
          natilleraId: colaborador?.natillera_id,
          detalles: { colaborador }
        })
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      console.error('Error reenviando invitación:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un colaborador completamente (cualquier estado)
   */
  async function eliminarColaborador(colaboradorId) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos para auditoría antes de eliminar
      const { data: colaborador } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*')
        .eq('id', colaboradorId)
        .single()

      const { error: deleteError } = await supabase
        .from('natillera_colaboradores')
        .delete()
        .eq('id', colaboradorId)

      if (deleteError) throw deleteError

      // Eliminar de la lista local
      colaboradores.value = colaboradores.value.filter(c => c.id !== colaboradorId)

      // Registrar auditoría
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'DELETE',
          entidad: 'colaborador',
          entidadId: colaboradorId,
          descripcion: `Se eliminó completamente a ${colaborador?.nombre_usuario || colaborador?.email_usuario} de los colaboradores`,
          natilleraId: colaborador?.natillera_id,
          detalles: { colaborador }
        })
      )

      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('Error eliminando colaborador:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener el rol del usuario actual en una natillera
   */
  async function obtenerMiRol(natilleraId) {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('obtener_rol_natillera', { p_natillera_id: natilleraId })

      if (rpcError) throw rpcError

      return data || 'sin_acceso'
    } catch (e) {
      console.error('Error obteniendo rol:', e)
      return 'sin_acceso'
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico en una natillera
   */
  async function tienePermiso(natilleraId, permiso) {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('tiene_permiso_natillera', { 
          p_natillera_id: natilleraId,
          p_permiso: permiso
        })

      if (rpcError) throw rpcError

      return data === true
    } catch (e) {
      console.error('Error verificando permiso:', e)
      return false
    }
  }

  /**
   * Obtener todos los permisos del usuario en una natillera
   */
  async function obtenerMisPermisos(natilleraId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Primero verificar si es el admin
      const { data: natillera } = await supabase
        .from('natilleras')
        .select('admin_id')
        .eq('id', natilleraId)
        .single()

      if (natillera?.admin_id === user.id) {
        // El admin tiene todos los permisos
        permisoActual.value = {
          rol: 'administrador',
          esAdmin: true,
          permisos: Object.keys(PERMISOS_DISPONIBLES).reduce((acc, key) => {
            acc[key] = true
            return acc
          }, {})
        }
        return permisoActual.value
      }

      // Buscar permisos de colaborador
      const { data: colaborador } = await supabase
        .from('natillera_colaboradores')
        .select('rol, permisos, estado')
        .eq('natillera_id', natilleraId)
        .eq('usuario_id', user.id)
        .eq('estado', 'aceptada')
        .single()

      if (colaborador) {
        permisoActual.value = {
          rol: colaborador.rol,
          esAdmin: false,
          permisos: colaborador.permisos
        }
        return permisoActual.value
      }

      permisoActual.value = null
      return null
    } catch (e) {
      console.error('Error obteniendo permisos:', e)
      return null
    }
  }

  /**
   * Obtener natilleras donde el usuario es colaborador
   */
  async function fetchNatillerasCompartidas() {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'No autenticado' }

      const { data, error: fetchError } = await supabase
        .from('vista_colaboradores_natillera')
        .select('*, natillera:natilleras(*)')
        .eq('usuario_id', user.id)
        .eq('estado', 'aceptada')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return { 
        success: true, 
        data: (data || []).map(c => ({
          ...c.natillera,
          mi_rol: c.rol,
          mis_permisos: c.permisos
        }))
      }
    } catch (e) {
      error.value = e.message
      console.error('Error obteniendo natilleras compartidas:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar el estado
   */
  function limpiar() {
    colaboradores.value = []
    invitacionesPendientes.value = []
    misInvitaciones.value = []
    permisoActual.value = null
    error.value = null
  }

  return {
    // Estado
    colaboradores,
    invitacionesPendientes,
    misInvitaciones,
    loading,
    error,
    permisoActual,
    
    // Computed
    colaboradoresActivos,
    totalColaboradores,
    
    // Acciones
    fetchColaboradores,
    fetchMisInvitaciones,
    invitarColaborador,
    aceptarInvitacion,
    rechazarInvitacion,
    actualizarColaborador,
    revocarColaborador,
    reenviarInvitacionColaborador,
    eliminarColaborador,
    obtenerMiRol,
    tienePermiso,
    obtenerMisPermisos,
    fetchNatillerasCompartidas,
    limpiar,
    
    // Constantes exportadas
    ROLES_COLABORADOR,
    PERMISOS_DISPONIBLES,
    PERMISOS_POR_ROL
  }
})

