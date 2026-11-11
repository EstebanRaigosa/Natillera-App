import test from 'node:test'
import assert from 'node:assert/strict'
import { repartirPagoPrioritario } from '../src/utils/repartirPagoPrioritario.js'

const filas = () => Array.from({ length: 5 }, (_, i) => ({
  cuota: { id: i + 1 }, periodo: `Mes ${i + 1}`, fecha: '2026-11-08',
  vencida: true, multa: 10000, cuotaPend: 100000,
  actividades: [{ id: `a${i}`, valor_pendiente: 20000 }],
  prestamo: [{ id: `p${i}`, mora: 1000, valor_pendiente: 30000 }]
}))
const suma = pasos => pasos.reduce((s, p) => s + p.valorPagado + p.impuesto4x1000, 0)
const tipo = p => p.multa ? 'sancion' : p.actividades.length ? 'actividad' : p.prestamo.length ? 'prestamo' : 'ahorro'

test('con cinco cuotas en mora, un monto corto paga sanciones de varias cuotas y ningún ahorro', () => {
  const r = repartirPagoPrioritario(filas(), 35000)
  assert.deepEqual(r.pasos.map(p => [p.cuota.id, p.valorPagado]), [[1, 10000], [2, 10000], [3, 10000], [4, 5000]])
  assert.ok(r.pasos.every(p => tipo(p) === 'sancion'))
  assert.equal(r.pasos.at(-1).multa, 10000)
  assert.equal(r.sobrante, 0)
})

test('termina todas las sanciones antes de abonar a actividades', () => {
  const r = repartirPagoPrioritario(filas(), 75000)
  assert.deepEqual(r.pasos.map(tipo), [...Array(5).fill('sancion'), 'actividad', 'actividad'])
  assert.equal(r.pasos.at(-1).actividades[0].valor_pendiente, 5000)
})

test('termina actividades y paga mora de préstamo antes del capital', () => {
  const r = repartirPagoPrioritario(filas(), 150500)
  assert.equal(tipo(r.pasos.at(-1)), 'prestamo')
  assert.deepEqual(r.pasos.at(-1).prestamo[0], { id: 'p0', mora: 500, valor_pendiente: 0, pagado: false })
  assert.ok(r.pasos.every(p => tipo(p) !== 'ahorro'))
})

test('el ahorro empieza únicamente después de saldar sanciones, actividades y préstamos de las cinco cuotas', () => {
  const r = repartirPagoPrioritario(filas(), 355000)
  assert.deepEqual(r.pasos.map(tipo), [
    ...Array(5).fill('sancion'), ...Array(5).fill('actividad'),
    ...Array(5).fill('prestamo'), 'ahorro'
  ])
  assert.equal(r.pasos.at(-1).cuota.id, 1)
  assert.equal(r.pasos.at(-1).valorPagado, 50000)
  assert.equal(suma(r.pasos), 355000)
})

test('el GMF del registro coincide con el resumen por cuota y respeta el monto recibido', () => {
  for (const monto of [125, 126, 35000, 75000, 151000, 355000, 900000]) {
    const r = repartirPagoPrioritario(filas(), monto, true)
    assert.equal(suma(r.pasos), suma(r.pagos))
    assert.equal(suma(r.pasos) + r.sobrante, monto)
    for (const p of r.pagos) assert.equal(p.impuesto4x1000, Math.round(p.valorPagado * 4 / 1000))
  }
})

test('un peso insuficiente por GMF no salta una sanción para cobrar un concepto inferior', () => {
  const f = filas().slice(0, 2)
  f[0].multa = 126
  const r = repartirPagoPrioritario(f, 126, true)
  assert.equal(r.pasos.length, 1)
  assert.equal(r.pasos[0].valorPagado, 125)
  assert.equal(r.sobrante, 0)
})

test('las obligaciones futuras se atienden después de saldar lo vencido', () => {
  const f = filas().slice(0, 2)
  f[1].vencida = false
  const r = repartirPagoPrioritario(f, 100000)
  assert.ok(r.pasos.every(p => p.cuota.id === 1))
})

test('pago completo y presupuesto cero conservan los saldos y no modifican las entradas', () => {
  const f = filas()
  const copia = structuredClone(f)
  const r = repartirPagoPrioritario(f)
  assert.equal(suma(r.pasos), 805000)
  assert.deepEqual(f, copia)
  assert.deepEqual(repartirPagoPrioritario(f, 0).pasos, [])
})
