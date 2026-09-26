<template>
  <!-- Destellos del fondo oscuro de las pantallas públicas; algunos titilan (animacionesPublico.css). -->
  <svg class="pointer-events-none absolute inset-0 h-full w-full" :class="{ 'lp-vivo': vivo }" aria-hidden="true" preserveAspectRatio="none">
    <circle
      v-for="(e, i) in ESTRELLAS"
      :key="i"
      :cx="e.x + '%'"
      :cy="e.y + '%'"
      :r="e.r"
      fill="#e9f6ec"
      :opacity="e.o"
      :class="{ 'lp-titilar': i % 3 === 0 }"
      :style="i % 3 === 0 ? { animationDelay: `${(i % 7) * 0.6}s` } : null"
    />
  </svg>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ESTRELLAS } from './escenaAhorro'
import './animacionesPublico.css'

const vivo = ref(false)
onMounted(() => { vivo.value = true })
</script>
