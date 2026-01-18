<template>
  <nav v-if="breadcrumbs.length > 0" class="hidden sm:block mb-2 sm:mb-4" aria-label="Breadcrumb">
    <ol class="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <router-link
          v-if="index < breadcrumbs.length - 1 && crumb.to"
          :to="crumb.to"
          class="group inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200"
        >
          <HomeIcon v-if="index === 0" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600" />
          <span class="whitespace-nowrap">{{ crumb.label }}</span>
        </router-link>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-natillera-50 border border-natillera-200 text-natillera-700 font-semibold rounded-lg"
        >
          <span class="whitespace-nowrap">{{ crumb.label }}</span>
        </span>
        <ChevronRightIcon
          v-if="index < breadcrumbs.length - 1"
          class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-1.5 flex-shrink-0"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNatillerasStore } from '../stores/natilleras'
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const natillerasStore = useNatillerasStore()

const breadcrumbs = computed(() => {
  const crumbs = []
  const path = route.path
  const params = route.params

  // Siempre empezar con Dashboard
  crumbs.push({
    label: 'Dashboard',
    to: '/dashboard'
  })

  // Rutas relacionadas con natilleras
  if (path.includes('/natilleras')) {
    const natilleraId = params.id

    // Si hay ID de natillera, agregar el detalle
    if (natilleraId) {
      const natillera = natillerasStore.natilleras.find(n => n.id === natilleraId) ||
                       natillerasStore.natilleraActual

      crumbs.push({
        label: natillera?.nombre || 'Natillera',
        to: `/natilleras/${natilleraId}`
      })
    }

    // Crear natillera
    if (path.includes('/crear')) {
      crumbs.push({
        label: 'Crear Natillera',
        to: null
      })
    }
    // Socios
    else if (path.includes('/socios')) {
      crumbs.push({
        label: 'Socios',
        to: null
      })
    }
    // Cuotas - meses
    else if (path.includes('/cuotas') && !path.match(/\/cuotas\/\d+/)) {
      crumbs.push({
        label: 'Cuotas',
        to: null
      })
    }
    // Cuotas - mes específico
    else if (path.match(/\/cuotas\/\d+/)) {
      const mes = params.mes
      const mesLabels = {
        '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
        '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
        '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
      }
      
      // Agregar link a meses
      crumbs.push({
        label: 'Cuotas',
        to: `/natilleras/${natilleraId}/cuotas`
      })
      
      // Agregar mes actual
      crumbs.push({
        label: mesLabels[mes] || `Mes ${mes}`,
        to: null
      })
    }
    // Préstamos
    else if (path.includes('/prestamos')) {
      crumbs.push({
        label: 'Préstamos',
        to: null
      })
    }
    // Actividades
    else if (path.includes('/actividades')) {
      crumbs.push({
        label: 'Actividades',
        to: null
      })
    }
    // Configuración
    else if (path.includes('/configuracion')) {
      crumbs.push({
        label: 'Configuración',
        to: null
      })
    }
  }
  // Configuración general
  else if (path.includes('/configuracion')) {
    crumbs.push({
      label: 'Configuración',
      to: null
    })
  }
  // Auditoría
  else if (path.includes('/auditoria')) {
    crumbs.push({
      label: 'Auditoría',
      to: null
    })
  }
  // Admin - Chat
  else if (path.includes('/admin/chat')) {
    crumbs.push({
      label: 'Chat Admin',
      to: null
    })
  }
  // Admin - Data
  else if (path.includes('/admin/data')) {
    crumbs.push({
      label: 'Data Admin',
      to: null
    })
  }

  return crumbs
})
</script>
