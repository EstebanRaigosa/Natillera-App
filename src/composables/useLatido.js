import { onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabase'
import { detectIosPlatform } from './useIsIos'

/**
 * Latido de presencia: deja constancia de que este usuario está usando la app.
 *
 * Alimenta el panel de tráfico del superadministrador (quién está dentro, cuándo entró)
 * y, de paso, rellena `user_profiles.ultimo_acceso`, que llevaba existiendo sin que nadie
 * lo escribiera.
 *
 * Tres decisiones que importan:
 *
 *  · **Solo late con la pestaña visible.** Latir en segundo plano gastaría batería y datos
 *    para decir que alguien «está» cuando en realidad tiene el móvil en el bolsillo.
 *  · **Cada 2 minutos, no cada 30 segundos.** Con 59 usuarios, medio minuto son ~85.000
 *    escrituras al día en un proyecto de plan gratuito; dos minutos lo dejan en ~5.000 y
 *    la pantalla igual de viva, porque el panel da por conectado a quien latió hace menos
 *    de 3 minutos.
 *  · **Nunca rompe nada.** Si el latido falla —sin red, sin sesión, RLS— se traga el error
 *    y se reintenta al siguiente. Es telemetría: jamás debe estorbar al usuario.
 */

const INTERVALO_MS = 2 * 60 * 1000

export function useLatido(estaAutenticado) {
  let temporizador = null
  let latiendo = false

  async function latir() {
    if (latiendo) return
    if (typeof estaAutenticado === 'function' && !estaAutenticado()) return
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return

    latiendo = true
    try {
      await supabase.rpc('registrar_latido', {
        p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        p_plataforma: detectIosPlatform() ? 'ios' : (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent) ? 'android' : 'escritorio')
      })
    } catch {
      // Telemetría: un fallo aquí no puede afectar a lo que el usuario está haciendo.
    } finally {
      latiendo = false
    }
  }

  function arrancar() {
    parar()
    latir()
    temporizador = setInterval(latir, INTERVALO_MS)
  }

  function parar() {
    if (temporizador == null) return
    clearInterval(temporizador)
    temporizador = null
  }

  /*
   * Volver del segundo plano cuenta como actividad: si la pestaña estuvo oculta más de
   * diez minutos, este latido abre una sesión nueva y el historial registra el reingreso.
   */
  function alCambiarVisibilidad() {
    if (document.visibilityState === 'visible') arrancar()
    else parar()
  }

  onMounted(() => {
    if (typeof document === 'undefined') return
    document.addEventListener('visibilitychange', alCambiarVisibilidad)
    if (document.visibilityState === 'visible') arrancar()
  })

  onUnmounted(() => {
    parar()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }
  })

  return { latir }
}
