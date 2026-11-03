import { pilaDe } from '../../lib/fuentes'
import type { Theme } from '../../lib/types'

/**
 * Miniatura de cómo se ve una página con un diseño: fondo, título, botón de acento y un precio.
 * Usa los colores directos (no las variables), así varias miniaturas conviven en el panel.
 */
export default function Muestra({ theme, titulo, compacta, className = '' }: { theme: Theme; titulo: string; compacta?: boolean; className?: string }) {
  const c = theme.colores
  const forma = { pildora: '9999px', redondeado: '8px', suave: '4px', recto: '0', hoja: '10px 2px' }[theme.botones.forma] ?? '9999px'
  const solido = ['solido', 'degradado', 'relieve'].includes(theme.botones.estilo)
  return (
    <div
      aria-hidden
      className={`relative flex flex-col items-center justify-end overflow-hidden px-3 pb-3 text-center ${className}`}
      style={{ background: `radial-gradient(90% 60% at 85% 0%, ${c.acento}55, transparent 70%), ${c.fondo}`, color: c.texto }}
    >
      <span className="block w-full truncate leading-tight" style={{ fontFamily: pilaDe(theme.fuentes.titulos), fontWeight: theme.fuentes.pesoTitulos, fontSize: compacta ? '1.05rem' : '1.35rem' }}>
        {titulo}
      </span>
      <span className="mt-1 block text-[0.7rem]" style={{ fontFamily: pilaDe(theme.fuentes.textos), color: c.textoSuave }}>
        Carta · <span style={{ fontFamily: pilaDe(theme.fuentes.precios), color: c.acento }}>$25.000</span>
      </span>
      <span
        className="mt-2 block w-[78%] py-1 text-[0.68rem] font-semibold"
        style={{ borderRadius: forma, background: solido ? c.acento : `${c.acento}44`, color: solido ? c.fondo : c.texto, border: `1px solid ${c.acento}` }}
      >
        Ver más
      </span>
      {!compacta && (
        <span className="mt-1.5 block w-[78%] py-1 text-[0.68rem]" style={{ borderRadius: forma, background: solido ? c.fondo2 : `${c.texto}12`, border: `1px solid ${c.texto}26` }}>
          WhatsApp
        </span>
      )}
    </div>
  )
}
