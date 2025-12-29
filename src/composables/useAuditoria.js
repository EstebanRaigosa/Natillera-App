import { supabase } from '../lib/supabase'

/**
 * Composable para registrar acciones de auditoría
 * Facilita el registro de todas las acciones realizadas en el sistema
 */
export function useAuditoria() {
  
  /**
   * Obtiene el usuario actual autenticado
   */
  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  /**
   * Formatea un valor para mostrarlo en descripciones
   */
  function formatearValor(valor) {
    if (valor === null) return '(vacío)'
    if (valor === undefined) return '(no definido)'
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
    if (typeof valor === 'number') {
      // Si es un número grande, podría ser dinero
      if (valor >= 1000) {
        return `$${valor.toLocaleString('es-CO')}`
      }
      return valor.toString()
    }
    if (typeof valor === 'string') {
      // Si está vacío
      if (valor.trim() === '') return '(vacío)'
      // Si es una fecha ISO
      if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
        try {
          const fecha = new Date(valor)
          return fecha.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        } catch (e) {
          return valor
        }
      }
      // Limitar longitud de strings muy largos
      if (valor.length > 50) {
        return valor.substring(0, 50) + '...'
      }
      return valor
    }
    if (typeof valor === 'object') {
      if (Array.isArray(valor)) {
        return valor.length > 0 ? `[${valor.length} elementos]` : '[vacío]'
      }
      // Si es un objeto con propiedades específicas conocidas
      if (valor.nombre) return valor.nombre
      if (valor.email) return valor.email
      return '[objeto]'
    }
    return String(valor)
  }

  /**
   * Genera una descripción detallada de los cambios
   */
  function generarDescripcionCambios(datosAnteriores, datosNuevos, entidadNombre = '') {
    const cambios = calcularCambios(datosAnteriores, datosNuevos)
    
    if (!cambios || Object.keys(cambios).length === 0) {
      return `Se actualizó ${entidadNombre || 'la entidad'}`
    }
    
    const descripciones = []
    
    Object.keys(cambios).forEach(campo => {
      const cambio = cambios[campo]
      const valorAnterior = formatearValor(cambio.anterior)
      const valorNuevo = formatearValor(cambio.nuevo)
      
      // Formatear nombre del campo (de snake_case a formato legible)
      const nombreCampo = campo
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
      
      descripciones.push(`el campo "${nombreCampo}" de "${valorAnterior}" a "${valorNuevo}"`)
    })
    
    if (descripciones.length === 1) {
      return `Se cambió ${descripciones[0]}${entidadNombre ? ` en ${entidadNombre}` : ''}`
    } else if (descripciones.length === 2) {
      return `Se cambiaron ${descripciones[0]} y ${descripciones[1]}${entidadNombre ? ` en ${entidadNombre}` : ''}`
    } else {
      const ultimo = descripciones.pop()
      return `Se cambiaron ${descripciones.join(', ')}, y ${ultimo}${entidadNombre ? ` en ${entidadNombre}` : ''}`
    }
  }

  /**
   * Calcula los cambios entre dos objetos (antes y después)
   * Retorna solo los campos que cambiaron
   * Excluye campos automáticos como updated_at y created_at
   * Maneja objetos anidados correctamente
   */
  function calcularCambios(datosAnteriores, datosNuevos) {
    if (!datosAnteriores || !datosNuevos) return null
    
    // Campos que no deben registrarse en auditoría (campos automáticos)
    const camposExcluidos = ['updated_at', 'created_at']
    
    const cambios = {}
    
    // Función helper para obtener el valor real de un campo (maneja objetos anidados)
    function obtenerValorReal(obj, key) {
      // Si el valor es un objeto anidado (como socio en socio_natillera), 
      // solo comparamos si cambió la referencia, no el contenido interno
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Para objetos anidados, comparamos por ID si existe
        if (obj[key].id) {
          return obj[key].id
        }
        // Si no tiene ID, comparamos el objeto completo
        return obj[key]
      }
      return obj[key]
    }
    
    // Comparar cada campo de datos_nuevos con datos_anteriores
    Object.keys(datosNuevos).forEach(key => {
      // Excluir campos automáticos
      if (camposExcluidos.includes(key)) return
      
      // Excluir objetos anidados completos (se comparan por su ID si existe)
      if (key === 'socio' && typeof datosNuevos[key] === 'object' && datosNuevos[key]?.id) {
        // Solo registrar si cambió el ID del socio
        const idAnterior = datosAnteriores[key]?.id
        const idNuevo = datosNuevos[key]?.id
        if (idAnterior !== idNuevo) {
          cambios[`${key}_id`] = {
            anterior: idAnterior,
            nuevo: idNuevo
          }
        }
        return
      }
      
      const valorAnterior = obtenerValorReal(datosAnteriores, key)
      const valorNuevo = obtenerValorReal(datosNuevos, key)
      
      // Comparar valores (considerando null, undefined, y tipos diferentes)
      const anteriorStr = JSON.stringify(valorAnterior)
      const nuevoStr = JSON.stringify(valorNuevo)
      
      if (anteriorStr !== nuevoStr) {
        cambios[key] = {
          anterior: valorAnterior,
          nuevo: valorNuevo
        }
      }
    })
    
    // También verificar campos que existían antes pero ya no están
    Object.keys(datosAnteriores).forEach(key => {
      // Excluir campos automáticos
      if (camposExcluidos.includes(key)) return
      
      // Excluir objetos anidados
      if (key === 'socio') return
      
      if (!(key in datosNuevos) && datosAnteriores[key] !== null && datosAnteriores[key] !== undefined) {
        cambios[key] = {
          anterior: datosAnteriores[key],
          nuevo: null
        }
      }
    })
    
    return Object.keys(cambios).length > 0 ? cambios : null
  }

  /**
   * Registra una acción de auditoría
   * 
   * @param {Object} params - Parámetros de la auditoría
   * @param {string} params.tipoAccion - Tipo de acción: 'CREATE', 'UPDATE', 'DELETE', 'GENERATE', 'REGISTER', 'CANCEL', 'APPROVE', 'REJECT'
   * @param {string} params.entidad - Tipo de entidad: 'natillera', 'socio', 'socio_natillera', 'cuota', 'pago', 'comprobante', 'prestamo', 'pago_prestamo', 'actividad', 'multa', 'configuracion'
   * @param {string} params.entidadId - ID de la entidad afectada (UUID)
   * @param {string} params.descripcion - Descripción legible de la acción
   * @param {string} params.natilleraId - ID de la natillera relacionada (opcional)
   * @param {Object} params.datosAnteriores - Estado anterior de la entidad (para UPDATE)
   * @param {Object} params.datosNuevos - Estado nuevo de la entidad
   * @param {Object} params.detalles - Información adicional específica de la acción
   * @param {string} params.ipAddress - Dirección IP del usuario (opcional)
   * @param {string} params.userAgent - User agent del navegador (opcional)
   * @param {Object} params.metadata - Otros metadatos adicionales (opcional)
   * 
   * @returns {Promise<{success: boolean, id?: string, error?: string}>}
   */
  async function registrar({
    tipoAccion,
    entidad,
    entidadId = null,
    descripcion,
    natilleraId = null,
    datosAnteriores = null,
    datosNuevos = null,
    detalles = null,
    ipAddress = null,
    userAgent = null,
    metadata = null
  }) {
    try {
      // Obtener usuario actual
      const user = await getCurrentUser()
      if (!user) {
        console.warn('No se pudo obtener el usuario para auditoría')
        return { success: false, error: 'Usuario no autenticado' }
      }

      // Obtener nombre de la natillera si existe (solo si tenemos natilleraId)
      let natilleraNombre = null
      if (natilleraId) {
        try {
          const { data: natillera } = await supabase
            .from('natilleras')
            .select('nombre')
            .eq('id', natilleraId)
            .single()
          
          if (natillera) {
            natilleraNombre = natillera.nombre
          }
        } catch (e) {
          // Si no se puede obtener el nombre, continuar sin él
          console.warn('No se pudo obtener el nombre de la natillera:', e)
        }
      }

      // Calcular cambios si hay datos anteriores y nuevos
      const cambios = datosAnteriores && datosNuevos 
        ? calcularCambios(datosAnteriores, datosNuevos)
        : null

      // Preparar datos para insertar
      const auditoriaData = {
        usuario_id: user.id,
        usuario_email: user.email || null,
        natillera_id: natilleraId,
        natillera_nombre: natilleraNombre,
        tipo_accion: tipoAccion,
        entidad: entidad,
        entidad_id: entidadId,
        descripcion: descripcion,
        datos_anteriores: datosAnteriores ? JSON.parse(JSON.stringify(datosAnteriores)) : null,
        datos_nuevos: datosNuevos ? JSON.parse(JSON.stringify(datosNuevos)) : null,
        cambios: cambios ? JSON.parse(JSON.stringify(cambios)) : null,
        detalles: detalles ? JSON.parse(JSON.stringify(detalles)) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }

      // Insertar registro de auditoría
      const { data, error } = await supabase
        .from('auditoria')
        .insert(auditoriaData)
        .select('id')
        .single()

      if (error) {
        console.error('Error registrando auditoría:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error en registrar auditoría:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Registra la creación de una entidad
   */
  async function registrarCreacion(entidad, entidadId, descripcion, datosNuevos, natilleraId = null, detalles = null) {
    return registrar({
      tipoAccion: 'CREATE',
      entidad,
      entidadId,
      descripcion,
      natilleraId,
      datosNuevos,
      detalles
    })
  }

  /**
   * Registra la actualización de una entidad
   * Si no se proporciona descripcion, se genera automáticamente basada en los cambios
   */
  async function registrarActualizacion(entidad, entidadId, descripcion = null, datosAnteriores, datosNuevos, natilleraId = null, detalles = null) {
    // Si no se proporciona descripción, generarla automáticamente
    if (!descripcion && datosAnteriores && datosNuevos) {
      // Obtener nombre de la entidad para la descripción
      let entidadNombre = ''
      if (entidad === 'socio' && (datosNuevos.nombre || datosAnteriores?.nombre)) {
        entidadNombre = `el socio "${datosNuevos.nombre || datosAnteriores.nombre}"`
      } else if (entidad === 'socio_natillera') {
        const nombreSocio = datosNuevos.socio?.nombre || datosAnteriores?.socio?.nombre
        if (nombreSocio) {
          entidadNombre = `el socio "${nombreSocio}"`
        } else {
          entidadNombre = 'el socio'
        }
      } else if (entidad === 'natillera' && (datosNuevos.nombre || datosAnteriores?.nombre)) {
        entidadNombre = `la natillera "${datosNuevos.nombre || datosAnteriores.nombre}"`
      } else if (entidad === 'cuota') {
        entidadNombre = 'la cuota'
      }
      
      descripcion = generarDescripcionCambios(datosAnteriores, datosNuevos, entidadNombre)
    }
    
    return registrar({
      tipoAccion: 'UPDATE',
      entidad,
      entidadId,
      descripcion: descripcion || `Se actualizó ${entidad}`,
      natilleraId,
      datosAnteriores,
      datosNuevos,
      detalles
    })
  }

  /**
   * Registra la eliminación de una entidad
   */
  async function registrarEliminacion(entidad, entidadId, descripcion, datosAnteriores, natilleraId = null, detalles = null) {
    return registrar({
      tipoAccion: 'DELETE',
      entidad,
      entidadId,
      descripcion,
      natilleraId,
      datosAnteriores,
      detalles
    })
  }

  /**
   * Registra la generación de algo (cuotas, comprobantes, etc.)
   */
  async function registrarGeneracion(entidad, descripcion, datosNuevos, natilleraId = null, detalles = null) {
    return registrar({
      tipoAccion: 'GENERATE',
      entidad,
      descripcion,
      natilleraId,
      datosNuevos,
      detalles
    })
  }

  /**
   * Registra el registro de un pago
   */
  async function registrarPago(entidadId, descripcion, datosNuevos, natilleraId, detalles = null) {
    return registrar({
      tipoAccion: 'REGISTER',
      entidad: 'pago',
      entidadId,
      descripcion,
      natilleraId,
      datosNuevos,
      detalles
    })
  }

  /**
   * Obtiene el historial de auditoría
   * 
   * @param {Object} filtros - Filtros para la búsqueda
   * @param {string} filtros.natilleraId - ID de la natillera
   * @param {string} filtros.entidad - Tipo de entidad
   * @param {string} filtros.tipoAccion - Tipo de acción
   * @param {string} filtros.entidadId - ID de entidad específica
   * @param {Date} filtros.fechaDesde - Fecha desde
   * @param {Date} filtros.fechaHasta - Fecha hasta
   * @param {number} filtros.limit - Límite de resultados
   * @param {number} filtros.offset - Offset para paginación
   * 
   * @returns {Promise<{success: boolean, data?: Array, total?: number, error?: string}>}
   */
  async function obtenerHistorial(filtros = {}) {
    try {
      // Construir query base para contar
      let countQuery = supabase
        .from('auditoria')
        .select('*', { count: 'exact', head: true })

      // Construir query para obtener datos
      let dataQuery = supabase
        .from('auditoria')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros a ambas queries
      const aplicarFiltros = (query) => {
        if (filtros.natilleraId) {
          query = query.eq('natillera_id', filtros.natilleraId)
        }
        if (filtros.entidad) {
          query = query.eq('entidad', filtros.entidad)
        }
        if (filtros.tipoAccion) {
          query = query.eq('tipo_accion', filtros.tipoAccion)
        }
        if (filtros.entidadId) {
          query = query.eq('entidad_id', filtros.entidadId)
        }
        if (filtros.fechaDesde) {
          query = query.gte('created_at', filtros.fechaDesde.toISOString())
        }
        if (filtros.fechaHasta) {
          query = query.lte('created_at', filtros.fechaHasta.toISOString())
        }
        return query
      }

      countQuery = aplicarFiltros(countQuery)
      dataQuery = aplicarFiltros(dataQuery)

      // Aplicar paginación solo a la query de datos
      const limit = filtros.limit || 50
      const offset = filtros.offset || 0
      dataQuery = dataQuery.range(offset, offset + limit - 1)

      // Ejecutar ambas queries en paralelo
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
      ])

      if (countResult.error) {
        console.error('Error contando registros de auditoría:', countResult.error)
        return { success: false, error: countResult.error.message }
      }

      if (dataResult.error) {
        console.error('Error obteniendo historial de auditoría:', dataResult.error)
        return { success: false, error: dataResult.error.message }
      }

      return { 
        success: true, 
        data: dataResult.data || [],
        total: countResult.count || 0
      }
    } catch (error) {
      console.error('Error en obtener historial:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    registrar,
    registrarCreacion,
    registrarActualizacion,
    registrarEliminacion,
    registrarGeneracion,
    registrarPago,
    obtenerHistorial,
    calcularCambios
  }
}

