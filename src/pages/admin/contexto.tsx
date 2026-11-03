import { createContext, useContext } from 'react'
import type { NewSite } from '../../lib/store'
import type { Site } from '../../lib/types'
import type { Palabras } from '../../lib/vocab'

/** Lista de todas las páginas (la carga el panel una vez y la comparten todas las pantallas). */
export interface AdminCtx {
  sites: Site[] | null
  setSites: (update: (list: Site[]) => Site[]) => void
  reloadSites: () => Promise<void>
}

/** La página que se está editando. */
export interface AdminSiteCtx {
  site: Site
  m: Palabras
  base: string // "/admin/<id>"
  /** Guarda cambios de la página (nombre, diseño, vocabulario…) y actualiza la lista. */
  update: (patch: Partial<NewSite>) => Promise<Site>
}

const Admin = createContext<AdminCtx | null>(null)
const AdminSite = createContext<AdminSiteCtx | null>(null)
export const AdminProvider = Admin.Provider
export const AdminSiteProvider = AdminSite.Provider

export function useAdmin(): AdminCtx {
  const ctx = useContext(Admin)
  if (!ctx) throw new Error('useAdmin fuera del panel')
  return ctx
}

export function useAdminSite(): AdminSiteCtx {
  const ctx = useContext(AdminSite)
  if (!ctx) throw new Error('useAdminSite fuera de una página')
  return ctx
}
