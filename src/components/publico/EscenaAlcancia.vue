<template>
  <!--
    Ilustración del hero, al estilo de la referencia: una figura al centro dentro de anillos
    luminosos, con insignias y tarjetitas de ahorro flotando alrededor. La figura es una
    alcancía (cerdito) recibiendo una moneda. Con `compacta` se recorta a la alcancía y su
    disco, para la cabecera del login en el celular.

    El ancho lo pone quien la usa (clase w-*). Todo es decorativo (aria-hidden). Las animaciones solo corren bajo `.lp-vivo`, que se
    pone al montar: el HTML pre-renderizado llega quieto y completo.
  -->
  <svg
    :viewBox="compacta ? '136 116 288 288' : '0 0 560 520'"
    class="pointer-events-none block h-auto select-none"
    :class="{ 'lp-vivo': vivo }"
    aria-hidden="true"
  >
    <defs>
      <radialGradient :id="`${uid}Brillo`" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#6fcf97" stop-opacity="0.35" />
        <stop offset="60%" stop-color="#6fcf97" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#6fcf97" stop-opacity="0" />
      </radialGradient>
      <radialGradient :id="`${uid}Disco`" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#1f6b43" />
        <stop offset="100%" stop-color="#0c2a1b" />
      </radialGradient>
      <!-- Disco translúcido: centrado para que el borde se desvanezca parejo, sin línea de contorno -->
      <radialGradient :id="`${uid}DiscoDifuso`" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1f6b43" stop-opacity="0.45" />
        <stop offset="65%" stop-color="#0c2a1b" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#0c2a1b" stop-opacity="0" />
      </radialGradient>
      <linearGradient :id="`${uid}Cerdo`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc9d6" />
        <stop offset="100%" stop-color="#f29bb4" />
      </linearGradient>
      <linearGradient :id="`${uid}Moneda`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe49a" />
        <stop offset="100%" stop-color="#e9b949" />
      </linearGradient>
      <linearGradient :id="`${uid}Tarjeta`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#16402a" />
        <stop offset="100%" stop-color="#0c2619" />
      </linearGradient>
    </defs>

    <!-- Halo y anillos (la compacta los omite: recortados por el encuadre se verían como una caja) -->
    <template v-if="!compacta">
    <circle cx="280" cy="260" r="250" :fill="`url(#${uid}Brillo)`" />
    <g class="lp-girar" style="animation-duration: 60s">
      <circle cx="280" cy="260" r="205" fill="none" stroke="#9fd9b1" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="2 10" stroke-linecap="round" />
    </g>
    <g class="lp-girar lp-girar--inverso" style="animation-duration: 36s">
      <circle cx="280" cy="260" r="172" fill="none" stroke="#9fd9b1" stroke-opacity="0.18" stroke-width="1.5" />
      <circle cx="280" cy="260" r="172" fill="none" stroke="#b9f0cc" stroke-opacity="0.9" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="18 14 6 62" />
    </g>
    </template>
    <circle v-if="discoTranslucido" cx="280" cy="260" r="138" :fill="`url(#${uid}DiscoDifuso)`" />
    <circle v-else cx="280" cy="260" r="138" :fill="`url(#${uid}Disco)`" stroke="#6fcf97" stroke-opacity="0.35" stroke-width="1.5" />

    <!-- Conectores de las insignias al anillo -->
    <g v-if="!compacta" stroke="#9fd9b1" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="3 5" fill="none">
      <path d="M136 132 L170 160" />
      <path d="M86 280 L108 272" />
      <path d="M152 392 L176 372" />
      <path d="M420 136 L392 158" />
      <path d="M476 290 L452 282" />
      <path d="M418 404 L392 380" />
    </g>

    <!-- Alcancía -->
    <ellipse cx="280" cy="352" rx="92" ry="10" fill="#04110a" fill-opacity="0.45" />
    <g transform="translate(276 272)">
      <!-- Moneda que entra por la ranura (va detrás del cuerpo) -->
      <g class="lp-deposito">
        <circle cx="-4" cy="-112" r="17" :fill="`url(#${uid}Moneda)`" stroke="#c9952f" stroke-width="2" />
        <text x="-4" y="-106" text-anchor="middle" font-size="17" font-weight="800" fill="#9a6b12" font-family="inherit">$</text>
      </g>
      <!-- Cola -->
      <path d="M-86 -6 c-16 -6 -24 8 -14 15 c9 6 17 -5 7 -11" fill="none" stroke="#f29bb4" stroke-width="5" stroke-linecap="round" />
      <!-- Patas -->
      <rect x="-60" y="34" width="26" height="42" rx="11" fill="#e98aa6" />
      <rect x="24" y="34" width="26" height="42" rx="11" fill="#e98aa6" />
      <!-- Oreja de atrás -->
      <path d="M26 -50 Q 34 -92 60 -60 Z" fill="#e98aa6" stroke="#e98aa6" stroke-width="6" stroke-linejoin="round" />
      <!-- Cuerpo -->
      <ellipse cx="0" cy="0" rx="90" ry="66" :fill="`url(#${uid}Cerdo)`" />
      <ellipse cx="-32" cy="-30" rx="34" ry="15" fill="#ffffff" fill-opacity="0.35" transform="rotate(-18 -32 -30)" />
      <!-- Ranura -->
      <rect x="-26" y="-68" width="44" height="9" rx="4.5" fill="#c9607f" />
      <!-- Oreja de adelante -->
      <path d="M44 -52 Q 58 -96 80 -54 Z" fill="#ffc9d6" stroke="#ffc9d6" stroke-width="6" stroke-linejoin="round" />
      <path d="M52 -56 Q 60 -80 72 -58 Z" fill="#f29bb4" />
      <!-- Hocico, ojo y mejilla -->
      <ellipse cx="88" cy="8" rx="17" ry="21" fill="#f7a9be" stroke="#e98aa6" stroke-width="2" />
      <ellipse cx="87" cy="0" rx="3" ry="4.5" fill="#b8506f" />
      <ellipse cx="87" cy="16" rx="3" ry="4.5" fill="#b8506f" />
      <circle cx="50" cy="-18" r="6.5" fill="#3a1f2b" />
      <circle cx="52" cy="-20.5" r="2.2" fill="#ffffff" />
      <ellipse cx="52" cy="10" rx="11" ry="6.5" fill="#f07ea0" fill-opacity="0.45" />
    </g>

    <!-- Insignias, tarjetas y billete: solo en la versión completa -->
    <template v-if="!compacta">
    <g class="lp-flotar">
      <circle cx="116" cy="116" r="28" :fill="`url(#${uid}Tarjeta)`" stroke="#f6d77a" stroke-opacity="0.7" stroke-width="2" />
      <circle cx="116" cy="116" r="15" :fill="`url(#${uid}Moneda)`" />
      <text x="116" y="122" text-anchor="middle" font-size="16" font-weight="800" fill="#9a6b12" font-family="inherit">$</text>
    </g>
    <g class="lp-flotar" style="animation-delay: 1.2s">
      <circle cx="64" cy="284" r="24" :fill="`url(#${uid}Tarjeta)`" stroke="#6fcf97" stroke-opacity="0.6" stroke-width="2" />
      <!-- Escudo: el dinero está seguro -->
      <path d="M64 272 l11 4 v7 c0 7 -5 11 -11 14 c-6 -3 -11 -7 -11 -14 v-7 Z" fill="none" stroke="#b9f0cc" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M59 284 l4 4 l7 -8" fill="none" stroke="#b9f0cc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <g class="lp-flotar" style="animation-delay: 2s">
      <circle cx="496" cy="294" r="24" :fill="`url(#${uid}Tarjeta)`" stroke="#6fcf97" stroke-opacity="0.6" stroke-width="2" />
      <!-- Tendencia al alza -->
      <path d="M484 304 l8 -8 l6 5 l11 -12" fill="none" stroke="#b9f0cc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M503 289 h6 v6" fill="none" stroke="#b9f0cc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Tarjeta: ahorro del grupo -->
    <g class="lp-flotar" style="animation-delay: 0.6s">
      <rect x="400" y="62" width="136" height="80" rx="14" :fill="`url(#${uid}Tarjeta)`" stroke="#6fcf97" stroke-opacity="0.45" stroke-width="1.5" />
      <text x="414" y="84" font-size="10" font-weight="700" letter-spacing="1" fill="#9fd9b1" font-family="inherit">AHORRO</text>
      <text x="414" y="106" font-size="18" font-weight="800" fill="#ffffff" font-family="inherit">+18%</text>
      <rect v-for="(alto, i) in BARRAS_TARJETA" :key="'bt' + i" :x="480 + i * 10" :y="128 - alto" width="6" :height="alto" rx="2" fill="#6fcf97" :fill-opacity="0.4 + i * 0.12" />
      <rect x="414" y="118" width="54" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.15" />
      <rect x="414" y="128" width="36" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.1" />
    </g>

    <!-- Tarjeta: cuota pagada -->
    <g class="lp-flotar" style="animation-delay: 1.8s">
      <rect x="28" y="388" width="140" height="64" rx="14" :fill="`url(#${uid}Tarjeta)`" stroke="#6fcf97" stroke-opacity="0.45" stroke-width="1.5" />
      <circle cx="54" cy="420" r="13" fill="#6fcf97" fill-opacity="0.2" />
      <path d="M48 420 l4 4 l8 -8" fill="none" stroke="#b9f0cc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <text x="76" y="415" font-size="10" font-weight="700" letter-spacing="1" fill="#9fd9b1" font-family="inherit">CUOTA</text>
      <text x="76" y="432" font-size="13" font-weight="800" fill="#ffffff" font-family="inherit">Pagada</text>
    </g>

    <!-- Billete -->
    <g class="lp-flotar" style="animation-delay: 2.6s">
      <g transform="rotate(-10 462 420)">
        <rect x="412" y="396" width="100" height="50" rx="8" fill="#2f8a57" stroke="#9fd9b1" stroke-opacity="0.6" stroke-width="1.5" />
        <rect x="419" y="403" width="86" height="36" rx="5" fill="none" stroke="#b9f0cc" stroke-opacity="0.35" stroke-width="1.2" />
        <circle cx="462" cy="421" r="11" fill="#b9f0cc" fill-opacity="0.25" />
        <text x="462" y="426" text-anchor="middle" font-size="13" font-weight="800" fill="#e9f6ec" font-family="inherit">$</text>
      </g>
    </g>

    <!-- Chispas -->
    <g fill="#f6d77a">
      <circle class="lp-titilar" cx="196" cy="84" r="2.5" />
      <circle class="lp-titilar" cx="376" cy="470" r="2.5" style="animation-delay: 1.4s" />
      <circle class="lp-titilar" cx="524" cy="200" r="2" style="animation-delay: 0.8s" />
      <circle class="lp-titilar" cx="40" cy="190" r="2" style="animation-delay: 2.2s" />
    </g>
    </template>
  </svg>
</template>

<script>
// Cuenta las instancias montadas (ver `uid`).
let instancias = 0
</script>

<script setup>
import { onMounted, ref } from 'vue'
import './animacionesPublico.css'

defineProps({
  /** Solo la alcancía en su disco, sin insignias alrededor: para espacios chicos (cabecera del login en el celular). */
  compacta: { type: Boolean, default: false },
  /** Disco de fondo translúcido y con el borde difuminado: en el login del celular la alcancía va sobre la escena verde y el disco sólido se veía como una mancha oscura. Las pantallas de carga lo dejan opaco. */
  discoTranslucido: { type: Boolean, default: false }
})

/*
 * Ids de los degradados, únicos por instancia: el login monta dos (la compacta del celular
 * y la de escritorio) y la pantalla de carga otra. Con ids repetidos el navegador usa los
 * de la primera, que puede estar en display: none, y las demás se quedan sin colores.
 * Contador del módulo y no useId: useId se repite entre apps montadas por separado.
 */
const uid = `alc${++instancias}-`

const BARRAS_TARJETA = [10, 16, 13, 22, 28]

const vivo = ref(false)
onMounted(() => { vivo.value = true })
</script>
