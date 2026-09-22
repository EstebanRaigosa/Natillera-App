import { computed } from 'vue'
import { useLibroCaja, etiquetaTipo, claseTipo, colorTipo, SOCIO_FONDO } from './useLibroCaja'

/**
 * Pagos de los socios — la misma verdad del libro de caja, pero mirada desde quien paga.
 *
 * El libro (`useLibroCaja`) ya reconstruye cada peso que entra o sale de la natillera
 * cruzando cuotas, sanciones, actividades, cuotas de préstamo, GMF y movimientos. Aquí no
 * se vuelve a consultar nada: se filtra ese libro a lo que un socio **entregó** y se agrupa
 * por mes y por socio. Duplicar las consultas sería pedir que dos pantallas digan cifras
 * distintas del mismo dinero.
 */

export { etiquetaTipo, claseTipo, colorTipo }

/**
 * Lo que sale del bolsillo del socio. El 4x1000 entra aquí porque el libro lo registra como
 * dinero que entra junto al abono por transferencia, atribuido a quien lo hizo: dejarlo
 * fuera haría que la suma de una transferencia no cuadrara con lo que el socio entregó.
 *
 * Fuera quedan, a propósito:
 * - `prestamo`, `liquidacion_salida`, `premio_rifa`: dinero que va HACIA el socio.
 * - los movimientos manuales: no tienen socio al que atribuirlos.
 */
export const TIPOS_PAGO_SOCIO = [
  { value: 'cuota', label: 'Cuotas' },
  { value: 'sancion', label: 'Sanciones' },
  { value: 'actividad', label: 'Actividades' },
  { value: 'cuota_prestamo', label: 'Cuotas de préstamo' },
  { value: 'interes_anticipado', label: 'Interés de préstamo' },
  { value: 'gmf_4x1000', label: '4x1000' }
]

const VALORES_TIPO = new Set(TIPOS_PAGO_SOCIO.map(t => t.value))

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** 'YYYY-MM' → 'Marzo 2026'. Con mayúscula inicial porque encabeza una tarjeta. */
export function nombreMes(mesClave) {
  if (!mesClave) return 'Sin fecha'
  const [anio, mes] = mesClave.split('-')
  const nombre = MESES[Number(mes) - 1]
  if (!nombre) return mesClave
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`
}

export function mesCorto(numeroMes) {
  return MESES_CORTOS[Number(numeroMes) - 1] || ''
}

/**
 * El período al que pertenece el pago, que no es lo mismo que el día en que se pagó:
 * una cuota de enero se puede abonar en marzo, y mezclarlas sería mentir en las dos.
 */
function textoPeriodo(apunte) {
  if (!apunte.mes || !apunte.anio) return ''
  const mes = mesCorto(apunte.mes)
  if (!mes) return ''
  const quincena = apunte.quincena
  if (quincena != null && apunte.socioEsMensual === false) {
    return `${quincena}ª quincena de ${mes} ${apunte.anio}`
  }
  return `${mes} ${apunte.anio}`
}

/**
 * Iniciales para el avatar de la fila. Dos palabras como mucho: «María Fernanda Ríos»
 * cabe como «MF», no como «MFR».
 */
export function iniciales(nombre) {
  const partes = String(nombre || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '—'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
}

/** Color estable por nombre: el mismo socio se pinta igual en toda la lista. */
export function colorSocio(nombre) {
  const paleta = [
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100 text-sky-800',
    'bg-amber-100 text-amber-800',
    'bg-violet-100 text-violet-800',
    'bg-rose-100 text-rose-800',
    'bg-teal-100 text-teal-800',
    'bg-indigo-100 text-indigo-800'
  ]
  const texto = String(nombre || '')
  let suma = 0
  for (let i = 0; i < texto.length; i++) suma = (suma + texto.charCodeAt(i)) % 997
  return paleta[suma % paleta.length]
}

/**
 * @param {import('vue').Ref<string>} idNatillera
 */
export function usePagosSocios(idNatillera) {
  const { cargando, error, natillera, apuntes, cargar } = useLibroCaja(idNatillera)

  /**
   * Un apunte del libro ya viene con fecha resuelta y partido por forma de pago (un pago
   * mixto son dos apuntes). Se conserva ese desglose: agruparlo aquí escondería que la
   * mitad entró en efectivo, que es justo lo que se va a mirar cuando algo no cuadre.
   */
  const pagos = computed(() =>
    apuntes.value
      // `SOCIO_FONDO` fuera: el recaudo que entra al liquidar una actividad es del fondo,
      // no de una persona, y aquí solo cuenta lo que pagó alguien.
      .filter(a => VALORES_TIPO.has(a.tipo) && a.monto > 0 && a.socio && a.socio !== '—' && a.socio !== SOCIO_FONDO)
      .map(a => ({
        clave: a.clave,
        tipo: a.tipo,
        concepto: a.concepto,
        socio: a.socio,
        formaPago: a.forma_pago,
        monto: a.monto,
        fecha: a.fecha || '',
        fechaEstimada: a.fechaEstimada === true,
        esParcial: a.esParcial === true,
        periodo: textoPeriodo(a),
        // Se agrupa por el mes en que ENTRÓ el dinero. Sin fecha no hay mes al que llevarlo:
        // va a un cajón propio en vez de inventarle uno.
        mesClave: a.fecha ? a.fecha.slice(0, 7) : ''
      }))
      // El libro ordena de más antiguo a más reciente para acumular saldo; aquí interesa
      // lo último primero, que es lo que se viene a consultar.
      .sort((x, y) => (y.fecha || '').localeCompare(x.fecha || ''))
  )

  const socios = computed(() => {
    const nombres = new Set(pagos.value.map(p => p.socio))
    return [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const meses = computed(() => {
    const claves = new Set(pagos.value.map(p => p.mesClave).filter(Boolean))
    return [...claves].sort((a, b) => b.localeCompare(a))
  })

  return { cargando, error, natillera, pagos, socios, meses, cargar }
}
