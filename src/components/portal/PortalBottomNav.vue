<template>
  <!--
    Barra inferior del portal del socio (solo móvil). Misma carcasa que la del admin
    (MobileBottomNav) para que se sienta la misma app, pero con los destinos del socio.
    Va con Teleport a body: dentro de <main> un ancestro con transform (iOS, ver
    docs/compatibilidad-ios-safari.md) rompe el `position: fixed`.
  -->
  <Teleport to="body">
    <nav
      ref="barra"
      class="portal-nav lg:hidden fixed bottom-0 left-0 right-0 z-[49] app-shell-nav-bg rounded-t-3xl pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.25)]"
      :style="{ '--tapado-inferior': tapado + 'px' }"
      aria-label="Secciones de mi natillera"
    >
      <!-- «Más»: el resto de secciones, como el menú de «Caja» de la barra del admin -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="menuAbierto && masOpciones.length > 0"
          role="menu"
          aria-label="Más secciones"
          class="absolute bottom-full right-2 z-[5] mb-2 flex gap-1.5 rounded-2xl border border-white/15 bg-[#12331f] p-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)]"
          @click.stop
        >
          <button
            v-for="o in masOpciones"
            :key="o.valor"
            type="button"
            role="menuitem"
            class="flex min-h-[44px] min-w-[64px] touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-white transition-colors [-webkit-tap-highlight-color:transparent]"
            :class="activa === o.valor ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15'"
            @click="elegir(o.valor)"
          >
            <component :is="o.icono" class="h-5 w-5 flex-shrink-0" />
            <span class="text-[10px] font-semibold leading-tight">{{ o.etiqueta }}</span>
          </button>
        </div>
      </Transition>

      <div class="relative z-[3] mx-auto flex max-w-screen-sm items-end justify-around gap-0.5 px-1">
        <button
          v-for="item in items"
          :key="item.valor"
          type="button"
          class="portal-nav__item"
          :class="item.activo ? 'portal-nav__item--activo' : 'portal-nav__item--inactivo'"
          :aria-current="item.activo ? 'page' : undefined"
          :aria-haspopup="item.valor === 'mas' ? 'menu' : undefined"
          :aria-expanded="item.valor === 'mas' ? menuAbierto : undefined"
          @click.stop="elegir(item.valor)"
        >
          <span v-if="item.activo" class="portal-nav__punto" aria-hidden="true" />
          <component :is="item.activo ? item.iconoActivo : item.icono" class="h-5 w-5 flex-shrink-0" />
          <span class="max-w-full truncate text-[10px] font-semibold leading-tight">{{ item.etiqueta }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import {
  BanknotesIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalCircleIcon,
  HomeIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import {
  BanknotesIcon as BanknotesIconSolid,
  CalendarIcon as CalendarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  EllipsisHorizontalCircleIcon as EllipsisHorizontalCircleIconSolid,
  HomeIcon as HomeIconSolid,
  SparklesIcon as SparklesIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/vue/24/solid'
import { useTapadoInferior } from '../../composables/useTapadoInferior'

const props = defineProps({
  /** Sección marcada: 'resumen' | 'aportes' | 'ganancias' | 'prestamos' | 'actividades' | 'grupo' | 'estado' */
  activa: { type: String, default: 'resumen' },
  /** Pestañas de detalle que tiene este socio (las de la página), además de Aportes. */
  secciones: { type: Array, default: () => [] }
})
const emit = defineEmits(['elegir'])

// La barra de Safari se pinta encima: se suma al padding (§4.1 del manual de iOS).
const { tapado } = useTapadoInferior()

const ICONOS = {
  ganancias: [SparklesIcon, SparklesIconSolid],
  prestamos: [BanknotesIcon, BanknotesIconSolid],
  actividades: [CalendarIcon, CalendarIconSolid],
  grupo: [UserGroupIcon, UserGroupIconSolid]
}

/*
 * Las secciones van en la barra, cada una con su botón: escondidas en «Más» el socio no las
 * encontraba. Caben 7 botones en 375 px (el iPhone más angosto); solo si el socio tiene las
 * cuatro secciones sobra una y reaparece «Más» con las que no entran.
 */
const MAX_BOTONES = 7
const FIJOS = 4 // Natilleras, Resumen, Aportes y Estado

const extras = computed(() =>
  props.secciones
    .filter(s => s.valor !== 'aportes')
    .map(s => {
      const [icono, iconoActivo] = ICONOS[s.valor] || [CalendarIcon, CalendarIconSolid]
      return { ...s, icono, iconoActivo }
    })
)
const enBarra = computed(() => {
  const cupo = MAX_BOTONES - FIJOS
  return extras.value.length <= cupo ? extras.value : extras.value.slice(0, cupo - 1)
})
const masOpciones = computed(() => extras.value.slice(enBarra.value.length))

const items = computed(() => {
  const enMas = masOpciones.value.some(o => o.valor === props.activa)
  const lista = [
    { valor: 'natilleras', etiqueta: 'Natilleras', icono: Squares2X2Icon, iconoActivo: Squares2X2IconSolid, activo: false },
    { valor: 'resumen', etiqueta: 'Resumen', icono: HomeIcon, iconoActivo: HomeIconSolid, activo: props.activa === 'resumen' },
    { valor: 'aportes', etiqueta: 'Aportes', icono: CurrencyDollarIcon, iconoActivo: CurrencyDollarIconSolid, activo: props.activa === 'aportes' },
    ...enBarra.value.map(o => ({ ...o, activo: props.activa === o.valor }))
  ]
  if (masOpciones.value.length > 0) {
    lista.push({ valor: 'mas', etiqueta: 'Más', icono: EllipsisHorizontalCircleIcon, iconoActivo: EllipsisHorizontalCircleIconSolid, activo: enMas || menuAbierto.value })
  }
  lista.push({ valor: 'estado', etiqueta: 'Estado', icono: DocumentTextIcon, iconoActivo: DocumentTextIconSolid, activo: props.activa === 'estado' })
  return lista
})

const menuAbierto = ref(false)

function elegir(valor) {
  if (valor === 'mas') {
    menuAbierto.value = !menuAbierto.value
    return
  }
  menuAbierto.value = false
  emit('elegir', valor)
}

/*
 * Tocar fuera cierra el menú, como cualquier desplegable. Con `pointerdown` y no
 * `click` (igual que BotonSoporte): en iOS el `click` sobre zonas no
 * interactivas no llega a `document`, y el menú se quedaba abierto. Lo que cae
 * dentro de la barra lo resuelve `elegir` (incluido «Más», que alterna).
 */
const barra = ref(null)
function cerrarFuera(evento) {
  if (barra.value?.contains(evento.target)) return
  menuAbierto.value = false
}
watch(menuAbierto, abierto => {
  if (abierto) document.addEventListener('pointerdown', cerrarFuera)
  else document.removeEventListener('pointerdown', cerrarFuera)
})
onUnmounted(() => document.removeEventListener('pointerdown', cerrarFuera))
</script>

<style scoped>
/* tema-fijo-inicio: barra de navegación verde, igual en los dos modos */
.portal-nav {
  isolation: isolate;
  padding-bottom: calc(max(0.3rem, env(safe-area-inset-bottom, 0px)) + var(--tapado-inferior, 0px));
}
.portal-nav__item {
  position: relative;
  display: flex;
  min-width: 0;
  max-width: 64px;
  min-height: 44px;
  flex: 1 1 0%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.375rem;
  border-radius: 0.75rem;
  transition: background-color 200ms ease, color 200ms ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-nav__item--inactivo { color: hsl(152 42% 78% / 0.92); }
.portal-nav__item--activo {
  margin-top: -0.55rem;
  padding-top: 0.3rem;
  padding-bottom: 0.25rem;
  background-color: hsl(var(--primary));
  color: #fff;
  box-shadow: 0 2px 12px hsl(var(--primary) / 0.28), 0 4px 14px rgba(0, 0, 0, 0.12);
}
.portal-nav__punto {
  position: absolute;
  top: -0.375rem;
  left: 50%;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #fff; /* tema-fijo: punto indicador sobre la barra verde de navegación */
  transform: translateX(-50%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
/* tema-fijo-fin */
</style>
