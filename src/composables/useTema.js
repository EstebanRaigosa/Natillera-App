import { computed, ref } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * Tema claro / oscuro (docs/plan-modo-oscuro.md).
 *
 * Tres piezas deciden el tema que se pinta:
 *   1. La preferencia del usuario: 'claro', 'oscuro' o 'auto' (la del sistema).
 *   2. El sistema (`prefers-color-scheme`), que solo cuenta en 'auto'.
 *   3. Si la ruta actual ya está migrada (`meta.temaOscuro` en el router). Una vista
 *      sin migrar tiene colores fijos de modo claro: oscurecer el marco y los modales
 *      a su alrededor dejaría una mezcla ilegible, así que se pinta toda en claro
 *      hasta que se migre. El router avisa con `marcarRutaAdmiteOscuro()`.
 *
 * El resultado se escribe en <html data-tema="claro|oscuro">, en `color-scheme`
 * (controles nativos, autofill y pickers de iOS) y en <meta name="theme-color">
 * (barra de estado del iPhone y de Android).
 *
 * Estado a nivel de módulo: hay un solo documento, así que todos los que llamen
 * a `useTema()` comparten el mismo tema.
 */

export const PREFERENCIAS_TEMA = ['claro', 'oscuro', 'auto']

/** Preferencia elegida. También la lee el script en línea de index.html. */
const CLAVE_PREFERENCIA = 'natillerapp:tema'
/**
 * Último tema que se pintó. Lo lee el script en línea de index.html para el
 * primer pintado, antes de que exista el router: sin él se vería un destello
 * claro al abrir la app en oscuro.
 */
const CLAVE_EFECTIVO = 'natillerapp:tema-efectivo'
/** Mientras el modo oscuro no se libera, solo lo ve quien active esta clave. */
const CLAVE_PRUEBAS = 'natillerapp:tema-pruebas'

/**
 * Interruptor general. Oculto (2026-10-01): nadie ve «Apariencia» en Mi cuenta y la
 * app se pinta siempre en claro. Para probar el oscuro en un dispositivo, abrir la
 * app con `?tema-pruebas=1` (se desactiva con `?tema-pruebas=0`). Con true, todos
 * ven la opción, y la preferencia por defecto es 'claro' (PREFERENCIA_POR_DEFECTO).
 */
export const MODO_OSCURO_LIBERADO = false

/** Sin elección del usuario, la app va en claro (no sigue al dispositivo). */
export const PREFERENCIA_POR_DEFECTO = 'claro'

const COLOR_BARRA = { claro: '#1B5E37', oscuro: '#0f3d22' }

function leer(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null   // Safari en modo privado puede lanzar al tocar localStorage
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // Sin almacenamiento la preferencia dura lo que la pestaña: no es motivo de error.
  }
}

function preferenciaValida(valor) {
  return PREFERENCIAS_TEMA.includes(valor) ? valor : PREFERENCIA_POR_DEFECTO
}

const consultaSistema = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

const preferencia = ref(preferenciaValida(leer(CLAVE_PREFERENCIA)))
const sistemaOscuro = ref(!!consultaSistema?.matches)
const rutaAdmiteOscuro = ref(false)

const pruebasActivas = ref(leer(CLAVE_PRUEBAS) === '1')

const disponible = computed(() => MODO_OSCURO_LIBERADO || pruebasActivas.value)

const temaPreferido = computed(() => {
  if (preferencia.value === 'auto') return sistemaOscuro.value ? 'oscuro' : 'claro'
  return preferencia.value
})

const temaEfectivo = computed(() =>
  disponible.value && rutaAdmiteOscuro.value ? temaPreferido.value : 'claro')

function aplicar() {
  if (typeof document === 'undefined') return
  const tema = temaEfectivo.value
  const html = document.documentElement
  if (html.dataset.tema !== tema) html.dataset.tema = tema
  html.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'

  // Puede haber dos metas (uno por media query, ver index.html): con el usuario
  // forzando un modo, ambos deben decir lo mismo o iOS elige por el sistema.
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', COLOR_BARRA[tema])
  })
  escribir(CLAVE_EFECTIVO, tema)
}

let iniciado = false

/** Se llama una vez al arrancar (main.js), antes de montar la app. */
export function iniciarTema() {
  if (iniciado) return
  iniciado = true
  leerEnlaceDePruebas()
  // Listener de por vida de la app (no hay desmontaje que lo quite): un cambio
  // del modo del sistema con la app abierta debe verse al instante en 'auto'.
  const alCambiarSistema = (evento) => {
    sistemaOscuro.value = evento.matches
    aplicar()
  }
  // Safari < 14 solo tiene la API antigua (addListener) en MediaQueryList.
  if (consultaSistema?.addEventListener) consultaSistema.addEventListener('change', alCambiarSistema)
  else consultaSistema?.addListener?.(alCambiarSistema)
  aplicar()
}

/**
 * Enlace de pruebas: `?tema-pruebas=1` activa el modo oscuro en este
 * dispositivo y `?tema-pruebas=0` lo apaga. Existe porque en el celular no hay
 * consola a mano para tocar localStorage. Va antes de montar el router, así
 * que basta `history.replaceState` para quitar el parámetro: si se queda en la
 * dirección, cualquiera que reciba el enlace compartido lo activaría también.
 */
function leerEnlaceDePruebas() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const valor = url.searchParams.get('tema-pruebas')
  if (valor === null) return

  if (valor === '0') {
    pruebasActivas.value = false
    try { localStorage.removeItem(CLAVE_PRUEBAS) } catch { /* Safari privado */ }
  } else {
    pruebasActivas.value = true
    escribir(CLAVE_PRUEBAS, '1')
  }
  url.searchParams.delete('tema-pruebas')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

/** El router la llama en cada navegación con lo que diga `meta.temaOscuro`. */
export function marcarRutaAdmiteOscuro(admite) {
  rutaAdmiteOscuro.value = !!admite
  aplicar()
}

/**
 * Preferencia que viene de la base (user_profiles.tema) al iniciar sesión: manda
 * sobre la del dispositivo, para que el usuario la conserve al cambiar de equipo.
 */
export function aplicarPreferenciaGuardada(valor) {
  if (!PREFERENCIAS_TEMA.includes(valor)) return
  preferencia.value = valor
  escribir(CLAVE_PREFERENCIA, valor)
  aplicar()
}

/**
 * Al iniciar sesión, la preferencia guardada en la cuenta manda sobre la del
 * dispositivo. App.vue la llama cuando cambia el usuario de la sesión.
 */
export async function sincronizarTemaConCuenta(userId) {
  if (!userId) return
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tema')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (data?.tema) aplicarPreferenciaGuardada(data.tema)
  } catch {
    // Sin conexión o sin perfil: se queda la preferencia del dispositivo.
  }
}

/** Guarda la preferencia en la cuenta (para el argumento `guardarEnCuenta`). */
export async function guardarTemaEnCuenta(userId, valor) {
  if (!userId) return
  const { error } = await supabase.from('user_profiles').update({ tema: valor }).eq('id', userId)
  if (error) throw error
}

export function useTema() {
  /** Cambia la preferencia; `guardarEnCuenta` la sube a user_profiles. */
  async function cambiarTema(valor, guardarEnCuenta) {
    const nueva = preferenciaValida(valor)
    preferencia.value = nueva
    escribir(CLAVE_PREFERENCIA, nueva)
    aplicar()
    if (guardarEnCuenta) await guardarEnCuenta(nueva)
  }

  return {
    preferencia,
    temaEfectivo,
    disponible,
    rutaAdmiteOscuro,
    cambiarTema,
  }
}
