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

  async function generarCuotasPeriodo(natilleraId, fechaLimite, descripcion = '') {
    try {
      loading.value = true
      error.value = null

      // Obtener todos los socios activos de la natillera
      const { data: sociosNatillera, error: sociosError } = await supabase
        .from('socios_natillera')
        .select('id, valor_cuota_individual, cantidad_cuotas')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'activo')

      if (sociosError) throw sociosError

      console.log('=== GENERANDO CUOTAS ===')
      console.log('Socios encontrados:', sociosNatillera)

      if (!sociosNatillera || sociosNatillera.length === 0) {
        console.log('No hay socios activos para generar cuotas')
        return { success: false, error: 'No hay socios activos en la natillera' }
      }

      // Crear cuotas para cada socio según su valor individual
      const cuotasACrear = sociosNatillera.flatMap(socio => {
        const cantidad = socio.cantidad_cuotas || 1
        return Array(cantidad).fill().map((_, i) => ({
          socio_natillera_id: socio.id,
          valor_cuota: socio.valor_cuota_individual,
          valor_pagado: 0,
          fecha_limite: fechaLimite,
          estado: 'pendiente',
          descripcion: cantidad > 1 ? `${descripcion} (${i + 1}/${cantidad})` : descripcion
        }))
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

  function calcularResumenCuotas() {
    const pendientes = cuotas.value.filter(c => c.estado === 'pendiente')
    const pagadas = cuotas.value.filter(c => c.estado === 'pagada')
    const parciales = cuotas.value.filter(c => c.estado === 'parcial')
    const enMora = cuotas.value.filter(c => c.estado === 'mora')

    const totalRecaudado = cuotas.value.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
    const totalEsperado = cuotas.value.reduce((sum, c) => sum + c.valor_cuota, 0)

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

  return {
    cuotas,
    loading,
    error,
    fetchCuotasNatillera,
    generarCuotasPeriodo,
    registrarPago,
    marcarEnMora,
    calcularResumenCuotas
  }
})

