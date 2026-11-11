import test from 'node:test'
import assert from 'node:assert/strict'
import { seleccionarPagosRegistrados, eliminarPagosSeleccionados } from '../src/utils/seleccionarPagosRegistrados.js'

const pagos = [
  { cuota: { id: 'enero' }, historial: [{ id: 'sancion' }, { id: 'ahorro' }, { id: 'anterior' }], transaccion: [{ id: 'sancion' }, { id: 'ahorro' }] },
  { cuota: { id: 'febrero' }, historial: [{ id: 'febrero-pago' }], transaccion: null },
  { cuota: { id: 'marzo', valor_pagado: 100000 }, historial: [], transaccion: null },
  { cuota: { id: 'actividad-aparte' }, historial: [], transaccion: null }
]

test('un recibo múltiple elimina sus abonos exactos sin tocar pagos anteriores', () => {
  const r = seleccionarPagosRegistrados(pagos, new Set(['enero']), new Map())
  assert.deepEqual(r.map(p => p.historialId), ['ahorro', 'sancion'])
})

test('permite elegir pagos de otras cuotas y un subconjunto de abonos', () => {
  const r = seleccionarPagosRegistrados(pagos, new Set(['enero', 'febrero']), new Map([['enero', new Set(['anterior'])]]))
  assert.deepEqual(r.map(p => p.historialId), ['febrero-pago', 'anterior'])
})

test('sin cuotas o abonos elegidos no hay nada que eliminar', () => {
  assert.deepEqual(seleccionarPagosRegistrados(pagos, new Set(), new Map()), [])
  assert.deepEqual(seleccionarPagosRegistrados(pagos, new Set(['enero']), new Map([['enero', new Set()]])), [])
})

test('soporta pagos antiguos y excluye lo pagado fuera de Cuotas', () => {
  const r = seleccionarPagosRegistrados(pagos, new Set(['marzo', 'actividad-aparte']), new Map())
  assert.deepEqual(r, [{ cuotaId: 'marzo', directo: true }])
})

test('ejecuta las reversiones de una en una y se detiene al fallar', async () => {
  const llamadas = []
  const r = await eliminarPagosSeleccionados([1, 2, 3], async p => {
    llamadas.push(p)
    return p === 2 ? { success: false, error: 'Error al revertir' } : { success: true }
  })
  assert.deepEqual(llamadas, [1, 2])
  assert.deepEqual(r.eliminados, [1])
  assert.equal(r.error, 'Error al revertir')
})

test('una reversión incompleta detiene el lote y conserva sus avisos', async () => {
  const r = await eliminarPagosSeleccionados([1, 2], async () => ({ success: true, problemas: ['Revisar actividad'] }))
  assert.deepEqual(r.eliminados, [1])
  assert.deepEqual(r.problemas, ['Revisar actividad'])
})

test('captura errores inesperados y permite reintentar solo los pagos pendientes', async () => {
  const r = await eliminarPagosSeleccionados([1, 2, 3], async p => {
    if (p === 2) throw new Error('Sin conexión')
    return { success: true }
  })
  assert.equal(r.error, 'Sin conexión')
  assert.deepEqual(r.eliminados, [1])
  const restantes = [1, 2, 3].filter(p => !r.eliminados.includes(p))
  const reintento = await eliminarPagosSeleccionados(restantes, async () => ({ success: true }))
  assert.deepEqual(reintento.eliminados, [2, 3])
})
