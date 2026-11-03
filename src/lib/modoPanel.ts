import { useEffect, useState } from 'react'

export type ModoPanel = 'claro' | 'oscuro' | 'auto'

const CLAVE = 'panel-modo'
const oscuroDelSistema = () => window.matchMedia('(prefers-color-scheme: dark)').matches

function leer(): ModoPanel {
  try {
    const v = localStorage.getItem(CLAVE)
    return v === 'claro' || v === 'oscuro' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function aplicar(modo: ModoPanel) {
  document.documentElement.classList.toggle('oscuro', modo === 'oscuro' || (modo === 'auto' && oscuroDelSistema()))
}

/** Claro, oscuro o el del sistema. Se recuerda en este navegador; index.html lo aplica antes de pintar. */
export function useModoPanel() {
  const [modo, setModo] = useState<ModoPanel>(leer)

  useEffect(() => {
    aplicar(modo)
    if (modo !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => aplicar('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [modo])

  function cambiar(next: ModoPanel) {
    setModo(next)
    try {
      if (next === 'auto') localStorage.removeItem(CLAVE)
      else localStorage.setItem(CLAVE, next)
    } catch {
      // Sin almacenamiento (ventana privada): el modo dura hasta recargar.
    }
  }

  return [modo, cambiar] as const
}
