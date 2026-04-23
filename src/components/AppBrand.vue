<template>
  <span :class="containerClass" class="font-bold">
    <span :class="firstPartClass">Natiller</span><span :style="appSpanStyle">app</span>
  </span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

// Obtener la clase del atributo class
const classValue = computed(() => {
  if (attrs.class) {
    // Si es un string, retornarlo directamente
    if (typeof attrs.class === 'string') {
      return attrs.class
    }
    // Si es un objeto o array, convertirlo a string
    if (Array.isArray(attrs.class)) {
      return attrs.class.join(' ')
    }
    if (typeof attrs.class === 'object') {
      return Object.entries(attrs.class)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(' ')
    }
  }
  return ''
})

// Determinar si el texto debe ser blanco (para fondos oscuros)
const isWhiteText = computed(() => {
  return classValue.value && classValue.value.includes('text-white')
})

// Clase del contenedor
const containerClass = computed(() => {
  return classValue.value || ''
})

// Clase para "Natiller" - gris oscuro por defecto, blanco si está en contexto blanco
const firstPartClass = computed(() => {
  if (isWhiteText.value) {
    return 'text-white'
  }
  return 'text-gray-900'
})

// "app": verde acento; en fondo oscuro, menta suave sin contorno duro
const appSpanStyle = computed(() => {
  if (isWhiteText.value) {
    return {
      color: 'hsl(131, 48%, 62%)',
      textShadow: 'none',
    }
  }
  return {
    color: '#09c260',
    textShadow:
      '-0.3px -0.3px 0 #000, 0.3px -0.3px 0 #000, -0.3px 0.3px 0 #000, 0.3px 0.3px 0 #000',
  }
})
</script>
