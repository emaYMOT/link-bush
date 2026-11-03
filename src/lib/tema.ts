import { pesoCercano, pilaDe, urlFuentes } from './fuentes'
import type { Theme } from './types'

/** Opciones que llegaron después: una página guardada antes no las trae y toma estas. */
const POR_DEFECTO: Pick<Theme, 'botones' | 'avatar'> = {
  botones: { estilo: 'vidrio', forma: 'pildora', difuminado: 47, sombra: 'marcada', tamano: 'normal' },
  avatar: { aro: 'fino', forma: 'circulo' },
}

/** Completa un diseño guardado con las opciones que le falten. */
export function completarTema(t: Theme): Theme {
  return {
    ...t,
    botones: { ...POR_DEFECTO.botones, ...t.botones },
    avatar: { ...POR_DEFECTO.avatar, ...t.avatar },
  }
}

/**
 * El diseño de cada página se aplica escribiendo variables CSS en <html>.
 * Las clases de Tailwind (bg-noche, text-cobre…) ya usan esas variables, así que todo cambia a la vez.
 * Los nombres de las variables vienen de la plantilla original: "noche" es el fondo y "cobre" el acento.
 */
export function variablesDe(t: Theme): Record<string, string> {
  const c = t.colores
  return {
    '--color-noche': c.fondo,
    '--color-noche-2': c.fondo2,
    '--color-noche-3': c.fondo3,
    '--color-cobre': c.acento,
    '--color-cobre-2': c.acento2,
    '--color-cal': c.texto,
    '--color-niebla': c.textoSuave,
    '--color-grafiti': c.alerta,
    '--font-display': pilaDe(t.fuentes.titulos),
    '--font-sans': pilaDe(t.fuentes.textos),
    '--font-precio': pilaDe(t.fuentes.precios),
    '--peso-titulos': String(pesoCercano(t.fuentes.titulos, t.fuentes.pesoTitulos)),
    '--peso-precios': String(pesoCercano(t.fuentes.precios, 500)),
    '--desenfoque': `${Math.round((t.botones.difuminado ?? 47) * 0.3)}px`,
  }
}

let aplicadas: string[] = []

/** Pone (o quita, con null) el diseño de una página en el documento. */
export function aplicarTema(t: Theme | null) {
  const root = document.documentElement.style
  for (const name of aplicadas) root.removeProperty(name)
  aplicadas = []
  const link = document.getElementById('fuentes-pagina') as HTMLLinkElement | null
  const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]')
  if (!t) {
    link?.remove()
    return
  }
  for (const [name, value] of Object.entries(variablesDe(t))) {
    root.setProperty(name, value)
    aplicadas.push(name)
  }
  const href = urlFuentes([
    { nombre: t.fuentes.titulos, pesos: [t.fuentes.pesoTitulos] },
    { nombre: t.fuentes.textos, pesos: [400, 500, 600] },
    { nombre: t.fuentes.precios, pesos: [500] },
  ])
  if (link) {
    if (link.href !== href) link.href = href
  } else {
    const el = document.createElement('link')
    el.id = 'fuentes-pagina'
    el.rel = 'stylesheet'
    el.href = href
    document.head.appendChild(el)
  }
  meta?.setAttribute('content', t.colores.fondo)
}

// ---------------------------------------------------------------- Contraste (WCAG)

function canal(v: number) {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminancia(hex: string): number {
  const h = normalizarHex(hex) ?? '#000000'
  const n = parseInt(h.slice(1), 16)
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255)
}

/** 1 a 21. Texto normal necesita 4.5; títulos grandes y precios, 3. */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** "#abc" o "abc123" -> "#aabbcc" / "#abc123"; null si no es un color. */
export function normalizarHex(input: string): string | null {
  let v = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(v)) v = v.split('').map((ch) => ch + ch).join('')
  return /^[0-9a-f]{6}$/.test(v) ? `#${v}` : null
}

export function esClaro(hex: string) {
  return luminancia(hex) > 0.4
}
