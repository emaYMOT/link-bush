import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useModoPanel, type ModoPanel } from '../../lib/modoPanel'
import { store, type AdminSession } from '../../lib/store'
import type { Site } from '../../lib/types'
import { clearPublicCache } from '../../lib/useCached'
import { AdminProvider } from './contexto'
import Login from './Login'
import SiteAdmin from './SiteAdmin'
import Sites from './Sites'

export default function AdminApp() {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined)
  const [sites, setSitesState] = useState<Site[] | null>(null)

  useEffect(() => {
    document.documentElement.dataset.ruta = 'admin'
    document.title = 'Link Bush · Panel'
    store.getSession().then(setSession, () => setSession(null))
    // Al salir del panel, la página pública vuelve a pedir los datos recién editados.
    return () => {
      delete document.documentElement.dataset.ruta
      clearPublicCache()
    }
  }, [])

  const reloadSites = useCallback(async () => {
    try {
      setSitesState(await store.listSites())
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [])

  useEffect(() => {
    if (session) reloadSites()
  }, [session, reloadSites])

  async function signOut() {
    await store.signOut()
    setSession(null)
    setSitesState(null)
  }

  return (
    <div className="panel min-h-dvh bg-papel font-ui text-tinta">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '14px', fontWeight: 500, background: 'var(--color-superficie)', color: 'var(--color-tinta)', border: '1px solid var(--color-linea)' },
          duration: 3500,
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />
      {session === undefined ? null : session === null ? (
        <Login onSignedIn={setSession} />
      ) : (
        <AdminProvider value={{ sites, setSites: (update) => setSitesState((list) => (list ? update(list) : list)), reloadSites }}>
          <header className="sticky top-0 z-20 border-b border-linea bg-superficie/95 pt-[env(safe-area-inset-top)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5">
              <Link to="/admin" className="-ml-2 flex-1 rounded-xl px-2 py-1">
                <span className="block font-ui-display text-[1.35rem] leading-none">Link Bush</span>
                <span className="block text-xs text-gris">Panel de administración</span>
              </Link>
              <SelectorModo />
              <button type="button" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-gris transition-colors hover:bg-papel hover:text-tinta">
                <LogOut size={17} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </header>

          {store.mode === 'demo' && (
            <p className="mx-auto mt-4 max-w-6xl px-4">
              <span className="block rounded-xl bg-resalte/12 px-4 py-3 text-sm">
                <strong>Modo demo.</strong> Los cambios se guardan solo en este navegador. Cuando conectes Supabase se publicarán para todos.
              </span>
            </p>
          )}

          <Routes>
            <Route index element={<Sites />} />
            <Route path=":siteId/*" element={<SiteAdmin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminProvider>
      )}
    </div>
  )
}

const MODOS: [ModoPanel, string, typeof Sun][] = [
  ['claro', 'Claro', Sun],
  ['oscuro', 'Oscuro', Moon],
  ['auto', 'Automático (el del sistema)', Monitor],
]

/** Claro / Oscuro / Automático para el panel. La página pública no cambia. */
function SelectorModo() {
  const [modo, setModo] = useModoPanel()
  return (
    <div role="group" aria-label="Modo del panel" className="flex rounded-xl border border-linea p-0.5">
      {MODOS.map(([value, label, Icon]) => (
        <button
          key={value}
          type="button"
          aria-pressed={modo === value}
          aria-label={label}
          title={label}
          onClick={() => setModo(value)}
          className={`grid size-10 place-items-center rounded-[10px] transition-colors ${modo === value ? 'bg-tinta text-superficie' : 'text-gris hover:text-tinta'}`}
        >
          <Icon size={17} aria-hidden />
        </button>
      ))}
    </div>
  )
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-ui-display text-[2rem] leading-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-[52ch] text-gris">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-linea px-6 py-10 text-center text-gris">{children}</div>
}

/** Tarjeta blanca (o carbón en modo oscuro) de los formularios del panel. */
export function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-linea bg-superficie p-5 sm:p-7">
      {title && <h2 className="font-ui-display text-[1.45rem] leading-tight">{title}</h2>}
      {description && <p className="mt-1 text-sm text-gris">{description}</p>}
      <div className={title || description ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}
