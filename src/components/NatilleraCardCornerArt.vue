<template>
  <!-- Ilustración vectorial esquina inferior derecha (crecimiento + ahorro, line art) -->
  <svg
    :class="[
      'pointer-events-none absolute bottom-0 right-0 shrink-0 overflow-visible text-[#166534] opacity-[0.92] transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none',
      compact ? 'h-[6.75rem] w-[6.75rem] sm:h-[7.25rem] sm:w-[7.25rem]' : 'h-[7.75rem] w-[7.75rem] sm:h-[8.5rem] sm:w-[8.5rem]',
    ]"
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Cinta principal (peso visual) -->
    <path
      stroke="currentColor"
      stroke-opacity="0.2"
      stroke-width="1.35"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M -8 168 C 42 148 78 124 102 82 C 118 52 128 28 168 -6"
    />
    <path
      stroke="currentColor"
      stroke-opacity="0.11"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M 4 162 C 54 142 92 112 114 76 C 128 52 138 30 172 4"
    />
    <!-- Aros tipo “moneda” apilada -->
    <circle
      cx="118"
      cy="44"
      r="20"
      stroke="currentColor"
      stroke-opacity="0.12"
      stroke-width="1"
    />
    <circle
      cx="118"
      cy="44"
      r="12.5"
      stroke="currentColor"
      stroke-opacity="0.18"
      stroke-width="0.85"
    />
    <circle
      cx="118"
      cy="44"
      r="4.5"
      fill="currentColor"
      fill-opacity="0.07"
      stroke="currentColor"
      stroke-opacity="0.2"
      stroke-width="0.75"
    />
    <!-- Brote / hoja (trazo continuo) -->
    <path
      stroke="currentColor"
      stroke-opacity="0.14"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M 52 148 C 62 128 58 108 72 92 C 82 80 96 74 108 68"
    />
    <path
      stroke="currentColor"
      stroke-opacity="0.12"
      stroke-width="0.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M 72 92 C 78 78 88 66 102 58"
    />
    <path
      stroke="currentColor"
      stroke-opacity="0.12"
      stroke-width="0.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M 72 92 C 64 84 54 80 44 78"
    />
    <circle cx="102" cy="58" r="1.35" fill="currentColor" fill-opacity="0.22" />
    <circle cx="72" cy="92" r="1.25" fill="currentColor" fill-opacity="0.2" />
    <circle cx="108" cy="68" r="1.15" fill="currentColor" fill-opacity="0.18" />
  </svg>
</template>

<script setup>
defineProps({
  /** Vista lista: proporción un poco más contenida */
  compact: { type: Boolean, default: false },
})
</script>
