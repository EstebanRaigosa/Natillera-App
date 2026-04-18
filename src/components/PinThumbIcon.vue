<!-- Chincheta: cabeza redondeada + aguja (no pin de mapa) -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="h-[1em] w-[1em] shrink-0"
    aria-hidden="true"
  >
    <g
      v-if="!pinned"
      fill="none"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="7.25" y="3.5" width="9.5" height="6.5" rx="3.25" />
      <line x1="12" y1="10" x2="12" y2="20.5" />
      <circle cx="12" cy="21.35" r="1.15" fill="currentColor" stroke="none" />
    </g>
    <g v-else>
      <rect
        x="7.25"
        y="3.5"
        width="9.5"
        height="6.5"
        rx="3.25"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1.2"
      />
      <line
        x1="12"
        y1="10"
        x2="12"
        y2="20.5"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
      />
      <circle cx="12" cy="21.35" r="1.15" fill="currentColor" stroke="none" />
      <!-- Brillo suave en la cabeza -->
      <ellipse cx="10.2" cy="5.8" rx="1.8" ry="1.2" fill="rgba(255,255,255,0.35)" stroke="none" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  pinned: { type: Boolean, default: false },
})
</script>
