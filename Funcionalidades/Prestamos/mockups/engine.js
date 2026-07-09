/* ============================================================================
 * Natillerapp — Motor de Préstamos (mockup 100% funcional)
 * Fuente de verdad única para AMBAS variantes de UI.
 * Implementa fielmente prestamos-funcional.md (secciones 1-15).
 *
 * Expone: window.PE  (Prestamos Engine)
 * ==========================================================================*/
(function () {
  'use strict';

  // "Hoy" fijo y determinista para que los estados (vencida/en mora) sean
  // reproducibles en el mockup (fecha del documento: 2026-07-07).
  const HOY = new Date(2026, 6, 7);

  // --------------------------------------------------------------------------
  // Formato / utilidades
  // --------------------------------------------------------------------------
  const nfCOP = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

  function fmt(n) { return '$' + nfCOP.format(Math.round(n || 0)); }
  function fmtNum(n) { return nfCOP.format(Math.round(n || 0)); }
  function pct(n) { return (Math.round(n * 100) / 100).toString().replace('.', ',') + '%'; }

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MESES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  function fmtFecha(d) {
    const x = toDate(d);
    return `${String(x.getDate()).padStart(2, '0')} ${MESES[x.getMonth()]} ${x.getFullYear()}`;
  }
  function toDate(d) { return d instanceof Date ? d : new Date(d); }
  function isoDate(d) {
    const x = toDate(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  }

  // Suma meses conservando el día; si el mes destino no tiene ese día, usa el
  // último día del mes (regla del plan de pagos mensual).
  function addMonthsClamp(date, months) {
    const d = toDate(date);
    const day = d.getDate();
    const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));
    return target;
  }
  function addDays(date, days) {
    const d = toDate(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  }

  // Período que "casa" con las cuotas de la natillera.
  // Mensual: {anio, mes, quincena:0}. Quincenal: {anio, mes, quincena:1|2}.
  function periodoDeFecha(fecha, periodicidad) {
    const d = toDate(fecha);
    if (periodicidad === 'quincenal') {
      return { anio: d.getFullYear(), mes: d.getMonth(), quincena: d.getDate() <= 15 ? 1 : 2 };
    }
    return { anio: d.getFullYear(), mes: d.getMonth(), quincena: 0 };
  }
  // Clave ordenable del período (para comparar <=).
  function periodoKey(p) { return p.anio * 100 + p.mes * 10 + (p.quincena || 0); }
  function periodoLabel(p) {
    const base = `${MESES_LARGO[p.mes]} ${p.anio}`;
    if (p.quincena) return `${base} · Q${p.quincena}`;
    return base;
  }

  // --------------------------------------------------------------------------
  // 3.1 Cálculo del interés
  // --------------------------------------------------------------------------
  // tasaPct = tasa mensual en %. En quincenal se divide entre 2 por período.
  function tasaPeriodo(tasaPct, periodicidad) {
    const t = (tasaPct || 0) / 100;
    return periodicidad === 'quincenal' ? t / 2 : t;
  }

  function calcularInteresTotal({ capital, tasaPct, tipo, nCuotas, periodicidad }) {
    const t = tasaPeriodo(tasaPct, periodicidad);
    if (tipo === 'compuesto') {
      return capital * Math.pow(1 + t, nCuotas) - capital;
    }
    // simple
    return capital * t * nCuotas;
  }

  // --------------------------------------------------------------------------
  // 4. Plan de pagos
  // --------------------------------------------------------------------------
  // Devuelve array de cuotas proyectadas con desglose capital/interés y saldo.
  function generarPlan({ capital, tasaPct, tipo, modalidad, nCuotas, periodicidad, fechaPrimeraCuota }) {
    const interesTotal = calcularInteresTotal({ capital, tasaPct, tipo, nCuotas, periodicidad });
    const total = capital + interesTotal;
    const valorCuota = total / nCuotas;

    // Desglose interés por cuota:
    //  - anticipado: distribución equitativa.
    //  - normal: interés decreciente (mayor al inicio, "sobre saldo restante"),
    //    con pesos w_i = (n - i + 1) que suman exactamente interesTotal.
    let pesos = [];
    if (modalidad === 'normal') {
      for (let i = 0; i < nCuotas; i++) pesos.push(nCuotas - i);
    } else {
      for (let i = 0; i < nCuotas; i++) pesos.push(1);
    }
    const sumaPesos = pesos.reduce((a, b) => a + b, 0);

    const totalR = Math.round(total);
    const interesTotalR = Math.round(interesTotal);
    const plan = [];
    let valorAcum = 0, intAcum = 0;
    for (let i = 0; i < nCuotas; i++) {
      const esUltima = i === nCuotas - 1;
      const fecha = periodicidad === 'quincenal'
        ? addDays(fechaPrimeraCuota, 15 * i)
        : addMonthsClamp(fechaPrimeraCuota, i);

      // Valor de la cuota: iguales; la última absorbe el redondeo para cuadrar exacto.
      const valor = esUltima ? (totalR - valorAcum) : Math.round(valorCuota);
      // Interés por cuota según pesos; la última cuadra con el interés total.
      const interesCuota = esUltima ? (interesTotalR - intAcum) : Math.round(interesTotal * pesos[i] / sumaPesos);
      const capitalCuota = valor - interesCuota;

      valorAcum += valor;
      intAcum += interesCuota;
      const saldo = totalR - valorAcum;

      plan.push({
        n: i + 1,
        fecha: isoDate(fecha),
        periodo: periodoDeFecha(fecha, periodicidad),
        valor,
        capital: capitalCuota,
        interes: interesCuota,
        saldoProyectado: Math.max(0, saldo),
        abonado: 0,
      });
    }
    return { plan, interesTotal: Math.round(interesTotal), total: Math.round(total), valorCuota: Math.round(valorCuota) };
  }

  // --------------------------------------------------------------------------
  // Estado de una cuota del plan
  // --------------------------------------------------------------------------
  function estadoCuota(cuota) {
    if (cuota.abonado >= cuota.valor) return 'pagada';
    if (cuota.abonado > 0) return 'parcial';
    if (toDate(cuota.fecha) < HOY) return 'vencida';
    return 'pendiente';
  }

  // --------------------------------------------------------------------------
  // 3.2 / 3.3 Validaciones al crear
  // --------------------------------------------------------------------------
  const MONTO_MINIMO = 10000;

  function desembolso({ capital, interesTotal, modalidad }) {
    // Lo que efectivamente sale del fondo.
    return modalidad === 'anticipado' ? capital - interesTotal : capital;
  }

  function validarPrestamo(datos, fondoDisponible) {
    // fondoDisponible = { efectivo, transferencia }
    const errores = [];
    const { capital, tasaPct, tipo, modalidad, nCuotas, periodicidad, medioEntrega, plazoMaximo } = datos;
    const interesTotal = calcularInteresTotal({ capital, tasaPct, tipo, nCuotas, periodicidad });

    if (!capital || capital < MONTO_MINIMO) {
      errores.push({ campo: 'capital', msg: `El monto mínimo es ${fmt(MONTO_MINIMO)}.` });
    }
    if (!nCuotas || nCuotas < 1 || nCuotas > plazoMaximo) {
      errores.push({ campo: 'nCuotas', msg: `El plazo debe estar entre 1 y ${plazoMaximo} cuotas.` });
    }
    if (modalidad === 'anticipado') {
      const factor = tasaPeriodo(tasaPct, periodicidad) * nCuotas; // tasa × cuotas
      if (factor >= 1) {
        errores.push({ campo: 'anticipado', msg: `Interés anticipado inválido: tasa × cuotas = ${pct(factor * 100)} (debe ser < 100 %).` });
      }
    }
    const sale = desembolso({ capital, interesTotal, modalidad });
    const disp = medioEntrega === 'efectivo' ? fondoDisponible.efectivo : fondoDisponible.transferencia;
    if (sale > disp) {
      errores.push({
        campo: 'fondo',
        msg: `Fondo insuficiente en ${medioEntrega}: disponible ${fmt(disp)}, a desembolsar ${fmt(sale)}.`,
      });
    }
    return errores;
  }

  // --------------------------------------------------------------------------
  // 5. Registrar abono — distribución sobre cuotas del plan
  // --------------------------------------------------------------------------
  // Aplica `monto` de la más antigua a la más nueva. Devuelve detalle.
  function aplicarAbono(prestamo, monto, opts = {}) {
    let restante = monto;
    const cuotasTocadas = [];
    for (const c of prestamo.plan) {
      if (restante <= 0) break;
      const pendienteCuota = c.valor - c.abonado;
      if (pendienteCuota <= 0) continue;
      const aplica = Math.min(restante, pendienteCuota);
      c.abonado += aplica;
      restante -= aplica;
      cuotasTocadas.push({ n: c.n, aplicado: aplica, estado: estadoCuota(c) });
    }
    const saldoAnterior = prestamo.saldoActual;
    prestamo.saldoActual = Math.max(0, prestamo.saldoActual - monto);
    if (prestamo.saldoActual <= 0) prestamo.estado = 'pagado';

    // Recalcular saldos proyectados de cuotas pendientes.
    recalcularSaldos(prestamo);

    const abono = {
      id: 'ab_' + Math.random().toString(36).slice(2, 8),
      fecha: opts.fecha || isoDate(HOY),
      monto,
      formaPago: opts.formaPago || 'efectivo',
      cuotas: cuotasTocadas.map((c) => c.n),
      saldoAnterior,
      saldoNuevo: prestamo.saldoActual,
    };
    prestamo.abonos = prestamo.abonos || [];
    prestamo.abonos.push(abono);
    return abono;
  }

  function recalcularSaldos(prestamo) {
    // Saldo proyectado tras cada cuota, contando lo ya abonado global.
    let acumPagado = prestamo.plan.reduce((s, c) => s + c.abonado, 0);
    // Saldo restante = total - pagado; se distribuye por cuotas futuras.
    let restanteTotal = prestamo.total - acumPagado;
    let running = restanteTotal;
    for (const c of prestamo.plan) {
      const pend = Math.max(0, c.valor - c.abonado);
      running -= pend;
      c.saldoProyectado = Math.max(0, running);
    }
  }

  // --------------------------------------------------------------------------
  // Resumen / estado global del préstamo (sección 8)
  // --------------------------------------------------------------------------
  function resumenPrestamo(p) {
    const cuotasPagadas = p.plan.filter((c) => estadoCuota(c) === 'pagada').length;
    const cuotasRestantes = p.plan.length - cuotasPagadas;
    const cuotasVencidas = p.plan.filter((c) => estadoCuota(c) === 'vencida' || (estadoCuota(c) === 'parcial' && toDate(c.fecha) < HOY)).length;
    const abonadoTotal = p.plan.reduce((s, c) => s + c.abonado, 0);
    let estadoGlobal;
    if (p.estado === 'pagado') estadoGlobal = 'pagado';
    else if (cuotasVencidas > 0) estadoGlobal = 'mora';
    else estadoGlobal = 'aldia';
    return { cuotasPagadas, cuotasRestantes, cuotasVencidas, abonadoTotal, estadoGlobal };
  }

  // --------------------------------------------------------------------------
  // 6. Integración con Cuotas
  // --------------------------------------------------------------------------
  // Dado un socio y un período natillera, devuelve las cuotas de préstamo
  // "programadas" (periodo proyectado <= período actual) no pagadas.
  function cuotasPrestamoParaPeriodo(prestamosSocio, periodoActual) {
    const keyActual = periodoKey(periodoActual);
    const items = [];
    for (const p of prestamosSocio) {
      if (p.estado !== 'activo') continue;
      for (const c of p.plan) {
        if (estadoCuota(c) === 'pagada') continue;
        if (periodoKey(c.periodo) <= keyActual) {
          items.push({
            prestamoId: p.id,
            n: c.n,
            periodo: c.periodo,
            valor: c.valor,
            abonado: c.abonado,
            pendiente: c.valor - c.abonado,
            vencida: toDate(c.fecha) < HOY,
          });
        }
      }
    }
    return items;
  }

  // 6.2 Orden de aplicación del pago en Cuotas.
  // Devuelve el reparto del `montoRecibido` por prioridad.
  function aplicarPagoCuotas({ montoRecibido, sancion, actividades, cuotasPrestamoSel, cuotaNatillera }) {
    let restante = montoRecibido;
    const reparto = { sancion: 0, actividades: 0, prestamo: 0, cuota: 0, detallePrestamo: [] };

    // 1. Sanción
    reparto.sancion = Math.min(restante, sancion || 0);
    restante -= reparto.sancion;
    // 2. Actividades
    reparto.actividades = Math.min(restante, actividades || 0);
    restante -= reparto.actividades;
    // 3. Cuotas de préstamo seleccionadas (en orden)
    for (const c of cuotasPrestamoSel) {
      if (restante <= 0) break;
      const aplica = Math.min(restante, c.pendiente);
      if (aplica > 0) {
        reparto.detallePrestamo.push({ prestamoId: c.prestamoId, n: c.n, aplicado: aplica });
        reparto.prestamo += aplica;
        restante -= aplica;
      }
    }
    // 4. Cuota natillera con lo que reste
    reparto.cuota = Math.min(restante, cuotaNatillera || 0);
    restante -= reparto.cuota;
    reparto.sobrante = restante;
    return reparto;
  }

  // --------------------------------------------------------------------------
  // 7. Refinanciar
  // --------------------------------------------------------------------------
  function refinanciar(prestamo, { fechaPrimeraCuota, nCuotas, tasaPct, tipo }) {
    const saldo = prestamo.saldoActual;
    const gen = generarPlan({
      capital: saldo, tasaPct, tipo, modalidad: prestamo.modalidad,
      nCuotas, periodicidad: prestamo.periodicidad, fechaPrimeraCuota,
    });
    prestamo.refinanciaciones = prestamo.refinanciaciones || [];
    prestamo.refinanciaciones.push({
      fecha: isoDate(HOY),
      saldoBase: saldo,
      nCuotas, tasaPct, tipo,
      interesNuevo: gen.interesTotal,
    });
    prestamo.plan = gen.plan;
    prestamo.total = gen.total;
    prestamo.saldoActual = gen.total;
    prestamo.interesTotal = (prestamo.interesTotal || 0); // se conserva referencia original
    prestamo.tasaPct = tasaPct;
    prestamo.tipo = tipo;
    prestamo.nCuotas = nCuotas;
    prestamo.fechaPrimeraCuota = isoDate(fechaPrimeraCuota);
    prestamo.valorCuota = gen.valorCuota;
    return prestamo;
  }

  // --------------------------------------------------------------------------
  // Crear préstamo (arma el objeto completo)
  // --------------------------------------------------------------------------
  let _seq = 100;
  function crearPrestamo(datos) {
    const { capital, tasaPct, tipo, modalidad, nCuotas, periodicidad, fechaPrimeraCuota, medioEntrega, socioId } = datos;
    const gen = generarPlan({ capital, tasaPct, tipo, modalidad, nCuotas, periodicidad, fechaPrimeraCuota });
    _seq += 1;
    return {
      id: 'pr_' + _seq,
      socioId,
      capital,
      tasaPct, tipo, modalidad,
      nCuotas, periodicidad,
      fechaPrimeraCuota: isoDate(fechaPrimeraCuota),
      medioEntrega,
      interesTotal: gen.interesTotal,
      total: gen.total,
      valorCuota: gen.valorCuota,
      saldoActual: gen.total,
      estado: 'activo',
      plan: gen.plan,
      abonos: [],
      refinanciaciones: [],
      creado: isoDate(HOY),
    };
  }

  // --------------------------------------------------------------------------
  // Datos semilla (fondo, socios, préstamos con estados variados)
  // --------------------------------------------------------------------------
  const REGLAS = { activo: true, porcentaje: 2, plazo_maximo: 12 };

  const FONDO = { efectivo: 2450000, transferencia: 3900000 };

  const SOCIOS = [
    { id: 's1', nombre: 'María Fernanda López', telefono: '3104567890', activo: true },
    { id: 's2', nombre: 'Carlos Andrés Gómez', telefono: '3159876543', activo: true },
    { id: 's3', nombre: 'Luisa Ramírez', telefono: '', activo: true },
    { id: 's4', nombre: 'Jorge Iván Restrepo', telefono: '3201122334', activo: true },
    { id: 's5', nombre: 'Ana Sofía Marín', telefono: '3007654321', activo: true },
  ];

  function seedPrestamos() {
    const arr = [];

    // 1) Activo al día, interés normal mensual — con 2 abonos.
    let p1 = crearPrestamo({
      socioId: 's1', capital: 800000, tasaPct: 2, tipo: 'simple', modalidad: 'normal',
      nCuotas: 6, periodicidad: 'mensual', fechaPrimeraCuota: new Date(2026, 3, 5), medioEntrega: 'transferencia',
    });
    aplicarAbono(p1, p1.valorCuota, { fecha: '2026-04-05', formaPago: 'transferencia' });
    aplicarAbono(p1, p1.valorCuota, { fecha: '2026-05-06', formaPago: 'efectivo' });
    arr.push(p1);

    // 2) En mora, interés normal mensual — sin abonos, cuotas vencidas.
    let p2 = crearPrestamo({
      socioId: 's2', capital: 500000, tasaPct: 2.5, tipo: 'simple', modalidad: 'normal',
      nCuotas: 5, periodicidad: 'mensual', fechaPrimeraCuota: new Date(2026, 2, 10), medioEntrega: 'efectivo',
    });
    aplicarAbono(p2, Math.round(p2.valorCuota * 0.5), { fecha: '2026-03-12', formaPago: 'efectivo' });
    arr.push(p2);

    // 3) Anticipado, quincenal, al día.
    let p3 = crearPrestamo({
      socioId: 's4', capital: 1200000, tasaPct: 2, tipo: 'simple', modalidad: 'anticipado',
      nCuotas: 8, periodicidad: 'quincenal', fechaPrimeraCuota: new Date(2026, 5, 1), medioEntrega: 'transferencia',
    });
    aplicarAbono(p3, p3.valorCuota, { fecha: '2026-06-01', formaPago: 'transferencia' });
    arr.push(p3);

    // 4) Compuesto, mensual, al día, monto alto.
    let p4 = crearPrestamo({
      socioId: 's5', capital: 1500000, tasaPct: 2, tipo: 'compuesto', modalidad: 'normal',
      nCuotas: 10, periodicidad: 'mensual', fechaPrimeraCuota: new Date(2026, 6, 15), medioEntrega: 'efectivo',
    });
    arr.push(p4);

    // 5) Pagado por completo.
    let p5 = crearPrestamo({
      socioId: 's3', capital: 300000, tasaPct: 2, tipo: 'simple', modalidad: 'normal',
      nCuotas: 3, periodicidad: 'mensual', fechaPrimeraCuota: new Date(2026, 1, 20), medioEntrega: 'efectivo',
    });
    aplicarAbono(p5, p5.total, { fecha: '2026-04-25', formaPago: 'transferencia' });
    arr.push(p5);

    return arr;
  }

  // --------------------------------------------------------------------------
  // Totales del módulo (sección 10) e interés como utilidad
  // --------------------------------------------------------------------------
  function totalesModulo(prestamos) {
    let totalPrestado = 0, interesesGanados = 0, totalAbonado = 0;
    for (const p of prestamos) {
      if (p.estado === 'activo') totalPrestado += p.capital; // capital vigente prestado
      totalAbonado += p.plan.reduce((s, c) => s + c.abonado, 0);
      // Utilidad: anticipado = todo al inicio; normal = interés de cuotas saldadas.
      if (p.modalidad === 'anticipado') {
        interesesGanados += p.interesTotal;
      } else {
        interesesGanados += p.plan
          .filter((c) => estadoCuota(c) === 'pagada')
          .reduce((s, c) => s + c.interes, 0);
      }
    }
    return { totalPrestado, interesesGanados, totalAbonado };
  }

  function socio(id) { return SOCIOS.find((s) => s.id === id); }

  // --------------------------------------------------------------------------
  // API pública
  // --------------------------------------------------------------------------
  window.PE = {
    HOY, MONTO_MINIMO, REGLAS,
    fmt, fmtNum, pct, fmtFecha, isoDate, periodoLabel, periodoKey, periodoDeFecha,
    tasaPeriodo, calcularInteresTotal, generarPlan, estadoCuota,
    desembolso, validarPrestamo, aplicarAbono, recalcularSaldos, resumenPrestamo,
    cuotasPrestamoParaPeriodo, aplicarPagoCuotas, refinanciar, crearPrestamo,
    totalesModulo, socio,
    // estado inicial (se clona por variante)
    initState() {
      return {
        fondo: JSON.parse(JSON.stringify(FONDO)),
        socios: JSON.parse(JSON.stringify(SOCIOS)),
        prestamos: seedPrestamos(),
        reglas: JSON.parse(JSON.stringify(REGLAS)),
      };
    },
  };
})();
