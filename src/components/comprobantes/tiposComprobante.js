import {
  BanknotesIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CheckBadgeIcon,
  TicketIcon,
  FlagIcon,
  DocumentTextIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/vue/24/outline'

/*
 * Identidad de cada comprobante. Todos comparten la cabecera verde de marca: lo que los
 * distingue es el nombre en grande y un icono propio (antes todos decían «Comprobante de
 * pago» en un rótulo de 10 px y el socio no distinguía un pago de cuota de un abono).
 */
export const TIPOS_COMPROBANTE = {
  cuota: { titulo: 'Pago de cuota', detalle: 'Ahorro de la natillera', icono: BanknotesIcon },
  abonoPrestamo: { titulo: 'Abono a préstamo', detalle: 'Pago de un préstamo', icono: ArrowDownCircleIcon },
  prestamoPagado: { titulo: 'Préstamo pagado', detalle: 'Préstamo saldado por completo', icono: CheckBadgeIcon },
  prestamoNuevo: { titulo: 'Préstamo entregado', detalle: 'Nuevo préstamo', icono: ArrowUpCircleIcon },
  prestamoEstado: { titulo: 'Estado del préstamo', detalle: 'Información del préstamo', icono: DocumentTextIcon },
  actividad: { titulo: 'Pago de actividad', detalle: 'Rifas y eventos', icono: TicketIcon },
  cierre: { titulo: 'Liquidación de cierre', detalle: 'Cierre de la natillera', icono: FlagIcon },
  estado: { titulo: 'Estado de cuenta', detalle: 'Resumen de lo pendiente', icono: DocumentTextIcon },
  retiro: { titulo: 'Retiro de socio', detalle: 'Liquidación del retiro', icono: ArrowRightStartOnRectangleIcon }
}
