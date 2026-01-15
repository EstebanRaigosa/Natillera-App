<template>
  <div class="h-screen flex items-center justify-center p-0 relative overflow-hidden bg-gradient-to-br from-natillera-900 via-natillera-800 to-emerald-900">
    <!-- Fondo verde mate para móvil (sin gradiente animado) -->
    <div class="lg:hidden absolute inset-0 bg-gradient-to-br from-natillera-700 via-emerald-700 to-teal-700"></div>
    
    <!-- Gráfico abstracto como fondo completo (solo desktop) -->
    <div class="hidden lg:block absolute inset-0 bg-gradient-to-br from-natillera-900 via-emerald-900 to-teal-900 overflow-hidden perspective-3d">
        <!-- Fondo base con gradiente animado y efecto de profundidad (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 bg-gradient-to-br from-natillera-800 via-emerald-800 to-teal-800 animate-gradient-shift"></div>
        
        <!-- Capa de profundidad con efecto parallax (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 transform-gpu" style="transform: translateZ(-100px) scale(1.1);">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-teal-900/30 animate-pulse-slow"></div>
        </div>
        
        <!-- Capa de formas geométricas abstractas con animaciones mejoradas - desenfocadas en segundo plano (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 transform-gpu animate-float-3d" style="filter: blur(20px); opacity: 0.7;">
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <!-- Formas geométricas grandes con efectos de neón mejorados -->
            <g opacity="0.8">
              <!-- Círculo grande animado con rotación 3D y pulso muy suave -->
              <circle cx="300" cy="200" r="150" fill="url(#neonGradient1)" filter="url(#glow)" class="animate-float-3d">
                <animate attributeName="r" values="150;200;170;150" dur="16s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.6;0.8;0.9" dur="12s" repeatCount="indefinite" />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 300 200; 180 300 200; 360 300 200"
                  dur="60s"
                  repeatCount="indefinite"
                />
              </circle>
              
              <!-- Forma orgánica ondulante con movimiento fluido y muy suave -->
              <path d="M0,400 Q300,200 600,400 T1200,400 L1200,800 L0,800 Z" fill="url(#neonGradient2)" opacity="0.8" filter="url(#glow)" class="animate-morph">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 120,60; -50,30; 0,0"
                  dur="40s"
                  repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0.6;0.9;0.75;0.6" dur="16s" repeatCount="indefinite" />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1,1; 1.05,1.03; 0.98,1; 1,1"
                  dur="32s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              </path>
              
              <!-- Onda superior con movimiento muy suave -->
              <path d="M0,100 Q200,50 400,100 T800,100 Q1000,150 1200,100 L1200,0 L0,0 Z" fill="url(#neonGradient3)" opacity="0.7" filter="url(#glow)" class="animate-wave-disruptive">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -100,0; 40,0; 0,0"
                  dur="36s"
                  repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0.5;0.8;0.65;0.5" dur="14s" repeatCount="indefinite" />
              </path>
              
              <!-- Forma diagonal con rotación 3D muy suave -->
              <polygon points="800,0 1200,0 1200,600 600,800" fill="url(#neonGradient4)" opacity="0.6" filter="url(#glow)" class="animate-rotate-3d">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 900 400; 8 900 400; -3 900 400; 0 900 400"
                  dur="36s"
                  repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0.4;0.7;0.55;0.4" dur="20s" repeatCount="indefinite" />
              </polygon>
              
              <!-- Círculos pequeños con movimiento orbital muy suave -->
              <circle cx="900" cy="300" r="80" fill="url(#neonGradient5)" opacity="0.7" filter="url(#glow)" class="animate-orbit">
                <animate attributeName="cy" values="300;200;350;300" dur="28s" repeatCount="indefinite" />
                <animate attributeName="cx" values="900;950;850;900" dur="36s" repeatCount="indefinite" />
                <animate attributeName="r" values="80;100;75;80" dur="18s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="1000" cy="600" r="60" fill="url(#neonGradient6)" opacity="0.8" filter="url(#glow)" class="animate-orbit-delayed">
                <animate attributeName="cx" values="1000;1100;900;1000" dur="32s" repeatCount="indefinite" />
                <animate attributeName="cy" values="600;550;650;600" dur="32s" repeatCount="indefinite" />
                <animate attributeName="r" values="60;80;55;60" dur="14s" repeatCount="indefinite" />
              </circle>
              
              <!-- Círculo adicional con movimiento orbital muy lento -->
              <circle cx="500" cy="500" r="100" fill="url(#neonGradient1)" opacity="0.6" filter="url(#glow)" class="animate-spin-fast">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 500 500; 180 500 500; 360 500 500"
                  dur="80s"
                  repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0.4;0.8;0.6;0.4" dur="12s" repeatCount="indefinite" />
                <animate attributeName="r" values="100;120;95;100" dur="20s" repeatCount="indefinite" />
              </circle>
              
              <!-- Líneas de energía con movimiento muy suave -->
              <line x1="200" y1="0" x2="200" y2="800" stroke="url(#lineGradient)" stroke-width="3" opacity="0.5" filter="url(#glow)" class="animate-energy-pulse">
                <animate attributeName="opacity" values="0.2;0.7;0.4;0.2" dur="10s" repeatCount="indefinite" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 10,0; -10,0; 0,0"
                  dur="12s"
                  repeatCount="indefinite"
                />
                <animate attributeName="stroke-width" values="3;4;2.5;3" dur="10s" repeatCount="indefinite" />
              </line>
              <line x1="600" y1="0" x2="600" y2="800" stroke="url(#lineGradient)" stroke-width="2" opacity="0.4" filter="url(#glow)" class="animate-energy-pulse-delayed">
                <animate attributeName="opacity" values="0.1;0.6;0.3;0.1" dur="12s" repeatCount="indefinite" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -15,0; 15,0; 0,0"
                  dur="16s"
                  repeatCount="indefinite"
                />
              </line>
              
              <!-- Línea diagonal con efecto de energía muy suave -->
              <line x1="0" y1="0" x2="1200" y2="800" stroke="url(#lineGradient)" stroke-width="2" opacity="0.3" filter="url(#glow)" class="animate-energy-flow">
                <animate attributeName="opacity" values="0.1;0.5;0.25;0.1" dur="14s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="2;3;1.8;2" dur="16s" repeatCount="indefinite" />
              </line>
              
              <!-- Formas adicionales con movimiento muy suave -->
              <ellipse cx="700" cy="150" rx="120" ry="80" fill="url(#neonGradient2)" opacity="0.5" filter="url(#glow)" class="animate-squash-stretch">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 700 150; 30 700 150; -20 700 150; 0 700 150"
                  dur="44s"
                  repeatCount="indefinite"
                />
                <animate attributeName="rx" values="120;140;110;120" dur="24s" repeatCount="indefinite" />
                <animate attributeName="ry" values="80;90;75;80" dur="24s" repeatCount="indefinite" />
              </ellipse>
            </g>
            
            <!-- Gradientes neón vibrantes con animación -->
            <defs>
              <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1">
                  <animate attributeName="stop-opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" style="stop-color:#10b981;stop-opacity:0.9">
                  <animate attributeName="stop-opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1">
                  <animate attributeName="stop-opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#22c55e;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="neonGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#059669;stop-opacity:0.9" />
                <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="neonGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#15803d;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#047857;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#0f766e;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="neonGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#86efac;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="neonGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2dd4bf;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#10b981;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
              </linearGradient>
              
              <!-- Efecto de brillo/glow mejorado y más intenso -->
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <!-- Filtro de brillo ultra intenso -->
              <filter id="glowIntense" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        <!-- Partículas luminosas flotantes mejoradas con efecto 3D - desenfocadas en segundo plano (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 transform-gpu" style="filter: blur(15px); opacity: 0.6;">
          <!-- Partículas grandes con movimiento muy suave -->
          <div class="absolute top-1/4 left-1/4 w-56 h-56 bg-emerald-400/50 rounded-full blur-2xl animate-float-3d-pulse" style="animation-duration: 28s;"></div>
          <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-natillera-400/45 rounded-full blur-[50px] animate-float-3d-delayed" style="animation-duration: 36s;"></div>
          <div class="absolute bottom-1/4 left-1/2 w-52 h-52 bg-teal-400/50 rounded-full blur-2xl animate-float-3d-delayed-2" style="animation-duration: 44s;"></div>
          <div class="absolute top-3/4 right-1/4 w-48 h-48 bg-emerald-300/40 rounded-full blur-xl animate-float-3d" style="animation-duration: 32s;"></div>
          <div class="absolute top-1/3 left-1/3 w-44 h-44 bg-natillera-300/35 rounded-full blur-2xl animate-float-3d-delayed" style="animation-duration: 40s; animation-delay: 6s;"></div>
          <div class="absolute bottom-1/3 right-1/3 w-50 h-50 bg-teal-300/40 rounded-full blur-2xl animate-float-3d" style="animation-duration: 48s; animation-delay: 4s;"></div>
          
          <!-- Partículas pequeñas brillantes con efecto muy suave -->
          <div class="absolute top-1/3 right-1/4 w-3 h-3 bg-emerald-300/60 rounded-full animate-twinkle-disruptive shadow-lg shadow-emerald-300/70" style="animation-duration: 10s;"></div>
          <div class="absolute top-2/3 left-1/3 w-2.5 h-2.5 bg-natillera-300/60 rounded-full animate-twinkle-disruptive shadow-lg shadow-natillera-300/70" style="animation-delay: 4s; animation-duration: 12s;"></div>
          <div class="absolute bottom-1/3 right-1/2 w-3 h-3 bg-teal-300/60 rounded-full animate-twinkle-disruptive shadow-lg shadow-teal-300/70" style="animation-delay: 8s; animation-duration: 14s;"></div>
          <div class="absolute top-1/2 left-1/4 w-2 h-2 bg-emerald-200/50 rounded-full animate-twinkle-disruptive shadow-md shadow-emerald-200/60" style="animation-delay: 2s; animation-duration: 11s;"></div>
          <div class="absolute bottom-1/2 right-1/3 w-3.5 h-3.5 bg-natillera-200/50 rounded-full animate-twinkle-disruptive shadow-lg shadow-natillera-200/70" style="animation-delay: 6s; animation-duration: 13s;"></div>
          <div class="absolute top-1/5 left-1/5 w-2 h-2 bg-emerald-400/50 rounded-full animate-twinkle-disruptive shadow-md" style="animation-delay: 3s; animation-duration: 10s;"></div>
          <div class="absolute bottom-2/5 right-1/5 w-2.5 h-2.5 bg-teal-400/50 rounded-full animate-twinkle-disruptive shadow-md" style="animation-delay: 5s; animation-duration: 12s;"></div>
          <div class="absolute top-4/5 left-2/3 w-2 h-2 bg-natillera-400/50 rounded-full animate-twinkle-disruptive shadow-md" style="animation-delay: 9s; animation-duration: 14s;"></div>
          
          <!-- Partículas que crecen -->
          <div class="absolute top-1/6 left-1/5 w-5 h-5 bg-emerald-300/65 rounded-full blur-[2px] animate-grow-slow shadow-lg shadow-emerald-300/60"></div>
          <div class="absolute top-2/5 right-1/4 w-6 h-6 bg-teal-300/65 rounded-full blur-[2px] animate-grow-slow-delayed shadow-lg shadow-teal-300/60"></div>
          <div class="absolute bottom-1/5 left-1/3 w-4.5 h-4.5 bg-natillera-300/65 rounded-full blur-[2px] animate-grow-slow-delayed-2 shadow-lg shadow-natillera-300/60"></div>
          <div class="absolute top-3/5 right-1/3 w-5.5 h-5.5 bg-emerald-400/60 rounded-full blur-[2px] animate-grow-slow shadow-lg" style="animation-delay: 3s;"></div>
          <div class="absolute bottom-2/5 left-2/5 w-4 h-4 bg-teal-400/60 rounded-full blur-[2px] animate-grow-slow-delayed shadow-lg" style="animation-delay: 5s;"></div>
          <div class="absolute top-1/4 right-1/5 w-5 h-5 bg-natillera-400/60 rounded-full blur-[2px] animate-grow-slow-delayed-2 shadow-lg" style="animation-delay: 7s;"></div>
          
          <!-- Partículas que se mueven horizontalmente a diferentes velocidades -->
          <div class="absolute top-1/5 w-4 h-4 bg-emerald-300/55 rounded-full blur-[2px] animate-move-horizontal-slow shadow-lg shadow-emerald-300/50"></div>
          <div class="absolute top-2/5 w-5 h-5 bg-teal-300/55 rounded-full blur-[2px] animate-move-horizontal-medium shadow-lg shadow-teal-300/50" style="animation-delay: 5s;"></div>
          <div class="absolute top-3/5 w-4.5 h-4.5 bg-natillera-300/55 rounded-full blur-[2px] animate-move-horizontal-slower shadow-lg shadow-natillera-300/50" style="animation-delay: 10s;"></div>
          <div class="absolute top-4/5 w-3.5 h-3.5 bg-emerald-400/50 rounded-full blur-[2px] animate-move-horizontal-slow shadow-lg" style="animation-delay: 8s;"></div>
          <div class="absolute top-1/6 w-5 h-5 bg-teal-400/50 rounded-full blur-[2px] animate-move-horizontal-medium shadow-lg" style="animation-delay: 12s;"></div>
          <div class="absolute top-5/6 w-4 h-4 bg-natillera-400/50 rounded-full blur-[2px] animate-move-horizontal-slower shadow-lg" style="animation-delay: 15s;"></div>
          
          <!-- Partículas que se mueven diagonalmente -->
          <div class="absolute w-4.5 h-4.5 bg-emerald-300/55 rounded-full blur-[2px] animate-move-diagonal-slow shadow-lg shadow-emerald-300/50"></div>
          <div class="absolute w-5 h-5 bg-teal-300/55 rounded-full blur-[2px] animate-move-diagonal-medium shadow-lg shadow-teal-300/50" style="animation-delay: 7s;"></div>
          <div class="absolute w-4 h-4 bg-natillera-300/55 rounded-full blur-[2px] animate-move-diagonal-slow shadow-lg shadow-natillera-300/50" style="animation-delay: 14s;"></div>
          
          <!-- Partículas que se mueven verticalmente -->
          <div class="absolute left-1/4 w-4 h-4 bg-emerald-400/50 rounded-full blur-[2px] animate-move-vertical-slow shadow-lg"></div>
          <div class="absolute left-1/2 w-5 h-5 bg-teal-400/50 rounded-full blur-[2px] animate-move-vertical-medium shadow-lg" style="animation-delay: 6s;"></div>
          <div class="absolute right-1/4 w-4.5 h-4.5 bg-natillera-400/50 rounded-full blur-[2px] animate-move-vertical-slow shadow-lg" style="animation-delay: 11s;"></div>
          <div class="absolute right-1/3 w-3.5 h-3.5 bg-emerald-300/50 rounded-full blur-[2px] animate-move-vertical-medium shadow-lg" style="animation-delay: 9s;"></div>
          
          <!-- Más partículas grandes en el lado derecho -->
          <div class="absolute top-1/5 right-1/6 w-60 h-60 bg-emerald-400/50 rounded-full blur-2xl animate-float-3d-pulse" style="animation-duration: 30s; animation-delay: 2s;"></div>
          <div class="absolute top-2/3 right-1/5 w-58 h-58 bg-teal-400/50 rounded-full blur-[50px] animate-float-3d-delayed" style="animation-duration: 38s; animation-delay: 8s;"></div>
          <div class="absolute bottom-1/5 right-1/4 w-54 h-54 bg-natillera-400/50 rounded-full blur-2xl animate-float-3d-delayed-2" style="animation-duration: 46s; animation-delay: 4s;"></div>
          <div class="absolute top-4/5 right-1/3 w-50 h-50 bg-emerald-300/45 rounded-full blur-xl animate-float-3d" style="animation-duration: 34s; animation-delay: 6s;"></div>
          
          <!-- Más partículas pequeñas brillantes en el lado derecho -->
          <div class="absolute top-1/4 right-1/6 w-3.5 h-3.5 bg-emerald-300/65 rounded-full animate-twinkle-disruptive shadow-lg shadow-emerald-300/70" style="animation-duration: 11s; animation-delay: 1s;"></div>
          <div class="absolute top-3/5 right-1/5 w-3 h-3 bg-teal-300/65 rounded-full animate-twinkle-disruptive shadow-lg shadow-teal-300/70" style="animation-delay: 5s; animation-duration: 13s;"></div>
          <div class="absolute bottom-1/4 right-1/6 w-4 h-4 bg-natillera-300/65 rounded-full animate-twinkle-disruptive shadow-lg shadow-natillera-300/70" style="animation-delay: 7s; animation-duration: 15s;"></div>
          <div class="absolute top-1/2 right-1/8 w-2.5 h-2.5 bg-emerald-200/55 rounded-full animate-twinkle-disruptive shadow-md shadow-emerald-200/60" style="animation-delay: 3s; animation-duration: 12s;"></div>
          <div class="absolute bottom-1/3 right-1/7 w-3.5 h-3.5 bg-teal-200/55 rounded-full animate-twinkle-disruptive shadow-lg shadow-teal-200/70" style="animation-delay: 9s; animation-duration: 14s;"></div>
          <div class="absolute top-2/5 right-1/9 w-2.5 h-2.5 bg-natillera-200/55 rounded-full animate-twinkle-disruptive shadow-md" style="animation-delay: 2s; animation-duration: 11s;"></div>
          
          <!-- Más partículas que crecen en el lado derecho -->
          <div class="absolute top-1/7 right-1/6 w-6 h-6 bg-emerald-300/70 rounded-full blur-[2px] animate-grow-slow shadow-lg shadow-emerald-300/60" style="animation-delay: 1s;"></div>
          <div class="absolute top-3/7 right-1/5 w-5.5 h-5.5 bg-teal-300/70 rounded-full blur-[2px] animate-grow-slow-delayed shadow-lg shadow-teal-300/60" style="animation-delay: 3s;"></div>
          <div class="absolute bottom-1/6 right-1/4 w-5 h-5 bg-natillera-300/70 rounded-full blur-[2px] animate-grow-slow-delayed-2 shadow-lg shadow-natillera-300/60" style="animation-delay: 5s;"></div>
          <div class="absolute top-4/7 right-1/7 w-6.5 h-6.5 bg-emerald-400/65 rounded-full blur-[2px] animate-grow-slow shadow-lg" style="animation-delay: 4s;"></div>
          <div class="absolute bottom-2/6 right-1/5 w-4.5 h-4.5 bg-teal-400/65 rounded-full blur-[2px] animate-grow-slow-delayed shadow-lg" style="animation-delay: 6s;"></div>
          <div class="absolute top-2/7 right-1/8 w-5.5 h-5.5 bg-natillera-400/65 rounded-full blur-[2px] animate-grow-slow-delayed-2 shadow-lg" style="animation-delay: 8s;"></div>
          
          <!-- Partículas que se mueven desde la derecha hacia la izquierda -->
          <div class="absolute top-1/7 right-0 w-4 h-4 bg-emerald-300/60 rounded-full blur-[2px] animate-move-horizontal-reverse-slow shadow-lg shadow-emerald-300/50"></div>
          <div class="absolute top-2/7 right-0 w-5 h-5 bg-teal-300/60 rounded-full blur-[2px] animate-move-horizontal-reverse-medium shadow-lg shadow-teal-300/50" style="animation-delay: 3s;"></div>
          <div class="absolute top-3/7 right-0 w-4.5 h-4.5 bg-natillera-300/60 rounded-full blur-[2px] animate-move-horizontal-reverse-slower shadow-lg shadow-natillera-300/50" style="animation-delay: 6s;"></div>
          <div class="absolute top-4/7 right-0 w-3.5 h-3.5 bg-emerald-400/55 rounded-full blur-[2px] animate-move-horizontal-reverse-slow shadow-lg" style="animation-delay: 9s;"></div>
          <div class="absolute top-5/7 right-0 w-5 h-5 bg-teal-400/55 rounded-full blur-[2px] animate-move-horizontal-reverse-medium shadow-lg" style="animation-delay: 12s;"></div>
          <div class="absolute top-6/7 right-0 w-4 h-4 bg-natillera-400/55 rounded-full blur-[2px] animate-move-horizontal-reverse-slower shadow-lg" style="animation-delay: 15s;"></div>
          
          <!-- Partículas que se mueven diagonalmente desde la derecha -->
          <div class="absolute top-0 right-1/6 w-4.5 h-4.5 bg-emerald-300/60 rounded-full blur-[2px] animate-move-diagonal-reverse-slow shadow-lg shadow-emerald-300/50"></div>
          <div class="absolute top-0 right-1/4 w-5 h-5 bg-teal-300/60 rounded-full blur-[2px] animate-move-diagonal-reverse-medium shadow-lg shadow-teal-300/50" style="animation-delay: 4s;"></div>
          <div class="absolute bottom-0 right-1/5 w-4 h-4 bg-natillera-300/60 rounded-full blur-[2px] animate-move-diagonal-reverse-slow shadow-lg shadow-natillera-300/50" style="animation-delay: 8s;"></div>
          <div class="absolute top-0 right-1/3 w-3.5 h-3.5 bg-emerald-400/55 rounded-full blur-[2px] animate-move-diagonal-reverse-medium shadow-lg" style="animation-delay: 12s;"></div>
          
          <!-- Partículas en la parte superior moviéndose de derecha a izquierda -->
          <div class="absolute top-4 right-0 w-6 h-6 bg-emerald-400/75 rounded-full shadow-xl shadow-emerald-400/50 animate-move-top-right-to-left-fast"></div>
          <div class="absolute top-8 right-0 w-5 h-5 bg-teal-400/75 rounded-full shadow-xl shadow-teal-400/50 animate-move-top-right-to-left-medium" style="animation-delay: 2s;"></div>
          <div class="absolute top-12 right-0 w-7 h-7 bg-natillera-400/75 rounded-full shadow-xl shadow-natillera-400/50 animate-move-top-right-to-left-slow" style="animation-delay: 4s;"></div>
          <div class="absolute top-16 right-0 w-4 h-4 bg-emerald-300/70 rounded-full shadow-lg shadow-emerald-300/50 animate-move-top-right-to-left-fast" style="animation-delay: 1s;"></div>
          <div class="absolute top-20 right-0 w-6 h-6 bg-teal-300/70 rounded-full shadow-xl shadow-teal-300/50 animate-move-top-right-to-left-medium" style="animation-delay: 3s;"></div>
          <div class="absolute top-24 right-0 w-5 h-5 bg-natillera-300/70 rounded-full shadow-lg shadow-natillera-300/50 animate-move-top-right-to-left-fast" style="animation-delay: 5s;"></div>
          <div class="absolute top-28 right-0 w-8 h-8 bg-emerald-500/80 rounded-full shadow-2xl shadow-emerald-500/60 animate-move-top-right-to-left-slower" style="animation-delay: 6s;"></div>
          <div class="absolute top-32 right-0 w-5 h-5 bg-teal-500/80 rounded-full shadow-xl shadow-teal-500/60 animate-move-top-right-to-left-medium" style="animation-delay: 7s;"></div>
          <div class="absolute top-36 right-0 w-6 h-6 bg-natillera-500/80 rounded-full shadow-xl shadow-natillera-500/60 animate-move-top-right-to-left-fast" style="animation-delay: 8s;"></div>
          <div class="absolute top-40 right-0 w-4 h-4 bg-emerald-400/70 rounded-full shadow-lg animate-move-top-right-to-left-slow" style="animation-delay: 9s;"></div>
          <div class="absolute top-44 right-0 w-7 h-7 bg-teal-400/75 rounded-full shadow-xl shadow-teal-400/50 animate-move-top-right-to-left-medium" style="animation-delay: 10s;"></div>
          <div class="absolute top-48 right-0 w-5 h-5 bg-natillera-400/70 rounded-full shadow-lg animate-move-top-right-to-left-fast" style="animation-delay: 11s;"></div>
          
          <!-- Más partículas verticales en el lado derecho -->
          <div class="absolute right-1/6 w-4 h-4 bg-emerald-400/55 rounded-full blur-[2px] animate-move-vertical-slow shadow-lg" style="animation-delay: 2s;"></div>
          <div class="absolute right-1/5 w-5 h-5 bg-teal-400/55 rounded-full blur-[2px] animate-move-vertical-medium shadow-lg" style="animation-delay: 7s;"></div>
          <div class="absolute right-1/7 w-4.5 h-4.5 bg-natillera-400/55 rounded-full blur-[2px] animate-move-vertical-slow shadow-lg" style="animation-delay: 13s;"></div>
          <div class="absolute right-1/8 w-3.5 h-3.5 bg-emerald-300/55 rounded-full blur-[2px] animate-move-vertical-medium shadow-lg" style="animation-delay: 10s;"></div>
          <div class="absolute right-1/9 w-4 h-4 bg-teal-300/55 rounded-full blur-[2px] animate-move-vertical-slow shadow-lg" style="animation-delay: 5s;"></div>
          
          <!-- Partículas muy pequeñas con movimiento rápido -->
          <div class="absolute top-1/8 left-1/8 w-1 h-1 bg-emerald-400/70 rounded-full animate-twinkle-disruptive shadow-md shadow-emerald-400/60" style="animation-duration: 4s; animation-delay: 0.5s;"></div>
          <div class="absolute top-1/6 left-1/6 w-1.5 h-1.5 bg-natillera-400/70 rounded-full animate-twinkle-disruptive shadow-md shadow-natillera-400/60" style="animation-duration: 5s; animation-delay: 1s;"></div>
          <div class="absolute top-2/5 left-1/7 w-1 h-1 bg-teal-400/70 rounded-full animate-twinkle-disruptive shadow-md shadow-teal-400/60" style="animation-duration: 4.5s; animation-delay: 1.5s;"></div>
          <div class="absolute top-3/5 left-1/9 w-1.5 h-1.5 bg-emerald-300/70 rounded-full animate-twinkle-disruptive shadow-md" style="animation-duration: 5.5s; animation-delay: 2s;"></div>
          <div class="absolute top-4/5 left-1/8 w-1 h-1 bg-natillera-300/70 rounded-full animate-twinkle-disruptive shadow-md" style="animation-duration: 4.2s; animation-delay: 0.8s;"></div>
          <div class="absolute top-1/4 right-1/7 w-1.5 h-1.5 bg-teal-300/70 rounded-full animate-twinkle-disruptive shadow-md" style="animation-duration: 5.2s; animation-delay: 2.5s;"></div>
          <div class="absolute top-2/3 right-1/9 w-1 h-1 bg-emerald-400/70 rounded-full animate-twinkle-disruptive shadow-md" style="animation-duration: 4.8s; animation-delay: 1.2s;"></div>
          <div class="absolute top-3/4 right-1/8 w-1.5 h-1.5 bg-natillera-400/70 rounded-full animate-twinkle-disruptive shadow-md" style="animation-duration: 5.8s; animation-delay: 3s;"></div>
          
          <!-- Partículas medianas con movimiento variado -->
          <div class="absolute top-1/7 left-1/4 w-7 h-7 bg-emerald-300/50 rounded-full blur-[3px] animate-float-3d shadow-lg shadow-emerald-300/40" style="animation-duration: 22s; animation-delay: 1s;"></div>
          <div class="absolute top-2/7 right-1/4 w-8 h-8 bg-teal-300/50 rounded-full blur-[3px] animate-float-3d-delayed shadow-lg shadow-teal-300/40" style="animation-duration: 26s; animation-delay: 3s;"></div>
          <div class="absolute bottom-1/7 left-1/3 w-7.5 h-7.5 bg-natillera-300/50 rounded-full blur-[3px] animate-float-3d-delayed-2 shadow-lg shadow-natillera-300/40" style="animation-duration: 30s; animation-delay: 5s;"></div>
          <div class="absolute top-4/7 left-1/5 w-6.5 h-6.5 bg-emerald-400/45 rounded-full blur-[3px] animate-float-3d shadow-lg" style="animation-duration: 24s; animation-delay: 2s;"></div>
          <div class="absolute bottom-2/7 right-1/3 w-8.5 h-8.5 bg-teal-400/45 rounded-full blur-[3px] animate-float-3d-delayed shadow-lg" style="animation-duration: 28s; animation-delay: 4s;"></div>
          <div class="absolute top-5/7 left-2/5 w-7 h-7 bg-natillera-400/45 rounded-full blur-[3px] animate-float-3d-delayed-2 shadow-lg" style="animation-duration: 32s; animation-delay: 6s;"></div>
          
          <!-- Partículas muy grandes con movimiento muy lento -->
          <div class="absolute top-1/3 left-1/6 w-72 h-72 bg-emerald-400/35 rounded-full blur-[60px] animate-float-3d-pulse" style="animation-duration: 50s; animation-delay: 5s;"></div>
          <div class="absolute bottom-1/3 right-1/6 w-80 h-80 bg-teal-400/35 rounded-full blur-[70px] animate-float-3d-delayed" style="animation-duration: 58s; animation-delay: 10s;"></div>
          <div class="absolute top-2/3 left-2/3 w-76 h-76 bg-natillera-400/35 rounded-full blur-[65px] animate-float-3d-delayed-2" style="animation-duration: 54s; animation-delay: 7s;"></div>
          <div class="absolute bottom-1/4 right-1/5 w-70 h-70 bg-emerald-300/30 rounded-full blur-[55px] animate-float-3d" style="animation-duration: 52s; animation-delay: 12s;"></div>
          <div class="absolute top-1/4 left-3/4 w-74 h-74 bg-teal-300/30 rounded-full blur-[60px] animate-float-3d-pulse" style="animation-duration: 56s; animation-delay: 8s;"></div>
          
          <!-- Partículas pequeñas rápidas que se mueven horizontalmente -->
          <div class="absolute top-1/9 w-2 h-2 bg-emerald-400/65 rounded-full blur-[1px] animate-move-horizontal-fast shadow-md shadow-emerald-400/50" style="animation-delay: 1s;"></div>
          <div class="absolute top-2/9 w-1.5 h-1.5 bg-teal-400/65 rounded-full blur-[1px] animate-move-horizontal-fast shadow-md" style="animation-delay: 3s;"></div>
          <div class="absolute top-3/9 w-2.5 h-2.5 bg-natillera-400/65 rounded-full blur-[1px] animate-move-horizontal-fast shadow-md" style="animation-delay: 5s;"></div>
          <div class="absolute top-4/9 w-2 h-2 bg-emerald-300/65 rounded-full blur-[1px] animate-move-horizontal-fast shadow-md" style="animation-delay: 7s;"></div>
          <div class="absolute top-5/9 w-1.5 h-1.5 bg-teal-300/65 rounded-full blur-[1px] animate-move-horizontal-fast shadow-md" style="animation-delay: 9s;"></div>
          
          <!-- Partículas medianas rápidas que se mueven diagonalmente -->
          <div class="absolute w-6 h-6 bg-emerald-300/60 rounded-full blur-[2px] animate-move-diagonal-fast shadow-lg shadow-emerald-300/50" style="animation-delay: 2s;"></div>
          <div class="absolute w-5.5 h-5.5 bg-teal-300/60 rounded-full blur-[2px] animate-move-diagonal-fast shadow-lg" style="animation-delay: 4s;"></div>
          <div class="absolute w-6.5 h-6.5 bg-natillera-300/60 rounded-full blur-[2px] animate-move-diagonal-fast shadow-lg" style="animation-delay: 6s;"></div>
          <div class="absolute w-5 h-5 bg-emerald-400/55 rounded-full blur-[2px] animate-move-diagonal-fast shadow-lg" style="animation-delay: 8s;"></div>
          
          <!-- Partículas que crecen con diferentes velocidades -->
          <div class="absolute top-1/8 right-1/5 w-3 h-3 bg-emerald-400/70 rounded-full blur-[1px] animate-grow-fast shadow-md shadow-emerald-400/60" style="animation-delay: 0.5s;"></div>
          <div class="absolute top-3/8 left-1/5 w-3.5 h-3.5 bg-teal-400/70 rounded-full blur-[1px] animate-grow-fast shadow-md" style="animation-delay: 1.5s;"></div>
          <div class="absolute bottom-3/8 right-1/6 w-3 h-3 bg-natillera-400/70 rounded-full blur-[1px] animate-grow-fast shadow-md" style="animation-delay: 2.5s;"></div>
          <div class="absolute top-5/8 left-1/6 w-3.5 h-3.5 bg-emerald-300/70 rounded-full blur-[1px] animate-grow-fast shadow-md" style="animation-delay: 3.5s;"></div>
          <div class="absolute bottom-1/8 right-1/7 w-4 h-4 bg-teal-300/70 rounded-full blur-[1px] animate-grow-medium shadow-md" style="animation-delay: 4.5s;"></div>
          
          <!-- Partículas pequeñas que se mueven verticalmente rápidamente -->
          <div class="absolute left-1/6 w-2.5 h-2.5 bg-emerald-400/60 rounded-full blur-[1px] animate-move-vertical-fast shadow-md" style="animation-delay: 1s;"></div>
          <div class="absolute left-1/5 w-2 h-2 bg-teal-400/60 rounded-full blur-[1px] animate-move-vertical-fast shadow-md" style="animation-delay: 3s;"></div>
          <div class="absolute right-1/6 w-2.5 h-2.5 bg-natillera-400/60 rounded-full blur-[1px] animate-move-vertical-fast shadow-md" style="animation-delay: 5s;"></div>
          <div class="absolute left-1/4 w-2 h-2 bg-emerald-300/60 rounded-full blur-[1px] animate-move-vertical-fast shadow-md" style="animation-delay: 7s;"></div>
          <div class="absolute right-1/5 w-2.5 h-2.5 bg-teal-300/60 rounded-full blur-[1px] animate-move-vertical-fast shadow-md" style="animation-delay: 9s;"></div>
          
          <!-- Partículas muy grandes adicionales con movimiento extremadamente lento -->
          <div class="absolute top-1/5 left-1/7 w-66 h-66 bg-emerald-300/25 rounded-full blur-[55px] animate-float-3d" style="animation-duration: 60s; animation-delay: 15s;"></div>
          <div class="absolute bottom-1/5 right-1/7 w-68 h-68 bg-teal-300/25 rounded-full blur-[60px] animate-float-3d-delayed" style="animation-duration: 64s; animation-delay: 18s;"></div>
          <div class="absolute top-3/5 left-4/5 w-62 h-62 bg-natillera-300/25 rounded-full blur-[55px] animate-float-3d-delayed-2" style="animation-duration: 62s; animation-delay: 20s;"></div>
        </div>

        <!-- Efecto de grid animado con perspectiva 3D - desenfocado en segundo plano (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 opacity-12 animate-grid-pulse" style="background-image: linear-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.15) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(1000px) rotateX(60deg) translateZ(-200px); filter: blur(12px);"></div>
        
        <!-- Overlay de brillo superior e inferior con animación muy suave - desenfocado (solo desktop) -->
        <div class="hidden lg:block absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-emerald-400/25 via-emerald-400/15 to-transparent animate-glow-sweep" style="animation-duration: 16s; filter: blur(12px); opacity: 0.6;"></div>
        <div class="hidden lg:block absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-400/25 via-teal-400/15 to-transparent animate-glow-sweep" style="animation-duration: 20s; animation-delay: 4s; filter: blur(12px); opacity: 0.6;"></div>
        
        <!-- Efectos de brillo adicionales con movimiento muy suave - desenfocados (solo desktop) -->
        <div class="hidden lg:block absolute top-1/2 -left-4 w-2/5 h-1/3 bg-gradient-to-r from-transparent via-emerald-400/15 to-emerald-400/10 animate-sweep-left" style="animation-duration: 24s; filter: blur(10px); opacity: 0.5;"></div>
        <div class="hidden lg:block absolute bottom-1/2 -right-4 w-2/5 h-1/3 bg-gradient-to-l from-transparent via-teal-400/15 to-teal-400/10 animate-sweep-right" style="animation-duration: 28s; animation-delay: 6s; filter: blur(10px); opacity: 0.5;"></div>
        
        <!-- Efecto de ondas de energía muy suaves - desenfocadas (solo desktop) -->
        <div class="hidden lg:block absolute inset-0 opacity-20" style="filter: blur(15px);">
          <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-ripple" style="animation-delay: 0s; animation-duration: 16s;"></div>
          <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-ripple" style="animation-delay: 6s; animation-duration: 16s;"></div>
          <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-natillera-400/15 rounded-full blur-3xl animate-ripple" style="animation-delay: 12s; animation-duration: 16s;"></div>
        </div>
      </div>

    <!-- Formulario centrado sobre el fondo -->
    <div class="relative z-10 w-full flex flex-col justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <!-- Contenido del formulario -->
      <div class="w-full max-w-md mx-auto">
        <!-- Logo y título -->
        <div class="mb-4 sm:mb-5 animate-fade-in-up text-center">
          <div class="flex items-center justify-center gap-2.5 sm:gap-3 mb-1.5">
            <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-natillera-400 via-emerald-400 to-teal-400 rounded-xl sm:rounded-2xl shadow-2xl shadow-emerald-500/50 ring-4 ring-white/30 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]" style="text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.3);">NatillerApp</h1>
          </div>
          <p class="text-white/90 text-xs sm:text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] font-medium">Ahorro comunitario digital</p>
        </div>

        <!-- Formulario -->
        <div class="animate-fade-in-up stagger-1">
          <router-view />
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-white/80 mt-4 animate-fade-in-up stagger-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          Gestión transparente para tu comunidad 🌱
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

