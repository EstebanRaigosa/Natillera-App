import { supabase } from '../lib/supabase'
import { useSociosStore } from '../stores/socios'
import { useCuotasStore } from '../stores/cuotas'
import { useNatillerasStore } from '../stores/natilleras'
import { normalizarCelular, esTelefonoValido, errorCelular } from '../utils/telefono'

/*
 * Guardar la edición de un socio: nombre, contacto, avatar, valor de la cuota y periodicidad.
 *
 * Vivía dentro de Socios.vue, y Cuotas.vue tenía una copia propia que se había ido quedando
 * atrás. Ahora las dos vistas guardan por aquí: una sola regla para cambiar la cuota o la
 * periodicidad, que es justo lo que no puede quedar distinto según desde dónde se edite.
 *
 * Cambiar la periodicidad es la operación pesada: borra todas las cuotas del socio y las
 * vuelve a generar. Va por pasos y los reporta con `alProgreso`, para que cada vista los
 * muestre a su manera (Socios con su modal de progreso, Cuotas con la caja flotante).
 */

const MENSAJE_TELEFONO_DUPLICADO = 'Este número de teléfono ya está registrado para otro socio en esta natillera'

/** Convierte lo escrito en el campo de cuota («120.000», 120000) a número. */
export function valorCuotaNumerico(valor) {
  if (typeof valor === 'string') return parseFloat(valor.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
  return Number(valor) || 0
}

/** Formulario vacío, con la forma que usa SocioFormModal. */
export function formularioSocioVacio() {
  return {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 0,
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer'
  }
}

/** Formulario lleno con los datos actuales de un socio de la natillera. */
export function formularioDesdeSocio(sn) {
  return {
    nombre: sn.socio?.nombre || '',
    documento: sn.socio?.documento || '',
    email: sn.socio?.email || '',
    telefono: sn.socio?.telefono || '',
    valor_cuota: sn.valor_cuota_individual,
    periodicidad: sn.periodicidad || 'mensual',
    avatar_seed: sn.socio?.avatar_seed || '',
    avatar_style: sn.socio?.avatar_style || 'adventurer'
  }
}

/** Trae un socio de la natillera con sus datos, para editarlo desde una vista que no los tiene. */
export async function cargarSocioNatillera(socioNatilleraId) {
  const { data, error } = await supabase
    .from('socios_natillera')
    .select('id, natillera_id, valor_cuota_individual, periodicidad, estado, socio:socios(id, nombre, documento, email, telefono, avatar_seed, avatar_style)')
    .eq('id', socioNatilleraId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useEditarSocio() {
  const sociosStore = useSociosStore()
  const cuotasStore = useCuotasStore()
  const natillerasStore = useNatillerasStore()

  /**
   * @param {object} opciones
   * @param {string} opciones.natilleraId
   * @param {object} opciones.socioNatillera - el socio tal como está antes de editar
   * @param {object} opciones.datos - copia del formulario (no el reactivo: la vista puede resetearlo)
   * @param {(p: object) => void} [opciones.alProgreso] - pasos del cambio de periodicidad
   * @returns {Promise<{ ok: boolean, error?: string, telefonoDuplicado?: boolean, cambioPeriodicidad: boolean, cuotasGeneradas?: number }>}
   */
  async function guardarEdicionSocio({ natilleraId, socioNatillera, datos, alProgreso = () => {} }) {
    const periodicidadAnterior = socioNatillera.periodicidad || 'mensual'
    const periodicidadNueva = datos.periodicidad || 'mensual'
    const cambioPeriodicidad = periodicidadAnterior !== periodicidadNueva

    if (!datos.telefono || datos.telefono.trim() === '') {
      return { ok: false, error: 'El número de teléfono es obligatorio', cambioPeriodicidad: false }
    }
    if (!esTelefonoValido(datos.telefono)) {
      return {
        ok: false,
        error: errorCelular(datos.telefono) || 'Escribe un celular de 10 dígitos que empiece por 3, o uno de otro país con + y el indicativo.',
        cambioPeriodicidad: false
      }
    }

    const telefonoLimpio = normalizarCelular(datos.telefono)
    const socioId = socioNatillera.socio?.id || null

    if (cambioPeriodicidad) {
      return cambiarPeriodicidad({ natilleraId, socioNatillera, datos, telefonoLimpio, socioId, periodicidadNueva, alProgreso })
    }

    // Sin cambio de periodicidad: se actualizan cuota y datos, y las cuotas se recalculan solas.
    const result = await sociosStore.actualizarSocioNatillera(socioNatillera.id, {
      valor_cuota_individual: datos.valor_cuota,
      periodicidad: datos.periodicidad
    })

    if (socioId) {
      const telefonoUnico = await sociosStore.verificarTelefonoUnico(telefonoLimpio, natilleraId, socioId)
      if (!telefonoUnico) {
        return { ok: false, error: MENSAJE_TELEFONO_DUPLICADO, telefonoDuplicado: true, cambioPeriodicidad: false }
      }

      const datosActualizados = {
        nombre: datos.nombre,
        telefono: telefonoLimpio,
        email: datos.email || null,
        documento: datos.documento || null
      }
      if (datos.avatar_seed) datosActualizados.avatar_seed = datos.avatar_seed

      const resultDatos = await sociosStore.actualizarDatosSocio(socioId, datosActualizados, natilleraId)
      if (!resultDatos.success) {
        const duplicado = resultDatos.error?.includes('unique') || resultDatos.error?.includes('duplicate')
        return {
          ok: false,
          error: duplicado ? MENSAJE_TELEFONO_DUPLICADO : (resultDatos.error || 'Error al actualizar los datos del socio'),
          telefonoDuplicado: duplicado,
          cambioPeriodicidad: false
        }
      }
    }

    if (!result.success) return { ok: false, error: result.error, cambioPeriodicidad: false }

    // Si cambió el valor, las cuotas pendientes cambian de monto: se recargan en segundo plano.
    if (socioNatillera.valor_cuota_individual !== datos.valor_cuota) {
      cuotasStore.fetchCuotasNatillera(natilleraId)
    }
    return { ok: true, cambioPeriodicidad: false }
  }

  async function cambiarPeriodicidad({ natilleraId, socioNatillera, datos, telefonoLimpio, socioId, periodicidadNueva, alProgreso }) {
    const fallo = error => {
      alProgreso({ paso: 0, error })
      return { ok: false, error, cambioPeriodicidad: true }
    }

    // Si el campo quedó vacío o inválido, se conserva la cuota que tenía.
    let valorCuota = valorCuotaNumerico(datos.valor_cuota)
    if (valorCuota <= 0 || isNaN(valorCuota)) valorCuota = socioNatillera.valor_cuota_individual || 0

    alProgreso({ paso: 1, mensaje: 'Actualizando periodicidad...', cuotasGeneradas: 0, cuotasTotales: 0, error: null, exito: false })

    try {
      // Paso 1: datos del socio. El documento no puede ser null por una restricción de la BD.
      const datosActualizados = {
        nombre: datos.nombre || socioNatillera.socio?.nombre || '',
        telefono: telefonoLimpio || socioNatillera.socio?.telefono || ''
      }
      const email = datos.email || socioNatillera.socio?.email || ''
      const documento = datos.documento || socioNatillera.socio?.documento || ''
      const avatarSeed = datos.avatar_seed || socioNatillera.socio?.avatar_seed || ''
      if (email.trim() !== '') datosActualizados.email = email.trim()
      if (documento.trim() !== '') datosActualizados.documento = documento.trim()
      if (avatarSeed) datosActualizados.avatar_seed = avatarSeed

      if (socioId) {
        const telefonoUnico = await sociosStore.verificarTelefonoUnico(telefonoLimpio, natilleraId, socioId)
        if (!telefonoUnico) return fallo(MENSAJE_TELEFONO_DUPLICADO)
        const resultDatos = await sociosStore.actualizarDatosSocio(socioId, datosActualizados, natilleraId)
        if (!resultDatos.success) return fallo(resultDatos.error || 'Error al actualizar los datos del socio')
      }

      // Paso 2: borrar las cuotas con la periodicidad vieja.
      alProgreso({ paso: 2, mensaje: 'Eliminando cuotas anteriores...' })
      const resultEliminar = await cuotasStore.eliminarTodasLasCuotasSocio(socioNatillera.id)
      if (!resultEliminar.success) return fallo(resultEliminar.error || 'Error al eliminar las cuotas anteriores')

      // Paso 3: nueva periodicidad y valor.
      alProgreso({ mensaje: 'Actualizando configuración...' })
      if (valorCuota <= 0 || isNaN(valorCuota)) return fallo('El valor de la cuota debe ser mayor a cero')
      const result = await sociosStore.actualizarSocioNatillera(socioNatillera.id, {
        valor_cuota_individual: valorCuota,
        periodicidad: periodicidadNueva
      })
      if (!result.success) return fallo(result.error || 'Error al actualizar la periodicidad')

      // Paso 4: generar las cuotas con la periodicidad nueva.
      alProgreso({ paso: 2, mensaje: 'Generando cuotas con nueva periodicidad...' })
      if (!natillerasStore.natilleraActual || natillerasStore.natilleraActual.id !== natilleraId) {
        await natillerasStore.fetchNatillera(natilleraId)
      }
      const resultCuotas = await cuotasStore.generarCuotasBatchParaSocio(
        natilleraId,
        socioNatillera.id,
        valorCuota,
        periodicidadNueva,
        natillerasStore.natilleraActual
      )
      if (!resultCuotas.success) return fallo(resultCuotas.error || 'Error al generar las nuevas cuotas')

      alProgreso({
        paso: 3,
        exito: true,
        cuotasGeneradas: resultCuotas.cuotasGeneradas,
        mensaje: '¡Periodicidad actualizada exitosamente!'
      })

      await Promise.all([
        cuotasStore.fetchCuotasNatillera(natilleraId),
        sociosStore.fetchSociosNatillera(natilleraId)
      ])
      return { ok: true, cambioPeriodicidad: true, cuotasGeneradas: resultCuotas.cuotasGeneradas }
    } catch (error) {
      return fallo(error.message || 'Error inesperado al cambiar la periodicidad')
    }
  }

  return { guardarEdicionSocio }
}
