import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useConfiguracionStore = defineStore('configuracion', () => {
  const loading = ref(false)
  const error = ref(null)
  
  // Mensajes por defecto
  const mensajeIndividual = ref('Hola {{nombre}} 👋\n\nTe recordamos que tienes pendiente la cuota de la natillera.\n\n💰 Valor: ${{monto}}\n\nGracias por apoyar la natillera 🙌')

  const mensajeGeneral = ref('¡Hola a todos! 👋\n\nLes recordamos que las cuotas de la natillera están próximas a vencer.\n\nPor favor, no olviden realizar sus aportes a tiempo para evitar multas.\n\n¡Gracias por su compromiso! 🙌')

  // Configuración de período por defecto
  const configPeriodo = ref({
    mes_inicio: 1,
    mes_fin: 11,
    anio: new Date().getFullYear()
  })

  // Configuración de días de gracia
  const configDiasGracia = ref({
    dias_gracia: 3
  })

  // Cargar configuración del usuario desde Supabase o localStorage
  async function cargarConfiguracion() {
    try {
      loading.value = true
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        // Si no hay usuario, cargar desde localStorage
        cargarDesdeLocalStorage()
        return
      }

      const { data, error: fetchError } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .eq('user_id', authStore.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error cargando configuración:', fetchError)
        cargarDesdeLocalStorage()
        return
      }

      if (data) {
        mensajeIndividual.value = data.mensaje_individual || mensajeIndividual.value
        mensajeGeneral.value = data.mensaje_general || mensajeGeneral.value
        if (data.config_periodo) {
          configPeriodo.value = { ...configPeriodo.value, ...data.config_periodo }
        }
        if (data.config_dias_gracia) {
          configDiasGracia.value = { ...configDiasGracia.value, ...data.config_dias_gracia }
        }
      } else {
        cargarDesdeLocalStorage()
      }
    } catch (e) {
      console.error('Error:', e)
      cargarDesdeLocalStorage()
    } finally {
      loading.value = false
    }
  }

  function cargarDesdeLocalStorage() {
    const guardado = localStorage.getItem('natillera_config')
    if (guardado) {
      try {
        const config = JSON.parse(guardado)
        mensajeIndividual.value = config.mensajeIndividual || mensajeIndividual.value
        mensajeGeneral.value = config.mensajeGeneral || mensajeGeneral.value
        if (config.configPeriodo) {
          configPeriodo.value = { ...configPeriodo.value, ...config.configPeriodo }
        }
        if (config.configDiasGracia) {
          configDiasGracia.value = { ...configDiasGracia.value, ...config.configDiasGracia }
        }
      } catch (e) {
        console.error('Error parseando config:', e)
      }
    }
  }

  async function guardarConfiguracion() {
    try {
      loading.value = true
      error.value = null
      
      const authStore = useAuthStore()
      
      // Guardar en localStorage siempre como respaldo
      localStorage.setItem('natillera_config', JSON.stringify({
        mensajeIndividual: mensajeIndividual.value,
        mensajeGeneral: mensajeGeneral.value,
        configPeriodo: configPeriodo.value,
        configDiasGracia: configDiasGracia.value
      }))

      if (!authStore.user?.id) {
        return { success: true, message: 'Guardado localmente' }
      }

      // Intentar guardar en Supabase
      const { error: upsertError } = await supabase
        .from('configuracion_usuario')
        .upsert({
          user_id: authStore.user.id,
          mensaje_individual: mensajeIndividual.value,
          mensaje_general: mensajeGeneral.value,
          config_periodo: configPeriodo.value,
          config_dias_gracia: configDiasGracia.value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        // Si falla Supabase, al menos quedó en localStorage
        console.warn('No se pudo guardar en Supabase, guardado localmente:', upsertError)
        return { success: true, message: 'Guardado localmente' }
      }

      return { success: true, message: 'Configuración guardada' }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  function restaurarValoresPorDefecto() {
    mensajeIndividual.value = 'Hola {{nombre}} 👋\n\nTe recordamos que tienes pendiente la cuota de la natillera.\n\n💰 Valor: ${{monto}}\n\nGracias por apoyar la natillera 🙌'

    mensajeGeneral.value = '¡Hola a todos! 👋\n\nLes recordamos que las cuotas de la natillera están próximas a vencer.\n\nPor favor, no olviden realizar sus aportes a tiempo para evitar multas.\n\n¡Gracias por su compromiso! 🙌'
  }

  // Función helper para reemplazar variables en el mensaje
  function generarMensajeIndividual(nombre, monto) {
    return mensajeIndividual.value
      .replace(/\{\{nombre\}\}/g, nombre || 'Socio')
      .replace(/\{\{monto\}\}/g, monto || '0')
  }

  async function guardarConfigPeriodo(periodo) {
    configPeriodo.value = { ...configPeriodo.value, ...periodo }
    return await guardarConfiguracion()
  }

  async function guardarConfigDiasGracia(diasGracia) {
    configDiasGracia.value = { ...configDiasGracia.value, ...diasGracia }
    return await guardarConfiguracion()
  }

  return {
    loading,
    error,
    mensajeIndividual,
    mensajeGeneral,
    configPeriodo,
    configDiasGracia,
    cargarConfiguracion,
    guardarConfiguracion,
    guardarConfigPeriodo,
    guardarConfigDiasGracia,
    restaurarValoresPorDefecto,
    generarMensajeIndividual
  }
})

