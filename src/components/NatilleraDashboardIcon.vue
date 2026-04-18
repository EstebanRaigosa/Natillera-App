<template>
  <component
    :is="iconComponent"
    class="h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
    stroke-width="2.1"
  />
</template>

<script setup>
import { computed } from 'vue'
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  ScaleIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  CircleStackIcon,
  CalculatorIcon,
  PercentBadgeIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  ReceiptRefundIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline'
import { resolveDashboardIconIndex } from '../utils/natilleraDashboardIcons'

const props = defineProps({
  natillera: { type: Object, default: null },
  index: { type: Number, default: undefined },
})

/** 20 iconos alineados con ahorro, finanzas y crecimiento */
const ICONS = [
  BanknotesIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  BuildingLibraryIcon,
  ScaleIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  CircleStackIcon,
  CalculatorIcon,
  PercentBadgeIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  ReceiptRefundIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
]

const iconComponent = computed(() => {
  const i =
    props.index !== undefined && props.index !== null
      ? Math.floor(props.index) % ICONS.length
      : resolveDashboardIconIndex(props.natillera || {})
  return ICONS[i] || BanknotesIcon
})
</script>
