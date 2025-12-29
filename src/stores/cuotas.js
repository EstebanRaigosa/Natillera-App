import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria } from '../composables/useAuditoria'

export const useCuotasStore = defineStore('cuotas', () => {
  const cuotas = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCuotasNatillera(natilleraId) {
    try {
      loading.value = true
      error.value = null

      // Primero obtener los IDs de socios_natillera de esta natillera
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, socio:socios(*)')
        .eq('natillera_id', natilleraId)

      if (sociosError) throw sociosError

      if (!sociosNatillera || sociosNatillera.length === 0) {
        cuotas.value = []
        return []
      }

      const socioNatilleraIds = sociosNatillera.map(s => s.id)

      // Obtener las cuotas de esos socios
      const { data, error: fetchError } = await supabase
        .from('cuotas')
        .select('*')
        .in('socio_natillera_id', socioNatilleraIds)
        .order('fecha_limite', { ascending: true })

      if (fetchError) throw fetchError

      // Combinar datos de cuotas con info del socio
      const cuotasConSocio = (data || []).map(cuota => {
        const socioNatillera = sociosNatillera.find(s => s.id === cuota.socio_natillera_id)
        return {
          ...cuota,
          socio_natillera: socioNatillera
        }
      })

      cuotas.value = cuotasConSocio
      
      // Actualizar automáticamente el estado de cuotas en mora
      await actualizarEstadoMoraAutomatico(cuotasConSocio)
      
      return cuotasConSocio
    } catch (e) {
      error.value = e.message
      console.error('Error cargando cuotas:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  // Función para actualizar automáticamente el estado de cuotas (programada -> pendiente -> mora)
  async function actualizarEstadoMoraAutomatico(cuotasLista = null) {
    try {
      const lista = cuotasLista || cuotas.value
      if (!lista || lista.length === 0) return

      // Obtener fecha actual (solo fecha, sin hora)
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)
      const fechaActualStr = fechaActual.toISOString().split('T')[0] // YYYY-MM-DD

      // Separar cuotas por estado a actualizar
      const cuotasAPendiente = [] // programada -> pendiente
      const cuotasAMora = [] // pendiente/parcial -> mora

      lista.forEach(cuota => {
        // Solo procesar cuotas que no estén pagadas
        if (cuota.estado === 'pagada') return

        const fechaVencimiento = cuota.fecha_vencimiento || cuota.fecha_limite
        const fechaLimite = cuota.fecha_limite

        if (!fechaVencimiento || !fechaLimite) return

        // Si está programada y la fecha actual >= fecha_vencimiento, pasa a pendiente
        if (cuota.estado === 'programada' && fechaActualStr >= fechaVencimiento) {
          cuotasAPendiente.push(cuota.id)
        }
        // Si está pendiente o parcial y la fecha actual > fecha_limite, pasa a mora
        else if ((cuota.estado === 'pendiente' || cuota.estado === 'parcial') && fechaActualStr > fechaLimite) {
          cuotasAMora.push(cuota.id)
        }
      })

      const actualizaciones = []

      // Actualizar cuotas a pendiente
      if (cuotasAPendiente.length > 0) {
        const { data: actualizadasPendiente, error: errorPendiente } = await supabase
          .from('cuotas')
          .update({ estado: 'pendiente' })
          .in('id', cuotasAPendiente)
          .select()

        if (errorPendiente) {
          console.error('Error actualizando cuotas a pendiente:', errorPendiente)
        } else if (actualizadasPendiente) {
          actualizaciones.push(...actualizadasPendiente)
        }
      }

      // Actualizar cuotas a mora
      if (cuotasAMora.length > 0) {
        const { data: actualizadasMora, error: errorMora } = await supabase
          .from('cuotas')
          .update({ estado: 'mora' })
          .in('id', cuotasAMora)
          .select()

        if (errorMora) {
          console.error('Error actualizando cuotas en mora:', errorMora)
        } else if (actualizadasMora) {
          actualizaciones.push(...actualizadasMora)
        }
      }

      // Actualizar el array local de cuotas
      if (actualizaciones.length > 0) {
        actualizaciones.forEach(cuotaActualizada => {
          const index = cuotas.value.findIndex(c => c.id === cuotaActualizada.id)
          if (index !== -1) {
            // Mantener la información del socio_natillera si existe
            const cuotaOriginal = cuotas.value[index]
            cuotas.value[index] = {
              ...cuotaActualizada,
              socio_natillera: cuotaOriginal.socio_natillera
            }
          }
        })
      }

      return { 
        success: true, 
        actualizadas: actualizaciones.length,
        aPendiente: cuotasAPendiente.length,
        aMora: cuotasAMora.length
      }
    } catch (e) {
      console.error('Error en actualizarEstadoMoraAutomatico:', e)
      return { success: false, error: e.message }
    }
  }

  async function generarCuotasPeriodo(natilleraId, fechasLimite, mesLabel = '', mes = null, anio = null, socioId = null) {
    try {
      loading.value = true
      error.value = null

      // Construir query para obtener socios activos
      let query = supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, periodicidad')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'activo')

      // Si se especifica un socioId, filtrar solo ese socio
      if (socioId) {
        query = query.eq('id', socioId)
      }

      const { data: sociosNatillera, error: sociosError } = await query

      if (sociosError) throw sociosError

      console.log('=== GENERANDO CUOTAS ===')
      console.log('SocioId filtro:', socioId)
      console.log('Socios encontrados:', sociosNatillera)
      console.log('Mes:', mes, 'Año:', anio)
      console.log('Fechas:', fechasLimite)

      if (!sociosNatillera || sociosNatillera.length === 0) {
        console.log('No hay socios activos para generar cuotas')
        return { success: false, error: socioId ? 'El socio seleccionado no está activo' : 'No hay socios activos en la natillera' }
      }

      // Para cada socio, verificar si ya tiene cuotas y actualizar o crear
      const cuotasActualizadas = []
      const cuotasACrear = []

      for (const socio of sociosNatillera) {
        const periodicidad = socio.periodicidad || 'mensual'
        
        if (periodicidad === 'quincenal') {
          // Buscar cuota de 1ra quincena específicamente
          const { data: cuotaQuincena1, error: fetchError1 } = await supabase
            .from('cuotas')
            .select('*')
            .eq('socio_natillera_id', socio.id)
            .eq('mes', mes)
            .eq('anio', anio)
            .eq('quincena', 1)
            .maybeSingle()

          if (fetchError1) throw fetchError1
          if (cuotaQuincena1) {
            // Actualizar cuota existente
            const fechaQuincena1 = typeof fechasLimite.quincena1 === 'object' 
              ? fechasLimite.quincena1 
              : { vencimiento: fechasLimite.quincena1, limite: fechasLimite.quincena1 }
            
            // Calcular nuevo estado basado en valor_pagado vs nuevo valor_cuota
            const valorPagado = cuotaQuincena1.valor_pagado || 0
            const nuevoValorCuota = socio.valor_cuota_individual
            
            let nuevoEstado = cuotaQuincena1.estado
            // Recalcular el estado basado en el nuevo valor de la cuota
            if (valorPagado >= nuevoValorCuota) {
              // Si lo pagado cubre o supera el nuevo valor, está pagada
              nuevoEstado = 'pagada'
            } else if (valorPagado > 0) {
              // Si hay un pago pero no cubre el nuevo valor, está parcial
              nuevoEstado = 'parcial'
            } else {
              // Si no hay pago, mantener el estado original o calcular según fecha
              const fechaActual = new Date()
              fechaActual.setHours(0, 0, 0, 0)
              const [year, month, day] = fechaQuincena1.vencimiento.split('-').map(Number)
              const fechaVencimiento = new Date(year, month - 1, day)
              fechaVencimiento.setHours(0, 0, 0, 0)
              nuevoEstado = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            }
            
            const { data: updated1, error: updateError1 } = await supabase
              .from('cuotas')
              .update({
                fecha_vencimiento: fechaQuincena1.vencimiento,
                fecha_limite: fechaQuincena1.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 1ra Quincena`
              })
              .eq('id', cuotaQuincena1.id)
              .select()
              .single()

            if (updateError1) throw updateError1
            cuotasActualizadas.push(updated1)
          } else {
            // Crear nueva cuota
            const fechaQuincena1 = typeof fechasLimite.quincena1 === 'object' 
              ? fechasLimite.quincena1 
              : { vencimiento: fechasLimite.quincena1, limite: fechasLimite.quincena1 }
            
            // Determinar estado inicial: programada si la fecha de vencimiento es futura
            // Usar solo la fecha sin hora para evitar problemas de zona horaria
            const fechaActual = new Date()
            fechaActual.setHours(0, 0, 0, 0)
            // Parsear la fecha manualmente para evitar problemas de zona horaria
            const [year, month, day] = fechaQuincena1.vencimiento.split('-').map(Number)
            const fechaVencimiento = new Date(year, month - 1, day)
            fechaVencimiento.setHours(0, 0, 0, 0)
            const estadoInicial = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: socio.valor_cuota_individual,
              valor_pagado: 0,
              fecha_vencimiento: fechaQuincena1.vencimiento,
              fecha_limite: fechaQuincena1.limite,
              mes: mes,
              anio: anio,
              quincena: 1,
              estado: estadoInicial,
              descripcion: `${mesLabel} - 1ra Quincena`
            })
          }

          // Buscar cuota de 2da quincena específicamente
          const { data: cuotaQuincena2, error: fetchError2 } = await supabase
            .from('cuotas')
            .select('*')
            .eq('socio_natillera_id', socio.id)
            .eq('mes', mes)
            .eq('anio', anio)
            .eq('quincena', 2)
            .maybeSingle()

          if (fetchError2) throw fetchError2
          if (cuotaQuincena2) {
            // Actualizar cuota existente
            const fechaQuincena2 = typeof fechasLimite.quincena2 === 'object' 
              ? fechasLimite.quincena2 
              : { vencimiento: fechasLimite.quincena2, limite: fechasLimite.quincena2 }
            
            // Calcular nuevo estado basado en valor_pagado vs nuevo valor_cuota
            const valorPagado = cuotaQuincena2.valor_pagado || 0
            const nuevoValorCuota = socio.valor_cuota_individual
            
            let nuevoEstado = cuotaQuincena2.estado
            // Recalcular el estado basado en el nuevo valor de la cuota
            if (valorPagado >= nuevoValorCuota) {
              // Si lo pagado cubre o supera el nuevo valor, está pagada
              nuevoEstado = 'pagada'
            } else if (valorPagado > 0) {
              // Si hay un pago pero no cubre el nuevo valor, está parcial
              nuevoEstado = 'parcial'
            } else {
              // Si no hay pago, mantener el estado original o calcular según fecha
              const fechaActual = new Date()
              fechaActual.setHours(0, 0, 0, 0)
              const [year, month, day] = fechaQuincena2.vencimiento.split('-').map(Number)
              const fechaVencimiento = new Date(year, month - 1, day)
              fechaVencimiento.setHours(0, 0, 0, 0)
              nuevoEstado = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            }
            
            const { data: updated2, error: updateError2 } = await supabase
              .from('cuotas')
              .update({
                fecha_vencimiento: fechaQuincena2.vencimiento,
                fecha_limite: fechaQuincena2.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 2da Quincena`
              })
              .eq('id', cuotaQuincena2.id)
              .select()
              .single()

            if (updateError2) throw updateError2
            cuotasActualizadas.push(updated2)
          } else {
            // Crear nueva cuota
            const fechaQuincena2 = typeof fechasLimite.quincena2 === 'object' 
              ? fechasLimite.quincena2 
              : { vencimiento: fechasLimite.quincena2, limite: fechasLimite.quincena2 }
            
            // Determinar estado inicial: programada si la fecha de vencimiento es futura
            // Usar solo la fecha sin hora para evitar problemas de zona horaria
            const fechaActual = new Date()
            fechaActual.setHours(0, 0, 0, 0)
            // Parsear la fecha manualmente para evitar problemas de zona horaria
            const [year, month, day] = fechaQuincena2.vencimiento.split('-').map(Number)
            const fechaVencimiento = new Date(year, month - 1, day)
            fechaVencimiento.setHours(0, 0, 0, 0)
            const estadoInicial = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: socio.valor_cuota_individual,
              valor_pagado: 0,
              fecha_vencimiento: fechaQuincena2.vencimiento,
              fecha_limite: fechaQuincena2.limite,
              mes: mes,
              anio: anio,
              quincena: 2,
              estado: estadoInicial,
              descripcion: `${mesLabel} - 2da Quincena`
            })
          }
        } else {
          // Socio mensual - buscar cuota con quincena null
          const { data: cuotaMensual, error: fetchErrorMensual } = await supabase
            .from('cuotas')
            .select('*')
            .eq('socio_natillera_id', socio.id)
            .eq('mes', mes)
            .eq('anio', anio)
            .is('quincena', null)
            .maybeSingle()

          if (fetchErrorMensual) throw fetchErrorMensual
          if (cuotaMensual) {
            // Actualizar cuota existente
            const fechaMensual = typeof fechasLimite.mensual === 'object' 
              ? fechasLimite.mensual 
              : { vencimiento: fechasLimite.mensual, limite: fechasLimite.mensual }
            
            // Calcular nuevo estado basado en valor_pagado vs nuevo valor_cuota
            const valorPagado = cuotaMensual.valor_pagado || 0
            const nuevoValorCuota = socio.valor_cuota_individual
            
            let nuevoEstado = cuotaMensual.estado
            // Recalcular el estado basado en el nuevo valor de la cuota
            if (valorPagado >= nuevoValorCuota) {
              // Si lo pagado cubre o supera el nuevo valor, está pagada
              nuevoEstado = 'pagada'
            } else if (valorPagado > 0) {
              // Si hay un pago pero no cubre el nuevo valor, está parcial
              nuevoEstado = 'parcial'
            } else {
              // Si no hay pago, mantener el estado original o calcular según fecha
              const fechaActual = new Date()
              fechaActual.setHours(0, 0, 0, 0)
              const [year, month, day] = fechaMensual.vencimiento.split('-').map(Number)
              const fechaVencimiento = new Date(year, month - 1, day)
              fechaVencimiento.setHours(0, 0, 0, 0)
              nuevoEstado = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            }
            
            const { data: updated, error: updateError } = await supabase
              .from('cuotas')
              .update({
                fecha_vencimiento: fechaMensual.vencimiento,
                fecha_limite: fechaMensual.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `Cuota ${mesLabel}`
              })
              .eq('id', cuotaMensual.id)
              .select()
              .single()

            if (updateError) throw updateError
            cuotasActualizadas.push(updated)
          } else {
            // Crear nueva cuota
            const fechaMensual = typeof fechasLimite.mensual === 'object' 
              ? fechasLimite.mensual 
              : { vencimiento: fechasLimite.mensual, limite: fechasLimite.mensual }
            
            // Determinar estado inicial: programada si la fecha de vencimiento es futura
            // Usar solo la fecha sin hora para evitar problemas de zona horaria
            const fechaActual = new Date()
            fechaActual.setHours(0, 0, 0, 0)
            // Parsear la fecha manualmente para evitar problemas de zona horaria
            const [year, month, day] = fechaMensual.vencimiento.split('-').map(Number)
            const fechaVencimiento = new Date(year, month - 1, day)
            fechaVencimiento.setHours(0, 0, 0, 0)
            const estadoInicial = fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
            
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: socio.valor_cuota_individual,
              valor_pagado: 0,
              fecha_vencimiento: fechaMensual.vencimiento,
              fecha_limite: fechaMensual.limite,
              mes: mes,
              anio: anio,
              quincena: null,
              estado: estadoInicial,
              descripcion: `Cuota ${mesLabel}`
            })
          }
        }
      }

      // Crear las cuotas nuevas si hay alguna
      let cuotasCreadas = []
      if (cuotasACrear.length > 0) {
        // Log para depuración: mostrar las fechas que se van a insertar
        console.log('=== INSERTANDO CUOTAS ===')
        cuotasACrear.forEach((cuota, index) => {
          console.log(`Cuota ${index + 1}:`, {
            fecha_vencimiento: cuota.fecha_vencimiento,
            fecha_limite: cuota.fecha_limite,
            mes: cuota.mes,
            quincena: cuota.quincena
          })
        })
        console.log('==========================')
        
        const { data, error: insertError } = await supabase
          .from('cuotas')
          .insert(cuotasACrear)
          .select()

        if (insertError) throw insertError
        cuotasCreadas = data || []
        
        // Log para depuración: mostrar las fechas que se insertaron
        console.log('=== CUOTAS INSERTADAS ===')
        cuotasCreadas.forEach((cuota, index) => {
          console.log(`Cuota ${index + 1}:`, {
            fecha_vencimiento: cuota.fecha_vencimiento,
            fecha_limite: cuota.fecha_limite,
            mes: cuota.mes,
            quincena: cuota.quincena
          })
        })
        console.log('==========================')
      }

      // Actualizar el array local de cuotas
      const todasLasCuotas = [...cuotasActualizadas, ...cuotasCreadas]
      
      // Actualizar cuotas en el array local
      todasLasCuotas.forEach(cuota => {
        const index = cuotas.value.findIndex(c => c.id === cuota.id)
        if (index !== -1) {
          cuotas.value[index] = cuota
        } else {
          cuotas.value.push(cuota)
        }
      })

      // Actualizar automáticamente el estado de cuotas en mora
      await actualizarEstadoMoraAutomatico(todasLasCuotas)

      console.log('Cuotas actualizadas:', cuotasActualizadas.length)
      console.log('Cuotas creadas:', cuotasCreadas.length)
      console.log('=========================')

      return { success: true, data: todasLasCuotas }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Función para generar código único de comprobante
  function generarCodigoComprobante() {
    // Generar código alfanumérico único: 8 caracteres
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
    let codigo = ''
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    return codigo
  }

  async function registrarPago(cuotaId, valorPagado, comprobante = null) {
    try {
      loading.value = true
      error.value = null

      // Obtener la cuota actual
      const { data: cuotaActual, error: fetchError } = await supabase
        .from('cuotas')
        .select('*')
        .eq('id', cuotaId)
        .single()

      if (fetchError) throw fetchError

      const nuevoValorPagado = (cuotaActual.valor_pagado || 0) + valorPagado
      const nuevaEstado = nuevoValorPagado >= cuotaActual.valor_cuota 
        ? 'pagada' 
        : nuevoValorPagado > 0 
          ? 'parcial' 
          : cuotaActual.estado

      // Generar código único de comprobante solo si se está registrando un pago (no si ya existe)
      let codigoComprobante = cuotaActual.codigo_comprobante || null
      const codigoAnterior = codigoComprobante // Guardar el código anterior antes de generar uno nuevo
      if (!codigoComprobante) {
        try {
          // Intentar generar un código único (máximo 5 intentos)
          let intentos = 0
          let codigoUnico = false
          while (!codigoUnico && intentos < 5) {
            codigoComprobante = generarCodigoComprobante()
            // Verificar que el código no exista (solo si la columna existe)
            try {
              const { data: codigoExistente, error: codigoError } = await supabase
                .from('cuotas')
                .select('id')
                .eq('codigo_comprobante', codigoComprobante)
                .limit(1)
              
              // Si hay error porque la columna no existe, continuar sin código
              if (codigoError && codigoError.message && codigoError.message.includes('codigo_comprobante')) {
                codigoComprobante = null
                break
              }
              
              if (!codigoExistente || codigoExistente.length === 0) {
                codigoUnico = true
              }
            } catch (e) {
              // Si la columna no existe, continuar sin código
              codigoComprobante = null
              break
            }
            intentos++
          }
          
          if (!codigoUnico && codigoComprobante) {
            throw new Error('No se pudo generar un código único de comprobante')
          }
        } catch (e) {
          // Si hay error generando el código, continuar sin él
          console.warn('No se pudo generar código de comprobante:', e.message)
          codigoComprobante = null
        }
      }

      // Preparar objeto de actualización
      // Actualizar fecha_pago cuando se registra un pago (parcial o completo)
      const fechaPagoActualizada = nuevoValorPagado > 0 ? new Date().toISOString() : null
      
      const updateData = {
        valor_pagado: nuevoValorPagado,
        estado: nuevaEstado,
        fecha_pago: fechaPagoActualizada,
        comprobante_url: comprobante
      }
      
      // Solo agregar codigo_comprobante si existe un código generado
      // Esto evita errores si la columna no existe en la BD (migración no ejecutada)
      if (codigoComprobante) {
        try {
          // Intentar actualizar con el código
          updateData.codigo_comprobante = codigoComprobante
        } catch (e) {
          // Si falla, continuar sin el código (la columna puede no existir)
          console.warn('No se pudo agregar código de comprobante:', e.message)
        }
      }

      // Intentar actualizar con el código si existe
      let data, updateError
      
      if (updateData.codigo_comprobante) {
        const result = await supabase
          .from('cuotas')
          .update(updateData)
          .eq('id', cuotaId)
          .select('*')
          .maybeSingle()
        
        data = result.data
        updateError = result.error
        
        // Si el error es por la columna codigo_comprobante, intentar sin ella
        if (updateError && updateError.message && (
          updateError.message.includes('codigo_comprobante') || 
          updateError.message.includes('column') ||
          updateError.code === 'PGRST116'
        )) {
          delete updateData.codigo_comprobante
          const retryResult = await supabase
            .from('cuotas')
            .update(updateData)
            .eq('id', cuotaId)
            .select('*')
            .maybeSingle()
          
          data = retryResult.data
          updateError = retryResult.error
        }
      } else {
        const result = await supabase
          .from('cuotas')
          .update(updateData)
          .eq('id', cuotaId)
          .select('*')
          .maybeSingle()
        
        data = result.data
        updateError = result.error
      }

      if (updateError) throw updateError
      
      if (!data) {
        throw new Error('No se pudo actualizar la cuota')
      }

      // Si se generó un nuevo código y había uno anterior, guardar en historial
      // Nota: En registrarPago solo se genera código si no existe, así que no debería haber historial aquí
      // El historial se guarda principalmente en guardarEdicionCuota cuando se actualiza un código existente

      // Actualizar en el array local
      const index = cuotas.value.findIndex(c => c.id === cuotaId)
      if (index !== -1) {
        cuotas.value[index] = data
      }

      // Verificar y actualizar otras cuotas en mora después de registrar un pago
      await actualizarEstadoMoraAutomatico()

      // Registrar auditoría
      const auditoria = useAuditoria()
      const esPagoParcial = nuevoValorPagado > 0 && nuevoValorPagado < cuotaActual.valor_cuota
      const descripcion = esPagoParcial
        ? `Se registró un pago parcial de $${valorPagado.toLocaleString('es-CO')} a una cuota (Total pagado: $${nuevoValorPagado.toLocaleString('es-CO')} de $${cuotaActual.valor_cuota.toLocaleString('es-CO')})`
        : nuevaEstado === 'pagada'
          ? `Se registró el pago completo de una cuota por $${valorPagado.toLocaleString('es-CO')}`
          : `Se registró un pago de $${valorPagado.toLocaleString('es-CO')} a una cuota`
      
      // Obtener natillera_id desde la cuota
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', cuotaActual.socio_natillera_id)
        .single()
      
      await auditoria.registrarPago(
        cuotaId,
        descripcion,
        data,
        socioNatillera?.natillera_id,
        {
          valor_pagado_anterior: cuotaActual.valor_pagado || 0,
          valor_pagado_nuevo: nuevoValorPagado,
          valor_pagado_agregado: valorPagado,
          estado_anterior: cuotaActual.estado,
          estado_nuevo: nuevaEstado,
          codigo_comprobante: codigoComprobante,
          codigo_comprobante_anterior: codigoAnterior
        }
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function marcarEnMora(cuotaId) {
    try {
      loading.value = true

      const { data, error: updateError } = await supabase
        .from('cuotas')
        .update({ estado: 'mora' })
        .eq('id', cuotaId)
        .select()
        .single()

      if (updateError) throw updateError

      const index = cuotas.value.findIndex(c => c.id === cuotaId)
      if (index !== -1) {
        cuotas.value[index] = data
      }

      return { success: true, data }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  function calcularResumenCuotas(cuotasFiltradas = null) {
    const lista = cuotasFiltradas || cuotas.value
    const pendientes = lista.filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
    const pagadas = lista.filter(c => c.estado === 'pagada')
    const parciales = lista.filter(c => c.estado === 'parcial')
    const enMora = lista.filter(c => c.estado === 'mora')
    const programadas = lista.filter(c => c.estado === 'programada')

    const totalRecaudado = lista.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    const totalEsperado = lista.reduce((sum, c) => sum + c.valor_cuota, 0)

    return {
      pendientes: pendientes.length,
      pagadas: pagadas.length,
      parciales: parciales.length,
      enMora: enMora.length,
      programadas: programadas.length,
      totalRecaudado,
      totalEsperado,
      porcentajeRecaudado: totalEsperado > 0 ? (totalRecaudado / totalEsperado) * 100 : 0
    }
  }

  // Obtener cuotas filtradas por mes
  function getCuotasPorMes(mes, anio = null) {
    return cuotas.value.filter(c => {
      if (anio) {
        return c.mes === mes && c.anio === anio
      }
      return c.mes === mes
    })
  }

  // Obtener resumen de cuotas por mes específico
  function getResumenPorMes(mes, anio = null) {
    const cuotasMes = getCuotasPorMes(mes, anio)
    return calcularResumenCuotas(cuotasMes)
  }

  // Función para obtener el último día de un mes
  function obtenerUltimoDiaDelMes(mes, anio) {
    // mes es 1-12, JavaScript usa 0-11
    return new Date(anio, mes, 0).getDate()
  }

  // Generación automática de cuotas para un mes específico
  async function generarCuotasAutomaticas(natilleraId, mes = null, anio = null) {
    try {
      loading.value = true
      error.value = null

      // Obtener información de la natillera (días de gracia y período)
      const { data: natillera, error: natilleraError } = await supabase
        .from('natilleras')
        .select('reglas_multas, mes_inicio, mes_fin, anio')
        .eq('id', natilleraId)
        .single()

      if (natilleraError) throw natilleraError
      if (!natillera) return { success: false, error: 'Natillera no encontrada' }

      // Obtener días de gracia
      const reglasMultas = natillera.reglas_multas || {}
      const diasGracia = reglasMultas.dias_gracia || 3

      // Si no se especifica mes/año, usar el mes actual
      const fechaActual = new Date()
      const mesAGenerar = mes || (fechaActual.getMonth() + 1) // 1-12
      const anioAGenerar = anio || fechaActual.getFullYear()

      // Verificar que el mes esté dentro del período de la natillera
      const anioNatillera = natillera.anio || anioAGenerar
      const mesInicio = natillera.mes_inicio || 1
      const mesFin = natillera.mes_fin || 11

      // Verificar si el mes está en el rango
      let mesEnRango = false
      if (anioAGenerar === anioNatillera) {
        if (mesInicio <= mesFin) {
          // Rango normal (ej: Enero a Noviembre)
          mesEnRango = mesAGenerar >= mesInicio && mesAGenerar <= mesFin
        } else {
          // Rango que cruza año (ej: Noviembre a Enero)
          mesEnRango = mesAGenerar >= mesInicio || mesAGenerar <= mesFin
        }
      }

      if (!mesEnRango) {
        return { success: false, error: 'El mes seleccionado no está en el período de la natillera' }
      }

      // Verificar si ya existen cuotas para este mes
      const { data: sociosNatillera } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'activo')

      if (!sociosNatillera || sociosNatillera.length === 0) {
        return { success: false, error: 'No hay socios activos' }
      }

      const socioNatilleraIds = sociosNatillera.map(s => s.id)

      // Verificar si ya hay cuotas para este mes
      const { data: cuotasExistentes, error: cuotasError } = await supabase
        .from('cuotas')
        .select('id')
        .in('socio_natillera_id', socioNatilleraIds)
        .eq('mes', mesAGenerar)
        .eq('anio', anioAGenerar)
        .limit(1)

      if (cuotasError) throw cuotasError

      // Si ya existen cuotas, no generar
      if (cuotasExistentes && cuotasExistentes.length > 0) {
        return { success: true, message: 'Las cuotas de este mes ya existen', yaExisten: true }
      }

      // Calcular fechas de vencimiento (sin días de gracia) y fechas límite (con días de gracia)
      // Usando la misma lógica que calcularFechasPorDefecto
      const ultimoDia = obtenerUltimoDiaDelMes(mesAGenerar, anioAGenerar)
      
      // Función helper para formatear fecha sin problemas de zona horaria
      const formatearFecha = (anio, mes, dia) => {
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      }
      
      // Primera quincena
      // Fecha de vencimiento: día 15 (sin días de gracia)
      const fechaVencimientoQuincena1Str = formatearFecha(anioAGenerar, mesAGenerar, 15)
      
      // Fecha límite: día 15 + días de gracia
      // Calcular directamente sin usar Date para evitar problemas de zona horaria
      const diasEnMes = obtenerUltimoDiaDelMes(mesAGenerar, anioAGenerar)
      const diaQuincena1 = 15 + diasGracia
      let anioQuincena1 = anioAGenerar
      let mesQuincena1 = mesAGenerar
      let diaFinalQuincena1 = diaQuincena1
      
      // Si el día excede los días del mes, ajustar al mes siguiente
      if (diaFinalQuincena1 > diasEnMes) {
        diaFinalQuincena1 = diaFinalQuincena1 - diasEnMes
        mesQuincena1 = mesAGenerar + 1
        if (mesQuincena1 > 12) {
          mesQuincena1 = 1
          anioQuincena1 = anioAGenerar + 1
        }
      }
      const fechaQuincena1Str = formatearFecha(anioQuincena1, mesQuincena1, diaFinalQuincena1)
      
      console.log('=== CÁLCULO FECHAS AUTOMÁTICAS ===')
      console.log('Días de gracia:', diasGracia)
      console.log('Primera quincena - Día calculado:', diaQuincena1, 'Día final:', diaFinalQuincena1, 'Fecha:', fechaQuincena1Str)

      // Segunda quincena / Mensual
      // Fecha de vencimiento: último día del mes (sin días de gracia)
      const fechaVencimientoQuincena2Str = formatearFecha(anioAGenerar, mesAGenerar, ultimoDia)
      
      // Fecha límite: último día del mes + días de gracia
      // Calcular directamente sin usar Date para evitar problemas de zona horaria
      const diaQuincena2 = ultimoDia + diasGracia
      let anioQuincena2 = anioAGenerar
      let mesQuincena2 = mesAGenerar
      let diaFinalQuincena2 = diaQuincena2
      
      // Si el día excede los días del mes, ajustar al mes siguiente
      if (diaFinalQuincena2 > diasEnMes) {
        diaFinalQuincena2 = diaFinalQuincena2 - diasEnMes
        mesQuincena2 = mesAGenerar + 1
        if (mesQuincena2 > 12) {
          mesQuincena2 = 1
          anioQuincena2 = anioAGenerar + 1
        }
      }
      const fechaQuincena2Str = formatearFecha(anioQuincena2, mesQuincena2, diaFinalQuincena2)
      console.log('Segunda quincena - Último día:', ultimoDia, 'Día calculado:', diaQuincena2, 'Día final:', diaFinalQuincena2, 'Fecha:', fechaQuincena2Str)
      console.log('===================================')

      // Obtener nombre del mes
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      const mesLabel = meses[mesAGenerar - 1]

      // Generar las cuotas con ambas fechas
      const result = await generarCuotasPeriodo(
        natilleraId,
        {
          mensual: { vencimiento: fechaVencimientoQuincena2Str, limite: fechaQuincena2Str },
          quincena1: { vencimiento: fechaVencimientoQuincena1Str, limite: fechaQuincena1Str },
          quincena2: { vencimiento: fechaVencimientoQuincena2Str, limite: fechaQuincena2Str }
        },
        mesLabel,
        mesAGenerar,
        anioAGenerar,
        null // Todos los socios
      )

      return result
    } catch (e) {
      error.value = e.message
      console.error('Error en generación automática:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Función para buscar cuota por código de comprobante
  async function buscarCuotaPorCodigo(natilleraId, codigo) {
    try {
      loading.value = true
      error.value = null

      // Obtener los IDs de socios_natillera de esta natillera
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', natilleraId)

      if (sociosError) throw sociosError

      if (!sociosNatillera || sociosNatillera.length === 0) {
        return { success: false, error: 'No hay socios en esta natillera' }
      }

      const socioNatilleraIds = sociosNatillera.map(s => s.id)

      // Primero buscar en cuotas actuales
      const { data: cuota, error: fetchError } = await supabase
        .from('cuotas')
        .select(`
          *,
          socio_natillera:socios_natillera(
            id,
            socio:socios(*)
          )
        `)
        .eq('codigo_comprobante', codigo.toUpperCase())
        .in('socio_natillera_id', socioNatilleraIds)
        .maybeSingle()

      if (fetchError) throw fetchError

      // Si se encuentra en cuotas actuales, retornar
      if (cuota) {
        return { success: true, data: cuota, esAntiguo: false }
      }

      // Si no se encuentra, buscar en historial
      try {
        const { data: historial, error: historialError } = await supabase
          .from('historial_comprobantes')
          .select(`
            *,
            cuota:cuotas!historial_comprobantes_cuota_id_fkey(
              *,
              socio_natillera:socios_natillera(
                id,
                socio:socios(*)
              )
            )
          `)
          .eq('codigo_comprobante_anterior', codigo.toUpperCase())
          .order('fecha_actualizacion', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (historialError && !historialError.message.includes('historial_comprobantes')) {
          throw historialError
        }

        // Si se encuentra en historial, obtener la cuota actualizada
        if (historial) {
          // Obtener la cuota actual usando el cuota_id del historial
          const { data: cuotaActual, error: cuotaError } = await supabase
            .from('cuotas')
            .select(`
              *,
              socio_natillera:socios_natillera(
                id,
                socio:socios(*)
              )
            `)
            .eq('id', historial.cuota_id)
            .maybeSingle()

          if (cuotaError) throw cuotaError

          if (cuotaActual) {
            return {
              success: true,
              data: cuotaActual,
              esAntiguo: true,
              historial: {
                codigoAnterior: historial.codigo_comprobante_anterior,
                codigoNuevo: historial.codigo_comprobante_nuevo,
                fechaActualizacion: historial.fecha_actualizacion,
                valorPagadoAnterior: historial.valor_pagado_anterior,
                valorPagadoNuevo: historial.valor_pagado_nuevo
              }
            }
          }
        }
      } catch (e) {
        // Si la tabla de historial no existe, continuar sin error
        if (!e.message || !e.message.includes('historial_comprobantes')) {
          console.warn('Error buscando en historial:', e.message)
        }
      }

      return { success: false, error: 'No se encontró ningún comprobante con ese código' }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // Función para actualizar una cuota
  async function actualizarCuota(cuotaId, datos) {
    try {
      loading.value = true
      error.value = null

      // Obtener datos anteriores para auditoría
      const { data: datosAnteriores } = await supabase
        .from('cuotas')
        .select('*')
        .eq('id', cuotaId)
        .single()

      const { data, error: updateError } = await supabase
        .from('cuotas')
        .update(datos)
        .eq('id', cuotaId)
        .select('*')
        .single()

      if (updateError) throw updateError

      // Actualizar en el array local
      const index = cuotas.value.findIndex(c => c.id === cuotaId)
      if (index !== -1) {
        // Mantener la información del socio_natillera si existe
        const cuotaOriginal = cuotas.value[index]
        cuotas.value[index] = {
          ...data,
          socio_natillera: cuotaOriginal.socio_natillera
        }
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      
      // Obtener natillera_id desde la cuota
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', datosAnteriores?.socio_natillera_id || data.socio_natillera_id)
        .single()
      
      // La descripción se generará automáticamente con los detalles de los cambios
      await auditoria.registrarActualizacion(
        'cuota',
        cuotaId,
        null, // null para generar descripción automática
        datosAnteriores,
        data,
        socioNatillera?.natillera_id,
        { campos_modificados: Object.keys(datos) }
      )

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      console.error('Error actualizando cuota:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    cuotas,
    loading,
    error,
    fetchCuotasNatillera,
    generarCuotasPeriodo,
    registrarPago,
    marcarEnMora,
    actualizarEstadoMoraAutomatico,
    calcularResumenCuotas,
    getCuotasPorMes,
    getResumenPorMes,
    generarCuotasAutomaticas,
    buscarCuotaPorCodigo,
    actualizarCuota
  }
})

