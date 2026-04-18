import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isDev } from '../config/environment'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'
import { useAuthStore } from './auth'

export const useNatillerasStore = defineStore('natilleras', () => {
  const natilleras = ref([])
  const natillerasCompartidas = ref([])
  const natilleraActual = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const natillerasActivas = computed(() => 
    natilleras.value.filter(n => n.estado === 'activa')
  )

  const natillerasCompartidasActivas = computed(() => 
    natillerasCompartidas.value.filter(n => n.estado === 'activa')
  )

  // Todas las natilleras (propias + compartidas)
  const todasLasNatilleras = computed(() => {
    const propias = natilleras.value.map(n => ({ ...n, es_propia: true, mi_rol: 'administrador' }))
    const compartidas = natillerasCompartidas.value.map(n => ({ ...n, es_propia: false }))
    return [...propias, ...compartidas]
  })

  const totalNatilleras = computed(() => natilleras.value.length)
  const totalNatillerasCompartidas = computed(() => natillerasCompartidas.value.length)

  /** Timestamp de la última carga exitosa: permite omitir re-fetches innecesarios. */
  let _lastFetchTimestamp = 0
  /** Promesa en vuelo para deduplicar llamadas concurrentes a fetchTodasLasNatilleras. */
  let _fetchPromise = null

  /**
   * Obtiene el usuario autenticado sin round-trip de red cuando es posible.
   * Prioridad: parámetro > auth store (local) > getUser() (red).
   */
  function _resolveUser(userArg) {
    if (userArg) return Promise.resolve(userArg)
    const authStore = useAuthStore()
    if (authStore.user) return Promise.resolve(authStore.user)
    return supabase.auth.getUser().then(({ data }) => data.user)
  }

  async function fetchNatilleras(user, { _skipLoading = false } = {}) {
    try {
      if (!_skipLoading) loading.value = true
      error.value = null

      if (!user) {
        user = await _resolveUser(null)
      }
      if (!user) {
        natilleras.value = []
        return
      }

      const emailUsuario = (user.email || '').toLowerCase().trim()
      const esSuperUsuario = emailUsuario === 'raigo.16@gmail.com'

      const colabQuery = supabase
        .from('natillera_colaboradores')
        .select('natillera_id')
        .eq('usuario_id', user.id)
        .eq('estado', 'aceptada')

      let natQuery = supabase.from('natilleras').select('*, socios_natillera(count)')
      if (!esSuperUsuario) {
        natQuery = natQuery.eq('admin_id', user.id)
      }
      natQuery = natQuery.order('created_at', { ascending: false })

      const [{ data: colaboraciones }, { data, error: fetchError }] = await Promise.all([colabQuery, natQuery])

      if (fetchError) throw fetchError

      const idsNatillerasCompartidas = new Set((colaboraciones || []).map(c => c.natillera_id))

      natilleras.value = (data || [])
        .filter(natillera => {
          if (natillera.admin_id === user.id) return true
          if (idsNatillerasCompartidas.has(natillera.id)) return false
          return true
        })
        .map(natillera => ({
          ...natillera,
          socios_count: natillera.socios_natillera?.[0]?.count ?? 0,
          socios_natillera: undefined
        }))
    } catch (e) {
      error.value = e.message
      console.error('Error cargando natilleras:', e)
    } finally {
      if (!_skipLoading) loading.value = false
    }
  }

  async function fetchNatillerasCompartidas(user) {
    try {
      if (!user) {
        user = await _resolveUser(null)
      }
      if (!user) {
        natillerasCompartidas.value = []
        return
      }

      const { data: colaboraciones, error: colabError } = await supabase
        .from('natillera_colaboradores')
        .select(`
          natillera_id,
          rol,
          permisos,
          natillera:natilleras(*, socios_natillera(count))
        `)
        .eq('usuario_id', user.id)
        .eq('estado', 'aceptada')

      if (colabError) {
        console.error('Error cargando natilleras compartidas:', colabError)
        natillerasCompartidas.value = []
        return
      }

      natillerasCompartidas.value = (colaboraciones || [])
        .filter(c => c.natillera)
        .map(colab => ({
          ...colab.natillera,
          socios_count: colab.natillera.socios_natillera?.[0]?.count ?? 0,
          socios_natillera: undefined,
          mi_rol: colab.rol,
          mis_permisos: colab.permisos
        }))
    } catch (e) {
      console.error('Error cargando natilleras compartidas:', e)
      natillerasCompartidas.value = []
    }
  }

  /**
   * Carga propias + compartidas. Deduplicada: llamadas concurrentes comparten la misma promesa.
   * @param {{ force?: boolean, user?: object }} opts
   */
  async function fetchTodasLasNatilleras(opts = {}) {
    const now = Date.now()
    if (!opts.force && _lastFetchTimestamp && now - _lastFetchTimestamp < 5000) {
      return
    }

    if (_fetchPromise) return _fetchPromise

    _fetchPromise = (async () => {
      loading.value = true
      try {
        const user = await _resolveUser(opts.user || null)
        await Promise.all([
          fetchNatilleras(user, { _skipLoading: true }),
          fetchNatillerasCompartidas(user)
        ])
        _lastFetchTimestamp = Date.now()
      } finally {
        loading.value = false
      }
    })()

    try {
      await _fetchPromise
    } finally {
      _fetchPromise = null
    }
  }

  async function getNatilleraConDatos(id) {
    const [natRes, sociosRes, actividadesRes] = await Promise.all([
      supabase.from('natilleras').select('*').eq('id', id).maybeSingle(),
      supabase.from('socios_natillera').select(`*, socio:socios(*)`).eq('natillera_id', id),
      supabase.from('actividades').select('*').eq('natillera_id', id)
    ])
    if (natRes.error || !natRes.data) return null
    const data = natRes.data
    const sociosData = sociosRes.data || []
    const actividadesData = actividadesRes.data || []
    const actividadesEnCurso = actividadesData.filter(a => a.estado === 'en_curso')
    const socioNatilleraIds = sociosData.map(s => s.id)
    const promisesSegundaRonda = []
    if (actividadesEnCurso.length > 0) {
      promisesSegundaRonda.push(supabase.from('socios_actividad').select('actividad_id, valor_pagado').in('actividad_id', actividadesEnCurso.map(a => a.id)))
    } else {
      promisesSegundaRonda.push(Promise.resolve({ data: null }))
    }
    if (socioNatilleraIds.length > 0) {
      promisesSegundaRonda.push(supabase.from('cuotas').select('*').in('socio_natillera_id', socioNatilleraIds))
    } else {
      promisesSegundaRonda.push(Promise.resolve({ data: [] }))
    }
    const [sociosActividadRes, cuotasRes] = await Promise.all(promisesSegundaRonda)
    const sociosActividad = sociosActividadRes.data
    const cuotasData = cuotasRes.data || []
    let actividadesConTotales = actividadesData
    if (actividadesEnCurso.length > 0 && sociosActividad) {
      const totalPagadoPorActividad = {}
      sociosActividad.forEach(sa => {
        const aid = sa.actividad_id
        if (!totalPagadoPorActividad[aid]) totalPagadoPorActividad[aid] = 0
        totalPagadoPorActividad[aid] += Number(sa.valor_pagado) || 0
      })
      actividadesConTotales = actividadesData.map(a => {
        if (a.estado === 'en_curso' && totalPagadoPorActividad[a.id] !== undefined) return { ...a, total_pagado: totalPagadoPorActividad[a.id] }
        return a
      })
    }
    return { ...data, socios_natillera: sociosData, actividades: actividadesConTotales, cuotas: cuotasData }
  }

  async function fetchNatillera(id) {
    try {
      loading.value = true
      error.value = null

      // Ronda 1: natillera + socios + actividades en paralelo (3→1 round-trip)
      // Si la natillera no existe, las otras queries simplemente devuelven arrays vacíos.
      const [natilleraRes, sociosRes, actividadesRes] = await Promise.all([
        supabase.from('natilleras').select('*').eq('id', id).maybeSingle(),
        supabase.from('socios_natillera').select(`*, socio:socios(*)`).eq('natillera_id', id),
        supabase.from('actividades').select('*').eq('natillera_id', id)
      ])

      if (natilleraRes.error) throw natilleraRes.error
      const data = natilleraRes.data
      if (!data) {
        natilleraActual.value = null
        return null
      }

      const sociosData = sociosRes.data || []
      const actividadesData = actividadesRes.data || []
      const actividadesEnCurso = actividadesData.filter(a => a.estado === 'en_curso')
      const socioNatilleraIds = sociosData.map(s => s.id)

      // Ronda 2: cuotas + socios_actividad en paralelo (dependen de IDs de ronda 1)
      const promisesSegundaRonda = []
      if (actividadesEnCurso.length > 0) {
        promisesSegundaRonda.push(
          supabase.from('socios_actividad').select('actividad_id, valor_pagado').in('actividad_id', actividadesEnCurso.map(a => a.id))
        )
      } else {
        promisesSegundaRonda.push(Promise.resolve({ data: null }))
      }
      if (socioNatilleraIds.length > 0) {
        promisesSegundaRonda.push(
          supabase.from('cuotas').select('*').in('socio_natillera_id', socioNatilleraIds)
        )
      } else {
        promisesSegundaRonda.push(Promise.resolve({ data: [] }))
      }

      const [sociosActividadRes, cuotasRes] = await Promise.all(promisesSegundaRonda)
      const sociosActividad = sociosActividadRes.data
      let cuotasData = cuotasRes.data || []

      let actividadesConTotales = actividadesData
      if (actividadesEnCurso.length > 0 && sociosActividad) {
        const totalPagadoPorActividad = {}
        sociosActividad.forEach(sa => {
          const aid = sa.actividad_id
          if (!totalPagadoPorActividad[aid]) totalPagadoPorActividad[aid] = 0
          totalPagadoPorActividad[aid] += Number(sa.valor_pagado) || 0
        })
        actividadesConTotales = actividadesData.map(a => {
          if (a.estado === 'en_curso' && totalPagadoPorActividad[a.id] !== undefined) {
            return { ...a, total_pagado: totalPagadoPorActividad[a.id] }
          }
          return a
        })
      }

      natilleraActual.value = {
        ...data,
        socios_natillera: sociosData,
        actividades: actividadesConTotales,
        cuotas: cuotasData
      }
      
      if (isDev) {
        console.log('=== NATILLERA CARGADA ===', {
          socios: sociosData?.length || 0,
          cuotas: cuotasData?.length || 0,
          actividades: actividadesConTotales?.length || 0
        })
      }

      return natilleraActual.value
    } catch (e) {
      error.value = e.message
      console.error('Error cargando natillera:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function crearNatillera(datos) {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()

      const { data: nextIcon, error: iconRpcError } = await supabase.rpc('next_dashboard_icon')
      let dashboardIcon = 0
      if (!iconRpcError && nextIcon != null && nextIcon !== '') {
        const n = Number(nextIcon)
        dashboardIcon = Number.isNaN(n) ? 0 : n % 20
      } else {
        const { count } = await supabase
          .from('natilleras')
          .select('*', { count: 'exact', head: true })
        dashboardIcon = (count ?? 0) % 20
      }

      const { data, error: createError } = await supabase
        .from('natilleras')
        .insert({
          ...datos,
          admin_id: user.id,
          estado: 'activa',
          dashboard_icon: dashboardIcon,
        })
        .select()
        .single()

      if (createError) throw createError

      natilleras.value.unshift(data)

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrarCreacion(
        'natillera',
        data.id,
        `Se creó la natillera "${datos.nombre}"`,
        data,
        data.id,
        { admin_id: user.id }
      ))

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function actualizarNatillera(id, datos) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos anteriores para auditoría
      const { data: datosAnteriores } = await supabase
        .from('natilleras')
        .select('*')
        .eq('id', id)
        .single()

      const { data, error: updateError } = await supabase
        .from('natilleras')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = natilleras.value.findIndex(n => n.id === id)
      if (index !== -1) {
        natilleras.value[index] = data
      }
      
      if (natilleraActual.value?.id === id) {
        natilleraActual.value = { ...natilleraActual.value, ...data }
      }

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      // La descripción se generará automáticamente con los detalles de los cambios
      registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
        'natillera',
        id,
        null, // null para generar descripción automática
        datosAnteriores,
        data,
        id, // natilleraId es el mismo id
        { campos_modificados: Object.keys(datos) }
      ))

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function cerrarNatillera(id) {
    const resultado = await actualizarNatillera(id, { 
      estado: 'cerrada',
      fecha_cierre: new Date().toISOString()
    })
    
    // La auditoría ya se registra en actualizarNatillera
    return resultado
  }

  async function reasignarNatillera(natilleraId, nuevoAdminId) {
    try {
      loading.value = true
      error.value = null

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No estás autenticado')
      }

      // Verificar que el usuario sea el superusuario
      const emailUsuario = (user.email || '').toLowerCase().trim()
      const esSuperUsuario = emailUsuario === 'raigo.16@gmail.com'

      if (!esSuperUsuario) {
        throw new Error('Solo el superusuario puede reasignar natilleras')
      }

      // Obtener datos anteriores para auditoría
      const { data: natilleraData, error: fetchError } = await supabase
        .from('natilleras')
        .select('*')
        .eq('id', natilleraId)
        .single()

      if (fetchError) {
        throw new Error(`Error al obtener la natillera: ${fetchError.message}`)
      }

      if (!natilleraData) {
        throw new Error('Natillera no encontrada')
      }

      // Verificar que el nuevo administrador exista
      const { data: nuevoAdmin, error: adminError } = await supabase
        .from('user_profiles')
        .select('id, email, nombre')
        .eq('id', nuevoAdminId)
        .single()

      if (adminError || !nuevoAdmin) {
        throw new Error('El usuario destino no existe')
      }

      // Obtener información del administrador anterior para auditoría
      const { data: adminAnterior } = await supabase
        .from('user_profiles')
        .select('id, email, nombre')
        .eq('id', natilleraData.admin_id)
        .single()

      // Actualizar el admin_id
      const { data: natilleraActualizada, error: updateError } = await supabase
        .from('natilleras')
        .update({ admin_id: nuevoAdminId })
        .eq('id', natilleraId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Error al reasignar la natillera: ${updateError.message}`)
      }

      // Actualizar en la lista local
      const index = natilleras.value.findIndex(n => n.id === natilleraId)
      if (index !== -1) {
        natilleras.value[index] = natilleraActualizada
      }

      if (natilleraActual.value?.id === natilleraId) {
        natilleraActual.value = { ...natilleraActual.value, ...natilleraActualizada }
      }

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
        'natillera',
        natilleraId,
        `Se reasignó la natillera "${natilleraData.nombre}" de ${adminAnterior?.email || adminAnterior?.nombre || 'usuario anterior'} a ${nuevoAdmin.email || nuevoAdmin.nombre}`,
        natilleraData,
        natilleraActualizada,
        natilleraId,
        { 
          reasignacion: true,
          admin_anterior: adminAnterior,
          admin_nuevo: nuevoAdmin
        }
      ))

      return { success: true, data: natilleraActualizada }
    } catch (e) {
      error.value = e.message
      console.error('Error reasignando natillera:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function eliminarNatillera(id) {
    try {
      loading.value = true
      error.value = null

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No estás autenticado')
      }

      // Obtener datos de la natillera antes de eliminar para auditoría
      const { data: natilleraData, error: fetchError } = await supabase
        .from('natilleras')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw new Error(`Error al obtener la natillera: ${fetchError.message}`)
      }

      if (!natilleraData) {
        throw new Error('Natillera no encontrada')
      }

      // Verificar permisos: el superusuario puede eliminar cualquier natillera
      // Otros usuarios solo pueden eliminar sus propias natilleras
      const emailUsuario = (user.email || '').toLowerCase().trim()
      const esSuperUsuario = emailUsuario === 'raigo.16@gmail.com'
      const esAdmin = natilleraData.admin_id === user.id

      if (!esSuperUsuario && !esAdmin) {
        throw new Error('No tienes permisos para eliminar esta natillera. Solo el administrador puede eliminarla.')
      }

      // Obtener todos los socios_natillera relacionados
      const { data: sociosNatillera, error: errorSocios } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', id)

      if (errorSocios) {
        console.warn('Error al obtener socios_natillera:', errorSocios)
      }

      const socioNatilleraIds = (sociosNatillera || []).map(s => s.id)

      // Eliminar datos relacionados explícitamente (en orden inverso de dependencias)
      // 1. Historial de comprobantes de préstamos
      if (socioNatilleraIds.length > 0) {
        const { error: errorHistorialPrestamos } = await supabase
          .from('historial_comprobantes_prestamo')
          .delete()
          .in('socio_natillera_id', socioNatilleraIds)
        
        if (errorHistorialPrestamos) {
          console.warn('Advertencia al eliminar historial_comprobantes_prestamo:', errorHistorialPrestamos)
        }
      }

      // 2. Obtener préstamos relacionados
      if (socioNatilleraIds.length > 0) {
        const { data: prestamos, error: errorPrestamosFetch } = await supabase
          .from('prestamos')
          .select('id')
          .in('socio_natillera_id', socioNatilleraIds)

        if (!errorPrestamosFetch && prestamos) {
          const prestamoIds = prestamos.map(p => p.id)

          // 2a. Obtener pagos de préstamos antes de eliminarlos
          if (prestamoIds.length > 0) {
            const { data: pagosPrestamo, error: errorPagosFetch } = await supabase
              .from('pagos_prestamo')
              .select('id')
              .in('prestamo_id', prestamoIds)

            const pagoPrestamoIds = (pagosPrestamo || []).map(p => p.id)

            // 2a1. Eliminar historial de comprobantes de préstamos relacionados con pagos
            if (pagoPrestamoIds.length > 0) {
              const { error: errorHistorialPagos } = await supabase
                .from('historial_comprobantes_prestamo')
                .delete()
                .in('pago_prestamo_id', pagoPrestamoIds)
              
              if (errorHistorialPagos) {
                console.warn('Advertencia al eliminar historial_comprobantes_prestamo (por pago_prestamo_id):', errorHistorialPagos)
              }
            }

            // 2a2. Eliminar pagos de préstamos
            if (!errorPagosFetch) {
              const { error: errorPagosPrestamo } = await supabase
                .from('pagos_prestamo')
                .delete()
                .in('prestamo_id', prestamoIds)
              
              if (errorPagosPrestamo) {
                console.warn('Advertencia al eliminar pagos_prestamo:', errorPagosPrestamo)
              }
            }

            // 2b. Eliminar plan de pagos de préstamos (si existe)
            const { error: errorPlanPagos } = await supabase
              .from('plan_pagos_prestamo')
              .delete()
              .in('prestamo_id', prestamoIds)
            
            if (errorPlanPagos) {
              console.warn('Advertencia al eliminar plan_pagos_prestamo:', errorPlanPagos)
            }

            // 2c. Eliminar historial de refinanciaciones (si existe)
            const { error: errorHistorialRefin } = await supabase
              .from('historial_refinanciaciones')
              .delete()
              .in('prestamo_id', prestamoIds)
            
            if (errorHistorialRefin) {
              console.warn('Advertencia al eliminar historial_refinanciaciones:', errorHistorialRefin)
            }
          }

          // 2d. Eliminar préstamos
          if (prestamoIds.length > 0) {
            const { error: errorPrestamos } = await supabase
              .from('prestamos')
              .delete()
              .in('id', prestamoIds)
            
            if (errorPrestamos) {
              console.warn('Advertencia al eliminar prestamos:', errorPrestamos)
            }
          }
        }
      }

      // 3. Eliminar historial de comprobantes de cuotas
      if (socioNatilleraIds.length > 0) {
        const { data: cuotas, error: errorCuotasFetch } = await supabase
          .from('cuotas')
          .select('id')
          .in('socio_natillera_id', socioNatilleraIds)

        if (!errorCuotasFetch && cuotas) {
          const cuotaIds = cuotas.map(c => c.id)

          if (cuotaIds.length > 0) {
            const { error: errorHistorialCuotas } = await supabase
              .from('historial_comprobantes')
              .delete()
              .in('cuota_id', cuotaIds)
            
            if (errorHistorialCuotas) {
              console.warn('Advertencia al eliminar historial_comprobantes:', errorHistorialCuotas)
            }
          }
        }
      }

      // 4. Eliminar cuotas
      if (socioNatilleraIds.length > 0) {
        const { error: errorCuotas } = await supabase
          .from('cuotas')
          .delete()
          .in('socio_natillera_id', socioNatilleraIds)
        
        if (errorCuotas) {
          console.warn('Advertencia al eliminar cuotas:', errorCuotas)
        }
      }

      // 5. Eliminar multas (si existe la tabla)
      if (socioNatilleraIds.length > 0) {
        const { error: errorMultas } = await supabase
          .from('multas')
          .delete()
          .in('socio_natillera_id', socioNatilleraIds)
        
        if (errorMultas) {
          console.warn('Advertencia al eliminar multas:', errorMultas)
        }
      }

      // 6. Eliminar utilidades clasificadas
      const { error: errorUtilidades } = await supabase
        .from('utilidades_clasificadas')
        .delete()
        .eq('natillera_id', id)
      
      if (errorUtilidades) {
        console.warn('Advertencia al eliminar utilidades_clasificadas:', errorUtilidades)
      }

      // 7. Eliminar actividades
      const { error: errorActividades } = await supabase
        .from('actividades')
        .delete()
        .eq('natillera_id', id)
      
      if (errorActividades) {
        console.warn('Advertencia al eliminar actividades:', errorActividades)
      }

      // 8. Eliminar historial
      const { error: errorHistorial } = await supabase
        .from('historial')
        .delete()
        .eq('natillera_id', id)
      
      if (errorHistorial) {
        console.warn('Advertencia al eliminar historial:', errorHistorial)
      }

      // 9. Eliminar colaboradores
      const { error: errorColaboradores } = await supabase
        .from('natillera_colaboradores')
        .delete()
        .eq('natillera_id', id)
      
      if (errorColaboradores) {
        console.warn('Advertencia al eliminar natillera_colaboradores:', errorColaboradores)
      }

      // 10. Eliminar socios_natillera
      if (socioNatilleraIds.length > 0) {
        const { error: errorSociosNatillera } = await supabase
          .from('socios_natillera')
          .delete()
          .in('id', socioNatilleraIds)
        
        if (errorSociosNatillera) {
          console.warn('Advertencia al eliminar socios_natillera:', errorSociosNatillera)
        }
      }

      // 11. Registrar auditoría de eliminación ANTES de eliminar la natillera
      // IMPORTANTE: Con la constraint ON DELETE SET NULL (ver migración fix_auditoria_cascade_to_set_null.sql),
      // este registro se preservará incluso después de eliminar la natillera.
      // El natillera_id será NULL pero natillera_nombre se mantiene como backup para identificar la natillera eliminada.
      const auditoria = useAuditoria()
      try {
        await auditoria.registrarEliminacion(
          'natillera',
          id,
          `Se eliminó la natillera "${natilleraData.nombre}" y todos sus registros relacionados`,
          natilleraData,
          id, // natilleraId - debe estar antes de eliminar
          { 
            eliminacion_cascada: true,
            registros_eliminados: 'socios_natillera, cuotas, prestamos, multas, actividades, historial'
          },
          natilleraData.nombre // Pasar el nombre directamente para asegurar que se guarde
        )
      } catch (auditError) {
        // Si falla la auditoría, solo registrar en consola pero continuar con la eliminación
        console.warn('Advertencia: No se pudo registrar la auditoría de eliminación:', auditError)
      }

      // NOTA: No eliminamos la auditoría relacionada manualmente.
      // Con la constraint ON DELETE SET NULL, todos los registros de auditoría relacionados
      // se mantendrán con natillera_id = NULL cuando se elimine la natillera.
      // El registro de eliminación se puede identificar por: tipo_accion = 'DELETE' y entidad = 'natillera'

      // 13. Finalmente, eliminar la natillera
      const { error: deleteError } = await supabase
        .from('natilleras')
        .delete()
        .eq('id', id)

      if (deleteError) {
        // Proporcionar mensaje de error más descriptivo
        console.error('Error al eliminar natillera:', deleteError)
        if (deleteError.code === '42501') {
          // Error de permisos RLS - la política SQL no permite la eliminación
          if (esSuperUsuario) {
            throw new Error('Error de permisos: Aunque eres superusuario, la política SQL en Supabase no está configurada correctamente. Por favor, ejecuta la migración SQL actualizada: add_cascade_delete_policies.sql')
          }
          throw new Error('No tienes permisos para eliminar natilleras. Por favor, ejecuta la migración SQL en Supabase: add_cascade_delete_policies.sql')
        }
        throw new Error(`Error al eliminar la natillera: ${deleteError.message} (Código: ${deleteError.code || 'N/A'})`)
      }

      // Remover de la lista local
      natilleras.value = natilleras.value.filter(n => n.id !== id)
      
      // Si es la natillera actual, limpiarla
      if (natilleraActual.value?.id === id) {
        natilleraActual.value = null
      }

      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('Error eliminando natillera:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function calcularEstadisticas(natillera) {
    if (!natillera) return null

    // Si la natillera no trae cuotas/socios (ej. lista del Dashboard), cargar datos completos como en NatilleraDetalle
    let nat = natillera
    const tieneCuotas = Array.isArray(natillera.cuotas) && natillera.cuotas.length > 0
    const tieneSocios = Array.isArray(natillera.socios_natillera) && natillera.socios_natillera.length > 0
    if ((!tieneCuotas || !tieneSocios) && natillera.id) {
      const cargada = await getNatilleraConDatos(natillera.id)
      if (cargada) nat = cargada
    }

    const socios = nat.socios_natillera || []
    const cuotas = nat.cuotas || []
    const actividades = nat.actividades || []

    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada')

    let configSanciones = null
    let sancionesDinamicas = {}
    try {
      // reglas_multas ya viene en nat (fetchNatillera hace select('*'))
      configSanciones = nat.reglas_multas?.sanciones || null
      const diasGracia = nat.reglas_multas?.dias_gracia ?? 3
      const interesesConfigNat = configSanciones?.interesesAdicionales ?? configSanciones?.intereses_adicionales ?? {}
      const interesesActivoNat = interesesConfigNat.activo === true || interesesConfigNat.activo === 'true' || interesesConfigNat.activo === 1
      const interesesDiasNat = Number(interesesConfigNat.dias) || 2
      const interesesValorNat = Number(interesesConfigNat.valor) || 0
      
        // Calcular sanciones dinámicas para cuotas en mora si las sanciones están activas
        if (configSanciones?.activa) {
          const periodicidadNatillera = nat?.periodicidad || 'mensual'
          const cuotasMora = cuotas.filter(c => c.estado === 'mora')
          
          // Función para obtener valor de sanción por posición (escalonada acumulativa)
          function obtenerValorSancionPorPosicion(configSanciones, posicion) {
            if (configSanciones.tipo === 'simple') {
              return configSanciones.valorFijo || 0
            } else if (configSanciones.tipo === 'escalonada') {
              const niveles = configSanciones.niveles || []
              if (niveles.length === 0) return 0

              const nivelesOrdenados = [...niveles].sort((a, b) => a.cuotas - b.cuotas)
              
              for (const nivel of nivelesOrdenados) {
                if (posicion <= nivel.cuotas) {
                  return nivel.valor || 0
                }
              }
              
              return nivelesOrdenados[nivelesOrdenados.length - 1]?.valor || 0
            }
            return 0
          }

          // Agrupar cuotas en mora por socio y ordenarlas por fecha_limite (más antigua primero)
          const cuotasPorSocio = {}
          cuotasMora.forEach(c => {
            if (!cuotasPorSocio[c.socio_natillera_id]) {
              cuotasPorSocio[c.socio_natillera_id] = []
            }
            cuotasPorSocio[c.socio_natillera_id].push(c)
          })
          Object.keys(cuotasPorSocio).forEach(socioId => {
            cuotasPorSocio[socioId].sort((a, b) => {
              const fechaA = new Date(a.fecha_limite || a.fecha_vencimiento || 0)
              const fechaB = new Date(b.fecha_limite || b.fecha_vencimiento || 0)
              return fechaA - fechaB
            })
          })

          // Calcular sanciones por cuota: intereses adicionales repartidos por tramo (solo días entre esta cuota y la siguiente)
          Object.keys(cuotasPorSocio).forEach(socioId => {
            const cuotasSocio = cuotasPorSocio[socioId]
            let posicionAcumulativa = 1

            cuotasSocio.forEach((cuota, indexEnSocio) => {
              const periodicidadSocio = cuota.socio_natillera?.periodicidad || (cuota.quincena === 0 || cuota.quincena === null ? 'mensual' : 'quincenal')
              const esMensualEnQuincenal = periodicidadNatillera === 'quincenal' && periodicidadSocio === 'mensual'

              let multaBase = 0

              if (configSanciones.tipo === 'simple') {
                multaBase = configSanciones.valorFijo || 0
              } else if (configSanciones.tipo === 'escalonada') {
                if (esMensualEnQuincenal) {
                  const sancionPos1 = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa)
                  const sancionPos2 = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa + 1)
                  multaBase = sancionPos1 + sancionPos2
                  posicionAcumulativa += 2
                } else {
                  multaBase = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa)
                  posicionAcumulativa += 1
                }
              } else if (configSanciones.tipo === 'diaria') {
                // Sanción diaria por TRAMO: días desde primer día en mora de esta cuota hasta el día anterior al primer día en mora de la siguiente (o hasta hoy).
                function obtenerInicioMoraNat(c, diasG) {
                  const fl = c.fecha_limite
                  if (!fl) return null
                  const str = String(fl).substring(0, 10)
                  const [anio, mes, dia] = str.split('-').map(Number)
                  if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null
                  const fechaVenc = new Date(anio, mes - 1, dia)
                  fechaVenc.setDate(fechaVenc.getDate() + (diasG || 0) + 1)
                  fechaVenc.setHours(0, 0, 0, 0)
                  return fechaVenc.toISOString().split('T')[0]
                }
                const fechaInicioMoraNat = cuota.fecha_inicio_mora ? String(cuota.fecha_inicio_mora).substring(0, 10) : null
                const fechaInicioNat = fechaInicioMoraNat || obtenerInicioMoraNat(cuota, diasGracia)
                if (fechaInicioNat) {
                  const [a, m, d] = fechaInicioNat.split('-').map(Number)
                  const inicioTramo = new Date(a, m - 1, d)
                  inicioTramo.setHours(0, 0, 0, 0)
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  let finTramo = hoy
                  if (indexEnSocio + 1 < cuotasSocio.length) {
                    const sigCuota = cuotasSocio[indexEnSocio + 1]
                    const sigInicio = sigCuota.fecha_inicio_mora ? String(sigCuota.fecha_inicio_mora).substring(0, 10) : obtenerInicioMoraNat(sigCuota, diasGracia)
                    if (sigInicio) {
                      const [aS, mS, dS] = sigInicio.split('-').map(Number)
                      finTramo = new Date(aS, mS - 1, dS)
                      finTramo.setDate(finTramo.getDate() - 1)
                      finTramo.setHours(0, 0, 0, 0)
                    }
                  }
                  if (finTramo.getTime() < inicioTramo.getTime()) finTramo = new Date(inicioTramo)
                  const diasEnTramoNat = Math.max(0, Math.floor((finTramo.getTime() - inicioTramo.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                  multaBase = (configSanciones.valorPorDia || 0) * diasEnTramoNat
                }
              }
              
              let interesesAdicionales = 0
              const fechaLimiteRawNat = cuota.fecha_limite
              const fechaLimiteStrNat = fechaLimiteRawNat ? String(fechaLimiteRawNat).substring(0, 10) : ''
              if (configSanciones.tipo !== 'diaria' && fechaLimiteStrNat && interesesActivoNat && interesesDiasNat > 0 && interesesValorNat > 0) {
                const partesNat = fechaLimiteStrNat.split('-')
                const anioNat = parseInt(partesNat[0], 10)
                const mesNat = parseInt(partesNat[1], 10) - 1
                const diaNat = parseInt(partesNat[2], 10)
                if (!Number.isNaN(anioNat) && !Number.isNaN(mesNat) && !Number.isNaN(diaNat)) {
                  const fechaLimiteCuota = new Date(anioNat, mesNat, diaNat)
                  fechaLimiteCuota.setHours(0, 0, 0, 0)
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  const primeraDiaMora = new Date(fechaLimiteCuota)
                  primeraDiaMora.setDate(primeraDiaMora.getDate() + diasGracia + 1)
                  let finTramo = hoy
                  if (indexEnSocio + 1 < cuotasSocio.length) {
                    const sigRawNat = cuotasSocio[indexEnSocio + 1].fecha_limite
                    const sigNat = sigRawNat ? String(sigRawNat).substring(0, 10) : ''
                    if (sigNat) {
                      const [a, m, d] = sigNat.split('-').map(x => parseInt(x, 10))
                      if (!Number.isNaN(a) && !Number.isNaN(m) && !Number.isNaN(d)) {
                        const fechaVencimientoSiguiente = new Date(a, m - 1, d)
                        fechaVencimientoSiguiente.setDate(fechaVencimientoSiguiente.getDate() + diasGracia)
                        finTramo = new Date(fechaVencimientoSiguiente)
                        finTramo.setDate(finTramo.getDate() - 1)
                        finTramo.setHours(0, 0, 0, 0)
                      }
                    }
                  }
                  if (finTramo.getTime() < primeraDiaMora.getTime()) {
                    finTramo = new Date(hoy)
                    finTramo.setHours(0, 0, 0, 0)
                  }
                  const diffMs = finTramo.getTime() - primeraDiaMora.getTime()
                  const diasEnMoraTramo = diffMs < 0 ? 0 : Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
                  if (diasEnMoraTramo > 0) {
                    interesesAdicionales = Math.round((diasEnMoraTramo / interesesDiasNat) * interesesValorNat)
                  }
                }
              }
              
              sancionesDinamicas[cuota.id] = multaBase + interesesAdicionales
            })
          })
        }
    } catch (e) {
      console.error('Error obteniendo configuración de sanciones:', e)
    }

    // Calcular totalAportado: solo el valor de las cuotas normales, sin incluir sanciones
    // Las sanciones ya se cuentan en utilidadesRecogidas
    // Usar valor_cuota en lugar de valor_pagado porque valor_cuota es el valor base sin sanción
    const totalAportado = cuotas
      .filter(c => c.estado === 'pagada')
      .reduce((sum, c) => {
        // valor_cuota es el valor de la cuota sin sanción
        const valorCuota = c.valor_cuota || 0
        return sum + valorCuota
      }, 0)

    // Calcular recaudado por tipo de pago (null/vacío se considera efectivo, como en Cuotas.vue)
    const tipoEfectivo = (t) => String(t ?? 'efectivo').toLowerCase().trim() === 'efectivo'
    const tipoTransferencia = (t) => String(t ?? '').toLowerCase().trim() === 'transferencia'
    
    // Recaudado neto: solo valor_cuota (sin sanciones ni actividades) - para la vista "Recaudado Neto"
    let totalRecaudadoEfectivo = cuotas
      .filter(c => c.estado === 'pagada' && tipoEfectivo(c.tipo_pago))
      .reduce((sum, c) => {
        const valorCuota = c.valor_cuota || 0
        return sum + valorCuota
      }, 0)

    let totalRecaudadoTransferencia = cuotas
      .filter(c => c.estado === 'pagada' && tipoTransferencia(c.tipo_pago))
      .reduce((sum, c) => {
        const valorCuota = c.valor_cuota || 0
        return sum + valorCuota
      }, 0)

    // Recaudado completo: valor_pagado total (incluye cuota + sanciones + actividades) - para la vista "Recaudado Completo"
    let recaudadoCompletoEfectivoBruto = cuotas
      .filter(c => c.estado === 'pagada' && tipoEfectivo(c.tipo_pago))
      .reduce((sum, c) => {
        // valor_pagado incluye: valor_cuota + valor_multa + valor_pagado_actividades
        const valorPagado = c.valor_pagado || 0
        return sum + valorPagado
      }, 0)

    let recaudadoCompletoTransferenciaBruto = cuotas
      .filter(c => c.estado === 'pagada' && tipoTransferencia(c.tipo_pago))
      .reduce((sum, c) => {
        // valor_pagado incluye: valor_cuota + valor_multa + valor_pagado_actividades
        const valorPagado = c.valor_pagado || 0
        return sum + valorPagado
      }, 0)

    // Calcular totalPendiente: incluir valor de cuota pendiente + sanciones pendientes
    const cuotasPendientes = cuotas.filter(c => {
      return c.estado !== 'pagada' && c.estado !== 'programada'
    })

    const totalPendiente = cuotasPendientes.reduce((sum, c) => {
      // Valor pendiente de la cuota (valor_cuota - valor_pagado)
      const deudaCuota = (c.valor_cuota || 0) - (c.valor_pagado || 0)
      
      // Obtener sanción pendiente
      let sancionPendiente = 0
      if (c.estado === 'mora') {
        // Para cuotas en mora, usar sanción dinámica calculada o valor_multa guardado
        sancionPendiente = sancionesDinamicas[c.id] || c.valor_multa || 0
      } else if (c.valor_multa && c.valor_multa > 0) {
        // Para cuotas pendientes/parciales que tienen valor_multa guardado,
        // verificar si aún tienen sanción pendiente
        const totalConSancion = (c.valor_cuota || 0) + c.valor_multa
        if ((c.valor_pagado || 0) < totalConSancion) {
          sancionPendiente = c.valor_multa
        }
      }
      
      return sum + deudaCuota + sancionPendiente
    }, 0)

    // ── Lanzar 3 consultas independientes en paralelo ─────────────────
    // Antes se ejecutaban secuencialmente (utilidades → préstamos → movimientos).
    // Son independientes entre sí así que pueden ir en paralelo.
    const socioNatilleraIds = socios.map(s => s.id)

    const [utilidadesRaw, prestamosRaw, movimientosRaw] = await Promise.all([
      nat.id
        ? supabase.from('utilidades_clasificadas').select('tipo, forma_pago, monto').eq('natillera_id', nat.id)
        : Promise.resolve({ data: null, error: null }),
      socioNatilleraIds.length > 0
        ? supabase.from('prestamos').select('id, monto, medio_entrega, interes_anticipado, interes_total').in('socio_natillera_id', socioNatilleraIds).in('estado', ['pagado', 'activo'])
        : Promise.resolve({ data: null }),
      nat.id
        ? supabase.from('movimientos_fondo').select('tipo, monto, forma_pago, descripcion, origen_egreso, destino_ingreso').eq('natillera_id', nat.id)
        : Promise.resolve({ data: null })
    ])

    // ── Procesar utilidades ─────────────────────────────────────────────
    let utilidadesRecogidas = 0
    const utilidadesPorTipo = {}
    const utilidadesPorFormaPagoMap = { efectivo: 0, transferencia: 0, otro: 0 }

    const filasUtilidades = utilidadesRaw.data
    if (filasUtilidades?.length) {
      filasUtilidades.forEach((r) => {
        const m = parseFloat(r.monto) || 0
        utilidadesRecogidas += m
        const tipoNorm = (r.tipo || '').toString().toLowerCase().trim()
        if (tipoNorm) {
          utilidadesPorTipo[tipoNorm] = (utilidadesPorTipo[tipoNorm] || 0) + m
        }
        const fp = (r.forma_pago || '').toLowerCase().trim()
        if (fp === 'efectivo') utilidadesPorFormaPagoMap.efectivo += m
        else if (fp === 'transferencia') utilidadesPorFormaPagoMap.transferencia += m
        else utilidadesPorFormaPagoMap.otro += m
      })
    }
    if (utilidadesRecogidas === 0 && cuotasPagadas?.length > 0) {
      const sancionesDesdeCuotas = cuotasPagadas.reduce((s, c) => {
        const v = parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0
        return s + v
      }, 0)
      let sancionesEfectivoFb = 0
      let sancionesTransferenciaFb = 0
      cuotasPagadas.forEach((c) => {
        const v = parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0
        if (v <= 0) return
        const fp = (c.tipo_pago || 'efectivo').toLowerCase().trim()
        if (fp === 'transferencia') sancionesTransferenciaFb += v
        else sancionesEfectivoFb += v
      })
      let utilidadActividadesFb = actividades.reduce((sum, a) => sum + (parseFloat(a.utilidad) || 0), 0)
      const totalFallback = sancionesDesdeCuotas + utilidadActividadesFb
      if (totalFallback > 0) {
        utilidadesRecogidas = totalFallback
        if (sancionesDesdeCuotas > 0) {
          utilidadesPorTipo.sanciones = sancionesDesdeCuotas
          utilidadesPorFormaPagoMap.efectivo += sancionesEfectivoFb
          utilidadesPorFormaPagoMap.transferencia += sancionesTransferenciaFb
        }
        if (utilidadActividadesFb > 0) {
          utilidadesPorTipo.otro = (utilidadesPorTipo.otro || 0) + utilidadActividadesFb
          utilidadesPorFormaPagoMap.otro += utilidadActividadesFb
        }
      }
    }

    const etiquetasTipo = {
      sanciones: { label: 'Sanciones', desc: 'Multas por mora y sanciones por retiro (desactivación de socio)' },
      prestamos: { label: 'Intereses de préstamos', desc: 'Intereses generados por préstamos' },
      rifas: { label: 'Rifas', desc: 'Utilidad de actividades tipo Rifas' },
      bingo: { label: 'Bingo', desc: 'Utilidad de actividades tipo Bingo' },
      venta: { label: 'Venta', desc: 'Utilidad de actividades tipo Venta' },
      evento: { label: 'Evento', desc: 'Utilidad de actividades tipo Evento' },
      otro: { label: 'Otro', desc: 'Otras utilidades de actividades' },
      actividades_en_curso: { label: 'Actividades en curso', desc: 'Recaudado en actividades en curso (sin rifas)' }
    }
    const utilidadesDesglose = Object.entries(utilidadesPorTipo)
      .filter(([, v]) => v > 0)
      .map(([tipo, value]) => ({
        id: tipo,
        label: etiquetasTipo[tipo]?.label || tipo,
        desc: etiquetasTipo[tipo]?.desc || `Utilidad: ${tipo}`,
        value
      }))
      .sort((a, b) => (b.value || 0) - (a.value || 0))
    const utilidadesPorFormaPago = [
      { id: 'efectivo', label: 'Efectivo', desc: 'Multas y actividades pagadas en efectivo (con la cuota)', value: utilidadesPorFormaPagoMap.efectivo },
      { id: 'transferencia', label: 'Transferencia', desc: 'Multas y actividades pagadas por transferencia (con la cuota)', value: utilidadesPorFormaPagoMap.transferencia }
    ]
    if (utilidadesPorFormaPagoMap.otro > 0) {
      utilidadesPorFormaPago.push({
        id: 'otro',
        label: 'Otro',
        desc: 'Intereses de préstamos y actividades sin forma de pago registrada en el pago',
        value: utilidadesPorFormaPagoMap.otro
      })
    }

    // ── Procesar préstamos (ya tenemos el resultado de la query paralela) ──
    let totalDesembolsadoPrestamos = 0
    let totalDesembolsadoEfectivo = 0
    let totalDesembolsadoTransferencia = 0
    let pagosPrestamosEfectivo = 0
    let pagosPrestamosTransferencia = 0
    const prestamos = prestamosRaw.data
    if (prestamos?.length > 0) {
      try {
        const montoAfectaFondo = (p) => {
          const monto = parseFloat(p.monto || 0)
          if (p.interes_anticipado && p.interes_total != null) {
            return monto + parseFloat(p.interes_total)
          }
          return monto
        }
        totalDesembolsadoPrestamos = prestamos.reduce((sum, p) => sum + montoAfectaFondo(p), 0)
        totalDesembolsadoEfectivo = prestamos
          .filter(p => (p.medio_entrega || '').toLowerCase() === 'efectivo')
          .reduce((sum, p) => sum + montoAfectaFondo(p), 0)
        totalDesembolsadoTransferencia = prestamos
          .filter(p => (p.medio_entrega || '').toLowerCase() === 'transferencia')
          .reduce((sum, p) => sum + montoAfectaFondo(p), 0)

        const prestamoIds = prestamos.map(p => p.id)
        const { data: planesPago } = await supabase
          .from('plan_pagos_prestamo')
          .select('valor_pagado, valor_cuota, forma_pago')
          .in('prestamo_id', prestamoIds)
          .eq('pagada', true)
        if (planesPago?.length > 0) {
          const fpTransferencia = (fp) => String(fp ?? '').toLowerCase().trim() === 'transferencia'
          planesPago.forEach((pp) => {
            const v = parseFloat(pp.valor_pagado) ?? parseFloat(pp.valor_cuota) ?? 0
            if (v <= 0) return
            if (fpTransferencia(pp.forma_pago)) pagosPrestamosTransferencia += v
            else pagosPrestamosEfectivo += v
          })
        }
      } catch (e) {
        console.error('Error procesando préstamos:', e)
      }
    }

    // Incluir cuotas de préstamos pagadas en totales recaudados y en recaudado completo
    totalRecaudadoEfectivo += pagosPrestamosEfectivo
    totalRecaudadoTransferencia += pagosPrestamosTransferencia
    recaudadoCompletoEfectivoBruto += pagosPrestamosEfectivo
    recaudadoCompletoTransferenciaBruto += pagosPrestamosTransferencia

    // Valores para desglose recaudado completo (siguen desde cuotas)
    const sancionesEfectivo = cuotasPagadas
      .filter(c => (c.tipo_pago || 'efectivo') === 'efectivo' && (c.valor_multa || 0) > 0)
      .reduce((sum, c) => sum + (c.valor_multa || 0), 0)
    const sancionesTransferencia = cuotasPagadas
      .filter(c => c.tipo_pago === 'transferencia' && (c.valor_multa || 0) > 0)
      .reduce((sum, c) => sum + (c.valor_multa || 0), 0)
    const actividadesEfectivo = cuotasPagadas
      .filter(c => (c.tipo_pago || 'efectivo') === 'efectivo' && (c.valor_pagado_actividades || 0) > 0)
      .reduce((sum, c) => sum + (c.valor_pagado_actividades || 0), 0)
    const actividadesTransferencia = cuotasPagadas
      .filter(c => c.tipo_pago === 'transferencia' && (c.valor_pagado_actividades || 0) > 0)
      .reduce((sum, c) => sum + (c.valor_pagado_actividades || 0), 0)

    // Calcular sanciones pendientes totales para el log
    const sancionesPendientesTotal = cuotasPendientes.reduce((sum, c) => {
      let sancionPendiente = 0
      if (c.estado === 'mora') {
        sancionPendiente = sancionesDinamicas[c.id] || c.valor_multa || 0
      } else if (c.valor_multa && c.valor_multa > 0) {
        const totalConSancion = (c.valor_cuota || 0) + c.valor_multa
        if ((c.valor_pagado || 0) < totalConSancion) {
          sancionPendiente = c.valor_multa
        }
      }
      return sum + sancionPendiente
    }, 0)

    // ── Procesar movimientos de fondo (ya tenemos el resultado de la query paralela) ──
    let movimientosEfectivoNeto = 0
    let movimientosTransferenciaNeto = 0
    let totalPremiosRifas = 0
    let totalPremiosEfectivo = 0
    let totalPremiosTransferencia = 0
    let egresosRecaudado = 0
    let egresosUtilidades = 0
    let ingresosRecaudado = 0
    let ingresosUtilidades = 0
    const movs = movimientosRaw.data
    if (movs?.length) {
      const descMov = (m) => (m && (m.descripcion ?? '')).toString().toLowerCase().trim()
      const esPremioRifa = (m) => {
        if (m.tipo !== 'salida') return false
        const d = descMov(m)
        return d.includes('premio rifa') || d.includes('rifa liquidada') || (d.includes('premio') && d.includes('rifa'))
      }
      const premiosEfectivo = movs.filter(m => esPremioRifa(m) && m.forma_pago === 'efectivo').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const premiosTransferencia = movs.filter(m => esPremioRifa(m) && m.forma_pago === 'transferencia').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      totalPremiosRifas = premiosEfectivo + premiosTransferencia
      totalPremiosEfectivo = premiosEfectivo
      totalPremiosTransferencia = premiosTransferencia
      const salidasSinPremio = movs.filter(m => m.tipo === 'salida' && !esPremioRifa(m))
      egresosRecaudado = salidasSinPremio.filter(m => m.origen_egreso === 'recaudado').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      egresosUtilidades = salidasSinPremio.filter(m => m.origen_egreso === 'utilidades').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const entradas = movs.filter(m => m.tipo === 'entrada')
      ingresosRecaudado = entradas.filter(m => m.destino_ingreso === 'recaudado').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      ingresosUtilidades = entradas.filter(m => m.destino_ingreso === 'utilidades').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const entradasEfectivo = movs.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const salidasEfectivo = movs.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'salida' && !esPremioRifa(m)).reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const entradasTransferencia = movs.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const salidasTransferencia = movs.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'salida' && !esPremioRifa(m)).reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      movimientosEfectivoNeto = entradasEfectivo - salidasEfectivo
      movimientosTransferenciaNeto = entradasTransferencia - salidasTransferencia
    }

    // Recaudado neto: aportes (cuotas ahorro + cuotas préstamos pagadas) menos préstamos desembolsados menos premios rifa entregados
    const totalRecaudadoNeto = Math.max(0, totalAportado + pagosPrestamosEfectivo + pagosPrestamosTransferencia - totalDesembolsadoPrestamos - totalPremiosRifas)
    // Total recaudo incluyendo pagos parciales (suma valor_pagado de todas las cuotas con pago, no solo pagadas)
    const totalRecaudadoEfectivoInclParciales = cuotas
      .filter(c => (c.valor_pagado || 0) > 0 && tipoEfectivo(c.tipo_pago))
      .reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    const totalRecaudadoTransferenciaInclParciales = cuotas
      .filter(c => (c.valor_pagado || 0) > 0 && tipoTransferencia(c.tipo_pago))
      .reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    const totalRecaudadoCuotasInclParciales = totalRecaudadoEfectivoInclParciales + totalRecaudadoTransferenciaInclParciales
    const totalRecaudadoNetoInclParciales = Math.max(0, totalRecaudadoCuotasInclParciales + pagosPrestamosEfectivo + pagosPrestamosTransferencia - totalDesembolsadoPrestamos - totalPremiosRifas)
    // Fondo disponible: recaudado neto + utilidades + movimientos de fondo (premios rifa, depósitos, retiros)
    const fondoTotal = totalRecaudadoNeto + utilidadesRecogidas + movimientosEfectivoNeto + movimientosTransferenciaNeto

    // Recaudado completo: ya calculado arriba usando valor_pagado (incluye todo)
    // Desglose para mostrar en la vista:
    // - Cuotas: totalRecaudadoEfectivo / totalRecaudadoTransferencia
    // - Sanciones: sancionesEfectivo / sancionesTransferencia  
    // - Actividades: actividadesEfectivo / actividadesTransferencia
    // - Total: recaudadoCompletoEfectivoBruto / recaudadoCompletoTransferenciaBruto
    const recaudadoCompletoEfectivo = recaudadoCompletoEfectivoBruto
    const recaudadoCompletoTransferencia = recaudadoCompletoTransferenciaBruto
    const recaudadoCompletoTotal = recaudadoCompletoEfectivo + recaudadoCompletoTransferencia

    return {
      totalSocios: socios.length,
      sociosActivos: socios.filter(s => s.estado === 'activo').length,
      totalAportado,
      totalRecaudadoNeto,
      totalPendiente,
      utilidadActividades: ['rifas', 'bingo', 'venta', 'evento', 'otro', 'actividades_en_curso'].reduce((s, t) => s + (utilidadesPorTipo[t] || 0), 0),
      utilidadesRecogidas,
      utilidadesDesglose,
      utilidadesPorFormaPago,
      fondoTotal,
      totalDesembolsadoPrestamos,
      totalDesembolsadoEfectivo,
      totalDesembolsadoTransferencia,
      totalPremiosRifas,
      totalPremiosEfectivo,
      totalPremiosTransferencia,
      totalRecaudadoEfectivo,
      totalRecaudadoTransferencia,
      totalRecaudadoNetoInclParciales,
      // Valores desglosados para el desglose completo
      sancionesEfectivo,
      sancionesTransferencia,
      actividadesEfectivo,
      actividadesTransferencia,
      pagosPrestamosEfectivo,
      pagosPrestamosTransferencia,
      recaudadoCompletoEfectivo,
      recaudadoCompletoTransferencia,
      recaudadoCompletoTotal,
      movimientosEfectivoNeto,
      movimientosTransferenciaNeto,
      egresosRecaudado,
      egresosUtilidades,
      ingresosRecaudado,
      ingresosUtilidades
    }
  }

  // Función para clasificar y guardar utilidades
  async function clasificarYGuardarUtilidades(natilleraId, fechaCierre = null) {
    try {
      if (!natilleraId) {
        throw new Error('ID de natillera requerido')
      }

      // Obtener datos de la natillera
      const natillera = await fetchNatillera(natilleraId)
      if (!natillera) {
        throw new Error('Natillera no encontrada')
      }

      const socios = natillera.socios_natillera || []
      const cuotas = natillera.cuotas || []
      const actividades = natillera.actividades || []

      // Obtener IDs de socios_natillera
      const socioNatilleraIds = socios.map(s => s.id)

      // 1. Calcular utilidades de sanciones (multas pagadas)
      const sancionesPagadas = cuotas
        .filter(c => c.estado === 'pagada' && c.valor_multa)
        .reduce((sum, c) => sum + (c.valor_multa || 0), 0)

      // 2. Calcular utilidades de préstamos (intereses)
      let interesesPrestamos = 0
      let prestamosIds = []
      
      if (socioNatilleraIds.length > 0) {
        const { data: prestamos } = await supabase
          .from('prestamos')
          .select('id, monto, saldo_actual, interes, interes_anticipado, interes_total')
          .in('socio_natillera_id', socioNatilleraIds)
          .in('estado', ['pagado', 'activo'])

        if (prestamos && prestamos.length > 0) {
          prestamosIds = prestamos.map(p => p.id)
          
          // Obtener historial de refinanciaciones para todos los préstamos
          const { data: historialRefinanciaciones } = await supabase
            .from('historial_refinanciaciones')
            .select('*')
            .in('prestamo_id', prestamosIds)
            .order('fecha_refinanciacion', { ascending: true })

          // Crear mapa de historial por préstamo
          const historialMap = {}
          if (historialRefinanciaciones) {
            historialRefinanciaciones.forEach(historial => {
              if (!historialMap[historial.prestamo_id]) {
                historialMap[historial.prestamo_id] = historial
              }
            })
          }

          // Obtener cuotas pagadas de todos los préstamos para calcular intereses correctamente
          const { data: cuotasPagadas } = await supabase
            .from('plan_pagos_prestamo')
            .select('prestamo_id, interes')
            .in('prestamo_id', prestamosIds)
            .eq('pagada', true)

          // Crear mapa de intereses por préstamo basado en cuotas pagadas
          const interesesPorPrestamo = {}
          if (cuotasPagadas) {
            cuotasPagadas.forEach(cuota => {
              if (!interesesPorPrestamo[cuota.prestamo_id]) {
                interesesPorPrestamo[cuota.prestamo_id] = 0
              }
              interesesPorPrestamo[cuota.prestamo_id] += parseFloat(cuota.interes || 0)
            })
          }

          interesesPrestamos = prestamos.reduce((sum, prestamo) => {
            const historial = historialMap[prestamo.id]
            const tieneInteresAnticipadoInicial = historial 
              ? historial.interes_anticipado_anterior 
              : prestamo.interes_anticipado

            // Si el préstamo fue refinanciado y inicialmente fue con interés anticipado,
            // usar solo los intereses de las cuotas pagadas (ya registrados en utilidades_clasificadas)
            if (historial && tieneInteresAnticipadoInicial) {
              // Usar los intereses de las cuotas pagadas
              const interesesCuotasPagadas = interesesPorPrestamo[prestamo.id] || 0
              return sum + interesesCuotasPagadas
            }
            
            // Para préstamos normales con interés anticipado (no refinanciados),
            // el interés_total ya fue registrado al crear el préstamo en utilidades_clasificadas.
            // Sin embargo, para mantener la consistencia al cerrar períodos, incluimos el interés_total
            // porque el upsert reemplazará el monto completo con el cálculo actualizado.
            // Los intereses de cuotas pagadas adicionales (si las hay) también se incluyen.
            if (prestamo.interes_anticipado && prestamo.interes_total) {
              // Incluir el interés_total (ya registrado al crear el préstamo)
              // y los intereses de cuotas pagadas si las hay
              const interesesCuotasPagadas = interesesPorPrestamo[prestamo.id] || 0
              // Si hay intereses de cuotas pagadas, sumarlos (para préstamos que fueron refinanciados después)
              // Si no hay historial pero hay intereses de cuotas, significa que el préstamo fue refinanciado
              // pero no tenemos historial (caso edge)
              return sum + (parseFloat(prestamo.interes_total) || 0) + interesesCuotasPagadas
            }
            
            // Para préstamos sin interés anticipado, calcular basado en lo pagado
            const monto = parseFloat(prestamo.monto || 0)
            const saldoActual = parseFloat(prestamo.saldo_actual || 0)
            const interes = parseFloat(prestamo.interes || 0)
            const interesGenerado = (monto - saldoActual) * (interes / 100)
            return sum + interesGenerado
          }, 0)
        }
      }

      // 3. Clasificar utilidades de actividades por tipo
      const utilidadesPorTipo = {
        rifas: 0,
        bingo: 0,
        venta: 0,
        evento: 0,
        otro: 0
      }
      const actividadesPorTipo = {
        rifas: [],
        bingo: [],
        venta: [],
        evento: [],
        otro: []
      }

      actividades.forEach(actividad => {
        const tipo = actividad.tipo || 'otro'
        const utilidad = actividad.utilidad || 0
        if (utilidadesPorTipo.hasOwnProperty(tipo)) {
          utilidadesPorTipo[tipo] += utilidad
          actividadesPorTipo[tipo].push(actividad.id)
        }
      })

      // Preparar datos para insertar/actualizar
      const fechaCierreFinal = fechaCierre || new Date().toISOString().split('T')[0]
      const utilidadesAClasificar = [
        {
          tipo: 'sanciones',
          monto: sancionesPagadas,
          descripcion: 'Multas pagadas por cuotas en mora',
          detalles: { total_cuotas_con_sancion: cuotas.filter(c => c.estado === 'pagada' && c.valor_multa).length }
        },
        {
          tipo: 'prestamos',
          monto: interesesPrestamos,
          descripcion: 'Intereses generados por préstamos',
          detalles: { prestamos_ids: prestamosIds, total_prestamos: prestamosIds.length }
        }
      ]

      // Agregar utilidades de actividades
      Object.keys(utilidadesPorTipo).forEach(tipo => {
        if (utilidadesPorTipo[tipo] > 0) {
          utilidadesAClasificar.push({
            tipo: tipo,
            monto: utilidadesPorTipo[tipo],
            descripcion: `Utilidades de ${tipo}`,
            detalles: { actividades_ids: actividadesPorTipo[tipo], total_actividades: actividadesPorTipo[tipo].length }
          })
        }
      })

      // Guardar o actualizar utilidades clasificadas
      const resultados = []
      for (const utilidad of utilidadesAClasificar) {
        const { data, error } = await supabase
          .from('utilidades_clasificadas')
          .upsert({
            natillera_id: natilleraId,
            tipo: utilidad.tipo,
            monto: utilidad.monto,
            fecha_cierre: fechaCierreFinal,
            descripcion: utilidad.descripcion,
            detalles: utilidad.detalles,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'natillera_id,tipo,fecha_cierre'
          })
          .select()

        if (error) {
          console.error(`Error guardando utilidad ${utilidad.tipo}:`, error)
          resultados.push({ tipo: utilidad.tipo, error: error.message })
        } else {
          resultados.push({ tipo: utilidad.tipo, success: true, data: data[0] })
        }
      }

      return {
        success: true,
        utilidades: resultados,
        total: utilidadesAClasificar.reduce((sum, u) => sum + u.monto, 0)
      }
    } catch (error) {
      console.error('Error clasificando y guardando utilidades:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Carga en lote las estadísticas para el dashboard.
   * Intenta usar la RPC `dashboard_stats_batch` (1 sola query al servidor).
   * Si la RPC no existe (migración pendiente), cae al fallback con queries múltiples.
   * @param {string[]} natilleraIds
   */
  async function calcularEstadisticasParaDashboard(natilleraIds) {
    const vacio = { totalRecaudadoNeto: 0, totalRecaudadoNetoInclParciales: 0, utilidadesRecogidas: 0, fondoTotal: 0, recaudadoBrutoCuotas: 0, progresoCuotas: 0 }
    const resultado = {}
    natilleraIds.forEach(id => { resultado[id] = { ...vacio } })
    if (!natilleraIds.length) return resultado

    // ── Intentar RPC (1 round-trip) ──
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('dashboard_stats_batch', {
        p_natillera_ids: natilleraIds
      })
      if (!rpcError && rpcData && typeof rpcData === 'object') {
        natilleraIds.forEach(id => {
          const s = rpcData[id]
          if (s) {
            resultado[id] = {
              totalRecaudadoNeto: Number(s.totalRecaudadoNeto) || 0,
              totalRecaudadoNetoInclParciales: Number(s.totalRecaudadoNetoInclParciales) || 0,
              utilidadesRecogidas: Number(s.utilidadesRecogidas) || 0,
              fondoTotal: Number(s.fondoTotal) || 0,
              recaudadoBrutoCuotas: Number(s.recaudadoBrutoCuotas) || 0,
              progresoCuotas: Number(s.progresoCuotas) || 0
            }
          }
        })
        return resultado
      }
      // Si hay error (función no existe), caer al fallback
      if (isDev) console.warn('[Dashboard stats] RPC fallback:', rpcError?.message)
    } catch {
      // RPC no disponible, usar fallback
    }

    // ── Fallback: queries múltiples (compatible sin migración) ──
    return _calcularEstadisticasFallback(natilleraIds, resultado)
  }

  async function _calcularEstadisticasFallback(natilleraIds, resultado) {
    const ids = [...natilleraIds]

    const [sociosRes, utilRes, actsRes, movsRes] = await Promise.all([
      supabase.from('socios_natillera').select('id, natillera_id').in('natillera_id', ids),
      supabase.from('utilidades_clasificadas').select('natillera_id, monto').in('natillera_id', ids).is('fecha_cierre', null),
      supabase.from('actividades').select('natillera_id, utilidad').in('natillera_id', ids),
      supabase.from('movimientos_fondo').select('natillera_id, tipo, monto, forma_pago, descripcion').in('natillera_id', ids)
    ])

    const socios = sociosRes.data || []
    const socioIds = socios.map(s => s.id)
    const snToNat = {}
    socios.forEach(s => { snToNat[s.id] = s.natillera_id })

    const [cuotasRes, prestamosRes] = await Promise.all([
      socioIds.length ? supabase.from('cuotas').select('socio_natillera_id, estado, valor_cuota, tipo_pago, valor_pagado, valor_multa, valor_pagado_sancion').in('socio_natillera_id', socioIds) : Promise.resolve({ data: [] }),
      socioIds.length ? supabase.from('prestamos').select('id, monto, medio_entrega, interes_anticipado, interes_total, socio_natillera_id, plan_pagos_prestamo(prestamo_id, valor_pagado, valor_cuota, forma_pago, pagada)').in('socio_natillera_id', socioIds).in('estado', ['pagado', 'activo']) : Promise.resolve({ data: [] })
    ])

    const cuotas = cuotasRes.data || []
    const prestamos = prestamosRes.data || []

    const planesPago = []
    prestamos.forEach(p => {
      const planes = p.plan_pagos_prestamo || []
      planes.forEach(pp => { if (pp.pagada) planesPago.push(pp) })
      delete p.plan_pagos_prestamo
    })

    const utilidades = utilRes.data || []
    const actividades = actsRes.data || []
    const movs = movsRes.data || []

    const tipoTransferencia = (t) => String(t ?? '').toLowerCase().trim() === 'transferencia'
    const montoAfectaFondo = (p) => {
      const monto = parseFloat(p.monto || 0)
      if (p.interes_anticipado && p.interes_total != null) return monto + parseFloat(p.interes_total)
      return monto
    }
    const descMov = (m) => (m && (m.descripcion ?? '')).toString().toLowerCase().trim()
    const esPremioRifa = (m) => m.tipo === 'salida' && (descMov(m).includes('premio rifa') || descMov(m).includes('rifa liquidada') || (descMov(m).includes('premio') && descMov(m).includes('rifa')))

    const cuotasPorNat = {}
    const socioIdsPorNat = {}
    const prestamosPorNat = {}
    const utilidadesPorNat = {}
    const actividadesPorNat = {}
    const movsPorNat = {}
    const planesPorPrestamo = {}
    ids.forEach(id => {
      cuotasPorNat[id] = []
      socioIdsPorNat[id] = new Set()
      prestamosPorNat[id] = []
      utilidadesPorNat[id] = 0
      actividadesPorNat[id] = 0
      movsPorNat[id] = []
    })
    socios.forEach(s => {
      if (socioIdsPorNat[s.natillera_id]) socioIdsPorNat[s.natillera_id].add(s.id)
    })
    cuotas.forEach(c => {
      const natId = snToNat[c.socio_natillera_id]
      if (natId && cuotasPorNat[natId]) cuotasPorNat[natId].push(c)
    })
    prestamos.forEach(p => {
      const natId = snToNat[p.socio_natillera_id]
      if (natId && prestamosPorNat[natId]) prestamosPorNat[natId].push(p)
    })
    utilidades.forEach(u => {
      if (utilidadesPorNat[u.natillera_id] !== undefined) utilidadesPorNat[u.natillera_id] += (parseFloat(u.monto) || 0)
    })
    actividades.forEach(a => {
      if (actividadesPorNat[a.natillera_id] !== undefined) actividadesPorNat[a.natillera_id] += (parseFloat(a.utilidad) || 0)
    })
    movs.forEach(m => {
      if (movsPorNat[m.natillera_id]) movsPorNat[m.natillera_id].push(m)
    })
    planesPago.forEach(pp => {
      if (!planesPorPrestamo[pp.prestamo_id]) planesPorPrestamo[pp.prestamo_id] = []
      planesPorPrestamo[pp.prestamo_id].push(pp)
    })

    ids.forEach(natId => {
      const cuotasNat = cuotasPorNat[natId]
      const cuotasPagadas = cuotasNat.filter(c => c.estado === 'pagada')
      const totalAportado = cuotasPagadas.reduce((sum, c) => sum + (parseFloat(c.valor_cuota) || 0), 0)
      const prestamosNat = prestamosPorNat[natId]
      const totalDesembolsadoPrestamos = prestamosNat.reduce((sum, p) => sum + montoAfectaFondo(p), 0)
      let pagosPrestamosEfectivo = 0
      let pagosPrestamosTransferencia = 0
      prestamosNat.forEach(p => {
        const pps = planesPorPrestamo[p.id]
        if (!pps) return
        pps.forEach(pp => {
          const v = parseFloat(pp.valor_pagado) ?? parseFloat(pp.valor_cuota) ?? 0
          if (v <= 0) return
          if (tipoTransferencia(pp.forma_pago)) pagosPrestamosTransferencia += v
          else pagosPrestamosEfectivo += v
        })
      })
      const movsNat = movsPorNat[natId]
      const totalPremiosRifas = movsNat.filter(m => esPremioRifa(m)).reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const entradasEf = movsNat.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const salidasEf = movsNat.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'salida' && !esPremioRifa(m)).reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const entradasTr = movsNat.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const salidasTr = movsNat.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'salida' && !esPremioRifa(m)).reduce((s, m) => s + parseFloat(m.monto || 0), 0)
      const movimientosEfectivoNeto = entradasEf - salidasEf
      const movimientosTransferenciaNeto = entradasTr - salidasTr
      let utilidadesRecogidas = utilidadesPorNat[natId]
      if (utilidadesRecogidas === 0 && cuotasPagadas.length > 0) {
        const sanciones = cuotasPagadas.reduce((s, c) => s + (parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0), 0)
        utilidadesRecogidas = sanciones + actividadesPorNat[natId]
      }
      const totalRecaudadoNeto = Math.max(0, totalAportado + pagosPrestamosEfectivo + pagosPrestamosTransferencia - totalDesembolsadoPrestamos - totalPremiosRifas)
      const totalRecaudadoCuotasInclParciales = cuotasNat
        .filter(c => (parseFloat(c.valor_pagado) || 0) > 0)
        .reduce((sum, c) => sum + (parseFloat(c.valor_pagado) || 0), 0)
      const totalRecaudadoNetoInclParciales = Math.max(0, totalRecaudadoCuotasInclParciales + pagosPrestamosEfectivo + pagosPrestamosTransferencia - totalDesembolsadoPrestamos - totalPremiosRifas)
      const fondoTotal = totalRecaudadoNeto + utilidadesRecogidas + movimientosEfectivoNeto + movimientosTransferenciaNeto
      const totalCuotaPlan = cuotasNat.reduce((sum, c) => sum + (parseFloat(c.valor_cuota) || 0), 0)
      const totalPagadoBruto = cuotasNat.reduce((sum, c) => sum + (parseFloat(c.valor_pagado) || 0), 0)
      const progresoCuotas = totalCuotaPlan > 0 ? (totalPagadoBruto / totalCuotaPlan) * 100 : 0
      resultado[natId] = {
        totalRecaudadoNeto,
        totalRecaudadoNetoInclParciales,
        utilidadesRecogidas,
        fondoTotal,
        recaudadoBrutoCuotas: totalPagadoBruto,
        progresoCuotas
      }
    })

    return resultado
  }

  return {
    natilleras,
    natillerasCompartidas,
    natilleraActual,
    loading,
    error,
    natillerasActivas,
    natillerasCompartidasActivas,
    todasLasNatilleras,
    totalNatilleras,
    totalNatillerasCompartidas,
    fetchNatilleras,
    fetchNatillerasCompartidas,
    fetchTodasLasNatilleras,
    fetchNatillera,
    crearNatillera,
    actualizarNatillera,
    cerrarNatillera,
    reasignarNatillera,
    eliminarNatillera,
    calcularEstadisticas,
    calcularEstadisticasParaDashboard,
    clasificarYGuardarUtilidades
  }
})

