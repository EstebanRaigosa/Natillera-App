import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

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

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function cerrarNatillera(id) {
    return actualizarNatillera(id, { 
      estado: 'cerrada',
      fecha_cierre: new Date().toISOString()
    })
  }

  function calcularEstadisticas(natillera) {
    if (!natillera) return null

    const socios = natillera.socios_natillera || []
    const cuotas = natillera.cuotas || []
    const actividades = natillera.actividades || []

    console.log('=== DEBUG ESTADISTICAS ===')
    console.log('Cuotas encontradas:', cuotas.length)
    console.log('Cuotas:', cuotas)
    
    const cuotasPagadas = cuotas.filter(c => c.estado === 'pagada')
    console.log('Cuotas pagadas:', cuotasPagadas.length, cuotasPagadas)

    const totalAportado = cuotas
      .filter(c => c.estado === 'pagada')
      .reduce((sum, c) => sum + (c.valor_pagado || 0), 0)

    const totalPendiente = cuotas
      .filter(c => c.estado !== 'pagada')
      .reduce((sum, c) => sum + (c.valor_cuota - (c.valor_pagado || 0)), 0)

    const utilidadActividades = actividades
      .reduce((sum, a) => sum + (a.utilidad || 0), 0)

    console.log('Total aportado:', totalAportado)
    console.log('Total pendiente:', totalPendiente)
    console.log('=== FIN DEBUG ===')

    return {
      totalSocios: socios.length,
      sociosActivos: socios.filter(s => s.estado === 'activo').length,
      totalAportado,
      totalPendiente,
      utilidadActividades,
      fondoTotal: totalAportado + utilidadActividades
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
    calcularEstadisticas
  }
})

