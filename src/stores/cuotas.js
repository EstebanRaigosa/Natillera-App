import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

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
      return cuotasConSocio
    } catch (e) {
      error.value = e.message
      console.error('Error cargando cuotas:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function generarCuotasPeriodo(natilleraId, fechasLimite, mesLabel = '', mes = null, anio = null) {
    try {
      loading.value = true
      error.value = null

      // Obtener todos los socios activos de la natillera con su periodicidad
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, periodicidad')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'activo')

      if (sociosError) throw sociosError

      console.log('=== GENERANDO CUOTAS ===')
      console.log('Socios encontrados:', sociosNatillera)
      console.log('Mes:', mes, 'Año:', anio)
      console.log('Fechas:', fechasLimite)

      if (!sociosNatillera || sociosNatillera.length === 0) {
        console.log('No hay socios activos para generar cuotas')
        return { success: false, error: 'No hay socios activos en la natillera' }
      }

      // Crear cuotas para cada socio según su periodicidad
      const cuotasACrear = sociosNatillera.flatMap(socio => {
        const periodicidad = socio.periodicidad || 'mensual'
        
        if (periodicidad === 'quincenal') {
          // Socios quincenales: 2 cuotas por mes
          return [
            {
              socio_natillera_id: socio.id,
              valor_cuota: socio.valor_cuota_individual,
              valor_pagado: 0,
              fecha_limite: fechasLimite.quincena1,
              mes: mes,
              anio: anio,
              quincena: 1,
              estado: 'pendiente',
              descripcion: `${mesLabel} - 1ra Quincena`
            },
            {
              socio_natillera_id: socio.id,
              valor_cuota: socio.valor_cuota_individual,
              valor_pagado: 0,
              fecha_limite: fechasLimite.quincena2,
              mes: mes,
              anio: anio,
              quincena: 2,
              estado: 'pendiente',
              descripcion: `${mesLabel} - 2da Quincena`
            }
          ]
        } else {
          // Socios mensuales: 1 cuota por mes
          return [{
            socio_natillera_id: socio.id,
            valor_cuota: socio.valor_cuota_individual,
            valor_pagado: 0,
            fecha_limite: fechasLimite.mensual,
            mes: mes,
            anio: anio,
            quincena: null,
            estado: 'pendiente',
            descripcion: `Cuota ${mesLabel}`
          }]
        }
      })

      console.log('Cuotas a crear:', cuotasACrear)

      const { data, error: insertError } = await supabase
        .from('cuotas')
        .insert(cuotasACrear)
        .select()

      if (insertError) {
        console.error('Error insertando cuotas:', insertError)
        throw insertError
      }

      console.log('Cuotas creadas:', data)
      console.log('=========================')

      cuotas.value.push(...data)
      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
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

      const { data, error: updateError } = await supabase
        .from('cuotas')
        .update({
          valor_pagado: nuevoValorPagado,
          estado: nuevaEstado,
          fecha_pago: nuevaEstado === 'pagada' ? new Date().toISOString() : null,
          comprobante_url: comprobante
        })
        .eq('id', cuotaId)
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar en el array local
      const index = cuotas.value.findIndex(c => c.id === cuotaId)
      if (index !== -1) {
        cuotas.value[index] = data
      }

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
    const pendientes = lista.filter(c => c.estado === 'pendiente')
    const pagadas = lista.filter(c => c.estado === 'pagada')
    const parciales = lista.filter(c => c.estado === 'parcial')
    const enMora = lista.filter(c => c.estado === 'mora')

    const totalRecaudado = lista.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    const totalEsperado = lista.reduce((sum, c) => sum + c.valor_cuota, 0)

    return {
      pendientes: pendientes.length,
      pagadas: pagadas.length,
      parciales: parciales.length,
      enMora: enMora.length,
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

  return {
    cuotas,
    loading,
    error,
    fetchCuotasNatillera,
    generarCuotasPeriodo,
    registrarPago,
    marcarEnMora,
    calcularResumenCuotas,
    getCuotasPorMes,
    getResumenPorMes
  }
})

