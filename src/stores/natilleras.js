import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'

export const useNatillerasStore = defineStore('natilleras', () => {
  const natilleras = ref([])
  const natilleraActual = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const natillerasActivas = computed(() => 
    natilleras.value.filter(n => n.estado === 'activa')
  )

  const totalNatilleras = computed(() => natilleras.value.length)

  async function fetchNatilleras() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('natilleras')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Para cada natillera, obtener el conteo de socios
      const natillerasConConteo = await Promise.all(
        (data || []).map(async (natillera) => {
          const { count } = await supabase
            .from('socios_natillera')
            .select('*', { count: 'exact', head: true })
            .eq('natillera_id', natillera.id)
          
          return {
            ...natillera,
            socios_count: count || 0
          }
        })
      )

      natilleras.value = natillerasConConteo
    } catch (e) {
      error.value = e.message
      console.error('Error cargando natilleras:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchNatillera(id) {
    try {
      loading.value = true
      error.value = null

      console.log('Buscando natillera con ID:', id)

      // Primero obtener la natillera básica
      const { data, error: fetchError } = await supabase
        .from('natilleras')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Resultado:', { data, error: fetchError })

      if (fetchError) throw fetchError

      // Obtener socios de la natillera
      const { data: sociosData } = await supabase
        .from('socios_natillera')
        .select(`
          *,
          socio:socios(*)
        `)
        .eq('natillera_id', id)

      // Obtener actividades
      const { data: actividadesData } = await supabase
        .from('actividades')
        .select('*')
        .eq('natillera_id', id)

      // Obtener cuotas de la natillera (a través de socios_natillera)
      let cuotasData = []
      if (sociosData && sociosData.length > 0) {
        const socioNatilleraIds = sociosData.map(s => s.id)
        const { data: cuotasResult } = await supabase
          .from('cuotas')
          .select('*')
          .in('socio_natillera_id', socioNatilleraIds)
        cuotasData = cuotasResult || []
      }

      // Combinar datos
      natilleraActual.value = {
        ...data,
        socios_natillera: sociosData || [],
        actividades: actividadesData || [],
        cuotas: cuotasData
      }
      
      console.log('=== NATILLERA CARGADA ===')
      console.log('Socios:', sociosData?.length || 0)
      console.log('Cuotas:', cuotasData?.length || 0, cuotasData)
      console.log('Actividades:', actividadesData?.length || 0)
      console.log('=========================')
      
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
      
      const { data, error: createError } = await supabase
        .from('natilleras')
        .insert({
          ...datos,
          admin_id: user.id,
          estado: 'activa'
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

      console.log('Verificación de permisos:', {
        email: emailUsuario,
        esSuperUsuario,
        esAdmin,
        admin_id: natilleraData.admin_id,
        user_id: user.id
      })

      if (!esSuperUsuario && !esAdmin) {
        throw new Error('No tienes permisos para eliminar esta natillera. Solo el administrador puede eliminarla.')
      }

      // Eliminar la natillera (esto activará la eliminación en cascada)
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

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrarEliminacion(
        'natillera',
        id,
        `Se eliminó la natillera "${natilleraData.nombre}" y todos sus registros relacionados`,
        natilleraData,
        id,
        { 
          eliminacion_cascada: true,
          registros_eliminados: 'socios_natillera, cuotas, prestamos, multas, actividades, historial, auditoria'
        }
      ))

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

    const socios = natillera.socios_natillera || []
    const cuotas = natillera.cuotas || []
    const actividades = natillera.actividades || []

    console.log('=== DEBUG ESTADISTICAS ===')
    console.log('Cuotas encontradas:', cuotas.length)
    console.log('Cuotas:', cuotas)
    
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada')
    console.log('Cuotas pagadas:', cuotasPagadas.length, cuotasPagadas)

    // Obtener configuración de sanciones para calcular sanciones pendientes
    let configSanciones = null
    let sancionesDinamicas = {}
    try {
      const { data: natilleraData } = await supabase
        .from('natilleras')
        .select('reglas_multas')
        .eq('id', natillera.id)
        .single()
      
      configSanciones = natilleraData?.reglas_multas?.sanciones || null
      
      // Calcular sanciones dinámicas para cuotas en mora si las sanciones están activas
      if (configSanciones?.activa) {
        const cuotasMoraPorSocio = {}
        cuotas.filter(c => c.estado === 'mora').forEach(c => {
          cuotasMoraPorSocio[c.socio_natillera_id] = (cuotasMoraPorSocio[c.socio_natillera_id] || 0) + 1
        })

        // Calcular multa base
        function calcularMulta(cantidadCuotasMora = 1) {
          let multa = 0
          if (configSanciones.tipo === 'simple') {
            multa = configSanciones.valorFijo || 0
          } else if (configSanciones.tipo === 'escalonada') {
            const niveles = configSanciones.niveles || []
            const nivelesOrdenados = [...niveles].sort((a, b) => b.cuotas - a.cuotas)
            for (const nivel of nivelesOrdenados) {
              if (cantidadCuotasMora >= nivel.cuotas) {
                multa = nivel.valor || 0
                break
              }
            }
            if (multa === 0 && niveles.length > 0) {
              multa = niveles[0].valor || 0
            }
          }
          return multa
        }

        // Calcular sanciones dinámicas para cada cuota en mora
        cuotas.filter(c => c.estado === 'mora').forEach(cuota => {
          const cantidadMora = cuotasMoraPorSocio[cuota.socio_natillera_id] || 1
          let multaBase = calcularMulta(cantidadMora)
          
          // Calcular intereses adicionales por días de mora
          let interesesAdicionales = 0
          if (cuota.fecha_limite && configSanciones.interesesAdicionales?.activo) {
            const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
            const fechaLimite = new Date(anio, mes - 1, dia)
            fechaLimite.setHours(0, 0, 0, 0)
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            const diasEnMora = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24))
            
            if (diasEnMora > 0) {
              const diasParaInteres = configSanciones.interesesAdicionales.dias || 2
              const valorInteres = configSanciones.interesesAdicionales.valor || 0
              if (diasParaInteres > 0 && valorInteres > 0) {
                const periodosInteres = Math.floor(diasEnMora / diasParaInteres)
                interesesAdicionales = periodosInteres * valorInteres
              }
            }
          }
          
          sancionesDinamicas[cuota.id] = multaBase + interesesAdicionales
        })
      }
    } catch (e) {
      console.error('Error obteniendo configuración de sanciones:', e)
    }

    // Calcular totalAportado: solo el valor de las cuotas normales, sin incluir sanciones
    // Las sanciones ya se cuentan en utilidadesRecogidas
    const totalAportado = cuotas
      .filter(c => c.estado === 'pagada')
      .reduce((sum, c) => {
        const valorPagado = c.valor_pagado || 0
        const sancionPagada = c.valor_multa || 0
        // Restar la sanción del valor pagado para obtener solo la cuota normal
        return sum + (valorPagado - sancionPagada)
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

    const utilidadActividades = actividades
      .reduce((sum, a) => sum + (a.utilidad || 0), 0)

    // Calcular utilidades recogidas:
    // 1. Sanciones de cuotas pagadas (solo las que ya fueron pagadas)
    const sancionesPagadas = cuotas
      .filter(c => c.estado === 'pagada' && c.valor_multa)
      .reduce((sum, c) => sum + (c.valor_multa || 0), 0)

    // 2. Intereses de préstamos (pagados y activos con pagos realizados)
    let interesesPrestamos = 0
    if (natillera.id) {
      try {
        // Obtener los IDs de socios_natillera de esta natillera
        const { data: sociosNatillera } = await supabase
          .from('socios_natillera')
          .select('id')
          .eq('natillera_id', natillera.id)

        if (sociosNatillera && sociosNatillera.length > 0) {
          const socioNatilleraIds = sociosNatillera.map(s => s.id)
          
          // Obtener TODOS los préstamos (pagados y activos)
          const { data: prestamos } = await supabase
            .from('prestamos')
            .select('id, monto, saldo_actual, interes, interes_anticipado, interes_total')
            .in('socio_natillera_id', socioNatilleraIds)
            .in('estado', ['pagado', 'activo'])

          if (prestamos && prestamos.length > 0) {
            // Usar el mismo cálculo que en Prestamos.vue (totalIntereses computed):
            // Si es interés anticipado, usar el interés_total guardado (ya se cobró al inicio)
            // Si es interés mes vencido, calcular basado en lo pagado
            interesesPrestamos = prestamos.reduce((sum, prestamo) => {
              // Si es interés anticipado, usar el interés_total guardado (ya se cobró al inicio)
              if (prestamo.interes_anticipado && prestamo.interes_total) {
                return sum + (parseFloat(prestamo.interes_total) || 0)
              }
              // Si es interés mes vencido, calcular basado en lo pagado
              const monto = parseFloat(prestamo.monto || 0)
              const saldoActual = parseFloat(prestamo.saldo_actual || 0)
              const interes = parseFloat(prestamo.interes || 0)
              const interesGenerado = (monto - saldoActual) * (interes / 100)
              return sum + interesGenerado
            }, 0)
          }
        }
      } catch (e) {
        console.error('Error calculando intereses de préstamos:', e)
      }
    }

    // 3. Utilidad de actividades (ya calculada arriba)
    const utilidadesRecogidas = sancionesPagadas + interesesPrestamos + utilidadActividades

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

    console.log('Total aportado (sin sanciones):', totalAportado)
    console.log('Total pendiente (con sanciones):', totalPendiente)
    console.log('Sanciones pendientes incluidas:', sancionesPendientesTotal)
    console.log('Sanciones pagadas:', sancionesPagadas)
    console.log('Intereses préstamos:', interesesPrestamos)
    console.log('Utilidad actividades:', utilidadActividades)
    console.log('Utilidades recogidas total:', utilidadesRecogidas)
    console.log('=== FIN DEBUG ===')

    return {
      totalSocios: socios.length,
      sociosActivos: socios.filter(s => s.estado === 'activo').length,
      totalAportado,
      totalPendiente,
      utilidadActividades,
      utilidadesRecogidas,
      fondoTotal: totalAportado + utilidadesRecogidas
    }
  }

  return {
    natilleras,
    natilleraActual,
    loading,
    error,
    natillerasActivas,
    totalNatilleras,
    fetchNatilleras,
    fetchNatillera,
    crearNatillera,
    actualizarNatillera,
    cerrarNatillera,
    reasignarNatillera,
    eliminarNatillera,
    calcularEstadisticas
  }
})

