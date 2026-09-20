import { computed, reactive, watch } from 'vue'

/**
 * Estado del botón flotante de soporte: si se muestra y dónde vive.
 *
 * El estado es de módulo (singleton) a propósito: el botón lo pinta el layout y
 * el interruptor vive en Configuración, y las dos piezas tienen que ver lo
 * mismo sin pasar props por media aplicación.
 *
 * La posición NO se guarda en píxeles. Un botón anclado a «x=1180» desaparece
 * al rotar el móvil o al abrir la app en una pantalla más pequeña. Se guarda el
 * lado al que está pegado y la altura como fracción (0 arriba, 1 abajo), que
 * sobrevive a cualquier cambio de tamaño.
 */

// La clave lleva versión a propósito: al cambiar la posición por defecto, quien
// ya tenía guardada la anterior seguiría viéndola. Subir la versión descarta lo
// guardado y devuelve a todos al sitio nuevo.
const CLAVE = 'natillerapp-soporte-boton-v2'

const POR_DEFECTO = {
  visible: true,
  lado: 'derecha',   // 'izquierda' | 'derecha'
  altura: 1,         // fracción del alto útil: 1 = abajo del todo
}

function leer() {
  try {
    // Limpieza de la versión anterior de la preferencia.
    localStorage.removeItem('natillerapp-soporte-boton')
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return { ...POR_DEFECTO }
    const guardado = JSON.parse(crudo)
    return {
      visible: typeof guardado.visible === 'boolean' ? guardado.visible : POR_DEFECTO.visible,
      lado: guardado.lado === 'izquierda' ? 'izquierda' : 'derecha',
      altura: Number.isFinite(guardado.altura) ? Math.min(1, Math.max(0, guardado.altura)) : POR_DEFECTO.altura,
    }
  } catch {
    // Modo privado o almacenamiento bloqueado: el botón sigue funcionando, solo
    // que no recuerda dónde lo dejaste.
    return { ...POR_DEFECTO }
  }
}

const estado = reactive(leer())

watch(
  () => ({ ...estado }),
  (valor) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(valor))
    } catch {
      // Ver arriba: no poder recordar la posición no puede romper la app.
    }
  },
  { deep: true },
)

export function useBotonSoporte() {
  return {
    estado,
    visible: computed(() => estado.visible),
    mostrar: () => { estado.visible = true },
    ocultar: () => { estado.visible = false },
    alternar: () => { estado.visible = !estado.visible },
    restablecerPosicion: () => {
      estado.lado = POR_DEFECTO.lado
      estado.altura = POR_DEFECTO.altura
    },
  }
}
