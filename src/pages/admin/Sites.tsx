import { Copy, ExternalLink, Link2, Plus, QrCode, Store, Trash2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Field, focusFirstInvalid, TextInput } from '../../components/Field'
import Modal, { Button, CancelButton } from '../../components/Modal'
import { RowAction } from '../../components/SortableList'
import { cargarHoja, urlMuestras } from '../../lib/fuentes'
import { crearPagina, slugError, slugLibre, urlPublica } from '../../lib/paginas'
import { PLANTILLAS, temaDePlantilla } from '../../lib/plantillas'
import type { Site } from '../../lib/types'
import { slugify } from '../../lib/vocab'
import { DeleteSiteDialog, DuplicateDialog, QrDialog } from './acciones'
import { EmptyState, PageTitle } from './AdminApp'
import { useAdmin } from './contexto'
import Muestra from './Muestra'

type Accion = { tipo: 'qr' | 'duplicar' | 'eliminar'; site: Site }

/** "Mis páginas": todas las páginas, y el botón para crear una nueva. */
export default function Sites() {
  const { sites } = useAdmin()
  const [creating, setCreating] = useState(false)
  const [accion, setAccion] = useState<Accion | null>(null)

  // Las miniaturas usan las fuentes de cada página (solo las letras de sus nombres).
  useEffect(() => {
    if (!sites?.length) return
    const nombres = sites.flatMap((s) => [s.theme.fuentes.titulos, s.theme.fuentes.textos, s.theme.fuentes.precios])
    cargarHoja(urlMuestras(nombres, sites.map((s) => s.name).join('') + 'Carta·Vermás WhatsApp'))
  }, [sites])

  async function copyLink(site: Site) {
    try {
      await navigator.clipboard.writeText(urlPublica(site.slug))
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar. Ábrela y copia la dirección del navegador.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-24">
      <PageTitle
        title="Mis páginas"
        description="Cada negocio tiene su página con botones, carta o catálogo y su propio diseño. Entra a una para editarla."
        action={<Button onClick={() => setCreating(true)}><Plus size={19} /> Nueva página</Button>}
      />

      {sites && sites.length === 0 && <EmptyState>Todavía no tienes páginas. Crea la primera con «Nueva página».</EmptyState>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites?.map((site) => (
          <li key={site.id} className="flex flex-col overflow-hidden rounded-3xl border border-linea bg-superficie">
            <Link to={`/admin/${site.id}`} className="group block" aria-label={`Editar ${site.name}`}>
              <Muestra theme={site.theme} titulo={site.name} className="aspect-[16/10] transition group-hover:brightness-110" />
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/admin/${site.id}`} className="block truncate text-lg font-semibold hover:underline">{site.name}</Link>
                  <span className="block truncate text-sm text-gris">#/{site.slug}</span>
                </div>
                <Estado published={site.published} />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-linea pt-2">
                <Link to={`/admin/${site.id}`} className="mr-auto inline-flex min-h-11 items-center rounded-xl px-3 font-semibold transition-colors hover:bg-papel">Editar</Link>
                <a href={`#/${site.slug}`} target="_blank" rel="noopener" aria-label={`Ver ${site.name} (otra pestaña)`} title="Ver página" className="grid size-11 place-items-center rounded-xl transition-colors hover:bg-papel">
                  <ExternalLink size={18} />
                </a>
                <RowAction label="Copiar enlace" onClick={() => copyLink(site)}><Link2 size={18} /></RowAction>
                <RowAction label="Código QR" onClick={() => setAccion({ tipo: 'qr', site })}><QrCode size={18} /></RowAction>
                <RowAction label="Duplicar" onClick={() => setAccion({ tipo: 'duplicar', site })}><Copy size={18} /></RowAction>
                <RowAction danger label="Eliminar" onClick={() => setAccion({ tipo: 'eliminar', site })}><Trash2 size={18} /></RowAction>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {creating && sites && <NewSiteForm sites={sites} onClose={() => setCreating(false)} />}
      {accion?.tipo === 'qr' && <QrDialog site={accion.site} onClose={() => setAccion(null)} />}
      {accion?.tipo === 'duplicar' && <DuplicateDialog site={accion.site} onClose={() => setAccion(null)} />}
      {accion?.tipo === 'eliminar' && <DeleteSiteDialog site={accion.site} onClose={() => setAccion(null)} />}
    </main>
  )
}

export function Estado({ published }: { published: boolean }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${published ? 'bg-exito/12 text-exito' : 'bg-gris/15 text-gris'}`}>
      {published ? 'Publicada' : 'Borrador'}
    </span>
  )
}

const TIPOS = [
  ['restaurante', 'Restaurante o bar', 'Carta con platos', UtensilsCrossed],
  ['tienda', 'Tienda', 'Catálogo con productos y precio por libra, unidad o kilo', Store],
] as const

function NewSiteForm({ sites, onClose }: { sites: Site[]; onClose: () => void }) {
  const { reloadSites } = useAdmin()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [tipo, setTipo] = useState<Site['vocab']['tipo']>('restaurante')
  const [plantilla, setPlantilla] = useState(PLANTILLAS[0].id)
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    cargarHoja(urlMuestras(PLANTILLAS.flatMap((p) => [p.tema.fuentes.titulos, p.tema.fuentes.textos, p.tema.fuentes.precios]), PLANTILLAS.map((p) => p.nombre).join('') + 'Carta·Vermás WhatsApp'))
  }, [])

  const nameError = name.trim() ? '' : 'Escribe el nombre del negocio.'
  const error = slugError(slug, sites)

  function changeName(value: string) {
    setName(value)
    if (!slugTouched) setSlug(value.trim() ? slugLibre(value, sites) : '')
  }

  async function submit() {
    setTried(true)
    if (nameError || error) return focusFirstInvalid()
    setBusy(true)
    try {
      const site = await crearPagina({ name: name.trim(), slug, tipo, plantilla })
      await reloadSites()
      toast.success('Página creada en borrador')
      navigate(`/admin/${site.id}/perfil`)
    } catch (e) {
      toast.error((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      dirty={!!name}
      wide
      title="Nueva página"
      onClose={onClose}
      footer={
        <>
          <CancelButton />
          <Button onClick={submit} busy={busy} busyLabel="Creando…">Crear página</Button>
        </>
      }
    >
      <div className="space-y-6">
        <Field label="Nombre del negocio" error={tried ? nameError : ''}>
          <TextInput value={name} onChange={(e) => changeName(e.target.value)} placeholder="Pez y Mar" maxLength={60} autoFocus />
        </Field>
        <Field label="Dirección" hint={`Así queda el enlace: ${urlPublica(slug || '…')}`} error={tried || slugTouched ? error : ''}>
          <TextInput
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            autoCapitalize="off"
            placeholder="pez-y-mar"
          />
        </Field>

        <fieldset>
          <legend className="mb-2 font-medium">Tipo de negocio</legend>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map(([value, title, hint, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={tipo === value}
                onClick={() => setTipo(value)}
                className={`rounded-2xl border-2 p-3.5 text-left transition ${tipo === value ? 'border-resalte bg-resalte/10' : 'border-linea hover:border-tinta/30'}`}
              >
                <Icon size={20} aria-hidden />
                <span className="mt-2 block font-semibold">{title}</span>
                <span className="block text-sm text-gris">{hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gris">Define las palabras («carta» o «catálogo», «plato» o «producto»). Las puedes cambiar después en Ajustes.</p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium">Diseño para empezar</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLANTILLAS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={plantilla === p.id}
                onClick={() => setPlantilla(p.id)}
                className={`overflow-hidden rounded-2xl border-2 text-left transition ${plantilla === p.id ? 'border-resalte ring-2 ring-resalte/30' : 'border-linea hover:border-tinta/30'}`}
              >
                <Muestra compacta theme={temaDePlantilla(p.id)} titulo={p.nombre} className="aspect-[4/3] px-2! pb-2.5!" />
                <span className="block truncate px-2.5 py-1.5 text-sm font-semibold">{p.nombre}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gris">Colores, letras y botones. Todo se puede ajustar en la pestaña Diseño.</p>
        </fieldset>
      </div>
    </Modal>
  )
}
