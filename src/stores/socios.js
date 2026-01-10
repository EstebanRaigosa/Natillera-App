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

  async function verificarTelefonoUnico(telefono, excluirSocioId = null) {
    try {
      if (!telefono || telefono.trim() === '') {
        return false // No válido si está vacío
      }

      const telefonoLimpio = telefono.trim()
      
      let query = supabase
        .from('socios')
        .select('id')
        .eq('telefono', telefonoLimpio)

      // Si estamos editando, excluir el socio actual
      if (excluirSocioId) {
        query = query.neq('id', excluirSocioId)
      }

      const { data, error } = await query.maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 es "not found", que es lo esperado
        throw error
      }

      // Si data es null, el teléfono es único (no existe)
      // Si data existe, el teléfono ya está en uso
      return data === null
    } catch (e) {
      console.error('Error verificando unicidad del teléfono:', e)
      return false // En caso de error, asumir que no es único
    }
  }

  async function agregarSocio(natilleraId, datosSocio, valorCuota, periodicidad = 'mensual') {
    try {
      loading.value = true
      error.value = null

      // VALIDACIÓN CRÍTICA: Asegurar que valorCuota sea un número y se guarde exactamente como se ingresa
      let valorCuotaFinal = valorCuota
      if (typeof valorCuota === 'string') {
        // Si es string, limpiar y convertir a número
        valorCuotaFinal = parseFloat(valorCuota.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
      } else {
        valorCuotaFinal = Number(valorCuota) || 0
      }
      
      // Validar que el valor sea positivo
      if (valorCuotaFinal <= 0) {
        throw new Error('El valor de la cuota debe ser mayor a cero')
      }
      
      // VALIDACIÓN CRÍTICA: Asegurar que la periodicidad sea válida
      const periodicidadFinal = periodicidad === 'quincenal' ? 'quincenal' : 'mensual'
      
      // IMPORTANTE: El valor debe guardarse exactamente como se ingresa, sin modificaciones
      console.log('💰 Valor de cuota recibido:', valorCuota, 'Tipo:', typeof valorCuota)
      console.log('💰 Valor de cuota final a guardar:', valorCuotaFinal, 'Tipo:', typeof valorCuotaFinal)
      console.log('📅 Periodicidad recibida:', periodicidad, 'Tipo:', typeof periodicidad)
      console.log('📅 Periodicidad final a guardar:', periodicidadFinal)

      // Validar que el teléfono esté presente
      if (!datosSocio.telefono || datosSocio.telefono.trim() === '') {
        throw new Error('El número de teléfono es obligatorio')
      }

      const telefonoLimpio = datosSocio.telefono.trim()

      // Verificar unicidad del teléfono
      const telefonoUnico = await verificarTelefonoUnico(telefonoLimpio)
      if (!telefonoUnico) {
        throw new Error('Este número de teléfono ya está registrado para otro socio')
      }

      // Generar documento automático si no se proporciona
      const documento = datosSocio.documento || `AUTO-${Date.now()}`
      
      // Preparar datos del socio
      const socioData = {
        nombre: datosSocio.nombre,
        documento: documento,
        telefono: telefonoLimpio, // Siempre requerido ahora
        email: datosSocio.email || null,
        avatar_seed: datosSocio.avatar_seed || null,
        avatar_style: datosSocio.avatar_style || 'adventurer'
      }

      // Primero crear o buscar el socio
      let socioId
      
      // Buscar si el socio ya existe por documento o email (pero el teléfono ya está validado como único)
      let socioExistente = null
      
      if (datosSocio.documento && datosSocio.documento.trim() !== '' && !datosSocio.documento.startsWith('AUTO-')) {
        // Si tiene documento, buscar por documento
        const { data } = await supabase
          .from('socios')
          .select('id')
          .eq('documento', datosSocio.documento)
          .maybeSingle()
        socioExistente = data
      } else if (datosSocio.email && datosSocio.email.trim() !== '') {
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
        
        // Verificar que el teléfono del socio existente no esté siendo usado por otro
        // Si el socio existente tiene un teléfono diferente, verificar que el nuevo sea único
        const { data: socioActual } = await supabase
          .from('socios')
          .select('telefono')
          .eq('id', socioId)
          .single()

        // Si el teléfono es diferente, verificar unicidad nuevamente
        if (socioActual?.telefono !== telefonoLimpio) {
          const telefonoUnicoParaActualizacion = await verificarTelefonoUnico(telefonoLimpio, socioId)
          if (!telefonoUnicoParaActualizacion) {
            throw new Error('Este número de teléfono ya está registrado para otro socio')
          }
        }
        
        // Actualizar datos del socio existente
        const datosActualizar = {
          nombre: datosSocio.nombre,
          telefono: telefonoLimpio, // Siempre actualizar el teléfono
        }
        if (datosSocio.email) datosActualizar.email = datosSocio.email
        if (datosSocio.avatar_seed) datosActualizar.avatar_seed = datosSocio.avatar_seed
        if (datosSocio.avatar_style) datosActualizar.avatar_style = datosSocio.avatar_style
        
        const { error: updateError } = await supabase
          .from('socios')
          .update(datosActualizar)
          .eq('id', socioId)

        if (updateError) {
          // Verificar si es error de unicidad
          if (updateError.code === '23505' || updateError.message?.includes('unique') || updateError.message?.includes('duplicate')) {
            throw new Error('Este número de teléfono ya está registrado para otro socio')
          }
          throw updateError
        }
      } else {
        // Crear nuevo socio
        const { data: nuevoSocio, error: socioError } = await supabase
          .from('socios')
          .insert(socioData)
          .select()
          .single()

        if (socioError) {
          // Verificar si es error de unicidad
          if (socioError.code === '23505' || socioError.message?.includes('unique') || socioError.message?.includes('duplicate')) {
            throw new Error('Este número de teléfono ya está registrado para otro socio')
          }
          throw socioError
        }
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
      // IMPORTANTE: Guardar el valor exactamente como se recibió, sin modificaciones por periodicidad
      console.log('💾 Guardando en BD - valor_cuota_individual:', valorCuotaFinal)
      console.log('💾 Guardando en BD - periodicidad:', periodicidadFinal)
      const datosInsert = {
        natillera_id: natilleraId,
        socio_id: socioId,
        valor_cuota_individual: valorCuotaFinal, // Valor exacto sin modificaciones
        periodicidad: periodicidadFinal, // Usar la periodicidad validada
        estado: 'activo',
        fecha_ingreso: new Date().toISOString()
      }
      console.log('💾 Datos completos a insertar:', datosInsert)
      
      const { data, error: vincularError } = await supabase
        .from('socios_natillera')
        .insert(datosInsert)
        .select(`
          *,
          socio:socios(*)
        `)
        .single()

      if (vincularError) {
        console.error('❌ Error al guardar socio en natillera:', vincularError)
        throw vincularError
      }
      
      // Verificar que el valor y periodicidad guardados sean correctos
      console.log('✅ Socio guardado exitosamente')
      console.log('✅ Valor guardado en BD (valor_cuota_individual):', data.valor_cuota_individual)
      console.log('✅ Periodicidad guardada en BD:', data.periodicidad)
      console.log('✅ Datos completos del socio guardado:', data)
      
      // Verificar que el valor no haya cambiado
      if (Number(data.valor_cuota_individual) !== valorCuotaFinal) {
        console.error('⚠️ ADVERTENCIA: El valor guardado difiere del valor enviado!')
        console.error('⚠️ Valor enviado:', valorCuotaFinal)
        console.error('⚠️ Valor guardado:', data.valor_cuota_individual)
      }
      
      // Verificar que la periodicidad no haya cambiado
      if (data.periodicidad !== periodicidadFinal) {
        console.error('⚠️ ADVERTENCIA: La periodicidad guardada difiere de la enviada!')
        console.error('⚠️ Periodicidad enviada:', periodicidadFinal)
        console.error('⚠️ Periodicidad guardada:', data.periodicidad)
      }

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

      // Validar que el teléfono esté presente si se está actualizando
      if (datos.telefono !== undefined) {
        if (!datos.telefono || datos.telefono.trim() === '') {
          throw new Error('El número de teléfono es obligatorio')
        }

        const telefonoLimpio = datos.telefono.trim()
        
        // Verificar unicidad del teléfono (excluyendo el socio actual)
        const telefonoUnico = await verificarTelefonoUnico(telefonoLimpio, socioId)
        if (!telefonoUnico) {
          throw new Error('Este número de teléfono ya está registrado para otro socio')
        }

        datos.telefono = telefonoLimpio
      }

      // Actualizar los datos
      const { error: updateError } = await supabase
        .from('socios')
        .update(datos)
        .eq('id', socioId)

      if (updateError) {
        // Verificar si es error de unicidad
        if (updateError.code === '23505' || updateError.message?.includes('unique') || updateError.message?.includes('duplicate')) {
          throw new Error('Este número de teléfono ya está registrado para otro socio')
        }
        throw updateError
      }

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

      // Obtener IDs de cuotas y préstamos relacionados para eliminar historiales
      const { data: cuotas } = await supabase
        .from('cuotas')
        .select('id')
        .eq('socio_natillera_id', socioNatilleraId)

      const { data: prestamos } = await supabase
        .from('prestamos')
        .select('id')
        .eq('socio_natillera_id', socioNatilleraId)

      const cuotaIds = cuotas?.map(c => c.id) || []
      const prestamoIds = prestamos?.map(p => p.id) || []

      // Obtener IDs de pagos de préstamos
      const { data: pagosPrestamo } = await supabase
        .from('pagos_prestamo')
        .select('id')
        .in('prestamo_id', prestamoIds)

      const pagoPrestamoIds = pagosPrestamo?.map(p => p.id) || []

      // Eliminar explícitamente los historiales de comprobantes
      // Historial de comprobantes de cuotas
      if (cuotaIds.length > 0) {
        const { error: errorHistorialCuotas } = await supabase
          .from('historial_comprobantes')
          .delete()
          .in('cuota_id', cuotaIds)
        
        if (errorHistorialCuotas) {
          console.warn('Advertencia al eliminar historial de comprobantes de cuotas:', errorHistorialCuotas)
        }
      }

      // Historial de comprobantes de préstamos
      if (pagoPrestamoIds.length > 0) {
        const { error: errorHistorialPrestamos } = await supabase
          .from('historial_comprobantes_prestamo')
          .delete()
          .in('pago_prestamo_id', pagoPrestamoIds)
        
        if (errorHistorialPrestamos) {
          console.warn('Advertencia al eliminar historial de comprobantes de préstamos:', errorHistorialPrestamos)
        }
      }

      // También eliminar por socio_natillera_id (por si acaso)
      const { error: errorHistorialSocio } = await supabase
        .from('historial_comprobantes_prestamo')
        .delete()
        .eq('socio_natillera_id', socioNatilleraId)
      
      if (errorHistorialSocio) {
        console.warn('Advertencia al eliminar historial por socio_natillera_id:', errorHistorialSocio)
      }

      // Eliminar el socio_natillera (esto activará la eliminación en cascada de cuotas, préstamos, multas, pagos_prestamo)
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
        `Se eliminó el socio "${nombreSocio}" de la natillera y todos sus registros relacionados (cuotas, préstamos, multas, historiales)`,
        socioNatilleraData,
        natilleraId,
        { 
          eliminacion_cascada: true,
          registros_eliminados: 'cuotas, prestamos, multas, pagos_prestamo, historial_comprobantes, historial_comprobantes_prestamo',
          cuotas_eliminadas: cuotaIds.length,
          prestamos_eliminados: prestamoIds.length,
          pagos_eliminados: pagoPrestamoIds.length
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
    verificarTelefonoUnico,
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

