import { ref, computed, watch, onUnmounted } from 'vue'
import { supabase } from '../lib/supabase'
import { getCurrentDateISO } from '../utils/formatDate'

/**
 * Cortes de caja — un corte sella, para una fecha, lo que el sistema decía que debía
 * haber y lo que el administrador declaró que había de verdad, por forma de pago.
 * El saldo real sellado se convierte en el saldo inicial del siguiente periodo, igual
 * que el cierre de turno de un POS: así cada revisión abarca solo lo nuevo (D-02) y
 * queda constancia de quién revisó y qué explicó (D-03, RF-10).
 *
 * Persiste en la tabla `cortes_caja` (migración 026). Un corte no se borra ni se
 * edita: se anula, y la base de datos lo impone con un trigger, así que aquí no hay
 * que confiar en que la interfaz se porte bien.
 */

/** Solo cortes vigentes: los anulados dejan de contar como saldo inicial. */
const COLUMNAS = 'id, natillera_id, fecha_corte, estado, esperado_efectivo, real_efectivo, esperado_transferencia, real_transferencia, nota, creado_por, creado_por_nombre, creado_en'

/** Espera antes de guardar el umbral: se escribe tecleando y no vale una consulta por tecla. */
const RETARDO_UMBRAL = 700

/**
 * @param {import('vue').Ref<string>} idNatillera
 */
export function useCortesCaja(idNatillera) {
  const cortes = ref([])
  /** Diferencia a partir de la cual el corte exige una nota. 0 = cualquier diferencia la pide. */
  const umbralDiferencia = ref(0)
  const cargando = ref(false)
  const error = ref(null)

  let temporizadorUmbral = null

  async function cargar() {
    if (!idNatillera.value) {
      cortes.value = []
      return
    }
    cargando.value = true
    error.value = null
    try {
      const [respuestaCortes, respuestaUmbral] = await Promise.all([
        supabase
          .from('cortes_caja')
          .select(COLUMNAS)
          .eq('natillera_id', idNatillera.value)
          .eq('estado', 'cerrado')
          .order('fecha_corte', { ascending: false }),
        supabase.rpc('obtener_umbral_corte', { p_natillera_id: idNatillera.value })
      ])

      if (respuestaCortes.error) throw respuestaCortes.error
      cortes.value = (respuestaCortes.data || []).map(normalizar)

      // Que falle el umbral no debe dejar la pantalla sin cortes: se cae al valor
      // más exigente (0 = pedir nota siempre) y se sigue.
      umbralDiferencia.value = respuestaUmbral.error ? 0 : Math.max(0, Number(respuestaUmbral.data) || 0)
    } catch (e) {
      console.error('Cortes de caja: no se pudieron cargar.', e)
      error.value = e
      cortes.value = []
    } finally {
      cargando.value = false
    }
  }

  /** Del más reciente al más antiguo, que es el orden en el que se consulta el historial. */
  const cortesOrdenados = computed(() =>
    [...cortes.value].sort((a, b) => (b.fecha_corte || '').localeCompare(a.fecha_corte || ''))
  )

  const ultimoCorte = computed(() => cortesOrdenados.value[0] || null)

  /**
   * Sella un corte. Los importes se congelan: si más tarde se edita un pago anterior a
   * esta fecha, el corte no se recalcula, y por eso el historial marca los cortes cuyo
   * esperado ya no coincide con lo que hoy calcula el sistema.
   *
   * Lanza si la base de datos lo rechaza; quien llama decide qué mostrar.
   */
  async function cerrarCorte({ fechaCorte, esperadoEfectivo, realEfectivo, esperadoTransferencia, realTransferencia, nota, creadoPor }) {
    const { data, error: fallo } = await supabase
      .from('cortes_caja')
      .insert({
        natillera_id: idNatillera.value,
        fecha_corte: fechaCorte || getCurrentDateISO(),
        esperado_efectivo: Math.round(esperadoEfectivo || 0),
        real_efectivo: Math.round(realEfectivo || 0),
        esperado_transferencia: Math.round(esperadoTransferencia || 0),
        real_transferencia: Math.round(realTransferencia || 0),
        nota: (nota || '').trim() || null,
        // `creado_por` lo pone la base de datos con auth.uid(). El nombre sí viene de
        // aquí porque resolverlo en SQL obligaría a abrir user_profiles.
        creado_por_nombre: creadoPor || 'Usuario'
      })
      .select(COLUMNAS)
      .single()

    if (fallo) throw traducirFallo(fallo)

    const corte = normalizar(data)
    cortes.value = [...cortes.value, corte]
    return corte
  }

  /** Anular, no borrar: el corte deja de contar pero la constancia se queda. */
  async function anularCorte(idCorte, motivo = '') {
    const { error: fallo } = await supabase
      .from('cortes_caja')
      .update({ estado: 'anulado', motivo_anulacion: motivo.trim() || null })
      .eq('id', idCorte)

    if (fallo) throw traducirFallo(fallo)

    cortes.value = cortes.value.filter(c => c.id !== idCorte)
  }

  /**
   * El umbral se escribe tecleando, así que la pantalla se actualiza al momento y el
   * guardado espera a que la mano pare. Si el guardado falla, el número visible ya no
   * es el guardado: se recarga para no mentir.
   */
  function guardarUmbral(valor) {
    umbralDiferencia.value = Math.max(0, Math.round(Number(valor) || 0))
    if (!idNatillera.value) return

    clearTimeout(temporizadorUmbral)
    const aGuardar = umbralDiferencia.value
    const natilleraDelCambio = idNatillera.value

    temporizadorUmbral = setTimeout(async () => {
      const { error: fallo } = await supabase.rpc('guardar_umbral_corte', {
        p_natillera_id: natilleraDelCambio,
        p_umbral: aGuardar
      })
      if (fallo) {
        console.error('Cortes de caja: no se pudo guardar el umbral.', fallo)
        if (idNatillera.value === natilleraDelCambio) cargar()
      }
    }, RETARDO_UMBRAL)
  }

  watch(idNatillera, cargar, { immediate: true })

  onUnmounted(() => clearTimeout(temporizadorUmbral))

  return { cortes: cortesOrdenados, ultimoCorte, umbralDiferencia, cargando, error, cerrarCorte, anularCorte, guardarUmbral, cargar }
}

/** Los `numeric` de Postgres llegan como cadena por JSON; el resto del cálculo espera números. */
function normalizar(fila) {
  return {
    ...fila,
    esperado_efectivo: Number(fila.esperado_efectivo) || 0,
    real_efectivo: Number(fila.real_efectivo) || 0,
    esperado_transferencia: Number(fila.esperado_transferencia) || 0,
    real_transferencia: Number(fila.real_transferencia) || 0
  }
}

/** Mensajes que el usuario pueda entender a partir de los errores de la migración 026. */
function traducirFallo(fallo) {
  const texto = `${fallo.message || ''} ${fallo.details || ''}`
  if (fallo.code === '23505' || texto.includes('cortes_caja_un_corte_vigente_por_fecha')) {
    return new Error('Ya hay un corte cerrado con esta fecha. Anúlalo antes de sellar otro.')
  }
  if (fallo.code === '42501' || texto.includes('row-level security') || texto.includes('CORTE_PROHIBIDO')) {
    return new Error('No tienes permiso para cerrar cortes en esta natillera.')
  }
  if (texto.includes('CORTE_INMUTABLE') || texto.includes('CORTE_ANULADO')) {
    return new Error('Este corte ya no se puede modificar.')
  }
  return new Error(fallo.message || 'No se pudo guardar el corte.')
}

/** Diferencia de un corte sellado, por forma de pago y total. Positiva = sobrante. */
export function diferenciasDeCorte(corte) {
  if (!corte) return { efectivo: 0, transferencia: 0, total: 0 }
  const efectivo = (corte.real_efectivo || 0) - (corte.esperado_efectivo || 0)
  const transferencia = (corte.real_transferencia || 0) - (corte.esperado_transferencia || 0)
  return { efectivo, transferencia, total: efectivo + transferencia }
}
