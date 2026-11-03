import { createContext, useContext } from 'react'
import type { Site, Theme } from './types'
import type { Palabras } from './vocab'

/** La página pública que se está viendo, con su vocabulario y sus rutas. */
export interface SiteCtx {
  site: Site
  theme: Theme // el guardado, o el que manda el panel en la vista previa
  m: Palabras
  home: string // "/pez-y-mar"
  seccion: string // "/pez-y-mar/catalogo"
}

const Ctx = createContext<SiteCtx | null>(null)
export const SiteProvider = Ctx.Provider

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSite fuera de una página')
  return ctx
}
