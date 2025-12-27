import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

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
        avatar_seed: datosSocio.avatar_seed || null
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

      const { data, error: updateError } = await supabase
        .from('socios_natillera')
        .update(datos)
        .eq('id', id)
        .select(`
          *,
          socio:socios(*)
        `)
        .single()

      if (updateError) throw updateError

      const index = sociosNatillera.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sociosNatillera.value[index] = data
      }

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  async function cambiarEstadoSocio(id, estado) {
    return actualizarSocioNatillera(id, { estado })
  }

  async function actualizarDatosSocio(socioId, datos) {
    try {
      const { data, error: updateError } = await supabase
        .from('socios')
        .update(datos)
        .eq('id', socioId)
        .select()
        .single()

      if (updateError) throw updateError

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
      
      // Obtener cuotas del socio en esta natillera
      const { data: cuotas, error: fetchError } = await supabase
        .from('cuotas')
        .select('*')
        .eq('socio_natillera_id', socioNatilleraId)
        .order('fecha_limite', { ascending: true })

      console.log('Cuotas encontradas:', cuotas?.length || 0)
      console.log('Cuotas:', cuotas)
      console.log('================================')

      if (fetchError) throw fetchError

      return {
        cuotas: cuotas || [],
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
    obtenerResumenSocio
  }
})

