<template>
  <!--
    Natilleras de un usuario como listado corto: una por línea, con su rol al
    lado. Se muestran todas; quien más tiene anda por ocho, que caben sin
    convertir la fila en otra pantalla.
  -->
  <span v-if="natilleras === null" class="text-texto-tenue">…</span>
  <span v-else-if="!natilleras.length" class="text-texto-tenue">Sin natilleras</span>
  <ul v-else class="min-w-0 space-y-0.5">
    <li v-for="n in natilleras" :key="n.id" class="flex min-w-0 items-center gap-1.5">
      <span class="h-1 w-1 flex-shrink-0 rounded-full bg-texto-tenue" aria-hidden="true" />
      <span class="min-w-0 truncate text-texto-medio">{{ n.nombre }}</span>
      <span :class="['flex-shrink-0 rounded-full px-1.5 py-px font-semibold', claseRol(n.rol)]">
        {{ ROLES[n.rol] || n.rol }}
      </span>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  /** null mientras se consulta; [] si no tiene ninguna. */
  natilleras: { type: Array, default: null },
})

const ROLES = {
  administrador: 'Admin',
  co_administrador: 'Coadmin',
  colaborador: 'Colaborador',
  visor: 'Visor',
  socio: 'Socio',
}

function claseRol(rol) {
  if (rol === 'administrador') return 'bg-emerald-50 text-marca-tinta oscuro:bg-emerald-500/15'
  if (rol === 'socio') return 'bg-superficie-hundida text-texto-suave'
  return 'bg-sky-50 text-sky-700 oscuro:bg-sky-500/15 oscuro:text-sky-300'
}
</script>
