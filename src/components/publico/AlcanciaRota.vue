<template>
  <!--
    La alcancía de la marca (EscenaAlcancia), rota: para la página 404. Mismas formas y
    colores del cerdito, con los ojos en X, una grieta, ladeado, monedas regadas y
    estrellitas de mareo. Decorativa (aria-hidden); el ancho lo pone quien la usa.
    Las animaciones solo corren tras montar (`vivo`), como en la portada: el HTML
    pre-renderizado llega quieto.
  -->
  <svg viewBox="0 0 280 220" class="block h-auto select-none" :class="{ 'ar-vivo': vivo }" aria-hidden="true">
    <defs>
      <linearGradient id="arCerdo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffc9d6" />
        <stop offset="100%" stop-color="#f29bb4" />
      </linearGradient>
      <linearGradient id="arMoneda" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe49a" />
        <stop offset="100%" stop-color="#e9b949" />
      </linearGradient>
      <radialGradient id="arBrillo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#6fcf97" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#6fcf97" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Resplandor y sombra en el piso -->
    <circle cx="140" cy="118" r="104" fill="url(#arBrillo)" />
    <ellipse cx="140" cy="192" rx="96" ry="9" fill="#04110a" fill-opacity="0.45" />

    <!-- Monedas regadas (se le salieron al caer) -->
    <g>
      <ellipse cx="58" cy="190" rx="15" ry="5" fill="#c9952f" />
      <ellipse cx="58" cy="187" rx="15" ry="5" fill="url(#arMoneda)" />
    </g>
    <g transform="rotate(-18 222 180)">
      <circle cx="222" cy="180" r="13" fill="url(#arMoneda)" stroke="#c9952f" stroke-width="2" />
      <text x="222" y="185" text-anchor="middle" font-size="13" font-weight="800" fill="#9a6b12" font-family="inherit">$</text>
    </g>
    <circle class="ar-rodar" cx="250" cy="192" r="6" fill="url(#arMoneda)" stroke="#c9952f" stroke-width="1.5" />

    <!-- Cerdito ladeado: se fue de lado al caer -->
    <g transform="translate(140 122) rotate(-9)">
      <!-- Cola -->
      <path d="M-86 -6 c-16 -6 -24 8 -14 15 c9 6 17 -5 7 -11" fill="none" stroke="#f29bb4" stroke-width="5" stroke-linecap="round" />
      <!-- Patas -->
      <rect x="-60" y="34" width="26" height="40" rx="11" fill="#e98aa6" />
      <rect x="24" y="34" width="26" height="40" rx="11" fill="#e98aa6" />
      <!-- Oreja de atrás -->
      <path d="M26 -50 Q 34 -92 60 -60 Z" fill="#e98aa6" stroke="#e98aa6" stroke-width="6" stroke-linejoin="round" />
      <!-- Cuerpo -->
      <ellipse cx="0" cy="0" rx="90" ry="66" fill="url(#arCerdo)" />
      <ellipse cx="-32" cy="-30" rx="34" ry="15" fill="#ffffff" fill-opacity="0.35" transform="rotate(-18 -32 -30)" />
      <!-- Ranura -->
      <rect x="-26" y="-68" width="44" height="9" rx="4.5" fill="#c9607f" />
      <!-- Grieta: de la ranura hacia abajo, con un trocito saltado -->
      <path d="M-6 -59 L-14 -36 L2 -18 L-10 4 L6 24 L-2 44" fill="none" stroke="#b8506f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M2 -18 L16 -14 M-10 4 L-24 10" fill="none" stroke="#b8506f" stroke-width="2.5" stroke-linecap="round" />
      <path d="M-40 52 L-30 60 L-44 62 Z" fill="#e98aa6" />
      <!-- Oreja de adelante -->
      <path d="M44 -52 Q 58 -96 80 -54 Z" fill="#ffc9d6" stroke="#ffc9d6" stroke-width="6" stroke-linejoin="round" />
      <path d="M52 -56 Q 60 -80 72 -58 Z" fill="#f29bb4" />
      <!-- Hocico -->
      <ellipse cx="88" cy="8" rx="17" ry="21" fill="#f7a9be" stroke="#e98aa6" stroke-width="2" />
      <ellipse cx="87" cy="0" rx="3" ry="4.5" fill="#b8506f" />
      <ellipse cx="87" cy="16" rx="3" ry="4.5" fill="#b8506f" />
      <!-- Ojos en X: el de adelante y, más chico, el de atrás -->
      <g stroke="#3a1f2b" stroke-width="3.2" stroke-linecap="round">
        <path d="M43 -25 L57 -11 M57 -25 L43 -11" />
        <path d="M65 -27 L74 -18 M74 -27 L65 -18" stroke-width="2.6" />
      </g>
      <!-- Mejilla y boquita torcida -->
      <ellipse cx="52" cy="12" rx="11" ry="6.5" fill="#f07ea0" fill-opacity="0.45" />
      <path d="M62 30 q 6 -5 12 0" fill="none" stroke="#b8506f" stroke-width="2.4" stroke-linecap="round" />
    </g>

    <!-- Estrellitas de mareo sobre la cabeza (el grupo de fuera las sube; el de dentro gira) -->
    <g transform="translate(6 -14)">
    <g class="ar-mareo" fill="#f6d77a">
      <path d="M176 22 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" />
      <path d="M214 38 l2 5 5 1 -4 3 1 5 -4 -2 -4 2 1 -5 -4 -3 5 -1 Z" />
      <path d="M150 34 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 Z" />
    </g>
    </g>
  </svg>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const vivo = ref(false)
onMounted(() => { vivo.value = true })
</script>

<style scoped>
/* Las estrellitas giran alrededor de la cabeza y la moneda chica se balancea. */
.ar-vivo .ar-mareo {
  transform-box: view-box;
  transform-origin: 182px 36px;
  -webkit-animation: ar-mareo 3.2s linear infinite;
  animation: ar-mareo 3.2s linear infinite;
}
.ar-vivo .ar-rodar {
  transform-box: fill-box;
  transform-origin: center;
  -webkit-animation: ar-rodar 1.6s ease-in-out infinite alternate;
  animation: ar-rodar 1.6s ease-in-out infinite alternate;
}

@-webkit-keyframes ar-mareo {
  from { -webkit-transform: translate3d(0, 0, 0) rotate(0deg); }
  to { -webkit-transform: translate3d(0, 0, 0) rotate(360deg); }
}
@keyframes ar-mareo {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(0, 0, 0) rotate(360deg); }
}
@-webkit-keyframes ar-rodar {
  from { -webkit-transform: translate3d(-3px, 0, 0); }
  to { -webkit-transform: translate3d(3px, 0, 0); }
}
@keyframes ar-rodar {
  from { transform: translate3d(-3px, 0, 0); }
  to { transform: translate3d(3px, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .ar-vivo .ar-mareo,
  .ar-vivo .ar-rodar { -webkit-animation: none; animation: none; }
}
</style>
