import { ChevronLeft, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { limpiarEnSegundoPlano } from '../../lib/archivos'
import { store } from '../../lib/store'
import { palabras } from '../../lib/vocab'
import { EmptyState } from './AdminApp'
import CategoryEditor from './CategoryEditor'
import { AdminSiteProvider, useAdmin } from './contexto'
import DesignEditor from './DesignEditor'
import LinksEditor from './LinksEditor'
import MenuEditor from './MenuEditor'
import ProfileEditor from './ProfileEditor'
import SettingsEditor from './SettingsEditor'
import { Estado } from './Sites'

/** Una página dentro del panel: selector de página arriba y una pestaña por cada cosa que se edita. */
export default function SiteAdmin() {
  const { siteId } = useParams()
  const { sites, setSites } = useAdmin()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const site = sites?.find((s) => s.id === siteId)

  if (!sites) return null
  if (!site) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-6">
        <EmptyState>
          Esta página ya no existe. <Link to="/admin" className="font-semibold text-tinta underline">Volver a Mis páginas</Link>
        </EmptyState>
      </main>
    )
  }

  const m = palabras(site.vocab)
  const base = `/admin/${site.id}`
  const tab = pathname.slice(base.length + 1).split('/')[0]

  async function update(patch: Parameters<typeof store.updateSite>[1]) {
    try {
      const saved = await store.updateSite(site!.id, patch)
      setSites((list) => list.map((s) => (s.id === saved.id ? saved : s)))
      // Foto de perfil, video o póster reemplazados: los anteriores se borran de Storage.
      if ('avatar_url' in patch || 'theme' in patch) limpiarEnSegundoPlano(site!.id)
      return saved
    } catch (e) {
      toast.error((e as Error).message)
      throw e
    }
  }

  const tabs = [
    ['botones', 'Botones'],
    ['catalogo', m.seccion],
    ['perfil', 'Perfil'],
    ['diseno', 'Diseño'],
    ['ajustes', 'Ajustes'],
  ]

  return (
    <AdminSiteProvider value={{ site, m, base, update }}>
      <div className="border-b border-linea bg-superficie">
        <div className="mx-auto max-w-6xl px-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin" aria-label="Mis páginas" title="Mis páginas" className="-ml-2 grid size-11 shrink-0 place-items-center rounded-xl text-gris transition-colors hover:bg-papel hover:text-tinta">
              <ChevronLeft size={20} />
            </Link>
            <label className="sr-only" htmlFor="cambiar-pagina">Página que editas</label>
            <select
              id="cambiar-pagina"
              value={site.id}
              onChange={(e) => navigate(`/admin/${e.target.value}/${tab || 'botones'}`)}
              className="min-h-11 max-w-[60vw] min-w-0 truncate rounded-xl border border-linea bg-superficie py-2 pr-8 pl-3 text-lg font-semibold focus:border-tinta focus:outline-none"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Estado published={site.published} />
            <a href={`#/${site.slug}`} target="_blank" rel="noopener" className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-papel">
              <ExternalLink size={17} /> <span className="hidden sm:inline">Ver página</span><span className="sr-only sm:hidden">Ver página (otra pestaña)</span>
            </a>
          </div>
          <nav className="no-scrollbar -mx-1 mt-1 flex gap-1 overflow-x-auto" aria-label="Secciones de la página">
            {tabs.map(([to, label]) => (
              <NavLink
                key={to}
                to={`${base}/${to}`}
                className={({ isActive }) =>
                  `relative shrink-0 px-4 py-3 text-[0.95rem] font-semibold whitespace-nowrap transition ${isActive ? 'text-tinta after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-resalte' : 'text-gris hover:text-tinta'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* key: al cambiar de página en el selector, cada editor arranca de cero con los datos de la otra. */}
      <main key={site.id} className={`mx-auto px-4 pt-6 pb-24 ${tab === 'diseno' ? 'max-w-6xl' : 'max-w-3xl'}`}>
        <Routes>
          <Route index element={<Navigate to="botones" replace />} />
          <Route path="botones" element={<LinksEditor />} />
          <Route path="catalogo" element={<MenuEditor />} />
          <Route path="catalogo/:categoryId" element={<CategoryEditor />} />
          <Route path="perfil" element={<ProfileEditor />} />
          <Route path="diseno" element={<DesignEditor />} />
          <Route path="ajustes" element={<SettingsEditor />} />
          <Route path="*" element={<Navigate to="botones" replace />} />
        </Routes>
      </main>
    </AdminSiteProvider>
  )
}
