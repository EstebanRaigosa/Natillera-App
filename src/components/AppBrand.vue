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

const cls = computed(() => (typeof classValue.value === 'string' ? classValue.value : ''))

// Texto claro sobre fondo oscuro (blanco, cian, ámbar, etc.)
const isLightOnDark = computed(() => {
  const c = cls.value
  if (!c) return false
  return (
    /\btext-white\b/.test(c) ||
    /\btext-(cyan|sky|emerald|teal|amber|yellow|lime|rose|pink)-50\b/.test(c) ||
    /\btext-(cyan|amber)-100\b/.test(c)
  )
})

const isWhiteText = computed(() => cls.value.includes('text-white'))

// Clase del contenedor
const containerClass = computed(() => {
  return classValue.value || ''
})

// "Natiller": en contexto claro hereda el color del contenedor (p. ej. text-cyan-50)
const firstPartClass = computed(() => {
  if (isWhiteText.value) return 'text-white'
  if (isLightOnDark.value) return ''
  return 'text-gray-900'
})

// "app": acento según contexto (sobrio sobre oscuro; sin brillos llamativos)
const appSpanStyle = computed(() => {
  const c = cls.value
  const subtle = '0 1px 2px rgba(0,0,0,0.35)'
  if (/\btext-white\b/.test(c)) {
    return {
      color: 'hsl(131, 42%, 56%)',
      textShadow: subtle,
    }
  }
  if (/\btext-cyan-50\b/.test(c)) {
    return {
      color: 'hsl(172, 55%, 50%)',
      textShadow: subtle,
    }
  }
  if (/\btext-amber-50\b/.test(c)) {
    return {
      color: 'hsl(43, 55%, 52%)',
      textShadow: subtle,
    }
  }
  return {
    color: '#09c260',
    textShadow:
      '-0.3px -0.3px 0 #000, 0.3px -0.3px 0 #000, -0.3px 0.3px 0 #000, 0.3px 0.3px 0 #000',
  }
})
</script>
