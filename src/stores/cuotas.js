import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../composables/useAuditoria'

export const useCuotasStore = defineStore('cuotas', () => {
  const cuotas = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Mapa para rastrear qué natilleras están generando cuotas (evitar ejecuciones paralelas)
  const generandoCuotasPorNatillera = new Map()

  // Función para actualizar la referencia de socio_natillera en las cuotas ya cargadas
  function actualizarSocioNatilleraEnCuotas(socioNatilleraId, datosActualizados) {
    cuotas.value.forEach(cuota => {
      if (cuota.socio_natillera?.id === socioNatilleraId) {
        if (cuota.socio_natillera) {
          Object.assign(cuota.socio_natillera, datosActualizados)
        }
      }
    })
  }

  // Opción skipMoraUpdate para cargas rápidas cuando solo necesitamos los datos
  // sin recalcular mora/multas (útil después de generar cuotas nuevas)
  async function fetchCuotasNatillera(natilleraId, opciones = {}) {
    const { skipMoraUpdate = false } = opciones
    
    try {
      loading.value = true
      error.value = null

      // Primero obtener los IDs de socios_natillera de esta natillera
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, periodicidad, socio:socios(*)')
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
      
      // Solo actualizar mora/multas si no se salta (primera carga o cuando hay cambios)
      if (!skipMoraUpdate) {
        // Actualizar automáticamente el estado de cuotas en mora y aplicar sanciones
        await actualizarEstadoMoraAutomatico(cuotasConSocio, natilleraId)
        
        // Recalcular multas para cuotas que ya están en mora pero no tienen multa aplicada
        await recalcularMultasCuotasMora(natilleraId)
      }
      
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

  // Función para obtener el valor de sanción para una posición específica (escalonada acumulativa)
  function obtenerValorSancionPorPosicion(configSanciones, posicion) {
    if (!configSanciones || !configSanciones.activa) {
      return 0
    }

    if (configSanciones.tipo === 'simple') {
      return configSanciones.valorFijo || 0
    } else if (configSanciones.tipo === 'escalonada') {
      const niveles = configSanciones.niveles || []
      if (niveles.length === 0) return 0

      // Ordenar niveles por cantidad de cuotas (ascendente)
      const nivelesOrdenados = [...niveles].sort((a, b) => a.cuotas - b.cuotas)
      
      // Buscar el nivel que corresponde exactamente a la posición
      for (const nivel of nivelesOrdenados) {
        if (posicion <= nivel.cuotas) {
          return nivel.valor || 0
        }
      }
      
      // Si la posición es mayor que todos los niveles, usar el último nivel
      return nivelesOrdenados[nivelesOrdenados.length - 1]?.valor || 0
    }

    return 0
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
      // Obtener configuración de sanciones y periodicidad de la natillera
      const { data: natillera } = await supabase
        .from('natilleras')
        .select('reglas_multas, periodicidad')
        .eq('id', natilleraId)
        .single()

      // reglas_multas puede venir como objeto o como string (JSON) desde Supabase
      let reglasMultas = natillera?.reglas_multas
      if (typeof reglasMultas === 'string') {
        try {
          reglasMultas = JSON.parse(reglasMultas)
        } catch (_) {
          reglasMultas = null
        }
      }
      const configSanciones = reglasMultas?.sanciones || null
      const diasGracia = reglasMultas?.dias_gracia ?? 3
      const periodicidadNatillera = natillera?.periodicidad || 'mensual'

      // Buscar intereses adicionales en cualquier clave que lo contenga (interesesAdicionales, intereses_adicionales, etc.)
      let interesesConfig = configSanciones?.interesesAdicionales ?? configSanciones?.intereses_adicionales
      if (interesesConfig == null && configSanciones && typeof configSanciones === 'object') {
        const key = Object.keys(configSanciones).find(k => /interes/i.test(k))
        if (key) interesesConfig = configSanciones[key]
      }
      interesesConfig = interesesConfig && typeof interesesConfig === 'object' ? interesesConfig : {}
      const interesesActivo = interesesConfig.activo === true || interesesConfig.activo === 'true' || interesesConfig.activo === 1
      const interesesDias = Math.max(1, Number(interesesConfig.dias) || 2)
      const interesesValor = Number(interesesConfig.valor) || 0

      // Log: configuración de sanciones por días extras (intereses adicionales por día)
      console.log('📋 [Sanciones días extras] Configuración:', {
        activo: interesesActivo,
        activoRaw: interesesConfig.activo,
        cadaXDias: interesesDias,
        valorPorPeriodo: interesesValor,
        diasGraciaNatillera: diasGracia,
        clavesSanciones: configSanciones ? Object.keys(configSanciones) : [],
        reglasMultasTipo: typeof natillera?.reglas_multas,
        descripcion: interesesActivo
          ? `Cada ${interesesDias} día(s) se suma $${interesesValor.toLocaleString('es-CO')} a la sanción (días de gracia: ${diasGracia})`
          : 'Inactivo'
      })

      console.log('🔧 Configuración de sanciones:', JSON.stringify(configSanciones, null, 2))
      console.log('📅 Días de gracia (para intereses por tramo):', diasGracia)

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
      const cuotasMora = lista.filter(c => c.estado === 'mora')
      
      // Agrupar cuotas en mora por socio y ordenarlas por fecha de vencimiento
      const cuotasPorSocio = {}
      cuotasMora.forEach(c => {
        if (!cuotasPorSocio[c.socio_natillera_id]) {
          cuotasPorSocio[c.socio_natillera_id] = []
        }
        cuotasPorSocio[c.socio_natillera_id].push(c)
      })

      // Ordenar cuotas de cada socio por fecha_limite (más antigua primero)
      Object.keys(cuotasPorSocio).forEach(socioId => {
        cuotasPorSocio[socioId].sort((a, b) => {
          const fechaA = new Date(a.fecha_limite || a.fecha_vencimiento || 0)
          const fechaB = new Date(b.fecha_limite || b.fecha_vencimiento || 0)
          return fechaA - fechaB
        })
      })

      // Modelo por racha: la BASE (valor_multa_base) se asigna UNA vez según mora_orden y NUNCA se recalcula.
      // mora_orden = orden en que la cuota entró en mora dentro de la racha. Solo se reinicia cuando el socio queda con cero cuotas en mora.
      const sanciones = {}
      const sancionesBases = {} // Solo cuotas a las que hay que guardar valor_multa_base por primera vez
      const sancionesIntereses = {} // valor_multa_intereses por cuota (recalculado cada vez)
      const nuevosMoraOrden = {} // mora_orden para cuotas nuevas en mora (persistir)
      const nuevasFechasInicioMora = {} // fecha_inicio_mora para cuotas nuevas en mora (persistir)

      function obtenerFechaInicioMora(cuota, diasGraciaVal) {
        if (cuota.fecha_vencimiento) {
          const str = String(cuota.fecha_vencimiento).substring(0, 10)
          const [anio, mes, dia] = str.split('-').map(Number)
          if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null
          const fechaVenc = new Date(anio, mes - 1, dia)
          fechaVenc.setDate(fechaVenc.getDate() + 1) // primer día en mora = día siguiente al vencimiento
          fechaVenc.setHours(0, 0, 0, 0)
          return fechaVenc.toISOString().split('T')[0]
        }
        const fl = cuota.fecha_limite
        if (!fl) return null
        const str = String(fl).substring(0, 10)
        const [anio, mes, dia] = str.split('-').map(Number)
        if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null
        const fechaVenc = new Date(anio, mes - 1, dia)
        fechaVenc.setDate(fechaVenc.getDate() + (diasGraciaVal || 0) + 1) // fecha_limite + dias_gracia + 1 = primer día en mora
        fechaVenc.setHours(0, 0, 0, 0)
        return fechaVenc.toISOString().split('T')[0]
      }

      Object.keys(cuotasPorSocio).forEach(socioId => {
        const cuotasSocio = cuotasPorSocio[socioId]
        // Ordenar por fecha_limite para asignar mora_orden de forma estable (más antigua primero)
        cuotasSocio.sort((a, b) => {
          const fa = new Date(a.fecha_limite || a.fecha_vencimiento || 0)
          const fb = new Date(b.fecha_limite || b.fecha_vencimiento || 0)
          return fa - fb
        })

        cuotasSocio.forEach((cuota, indexEnSocio) => {
          const tieneMoraOrden = cuota.mora_orden != null && cuota.mora_orden !== ''
          const tieneBasePersistida = cuota.valor_multa_base != null &&
            cuota.valor_multa_base !== '' &&
            Number(cuota.valor_multa_base) > 0

          // BASE (snapshot): si ya tiene mora_orden/valor_multa_base, usarlos y NUNCA recalcular.
          let multaBase = 0
          let moraOrdenCuota = tieneMoraOrden ? Number(cuota.mora_orden) : null
          let fechaInicioMoraCuota = cuota.fecha_inicio_mora ? String(cuota.fecha_inicio_mora).substring(0, 10) : null

          if (tieneBasePersistida && tieneMoraOrden) {
            multaBase = Number(cuota.valor_multa_base)
          } else {
            // Cuota nueva en mora: asignar mora_orden por racha. Procesamos por fecha_limite (más antigua primero).
            const otrasEnMoraConOrden = cuotasSocio.filter(c => c.id !== cuota.id && c.mora_orden != null && c.mora_orden !== '')
            const maxOrden = otrasEnMoraConOrden.length > 0
              ? Math.max(...otrasEnMoraConOrden.map(c => Number(c.mora_orden)))
              : 0
            moraOrdenCuota = maxOrden + 1
            cuota.mora_orden = moraOrdenCuota
            const ordenParaValor = Math.min(moraOrdenCuota, 4)
            if (configSanciones.tipo === 'simple') {
              multaBase = configSanciones.valorFijo || 0
            } else if (configSanciones.tipo === 'escalonada') {
              multaBase = obtenerValorSancionPorPosicion(configSanciones, ordenParaValor)
            }
            if (multaBase > 0) {
              sancionesBases[cuota.id] = multaBase
              nuevosMoraOrden[cuota.id] = moraOrdenCuota
              fechaInicioMoraCuota = obtenerFechaInicioMora(cuota, diasGracia) || fechaInicioMoraCuota
              if (fechaInicioMoraCuota) nuevasFechasInicioMora[cuota.id] = fechaInicioMoraCuota
            }
          }

          // Sanción por días POR TRAMOS: cada cuota solo acumula días desde su inicio de mora hasta el día anterior al vencimiento de la siguiente.
          // Cuota 1: desde vencimiento cuota 1 hasta (día antes vencimiento cuota 2). Última cuota: hasta hoy.
          let interesesAdicionales = 0
          const fechaInicioMoraParaDias = fechaInicioMoraCuota || obtenerFechaInicioMora(cuota, diasGracia)
          if (fechaInicioMoraParaDias && interesesActivo && interesesDias > 0 && interesesValor > 0) {
            const [a, m, d] = fechaInicioMoraParaDias.split('-').map(Number)
            const inicioTramo = new Date(a, m - 1, d)
            inicioTramo.setHours(0, 0, 0, 0)
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            let finTramo = hoy
            const siguienteCuota = cuotasSocio[indexEnSocio + 1]
            if (siguienteCuota) {
              // Día anterior al vencimiento de la siguiente cuota (vencimiento = fecha_vencimiento o fecha_limite + dias_gracia)
              const fvSig = siguienteCuota.fecha_vencimiento
              const flSig = siguienteCuota.fecha_limite
              if (fvSig) {
                const strSig = String(fvSig).substring(0, 10)
                const [aS, mS, dS] = strSig.split('-').map(Number)
                if (!Number.isNaN(aS) && !Number.isNaN(mS) && !Number.isNaN(dS)) {
                  finTramo = new Date(aS, mS - 1, dS)
                  finTramo.setDate(finTramo.getDate() - 1)
                  finTramo.setHours(0, 0, 0, 0)
                }
              } else if (flSig) {
                const strSig = String(flSig).substring(0, 10)
                const [aS, mS, dS] = strSig.split('-').map(Number)
                if (!Number.isNaN(aS) && !Number.isNaN(mS) && !Number.isNaN(dS)) {
                  finTramo = new Date(aS, mS - 1, dS)
                  finTramo.setDate(finTramo.getDate() + (diasGracia || 0) - 1)
                  finTramo.setHours(0, 0, 0, 0)
                }
              }
            }
            if (finTramo.getTime() < inicioTramo.getTime()) finTramo = new Date(inicioTramo)
            const diasEnTramo = Math.max(0, Math.floor((finTramo - inicioTramo) / (1000 * 60 * 60 * 24)) + 1)
            interesesAdicionales = Math.floor(diasEnTramo / interesesDias) * interesesValor
          }

          sanciones[cuota.id] = multaBase + interesesAdicionales
          sancionesIntereses[cuota.id] = interesesAdicionales
          console.log(`💰 Sanción cuota ${cuota.id}: mora_orden=${moraOrdenCuota ?? 'N/A'}, Base $${multaBase.toLocaleString()} + Intereses (tramo) $${interesesAdicionales.toLocaleString()} = $${(multaBase + interesesAdicionales).toLocaleString()}`)
        })
      })

      // Persistir en BD: valor_multa = base + intereses; valor_multa_base, mora_orden, fecha_inicio_mora solo primera vez; valor_multa_intereses siempre.
      if (Object.keys(sanciones).length > 0) {
        const updates = Object.entries(sanciones).map(([cuotaId, valor]) => {
          const payload = {
            valor_multa: Number(valor),
            valor_multa_intereses: Number(sancionesIntereses[cuotaId] ?? 0)
          }
          if (sancionesBases[cuotaId] != null) {
            payload.valor_multa_base = Number(sancionesBases[cuotaId])
          }
          if (nuevosMoraOrden[cuotaId] != null) {
            payload.mora_orden = Number(nuevosMoraOrden[cuotaId])
          }
          if (nuevasFechasInicioMora[cuotaId]) {
            payload.fecha_inicio_mora = nuevasFechasInicioMora[cuotaId]
          }
          return supabase.from('cuotas').update(payload).eq('id', cuotaId)
        })
        const results = await Promise.all(updates)
        const errores = results.filter(r => r.error)
        if (errores.length > 0) {
          console.warn('📋 [Sanciones] Algunas actualizaciones fallaron:', errores)
        } else {
          console.log('📋 [Sanciones] valor_multa, valor_multa_base (si nueva), mora_orden, fecha_inicio_mora (si nueva), valor_multa_intereses actualizados en BD para', Object.keys(sanciones).length, 'cuotas')
        }
        lista.forEach(c => {
          if (sanciones[c.id] != null) {
            c.valor_multa = sanciones[c.id]
            c.valor_multa_intereses = sancionesIntereses[c.id] ?? 0
            if (sancionesBases[c.id] != null) {
              c.valor_multa_base = sancionesBases[c.id]
            }
            if (nuevosMoraOrden[c.id] != null) {
              c.mora_orden = nuevosMoraOrden[c.id]
            }
            if (nuevasFechasInicioMora[c.id]) {
              c.fecha_inicio_mora = nuevasFechasInicioMora[c.id]
            }
          }
        })
      }

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
  // Reglas según REGLAS.md:
  // - Programada: fecha_actual < fecha_limite
  // - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
  // - En Mora: fecha_actual > fecha_vencimiento
  // - Pagada: valor_pagado >= (valor_cuota + valor_multa)
  async function actualizarEstadoMoraAutomatico(cuotasLista = null, natilleraId = null) {
    try {
      const lista = cuotasLista || cuotas.value
      if (!lista || lista.length === 0) return

      // Obtener fecha actual (solo fecha, sin hora)
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)
      const fechaActualStr = fechaActual.toISOString().split('T')[0] // YYYY-MM-DD

      // Separar cuotas por estado a actualizar
      const cuotasAProgramada = [] // pendiente -> programada (corrección si fecha_actual < fecha_limite)
      const cuotasAPendiente = [] // programada -> pendiente
      const cuotasAMora = [] // pendiente/parcial -> mora (solo las que no tienen multa ya aplicada)

      lista.forEach(cuota => {
        // Solo procesar cuotas que no estén pagadas completamente (incluyendo sanción)
        const totalAPagar = (cuota.valor_cuota || 0) + (cuota.valor_multa || 0)
        if ((cuota.valor_pagado || 0) >= totalAPagar) return

        // Usar ambas fechas según REGLAS.md
        const fechaVencimiento = cuota.fecha_vencimiento || cuota.fecha_limite
        const fechaLimite = cuota.fecha_limite || cuota.fecha_vencimiento
        if (!fechaLimite) return

        const fechaVencimientoDate = new Date(fechaVencimiento)
        fechaVencimientoDate.setHours(0, 0, 0, 0)
        
        const fechaLimiteDate = new Date(fechaLimite)
        fechaLimiteDate.setHours(0, 0, 0, 0)
        
        const fechaLimiteStr = fechaLimiteDate.toISOString().split('T')[0]
        const fechaVencimientoStr = fechaVencimientoDate.toISOString().split('T')[0]

        // Corregir estado según las reglas, considerando pagos parciales:
        // - Pendiente/Parcial -> Programada si fecha_actual < fecha_limite
        // - Programada -> Pendiente si fecha_actual >= fecha_limite
        // - Pendiente/Parcial -> Mora si fecha_actual > fecha_vencimiento
        
        // Pendiente/Parcial -> Programada: si fecha_actual < fecha_limite
        // (aplica tanto para cuotas sin pago como con pago parcial)
        if ((cuota.estado === 'pendiente' || cuota.estado === 'parcial') && fechaActualStr < fechaLimiteStr) {
          cuotasAProgramada.push(cuota.id)
        }
        // Programada -> Pendiente: cuando fecha_actual >= fecha_limite
        // (aplica tanto para cuotas sin pago como con pago parcial)
        else if (cuota.estado === 'programada' && fechaActualStr >= fechaLimiteStr && fechaActualStr <= fechaVencimientoStr) {
          cuotasAPendiente.push(cuota.id)
        }
        // Pendiente/Parcial -> Mora: cuando fecha_actual > fecha_vencimiento
        // Solo si no está ya en mora (evitar reprocesar)
        else if ((cuota.estado === 'pendiente' || cuota.estado === 'parcial') && fechaActualStr > fechaVencimientoStr) {
          cuotasAMora.push({
            id: cuota.id,
            socio_natillera_id: cuota.socio_natillera_id,
            yaTeníaMulta: (cuota.valor_multa || 0) > 0
          })
        }
      })

      const actualizaciones = []

      // Corregir cuotas a programada (si estaban mal marcadas como pendiente)
      if (cuotasAProgramada.length > 0) {
        console.log(`🔄 Corrigiendo ${cuotasAProgramada.length} cuota(s) de pendiente a programada`)
        const { data: actualizadasProgramada, error: errorProgramada } = await supabase
          .from('cuotas')
          .update({ estado: 'programada' })
          .in('id', cuotasAProgramada)
          .select()

        if (errorProgramada) {
          console.error('Error actualizando cuotas a programada:', errorProgramada)
        } else if (actualizadasProgramada) {
          actualizaciones.push(...actualizadasProgramada)
        }
      }

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
        // Obtener la configuración de sanciones y periodicidad de la natillera
        let configSanciones = null
        let periodicidadNatillera = 'mensual'
        let diasGraciaMora = 3

        if (natilleraId) {
          const { data: natillera } = await supabase
            .from('natilleras')
            .select('reglas_multas, periodicidad')
            .eq('id', natilleraId)
            .single()
          let reglasMultasMora = natillera?.reglas_multas
          if (typeof reglasMultasMora === 'string') {
            try { reglasMultasMora = JSON.parse(reglasMultasMora) } catch (_) { reglasMultasMora = null }
          }
          diasGraciaMora = reglasMultasMora?.dias_gracia ?? 3
          configSanciones = reglasMultasMora?.sanciones || natillera?.reglas_multas?.sanciones || null
          periodicidadNatillera = natillera?.periodicidad || 'mensual'
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
              .select('reglas_multas, periodicidad')
              .eq('id', socioNatillera.natillera_id)
              .single()
            let reglasMultasMora2 = natillera?.reglas_multas
            if (typeof reglasMultasMora2 === 'string') {
              try { reglasMultasMora2 = JSON.parse(reglasMultasMora2) } catch (_) { reglasMultasMora2 = null }
            }
            diasGraciaMora = reglasMultasMora2?.dias_gracia ?? 3
            configSanciones = reglasMultasMora2?.sanciones || null
            periodicidadNatillera = natillera?.periodicidad || 'mensual'
          }
        }

        // Si las sanciones están activas, calcular multas de forma acumulativa
        // Declarar todasCuotasMoraPorSocio fuera del if para que esté disponible en todo el bloque
        let todasCuotasMoraPorSocio = {}
        
        if (configSanciones?.activa) {
          // Obtener todas las cuotas en mora existentes de los socios afectados
          const socioIds = [...new Set(cuotasAMora.map(c => c.socio_natillera_id))]
          
          // Obtener todas las cuotas en mora (ya existentes + las que están pasando a mora)
          // Primero obtener las que ya están en mora desde la lista local
          const cuotasMoraExistentes = lista.filter(c => 
            c.estado === 'mora' && socioIds.includes(c.socio_natillera_id)
          )
          
          // Agregar las cuotas que están pasando a mora ahora
          cuotasAMora.forEach(c => {
            const cuotaCompleta = lista.find(lc => lc.id === c.id)
            if (cuotaCompleta) {
              // Verificar que no esté ya en la lista (evitar duplicados)
              if (!cuotasMoraExistentes.find(ce => ce.id === cuotaCompleta.id)) {
                cuotasMoraExistentes.push(cuotaCompleta)
              }
            }
          })
          
          // Si hay cuotas en la lista local, usarlas
          if (cuotasMoraExistentes.length > 0) {
            cuotasMoraExistentes.forEach(c => {
              if (!todasCuotasMoraPorSocio[c.socio_natillera_id]) {
                todasCuotasMoraPorSocio[c.socio_natillera_id] = []
              }
              todasCuotasMoraPorSocio[c.socio_natillera_id].push(c)
            })
          } else {
            // Si no hay en la lista local, consultar BD
            const { data: cuotasMoraBD } = await supabase
              .from('cuotas')
              .select('id, socio_natillera_id, fecha_limite, fecha_vencimiento, quincena, valor_multa, valor_multa_base, valor_multa_intereses, mora_orden, fecha_inicio_mora')
              .in('socio_natillera_id', socioIds)
              .eq('estado', 'mora')
            
            // Obtener periodicidad de los socios
            const { data: sociosNatillera } = await supabase
              .from('socios_natillera')
              .select('id, periodicidad')
              .in('id', socioIds)
            
            const periodicidadPorSocio = {}
            ;(sociosNatillera || []).forEach(sn => {
              periodicidadPorSocio[sn.id] = sn.periodicidad || 'mensual'
            })
            
            // Convertir a formato compatible
            ;(cuotasMoraBD || []).forEach(c => {
              if (!todasCuotasMoraPorSocio[c.socio_natillera_id]) {
                todasCuotasMoraPorSocio[c.socio_natillera_id] = []
              }
              todasCuotasMoraPorSocio[c.socio_natillera_id].push({
                ...c,
                socio_natillera: { periodicidad: periodicidadPorSocio[c.socio_natillera_id] }
              })
            })
            
            // Agregar también las cuotas que están pasando a mora
            cuotasAMora.forEach(c => {
              const cuotaCompleta = lista.find(lc => lc.id === c.id)
              if (cuotaCompleta) {
                if (!todasCuotasMoraPorSocio[cuotaCompleta.socio_natillera_id]) {
                  todasCuotasMoraPorSocio[cuotaCompleta.socio_natillera_id] = []
                }
                // Verificar que no esté ya en la lista
                if (!todasCuotasMoraPorSocio[cuotaCompleta.socio_natillera_id].find(ce => ce.id === cuotaCompleta.id)) {
                  todasCuotasMoraPorSocio[cuotaCompleta.socio_natillera_id].push(cuotaCompleta)
                }
              }
            })
          }
          
          // Ordenar cuotas de cada socio por fecha_limite
          Object.keys(todasCuotasMoraPorSocio).forEach(socioId => {
            todasCuotasMoraPorSocio[socioId].sort((a, b) => {
              const fechaA = new Date(a.fecha_limite || a.fecha_vencimiento || 0)
              const fechaB = new Date(b.fecha_limite || b.fecha_vencimiento || 0)
              return fechaA - fechaB
            })
          })
        }

        // Modelo por racha: asignar mora_orden y valor_multa_base al pasar a mora (una sola vez).
        const multasCalculadas = new Map() // Map<cuotaId, valorMulta>
        const moraOrdenCalculado = new Map() // Map<cuotaId, mora_orden>
        const fechaInicioMoraCalculada = new Map() // Map<cuotaId, fecha_inicio_mora YYYY-MM-DD>

        function obtenerFechaInicioMoraMora(cuota, diasGraciaVal) {
          if (cuota.fecha_vencimiento) {
            const str = String(cuota.fecha_vencimiento).substring(0, 10)
            const [anio, mes, dia] = str.split('-').map(Number)
            if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null
            const fechaVenc = new Date(anio, mes - 1, dia)
            fechaVenc.setDate(fechaVenc.getDate() + 1)
            fechaVenc.setHours(0, 0, 0, 0)
            return fechaVenc.toISOString().split('T')[0]
          }
          const fl = cuota.fecha_limite
          if (!fl) return null
          const str = String(fl).substring(0, 10)
          const [anio, mes, dia] = str.split('-').map(Number)
          if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null
          const fechaVenc = new Date(anio, mes - 1, dia)
          fechaVenc.setDate(fechaVenc.getDate() + (diasGraciaVal || 0) + 1)
          fechaVenc.setHours(0, 0, 0, 0)
          return fechaVenc.toISOString().split('T')[0]
        }

        if (configSanciones?.activa) {
          const cuotasPorSocioParaMulta = {}
          cuotasAMora.forEach(c => {
            if (!cuotasPorSocioParaMulta[c.socio_natillera_id]) {
              cuotasPorSocioParaMulta[c.socio_natillera_id] = []
            }
            cuotasPorSocioParaMulta[c.socio_natillera_id].push(c)
          })

          Object.keys(cuotasPorSocioParaMulta).forEach(socioId => {
            const cuotasMoraSocio = todasCuotasMoraPorSocio[socioId] || []
            const cuotasNuevasPasandoAMora = cuotasAMora
              .filter(ca => ca.socio_natillera_id === socioId && !ca.yaTeníaMulta)
              .map(ca => {
                const cuotaCompleta = lista.find(lc => lc.id === ca.id)
                return cuotaCompleta ? { ...ca, cuotaCompleta } : null
              })
              .filter(c => c !== null)

            cuotasNuevasPasandoAMora.sort((a, b) => {
              const fechaA = new Date(a.cuotaCompleta.fecha_limite || a.cuotaCompleta.fecha_vencimiento || 0)
              const fechaB = new Date(b.cuotaCompleta.fecha_limite || b.cuotaCompleta.fecha_vencimiento || 0)
              return fechaA - fechaB
            })

            // Racha: maxOrden = MAX(mora_orden) de otras cuotas en mora del mismo socio (ya asignadas).
            const otrasEnMoraConOrden = cuotasMoraSocio.filter(c => c.mora_orden != null && c.mora_orden !== '' && !cuotasNuevasPasandoAMora.some(n => n.id === c.id))
            let maxOrden = otrasEnMoraConOrden.length > 0 ? Math.max(...otrasEnMoraConOrden.map(c => Number(c.mora_orden))) : 0

            console.log(`🔍 Socio ${socioId}: ${cuotasMoraSocio.length} cuotas en mora, ${cuotasNuevasPasandoAMora.length} nuevas pasando a mora, maxOrden=${maxOrden}`)

            cuotasNuevasPasandoAMora.forEach((cuotaInfo) => {
              const cuotaActual = cuotaInfo.cuotaCompleta
              if (!cuotaActual) return

              const moraOrden = maxOrden + 1
              maxOrden = moraOrden
              const ordenParaValor = Math.min(moraOrden, 4) // Escalón máximo 4 (no expulsión)

              let valorMulta = 0
              if (configSanciones.tipo === 'simple') {
                valorMulta = configSanciones.valorFijo || 0
              } else if (configSanciones.tipo === 'escalonada') {
                valorMulta = obtenerValorSancionPorPosicion(configSanciones, ordenParaValor)
              }

              const fechaInicioMora = obtenerFechaInicioMoraMora(cuotaActual, diasGraciaMora)

              multasCalculadas.set(cuotaInfo.id, valorMulta)
              moraOrdenCalculado.set(cuotaInfo.id, moraOrden)
              if (fechaInicioMora) fechaInicioMoraCalculada.set(cuotaInfo.id, fechaInicioMora)
              console.log(`  ✅ Cuota ${cuotaInfo.id}: mora_orden=${moraOrden}, Base $${valorMulta.toLocaleString('es-CO')}, fecha_inicio_mora=${fechaInicioMora || 'N/A'}`)
            })
          })
        }
        
        // Actualizar cada cuota a mora con multa, mora_orden y fecha_inicio_mora (modelo por racha)
        for (const cuotaInfo of cuotasAMora) {
          const datosActualizar = {
            estado: 'mora',
            fecha_mora: fechaActualStr
          }

          const cuotaActual = lista.find(c => c.id === cuotaInfo.id)
          const valorMultaExistente = parseFloat(cuotaActual?.valor_multa) || 0
          const valorMultaCalculada = multasCalculadas.get(cuotaInfo.id)
          const tieneBasePersistida = cuotaActual?.valor_multa_base != null && cuotaActual?.valor_multa_base !== '' && Number(cuotaActual?.valor_multa_base) > 0
          const moraOrdenNuevo = moraOrdenCalculado.get(cuotaInfo.id)
          const fechaInicioMoraNueva = fechaInicioMoraCalculada.get(cuotaInfo.id)

          if (valorMultaCalculada !== undefined && valorMultaCalculada > 0) {
            if (configSanciones?.tipo === 'escalonada' && valorMultaExistente > 0 && valorMultaCalculada < valorMultaExistente) {
              datosActualizar.valor_multa = valorMultaExistente
            } else {
              datosActualizar.valor_multa = valorMultaCalculada
              if (!tieneBasePersistida) {
                datosActualizar.valor_multa_base = valorMultaCalculada
                datosActualizar.valor_multa_intereses = 0
                if (moraOrdenNuevo != null) datosActualizar.mora_orden = Number(moraOrdenNuevo)
                if (fechaInicioMoraNueva) datosActualizar.fecha_inicio_mora = fechaInicioMoraNueva
              }
            }
          } else if (cuotaInfo.yaTeníaMulta) {
            if (cuotaActual?.valor_multa) {
              datosActualizar.valor_multa = cuotaActual.valor_multa
            }
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
        aProgramada: cuotasAProgramada.length,
        aPendiente: cuotasAPendiente.length,
        aMora: cuotasAMora.length
      }
    } catch (e) {
      console.error('Error en actualizarEstadoMoraAutomatico:', e)
      return { success: false, error: e.message }
    }
  }

  // Recalcular multas de cuotas en mora usando el modelo por racha (mora_orden, valor_multa_base, valor_multa_intereses).
  // Delega en calcularSancionesTotales, que asigna mora_orden/valor_multa_base a cuotas nuevas en mora y actualiza intereses.
  async function recalcularMultasCuotasMora(natilleraId) {
    try {
      const resultado = await calcularSancionesTotales(natilleraId)
      const cantidad = resultado.sanciones ? Object.keys(resultado.sanciones).length : 0
      return {
        success: resultado.success,
        recalculadas: cantidad,
        corregidas: 0,
        error: resultado.error
      }
    } catch (e) {
      console.error('Error recalculando multas:', e)
      return { success: false, error: e.message, recalculadas: 0, corregidas: 0 }
    }
  }

  async function generarCuotasPeriodo(natilleraId, fechasLimite, mesLabel = '', mes = null, anio = null, socioId = null) {
    try {
      loading.value = true
      error.value = null

      const tiempoInicio = performance.now()

      // Obtener el nombre de la natillera
      const { data: natillera, error: natilleraError } = await supabase
        .from('natilleras')
        .select('nombre')
        .eq('id', natilleraId)
        .single()

      if (natilleraError) throw natilleraError
      const nombreNatillera = natillera?.nombre || ''

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
        const key = `${cuota.socio_natillera_id}-${cuota.quincena === 0 || cuota.quincena === null || cuota.quincena === undefined ? 'mensual' : cuota.quincena}`
        mapaCuotasExistentes[key] = cuota
      })
      
      console.log('📋 Fechas recibidas en store:', fechasLimite)

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
      
      console.log('📋 Fechas normalizadas en store:', {
        mensual: fechaMensual,
        quincena1: fechaQuincena1,
        quincena2: fechaQuincena2
      })

      // Fecha actual para calcular estado (una sola vez)
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)

      // Helper para calcular estado inicial según REGLAS.md:
      // - Programada: fecha_actual < fecha_limite
      // - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
      // - Mora: fecha_actual > fecha_vencimiento
      const calcularEstadoInicial = (fechaVencimientoStr, fechaLimiteStr) => {
        const [yV, mV, dV] = fechaVencimientoStr.split('-').map(Number)
        const fechaVencimiento = new Date(yV, mV - 1, dV)
        fechaVencimiento.setHours(0, 0, 0, 0)
        
        const [yL, mL, dL] = fechaLimiteStr.split('-').map(Number)
        const fechaLimite = new Date(yL, mL - 1, dL)
        fechaLimite.setHours(0, 0, 0, 0)
        
        if (fechaActual > fechaVencimiento) {
          return 'mora'
        } else if (fechaActual >= fechaLimite) {
          return 'pendiente'
        } else {
          return 'programada'
        }
      }

      // Helper para calcular nuevo estado basado en pagos
      const calcularNuevoEstado = (valorPagado, nuevoValorCuota, estadoActual, fechaVencimientoStr, fechaLimiteStr) => {
        if (valorPagado >= nuevoValorCuota) return 'pagada'
        if (valorPagado > 0) return 'parcial'
        // Si no hay pago, calcular según fecha usando la misma lógica
        return calcularEstadoInicial(fechaVencimientoStr, fechaLimiteStr)
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
            const estadoQ1 = calcularNuevoEstado(pagoMigrado, nuevoValorCuota, 'pendiente', fechaQuincena1.vencimiento, fechaQuincena1.limite)
            const nombreSocio = socio.socio?.nombre || ''
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: pagoMigrado,
              fecha_vencimiento: fechaQuincena1.vencimiento,
              fecha_limite: fechaQuincena1.limite,
              mes, anio, quincena: 1,
              estado: estadoQ1,
              descripcion: `${mesLabel} - 1ra Quincena`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
            
            // Crear segunda quincena SIN pago
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: 0,
              fecha_vencimiento: fechaQuincena2.vencimiento,
              fecha_limite: fechaQuincena2.limite,
              mes, anio, quincena: 2,
              estado: calcularEstadoInicial(fechaQuincena2.vencimiento, fechaQuincena2.limite),
              descripcion: `${mesLabel} - 2da Quincena`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
          } else {
            // Caso normal: ya era quincenal o no tenía cuotas
            
            // Primera quincena
            if (cuotaQ1) {
              const valorPagado = cuotaQ1.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaQ1.estado, fechaQuincena1.vencimiento, fechaQuincena1.limite)
              datosAnterioresPorId[cuotaQ1.id] = { ...cuotaQ1, socio }
              const nombreSocio = socio.socio?.nombre || ''
              cuotasAActualizar.push({
                id: cuotaQ1.id,
                fecha_vencimiento: fechaQuincena1.vencimiento,
                fecha_limite: fechaQuincena1.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 1ra Quincena`,
                nombre_socio: nombreSocio
              })
            } else {
              const nombreSocio = socio.socio?.nombre || ''
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaQuincena1.vencimiento,
                fecha_limite: fechaQuincena1.limite,
                mes, anio, quincena: 1,
                estado: calcularEstadoInicial(fechaQuincena1.vencimiento, fechaQuincena1.limite),
                descripcion: `${mesLabel} - 1ra Quincena`,
                nombre_natillera: nombreNatillera,
                nombre_socio: nombreSocio
              })
            }

            // Segunda quincena
            if (cuotaQ2) {
              const valorPagado = cuotaQ2.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaQ2.estado, fechaQuincena2.vencimiento, fechaQuincena2.limite)
              datosAnterioresPorId[cuotaQ2.id] = { ...cuotaQ2, socio }
              const nombreSocio = socio.socio?.nombre || ''
              cuotasAActualizar.push({
                id: cuotaQ2.id,
                fecha_vencimiento: fechaQuincena2.vencimiento,
                fecha_limite: fechaQuincena2.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `${mesLabel} - 2da Quincena`,
                nombre_socio: nombreSocio
              })
            } else {
              const nombreSocio = socio.socio?.nombre || ''
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaQuincena2.vencimiento,
                fecha_limite: fechaQuincena2.limite,
                mes, anio, quincena: 2,
                estado: calcularEstadoInicial(fechaQuincena2.vencimiento, fechaQuincena2.limite),
                descripcion: `${mesLabel} - 2da Quincena`,
                nombre_natillera: nombreNatillera,
                nombre_socio: nombreSocio
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
            const estadoMensual = calcularNuevoEstado(pagoMigrado, nuevoValorCuota, 'pendiente', fechaMensual.vencimiento, fechaMensual.limite)
            const nombreSocio = socio.socio?.nombre || ''
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: nuevoValorCuota,
              valor_pagado: pagoMigrado,
              fecha_vencimiento: fechaMensual.vencimiento,
              fecha_limite: fechaMensual.limite,
              mes, anio, quincena: null,
              estado: estadoMensual,
              descripcion: `Cuota ${mesLabel}`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
          } else {
            // Caso normal: ya era mensual o no tenía cuotas
            
            if (cuotaMensual) {
              const valorPagado = cuotaMensual.valor_pagado || 0
              const nuevoEstado = calcularNuevoEstado(valorPagado, nuevoValorCuota, cuotaMensual.estado, fechaMensual.vencimiento, fechaMensual.limite)
              datosAnterioresPorId[cuotaMensual.id] = { ...cuotaMensual, socio }
              const nombreSocio = socio.socio?.nombre || ''
              cuotasAActualizar.push({
                id: cuotaMensual.id,
                fecha_vencimiento: fechaMensual.vencimiento,
                fecha_limite: fechaMensual.limite,
                valor_cuota: nuevoValorCuota,
                estado: nuevoEstado,
                descripcion: `Cuota ${mesLabel}`,
                nombre_socio: nombreSocio
              })
            } else {
              const nombreSocio = socio.socio?.nombre || ''
              cuotasACrear.push({
                socio_natillera_id: socio.id,
                valor_cuota: nuevoValorCuota,
                valor_pagado: 0,
                fecha_vencimiento: fechaMensual.vencimiento,
                fecha_limite: fechaMensual.limite,
                mes, anio, quincena: null,
                estado: calcularEstadoInicial(fechaMensual.vencimiento, fechaMensual.limite),
                descripcion: `Cuota ${mesLabel}`,
                nombre_natillera: nombreNatillera,
                nombre_socio: nombreSocio
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
              descripcion: cuota.descripcion,
              nombre_natillera: nombreNatillera,
              nombre_socio: cuota.nombre_socio || null
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
        // Log de las primeras 3 cuotas para verificar fechas
        console.log('📋 Primeras cuotas a insertar (verificando fechas):', cuotasACrear.slice(0, 3).map(c => ({
          socio: c.socio_natillera_id,
          fecha_vencimiento: c.fecha_vencimiento,
          fecha_limite: c.fecha_limite,
          quincena: c.quincena
        })))
        
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

  async function registrarPago(cuotaId, valorPagado, comprobante = null, tipoPago = null, valorActividades = 0) {
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

      // Obtener natillera_id desde socios_natillera
      const { data: socioNatillera, error: socioError } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', cuotaActual.socio_natillera_id)
        .single()

      if (socioError) throw socioError

      const natilleraId = socioNatillera?.natillera_id
      if (!natilleraId) {
        throw new Error('No se pudo obtener la natillera asociada a la cuota')
      }

      // Obtener configuración de sanciones y calcular sanción dinámica si la cuota está en mora
      let sancionDinamica = cuotaActual.valor_multa || 0
      if (cuotaActual.estado === 'mora') {
        const { data: natillera } = await supabase
          .from('natilleras')
          .select('reglas_multas, periodicidad')
          .eq('id', natilleraId)
          .single()
        
        const configSanciones = natillera?.reglas_multas?.sanciones || null
        const diasGracia = natillera?.reglas_multas?.dias_gracia ?? 3
        const periodicidadNatillera = natillera?.periodicidad || 'mensual'
        const interesesConfigPago = configSanciones?.interesesAdicionales ?? configSanciones?.intereses_adicionales ?? {}
        const interesesActivoPago = interesesConfigPago.activo === true || interesesConfigPago.activo === 'true' || interesesConfigPago.activo === 1
        const interesesDiasPago = Number(interesesConfigPago.dias) || 2
        const interesesValorPago = Number(interesesConfigPago.valor) || 0
        console.log('📋 [Sanciones días extras] Al registrar pago:', { activo: interesesActivoPago, activoRaw: interesesConfigPago.activo, cadaXDias: interesesDiasPago, valorPorPeriodo: interesesValorPago, diasGracia })

        if (configSanciones?.activa) {
          // Obtener todas las cuotas en mora del socio ordenadas por fecha
          const { data: cuotasMoraSocio } = await supabase
            .from('cuotas')
            .select('id, fecha_limite, quincena')
            .eq('socio_natillera_id', cuotaActual.socio_natillera_id)
            .eq('estado', 'mora')
            .order('fecha_limite', { ascending: true })
          
          // Obtener periodicidad del socio
          const { data: socioNatilleraInfo } = await supabase
            .from('socios_natillera')
            .select('periodicidad')
            .eq('id', cuotaActual.socio_natillera_id)
            .single()
          
          const periodicidadSocio = socioNatilleraInfo?.periodicidad || 'mensual'
          const esMensualEnQuincenal = periodicidadNatillera === 'quincenal' && periodicidadSocio === 'mensual'
          
          let indiceCuota = -1
          let posicionAcumulativa = 1
          if (cuotasMoraSocio && cuotasMoraSocio.length > 0) {
            indiceCuota = cuotasMoraSocio.findIndex(c => c.id === cuotaActual.id)
            if (indiceCuota !== -1) {
              for (let i = 0; i < indiceCuota; i++) {
                const c = cuotasMoraSocio[i]
                const esMensual = c.quincena === 0 || c.quincena === null
                const esMensualEnQuincenalC = periodicidadNatillera === 'quincenal' && esMensual
                posicionAcumulativa += esMensualEnQuincenalC ? 2 : 1
              }
            }
          }
          
          // BASE: usar valor_multa_base persistido si existe; NUNCA recalcular si ya está guardada
          const tieneBasePersistidaPago = cuotaActual.valor_multa_base != null &&
            cuotaActual.valor_multa_base !== '' &&
            Number(cuotaActual.valor_multa_base) > 0
          let multaBase = 0
          if (tieneBasePersistidaPago) {
            multaBase = Number(cuotaActual.valor_multa_base)
          } else if (configSanciones.tipo === 'simple') {
            multaBase = configSanciones.valorFijo || 0
          } else if (configSanciones.tipo === 'escalonada') {
            if (esMensualEnQuincenal) {
              const sancionPos1 = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa)
              const sancionPos2 = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa + 1)
              multaBase = sancionPos1 + sancionPos2
            } else {
              multaBase = obtenerValorSancionPorPosicion(configSanciones, posicionAcumulativa)
            }
          }
          
          // Intereses adicionales por tramo
          let interesesAdicionales = 0
          const fechaLimiteRaw = cuotaActual.fecha_limite
          const fechaLimiteStr = fechaLimiteRaw ? String(fechaLimiteRaw).substring(0, 10) : ''
          if (fechaLimiteStr && interesesActivoPago && interesesDiasPago > 0 && interesesValorPago > 0) {
            const partes = fechaLimiteStr.split('-')
            const anio = parseInt(partes[0], 10)
            const mes = parseInt(partes[1], 10) - 1
            const dia = parseInt(partes[2], 10)
            if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
              const fechaLimiteCuota = new Date(anio, mes, dia)
              fechaLimiteCuota.setHours(0, 0, 0, 0)
              const hoy = new Date()
              hoy.setHours(0, 0, 0, 0)
              const primeraDiaMora = new Date(fechaLimiteCuota)
              primeraDiaMora.setDate(primeraDiaMora.getDate() + diasGracia + 1)
              let finTramo = hoy
              if (indiceCuota !== -1 && cuotasMoraSocio && indiceCuota + 1 < cuotasMoraSocio.length) {
                const sigRaw = cuotasMoraSocio[indiceCuota + 1].fecha_limite
                const sig = sigRaw ? String(sigRaw).substring(0, 10) : ''
                if (sig) {
                  const [a, m, d] = sig.split('-').map(x => parseInt(x, 10))
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
                interesesAdicionales = Math.round((diasEnMoraTramo / interesesDiasPago) * interesesValorPago)
              }
            }
          }
          
          sancionDinamica = multaBase + interesesAdicionales
        }
      }

      // Para multa escalonada: si la cuota ya tiene valor_multa guardado, usarlo para no recalcular
      // (al pagar la primera cuota en mora, la lista de mora se reduce y la segunda quedaría como "primera" = sanción 1; pero su valor_multa ya es 2)
      const valorMultaGuardado = parseFloat(cuotaActual.valor_multa) || 0
      const sancionAPagar = valorMultaGuardado > 0
        ? valorMultaGuardado
        : (sancionDinamica > 0 ? sancionDinamica : 0)
      const valorCuota = cuotaActual.valor_cuota || 0
      const valorPagadoAnterior = cuotaActual.valor_pagado || 0
      const valorActividadesPendientes = parseFloat(valorActividades) || 0
      
      // IMPORTANTE: Orden de pago según requerimientos:
      // 1. Primero se paga la sanción
      // 2. Segundo se pagan las actividades
      // 3. Tercero se paga la cuota
      
      let valorSancionPagada = 0
      let valorActividadesPagado = 0
      let valorCuotaPagado = 0
      let nuevoValorPagado = valorPagadoAnterior
      let sancionQuitada = false
      let valorRestante = valorPagado
      
      // Paso 1: Pagar sanción primero
      if (sancionAPagar > 0 && valorRestante > 0) {
        if (valorRestante >= sancionAPagar) {
          // El pago cubre la sanción completa
          valorSancionPagada = sancionAPagar
          valorRestante -= sancionAPagar
          sancionQuitada = true
        } else {
          // El pago NO cubre la sanción completa
          valorSancionPagada = valorRestante
          valorRestante = 0
          sancionQuitada = true // Se pagó la sanción (aunque sea parcial)
        }
      }
      
      // Paso 2: Pagar actividades segundo
      if (valorActividadesPendientes > 0 && valorRestante > 0) {
        if (valorRestante >= valorActividadesPendientes) {
          // El pago cubre todas las actividades
          valorActividadesPagado = valorActividadesPendientes
          valorRestante -= valorActividadesPendientes
        } else {
          // El pago NO cubre todas las actividades (pago parcial)
          valorActividadesPagado = valorRestante
          valorRestante = 0
        }
      }
      
      // Paso 3: Pagar cuota tercero (con lo que reste)
      if (valorRestante > 0) {
        const valorCuotaPendiente = valorCuota - valorPagadoAnterior
        if (valorRestante >= valorCuotaPendiente) {
          // El pago cubre la cuota completa
          valorCuotaPagado = valorCuotaPendiente
          valorRestante -= valorCuotaPendiente
        } else {
          // El pago NO cubre la cuota completa (pago parcial)
          valorCuotaPagado = valorRestante
          valorRestante = 0
        }
      }
      
      // Actualizar el valor pagado total (solo cuota, no incluye sanción ni actividades)
      nuevoValorPagado = valorPagadoAnterior + valorCuotaPagado
      
      // Calcular el total a pagar (cuota + sanción pendiente + actividades pendientes)
      // Si la sanción ya se pagó, no se incluye en el total
      const totalAPagar = valorCuota + (sancionQuitada ? 0 : sancionAPagar) + (valorActividadesPagado >= valorActividadesPendientes ? 0 : (valorActividadesPendientes - valorActividadesPagado))
      
      // Calcular el nuevo estado según las reglas:
      // - Pagada: cuando se paga el total completo (cuota + sanciones pendientes)
      // - Si hay pago parcial: calcular estado según fecha (programada, pendiente, mora)
      // - Si no hay pago: mantener estado actual
      let nuevaEstado
      if (nuevoValorPagado >= totalAPagar) {
        nuevaEstado = 'pagada'
      } else if (nuevoValorPagado > 0) {
        // Pago parcial: calcular estado según fecha límite y fecha de vencimiento
        // Según REGLAS.md: cuotas con pago parcial siguen las mismas reglas de estado basadas en fecha
        if (!cuotaActual.fecha_limite) {
          // Si no hay fecha límite, usar 'parcial' como fallback
          nuevaEstado = 'parcial'
        } else {
          const fechaActual = new Date()
          fechaActual.setHours(0, 0, 0, 0)
          
          // Parsear fecha_limite correctamente
          let fechaLimite
          if (typeof cuotaActual.fecha_limite === 'string' && cuotaActual.fecha_limite.includes('-')) {
            const [anio, mes, dia] = cuotaActual.fecha_limite.split('-').map(Number)
            fechaLimite = new Date(anio, mes - 1, dia)
          } else {
            fechaLimite = new Date(cuotaActual.fecha_limite)
          }
          fechaLimite.setHours(0, 0, 0, 0)
          
          // Obtener fecha_vencimiento
          let fechaVencimiento
          if (cuotaActual.fecha_vencimiento) {
            if (typeof cuotaActual.fecha_vencimiento === 'string' && cuotaActual.fecha_vencimiento.includes('-')) {
              const [anio, mes, dia] = cuotaActual.fecha_vencimiento.split('-').map(Number)
              fechaVencimiento = new Date(anio, mes - 1, dia)
            } else {
              fechaVencimiento = new Date(cuotaActual.fecha_vencimiento)
            }
          } else {
            // Si no existe, usar fecha_limite como fallback
            fechaVencimiento = new Date(fechaLimite)
          }
          fechaVencimiento.setHours(0, 0, 0, 0)
          
          // Aplicar reglas de estado según fecha:
          // Programada: fecha_actual < fecha_limite
          if (fechaActual < fechaLimite) {
            nuevaEstado = 'programada'
          }
          // Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
          else if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
            nuevaEstado = 'pendiente'
          }
          // En Mora: fecha_actual > fecha_vencimiento
          else if (fechaActual > fechaVencimiento) {
            nuevaEstado = 'mora'
          } else {
            // Fallback
            nuevaEstado = 'parcial'
          }
        }
      } else {
        // Sin pago: mantener estado actual
        nuevaEstado = cuotaActual.estado
      }

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
      
      // Agregar tipo_pago si se proporciona
      if (tipoPago) {
        updateData.tipo_pago = tipoPago
      }
      
      // Actualizar valor_multa (y desglose base/intereses) en la BD
      // IMPORTANTE: Solo quitar la sanción cuando la cuota esté completamente pagada
      if (nuevaEstado === 'pagada' && sancionQuitada) {
        updateData.valor_multa = 0
        updateData.valor_multa_base = 0
        updateData.valor_multa_intereses = 0
      } else if (sancionQuitada && sancionAPagar > 0) {
        // Se pagó la sanción pero la cuota queda parcial: mantener el valor_multa original
        // para que no se recalcule cuando se llame a calcularSancionesTotales
        // Usar el valor original de la sanción, no 0
        updateData.valor_multa = sancionAPagar
      } else if (sancionDinamica > 0) {
        // Si hay sanción dinámica calculada y no se pagó, usarla
        updateData.valor_multa = sancionDinamica
      } else if (cuotaActual.valor_multa && cuotaActual.valor_multa > 0) {
        // Si no hay sanción dinámica pero ya había una guardada, mantenerla
        updateData.valor_multa = cuotaActual.valor_multa
      }
      
      // Guardar cuánto se abonó a sanción (campo valor_pagado_sancion)
      const sancionPagadaAnterior = parseFloat(cuotaActual.valor_pagado_sancion) || 0
      updateData.valor_pagado_sancion = sancionPagadaAnterior + valorSancionPagada
      
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
      
      // Si falla por columna valor_pagado_sancion (no existe en BD), reintentar sin ella
      if (updateError && updateError.message && (
        updateError.message.includes('valor_pagado_sancion') ||
        (updateError.message.includes('column') && updateData.valor_pagado_sancion !== undefined)
      )) {
        delete updateData.valor_pagado_sancion
        const retryMulta = await supabase
          .from('cuotas')
          .update(updateData)
          .eq('id', cuotaId)
          .select('*')
          .maybeSingle()
        data = retryMulta.data
        updateError = retryMulta.error
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

      // Registrar sanción en utilidades_clasificadas si se pagó una sanción
      // El valor de la sanción pagada es el que se calculó anteriormente (valorSancionPagada)
      // Si se pagó la sanción (sancionQuitada = true), registrar en utilidades
      const debeRegistrarUtilidad = sancionQuitada && valorSancionPagada > 0
      const valorMultaPagada = valorSancionPagada

      console.log('🔍 [UTILIDADES] Verificando registro de sanción:', {
        nuevaEstado,
        valorMultaPagada,
        sancionAPagar,
        valorSancionPagada,
        sancionQuitada,
        totalAPagar,
        nuevoValorPagado,
        estadoAnterior: cuotaActual.estado,
        debeRegistrarUtilidad,
        natilleraId,
        cuotaId
      })

      // REGISTRAR SIEMPRE cuando hay sanción pagada
      if (debeRegistrarUtilidad) {
        console.log('✅ [UTILIDADES] Condición cumplida, procediendo a registrar...')
        try {
          // Obtener todos los socios_natillera de esta natillera
          const { data: sociosNatillera, error: errorSocios } = await supabase
            .from('socios_natillera')
            .select('id')
            .eq('natillera_id', natilleraId)

          if (errorSocios) {
            console.error('Error obteniendo socios_natillera:', errorSocios)
            throw errorSocios
          }

          const socioNatilleraIds = (sociosNatillera || []).map(sn => sn.id)

          if (socioNatilleraIds.length === 0) {
            console.warn('⚠️ [UTILIDADES] No se encontraron socios_natillera para la natillera:', natilleraId)
            // Continuar con el proceso aunque no haya socios, pero registrar la sanción de esta cuota
          }

          // NOTA: Como ahora quitamos la sanción (valor_multa = 0) cuando se paga,
          // no podemos buscar cuotas con valor_multa > 0 para calcular el total.
          // En su lugar, usamos el registro existente en utilidades_clasificadas
          // y le sumamos el valor de la sanción pagada en esta transacción.
          
          // Obtener el registro existente primero para saber el monto actual
          const { data: utilidadExistenteTemp, error: errorUtilidadTemp } = await supabase
            .from('utilidades_clasificadas')
            .select('monto')
            .eq('natillera_id', natilleraId)
            .eq('tipo', 'sanciones')
            .is('fecha_cierre', null)
            .maybeSingle()

          if (errorUtilidadTemp) {
            console.error('Error obteniendo utilidad existente temporal:', errorUtilidadTemp)
            throw errorUtilidadTemp
          }

          // Calcular el monto final: monto existente + sanción pagada en esta transacción
          const montoAnterior = parseFloat(utilidadExistenteTemp?.monto) || 0
          const montoFinal = montoAnterior + valorMultaPagada

          console.log('💰 [UTILIDADES] Total sanciones pagadas calculado:', {
            montoAnterior,
            valorMultaPagada,
            montoFinal
          })
          
          if (montoFinal <= 0) {
            console.warn('⚠️ [UTILIDADES] No hay monto de sanción para registrar')
            return { success: true, data }
          }

          // Obtener el registro existente de utilidades_clasificadas para sanciones
          const { data: utilidadExistente, error: errorUtilidadExistente } = await supabase
            .from('utilidades_clasificadas')
            .select('id, monto')
            .eq('natillera_id', natilleraId)
            .eq('tipo', 'sanciones')
            .is('fecha_cierre', null)
            .maybeSingle()

          if (errorUtilidadExistente) {
            console.error('Error obteniendo utilidad existente:', errorUtilidadExistente)
            throw errorUtilidadExistente
          }

          if (utilidadExistente) {
            // Actualizar el registro existente
            console.log('📝 [UTILIDADES] Actualizando registro existente:', {
              id: utilidadExistente.id,
              montoAnterior: utilidadExistente.monto,
              montoNuevo: montoFinal
            })

            const { data: updatedData, error: updateUtilidadError } = await supabase
              .from('utilidades_clasificadas')
              .update({
                monto: montoFinal,
                descripcion: 'Multas pagadas por cuotas en mora',
                detalles: utilidadExistente.detalles || {},
                updated_at: new Date().toISOString()
              })
              .eq('id', utilidadExistente.id)
              .select()

            if (updateUtilidadError) {
              console.error('❌ [UTILIDADES] Error actualizando utilidad de sanciones:', updateUtilidadError)
              throw updateUtilidadError
            } else {
              console.log('✅ [UTILIDADES] Utilidad de sanciones actualizada correctamente:', updatedData)
            }
          } else {
            // Crear nuevo registro
            console.log('📝 [UTILIDADES] Creando nuevo registro:', {
              natilleraId,
              tipo: 'sanciones',
              monto: montoFinal
            })

            const { data: insertedData, error: insertUtilidadError } = await supabase
              .from('utilidades_clasificadas')
              .insert({
                natillera_id: natilleraId,
                tipo: 'sanciones',
                monto: montoFinal,
                fecha_cierre: null,
                descripcion: 'Multas pagadas por cuotas en mora',
                detalles: {}
              })
              .select()

            if (insertUtilidadError) {
              console.error('❌ [UTILIDADES] Error insertando utilidad de sanciones:', insertUtilidadError)
              throw insertUtilidadError
            } else {
              console.log('✅ [UTILIDADES] Utilidad de sanciones creada correctamente:', insertedData)
            }
          }
        } catch (errorUtilidad) {
          // No fallar el registro de pago si hay error al registrar la utilidad
          console.error('❌ Error registrando sanción en utilidades:', errorUtilidad)
        }
      } else {
        console.log('⏭️ No se registra utilidad de sanción:', {
          razon: !sancionQuitada ? 'No se pagó la sanción' :
                 valorSancionPagada === 0 ? 'No hay sanción pagada' : 'Razón desconocida',
          sancionQuitada,
          valorSancionPagada
        })
      }

      // Registrar auditoría
      const auditoria = useAuditoria()
      
      // Obtener nombre del socio (ya tenemos natilleraId)
      const { data: socioData } = await supabase
        .from('socios_natillera')
        .select('socio:socios(nombre)')
        .eq('id', cuotaActual.socio_natillera_id)
        .single()
      
      const nombreSocio = socioData?.socio?.nombre || 'Socio desconocido'
      const esPagoParcial = nuevoValorPagado > 0 && nuevoValorPagado < totalAPagar
      const tieneMulta = sancionDinamica > 0
      let descripcion
      if (esPagoParcial) {
        descripcion = tieneMulta
          ? `Se registró pago parcial de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (Total: $${nuevoValorPagado.toLocaleString('es-CO')} de $${totalAPagar.toLocaleString('es-CO')} incl. multa de $${sancionDinamica.toLocaleString('es-CO')})`
          : `Se registró pago parcial de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (Total: $${nuevoValorPagado.toLocaleString('es-CO')} de $${totalAPagar.toLocaleString('es-CO')})`
      } else if (nuevaEstado === 'pagada') {
        descripcion = tieneMulta
          ? `Se registró pago completo de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio} (incluye multa de $${sancionDinamica.toLocaleString('es-CO')})`
          : `Se registró pago completo de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio}`
      } else {
        descripcion = `Se registró pago de $${valorPagado.toLocaleString('es-CO')} para ${nombreSocio}`
      }
      
      // Asegurar que los IDs sean strings válidos
      const cuotaIdStr = typeof cuotaId === 'string' ? cuotaId : String(cuotaId || '')
      const natilleraIdStr = natilleraId ? String(natilleraId) : null
      
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
          valor_multa: sancionDinamica, // Usar la sanción dinámica calculada
          valor_multa_anterior: cuotaActual.valor_multa || 0,
          total_a_pagar: totalAPagar,
          estado_anterior: cuotaActual.estado,
          estado_nuevo: nuevaEstado,
          codigo_comprobante: codigoComprobante,
          codigo_comprobante_anterior: codigoAnterior
        }
      ))

      return { 
        success: true, 
        data,
        valorSancionPagada,
        valorActividadesPagado,
        valorCuotaPagado
      }
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

  // Función para obtener el último día de un mes (28-31 según mes)
  function obtenerUltimoDiaDelMes(mes, anio) {
    // mes es 1-12, JavaScript usa 0-11
    return new Date(anio, mes, 0).getDate()
  }

  // Día límite para segunda quincena y fecha límite mensual: siempre 30, excepto febrero (28 o 29)
  function obtenerDiaLimiteSegundaQuincena(mes, anio) {
    if (mes === 2) return new Date(anio, 2, 0).getDate()
    return 30
  }

  // Generación automática de cuotas para un mes específico
  async function generarCuotasAutomaticas(natilleraId, mes = null, anio = null) {
    try {
      loading.value = true
      error.value = null

      // Obtener información de la natillera (días de gracia y período)
      const { data: natillera, error: natilleraError } = await supabase
        .from('natilleras')
        .select('reglas_multas, mes_inicio, mes_fin, anio, anio_inicio')
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

      // Usar anio_inicio como base, con fallback a anio
      const anioInicioNatillera = natillera.anio_inicio || natillera.anio || anioAGenerar
      const mesInicio = natillera.mes_inicio || 1
      const mesFin = natillera.mes_fin || 11

      // Verificar si el mes está en el rango - CORREGIDO para períodos que cruzan años
      let mesEnRango = false
      if (mesInicio <= mesFin) {
        // Rango normal (ej: Enero a Noviembre) - todos los meses están en el mismo año
        mesEnRango = anioAGenerar === anioInicioNatillera && 
                     mesAGenerar >= mesInicio && 
                     mesAGenerar <= mesFin
      } else {
        // Rango que cruza año (ej: Diciembre a Noviembre)
        // Primera parte del período: mes_inicio a diciembre del año de inicio
        const enPrimeraParte = anioAGenerar === anioInicioNatillera && mesAGenerar >= mesInicio
        // Segunda parte del período: enero a mes_fin del año siguiente
        const enSegundaParte = anioAGenerar === (anioInicioNatillera + 1) && mesAGenerar <= mesFin
        mesEnRango = enPrimeraParte || enSegundaParte
      }

      if (!mesEnRango) {
        console.log(`⚠️ Mes ${mesAGenerar}/${anioAGenerar} fuera del rango [${mesInicio}/${anioInicioNatillera} - ${mesFin}/${mesInicio > mesFin ? anioInicioNatillera + 1 : anioInicioNatillera}]`)
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

      // Calcular fechas límite (sin días de gracia) y fechas de vencimiento (con días de gracia)
      // La fecha límite es el día base (15 o día límite segunda quincena: 30, o 28/29 en febrero)
      // La fecha de vencimiento es la fecha límite + días de gracia
      const ultimoDia = obtenerDiaLimiteSegundaQuincena(mesAGenerar, anioAGenerar)
      
      // Función helper para formatear fecha sin problemas de zona horaria
      const formatearFecha = (anio, mes, dia) => {
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      }
      
      // Función helper para calcular fecha sumando días de gracia (mes efectivo termina en día 30 o 28/29 feb)
      const calcularFechaConDiasGracia = (anio, mes, dia, diasGracia) => {
        const diasEnMes = obtenerDiaLimiteSegundaQuincena(mes, anio)
        const diaFinal = dia + diasGracia
        let anioFinal = anio
        let mesFinal = mes
        let diaResultado = diaFinal
        
        console.log(`  Calculando fecha con días de gracia: ${dia}/${mes}/${anio} + ${diasGracia} días`)
        console.log(`  Días en mes: ${diasEnMes}, Día final calculado: ${diaFinal}`)
        
        // Si el día excede los días del mes, ajustar al mes siguiente
        if (diaResultado > diasEnMes) {
          diaResultado = diaResultado - diasEnMes
          mesFinal = mes + 1
          if (mesFinal > 12) {
            mesFinal = 1
            anioFinal = anio + 1
          }
          console.log(`  Ajustando al mes siguiente: ${diaResultado}/${mesFinal}/${anioFinal}`)
        }
        const fechaResultado = formatearFecha(anioFinal, mesFinal, diaResultado)
        console.log(`  Fecha resultado: ${fechaResultado}`)
        return fechaResultado
      }
      
      // Primera quincena
      // Fecha límite: día 15 (sin días de gracia)
      const fechaLimiteQuincena1Str = formatearFecha(anioAGenerar, mesAGenerar, 15)
      
      // Fecha de vencimiento: día 15 + días de gracia
      const fechaVencimientoQuincena1Str = calcularFechaConDiasGracia(anioAGenerar, mesAGenerar, 15, diasGracia)
      
      console.log('=== CÁLCULO FECHAS AUTOMÁTICAS ===')
      console.log('Días de gracia:', diasGracia)
      console.log('Primera quincena - Límite:', fechaLimiteQuincena1Str, 'Vencimiento:', fechaVencimientoQuincena1Str)

      // Segunda quincena / Mensual
      // Fecha límite: último día del mes (sin días de gracia)
      const fechaLimiteQuincena2Str = formatearFecha(anioAGenerar, mesAGenerar, ultimoDia)
      
      // Fecha de vencimiento: último día del mes + días de gracia
      const fechaVencimientoQuincena2Str = calcularFechaConDiasGracia(anioAGenerar, mesAGenerar, ultimoDia, diasGracia)
      
      console.log('Segunda quincena - Límite:', fechaLimiteQuincena2Str, 'Vencimiento:', fechaVencimientoQuincena2Str)
      console.log('===================================')

      // Obtener nombre del mes
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      const mesLabel = meses[mesAGenerar - 1]

      // Generar las cuotas con ambas fechas
      const fechasParaGenerar = {
        mensual: { vencimiento: fechaVencimientoQuincena2Str, limite: fechaLimiteQuincena2Str },
        quincena1: { vencimiento: fechaVencimientoQuincena1Str, limite: fechaLimiteQuincena1Str },
        quincena2: { vencimiento: fechaVencimientoQuincena2Str, limite: fechaLimiteQuincena2Str }
      }
      
      console.log('📤 Fechas que se envían a generarCuotasPeriodo:', fechasParaGenerar)
      
      const result = await generarCuotasPeriodo(
        natilleraId,
        fechasParaGenerar,
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

  // Función para generar cuotas faltantes para socios que no tienen cuota en un mes
  async function generarCuotasFaltantes(natilleraId, mes = null, anio = null) {
    // Crear clave única para esta operación (natillera + mes + año)
    const claveOperacion = `${natilleraId}-${mes}-${anio}`
    
    // Verificar si ya hay una operación en curso para evitar condiciones de carrera
    if (generandoCuotasPorNatillera.get(claveOperacion)) {
      return { success: true, message: 'Ya hay una generación en curso', cuotasGeneradas: 0, enCurso: true }
    }
    
    // Marcar que estamos generando cuotas para esta natillera/mes/año
    generandoCuotasPorNatillera.set(claveOperacion, true)
    
    try {
      const tiempoInicio = performance.now()
      error.value = null

      // Si no se especifica mes/año, usar el mes actual
      const fechaActual = new Date()
      const mesAGenerar = mes || (fechaActual.getMonth() + 1)
      const anioAGenerar = anio || fechaActual.getFullYear()

      // SUPER OPTIMIZACIÓN: Una sola consulta que trae socios Y natillera EN PARALELO
      const [sociosResult, natilleraResult] = await Promise.all([
        supabase
          .from('socios_natillera')
          .select('id, periodicidad, valor_cuota_individual, socio:socios(id, nombre)')
          .eq('natillera_id', natilleraId)
          .eq('estado', 'activo'),
        supabase
          .from('natilleras')
          .select('nombre, reglas_multas, mes_inicio, mes_fin, anio, anio_inicio')
          .eq('id', natilleraId)
          .single()
      ])

      if (sociosResult.error) throw sociosResult.error
      if (natilleraResult.error) throw natilleraResult.error
      
      const sociosRapido = sociosResult.data
      const natillera = natilleraResult.data
      const nombreNatillera = natillera?.nombre || ''

      if (!sociosRapido || sociosRapido.length === 0) {
        return { success: false, error: 'No hay socios activos' }
      }
      if (!natillera) return { success: false, error: 'Natillera no encontrada' }

      const socioIdsRapido = sociosRapido.map(s => s.id)
      
      // Verificación rápida de cuotas existentes
      const { data: cuotasRapido, error: cuotasRapidoError } = await supabase
        .from('cuotas')
        .select('socio_natillera_id, quincena')
        .in('socio_natillera_id', socioIdsRapido)
        .eq('mes', mesAGenerar)
        .eq('anio', anioAGenerar)

      if (cuotasRapidoError) throw cuotasRapidoError

      // Verificar si todos los socios ya tienen sus cuotas completas
      let todosTienenCuotas = true
      for (const socio of sociosRapido) {
        const cuotasDelSocio = (cuotasRapido || []).filter(c => c.socio_natillera_id === socio.id)
        const periodicidad = socio.periodicidad || 'mensual'
        
        if (periodicidad === 'quincenal') {
          const tieneQ1 = cuotasDelSocio.some(c => c.quincena === 1)
          const tieneQ2 = cuotasDelSocio.some(c => c.quincena === 2)
          if (!tieneQ1 || !tieneQ2) {
            todosTienenCuotas = false
            break
          }
        } else {
          const tieneMensual = cuotasDelSocio.some(c => c.quincena === 0 || c.quincena === null || c.quincena === undefined)
          if (!tieneMensual) {
            todosTienenCuotas = false
            break
          }
        }
      }

      // Si todos tienen cuotas, retornar inmediatamente
      if (todosTienenCuotas) {
        const tiempoFin = performance.now()
        console.log(`⚡ Verificación rápida: todas las cuotas existen (${(tiempoFin - tiempoInicio).toFixed(0)}ms)`)
        return { success: true, message: 'Todos los socios ya tienen cuota generada para este mes', cuotasGeneradas: 0 }
      }

      // Obtener días de gracia
      const reglasMultas = natillera.reglas_multas || {}
      const diasGracia = reglasMultas.dias_gracia || 3

      // Usar anio_inicio como base, con fallback a anio
      const anioInicioNatillera = natillera.anio_inicio || natillera.anio || anioAGenerar
      const mesInicio = natillera.mes_inicio || 1
      const mesFin = natillera.mes_fin || 11

      // Verificar si el mes está en el rango - CORREGIDO para períodos que cruzan años
      let mesEnRango = false
      if (mesInicio <= mesFin) {
        // Rango normal (ej: Enero a Noviembre) - todos los meses están en el mismo año
        mesEnRango = anioAGenerar === anioInicioNatillera && 
                     mesAGenerar >= mesInicio && 
                     mesAGenerar <= mesFin
      } else {
        // Rango que cruza año (ej: Diciembre a Noviembre)
        // Primera parte del período: mes_inicio a diciembre del año de inicio
        const enPrimeraParte = anioAGenerar === anioInicioNatillera && mesAGenerar >= mesInicio
        // Segunda parte del período: enero a mes_fin del año siguiente
        const enSegundaParte = anioAGenerar === (anioInicioNatillera + 1) && mesAGenerar <= mesFin
        mesEnRango = enPrimeraParte || enSegundaParte
      }

      if (!mesEnRango) {
        console.log(`⚠️ Mes ${mesAGenerar}/${anioAGenerar} fuera del rango [${mesInicio}/${anioInicioNatillera} - ${mesFin}/${mesInicio > mesFin ? anioInicioNatillera + 1 : anioInicioNatillera}]`)
        return { success: false, error: 'El mes seleccionado no está en el período de la natillera' }
      }

      // Usar los datos ya cargados (no volver a consultar)
      const sociosNatillera = sociosRapido
      const socioNatilleraIds = socioIdsRapido
      const cuotasExistentes = cuotasRapido

      // Identificar socios que no tienen cuota generada (ya sabemos que hay algunos)
      const sociosSinCuota = []
      sociosNatillera.forEach(socio => {
        const periodicidad = socio.periodicidad || 'mensual'
        const cuotasDelSocio = (cuotasExistentes || []).filter(c => c.socio_natillera_id === socio.id)
        
        if (periodicidad === 'quincenal') {
          const tieneQ1 = cuotasDelSocio.some(c => c.quincena === 1)
          const tieneQ2 = cuotasDelSocio.some(c => c.quincena === 2)
          if (!tieneQ1 || !tieneQ2) {
            sociosSinCuota.push(socio.id)
          }
        } else {
          const tieneMensual = cuotasDelSocio.some(c => c.quincena === 0 || c.quincena === null || c.quincena === undefined)
          if (!tieneMensual) {
            sociosSinCuota.push(socio.id)
          }
        }
      })

      // Calcular fechas límite y fechas de vencimiento (día límite segunda quincena: 30, o 28/29 feb)
      const ultimoDia = obtenerDiaLimiteSegundaQuincena(mesAGenerar, anioAGenerar)
      
      const formatearFecha = (anio, mes, dia) => {
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      }
      
      const calcularFechaConDiasGracia = (anio, mes, dia, diasGracia) => {
        const diasEnMes = obtenerDiaLimiteSegundaQuincena(mes, anio)
        const diaFinal = dia + diasGracia
        let anioFinal = anio
        let mesFinal = mes
        let diaResultado = diaFinal
        
        if (diaResultado > diasEnMes) {
          diaResultado = diaResultado - diasEnMes
          mesFinal = mes + 1
          if (mesFinal > 12) {
            mesFinal = 1
            anioFinal = anio + 1
          }
        }
        return formatearFecha(anioFinal, mesFinal, diaResultado)
      }
      
      const fechaLimiteQuincena1Str = formatearFecha(anioAGenerar, mesAGenerar, 15)
      const fechaVencimientoQuincena1Str = calcularFechaConDiasGracia(anioAGenerar, mesAGenerar, 15, diasGracia)
      const fechaLimiteQuincena2Str = formatearFecha(anioAGenerar, mesAGenerar, ultimoDia)
      const fechaVencimientoQuincena2Str = calcularFechaConDiasGracia(anioAGenerar, mesAGenerar, ultimoDia, diasGracia)

      // Obtener nombre del mes
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      const mesLabel = meses[mesAGenerar - 1]

      // Calcular estado inicial según REGLAS.md:
      // - Programada: fecha_actual < fecha_limite
      // - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
      // - Mora: fecha_actual > fecha_vencimiento
      const fechaHoy = new Date()
      fechaHoy.setHours(0, 0, 0, 0)
      
      const calcularEstadoInicial = (fechaVencimientoStr, fechaLimiteStr) => {
        const [yV, mV, dV] = fechaVencimientoStr.split('-').map(Number)
        const fechaVencimiento = new Date(yV, mV - 1, dV)
        fechaVencimiento.setHours(0, 0, 0, 0)
        
        const [yL, mL, dL] = fechaLimiteStr.split('-').map(Number)
        const fechaLimite = new Date(yL, mL - 1, dL)
        fechaLimite.setHours(0, 0, 0, 0)
        
        if (fechaHoy > fechaVencimiento) {
          return 'mora'
        } else if (fechaHoy >= fechaLimite) {
          return 'pendiente'
        } else {
          return 'programada'
        }
      }

      // Obtener información completa de los socios que necesitan cuota (con valor_cuota_individual y nombre)
      const { data: sociosCompletos, error: sociosCompletosError } = await supabase
        .from('socios_natillera')
        .select('id, periodicidad, valor_cuota_individual, socio:socios(id, nombre)')
        .in('id', sociosSinCuota)
        .eq('estado', 'activo')
      
      if (sociosCompletosError) throw sociosCompletosError

      // Preparar TODAS las cuotas a crear en un solo array (BATCH)
      const cuotasACrear = []
      
      for (const socio of sociosCompletos) {
        const periodicidad = socio.periodicidad || 'mensual'
        const valorCuota = socio.valor_cuota_individual
        
        // Verificar qué cuotas específicas le faltan a este socio
        const cuotasDelSocio = (cuotasExistentes || []).filter(c => c.socio_natillera_id === socio.id)
        
        if (periodicidad === 'quincenal') {
          const tieneQ1 = cuotasDelSocio.some(c => c.quincena === 1)
          const tieneQ2 = cuotasDelSocio.some(c => c.quincena === 2)
          
          // Crear solo las quincenas que faltan
          const nombreSocio = socio.socio?.nombre || ''
          if (!tieneQ1) {
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: valorCuota,
              valor_pagado: 0,
              fecha_vencimiento: fechaVencimientoQuincena1Str,
              fecha_limite: fechaLimiteQuincena1Str,
              mes: mesAGenerar,
              anio: anioAGenerar,
              quincena: 1,
              estado: calcularEstadoInicial(fechaVencimientoQuincena1Str, fechaLimiteQuincena1Str),
              descripcion: `${mesLabel} - 1ra Quincena`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
          }
          
          if (!tieneQ2) {
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: valorCuota,
              valor_pagado: 0,
              fecha_vencimiento: fechaVencimientoQuincena2Str,
              fecha_limite: fechaLimiteQuincena2Str,
              mes: mesAGenerar,
              anio: anioAGenerar,
              quincena: 2,
              estado: calcularEstadoInicial(fechaVencimientoQuincena2Str, fechaLimiteQuincena2Str),
              descripcion: `${mesLabel} - 2da Quincena`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
          }
        } else {
          // Mensual - solo crear si no tiene cuota mensual
          const tieneMensual = cuotasDelSocio.some(c => c.quincena === 0 || c.quincena === null || c.quincena === undefined)
          
          if (!tieneMensual) {
            const nombreSocio = socio.socio?.nombre || ''
            cuotasACrear.push({
              socio_natillera_id: socio.id,
              valor_cuota: valorCuota,
              valor_pagado: 0,
              fecha_vencimiento: fechaVencimientoQuincena2Str,
              fecha_limite: fechaLimiteQuincena2Str,
              mes: mesAGenerar,
              anio: anioAGenerar,
              quincena: null,
              estado: calcularEstadoInicial(fechaVencimientoQuincena2Str, fechaLimiteQuincena2Str),
              descripcion: `Cuota ${mesLabel}`,
              nombre_natillera: nombreNatillera,
              nombre_socio: nombreSocio
            })
          }
        }
      }

      // Si no hay cuotas que crear, retornar
      if (cuotasACrear.length === 0) {
        return { success: true, message: 'No hay cuotas nuevas que generar', cuotasGeneradas: 0 }
      }

      console.log(`📋 Generando ${cuotasACrear.length} cuotas en una sola operación batch...`)

      // INSERTAR TODAS LAS CUOTAS EN UNA SOLA OPERACIÓN (sin parpadeos)
      const { data: cuotasInsertadas, error: insertError } = await supabase
        .from('cuotas')
        .insert(cuotasACrear)
        .select()

      if (insertError) throw insertError

      const cuotasGeneradas = cuotasInsertadas?.length || 0
      console.log(`✅ ${cuotasGeneradas} cuotas generadas exitosamente en batch`)

      return { 
        success: true, 
        message: `Se generaron ${cuotasGeneradas} cuotas para ${sociosSinCuota.length} socio(s)`, 
        cuotasGeneradas,
        sociosProcesados: sociosSinCuota.length
      }
    } catch (e) {
      error.value = e.message
      console.error('Error en generación de cuotas faltantes:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
      // Liberar el bloqueo para esta natillera/mes/año
      generandoCuotasPorNatillera.delete(claveOperacion)
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
  // Función para actualizar todas las cuotas pendientes/futuras de un socio cuando cambia valor_cuota_individual
  async function actualizarCuotasPorCambioValorCuota(socioNatilleraId, nuevoValorCuota) {
    try {
      console.log('🔄 Actualizando cuotas pendientes para socio_natillera:', socioNatilleraId)
      console.log('🔄 Nuevo valor de cuota:', nuevoValorCuota)

      // Obtener TODAS las cuotas del socio (incluyendo las pagadas)
      const { data: todasLasCuotas, error: fetchError } = await supabase
        .from('cuotas')
        .select('*')
        .eq('socio_natillera_id', socioNatilleraId)
        .order('fecha_limite', { ascending: true })

      if (fetchError) {
        console.error('❌ Error obteniendo cuotas:', fetchError)
        throw fetchError
      }

      if (!todasLasCuotas || todasLasCuotas.length === 0) {
        console.log('✅ No hay cuotas para actualizar')
        return { success: true, cuotasActualizadas: 0 }
      }

      console.log(`📋 Encontradas ${todasLasCuotas.length} cuotas totales para revisar`)

      // Convertir el nuevo valor a número
      const nuevoValorNum = Number(nuevoValorCuota)
      if (isNaN(nuevoValorNum)) {
        throw new Error('El nuevo valor de cuota debe ser un número válido')
      }

      // Actualizar TODAS las cuotas (pendientes y pagadas)
      const cuotasActualizadas = []
      for (const cuota of todasLasCuotas) {
        const valorPagadoActual = Number(cuota.valor_pagado || 0)
        const valorCuotaAnterior = Number(cuota.valor_cuota || 0)
        const estadoAnterior = cuota.estado
        const esPagada = estadoAnterior === 'pagada' || valorPagadoActual >= valorCuotaAnterior
        
        const datosActualizar = {
          valor_cuota: nuevoValorNum
        }

        // Preparar fecha actual para la anotación
        const fechaActual = new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '/')

        // CASO 1: Cuota pagada
        if (esPagada) {
          if (nuevoValorNum > valorPagadoActual) {
            // Nuevo valor es MAYOR: convertir a pago parcial, dejar diferencia como pendiente
            datosActualizar.estado = 'parcial'
            // Mantener el valor_pagado actual, solo cambiar el valor_cuota
            // La diferencia (nuevoValorNum - valorPagadoActual) queda como pendiente
            const diferencia = nuevoValorNum - valorPagadoActual
            const anotacion = `Cuota ajustada: Valor original $${valorCuotaAnterior.toLocaleString('es-CO')} → $${nuevoValorNum.toLocaleString('es-CO')}. Pendiente: $${diferencia.toLocaleString('es-CO')} (${fechaActual})`
            // Agregar anotación sin sobrescribir las anteriores
            datosActualizar.descripcion = cuota.descripcion 
              ? `${cuota.descripcion} | ${anotacion}`
              : anotacion
            console.log(`🔄 Cuota pagada ${cuota.id}: Convertida a parcial. Diferencia pendiente: $${diferencia.toLocaleString('es-CO')}`)
          } else if (nuevoValorNum < valorPagadoActual) {
            // Nuevo valor es MENOR: mantener como pagada pero agregar anotación
            datosActualizar.estado = 'pagada'
            const anotacion = `Ajuste de valor: Cuota original $${valorCuotaAnterior.toLocaleString('es-CO')} → $${nuevoValorNum.toLocaleString('es-CO')}. Pagado: $${valorPagadoActual.toLocaleString('es-CO')} (${fechaActual})`
            // Agregar anotación sin sobrescribir las anteriores
            datosActualizar.descripcion = cuota.descripcion 
              ? `${cuota.descripcion} | ${anotacion}`
              : anotacion
            console.log(`🔄 Cuota pagada ${cuota.id}: Mantenida como pagada con anotación`)
          } else {
            // Nuevo valor es IGUAL: mantener como pagada, sin cambios
            datosActualizar.estado = 'pagada'
            console.log(`🔄 Cuota pagada ${cuota.id}: Sin cambios (valor igual)`)
          }
        } 
        // CASO 2: Cuota pendiente/parcial
        else {
          // Crear anotación para cuotas pendientes/parciales
          let anotacion = null
          if (valorCuotaAnterior !== nuevoValorNum) {
            // Solo crear anotación si el valor realmente cambió
            if (valorPagadoActual > 0) {
              // Tiene pago parcial
              const pendiente = nuevoValorNum - valorPagadoActual
              anotacion = `Ajuste de valor: Cuota original $${valorCuotaAnterior.toLocaleString('es-CO')} → $${nuevoValorNum.toLocaleString('es-CO')}. Pagado: $${valorPagadoActual.toLocaleString('es-CO')}, Pendiente: $${pendiente.toLocaleString('es-CO')} (${fechaActual})`
            } else {
              // Sin pagos
              anotacion = `Ajuste de valor: Cuota original $${valorCuotaAnterior.toLocaleString('es-CO')} → $${nuevoValorNum.toLocaleString('es-CO')} (${fechaActual})`
            }
          }

          if (valorPagadoActual > nuevoValorNum) {
            // Si ya pagó más que el nuevo valor, ajustar el valor_pagado al nuevo valor
            datosActualizar.valor_pagado = nuevoValorNum
            datosActualizar.estado = 'pagada'
            if (!cuota.fecha_pago) {
              datosActualizar.fecha_pago = new Date().toISOString()
            }
          } else if (valorPagadoActual === nuevoValorNum && nuevoValorNum > 0) {
            // Si el valor pagado es igual al nuevo valor, marcar como pagada
            datosActualizar.estado = 'pagada'
            if (!cuota.fecha_pago) {
              datosActualizar.fecha_pago = new Date().toISOString()
            }
          } else if (valorPagadoActual > 0 && valorPagadoActual < nuevoValorNum) {
            // Si tiene un pago parcial menor al nuevo valor, mantener el pago parcial
            datosActualizar.estado = 'parcial'
          } else {
            // Sin pagos, solo actualizar el valor
            datosActualizar.estado = 'pendiente'
          }

          // Agregar anotación si existe y el valor cambió
          if (anotacion) {
            datosActualizar.descripcion = cuota.descripcion 
              ? `${cuota.descripcion} | ${anotacion}`
              : anotacion
            console.log(`🔄 Cuota pendiente/parcial ${cuota.id}: Agregada anotación de ajuste`)
          }
        }

        console.log(`🔄 Actualizando cuota ${cuota.id}:`, {
          valorAnterior: valorCuotaAnterior,
          valorNuevo: nuevoValorNum,
          valorPagado: valorPagadoActual,
          estadoAnterior: estadoAnterior,
          esPagada: esPagada,
          datosActualizar
        })

        const { error: updateError } = await supabase
          .from('cuotas')
          .update(datosActualizar)
          .eq('id', cuota.id)

        if (updateError) {
          console.error(`❌ Error actualizando cuota ${cuota.id}:`, updateError)
          continue // Continuar con la siguiente cuota aunque falle una
        }

        cuotasActualizadas.push(cuota.id)
        console.log(`✅ Cuota ${cuota.id} actualizada correctamente`)
      }

      console.log(`✅ Total: ${cuotasActualizadas.length} cuotas actualizadas de ${todasLasCuotas.length} totales`)

      // Actualizar las cuotas en el store local
      cuotas.value.forEach(cuota => {
        if (cuota.socio_natillera_id === socioNatilleraId && cuotasActualizadas.includes(cuota.id)) {
          const cuotaActualizada = todasLasCuotas.find(c => c.id === cuota.id)
          if (cuotaActualizada) {
            // Actualizar el valor en la cuota local
            cuota.valor_cuota = nuevoValorNum
            const valorPagado = Number(cuota.valor_pagado || 0)
            const valorCuotaAnterior = Number(cuota.valor_cuota || 0)
            const esPagada = cuota.estado === 'pagada' || valorPagado >= valorCuotaAnterior
            
            // Ajustar según el caso
            if (esPagada) {
              if (nuevoValorNum > valorPagado) {
                // Convertir a parcial
                cuota.estado = 'parcial'
                // Mantener valor_pagado, solo actualizar valor_cuota
              } else if (nuevoValorNum < valorPagado) {
                // Mantener como pagada con anotación
                cuota.estado = 'pagada'
              }
              // Actualizar descripción si existe
              if (cuotaActualizada.descripcion) {
                cuota.descripcion = cuotaActualizada.descripcion
              }
            } else {
              // Cuota pendiente/parcial
              if (valorPagado > nuevoValorNum) {
                cuota.valor_pagado = nuevoValorNum
                cuota.estado = 'pagada'
              } else if (valorPagado === nuevoValorNum && nuevoValorNum > 0) {
                cuota.estado = 'pagada'
              } else if (valorPagado > 0 && valorPagado < nuevoValorNum) {
                cuota.estado = 'parcial'
              } else {
                cuota.estado = 'pendiente'
              }
            }
          }
        }
      })

      return { success: true, cuotasActualizadas: cuotasActualizadas.length }
    } catch (e) {
      console.error('❌ Error actualizando cuotas por cambio de valor:', e)
      return { success: false, error: e.message, cuotasActualizadas: 0 }
    }
  }

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

  // ========================================================
  // FUNCIÓN OPTIMIZADA: Genera todas las cuotas del período en un solo batch
  // Esta función es ~10x más rápida que generar cuota por cuota
  // ========================================================
  async function generarCuotasBatchParaSocio(natilleraId, socioNatilleraId, valorCuota, periodicidad, natilleraParam) {
    const tiempoInicio = performance.now()
    
    try {
      console.log('🚀 GENERACIÓN BATCH DE CUOTAS - Inicio')
      console.log('📋 Parámetros recibidos:', {
        natilleraId,
        socioNatilleraId,
        valorCuota,
        periodicidad,
        natilleraParam: natilleraParam ? 'presente' : 'NULL'
      })
      
      if (!socioNatilleraId) {
        console.error('❌ socioNatilleraId es null o undefined')
        return { success: false, error: 'ID del socio no válido', cuotasGeneradas: 0 }
      }
      
      // IMPORTANTE: Obtener datos frescos de la natillera directamente de la BD
      // para asegurar que tenemos todos los campos necesarios, especialmente el nombre
      let natillera = natilleraParam
      
      // Si no hay natillera o le faltan campos importantes, obtenerla desde BD
      // También verificar que tenga el nombre para asegurar que se guarde en las cuotas
      if (!natillera || !natillera.mes_inicio || !natillera.mes_fin || !natillera.nombre) {
        console.log('📡 Obteniendo datos de natillera desde BD...')
        const { data: natilleraDB, error: natilleraError } = await supabase
          .from('natilleras')
          .select('id, nombre, mes_inicio, mes_fin, anio, anio_inicio, reglas_multas')
          .eq('id', natilleraId)
          .single()
        
        if (natilleraError || !natilleraDB) {
          console.error('❌ Error obteniendo natillera:', natilleraError)
          return { success: false, error: 'No se pudo obtener la configuración de la natillera', cuotasGeneradas: 0 }
        }
        
        natillera = natilleraDB
        console.log('✅ Natillera obtenida de BD:', natillera)
      }
      
      console.log('📋 Datos de natillera:', {
        id: natillera.id,
        nombre: natillera.nombre,
        mes_inicio: natillera.mes_inicio,
        mes_fin: natillera.mes_fin,
        anio: natillera.anio,
        anio_inicio: natillera.anio_inicio,
        reglas_multas: natillera.reglas_multas
      })
      
      // Obtener el nombre del socio
      const { data: socioNatillera, error: socioError } = await supabase
        .from('socios_natillera')
        .select('socio:socios(id, nombre)')
        .eq('id', socioNatilleraId)
        .single()
      
      if (socioError) {
        console.error('⚠️ Error obteniendo nombre del socio:', socioError)
      }
      
      const nombreSocio = socioNatillera?.socio?.nombre || ''
      
      // Obtener configuración de días de gracia
      const reglasMultas = natillera.reglas_multas || {}
      const diasGracia = reglasMultas.dias_gracia || 3
      
      // Calcular el período de la natillera
      const mesInicio = natillera.mes_inicio || 1
      const anioInicio = natillera.anio_inicio || natillera.anio || new Date().getFullYear()
      const mesFin = natillera.mes_fin || 11
      const anioFin = natillera.anio || new Date().getFullYear()
      
      console.log('📅 Período calculado:', { mesInicio, mesFin, anioInicio, anioFin })
      
      // Generar lista de meses del período
      const mesesDelPeriodo = []
      
      if (anioInicio === anioFin) {
        for (let mes = mesInicio; mes <= mesFin; mes++) {
          mesesDelPeriodo.push({ mes, anio: anioInicio })
        }
      } else {
        // Período que cruza años
        for (let mes = mesInicio; mes <= 12; mes++) {
          mesesDelPeriodo.push({ mes, anio: anioInicio })
        }
        for (let anio = anioInicio + 1; anio < anioFin; anio++) {
          for (let mes = 1; mes <= 12; mes++) {
            mesesDelPeriodo.push({ mes, anio })
          }
        }
        for (let mes = 1; mes <= mesFin; mes++) {
          mesesDelPeriodo.push({ mes, anio: anioFin })
        }
      }
      
      console.log(`📅 Meses del período: ${mesesDelPeriodo.length}`, mesesDelPeriodo)
      
      // Si no hay meses, retornar error
      if (mesesDelPeriodo.length === 0) {
        console.error('❌ No hay meses en el período. Verificar mes_inicio y mes_fin')
        return { success: false, error: 'No hay meses válidos en el período de la natillera', cuotasGeneradas: 0 }
      }
      
      // Helper para día límite segunda quincena/mensual: 30, o 28/29 en febrero
      const obtenerDiaLimite = (mes, anio) => (mes === 2 ? new Date(anio, 2, 0).getDate() : 30)
      
      // Helper para formatear fecha
      const formatearFecha = (anio, mes, dia) => {
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      }
      
      // Helper para calcular fecha con días de gracia (mes efectivo termina en día 30 o 28/29 feb)
      const calcularFechaConDiasGracia = (anio, mes, dia, dias) => {
        const diasEnMes = obtenerDiaLimite(mes, anio)
        let diaResultado = dia + dias
        let mesFinal = mes
        let anioFinal = anio
        
        if (diaResultado > diasEnMes) {
          diaResultado = diaResultado - diasEnMes
          mesFinal = mes + 1
          if (mesFinal > 12) {
            mesFinal = 1
            anioFinal = anio + 1
          }
        }
        return formatearFecha(anioFinal, mesFinal, diaResultado)
      }
      
      // Calcular estado inicial basado en fecha
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)
      
      const calcularEstado = (fechaVencimientoStr, fechaLimiteStr) => {
        const [yV, mV, dV] = fechaVencimientoStr.split('-').map(Number)
        const fechaVencimiento = new Date(yV, mV - 1, dV)
        
        const [yL, mL, dL] = fechaLimiteStr.split('-').map(Number)
        const fechaLimite = new Date(yL, mL - 1, dL)
        
        if (fechaActual > fechaVencimiento) return 'mora'
        if (fechaActual >= fechaLimite) return 'pendiente'
        return 'programada'
      }
      
      // Generar todos los registros de cuotas en memoria
      const cuotasAInsertar = []
      const esQuincenal = periodicidad === 'quincenal'
      
      for (const { mes, anio } of mesesDelPeriodo) {
        const ultimoDia = obtenerDiaLimite(mes, anio)
        
        if (esQuincenal) {
          // Primera quincena
          const fechaLimiteQ1 = formatearFecha(anio, mes, 15)
          const fechaVencimientoQ1 = calcularFechaConDiasGracia(anio, mes, 15, diasGracia)
          
          // Obtener nombre del mes para descripción
          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          const mesLabel = meses[mes - 1]
          
          cuotasAInsertar.push({
            socio_natillera_id: socioNatilleraId,
            mes,
            anio,
            quincena: 1,
            valor_cuota: valorCuota,
            valor_pagado: 0,
            fecha_limite: fechaLimiteQ1,
            fecha_vencimiento: fechaVencimientoQ1,
            estado: calcularEstado(fechaVencimientoQ1, fechaLimiteQ1),
            descripcion: `${mesLabel} - 1ra Quincena`,
            nombre_natillera: natillera.nombre || '',
            nombre_socio: nombreSocio
          })
          
          // Segunda quincena
          const fechaLimiteQ2 = formatearFecha(anio, mes, ultimoDia)
          const fechaVencimientoQ2 = calcularFechaConDiasGracia(anio, mes, ultimoDia, diasGracia)
          
          cuotasAInsertar.push({
            socio_natillera_id: socioNatilleraId,
            mes,
            anio,
            quincena: 2,
            valor_cuota: valorCuota,
            valor_pagado: 0,
            fecha_limite: fechaLimiteQ2,
            fecha_vencimiento: fechaVencimientoQ2,
            estado: calcularEstado(fechaVencimientoQ2, fechaLimiteQ2),
            descripcion: `${mesLabel} - 2da Quincena`,
            nombre_natillera: natillera.nombre || '',
            nombre_socio: nombreSocio
          })
        } else {
          // Mensual
          const fechaLimite = formatearFecha(anio, mes, ultimoDia)
          const fechaVencimiento = calcularFechaConDiasGracia(anio, mes, ultimoDia, diasGracia)
          
          // Obtener nombre del mes para descripción
          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          const mesLabel = meses[mes - 1]
          
          cuotasAInsertar.push({
            socio_natillera_id: socioNatilleraId,
            mes,
            anio,
            quincena: null,
            valor_cuota: valorCuota,
            valor_pagado: 0,
            fecha_limite: fechaLimite,
            fecha_vencimiento: fechaVencimiento,
            estado: calcularEstado(fechaVencimiento, fechaLimite),
            descripcion: `Cuota ${mesLabel}`,
            nombre_natillera: natillera.nombre || '',
            nombre_socio: nombreSocio
          })
        }
      }
      
      console.log(`📝 Cuotas a insertar: ${cuotasAInsertar.length}`)
      if (cuotasAInsertar.length > 0) {
        console.log('📝 Ejemplo de cuota:', cuotasAInsertar[0])
      }
      
      // Si no hay cuotas a insertar, retornar
      if (cuotasAInsertar.length === 0) {
        console.error('❌ No hay cuotas para insertar')
        return { success: false, error: 'No se generaron cuotas', cuotasGeneradas: 0 }
      }
      
      // Verificar primero si ya existen cuotas para este socio
      const { data: cuotasExistentes, error: checkError } = await supabase
        .from('cuotas')
        .select('id')
        .eq('socio_natillera_id', socioNatilleraId)
        .limit(1)
      
      if (checkError) {
        console.error('❌ Error verificando cuotas existentes:', checkError)
      }
      
      if (cuotasExistentes && cuotasExistentes.length > 0) {
        console.log('⚠️ Ya existen cuotas para este socio, no se generarán nuevas')
        return { success: true, cuotasGeneradas: 0, mensaje: 'El socio ya tiene cuotas generadas' }
      }
      
      console.log('📤 Iniciando inserción batch...')
      
      // Insertar todas las cuotas de una vez (BATCH INSERT)
      const { data: cuotasInsertadas, error: insertError } = await supabase
        .from('cuotas')
        .insert(cuotasAInsertar)
        .select('id')
      
      if (insertError) {
        console.error('❌ Error en batch insert:', insertError)
        console.error('❌ Código de error:', insertError.code)
        console.error('❌ Mensaje:', insertError.message)
        console.error('❌ Detalles:', insertError.details)
        throw insertError
      }
      
      console.log('✅ Inserción exitosa:', cuotasInsertadas)
      
      const tiempoFin = performance.now()
      console.log(`✅ GENERACIÓN BATCH COMPLETADA en ${(tiempoFin - tiempoInicio).toFixed(0)}ms`)
      console.log(`📊 Cuotas generadas: ${cuotasInsertadas?.length || cuotasAInsertar.length}`)
      
      return {
        success: true,
        cuotasGeneradas: cuotasInsertadas?.length || cuotasAInsertar.length,
        tiempoMs: tiempoFin - tiempoInicio
      }
      
    } catch (e) {
      console.error('❌ Error en generación batch:', e)
      return { success: false, error: e.message, cuotasGeneradas: 0 }
    }
  }

  // Función para eliminar todas las cuotas de un socio (usado cuando cambia la periodicidad)
  // OPTIMIZADO: Obtiene natillera_id desde socios_natillera, luego elimina cuotas
  async function eliminarTodasLasCuotasSocio(socioNatilleraId) {
    try {
      console.log('🗑️ Eliminando todas las cuotas del socio:', socioNatilleraId)
      
      // OPTIMIZACIÓN: Obtener natillera_id desde socios_natillera (la tabla cuotas no tiene natillera_id directamente)
      const { data: socioNatillera, error: fetchError } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', socioNatilleraId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error obteniendo datos de socio_natillera:', fetchError)
        throw fetchError
      }

      const natilleraIdParaAuditoria = socioNatillera?.natillera_id || null

      // Verificar si hay cuotas antes de intentar eliminarlas
      const { count: cantidadCuotas, error: countError } = await supabase
        .from('cuotas')
        .select('*', { count: 'exact', head: true })
        .eq('socio_natillera_id', socioNatilleraId)

      if (countError && countError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error contando cuotas:', countError)
        throw countError
      }

      if (!cantidadCuotas || cantidadCuotas === 0) {
        console.log('ℹ️ No hay cuotas para eliminar')
        return { success: true, cuotasEliminadas: 0 }
      }

      // Eliminar todas las cuotas del socio (operación rápida)
      const { error: deleteError } = await supabase
        .from('cuotas')
        .delete()
        .eq('socio_natillera_id', socioNatilleraId)

      if (deleteError) {
        console.error('Error eliminando cuotas:', deleteError)
        throw deleteError
      }

      console.log(`✅ ${cantidadCuotas} cuota(s) eliminada(s) exitosamente`)

      // Registrar auditoría de eliminación (en segundo plano, con datos mínimos)
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrarEliminacion(
        'cuota',
        null,
        `Se eliminaron ${cantidadCuotas} cuota(s) del socio por cambio de periodicidad`,
        {
          total_eliminadas: cantidadCuotas,
          razon: 'cambio_periodicidad'
        },
        natilleraIdParaAuditoria,
        {
          accion: 'eliminacion_por_cambio_periodicidad',
          socio_natillera_id: socioNatilleraId
        }
      ))

      return { success: true, cuotasEliminadas: cantidadCuotas }
    } catch (e) {
      console.error('Error eliminando cuotas del socio:', e)
      return { success: false, error: e.message, cuotasEliminadas: 0 }
    }
  }

  // Poner a 0 valor_multa, valor_multa_base y valor_multa_intereses de todas las cuotas
  // (mora/pendiente/parcial) de una natillera. Se llama cuando se desactivan las sanciones.
  async function limpiarSancionesNatillera(natilleraId) {
    try {
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', natilleraId)

      if (sociosError) throw sociosError
      if (!sociosNatillera?.length) return { success: true, actualizadas: 0 }

      const socioNatilleraIds = sociosNatillera.map(s => s.id)

      const { data: actualizadas, error: updateError } = await supabase
        .from('cuotas')
        .update({
          valor_multa: 0,
          valor_multa_base: 0,
          valor_multa_intereses: 0
        })
        .in('socio_natillera_id', socioNatilleraIds)
        .in('estado', ['mora', 'pendiente', 'parcial'])
        .select('id')

      if (updateError) throw updateError

      const cantidad = actualizadas?.length ?? 0
      if (cantidad > 0) {
        console.log(`📋 [Sanciones] Limpieza al desactivar: ${cantidad} cuota(s) de natillera ${natilleraId}`)
        const primeraCuota = actualizadas[0]
        const algunaCuota = cuotas.value.find(c => c.id === primeraCuota?.id)
        if (algunaCuota) {
          const idsActualizados = new Set((actualizadas || []).map(c => c.id))
          cuotas.value.forEach(c => {
            if (idsActualizados.has(c.id)) {
              c.valor_multa = 0
              c.valor_multa_base = 0
              c.valor_multa_intereses = 0
            }
          })
        }
      }

      return { success: true, actualizadas: cantidad }
    } catch (e) {
      console.error('Error limpiando sanciones de natillera:', e)
      return { success: false, error: e.message, actualizadas: 0 }
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
    limpiarSancionesNatillera,
    calcularResumenCuotas,
    getCuotasPorMes,
    getResumenPorMes,
    generarCuotasAutomaticas,
    generarCuotasFaltantes,
    generarCuotasBatchParaSocio,
    buscarCuotaPorCodigo,
    actualizarCuota,
    actualizarSocioNatilleraEnCuotas,
    actualizarCuotasPorCambioValorCuota,
    eliminarTodasLasCuotasSocio
  }
})

