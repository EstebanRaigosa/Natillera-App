import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'
import { useCuotasStore } from './cuotas'

export const useSociosStore = defineStore('socios', () => {
  const socios = ref([])
  const sociosNatillera = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchSociosNatillera(natilleraId) {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('socios_natillera')
        .select(`
          *,
          socio:socios(*),
          cuotas(*)
        `)
        .eq('natillera_id', natilleraId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      sociosNatillera.value = data || []
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error cargando socios:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function agregarSocio(natilleraId, datosSocio, valorCuota, periodicidad = 'mensual') {
    try {
      loading.value = true
      error.value = null

      // Generar documento automático si no se proporciona
      const documento = datosSocio.documento || `AUTO-${Date.now()}`
      
      // Preparar datos del socio (campos opcionales pueden ser null)
      const socioData = {
        nombre: datosSocio.nombre,
        documento: documento,
        telefono: datosSocio.telefono || null,
        email: datosSocio.email || null,
        avatar_seed: datosSocio.avatar_seed || null,
        avatar_style: datosSocio.avatar_style || 'adventurer'
      }

      // Primero crear o buscar el socio
      let socioId
      
      // Buscar si el socio ya existe por nombre (si no hay documento real)
      let socioExistente = null
      
      if (datosSocio.documento) {
        // Si tiene documento, buscar por documento
        const { data } = await supabase
          .from('socios')
          .select('id')
          .eq('documento', datosSocio.documento)
          .maybeSingle()
        socioExistente = data
      } else if (datosSocio.email) {
        // Si tiene email, buscar por email
        const { data } = await supabase
          .from('socios')
          .select('id')
          .eq('email', datosSocio.email)
          .maybeSingle()
        socioExistente = data
      }

      if (socioExistente) {
        socioId = socioExistente.id
        
        // Actualizar datos del socio existente si hay nuevos datos
        const datosActualizar = {}
        if (datosSocio.telefono) datosActualizar.telefono = datosSocio.telefono
        if (datosSocio.email) datosActualizar.email = datosSocio.email
        if (datosSocio.avatar_seed) datosActualizar.avatar_seed = datosSocio.avatar_seed
        if (datosSocio.avatar_style) datosActualizar.avatar_style = datosSocio.avatar_style
        if (datosSocio.nombre) datosActualizar.nombre = datosSocio.nombre
        
        if (Object.keys(datosActualizar).length > 0) {
          await supabase
            .from('socios')
            .update(datosActualizar)
            .eq('id', socioId)
        }
      } else {
        // Crear nuevo socio
        const { data: nuevoSocio, error: socioError } = await supabase
          .from('socios')
          .insert(socioData)
          .select()
          .single()

        if (socioError) throw socioError
        socioId = nuevoSocio.id
      }

      // Verificar si ya está en la natillera
      const { data: yaEnNatillera } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', natilleraId)
        .eq('socio_id', socioId)
        .maybeSingle()

      if (yaEnNatillera) {
        throw new Error('Este socio ya está registrado en la natillera')
      }

      // Agregar a la natillera
      const { data, error: vincularError } = await supabase
        .from('socios_natillera')
        .insert({
          natillera_id: natilleraId,
          socio_id: socioId,
          valor_cuota_individual: valorCuota,
          periodicidad: periodicidad,
          estado: 'activo',
          fecha_ingreso: new Date().toISOString()
        })
        .select(`
          *,
          socio:socios(*)
        `)
        .single()

      if (vincularError) throw vincularError

      sociosNatillera.value.push(data)
      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function actualizarSocioNatillera(id, datos) {
    try {
      loading.value = true
      error.value = null

      console.log('🔵 actualizarSocioNatillera - Iniciando actualización')
      console.log('🔵 ID del socio_natillera:', id)
      console.log('🔵 Datos a actualizar:', datos)

      // Validar que los datos no estén vacíos
      if (!datos || Object.keys(datos).length === 0) {
        throw new Error('No se proporcionaron datos para actualizar')
      }

      // Obtener datos anteriores para auditoría
      const { data: datosAnteriores, error: fetchAnterioresError } = await supabase
        .from('socios_natillera')
        .select(`
          *,
          socio:socios(*)
        `)
        .eq('id', id)
        .maybeSingle()

      if (fetchAnterioresError) {
        console.error('❌ Error obteniendo datos anteriores:', fetchAnterioresError)
        throw fetchAnterioresError
      }
      
      if (!datosAnteriores) {
        console.error('❌ No se encontró el socio en la natillera con ID:', id)
        throw new Error('No se encontró el socio en la natillera')
      }

      console.log('✅ Datos anteriores obtenidos:', datosAnteriores)

      // Preparar los datos para el update, asegurando que los valores sean del tipo correcto
      const datosParaUpdate = { ...datos }
      
      // Asegurar que valor_cuota_individual sea un número si existe
      if (datosParaUpdate.valor_cuota_individual !== undefined) {
        datosParaUpdate.valor_cuota_individual = Number(datosParaUpdate.valor_cuota_individual)
        if (isNaN(datosParaUpdate.valor_cuota_individual)) {
          throw new Error('El valor de la cuota debe ser un número válido')
        }
      }

      console.log('🔵 Datos preparados para UPDATE:', datosParaUpdate)

      // Actualizar los datos con .select() para verificar que se actualizó
      const { data: dataUpdate, error: updateError } = await supabase
        .from('socios_natillera')
        .update(datosParaUpdate)
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('❌ Error en UPDATE:', updateError)
        throw updateError
      }

      console.log('✅ UPDATE ejecutado. Filas afectadas:', dataUpdate?.length || 0)

      if (!dataUpdate || dataUpdate.length === 0) {
        console.error('❌ No se actualizó ninguna fila. Verificar permisos RLS o que el ID sea correcto')
        throw new Error('No se pudo actualizar el registro. Verifica los permisos o que el registro exista.')
      }

      // Obtener los datos actualizados completos con relaciones
      const { data, error: fetchError } = await supabase
        .from('socios_natillera')
        .select(`
          *,
          socio:socios(*)
        `)
        .eq('id', id)
        .maybeSingle()

      if (fetchError) {
        console.error('❌ Error obteniendo datos actualizados:', fetchError)
        throw fetchError
      }
      
      if (!data) {
        console.error('❌ No se pudieron obtener los datos actualizados después del UPDATE')
        throw new Error('No se pudo obtener los datos actualizados del socio')
      }

      console.log('✅ Datos actualizados obtenidos:', data)

      const index = sociosNatillera.value.findIndex(s => s.id === id)
      if (index !== -1) {
        // Actualizar el objeto completo para mantener la reactividad
        Object.assign(sociosNatillera.value[index], data)
      } else {
        // Si no existe, agregarlo
        sociosNatillera.value.push(data)
      }

      // Actualizar también las referencias en las cuotas ya cargadas
      const cuotasStore = useCuotasStore()
      cuotasStore.actualizarSocioNatilleraEnCuotas(id, data)

      // Si se cambió el valor_cuota_individual, actualizar todas las cuotas pendientes
      if (datosParaUpdate.valor_cuota_individual !== undefined) {
        // Comparar como números para evitar problemas de tipo
        const valorAnterior = Number(datosAnteriores.valor_cuota_individual || 0)
        const valorNuevo = Number(datosParaUpdate.valor_cuota_individual || 0)
        
        if (valorAnterior !== valorNuevo) {
          console.log('🔄 Valor de cuota cambió. Actualizando cuotas pendientes...')
          console.log(`🔄 Cambio: $${valorAnterior} -> $${valorNuevo}`)
          
          // Actualizar todas las cuotas pendientes del socio
          const resultActualizarCuotas = await cuotasStore.actualizarCuotasPorCambioValorCuota(
            id, 
            valorNuevo
          )
          
          if (resultActualizarCuotas.success) {
            console.log(`✅ ${resultActualizarCuotas.cuotasActualizadas} cuotas actualizadas exitosamente`)
          } else {
            console.error('⚠️ Error actualizando cuotas:', resultActualizarCuotas.error)
            // No lanzar error aquí, solo loguear, para no bloquear la actualización del socio
          }
        } else {
          console.log('ℹ️ El valor de cuota no cambió, no se actualizarán las cuotas')
        }
      }

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      const nombreSocio = data.socio?.nombre || datosAnteriores?.socio?.nombre || 'Socio'
      // La descripción se generará automáticamente con los detalles de los cambios
      registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
        'socio_natillera',
        id,
        null, // null para generar descripción automática
        datosAnteriores,
        data,
        datosAnteriores?.natillera_id || data.natillera_id,
        { campos_modificados: Object.keys(datos) }
      ))

      console.log('✅ actualizarSocioNatillera - Actualización completada exitosamente')
      return { success: true, data }
    } catch (e) {
      console.error('❌ actualizarSocioNatillera - Error:', e)
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function cambiarEstadoSocio(id, estado) {
    return actualizarSocioNatillera(id, { estado })
  }

  async function actualizarDatosSocio(socioId, datos, natilleraId = null) {
    try {
      // Obtener datos anteriores para auditoría
      const { data: datosAnteriores, error: fetchAnterioresError } = await supabase
        .from('socios')
        .select('*')
        .eq('id', socioId)
        .maybeSingle()

      if (fetchAnterioresError) throw fetchAnterioresError
      if (!datosAnteriores) {
        throw new Error('No se encontró el socio')
      }

      // Actualizar los datos
      const { error: updateError } = await supabase
        .from('socios')
        .update(datos)
        .eq('id', socioId)

      if (updateError) throw updateError

      // Obtener los datos actualizados
      const { data, error: fetchError } = await supabase
        .from('socios')
        .select('*')
        .eq('id', socioId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!data) {
        throw new Error('No se pudo obtener los datos actualizados del socio')
      }

      // Actualizar la referencia en sociosNatillera local
      sociosNatillera.value.forEach(socioNatillera => {
        if (socioNatillera.socio_id === socioId) {
          socioNatillera.socio = data
        }
      })

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      // La descripción se generará automáticamente con los detalles de los cambios
      registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
        'socio',
        socioId,
        null, // null para generar descripción automática
        datosAnteriores,
        data,
        natilleraId,
        { campos_modificados: Object.keys(datos) }
      ))

      return { success: true, data }
    } catch (e) {
      console.error('Error actualizando socio:', e)
      return { success: false, error: e.message }
    }
  }

  async function actualizarCuotaSocio(id, valorCuota) {
    return actualizarSocioNatillera(id, { valor_cuota_individual: valorCuota })
  }

  function calcularEstadoSocio(socioNatillera) {
    const cuotas = socioNatillera.cuotas || []
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada').length
    const cuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').length
    const cuotasMora = cuotas.filter(c => c.estado === 'mora').length
    
    const totalAportado = cuotas
      .reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    
    const totalPendiente = cuotas
      .filter(c => c.estado !== 'pagada')
      .reduce((sum, c) => sum + (c.valor_cuota - (c.valor_pagado || 0)), 0)

    return {
      cuotasPagadas,
      cuotasPendientes,
      cuotasMora,
      totalAportado,
      totalPendiente,
      alDia: cuotasMora === 0 && cuotasPendientes === 0
    }
  }

  async function obtenerResumenSocio(socioNatilleraId) {
    try {
      console.log('=== OBTENIENDO RESUMEN SOCIO ===')
      console.log('socio_natillera_id:', socioNatilleraId)
      
      // Obtener TODAS las cuotas del socio en esta natillera (sin filtro de año)
      // Usar paginación para asegurar que se obtengan todas las cuotas
      let todasLasCuotas = []
      let desde = 0
      const limitePorPagina = 1000
      let hayMas = true
      
      while (hayMas) {
        const { data: cuotas, error: fetchError } = await supabase
          .from('cuotas')
          .select('*')
          .eq('socio_natillera_id', socioNatilleraId)
          .order('fecha_limite', { ascending: true })
          .range(desde, desde + limitePorPagina - 1)
        
        if (fetchError) throw fetchError
        
        if (cuotas && cuotas.length > 0) {
          todasLasCuotas = [...todasLasCuotas, ...cuotas]
          desde += limitePorPagina
          hayMas = cuotas.length === limitePorPagina // Si obtuvimos menos que el límite, no hay más
        } else {
          hayMas = false
        }
      }

      console.log('Cuotas encontradas:', todasLasCuotas.length)
      console.log('Cuotas:', todasLasCuotas.map(c => ({
        id: c.id,
        fecha_limite: c.fecha_limite,
        mes: c.mes,
        anio: c.anio,
        estado: c.estado,
        valor_cuota: c.valor_cuota
      })))
      console.log('================================')

      return {
        cuotas: todasLasCuotas,
        success: true
      }
    } catch (e) {
      console.error('Error obteniendo resumen del socio:', e)
      return {
        cuotas: [],
        success: false,
        error: e.message
      }
    }
  }

  // Eliminar socio de una natillera (elimina socios_natillera y en cascada cuotas, préstamos, etc.)
  async function eliminarSocioNatillera(socioNatilleraId) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos del socio_natillera antes de eliminar para auditoría
      const { data: socioNatilleraData } = await supabase
        .from('socios_natillera')
        .select(`
          *,
          socio:socios(*),
          natillera:natilleras(*)
        `)
        .eq('id', socioNatilleraId)
        .single()

      if (!socioNatilleraData) {
        throw new Error('Socio no encontrado en la natillera')
      }

      const natilleraId = socioNatilleraData.natillera_id
      const nombreSocio = socioNatilleraData.socio?.nombre || 'Socio'

      // Eliminar el socio_natillera (esto activará la eliminación en cascada)
      const { error: deleteError } = await supabase
        .from('socios_natillera')
        .delete()
        .eq('id', socioNatilleraId)

      if (deleteError) throw deleteError

      // Remover de la lista local
      sociosNatillera.value = sociosNatillera.value.filter(s => s.id !== socioNatilleraId)

      // Registrar auditoría (en segundo plano)
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrarEliminacion(
        'socio_natillera',
        socioNatilleraId,
        `Se eliminó el socio "${nombreSocio}" de la natillera y todos sus registros relacionados (cuotas, préstamos, multas)`,
        socioNatilleraData,
        natilleraId,
        { 
          eliminacion_cascada: true,
          registros_eliminados: 'cuotas, prestamos, multas, pagos_prestamo, historial_comprobantes'
        }
      ))

      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('Error eliminando socio:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    socios,
    sociosNatillera,
    loading,
    error,
    fetchSociosNatillera,
    agregarSocio,
    actualizarSocioNatillera,
    actualizarDatosSocio,
    cambiarEstadoSocio,
    actualizarCuotaSocio,
    calcularEstadoSocio,
    obtenerResumenSocio,
    eliminarSocioNatillera
  }
})

