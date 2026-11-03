/**
 * Fuentes de Google Fonts que se pueden elegir en el panel.
 * `pesos` son los grosores que existen de verdad: Google rechaza la petición entera si se pide uno que no existe.
 */
export interface Fuente {
  nombre: string
  grupo: 'Serif elegante' | 'Sans moderna' | 'Display' | 'Manuscrita'
  pesos: number[]
}

const rango = (desde: number, hasta: number) => Array.from({ length: (hasta - desde) / 100 + 1 }, (_, i) => desde + i * 100)

export const FUENTES: Fuente[] = [
  { nombre: 'Cormorant Garamond', grupo: 'Serif elegante', pesos: rango(300, 700) },
  { nombre: 'Playfair Display', grupo: 'Serif elegante', pesos: rango(400, 900) },
  { nombre: 'Fraunces', grupo: 'Serif elegante', pesos: rango(100, 900) },
  { nombre: 'DM Serif Display', grupo: 'Serif elegante', pesos: [400] },
  { nombre: 'Lora', grupo: 'Serif elegante', pesos: rango(400, 700) },
  { nombre: 'Libre Baskerville', grupo: 'Serif elegante', pesos: [400, 700] },
  { nombre: 'Cinzel', grupo: 'Serif elegante', pesos: rango(400, 900) },
  { nombre: 'Marcellus', grupo: 'Serif elegante', pesos: [400] },
  { nombre: 'Bodoni Moda', grupo: 'Serif elegante', pesos: rango(400, 900) },
  { nombre: 'Prata', grupo: 'Serif elegante', pesos: [400] },

  { nombre: 'Onest', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Inter', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Manrope', grupo: 'Sans moderna', pesos: rango(200, 800) },
  { nombre: 'Outfit', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'DM Sans', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Plus Jakarta Sans', grupo: 'Sans moderna', pesos: rango(200, 800) },
  { nombre: 'Montserrat', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Poppins', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Nunito', grupo: 'Sans moderna', pesos: rango(200, 900) },
  { nombre: 'Work Sans', grupo: 'Sans moderna', pesos: rango(100, 900) },
  { nombre: 'Figtree', grupo: 'Sans moderna', pesos: rango(300, 900) },

  { nombre: 'Bebas Neue', grupo: 'Display', pesos: [400] },
  { nombre: 'Anton', grupo: 'Display', pesos: [400] },
  { nombre: 'Oswald', grupo: 'Display', pesos: rango(200, 700) },
  { nombre: 'Archivo Black', grupo: 'Display', pesos: [400] },
  { nombre: 'Righteous', grupo: 'Display', pesos: [400] },
  { nombre: 'Abril Fatface', grupo: 'Display', pesos: [400] },
  { nombre: 'Syne', grupo: 'Display', pesos: rango(400, 800) },

  { nombre: 'Pacifico', grupo: 'Manuscrita', pesos: [400] },
  { nombre: 'Dancing Script', grupo: 'Manuscrita', pesos: rango(400, 700) },
  { nombre: 'Caveat', grupo: 'Manuscrita', pesos: rango(400, 700) },
  { nombre: 'Satisfy', grupo: 'Manuscrita', pesos: [400] },
  { nombre: 'Lobster', grupo: 'Manuscrita', pesos: [400] },
  { nombre: 'Great Vibes', grupo: 'Manuscrita', pesos: [400] },
]

export const GRUPOS = ['Serif elegante', 'Sans moderna', 'Display', 'Manuscrita'] as const

const RESPALDO: Record<Fuente['grupo'], string> = {
  'Serif elegante': 'Georgia, serif',
  'Sans moderna': 'system-ui, sans-serif',
  Display: 'Impact, system-ui, sans-serif',
  Manuscrita: 'cursive',
}

export function fuente(nombre: string): Fuente {
  return FUENTES.find((f) => f.nombre === nombre) ?? { nombre, grupo: 'Sans moderna', pesos: [400] }
}

/** Valor para font-family, con un respaldo parecido mientras carga. */
export function pilaDe(nombre: string): string {
  return `"${nombre}", ${RESPALDO[fuente(nombre).grupo]}`
}

/** El grosor disponible más cercano al pedido. */
export function pesoCercano(nombre: string, deseado: number): number {
  return fuente(nombre).pesos.reduce((best, p) => (Math.abs(p - deseado) < Math.abs(best - deseado) ? p : best))
}

/** Un solo enlace de Google Fonts con las familias y grosores que usa una página. */
export function urlFuentes(pedidos: { nombre: string; pesos: number[] }[]): string {
  const porFamilia = new Map<string, Set<number>>()
  for (const { nombre, pesos } of pedidos) {
    const disponibles = fuente(nombre).pesos
    const set = porFamilia.get(nombre) ?? new Set<number>()
    for (const p of pesos) set.add(disponibles.includes(p) ? p : pesoCercano(nombre, p))
    porFamilia.set(nombre, set)
  }
  const familias = [...porFamilia].map(([nombre, set]) => {
    const pesos = [...set].sort((a, b) => a - b)
    const nombreUrl = nombre.replace(/ /g, '+')
    return fuente(nombre).pesos.length === 1 ? `family=${nombreUrl}` : `family=${nombreUrl}:wght@${pesos.join(';')}`
  })
  return `https://fonts.googleapis.com/css2?${familias.join('&')}&display=swap`
}

/**
 * Para las muestras del panel: cada familia baja solo las letras del texto indicado (muy liviano).
 * Sin argumentos, todas las fuentes con las letras de sus propios nombres (para el selector).
 */
export function urlMuestras(nombres: string[] = FUENTES.map((f) => f.nombre), texto = nombres.join('')): string {
  const letras = [...new Set(texto + 'Aa$0123456789.')].join('')
  const familias = [...new Set(nombres)].map((n) => `family=${n.replace(/ /g, '+')}`)
  return `https://fonts.googleapis.com/css2?${familias.join('&')}&text=${encodeURIComponent(letras)}&display=swap`
}

/** Carga (una vez por URL) una hoja de Google Fonts en el panel. */
export function cargarHoja(href: string) {
  if (document.querySelector(`link[data-muestra][href="${CSS.escape(href)}"]`)) return
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = href
  el.dataset.muestra = ''
  document.head.appendChild(el)
}
