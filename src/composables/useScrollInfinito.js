import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

/**
 * Lista larga pintada por tandas, con un centinela al final que pide la siguiente
 * cuando se acerca. Sustituye al paginado por números: en un móvil, buscar «página 3»
 * con el pulgar es peor que seguir bajando.
 *
 * La lista completa se le pasa entera —ya está en memoria— y esto solo recorta **cuánto
 * se pinta**, que es lo que cuesta tiempo de render cuando hay cientos de filas. No
 * pagina la consulta: para eso hay que llevar búsqueda, orden y recuentos al servidor.
 *
 * El botón que acompaña al centinela no es decorativo: si el navegador no dispara el
 * observador (pestaña en segundo plano, o una lista más corta que el margen de
 * anticipación), sigue habiendo una forma de pedir la siguiente tanda.
 *
 * @param {import('vue').Ref<Array>} listaCompleta Todas las filas ya filtradas y ordenadas.
 * @param {{ porTanda?: number, margen?: string }} opciones Tamaño de tanda y `rootMargin`.
 */
export function useScrollInfinito(listaCompleta, { porTanda = 25, margen = '600px 0px' } = {}) {
  const todas = computed(() => listaCompleta.value || [])

  const cuantosMostrar = ref(porTanda)

  const mostrados = computed(() => todas.value.slice(0, cuantosMostrar.value))
  const hayMas = computed(() => cuantosMostrar.value < todas.value.length)
  /** Si la lista nunca pasó de una tanda, no hay nada que anunciar al final. */
  const huboVariasTandas = computed(() => todas.value.length > porTanda)

  const centinelaRef = ref(null)

  const cargarMas = () => {
    if (!hayMas.value) return
    cuantosMostrar.value = Math.min(cuantosMostrar.value + porTanda, todas.value.length)
    // El observador solo avisa cuando el centinela CRUZA el borde. Si al pintar la tanda
    // sigue dentro del margen —filas bajas, pantalla alta—, no llegaría un segundo aviso
    // y la lista se quedaría esperando un toque. Volver a observarlo fuerza otra
    // comprobación, y el propio margen corta la cadena: en cuanto el centinela queda
    // fuera, deja de pedir tandas.
    nextTick(volverAObservarCentinela)
  }

  /** Vuelta a la primera tanda: tras cambiar un filtro, seguir en la fila 400 no sirve. */
  const reiniciar = () => {
    cuantosMostrar.value = porTanda
  }

  // Se construye ya, no en `onMounted`: el watch de abajo puede dispararse antes de que
  // corran los hooks de montaje, y entonces el centinela se quedaría sin observar.
  const observador =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          entradas => { if (entradas.some(e => e.isIntersecting)) cargarMas() },
          { rootMargin: margen }
        )

  function volverAObservarCentinela() {
    const elemento = centinelaRef.value
    if (!elemento || !observador) return
    observador.unobserve(elemento)
    observador.observe(elemento)
  }

  // El centinela desaparece y reaparece con `v-if`, así que hay que reobservarlo cada vez.
  watch(centinelaRef, (elemento, anterior) => {
    if (anterior) observador?.unobserve(anterior)
    if (elemento) observador?.observe(elemento)
  })

  onUnmounted(() => observador?.disconnect())

  return {
    centinelaRef,
    mostrados,
    hayMas,
    huboVariasTandas,
    cargarMas,
    reiniciar,
    cuantosMostrar
  }
}
