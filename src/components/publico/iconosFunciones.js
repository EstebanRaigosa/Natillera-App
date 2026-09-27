/*
 * Icono y color de cada función de la app (claves de FUNCIONES en contenidoPublico.js).
 * Los comparten la portada y la guía para que una función se vea igual en las dos.
 */
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline'

export const ICONOS_FUNCION = {
  cuotas: CurrencyDollarIcon,
  prestamos: BanknotesIcon,
  actividades: TrophyIcon,
  caja: ScaleIcon,
  cierre: CalendarDaysIcon,
  whatsapp: ChatBubbleLeftRightIcon
}

// Círculos de icono: tonos de la marca y el dorado de las monedas como acento.
export const COLOR_FUNCION = {
  cuotas: 'bg-gradient-to-br from-[#2d7a4d] to-[#1B5E37]',
  prestamos: 'bg-gradient-to-br from-[#d9a52e] to-[#b8841a]',
  actividades: 'bg-gradient-to-br from-[#3f9a67] to-[#23704a]',
  caja: 'bg-gradient-to-br from-[#2d7a4d] to-[#14502f]',
  cierre: 'bg-gradient-to-br from-[#d9a52e] to-[#b8841a]',
  whatsapp: 'bg-gradient-to-br from-[#3f9a67] to-[#1B5E37]'
}
