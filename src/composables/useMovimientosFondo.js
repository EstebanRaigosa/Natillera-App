import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from './useAuditoria'

/**
 * Movimientos de fondo — ingresos, egresos y traslados que no vienen de una cuota,
 * un préstamo ni una actividad.
 *
 * Este composable es el **único sitio** donde se clasifica un movimiento y donde se
 * empareja un traslado (RNF-08 del levantamiento). `useLibroCaja.js` importa de aquí
 * sus heurísticas en vez de tener copia propia; queda pendiente que `CuadreCaja.vue`
 * haga lo mismo cuando deje de tener su CRUD embebido.
 *
 * ## Lo que este prototipo NO puede resolver todavía
 *
 * `movimientos_fondo` no tiene columna de concepto ni de grupo de traslado, así que:
 *
 * - **La clasificación sigue leyendo `descripcion`** (D-01). Está concentrada aquí para
 *   que la migración 028 toque un solo archivo, pero un cambio de redacción en los
 *   textos que escriben `Actividades.vue` y `Socios.vue` seguiría reclasificando dinero.
 * - **El traslado se sigue emparejando por coincidencia** de fecha, monto y formas
 *   opuestas (D-02). Aquí el emparejado es al menos **determinista** —se ordena antes de
 *   emparejar— y **avisa** cuando hay más de un candidato posible, en vez de elegir en
 *   silencio según el orden en que llegó la lista.
 */

/* ------------------------------- Vocabulario -------------------------------- */

/**
 * Los conceptos que hoy se derivan del texto. Serán los valores de la columna
 * `concepto` de la migración 028; el orden es el de la lista de filtros.
 */
export const CONCEPTOS_MOVIMIENTO = [
  { value: 'ingreso_manual', label: 'Ingreso', manual: true },
  { value: 'egreso_manual', label: 'Egreso', manual: true },
  { value: 'traslado', label: 'Traslado', manual: true },
  { value: 'premio_rifa', label: 'Premio de rifa', manual: false, modulo: 'Actividades', ruta: 'actividades' },
  { value: 'recaudo_actividad_liquidada', label: 'Recaudo de actividad', manual: false, modulo: 'Actividades', ruta: 'actividades' },
  { value: 'liquidacion_salida', label: 'Liquidación por salida', manual: false, modulo: 'Socios', ruta: 'socios' }
]

const POR_CONCEPTO = CONCEPTOS_MOVIMIENTO.reduce((acc, c) => {
  acc[c.value] = c
  return acc
}, {})

export const conceptoDefinicion = (concepto) => POR_CONCEPTO[concepto] || null

export const etiquetaConcepto = (concepto) => POR_CONCEPTO[concepto]?.label || 'Movimiento'

/** Chip por concepto, con la misma paleta que el libro de conciliación. */
export function claseConcepto(concepto) {
  const mapa = {
    ingreso_manual: 'bg-lime-100 text-lime-800',
    egreso_manual: 'bg-rose-100 text-rose-800',
    traslado: 'bg-indigo-100 text-indigo-800',
    premio_rifa: 'bg-amber-100 text-amber-800',
    recaudo_actividad_liquidada: 'bg-purple-100 text-purple-800',
    liquidacion_salida: 'bg-amber-100 text-amber-800'
  }
  return mapa[concepto] || 'bg-gray-100 text-gray-700'
}

/* --------------------------- Utilidades compartidas -------------------------- */

export const normalizarForma = (valor) =>
  String(valor || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo'

export const etiquetaForma = (forma) => (normalizarForma(forma) === 'transferencia' ? 'Transferencia' : 'Efectivo')

const montoDe = (m) => Math.abs(parseFloat(m?.monto ?? m?.Monto) || 0)

/** Día local en 'YYYY-MM-DD'. `fecha` es un `date`, pero llega como cadena. */
export function diaDe(valor) {
  if (!valor) return ''
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor
  const d = new Date(valor)
  if (isNaN(d.getTime())) return String(valor).slice(0, 10)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ---------------------- Clasificación por texto (deuda D-01) ----------------- */

const descripcionDe = (m) => (m && (m.descripcion ?? m.Descripcion ?? '')).toString().toLowerCase().trim()

export function esPremioRifa(m) {
  if (m?.tipo !== 'salida') return false
  const d = descripcionDe(m)
  return d.includes('premio rifa') || d.includes('rifa liquidada') || (d.includes('premio') && d.includes('rifa'))
}

export function esLiquidacionSalida(m) {
  if (m?.tipo !== 'salida') return false
  const d = descripcionDe(m)
  return d.includes('liquidación por salida') || d.includes('liquidacion por salida')
}

export function esRecaudoActividadLiquidada(m) {
  if (m?.tipo !== 'entrada') return false
  const d = descripcionDe(m)
  return d.includes('recaudo actividad liquidada') || d.includes('recaudo rifa liquidada')
}

/** El movimiento lo generó otro módulo y esta vista no debe poder tocarlo (RF-10). */
export function esAutomatico(m) {
  return esPremioRifa(m) || esLiquidacionSalida(m) || esRecaudoActividadLiquidada(m)
}

/**
 * Desde qué pantalla se registró un movimiento, deducido del apunte de auditoría.
 *
 * Ni `movimientos_fondo` ni `auditoria` guardan la vista de origen, pero cada una redacta
 * su apunte distinto: la vista de Totales prefija `[INGRESO MANUAL]`, `[EGRESO MANUAL]` o
 * `[TRANSFERENCIA - …]`, y esta vista escribe «Se registró…» o «Se trasladaron…». Es la
 * misma clase de deuda que clasificar leyendo `descripcion` (D-01): si alguien cambia esos
 * textos, esto deja de acertar. Por eso ante la duda devuelve vacío, y la interfaz dice
 * «no quedó registrado» en vez de inventarse una pantalla.
 */
export function pantallaDeRegistro(apunte) {
  const texto = (apunte || '').trim()
  if (!texto) return ''
  if (/^\[\s*(ingreso manual|egreso manual|transferencia)/i.test(texto)) return 'Totales'
  if (/^se\s+(registr|traslad)/i.test(texto)) return 'Movimientos'
  return ''
}

/** Nombre del socio que hoy vive dentro del texto de una liquidación por salida. */
export function socioDeLiquidacion(m) {
  const desc = (m?.descripcion || '').toString().trim()
  return desc.replace(/^Liquidación por salida\s*[-–]\s*/i, '').trim() || ''
}

/* ------------------------ Emparejado de traslados (D-02) --------------------- */

/**
 * Empareja las dos filas de cada traslado y devuelve un mapa `id → { grupo, ambiguo }`.
 *
 * Se ordena antes de recorrer (fecha, monto, id) para que el resultado no dependa del
 * orden en que la consulta devolvió las filas, que es el defecto de la implementación
 * actual. Cuando una fila tiene **más de un** par posible, las dos afectadas se marcan
 * `ambiguo` y la interfaz lo avisa: es el caso que la columna `grupo_traslado_id` de la
 * migración 028 resuelve de raíz.
 *
 * @param {Array<object>} manuales movimientos que no son automáticos
 */
export function emparejarTraslados(manuales) {
  const ordenados = [...(manuales || [])].sort((a, b) => {
    const diaA = diaDe(a.fecha)
    const diaB = diaDe(b.fecha)
    if (diaA !== diaB) return diaA.localeCompare(diaB)
    const montoA = montoDe(a)
    const montoB = montoDe(b)
    if (montoA !== montoB) return montoA - montoB
    return String(a.id).localeCompare(String(b.id))
  })

  const porId = new Map()
  const emparejados = new Set()

  ordenados.forEach(fila => {
    if (emparejados.has(fila.id)) return
    const monto = montoDe(fila)
    if (monto <= 0) return

    const candidatos = ordenados.filter(otra =>
      otra.id !== fila.id &&
      !emparejados.has(otra.id) &&
      otra.tipo !== fila.tipo &&
      normalizarForma(otra.forma_pago) !== normalizarForma(fila.forma_pago) &&
      diaDe(otra.fecha) === diaDe(fila.fecha) &&
      montoDe(otra) === monto
    )
    if (candidatos.length === 0) return

    const par = candidatos[0]
    const ambiguo = candidatos.length > 1
    const grupo = [String(fila.id), String(par.id)].sort().join('|')

    emparejados.add(fila.id)
    emparejados.add(par.id)
    porId.set(fila.id, { grupo, ambiguo, parId: par.id })
    porId.set(par.id, { grupo, ambiguo, parId: fila.id })
  })

  return porId
}

/* ------------------------------- Composable ---------------------------------- */

const COLUMNAS = 'id, natillera_id, tipo, monto, forma_pago, descripcion, fecha, origen_egreso, destino_ingreso, created_at, updated_at'

/**
 * @param {import('vue').Ref<string>} idNatillera
 */
export function useMovimientosFondo(idNatillera) {
  const auditoria = useAuditoria()

  const cargando = ref(true)
  const error = ref('')
  /** Filas crudas de `movimientos_fondo`, sin agrupar. */
  const filas = ref([])
  /** `entidad_id → { autor, apunte, cuando }`, reconstruido del rastro de auditoría. */
  const rastros = ref({})

  /** El primer rastro que exista entre los ids dados (un traslado tiene dos apuntes). */
  const rastroDe = (...ids) => {
    for (const id of ids) {
      if (id && rastros.value[id]) return rastros.value[id]
    }
    return null
  }

  async function cargar() {
    if (!idNatillera.value) return
    cargando.value = true
    error.value = ''
    try {
      const [movimientos, rastro] = await Promise.all([
        supabase
          .from('movimientos_fondo')
          .select(COLUMNAS)
          .eq('natillera_id', idNatillera.value)
          .order('fecha', { ascending: false }),
        // Quién registró cada movimiento, y desde dónde, no vive en la tabla: se
        // reconstruye del rastro de auditoría, que solo existe para los creados desde la
        // app (D-05). Se trae también `descripcion` porque es lo único que delata la
        // pantalla de origen (ver `pantallaDeRegistro`).
        supabase
          .from('auditoria')
          .select('entidad_id, usuario_email, descripcion, tipo_accion, created_at')
          .eq('natillera_id', idNatillera.value)
          .eq('entidad', 'movimientos_fondo')
          .eq('tipo_accion', 'CREATE')
      ])

      if (movimientos.error) throw movimientos.error
      filas.value = (movimientos.data || []).map(f => ({ ...f, monto: parseFloat(f.monto) || 0 }))

      const mapa = {}
      if (!rastro.error) {
        ;(rastro.data || []).forEach(r => {
          if (!r.entidad_id) return
          mapa[r.entidad_id] = {
            autor: r.usuario_email || null,
            apunte: (r.descripcion || '').trim(),
            cuando: r.created_at || null
          }
        })
      }
      rastros.value = mapa
    } catch (e) {
      console.error('Movimientos de fondo: no se pudieron cargar.', e)
      error.value = e.message || 'No se pudieron cargar los movimientos'
      filas.value = []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Un movimiento por fila de pantalla: el traslado se presenta como **uno**, aunque
   * por debajo sean dos apuntes (RF-04). El signo es el efecto sobre el saldo de su
   * forma de pago; el traslado no lleva signo porque no cambia el total.
   */
  const grupos = computed(() => {
    const automaticas = []
    const manuales = []
    filas.value.forEach(f => (esAutomatico(f) ? automaticas : manuales).push(f))

    const trasladoPorId = emparejarTraslados(manuales)
    const resultado = []
    const consumidos = new Set()

    manuales.forEach(fila => {
      if (consumidos.has(fila.id)) return
      const traslado = trasladoPorId.get(fila.id)

      if (traslado) {
        const par = manuales.find(m => m.id === traslado.parId)
        consumidos.add(fila.id)
        if (par) consumidos.add(par.id)
        const salida = fila.tipo === 'salida' ? fila : par
        const entrada = fila.tipo === 'entrada' ? fila : par
        const rastro = rastroDe(salida?.id, entrada?.id)
        resultado.push({
          clave: traslado.grupo,
          concepto: 'traslado',
          esManual: true,
          esTraslado: true,
          direccion: 'traslado',
          monto: montoDe(fila),
          signo: 0,
          formaPago: normalizarForma(salida?.forma_pago),
          formaOrigen: normalizarForma(salida?.forma_pago),
          formaDestino: normalizarForma(entrada?.forma_pago),
          descripcion: (fila.descripcion || par?.descripcion || '').toString().trim(),
          fecha: diaDe(fila.fecha),
          origenEgreso: null,
          destinoIngreso: null,
          parAmbiguo: traslado.ambiguo,
          filas: [salida, entrada].filter(Boolean),
          autor: rastro?.autor || null,
          rastro
        })
        return
      }

      const esEntrada = fila.tipo === 'entrada'
      consumidos.add(fila.id)
      const rastroFila = rastroDe(fila.id)
      resultado.push({
        clave: String(fila.id),
        concepto: esEntrada ? 'ingreso_manual' : 'egreso_manual',
        esManual: true,
        esTraslado: false,
        direccion: esEntrada ? 'ingreso' : 'egreso',
        monto: montoDe(fila),
        signo: esEntrada ? 1 : -1,
        formaPago: normalizarForma(fila.forma_pago),
        descripcion: (fila.descripcion || '').toString().trim(),
        fecha: diaDe(fila.fecha),
        origenEgreso: fila.origen_egreso || null,
        destinoIngreso: fila.destino_ingreso || null,
        parAmbiguo: false,
        filas: [fila],
        autor: rastroFila?.autor || null,
        rastro: rastroFila
      })
    })

    automaticas.forEach(fila => {
      let concepto = 'premio_rifa'
      if (esLiquidacionSalida(fila)) concepto = 'liquidacion_salida'
      else if (esRecaudoActividadLiquidada(fila)) concepto = 'recaudo_actividad_liquidada'
      const esEntrada = fila.tipo === 'entrada'
      const rastroFila = rastroDe(fila.id)
      resultado.push({
        clave: String(fila.id),
        concepto,
        esManual: false,
        esTraslado: false,
        direccion: esEntrada ? 'ingreso' : 'egreso',
        monto: montoDe(fila),
        signo: esEntrada ? 1 : -1,
        formaPago: normalizarForma(fila.forma_pago),
        descripcion: (fila.descripcion || '').toString().trim(),
        socio: concepto === 'liquidacion_salida' ? socioDeLiquidacion(fila) : '',
        fecha: diaDe(fila.fecha),
        origenEgreso: fila.origen_egreso || null,
        destinoIngreso: fila.destino_ingreso || null,
        parAmbiguo: false,
        filas: [fila],
        autor: rastroFila?.autor || null,
        rastro: rastroFila
      })
    })

    return resultado.sort((a, b) => {
      if (a.fecha !== b.fecha) return (b.fecha || '').localeCompare(a.fecha || '')
      return String(b.clave).localeCompare(String(a.clave))
    })
  })

  /** Traslados cuyo emparejado tenía más de un candidato: hay que avisarlo (D-02). */
  const trasladosAmbiguos = computed(() => grupos.value.filter(g => g.parAmbiguo))

  /* --------------------------------- Escritura ------------------------------- */

  const auditar = (promesa) => registrarAuditoriaEnSegundoPlano(promesa)

  const textoMoneda = (valor) => `$${Math.round(valor || 0).toLocaleString('es-CO')}`

  /**
   * Ingreso o egreso: una sola fila.
   */
  async function crearMovimiento({ direccion, monto, formaPago, descripcion, fecha, bolsillo }) {
    const tipo = direccion === 'ingreso' ? 'entrada' : 'salida'
    const registro = {
      natillera_id: idNatillera.value,
      tipo,
      monto: Math.round(monto),
      forma_pago: normalizarForma(formaPago),
      descripcion: (descripcion || '').trim() || (direccion === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
      fecha
    }
    if (direccion === 'ingreso') registro.destino_ingreso = bolsillo
    else registro.origen_egreso = bolsillo

    const { data, error: fallo } = await supabase
      .from('movimientos_fondo')
      .insert(registro)
      .select(COLUMNAS)
      .single()

    if (fallo) throw traducirFallo(fallo)

    filas.value = [{ ...data, monto: parseFloat(data.monto) || 0 }, ...filas.value]
    auditar(auditoria.registrarCreacion(
      'movimientos_fondo',
      data.id,
      `Se registró un ${direccion} de ${textoMoneda(registro.monto)} en ${etiquetaForma(registro.forma_pago).toLowerCase()}`,
      registro,
      idNatillera.value
    ))
    return data
  }

  /**
   * Traslado: dos apuntes, uno de salida en la forma de origen y otro de entrada en la
   * de destino.
   *
   * **No es atómico** (RNF-07): sin una RPC en la base de datos, el cliente hace dos
   * inserts. Si el segundo falla se borra el primero, pero un corte de red entre ambos
   * dejaría un apunte suelto que se vería como un egreso. Es la limitación conocida del
   * prototipo y la razón por la que la migración 028 propone `registrar_traslado()`.
   */
  async function crearTraslado({ monto, formaOrigen, descripcion, fecha }) {
    const origen = normalizarForma(formaOrigen)
    const destino = origen === 'efectivo' ? 'transferencia' : 'efectivo'
    const texto = (descripcion || '').trim() || 'Traslado entre formas de pago'
    const importe = Math.round(monto)

    const { data: salida, error: falloSalida } = await supabase
      .from('movimientos_fondo')
      .insert({ natillera_id: idNatillera.value, tipo: 'salida', monto: importe, forma_pago: origen, descripcion: texto, fecha })
      .select(COLUMNAS)
      .single()
    if (falloSalida) throw traducirFallo(falloSalida)

    const { data: entrada, error: falloEntrada } = await supabase
      .from('movimientos_fondo')
      .insert({ natillera_id: idNatillera.value, tipo: 'entrada', monto: importe, forma_pago: destino, descripcion: texto, fecha })
      .select(COLUMNAS)
      .single()

    if (falloEntrada) {
      // Deshacer el primer apunte: dejarlo solo lo convertiría en un egreso fantasma.
      await supabase.from('movimientos_fondo').delete().eq('id', salida.id)
      throw new Error('No se pudo completar el traslado. No quedó ningún apunte a medias.')
    }

    filas.value = [
      { ...salida, monto: parseFloat(salida.monto) || 0 },
      { ...entrada, monto: parseFloat(entrada.monto) || 0 },
      ...filas.value
    ]
    auditar(auditoria.registrarCreacion(
      'movimientos_fondo',
      salida.id,
      `Se trasladaron ${textoMoneda(importe)} de ${etiquetaForma(origen).toLowerCase()} a ${etiquetaForma(destino).toLowerCase()}`,
      { salida, entrada },
      idNatillera.value
    ))
    return { salida, entrada }
  }

  /**
   * Editar. Si el grupo es un traslado, se actualizan **los dos** apuntes para que no
   * se desemparejen (RF-05): cambiar el monto de uno solo rompería la coincidencia por
   * la que hoy se reconocen como pareja.
   */
  async function actualizarGrupo(grupo, cambios) {
    if (!grupo?.esManual) throw new Error('Este movimiento lo generó otro módulo y se corrige allí')

    if (grupo.esTraslado) {
      const origen = normalizarForma(cambios.formaOrigen || grupo.formaOrigen)
      const destino = origen === 'efectivo' ? 'transferencia' : 'efectivo'
      const importe = Math.round(cambios.monto)
      const texto = (cambios.descripcion || '').trim() || 'Traslado entre formas de pago'

      const salida = grupo.filas.find(f => f.tipo === 'salida')
      const entrada = grupo.filas.find(f => f.tipo === 'entrada')

      const [resSalida, resEntrada] = await Promise.all([
        supabase.from('movimientos_fondo')
          .update({ monto: importe, forma_pago: origen, descripcion: texto, fecha: cambios.fecha })
          .eq('id', salida.id).select(COLUMNAS).single(),
        supabase.from('movimientos_fondo')
          .update({ monto: importe, forma_pago: destino, descripcion: texto, fecha: cambios.fecha })
          .eq('id', entrada.id).select(COLUMNAS).single()
      ])
      if (resSalida.error) throw traducirFallo(resSalida.error)
      if (resEntrada.error) throw traducirFallo(resEntrada.error)

      reemplazarFilas([resSalida.data, resEntrada.data])
      auditar(auditoria.registrarActualizacion(
        'movimientos_fondo',
        salida.id,
        `Se editó un traslado de ${textoMoneda(importe)}`,
        { salida, entrada },
        { salida: resSalida.data, entrada: resEntrada.data },
        idNatillera.value
      ))
      return
    }

    const fila = grupo.filas[0]
    const actualizacion = {
      monto: Math.round(cambios.monto),
      forma_pago: normalizarForma(cambios.formaPago),
      descripcion: (cambios.descripcion || '').trim() || (grupo.direccion === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
      fecha: cambios.fecha
    }
    // El bolsillo (recaudado / utilidades) reparte a quién pertenece el dinero y decide
    // el reparto del cierre; se conserva la dirección original, que no se puede cambiar.
    if (grupo.direccion === 'ingreso') actualizacion.destino_ingreso = cambios.bolsillo
    else actualizacion.origen_egreso = cambios.bolsillo

    const { data, error: fallo } = await supabase
      .from('movimientos_fondo')
      .update(actualizacion)
      .eq('id', fila.id)
      .select(COLUMNAS)
      .single()
    if (fallo) throw traducirFallo(fallo)

    reemplazarFilas([data])
    auditar(auditoria.registrarActualizacion(
      'movimientos_fondo',
      fila.id,
      null,
      fila,
      data,
      idNatillera.value
    ))
  }

  /** Borrar. Un traslado se borra completo: dejar medio traslado descuadra la caja. */
  async function eliminarGrupo(grupo) {
    if (!grupo?.esManual) throw new Error('Este movimiento lo generó otro módulo y se corrige allí')

    const ids = grupo.filas.map(f => f.id)
    const { data, error: fallo } = await supabase
      .from('movimientos_fondo')
      .delete()
      .in('id', ids)
      .select('id')
    if (fallo) throw traducirFallo(fallo)

    // Con RLS y sin política de borrado, PostgREST responde «ok» sin borrar nada.
    if ((data || []).length === 0) {
      throw new Error('No tienes permiso para eliminar movimientos en esta natillera')
    }

    const borrados = new Set((data || []).map(d => d.id))
    filas.value = filas.value.filter(f => !borrados.has(f.id))
    auditar(auditoria.registrarEliminacion(
      'movimientos_fondo',
      ids[0],
      `Se eliminó un ${etiquetaConcepto(grupo.concepto).toLowerCase()} de ${textoMoneda(grupo.monto)}`,
      grupo.filas,
      idNatillera.value
    ))
  }

  function reemplazarFilas(nuevas) {
    const porId = new Map(nuevas.filter(Boolean).map(n => [n.id, { ...n, monto: parseFloat(n.monto) || 0 }]))
    filas.value = filas.value.map(f => porId.get(f.id) || f)
  }

  return {
    cargando,
    error,
    filas,
    grupos,
    trasladosAmbiguos,
    cargar,
    crearMovimiento,
    crearTraslado,
    actualizarGrupo,
    eliminarGrupo
  }
}

/** Los errores de Postgres no son para el usuario; los `CHECK` de la tabla sí se pueden explicar. */
function traducirFallo(fallo) {
  const texto = `${fallo.message || ''} ${fallo.details || ''}`
  if (texto.includes('movimientos_fondo_monto_check')) {
    return new Error('El monto tiene que ser mayor que cero')
  }
  if (fallo.code === '42501' || texto.includes('row-level security')) {
    return new Error('No tienes permiso para registrar movimientos en esta natillera')
  }
  return new Error(fallo.message || 'No se pudo guardar el movimiento')
}
