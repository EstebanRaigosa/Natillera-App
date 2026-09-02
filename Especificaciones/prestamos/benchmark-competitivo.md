# Préstamos — Benchmark competitivo y análisis de brechas

| Campo | Valor |
|-------|-------|
| **Módulo** | Préstamos |
| **Tipo de documento** | Investigación de mercado + análisis de brechas (insumo para `especificacion.md`) |
| **Estado** | v1.0 · Borrador para discusión |
| **Fecha** | 2026-09-02 |
| **Línea base del producto** | `src/views/prestamos/Prestamos.vue` (9.407 líneas), `src/utils/natilleraPrestamos.js`, `Funcionalidades/Prestamos/prestamos-funcional.md` |
| **Alcance** | Qué hacen los competidores, qué hacemos mejor, qué nos falta y qué se debe agregar |

---

## 1. Resumen ejecutivo

**No estamos desfasados. Estamos adelantados en el motor de cálculo y atrasados en el ciclo de vida del préstamo.**

Tres conclusiones:

1. **Nuestro núcleo de cálculo supera a todos los competidores directos del nicho natillera.** Ninguna app colombiana de natillera publica soporte para interés anticipado, refinanciación sobre saldo, mora proporcional por días sin anatocismo, ni cobro integrado préstamo + cuota de ahorro con orden de prioridad. Nosotros sí tenemos las cuatro cosas, verificadas en código.
2. **Nos falta todo lo que ocurre *antes* del desembolso y *después* del vencimiento.** No hay solicitud, ni aprobación, ni codeudor, ni tope de préstamo ligado al ahorro del socio, ni recordatorios automáticos, ni exportación de cartera, ni cierre de ciclo con préstamos vigentes. Eso es exactamente lo que sí ofrecen Chamasoft, Savinco, DreamSave y el software del sector solidario colombiano.
3. **Hay dos vacíos de negocio que ningún competidor resuelve bien y que podríamos convertir en diferenciador**: (a) qué pasa con un préstamo vigente cuando la natillera cierra en diciembre, y (b) validación de la tasa pactada contra la tasa de usura vigente.

**Riesgo material detectado:** el modelo de interés implementado es *flat* (`capital × tasa × nº cuotas`). Si el socio paga antes del plazo, paga el interés completo del plazo original. En Colombia el prepago total o parcial sin penalización es un derecho legal para créditos de bajo monto (Ley 1555 de 2012), y una tasa del 5 % mensual —común en natilleras— equivale a ~80 % E.A., por encima de la tasa de usura certificada. Ver §8.

---

## 2. Metodología y fuentes

Se revisaron cuatro categorías de competidores, más el marco normativo colombiano y reglamentos reales de natilleras publicados por sus propios socios (que son, en la práctica, la especificación funcional que el usuario espera).

| Categoría | Qué aporta al análisis |
|-----------|------------------------|
| A. Apps de natillera colombianas | Competencia directa; define el piso de expectativas del usuario |
| B. Plataformas de grupos de ahorro (África / global) | El mismo modelo de negocio, 10 años más maduro |
| C. Software de prestamistas y cartera (LATAM) | El estado del arte en cobranza y automatización |
| D. Core financiero solidario y microfinanzas | El techo funcional: qué existe cuando el préstamo es el negocio |
| E. Reglamentos de natilleras reales | Las reglas de negocio que el usuario da por hechas |

La línea base propia no se tomó de la documentación sino **leyendo el código**, como exige `Especificaciones/README.md`.

---

## 3. Panorama competitivo

### A. Apps de natillera colombianas (competencia directa)

| Producto | Qué ofrece en préstamos | Profundidad |
|----------|-------------------------|-------------|
| **Natillera MiAhorro** (`natilleramiahorro.com`) | "Solicitud de préstamos" desde portal del socio + "administración de préstamos" en panel admin. Ahorro semanal, rifas mensuales, recordatorios automáticos, reportes. Modelo de negocio: $20.000 COP/año por cuenta | Baja en cálculo, **alta en flujo**: tiene solicitud desde el socio, que nosotros no tenemos |
| **Natillera.com.co** | "Control completo de préstamos otorgados. Registra, actualiza y **recibe notificaciones de pagos pendientes**". Multas configurables por semana/quincena/mes. Reportes de cuotas y préstamos. Portal donde el socio "ve sus préstamos". Se declara explícitamente herramienta contable que no maneja dinero | Baja en cálculo, **notificaciones automáticas** y **reportería** por delante de nosotros |
| **Natillera.app** | Se posiciona como "la forma moderna de gestionar grupos de ahorro comunitarios": aportes, eventos, metas financieras | No verificable (sitio devolvió 402) |
| **Natillera Familiar** (APK) | Control de ahorro por socio, gestión de eventos, "gestión completa de préstamos con control de intereses" | Muy baja; app individual |
| **Modelo tradicional en hoja de cálculo** (el competidor real: Excel/WhatsApp) | Listado de préstamos + hoja de abonos por préstamo, imitando el cuaderno | El benchmark que la mayoría de natilleras usa hoy |

> Lectura: **el competidor directo compite por flujo y notificaciones, no por precisión financiera**. Nuestra ventaja en cálculo no es visible para el usuario si no la traducimos en confianza y automatización.

### B. Plataformas de grupos de ahorro (mismo modelo, mercado maduro)

| Producto | Módulo de préstamos |
|----------|---------------------|
| **Chamasoft** (Kenia) | **Productos de préstamo configurables** por el grupo ("toda la constitución del préstamo cargada en la plataforma"), **solicitud del préstamo por el propio socio**, **garantes que aprueban la solicitud**, seguimiento, cronogramas de pago, tasas y plazos personalizables, módulo separado de **multas configurables por categoría**, reportes con "Loan Summaries", backdating de registros históricos |
| **Savinco** | Solicitud de préstamo con **notificación instantánea al grupo**, el socio declara **destino del préstamo y plazo**, **el grupo decide colectivamente la aprobación**, **cupo atado al ahorro** ("mientras más ahorra, mayor el préstamo posible"), consulta de préstamos activos e historial |
| **DreamSave** (DreamStart Labs, 30.000+ grupos, 34 países) | Otorgar préstamos **según criterios de elegibilidad del grupo**, tasas y duración; seguimiento de pagos, **préstamos renovados (rollover)** y **castigo de cartera (write-off)**; libro digital que reemplaza el cuaderno; funciona **sin conexión** |
| **SavingsGroups.app** | Asistencia, ahorros, créditos, aportes, ingresos/egresos, **múltiples fondos**, **configuración de ciclo**, **liquidación de reparto al cierre del ciclo**, offline/online, un solo smartphone por grupo, marca blanca |

> Lectura: los cuatro tienen **solicitud + aprobación + garantes/cupo atado al ahorro**. Los cuatro tratan el **ciclo** (apertura → operación → liquidación) como concepto de primera clase. Nosotros no tenemos ninguno de esos elementos.

### C. Software de prestamistas y cartera (LATAM)

| Producto | Lo relevante |
|----------|--------------|
| **CobrApp** (MWM) | **Tres modos de interés: fijo, recalculado sobre saldo, y capitalización bancaria**. Periodicidad diaria/semanal/quincenal/mensual. Rutas de cobro con cobradores y geolocalización, bloqueo de festivos, multiusuario con permisos por rol, **recibos PDF con marca propia** para impresora Bluetooth 58 mm y envío por WhatsApp, dashboard con capital en la calle, interés ganado, **proyección de flujo de caja y alertas de mora**, **exportación a Excel/CSV**, respaldo cifrado en la nube. Freemium: gratis hasta 10 clientes, ~US$8,99/mes premium |
| **Jasicash** | Automatización de WhatsApp, **mapas de cobro con GPS**, portal del cliente, **contratos y cartas de saldo en PDF**, control de morosidad |
| **Prestabit / CrediManager** | Cuotas fijas o interés compuesto, cobranza automatizada, reportes financieros en tiempo real |

> Lectura: aquí está **el estándar de automatización de cobranza** al que el usuario ya está expuesto. Recordatorio automático antes del vencimiento, recibo PDF con marca y exportación a Excel son *table stakes* en 2026, y no los tenemos.

### D. Core financiero solidario y microfinanzas (techo funcional)

| Producto | Lo relevante |
|----------|--------------|
| **Apache Fineract** (estándar abierto de microfinanzas) | Producto de préstamo configurable: **métodos de interés (flat, saldo decreciente…)**, periodicidad, **períodos de gracia y moratoria**, tipos de amortización, **regla de asignación del pago entre capital, interés, comisiones y penalidades**. Ciclo de vida completo: **solicitar → aprobar → rechazar → retirar → desembolsar** (incluso en tramos), pagar, **reprogramar, refinanciar, castigar (write-off) y cerrar**. **Garantías (collateral) y garantes (guarantors)** con bloqueo y liberación automática de fondos del garante. **Delinquency buckets** (mora por edades) con penalidades automáticas y alertas |
| **Sifone / Trébol** (sector solidario colombiano) | Core financiero + portal transaccional + **firma electrónica de pagarés y libranzas desde el celular** + módulo SARLAFT |
| **SICOOPWEB, Heinsohn Crédito y Libranza, LINIX** | Generación automática de **pagarés, libranzas, cheques y recibos**; configuración de periodicidades y tipos de amortización; **trazabilidad de la solicitud** |
| **SACCOs (Kenia)** | **Multiplicador de cupo: 2 a 5 veces los ahorros del socio**; garantía obligatoria (autogarantía, garantes o colateral); **appraisal de la solicitud** con evaluación de capacidad de pago; comisión de estudio (~1 %) descontada al desembolso; descuento por nómina |

### E. Reglamentos de natilleras reales (la especificación implícita del usuario)

Reglas recurrentes en reglamentos publicados por natilleras colombianas:

| Regla observada | ¿La soportamos? |
|-----------------|-----------------|
| "Se presta solo hasta el tope máximo ahorrado" / "hasta el 50 % de lo ahorrado" | ❌ No |
| "Si necesita más, requiere un socio codeudor; el monto se limita al ahorro del codeudor" | ❌ No |
| Interés del 4 %, 5 % o 10 % mensual, **anticipado** | ✅ Sí (anticipado y normal, tasa configurable) |
| Interés diferenciado para no socios con codeudor (p. ej. 20 %) | ❌ No (solo prestamos a socios activos) |
| "Para solicitar el préstamo debe ser con 8 días de anticipación" | ❌ No hay solicitud |
| "A partir del 15 de octubre no se realizan préstamos" | ❌ No hay ventana de corte |
| "Los préstamos deben estar cancelados máximo el 15 de noviembre / 30 de noviembre" | ❌ No hay control de cierre |
| Multa por día de retraso (p. ej. $1.000/día) | 🟡 Parcial: tenemos mora por tasa mensual proporcional a días, no multa fija diaria |
| Al retiro o liquidación, lo pendiente **se descuenta de lo ahorrado** | ❌ No |
| Los intereses de préstamos se reparten entre los socios en diciembre | ✅ Sí (utilidades clasificadas) |

---

## 4. Nuestra línea base verificada en código

Lo siguiente está **verificado leyendo el código**, no inferido de documentación.

| Capacidad | Estado | Evidencia |
|-----------|:------:|-----------|
| Interés simple (flat) y compuesto, mensual o quincenal (tasa/2) | 🟢 | `Prestamos.vue` §generación de plan (~7000-7150) |
| Interés **anticipado** (retenido al desembolso) vs. normal (causado al pagar) | 🟢 | `interes_anticipado` en el insert (`Prestamos.vue:7731`) |
| Validación `tasa × cuotas < 100 %` para anticipado | 🟢 | Bloqueo con aviso |
| Plan de pagos generado y persistido (`plan_pagos_prestamo`) con fecha, capital, interés, saldo y período | 🟢 | `fechaProyectadaMensual` (:3893), `periodoDesdeFechaProyectada` (:3876) |
| Fecha mensual con ajuste a último día del mes | 🟢 | `Prestamos.vue:3900` |
| **Mora proporcional por días, solo sobre capital pendiente, base 30 días, sin anatocismo** | 🟢 | `calcularMoraCuota` (:5245); `tasa_mora` en `natilleraPrestamos.js` |
| Reparto de un abono entre mora y capital+interés, cuota por cuota | 🟢 | `desglosarAbonoConMora` (:5279) |
| Mora cobrada registrada como rubro separado del fondo (`subtipo='mora'`) | 🟢 | `registrarMoraCobradaEnFondo` |
| **Cobro conjunto cuota de ahorro + cuotas de préstamo** con orden sanción → actividades → préstamo → cuota | 🟢 | Integración con módulo Cuotas |
| Acumulación de cuotas de préstamo vencidas en el período siguiente | 🟢 | Regla período proyectado ≤ período actual |
| Refinanciación sobre saldo con regeneración de plan | 🟢 | `formRefinanciar`, modal de refinanciar |
| Editar y eliminar abonos con recálculo completo | 🟢 | `Prestamos.vue:8236` |
| Validación de fondo disponible **por medio de entrega** (efectivo / transferencia) | 🟢 | Validación al crear |
| Comprobantes como imagen + WhatsApp (creación, abono, reenvío) | 🟢 | `modalCompartirPrestamo*`, `comprobanteAbono` |
| Auditoría de operaciones | 🟢 | `useAuditoria` |
| Borrador de trabajo recuperable (sessionStorage, 48 h) | 🟢 | `tryRestorePrestamosWorkDraft` (:4402) |
| Permisos por rol (admin/editor vs visor) | 🟢 | RLS `007_prestamos_rls_insert_policy.sql` |
| Estados del préstamo | 🟡 | **Solo `activo` y `pagado`**. El estado `pendiente` existe en la tabla pero **no se usa en la UI** (`Especificaciones/portal-socio/especificacion.md:79`) |
| Solicitud / aprobación / rechazo | 🔴 | No existe |
| Codeudor, garante o garantía | 🔴 | No existe |
| Cupo máximo según ahorro del socio | 🔴 | Solo mínimo $10.000 y fondo disponible |
| Interés sobre saldo decreciente / préstamo de solo interés | 🔴 | No existe |
| Prepago con descuento de interés no causado | 🔴 | No existe |
| Recordatorios automáticos de vencimiento | 🔴 | Sin referencias a push/notificación en el módulo |
| Exportación Excel / CSV / PDF de cartera | 🔴 | Sin referencias a export en el módulo |
| Castigo de cartera (write-off) / condonación | 🔴 | Solo eliminación destructiva en cascada |
| Cierre de ciclo con préstamos vigentes | 🔴 | No existe |
| Contrato o pagaré firmable | 🔴 | Solo comprobante en imagen |

---

## 5. Matriz comparativa

Leyenda: ✅ completo · 🟡 parcial · ❌ ausente · — no aplica al modelo

| Capacidad | **Natillerapp** | MiAhorro | Natillera.com.co | Chamasoft | Savinco | DreamSave | CobrApp | Fineract |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Solicitud del préstamo por el socio | ❌ | ✅ | 🟡 | ✅ | ✅ | 🟡 | — | ✅ |
| Flujo de aprobación / rechazo | ❌ | 🟡 | ❌ | ✅ | ✅ | 🟡 | — | ✅ |
| Garante / codeudor | ❌ | ❌ | ❌ | ✅ | 🟡 | 🟡 | ❌ | ✅ |
| Cupo atado al ahorro del socio | ❌ | ❌ | ❌ | 🟡 | ✅ | ✅ | ❌ | 🟡 |
| Interés flat | ✅ | 🟡 | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Interés sobre saldo decreciente | ❌ | ❓ | ❓ | 🟡 | 🟡 | 🟡 | ✅ | ✅ |
| **Interés anticipado (retenido)** | ✅ | ❓ | ❓ | ❌ | ❌ | ❌ | 🟡 | 🟡 |
| Plan de pagos persistido y consultable | ✅ | 🟡 | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mora proporcional por días sin anatocismo** | ✅ | ❓ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| **Cobro integrado con la cuota de ahorro** | ✅ | ❌ | ❌ | ❌ | ❌ | 🟡 | — | ❌ |
| Refinanciación / reprogramación | ✅ | ❌ | ❌ | ❌ | ❌ | 🟡 | 🟡 | ✅ |
| Prepago con descuento de interés | ❌ | ❓ | ❓ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Castigo de cartera (write-off) | ❌ | ❌ | ❌ | 🟡 | 🟡 | ✅ | 🟡 | ✅ |
| Recordatorios automáticos | ❌ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ |
| Comprobante compartible | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ✅ | 🟡 |
| Contrato / pagaré PDF | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exportación Excel / CSV | ❌ | 🟡 | 🟡 | ✅ | 🟡 | ✅ | ✅ | ✅ |
| Mora por edades / indicadores de cartera | 🟡 | ❌ | ❌ | 🟡 | 🟡 | 🟡 | ✅ | ✅ |
| Trazabilidad efectivo vs. transferencia | ✅ | ❌ | ❌ | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| Portal del socio con sus préstamos | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cierre de ciclo con préstamos vigentes | ❌ | ❌ | ❌ | ❌ | 🟡 | ✅ | — | — |
| Funcionamiento offline | 🟡 | ❌ | ❌ | 🟡 | 🟡 | ✅ | ✅ | — |
| Validación contra tasa de usura | ❌ | ❌ | ❌ | — | — | — | ❌ | 🟡 |

❓ = no publicado / no verificable.

---

## 6. Qué hacemos mejor

Cinco ventajas reales, todas verificadas en código y **ninguna presente en la competencia directa**:

1. **Cobro integrado préstamo + cuota de ahorro, con orden de prioridad explícito** (sanción → actividades → préstamo → cuota). Es la operación real de una natillera: el socio paga *una sola vez* al mes. Los competidores tratan ahorro y préstamo como módulos separados. **Esta es la ventaja más defendible del producto.**
2. **Interés anticipado como ciudadano de primera clase**, con validación `tasa × cuotas < 100 %` y reconocimiento inmediato de la utilidad. Es la modalidad dominante en los reglamentos colombianos reales (4 %–5 % mensual anticipado) y los cores internacionales no la modelan de forma nativa.
3. **Mora sin anatocismo, proporcional a días y solo sobre capital.** Es más correcta jurídica y contablemente que la multa fija diaria de los reglamentos de papel y que el recargo plano de las apps de cobranza. Además se registra como rubro separado del fondo, sin capitalizar el saldo.
4. **Trazabilidad efectivo/transferencia extremo a extremo**, incluida la validación de fondo disponible *por medio de entrega* antes de desembolsar. Ningún competidor del nicho valida que haya efectivo real en caja antes de prestar.
5. **Refinanciación real sobre saldo** con regeneración de plan y conservación del interés original para no doble-contar utilidades. En el nicho natillera, esto simplemente no existe.

Súmese: auditoría de operaciones, RLS por rol, borrador recuperable a 48 h y comprobantes por WhatsApp en tres momentos del ciclo.

---

## 7. Qué nos falta

### 7.1 Brechas críticas (bloquean paridad competitiva)

| # | Brecha | Quién lo tiene | Por qué importa |
|---|--------|----------------|-----------------|
| B-01 | **Solicitud de préstamo por el socio + aprobación/rechazo** | MiAhorro, Chamasoft, Savinco, Fineract | Es la primera funcionalidad que el socio ve. El estado `pendiente` ya existe en la tabla: la brecha es de UI y flujo, no de modelo |
| B-02 | **Cupo máximo atado al ahorro del socio** (tope = ahorro, % del ahorro, o multiplicador) | Savinco, DreamSave, SACCOs; **y todos los reglamentos reales** | Hoy el sistema deja prestar cualquier monto mientras haya fondo. Es la regla nº 1 de cualquier reglamento de natillera |
| B-03 | **Codeudor / garante** con afectación del cupo del garante | Chamasoft, Fineract, SACCOs; **y todos los reglamentos reales** | Sin esto no se puede modelar el préstamo por encima del ahorro, ni el préstamo a no socios |
| B-04 | **Recordatorios automáticos de vencimiento** (push / WhatsApp) | Natillera.com.co, MiAhorro, Chamasoft, CobrApp, Jasicash | La infraestructura push ya existe en el proyecto (`usePush.js`, `sw.js`) y no se usa en préstamos. Máximo impacto por mínimo costo |
| B-05 | **Modo "interés sobre saldo" y "solo interés"** | CobrApp (3 modos), Fineract, cores solidarios | Muchas natilleras cobran 5 % mensual sobre el saldo y reciben abonos libres a capital. Hoy no lo podemos modelar: forzamos cuotas iguales sobre interés flat |
| B-06 | **Prepago con descuento del interés no causado** | CobrApp, Fineract | Riesgo legal y de confianza: hoy quien paga antes paga el interés completo del plazo (ver §8) |
| B-07 | **Cierre de ciclo con préstamos vigentes** | Nadie lo resuelve bien (DreamSave y SavingsGroups.app se acercan) | Los reglamentos exigen préstamos cancelados antes del cierre y descuento del saldo contra la liquidación del socio. Es **oportunidad de diferenciación**, no solo brecha |

### 7.2 Brechas importantes (nos ponen por debajo del estándar de 2026)

| # | Brecha | Quién lo tiene |
|---|--------|----------------|
| B-08 | Exportación de cartera a Excel / CSV / PDF | CobrApp, Chamasoft, DreamSave, todos los cores |
| B-09 | Indicadores de cartera: mora por edades, % cartera vencida, proyección de flujo, capital en la calle | CobrApp (dashboard), Fineract (delinquency buckets) |
| B-10 | Castigo de cartera (write-off) y condonación, sin borrado destructivo | DreamSave, Fineract |
| B-11 | Ventana de corte para otorgar préstamos ("no se presta después del 15 de octubre") y fecha límite de cancelación | Reglamentos reales; ningún software lo tiene |
| B-12 | Contrato / pagaré en PDF, con firma del socio | Jasicash (PDF), Sifone (firma electrónica de pagarés) |
| B-13 | Portal del socio con sus préstamos y plan de pagos completo | MiAhorro, Natillera.com.co, Chamasoft, Savinco (nuestra fase 2 ya especificada) |
| B-14 | Multa fija por día de retraso, como alternativa configurable a la mora por tasa | Reglamentos reales; Chamasoft (multas por categoría) |
| B-15 | Simulador de préstamo antes de solicitarlo | SACCO calculators, cores |

### 7.3 Brechas opcionales / estratégicas

| # | Brecha | Comentario |
|---|--------|------------|
| B-16 | Integración de pagos digitales (Nequi, Daviplata, link de pago) | SavingsGroups.app ya integra pagos digitales para reducir el manejo de efectivo. Cambia el modelo de negocio; decisión de producto, no técnica |
| B-17 | Historial de comportamiento de pago del socio (scoring interno) | Insumo natural para el flujo de aprobación (B-01). Nadie en el nicho lo tiene |
| B-18 | Funcionamiento offline real | DreamSave y SavingsGroups.app lo tienen como bandera. Somos PWA; hay que verificar hasta dónde llega el service worker |
| B-19 | Período de gracia y desembolso en tramos | Fineract. **Fuera de alcance** para natilleras: no lo recomiendo |
| B-20 | Rutas de cobro con GPS | CobrApp, Jasicash. **Fuera de alcance**: es cobranza profesional, no natillera |

---

## 8. Riesgos normativos (Colombia)

No es asesoría legal; es señalización de riesgo con impacto en el diseño del módulo.

| Riesgo | Detalle | Implicación de producto |
|--------|---------|-------------------------|
| **Tasa de usura** | La Superintendencia Financiera certifica periódicamente el interés bancario corriente; el límite de usura es 1,5 veces esa tasa, y para 2026 se sitúa en el orden del 29 % E.A. para consumo y ordinario (con modalidades diferenciadas más altas para bajo monto y crédito popular productivo). Superarla es delito (art. 305 C.P., 2 a 5 años). **Los límites aplican también a préstamos entre particulares.** | Una natillera al **5 % mensual ≈ 79,6 % E.A.** y al **10 % mensual ≈ 213 % E.A.**. El sistema hoy no advierte nada. Recomendación: **calcular y mostrar la tasa efectiva anual equivalente** al configurar la natillera y al crear el préstamo, con aviso cuando supere el umbral vigente. Es diferenciador de cumplimiento y protege al administrador |
| **Prepago** | El derecho a pagar anticipadamente sin penalización está reconocido para créditos de bajo monto (Ley 1555 de 2012) | Refuerza B-06: el modelo flat sin recálculo puede leerse como penalización implícita |
| **Interés moratorio** | Tope legal de 1,5 veces el interés bancario corriente | Nuestra `tasa_mora` es libre y sin tope. Debería validarse |
| **Habeas data** | Ley 1266/2008 | Si en algún momento se reporta comportamiento de pago fuera del grupo, aplica. Hoy no aplica; anotarlo antes de construir B-17 |
| **Captación masiva y habitual** | Riesgo estructural del modelo natillera, no de nuestra app | Reforzar el posicionamiento de "herramienta contable que no maneja dinero", como ya hace explícitamente Natillera.com.co |

---

## 9. Requisitos propuestos (insumo para `especificacion.md`)

IDs provisionales; se consolidan al escribir la especificación formal. Todos nacen en 🔴.

| ID | Requisito | Brecha | Prioridad | Esfuerzo |
|----|-----------|--------|-----------|----------|
| RF-P01 | El socio puede **solicitar** un préstamo desde el portal (monto, plazo, destino); queda en estado `pendiente` | B-01 | Must | M |
| RF-P02 | El administrador puede **aprobar, rechazar o devolver** una solicitud, con motivo, y solo al aprobar se genera el plan y se afecta el fondo | B-01 | Must | M |
| RF-P03 | La natillera configura el **cupo máximo por socio**: sin tope, = ahorro acumulado, % del ahorro, o multiplicador N× | B-02 | Must | S |
| RF-P04 | Al crear/aprobar, el sistema **valida el cupo** y muestra ahorro acumulado, cupo disponible y monto solicitado | B-02 | Must | S |
| RF-P05 | Un préstamo puede tener uno o más **codeudores socios**; el monto respaldado **descuenta cupo** al codeudor mientras el préstamo esté vigente | B-03 | Must | L |
| RF-P06 | **Recordatorio automático** al socio N días antes del vencimiento de cada cuota y al entrar en mora (push, con fallback a WhatsApp manual) | B-04 | Must | M |
| RF-P07 | Nueva **modalidad de interés "sobre saldo"**: la cuota liquida interés sobre el saldo insoluto; el capital se abona libremente | B-05 | Must | L |
| RF-P08 | Nueva **modalidad "solo interés"**: cuotas periódicas de interés y capital exigible al final o por abonos libres | B-05 | Should | M |
| RF-P09 | **Abono extraordinario a capital** con recálculo del plan y opción de *reducir cuota* o *reducir plazo* | B-06 | Must | L |
| RF-P10 | En prepago total con interés flat, **descontar el interés no causado** de las cuotas futuras y ajustar la utilidad ya registrada | B-06 | Must | L |
| RF-P11 | **Cierre de ciclo**: reporte de préstamos vigentes, bloqueo configurable del cierre y **descuento del saldo contra la liquidación del socio** | B-07 | Must | L |
| RF-P12 | **Exportar** cartera y plan de pagos a Excel/CSV y el detalle del préstamo a PDF | B-08 | Should | S |
| RF-P13 | **Panel de cartera**: capital colocado, mora por edades (1-30 / 31-60 / 61-90 / +90), % cartera vencida, recaudo proyectado del mes | B-09 | Should | M |
| RF-P14 | **Castigar** un préstamo incobrable (estado `castigado`) y **condonar** saldo o mora, con motivo y auditoría, sin borrado en cascada | B-10 | Should | M |
| RF-P15 | **Ventana de otorgamiento**: fecha desde/hasta configurable para crear préstamos y fecha límite de cancelación antes del cierre | B-11 | Should | S |
| RF-P16 | **Documento del préstamo en PDF** (pagaré/acuerdo) con datos del socio, codeudores, plan de pagos y aceptación registrada | B-12 | Could | M |
| RF-P17 | El portal del socio muestra **préstamos activos, plan de pagos, próxima cuota, mora y comprobantes** | B-13 | Must | M |
| RF-P18 | La mora admite **modalidad alterna de multa fija por día** de retraso, configurable por natillera | B-14 | Should | S |
| RF-P19 | **Simulador** de préstamo accesible a socio y administrador antes de solicitar | B-15 | Could | S |
| RF-P20 | Mostrar la **tasa efectiva anual equivalente** y advertir si la tasa pactada o de mora supera el límite legal vigente | §8 | Should | S |
| RF-P21 | **Historial de comportamiento** del socio (puntualidad, mora acumulada, préstamos cerrados) visible al aprobar | B-17 | Could | M |

---

## 10. Roadmap sugerido

**Ola 1 — Paridad y confianza (lo que el usuario ya espera)**
RF-P06 (recordatorios) · RF-P03 + RF-P04 (cupo) · RF-P12 (exportar) · RF-P20 (tasa efectiva) · RF-P15 (ventana)
→ Todo esfuerzo S/M, sin cambios estructurales de modelo. Cierra las brechas más visibles.

**Ola 2 — Ciclo de vida del préstamo**
RF-P01 + RF-P02 (solicitud y aprobación) · RF-P17 (portal del socio) · RF-P05 (codeudor) · RF-P14 (castigo/condonación) · RF-P13 (panel de cartera)
→ Requiere el estado `pendiente` en la UI, nuevas tablas de solicitud y codeudores, y RLS.

**Ola 3 — Motor financiero y cierre**
RF-P07 + RF-P08 (interés sobre saldo y solo interés) · RF-P09 + RF-P10 (abono extraordinario y prepago) · RF-P11 (cierre de ciclo) · RF-P16 · RF-P18 · RF-P19 · RF-P21
→ Toca el corazón del cálculo. Exige plan de pruebas de regresión completo sobre la integración con Cuotas.

---

## 11. Preguntas abiertas

1. **¿La natillera es prestamista solo de socios?** Los reglamentos contemplan préstamos a **no socios** con codeudor socio y tasa mayor. ¿Entra en alcance?
2. **¿Cuál es la modalidad de interés dominante en nuestros usuarios reales**: cuota fija sobre interés flat (lo que tenemos) o interés mensual sobre saldo con abono libre (B-05)? La respuesta define si RF-P07 es Ola 1 o Ola 3.
3. **¿Queremos que el sistema bloquee** un préstamo que exceda el cupo, o que solo advierta y exija justificación del administrador?
4. **En el cierre anual, ¿el saldo del préstamo se descuenta de la liquidación** del socio automáticamente, o se genera un acuerdo de pago que sobrevive al ciclo?
5. **¿Advertimos sobre la tasa de usura o solo informamos** la tasa efectiva anual? Advertir protege al administrador pero puede leerse como fricción.

---

## 12. Fuentes

**Competencia directa (Colombia)**
- [Natillera MiAhorro](https://www.natilleramiahorro.com/)
- [Natillera.com.co](https://natillera.com.co/)
- [Natillera.app](https://natillera.app/)
- [Natillera Familiar (APK)](https://apkcombo.com/natillera-familiar/com.netixcloud.manuel.mysecondapplication/)

**Grupos de ahorro (internacional)**
- [Chamasoft — Features](https://chamasoft.com/features/) · [Blog: Chama Management Systems](https://blog.chamasoft.com/chama-management-systems/)
- [Savinco — Our project](https://savinco.org/our-project) · [Savinco App](https://app.savinco.org/)
- [DreamStart Labs — DreamSave](https://www.dreamstartlabs.com/solutions/dreamsave/)
- [Savings Groups App — Grupos](https://www.savingsgroups.app/grupos/)

**Software de préstamos y cartera (LATAM)**
- [CobrApp (MWM)](https://mwm.ai/es/apps/loan-manager-cobrapp/1620770032)
- [Jasicash](https://www.jasicash.com/)
- [Prestabit (App Store)](https://apps.apple.com/mx/app/prestabit/id1671026232) · [CrediManager (App Store)](https://apps.apple.com/mx/app/credimanager/id6502468619)

**Core financiero y microfinanzas**
- [Apache Fineract — Loan Product](https://cwiki.apache.org/confluence/display/FINERACT/Loan+Product) · [Loan Management (Finecko docs)](https://finecko.com/docs/fineract/features/loans.html) · [Collateral & Guarantors](https://finecko.com/docs/guides/collateral-guarantors.html)
- [Sifone Company](https://www.sifonecompany.com/site/) · [Heinsohn Crédito y Libranza](https://www.catalogodesoftware.com/p/software-cooperativas-ahorro-credito-fondos-empleados/heinsohn-credito-libranza-heinsohn-business-technology-1) · [SICOOPWEB](https://www.guiadesolucionestic.com/soluciones-verticales/sector-solidario-/cooperativas-fondos-de-empleados/947-sicoopweb)
- [Understanding SACCO lending criteria in Kenya](https://saccotrend.co.ke/understanding-sacco-lending-criteria-in-kenya/) · [SACCO Loan Calculator — multiplier](https://pesacalc.co.ke/calculators/sacco-loan)

**Reglamentos de natilleras reales**
- [Natillera Prosperamos — Reglamento](http://natilleraprosperamos.blogspot.com/2015/06/reglamento-natillera-prosperamos.html)
- [Natillera La Bonita — Reglamento 2016](http://natilleralabonita.blogspot.com/2016/02/reglamento.html)
- [Natillera 2012 — Reglamento](http://natillera2012.blogspot.com/2012/02/reglamento-natillera-2012.html)
- [Natillera AV — Reglamento](https://alexandervj3103.wixsite.com/natilleraav2017/reglamento)
- [Parámetros Natillera 2019](https://natillera2019.blogspot.com/2018/12/parametrosde-la-natillera-de-semanas-50.html)

**Normativa Colombia**
- [Tasa de usura — Portafolio](https://www.portafolio.co/economia/finanzas/superfinanciera-fijo-la-tasa-de-usura-en-29-66-estas-son-las-deudas-que-mas-se-encarecen-499499) · [Noticias RCN](https://www.noticiasrcn.com/economia/tasa-usura-julio-2026-intereses-1035858)
- [Interés moratorio en Colombia — Finmercado](https://www.finmercado.co/blogs/interes-moratorio-en-colombia) · [Intereses lícitos — Gerencie.com](https://www.gerencie.com/que-interes-es-licito-cobrar-a-los-deudores.html)
- [ABC de las libranzas — Supersolidaria](https://supersolidaria.gov.co/sites/default/files/public/noticias/abc_libranzas.pdf)
