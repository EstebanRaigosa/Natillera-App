const MESES_CORTO = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

/** "Ene 2024 - Dic 2024" según mes_inicio / anio_inicio / mes_fin / anio */
export function formatearRangoMeses(natillera) {
  const mesInicio = natillera.mes_inicio || 1
  const anioInicio = natillera.anio_inicio || natillera.anio || new Date().getFullYear()
  const mesFin = natillera.mes_fin || 12
  const anioFin = natillera.anio || anioInicio

  const mesInicioTexto = MESES_CORTO[mesInicio - 1] || 'Ene'
  const mesFinTexto = MESES_CORTO[mesFin - 1] || 'Dic'

  if (anioInicio === anioFin) {
    return `${mesInicioTexto} ${anioInicio} - ${mesFinTexto} ${anioFin}`
  }
  return `${mesInicioTexto} ${anioInicio} - ${mesFinTexto} ${anioFin}`
}

/** "Ene 2024" */
export function formatearMesAnio(mes, anio) {
  const m = MESES_CORTO[(mes || 1) - 1] || 'Ene'
  return `${m} ${anio ?? ''}`.trim()
}
