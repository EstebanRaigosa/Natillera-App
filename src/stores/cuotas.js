import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'

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
      
      // Actualizar automáticamente el estado de cuotas en mora y aplicar sanciones
      await actualizarEstadoMoraAutomatico(cuotasConSocio, natilleraId)
      
      // Recalcular multas para cuotas que ya están en mora pero no tienen multa aplicada
      await recalcularMultasCuotasMora(natilleraId)
      
      return cuotasConSocio
    } catch (e) {
      error.value = e.message
      console.error('Error cargando cuotas:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  // Función para calcular la multa según la configuración de sanciones
  function calcularMulta(configSanciones, cantidadCuotasMora = 1) {
    if (!configSanciones || !configSanciones.activa) {
      return 0
    }

    let multa = 0

    if (configSanciones.tipo === 'simple') {
      // Multa fija simple
      multa = configSanciones.valorFijo || 0
    } else if (configSanciones.tipo === 'escalonada') {
      // Multa escalonada según cantidad de cuotas en mora
      const niveles = configSanciones.niveles || []
      
      // Ordenar niveles por cantidad de cuotas (descendente) para encontrar el nivel aplicable
      const nivelesOrdenados = [...niveles].sort((a, b) => b.cuotas - a.cuotas)
      
      // Buscar el nivel que corresponde a la cantidad de cuotas en mora
      for (const nivel of nivelesOrdenados) {
        if (cantidadCuotasMora >= nivel.cuotas) {
          multa = nivel.valor || 0
          break
        }
      }
      
      // Si no encontró nivel, usar el primer nivel (menor)
      if (multa === 0 && niveles.length > 0) {
        multa = niveles[0].valor || 0
      }
    }

    return multa
  }

  // Función para calcular la multa dinámica de una cuota considerando la fecha actual
  // y la configuración de intereses adicionales por días de mora
  function calcularMultaDinamica(cuota, configSanciones, cantidadCuotasMoraSocio = 1) {
    if (!configSanciones || !configSanciones.activa) {
      return 0
    }

    if (cuota.estado !== 'mora') {
      return 0
    }

    // Calcular multa base según el tipo de sanción
    let multaBase = calcularMulta(configSanciones, cantidadCuotasMoraSocio)

    // Calcular días en mora (desde fecha_limite, no desde fecha_mora)
    // La fecha_limite es cuando debió pagar, después de eso está en mora
    const fechaLimiteStr = cuota.fecha_limite
    if (!fechaLimiteStr) {
      console.warn('Cuota sin fecha_limite:', cuota.id)
      return multaBase
    }

    // Parsear fecha correctamente (YYYY-MM-DD)
    const [anio, mes, dia] = fechaLimiteStr.split('-').map(Number)
    const fechaLimite = new Date(anio, mes - 1, dia)
    fechaLimite.setHours(0, 0, 0, 0)
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const diasEnMora = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24))

    // Calcular intereses adicionales por días de mora
    let interesesAdicionales = 0
    const interesesConfig = configSanciones.interesesAdicionales
    
    if (interesesConfig && interesesConfig.activo) {
      const diasParaInteres = interesesConfig.dias || 2
      const valorInteres = interesesConfig.valor || 0

      // Calcular cuántos períodos de interés adicional han pasado
      if (diasEnMora > 0 && diasParaInteres > 0 && valorInteres > 0) {
        const periodosInteres = Math.floor(diasEnMora / diasParaInteres)
        interesesAdicionales = periodosInteres * valorInteres
        
        console.log(`📊 Cálculo intereses cuota ${cuota.id}:`, {
          fechaLimite: fechaLimiteStr,
          diasEnMora,
          diasParaInteres,
          valorInteres,
          periodosInteres,
          interesesAdicionales
        })
      }
    }

    const totalSancion = multaBase + interesesAdicionales
    
    console.log(`💰 Sanción cuota ${cuota.id}: Base $${multaBase.toLocaleString()} + Intereses $${interesesAdicionales.toLocaleString()} = $${totalSancion.toLocaleString()}`)

    return totalSancion
  }

  // Función para calcular el total de sanciones de un conjunto de cuotas
  async function calcularSancionesTotales(natilleraId, cuotasLista = null) {
    try {
      // Obtener configuración de sanciones
      const { data: natillera } = await supabase
        .from('natilleras')
        .select('reglas_multas')
        .eq('id', natilleraId)
        .single()

      const configSanciones = natillera?.reglas_multas?.sanciones || null

      console.log('🔧 Configuración de sanciones:', JSON.stringify(configSanciones, null, 2))

      if (!configSanciones?.activa) {
        console.log('⚠️ Sanciones no activas')
        return { 
          success: true, 
          sanciones: {},
          configActiva: false 
        }
      }

      console.log('✅ Sanciones activas:', {
        tipo: configSanciones.tipo,
        valorFijo: configSanciones.valorFijo,
        niveles: configSanciones.niveles,
        interesesAdicionales: configSanciones.interesesAdicionales
      })

      const lista = cuotasLista || cuotas.value
      
      // Contar cuotas en mora por socio para el escalonamiento
      const cuotasMoraPorSocio = {}
      lista.filter(c => c.estado === 'mora').forEach(c => {
        cuotasMoraPorSocio[c.socio_natillera_id] = (cuotasMoraPorSocio[c.socio_natillera_id] || 0) + 1
      })

      console.log('📋 Cuotas en mora por socio:', cuotasMoraPorSocio)

      // Calcular sanción dinámica para cada cuota en mora
      const sanciones = {}
      lista.filter(c => c.estado === 'mora').forEach(cuota => {
        const cantidadMora = cuotasMoraPorSocio[cuota.socio_natillera_id] || 1
        const sancion = calcularMultaDinamica(cuota, configSanciones, cantidadMora)
        sanciones[cuota.id] = sancion
      })

      return { 
        success: true, 
        sanciones,
        configSanciones,
        configActiva: true
      }
    } catch (e) {
      console.error('Error calculando sanciones:', e)
      return { success: false, error: e.message, sanciones: {} }
    }
  }

  // Función para actualizar automáticamente el estado de cuotas (programada -> pendiente -> mora)
  // y aplicar sanciones según la configuración de la natillera
  async function actualizarEstadoMoraAutomatico(cuotasLista = null, natilleraId = null) {
    try {
      const lista = cuotasLista || cuotas.value
      if (!lista || lista.length === 0) return

      // Obtener fecha actual (solo fecha, sin hora)
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)
      const fechaActualStr = fechaActual.toISOString().split('T')[0] // YYYY-MM-DD

      // Separar cuotas por estado a actualizar
      const cuotasAPendiente = [] // programada -> pendiente
      const cuotasAMora = [] // pendiente/parcial -> mora (solo las que no tienen multa ya aplicada)

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
        // Solo si no está ya en mora (evitar reprocesar)
        else if ((cuota.estado === 'pendiente' || cuota.estado === 'parcial') && fechaActualStr > fechaLimite) {
          cuotasAMora.push({
            id: cuota.id,
            socio_natillera_id: cuota.socio_natillera_id,
            yaTeníaMulta: (cuota.valor_multa || 0) > 0
          })
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

      // Actualizar cuotas a mora con aplicación de sanciones
      if (cuotasAMora.length > 0) {
        // Obtener la configuración de sanciones de la natillera
        let configSanciones = null
        
        if (natilleraId) {
          const { data: natillera } = await supabase
            .from('natilleras')
            .select('reglas_multas')
            .eq('id', natilleraId)
            .single()
          
          configSanciones = natillera?.reglas_multas?.sanciones || null
        } else if (cuotasAMora.length > 0) {
          // Obtener natillera_id desde el primer socio_natillera
          const { data: socioNatillera } = await supabase
            .from('socios_natillera')
            .select('natillera_id')
            .eq('id', cuotasAMora[0].socio_natillera_id)
            .single()
          
          if (socioNatillera?.natillera_id) {
            const { data: natillera } = await supabase
              .from('natilleras')
              .select('reglas_multas')
              .eq('id', socioNatillera.natillera_id)
              .single()
            
            configSanciones = natillera?.reglas_multas?.sanciones || null
          }
        }

        // Si las sanciones están activas, contar cuotas en mora por socio para escalonamiento
        let cuotasMoraPorSocio = {}
        if (configSanciones?.activa && configSanciones?.tipo === 'escalonada') {
          // Obtener todas las cuotas en mora actuales por socio
          const socioIds = [...new Set(cuotasAMora.map(c => c.socio_natillera_id))]
          
          const { data: cuotasMoraExistentes } = await supabase
            .from('cuotas')
            .select('socio_natillera_id')
            .in('socio_natillera_id', socioIds)
            .eq('estado', 'mora')

          // Contar cuotas en mora por socio
          ;(cuotasMoraExistentes || []).forEach(c => {
            cuotasMoraPorSocio[c.socio_natillera_id] = (cuotasMoraPorSocio[c.socio_natillera_id] || 0) + 1
          })
        }

        // Actualizar cada cuota a mora individualmente para aplicar la multa correcta
        for (const cuotaInfo of cuotasAMora) {
          // Calcular la multa si las sanciones están activas y la cuota no tenía multa
          let valorMulta = 0
          if (configSanciones?.activa && !cuotaInfo.yaTeníaMulta) {
            const cantidadMora = (cuotasMoraPorSocio[cuotaInfo.socio_natillera_id] || 0) + 1
            valorMulta = calcularMulta(configSanciones, cantidadMora)
            
            console.log(`💰 Aplicando multa de $${valorMulta.toLocaleString('es-CO')} a cuota ${cuotaInfo.id} (${cantidadMora} cuotas en mora)`)
          }

          const datosActualizar = {
            estado: 'mora',
            fecha_mora: fechaActualStr
          }

          // Solo actualizar valor_multa si hay multa que aplicar
          if (valorMulta > 0) {
            datosActualizar.valor_multa = valorMulta
          }

          const { data: actualizadaMora, error: errorMora } = await supabase
            .from('cuotas')
            .update(datosActualizar)
            .eq('id', cuotaInfo.id)
            .select()
            .single()

          if (errorMora) {
            console.error('Error actualizando cuota en mora:', errorMora)
          } else if (actualizadaMora) {
            actualizaciones.push(actualizadaMora)
          }
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

  // Función para recalcular multas de cuotas que ya están en mora pero no tienen multa aplicada
  async function recalcularMultasCuotasMora(natilleraId) {
    try {
      // Obtener configuración de sanciones
      const { data: natillera } = await supabase
        .from('natilleras')
        .select('reglas_multas')
        .eq('id', natilleraId)
        .single()

      const configSanciones = natillera?.reglas_multas?.sanciones || null

      // Si las sanciones no están activas, no hacer nada
      if (!configSanciones?.activa) {
        return { success: true, recalculadas: 0 }
      }

      // Obtener cuotas en mora sin multa aplicada
      const cuotasMoraSinMulta = cuotas.value.filter(c => 
        c.estado === 'mora' && (!c.valor_multa || c.valor_multa === 0)
      )

      if (cuotasMoraSinMulta.length === 0) {
        return { success: true, recalculadas: 0 }
      }

      console.log(`🔄 Recalculando multas para ${cuotasMoraSinMulta.length} cuota(s) en mora sin multa...`)

      // Para el tipo escalonado, necesitamos contar cuotas en mora por socio
      let cuotasMoraPorSocio = {}
      if (configSanciones.tipo === 'escalonada') {
        cuotas.value
          .filter(c => c.estado === 'mora')
          .forEach(c => {
            cuotasMoraPorSocio[c.socio_natillera_id] = (cuotasMoraPorSocio[c.socio_natillera_id] || 0) + 1
          })
      }

      const actualizaciones = []
      const fechaActualStr = new Date().toISOString().split('T')[0]

      for (const cuota of cuotasMoraSinMulta) {
        const cantidadMora = cuotasMoraPorSocio[cuota.socio_natillera_id] || 1
        const valorMulta = calcularMulta(configSanciones, cantidadMora)

        if (valorMulta > 0) {
          const { data: cuotaActualizada, error: updateError } = await supabase
            .from('cuotas')
            .update({ 
              valor_multa: valorMulta,
              fecha_mora: cuota.fecha_mora || fechaActualStr
            })
            .eq('id', cuota.id)
            .select()
            .single()

          if (!updateError && cuotaActualizada) {
            actualizaciones.push(cuotaActualizada)
            
            // Actualizar en el array local
            const index = cuotas.value.findIndex(c => c.id === cuota.id)
            if (index !== -1) {
              cuotas.value[index] = {
                ...cuotaActualizada,
                socio_natillera: cuotas.value[index].socio_natillera
              }
            }

            const nombreSocio = cuota.socio_natillera?.socio?.nombre || 'Socio'
            console.log(`💰 Multa de $${valorMulta.toLocaleString('es-CO')} aplicada a ${nombreSocio}`)
          }
        }
      }

      if (actualizaciones.length > 0) {
        console.log(`✅ ${actualizaciones.length} multa(s) recalculada(s) y aplicada(s)`)
      }

      return { success: true, recalculadas: actualizaciones.length }
    } catch (e) {
      console.error('Error recalculando multas:', e)
      return { success: false, error: e.message }
    }
  }

  async function generarCuotasPeriodo(natilleraId, fechasLimite, mesLabel = '', mes = null, anio = null, socioId = null) {
    try {
      loading.value = true
      error.value = null

      const tiempoInicio = performance.now()

      // Construir query para obtener socios activos (incluyendo nombre para auditoría)
      let query = supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, periodicidad, socio:socios(id, nombre)')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'activo')

      // Si se especifica un socioId, filtrar solo ese socio
      if (socioId) {
        query = query.eq('id', socioId)
      }

      const { data: sociosNatillera, error: sociosError } = await query

      if (sociosError) throw sociosError

      console.log('=== GENERANDO CUOTAS (OPTIMIZADO) ===')
      console.log('SocioId filtro:', socioId)
      console.log('Socios encontrados:', sociosNatillera?.length || 0)

      if (!sociosNatillera || sociosNatillera.length === 0) {
        console.log('No hay socios activos para generar cuotas')
        return { success: false, error: socioId ? 'El socio seleccionado no está activo' : 'No hay socios activos en la natillera' }
      }

      // OPTIMIZACIÓN: Obtener TODAS las cuotas existentes del mes/año en UNA sola consulta
      const socioNatilleraIds = sociosNatillera.map(s => s.id)
      const { data: cuotasExistentes, error: cuotasError } = await supabase
        .from('cuotas')
        .select('*')
        .in('socio_natillera_id', socioNatilleraIds)
        .eq('mes', mes)
        .eq('anio', anio)

      if (cuotasError) throw cuotasError

      // Crear mapa de cuotas existentes para búsqueda O(1)
      const mapaCuotasExistentes = {}
      ;(cuotasExistentes || []).forEach(cuota => {
        const key = `${cuota.socio_natillera_id}-${cuota.quincena || 'mensual'}`
        mapaCuotasExistentes[key] = cuota
      })

      console.log('Cuotas existentes encontradas:', cuotasExistentes?.length || 0)

      // Preparar fechas normalizadas una sola vez
      const fechaMensual = typeof fechasLimite.mensual === 'object' 
        ? fechasLimite.mensual 
        : { vencimiento: fechasLimite.mensual, limite: fechasLimite.mensual }
      const fechaQuincena1 = typeof fechasLimite.quincena1 === 'object' 
        ? fechasLimite.quincena1 
        : { vencimiento: fechasLimite.quincena1, limite: fechasLimite.quincena1 }
      const fechaQuincena2 = typeof fechasLimite.quincena2 === 'object' 
        ? fechasLimite.quincena2 
        : { vencimiento: fechasLimite.quincena2, limite: fechasLimite.quincena2 }

      // Fecha actual para calcular estado (una sola vez)
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)

      // Helper para calcular estado inicial
      const calcularEstadoInicial = (fechaVencimientoStr) => {
        const [year, month, day] = fechaVencimientoStr.split('-').map(Number)
        const fechaVencimiento = new Date(year, month - 1, day)
        fechaVencimiento.setHours(0, 0, 0, 0)
        return fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
      }

      // Helper para calcular nuevo estado basado en pagos
      const calcularNuevoEstado = (valorPagado, nuevoValorCuota, estadoActual, fechaVencimientoStr) => {
        if (valorPagado >= nuevoValorCuota) return 'pagada'
        if (valorPagado > 0) return 'parcial'
        // Si no hay pago, calcular según fecha
        const [year, month, day] = fechaVencimientoStr.split('-').map(Number)
        const fechaVencimiento = new Date(year, month - 1, day)
        fechaVencimiento.setHours(0, 0, 0, 0)
        return fechaActual >= fechaVencimiento ? 'pendiente' : 'programada'
      }

      // Arrays para operaciones batch
      const cuotasACrear = []
      const cuotasAActualizar = []
      const cuotasAEliminar = [] // Para cambios de periodicidad
      const datosAnterioresPorId = {} // Para auditoría
      const migracionesPago = [] // Para auditoría de migraciones

      // Procesar cada socio (solo lógica, sin consultas a BD)
      for (const socio of sociosNatillera) {
        const periodicidad = socio.periodicidad || 'mensual'
        const nuevoValorCuota = socio.valor_cuota_individual
        
        // Verificar cuotas existentes del socio
        const keyQ1 = `${socio.id}-1`
        const keyQ2 = `${socio.id}-2`
        const keyMensual = `${socio.id}-mensual`
        const cuotaQ1 = mapaCuotasExistentes[keyQ1]
        const cuotaQ2 = mapaCuotasExistentes[keyQ2]
        const cuotaMensual = mapaCuotasExistentes[keyMensual]
        
        // Detectar cambio de periodicidad
        const teniaQuincenales = cuotaQ1 || cuotaQ2
        const teniaMensual = cuotaMensual
        const cambioAQuincenal = periodicidad === 'quincenal' && teniaMensual && !teniaQuincenales
        const cambioAMensual = periodicidad === 'mensual' && teniaQuincenales && !teniaMensual
        
        if (periodicidad === 'quincenal') {
          // CASO: Cambio de mensual a quincenal
          if (cambioAQuincenal) {
            console.log(`📋 Cambio de periodicidad: ${socio.socio?.nombre || 'Socio'} de MENSUAL a QUINCENAL`)
            
            // Migrar el pago de la cuota mensual a la primera quincena
            const pagoMigrado = cuotaMensual.valor_pagado || 0
            
            // Guardar para auditoría
            datosAnterioresPorId[cuotaMensual.id] = { ...cuotaMensual, socio }
            migracionesPago.push({
              tipo: 'mensual_a_quincenal',
              socio: socio.socio?.nombre || 'Socio desconocido',
              pagoMigrado,
              cuotaEliminada: cuotaMensual.id
            })
            
            // Marcar cuota mensual para eliminar
            cuotasAEliminar.push(cuotaMensual.id)
            
            // Crear primera quincena CON el pago migrado
            const estadoQ1 = calcularNuevoEstado(pagoMigrado, nuevoValorCuota, 'pendiente', fechaQuincena1.vencimiento)
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: pagoMigrado,
              fecha_vencimiento: fechaQuincena1.vencimiento,
              fecha_limite: fechaQuincena1.limite,
              mes, anio, quincena: 1,
              estado: estadoQ1,
              descripcion: `${mesLabel} - 1ra Quincena`
            })
            
            // Crear segunda quincena SIN pago
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: 0,
              fecha_vencimiento: fechaQuincena2.vencimiento,
              fecha_limite: fechaQuincena2.limite,
              mes, anio, quincena: 2,
              estado: calcularEstadoInicial(fechaQuincena2.vencimiento),
              descripcion: `${mesLabel} - 2da Quincena`
            })
          } else {
            // Caso normal: ya era quincenal o no tenía cuotas
            
            // Primera quincena
            if (cuotaQ1) {
              const valorPagado = cuotaQ1.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaQ1.estado, fechaQuincena1.vencimiento)
              datosAnterioresPorId[cuotaQ1.id] = { ...cuotaQ1, socio }
              cuotasAActualizar.push({
                id: cuotaQ1.id,
                fecha_vencimiento: fechaQuincena1.vencimiento,
                fecha_limite: fechaQuincena1.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 1ra Quincena`
              })
            } else {
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaQuincena1.vencimiento,
                fecha_limite: fechaQuincena1.limite,
                mes, anio, quincena: 1,
                estado: calcularEstadoInicial(fechaQuincena1.vencimiento),
                descripcion: `${mesLabel} - 1ra Quincena`
              })
            }

            // Segunda quincena
            if (cuotaQ2) {
              const valorPagado = cuotaQ2.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaQ2.estado, fechaQuincena2.vencimiento)
              datosAnterioresPorId[cuotaQ2.id] = { ...cuotaQ2, socio }
              cuotasAActualizar.push({
                id: cuotaQ2.id,
                fecha_vencimiento: fechaQuincena2.vencimiento,
                fecha_limite: fechaQuincena2.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 2da Quincena`
              })
            } else {
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaQuincena2.vencimiento,
                fecha_limite: fechaQuincena2.limite,
                mes, anio, quincena: 2,
                estado: calcularEstadoInicial(fechaQuincena2.vencimiento),
                descripcion: `${mesLabel} - 2da Quincena`
              })
            }
          }
        } else {
          // CASO: Socio mensual
          
          // CASO: Cambio de quincenal a mensual
          if (cambioAMensual) {
            console.log(`📋 Cambio de periodicidad: ${socio.socio?.nombre || 'Socio'} de QUINCENAL a MENSUAL`)
            
            // Sumar los pagos de ambas quincenas
            const pagoQ1 = cuotaQ1?.valor_pagado || 0
            const pagoQ2 = cuotaQ2?.valor_pagado || 0
            const pagoMigrado = pagoQ1 + pagoQ2
            
            // Guardar para auditoría y marcar para eliminar
            if (cuotaQ1) {
              datosAnterioresPorId[cuotaQ1.id] = { ...cuotaQ1, socio }
              cuotasAEliminar.push(cuotaQ1.id)
            }
            if (cuotaQ2) {
              datosAnterioresPorId[cuotaQ2.id] = { ...cuotaQ2, socio }
              cuotasAEliminar.push(cuotaQ2.id)
            }
            
            migracionesPago.push({
              tipo: 'quincenal_a_mensual',
              socio: socio.socio?.nombre || 'Socio desconocido',
              pagoMigrado,
              pagoQ1,
              pagoQ2,
              cuotasEliminadas: [cuotaQ1?.id, cuotaQ2?.id].filter(Boolean)
            })
            
            // Crear cuota mensual CON los pagos migrados
            const estadoMensual = calcularNuevoEstado(pagoMigrado, nuevoValorCuota, 'pendiente', fechaMensual.vencimiento)
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: pagoMigrado,
              fecha_vencimiento: fechaMensual.vencimiento,
              fecha_limite: fechaMensual.limite,
              mes, anio, quincena: null,
              estado: estadoMensual,
              descripcion: `Cuota ${mesLabel}`
            })
          } else {
            // Caso normal: ya era mensual o no tenía cuotas
            
            if (cuotaMensual) {
              const valorPagado = cuotaMensual.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaMensual.estado, fechaMensual.vencimiento)
              datosAnterioresPorId[cuotaMensual.id] = { ...cuotaMensual, socio }
              cuotasAActualizar.push({
                id: cuotaMensual.id,
                fecha_vencimiento: fechaMensual.vencimiento,
                fecha_limite: fechaMensual.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `Cuota ${mesLabel}`
              })
            } else {
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaMensual.vencimiento,
                fecha_limite: fechaMensual.limite,
                mes, anio, quincena: null,
                estado: calcularEstadoInicial(fechaMensual.vencimiento),
                descripcion: `Cuota ${mesLabel}`
              })
            }
          }
        }
      }

      // PRIMERO: Eliminar cuotas por cambio de periodicidad (antes de crear nuevas)
      let cuotasEliminadas = []
      if (cuotasAEliminar.length > 0) {
        console.log(`🗑️ Eliminando ${cuotasAEliminar.length} cuotas por cambio de periodicidad...`)
        
        const { data: eliminadas, error: deleteError } = await supabase
          .from('cuotas')
          .delete()
          .in('id', cuotasAEliminar)
          .select()
        
        if (deleteError) {
          console.error('Error eliminando cuotas:', deleteError)
          throw deleteError
        }
        cuotasEliminadas = eliminadas || []
        
        // Registrar auditoría de eliminación por cambio de periodicidad
        const auditoriaMigracion = useAuditoria()
        for (const migracion of migracionesPago) {
          const descripcionMigracion = migracion.tipo === 'mensual_a_quincenal'
            ? `Cambio de periodicidad de ${migracion.socio}: Mensual → Quincenal. Pago de $${migracion.pagoMigrado.toLocaleString('es-CO')} migrado a 1ra quincena.`
            : `Cambio de periodicidad de ${migracion.socio}: Quincenal → Mensual. Pagos migrados: Q1=$${migracion.pagoQ1?.toLocaleString('es-CO') || 0} + Q2=$${migracion.pagoQ2?.toLocaleString('es-CO') || 0} = $${migracion.pagoMigrado.toLocaleString('es-CO')}`
          
          registrarAuditoriaEnSegundoPlano(auditoriaMigracion.registrar({
            tipoAccion: 'cambio_periodicidad',
            entidad: 'cuota',
            entidadId: null,
            descripcion: descripcionMigracion,
            datosAnteriores: migracion.tipo === 'mensual_a_quincenal' 
              ? datosAnterioresPorId[migracion.cuotaEliminada] 
              : null,
            datosNuevos: null,
            natilleraId: String(natilleraId),
            detalles: migracion
          }))
        }
      }

      // OPTIMIZACIÓN: Ejecutar actualizaciones en paralelo usando Promise.all
      let cuotasActualizadas = []
      if (cuotasAActualizar.length > 0) {
        console.log(`Actualizando ${cuotasAActualizar.length} cuotas en paralelo...`)
        
        const promesasActualizacion = cuotasAActualizar.map(cuota => 
          supabase
            .from('cuotas')
            .update({
              fecha_vencimiento: cuota.fecha_vencimiento,
              fecha_limite: cuota.fecha_limite,
              valor_cuota: cuota.valor_cuota,
              estado: cuota.estado,
              descripcion: cuota.descripcion
            })
            .eq('id', cuota.id)
            .select()
            .single()
        )
        
        const resultados = await Promise.all(promesasActualizacion)
        cuotasActualizadas = resultados
          .filter(r => !r.error && r.data)
          .map(r => r.data)
        
        // Verificar errores
        const errores = resultados.filter(r => r.error)
        if (errores.length > 0) {
          console.warn('Errores en algunas actualizaciones:', errores.map(e => e.error.message))
        }
      }

      // OPTIMIZACIÓN: Insertar todas las cuotas nuevas en UN solo batch
      let cuotasCreadas = []
      if (cuotasACrear.length > 0) {
        console.log(`Insertando ${cuotasACrear.length} cuotas nuevas...`)
        
        const { data, error: insertError } = await supabase
          .from('cuotas')
          .insert(cuotasACrear)
          .select()

        if (insertError) throw insertError
        cuotasCreadas = data || []
      }

      // OPTIMIZACIÓN: Registrar auditoría en segundo plano (sin bloquear)
      const auditoria = useAuditoria()
      const natilleraIdStr = String(natilleraId || '')
      
      // Crear mapeo de socio_natillera_id a nombre del socio
      const socioNombreMap = {}
      sociosNatillera.forEach(s => {
        socioNombreMap[s.id] = s.socio?.nombre || 'Socio desconocido'
      })

      // Auditoría para cuotas actualizadas (en segundo plano, sin await)
      cuotasActualizadas.forEach(cuotaActualizada => {
        const datosAnteriores = datosAnterioresPorId[cuotaActualizada.id]
        if (datosAnteriores) {
          const nombreSocio = datosAnteriores.socio?.socio?.nombre || socioNombreMap[cuotaActualizada.socio_natillera_id] || 'Socio desconocido'
          const tipoQuincena = cuotaActualizada.quincena === 1 ? '1ra quincena' : cuotaActualizada.quincena === 2 ? '2da quincena' : 'mensual'
          
          registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
            'cuota',
            String(cuotaActualizada.id),
            `Se actualizó cuota ${tipoQuincena} de ${mesLabel || `${mes}/${anio}`} para ${nombreSocio}`,
            datosAnteriores,
            cuotaActualizada,
            natilleraIdStr,
            { socio_nombre: nombreSocio, socio_natillera_id: cuotaActualizada.socio_natillera_id }
          ))
        }
      })

      // Auditoría para cuotas creadas (en segundo plano, sin await)
      cuotasCreadas.forEach(cuotaCreada => {
        const nombreSocio = socioNombreMap[cuotaCreada.socio_natillera_id] || 'Socio desconocido'
        const descripcion = cuotaCreada.quincena 
          ? `Se generó cuota ${cuotaCreada.quincena === 1 ? '1ra' : '2da'} quincena de ${mesLabel || `${cuotaCreada.mes}/${cuotaCreada.anio}`} para ${nombreSocio}`
          : `Se generó cuota mensual de ${mesLabel || `${cuotaCreada.mes}/${cuotaCreada.anio}`} para ${nombreSocio}`
        
        registrarAuditoriaEnSegundoPlano(auditoria.registrarGeneracion(
          'cuota',
          String(cuotaCreada.id),
          descripcion,
          cuotaCreada,
          natilleraIdStr,
          {
            socio_nombre: nombreSocio,
            socio_natillera_id: cuotaCreada.socio_natillera_id,
            mes: cuotaCreada.mes,
            anio: cuotaCreada.anio,
            quincena: cuotaCreada.quincena,
            valor_cuota: cuotaCreada.valor_cuota
          }
        ))
      })

      // Actualizar el array local de cuotas
      const todasLasCuotas = [...cuotasActualizadas, ...cuotasCreadas]
      
      todasLasCuotas.forEach(cuota => {
        const index = cuotas.value.findIndex(c => c.id === cuota.id)
        if (index !== -1) {
          cuotas.value[index] = cuota
        } else {
          cuotas.value.push(cuota)
        }
      })

      // Actualizar estado de mora (no bloquear, ejecutar en segundo plano)
      actualizarEstadoMoraAutomatico(todasLasCuotas).catch(console.error)

      const tiempoFin = performance.now()
      console.log('=== RESUMEN GENERACIÓN ===')
      if (cuotasEliminadas.length > 0) {
        console.log(`🗑️ Cuotas eliminadas (cambio periodicidad): ${cuotasEliminadas.length}`)
      }
      console.log(`📝 Cuotas actualizadas: ${cuotasActualizadas.length}`)
      console.log(`✅ Cuotas creadas: ${cuotasCreadas.length}`)
      if (migracionesPago.length > 0) {
        console.log(`💰 Pagos migrados:`)
        migracionesPago.forEach(m => {
          console.log(`   - ${m.socio}: $${m.pagoMigrado.toLocaleString('es-CO')} (${m.tipo})`)
        })
      }
      console.log(`⏱️ Tiempo total: ${(tiempoFin - tiempoInicio).toFixed(0)}ms`)
      console.log('=========================')

      return { success: true, data: todasLasCuotas }
    } catch (e) {
      error.value = e.message
      console.error('Error generando cuotas:', e)
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
      // Considerar la multa en el total a pagar para determinar si está completamente pagada
      const totalAPagar = (cuotaActual.valor_cuota || 0) + (cuotaActual.valor_multa || 0)
      const nuevaEstado = nuevoValorPagado >= totalAPagar 
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
      
      // Obtener natillera_id y nombre del socio desde la cuota
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id, socio:socios(nombre)')
        .eq('id', cuotaActual.socio_natillera_id)
        .single()
      
      const nombreSocio = socioNatillera?.socio?.nombre || 'Socio desconocido'
      const esPagoParcial = nuevoValorPagado > 0 && nuevoValorPagado < totalAPagar
      const tieneMulta = (cuotaActual.valor_multa || 0) > 0
      let descripcion
      if (esPagoParcial) {
        descripcion = tieneMulta
          ? `Se registró pago parcial de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (Total: $${nuevoValorPagado.toLocaleString('es-CO')} de $${totalAPagar.toLocaleString('es-CO')} incl. multa)`
          : `Se registró pago parcial de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (Total: $${nuevoValorPagado.toLocaleString('es-CO')} de $${totalAPagar.toLocaleString('es-CO')})`
      } else if (nuevaEstado === 'pagada') {
        descripcion = tieneMulta
          ? `Se registró pago completo de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (incluye multa de $${cuotaActual.valor_multa.toLocaleString('es-CO')})`
          : `Se registró pago completo de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio}`
      } else {
        descripcion = `Se registró pago de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio}`
      }
      
      // Asegurar que los IDs sean strings válidos
      const cuotaIdStr = typeof cuotaId === 'string' ? cuotaId : String(cuotaId || '')
      const natilleraIdStr = socioNatillera?.natillera_id ? String(socioNatillera.natillera_id) : null
      
      // Registrar auditoría en segundo plano
      registrarAuditoriaEnSegundoPlano(auditoria.registrarPago(
        cuotaIdStr,
        descripcion,
        data,
        natilleraIdStr,
        {
          socio_nombre: nombreSocio,
          socio_natillera_id: cuotaActual.socio_natillera_id,
          valor_pagado_anterior: cuotaActual.valor_pagado || 0,
          valor_pagado_nuevo: nuevoValorPagado,
          valor_pagado_agregado: valorPagado,
          valor_cuota: cuotaActual.valor_cuota,
          valor_multa: cuotaActual.valor_multa || 0,
          total_a_pagar: totalAPagar,
          estado_anterior: cuotaActual.estado,
          estado_nuevo: nuevaEstado,
          codigo_comprobante: codigoComprobante,
          codigo_comprobante_anterior: codigoAnterior
        }
      ))

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
      
      // Obtener natillera_id y nombre del socio desde la cuota
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id, socio:socios(nombre)')
        .eq('id', datosAnteriores?.socio_natillera_id || data.socio_natillera_id)
        .single()
      
      const nombreSocio = socioNatillera?.socio?.nombre || 'Socio desconocido'
      
      // Asegurar que los IDs sean strings válidos
      const cuotaIdStr = typeof cuotaId === 'string' ? cuotaId : String(cuotaId || '')
      const natilleraIdStr = socioNatillera?.natillera_id ? String(socioNatillera.natillera_id) : null
      
      // Generar descripción con el nombre del socio (en segundo plano)
      registrarAuditoriaEnSegundoPlano(auditoria.registrarActualizacion(
        'cuota',
        cuotaIdStr,
        `Se actualizó cuota de ${nombreSocio}`,
        datosAnteriores,
        data,
        natilleraIdStr,
        { 
          campos_modificados: Object.keys(datos),
          socio_nombre: nombreSocio,
          socio_natillera_id: datosAnteriores?.socio_natillera_id || data.socio_natillera_id
        }
      ))

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
    recalcularMultasCuotasMora,
    calcularMultaDinamica,
    calcularSancionesTotales,
    calcularResumenCuotas,
    getCuotasPorMes,
    getResumenPorMes,
    generarCuotasAutomaticas,
    buscarCuotaPorCodigo,
    actualizarCuota
  }
})

