<template>
  <li class="flex items-start gap-2.5 rounded-xl bg-white px-3 py-2">
    <span class="w-9 flex-shrink-0 pt-0.5 text-center">
      <span class="block font-display text-sm font-bold leading-none text-gray-800">{{ dia }}</span>
      <span class="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-gray-400">{{ mes }}</span>
    </span>

    <span class="min-w-0 flex-1">
      <span class="flex flex-wrap items-center gap-1.5">
        <span class="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold" :class="claseTipo(pago.tipo, pago.esParcial)">
          {{ etiquetaTipo(pago.tipo) }}
        </span>
        <span v-if="pago.esParcial" class="text-[0.6875rem] font-semibold text-orange-700">Abono parcial</span>
      </span>
      <span class="mt-1 block break-words text-sm leading-snug text-gray-800">{{ pago.concepto }}</span>
      <span class="mt-0.5 block text-xs text-gray-500">
        <span v-if="pago.periodo">Período {{ pago.periodo }} · </span>
        {{ pago.formaPago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
        <!-- El libro marca cuándo la fecha no es la del pago sino la última vez que se
             tocó la fila; callarlo haría pasar un sucedáneo por dato. -->
        <span v-if="pago.fechaEstimada" class="text-amber-700"> · fecha aproximada</span>
      </span>
    </span>

    <span class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-gray-900">
      {{ formatMoney(pago.monto) }}
    </span>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { etiquetaTipo, claseTipo, mesCorto } from '../../composables/usePagosSocios'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  pago: { type: Object, required: true }
})

const dia = computed(() => {
  if (!props.pago.fecha) return '—'
  return String(Number(props.pago.fecha.slice(8, 10)))
})

const mes = computed(() => {
  if (!props.pago.fecha) return ''
  return mesCorto(Number(props.pago.fecha.slice(5, 7)))
})
</script>
