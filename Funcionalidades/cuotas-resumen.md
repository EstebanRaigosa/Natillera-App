# Cuotas — cómo funciona (solo funcionalidad)

## Qué son

Cada **socio** de una natillera tiene **cuotas**: obligaciones de pago que se organizan por **mes** dentro del **período operativo** de la natillera (mes de inicio, mes de fin y año base que define en qué año calendario cae cada mes del período). Un socio puede pagar **una vez al mes** o **dos veces al mes** (quincenal): en ese caso el mes tiene dos cuotas distintas (primera y segunda quincena).

## Generar y actualizar el mes

Quien administra puede **generar o actualizar las cuotas de un mes** indicando las **fechas límite** (y, cuando aplica, fechas distintas por quincena). Solo entran socios **activos**. Si ya existían cuotas en ese mes, el sistema las **ajusta** en lugar de duplicarlas. Si un socio **cambia de mensual a quincenal** (o al revés), el dinero ya registrado se **reparte o consolida** de forma coherente entre las nuevas filas de cuota(El ajuste de la cuota se plantea desde el modulo de socios, fuera de este alcance).

## Cómo se entiende “en qué va” cada cuota (fechas)

Cada cuota tiene una **fecha límite**: a partir de ahí deja de considerarse “antes del plazo”. Después de la límite suele haber unos **días de gracia** (configurables en la natillera): mientras uno está entre la límite y el fin de esa gracia, la cuota se ve como **pendiente de pago sin mora**. Si ya pasó el fin de la gracia y aún falta dinero, entra en **mora**. Si todavía no llegó la fecha límite, sigue **programada**. Si pagó solo una parte de lo que corresponde, queda en **pago parcial**. Cuando el monto de la cuota base está cubierto, se considera **pagada** respecto a esa cuota (pueden seguir existiendo otros conceptos asociados al mismo registro, según la configuración).

El sistema **revisa con la fecha de hoy** cómo deben verse las cuotas y puede **corregir** estados cuando el calendario avanza (por ejemplo, pasar de programada a pendiente o a mora).

## Multas y sanciones por mora

Si la natillera tiene **sanciones activas**, una cuota en mora puede acumular **multa**. Las reglas pueden ser, a grandes rasgos: un **valor fijo**, un esquema que **sube** según cuántas cuotas lleva el socio en mora (**escalonada**), o un cálculo **por días** en mora. También puede haber **intereses adicionales** según días acumulados. En casos puntuales se puede **marcar una cuota** para que **no se le calculen multas**. Quien paga puede ver el desglose de cuota, multa y otros conceptos antes de confirmar.

## Registrar un pago

Al registrar un abono, el dinero se **aplica en un orden fijo**: primero lo pendiente de **sanción**, luego **actividades** vinculadas que se hayan incluido en ese pago, luego **cuotas de préstamos** si aplican, y por último el saldo de la **cuota de la natillera**. Se puede indicar **efectivo**, **transferencia** o **mixto**; si aplica, el flujo contempla el **4×1000** sobre transferencias de forma que el neto que baja la deuda sea el acordado. Cada pago puede llevar **comprobante** y queda **historial** del movimiento.

Cuando el total cubre todo lo que ese registro exige (cuota + sanción pendiente + lo demás incluido en esa operación), la cuota pasa a tratarse como **pagada**; si no alcanza, queda **parcial** o en el estado que marquen la fecha límite y la gracia.

## Lista del mes, filtros y resumen

En la vista del mes se listan las cuotas con **filtros** por estado (por ejemplo solo mora o solo pendientes; “pendiente” aquí es la ventana entre límite y fin de gracia, no lo que aún está “programado”), por **periodicidad** (mensual vs quincenal) y por **forma de pago**. Hay **búsqueda** por nombre, documento, teléfono u otros textos visibles. El **orden** prioriza mora, luego pendientes, luego programadas y al final las pagadas, y dentro de eso por nombre del socio.

Los socios **inactivos** **dejan de mostrarse** en la lista si aún deben algo del mes; si ya habían **completado** todas las cuotas de ese mes antes de darse de baja, **sí pueden seguir apareciendo** para consulta.

El **resumen del mes** cuenta cuántas cuotas van en cada estado y muestra **porcentaje y total recaudado** respecto a los valores de cuota del mes; el total puede **incluir** también dinero ya imputado a sanciones, actividades o préstamos según cómo esté armado el resumen en pantalla.

## Otras acciones habituales

Según permisos, se pueden **editar** datos de cuotas, **exportar** listados, **borrar** cuotas de un periodo o **gestionar comprobantes** y ajustes puntuales. La experiencia concreta (botones, modales, permisos por rol) sigue las pantallas de la app; lo anterior describe **qué hace el módulo de cuotas** en términos de negocio.
