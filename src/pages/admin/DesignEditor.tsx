import { Eye, Film, Link2, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Avatar from '../../components/Avatar'
import { TextInput } from '../../components/Field'
import { EFECTOS, EfectoFondo } from '../../components/HeroBackground'
import { iconoSeccion, LinkIcon } from '../../lib/icons'
import ImageUpload from '../../components/ImageUpload'
import { Button, ConfirmDialog } from '../../components/Modal'
import { cargarHoja, fuente, pilaDe, urlFuentes } from '../../lib/fuentes'
import { PLANTILLAS, temaDePlantilla } from '../../lib/plantillas'
import { store, VIDEO_MAX_MB } from '../../lib/store'
import type { AroAvatar, EstiloBoton, FormaBoton, SombraBoton, Theme } from '../../lib/types'
import { normalizeUrl } from '../../lib/format'
import type { MensajeVistaPrevia } from '../SiteLayout'
import { Card, PageTitle } from './AdminApp'
import { useAdminSite } from './contexto'
import { ColorField, Contraste, FontPicker, Lienzo, Opciones, Rango } from './controles'
import Muestra from './Muestra'

const VIDEO_AVISO_MB = 8

const ESTILOS: { value: EstiloBoton; label: string; hint: string }[] = [
  { value: 'vidrio', label: 'Vidrio', hint: 'Translúcido, desenfoca el video' },
  { value: 'solido', label: 'Sólido', hint: 'Color lleno' },
  { value: 'borde', label: 'Borde', hint: 'Solo el contorno' },
  { value: 'degradado', label: 'Degradado', hint: 'Del acento al acento claro' },
  { value: 'neon', label: 'Neón', hint: 'Contorno que brilla' },
  { value: 'suave', label: 'Suave', hint: 'Tinte del acento, sin borde' },
  { value: 'minimal', label: 'Minimal', hint: 'Solo texto y una línea' },
  { value: 'relieve', label: 'Relieve', hint: 'Retro, con sombra dura' },
]
const FORMAS: { value: FormaBoton; label: string }[] = [
  { value: 'pildora', label: 'Píldora' },
  { value: 'redondeado', label: 'Redondeado' },
  { value: 'suave', label: 'Esquinas leves' },
  { value: 'recto', label: 'Recto' },
  { value: 'hoja', label: 'Hoja' },
]
const SOMBRAS: { value: SombraBoton; label: string }[] = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'suave', label: 'Suave' },
  { value: 'marcada', label: 'Marcada' },
  { value: 'flotante', label: 'Flotante' },
  { value: 'brillo', label: 'Brillo' },
]
const AROS: { value: AroAvatar; label: string }[] = [
  { value: 'ninguno', label: 'Sin aro' },
  { value: 'fino', label: 'Fino' },
  { value: 'doble', label: 'Doble' },
  { value: 'brillo', label: 'Brillo' },
  { value: 'degradado', label: 'Degradado' },
  { value: 'historia', label: 'Historia' },
  { value: 'giratorio', label: 'Giratorio' },
  { value: 'pulso', label: 'Pulso' },
  { value: 'punteado', label: 'Punteado' },
]

/** Un botón del inicio, dibujado con las mismas clases que la página pública. */
function BotonMuestra({ botones, acento, icono, texto, mini }: { botones: Theme['botones']; acento?: boolean; icono?: string; texto: string; mini?: boolean }) {
  return (
    <span
      className="boton pointer-events-none"
      data-estilo={botones.estilo}
      data-forma={botones.forma}
      data-sombra={botones.sombra}
      data-tamano={mini ? undefined : botones.tamano}
      data-acento={acento ? '' : undefined}
      style={mini ? { minHeight: '2.25rem', padding: '.35rem .75rem', fontSize: '.8rem' } : undefined}
    >
      {icono && !mini && <LinkIcon name={icono} size={20} className="icono" />}
      <span className="text-center">{texto}</span>
    </span>
  )
}

/** Pestaña Diseño: plantillas, colores, letras, fondo y botones, con vista previa en vivo. */
export default function DesignEditor() {
  const { site, m, update } = useAdminSite()
  const [saved, setSaved] = useState<Theme>(site.theme)
  const [draft, setDraft] = useState<Theme>(site.theme)
  const [busy, setBusy] = useState(false)
  const [plantilla, setPlantilla] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const wide = useMedia('(min-width: 1024px)')
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const setColores = (c: Partial<Theme['colores']>) => setDraft((d) => ({ ...d, colores: { ...d.colores, ...c } }))
  const setFuentes = (f: Partial<Theme['fuentes']>) => setDraft((d) => ({ ...d, fuentes: { ...d.fuentes, ...f } }))
  const setFondo = (f: Partial<Theme['fondo']>) => setDraft((d) => ({ ...d, fondo: { ...d.fondo, ...f } }))
  const setBotones = (b: Partial<Theme['botones']>) => setDraft((d) => ({ ...d, botones: { ...d.botones, ...b } }))
  const setAvatar = (a: Partial<Theme['avatar']>) => setDraft((d) => ({ ...d, avatar: { ...d.avatar, ...a } }))

  // Las tres fuentes elegidas, completas, para las muestras del panel.
  useEffect(() => {
    const f = draft.fuentes
    cargarHoja(urlFuentes([{ nombre: f.titulos, pesos: [f.pesoTitulos] }, { nombre: f.textos, pesos: [400, 600] }, { nombre: f.precios, pesos: [500] }]))
  }, [draft.fuentes])

  // Avisa antes de cerrar la pestaña del navegador con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function save() {
    setBusy(true)
    try {
      await update({ theme: draft })
      setSaved(draft)
      toast.success('Diseño guardado y publicado')
    } catch {
      // update ya mostró el error
    } finally {
      setBusy(false)
    }
  }

  const c = draft.colores
  const pesos = fuente(draft.fuentes.titulos).pesos.filter((p) => p >= 400 && p <= 800)
  const preview = <VistaPrevia theme={draft} />

  return (
    <>
      <PageTitle title="Diseño" description="Elige una plantilla y ajusta colores, letras, fondo y botones. Los cambios se ven en la vista previa al instante; se publican al guardar." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <Card title="Plantillas" description="Un punto de partida: cambia colores, letras, efecto y botones. El video y el póster se conservan.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlantilla(p.id)}
                  aria-pressed={draft.plantilla === p.id}
                  title={p.descripcion}
                  className={`overflow-hidden rounded-2xl border-2 text-left transition ${draft.plantilla === p.id ? 'border-resalte' : 'border-linea hover:border-tinta/30'}`}
                >
                  <Muestra compacta theme={temaDePlantilla(p.id)} titulo={site.name} className="aspect-[4/3] px-2! pb-2.5!" />
                  <span className="block truncate px-2.5 py-1.5 text-sm font-semibold">{p.nombre}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Colores" description="Toca la muestra para elegir, o escribe el código del color.">
            <div className="divide-y divide-linea">
              <ColorField label="Fondo" hint="El color de base de toda la página." value={c.fondo} onChange={(v) => setColores({ fondo: v })} />
              <ColorField label="Fondo de tarjetas" hint="Barras y tarjetas de las categorías." value={c.fondo2} onChange={(v) => setColores({ fondo2: v })} />
              <ColorField label="Fondo de realce" hint="Degradados y efectos de fondo." value={c.fondo3} onChange={(v) => setColores({ fondo3: v })} />
              <ColorField label="Acento" hint="Precios, botón principal y detalles." value={c.acento} onChange={(v) => setColores({ acento: v })} />
              <ColorField label="Acento claro" hint="Brillos y etiquetas sobre fotos." value={c.acento2} onChange={(v) => setColores({ acento2: v })} />
              <ColorField label="Texto" hint="Títulos y nombres." value={c.texto} onChange={(v) => setColores({ texto: v })} />
              <ColorField label="Texto suave" hint="Descripciones y textos secundarios." value={c.textoSuave} onChange={(v) => setColores({ textoSuave: v })} />
              <ColorField label="Agotado" hint="La etiqueta de agotado." value={c.alerta} onChange={(v) => setColores({ alerta: v })} />
            </div>
            <h3 className="mt-5 font-semibold">¿Se lee bien?</h3>
            <ul className="mt-1 divide-y divide-linea">
              <Contraste label="Texto sobre el fondo" texto={c.texto} fondo={c.fondo} minimo={4.5} />
              <Contraste label="Texto suave sobre el fondo" texto={c.textoSuave} fondo={c.fondo} minimo={4.5} />
              <Contraste label="Precios (acento) sobre el fondo" texto={c.acento} fondo={c.fondo} minimo={3} />
              <Contraste label="Texto sobre el acento (botones y categoría activa)" texto={c.fondo} fondo={c.acento} minimo={4.5} />
              <Contraste label="Agotado sobre el fondo" texto={c.alerta} fondo={c.fondo} minimo={4.5} />
            </ul>
          </Card>

          <Card title="Letras" description="Una para títulos, otra para los textos y otra para los precios.">
            <div className="grid gap-x-4 sm:grid-cols-3">
              <FontPicker label="Títulos" value={draft.fuentes.titulos} onChange={(v) => setFuentes({ titulos: v })} />
              <FontPicker label="Textos" value={draft.fuentes.textos} onChange={(v) => setFuentes({ textos: v })} />
              <FontPicker label="Precios" value={draft.fuentes.precios} onChange={(v) => setFuentes({ precios: v })} />
            </div>
            {pesos.length > 1 && (
              <div className="mt-4">
                <Opciones
                  legend="Grosor de los títulos"
                  columns={4}
                  value={pesos.includes(draft.fuentes.pesoTitulos) ? draft.fuentes.pesoTitulos : pesos[0]}
                  onChange={(v) => setFuentes({ pesoTitulos: v })}
                  options={pesos.map((p) => ({ value: p, label: { 400: 'Normal', 500: 'Medio', 600: 'Seminegrita', 700: 'Negrita', 800: 'Extra' }[p] ?? String(p) }))}
                />
              </div>
            )}
            <div className="mt-5 rounded-2xl p-5" style={{ background: c.fondo, color: c.texto }}>
              <p className="text-[2rem] leading-tight" style={{ fontFamily: pilaDe(draft.fuentes.titulos), fontWeight: draft.fuentes.pesoTitulos }}>{site.name}</p>
              <p className="mt-2" style={{ fontFamily: pilaDe(draft.fuentes.textos), color: c.textoSuave }}>Así se leen las descripciones de cada producto, con su letra.</p>
              <p className="mt-2 text-[1.35rem]" style={{ fontFamily: pilaDe(draft.fuentes.precios), color: c.acento, fontWeight: 500 }}>$25.000</p>
            </div>
          </Card>

          <Card title="Fondo" description="Un video que se repite detrás del inicio y de la carta. Mientras carga (o si no hay), se ve el póster o el efecto.">
            <VideoField value={draft.fondo.video} onChange={(video, poster) => setFondo(poster === undefined ? { video } : { video, poster })} />
            <div className="mt-5">
              <span className="mb-1.5 block font-medium">Póster (imagen de espera)</span>
              <ImageUpload wide siteId={site.id} folder="poster" value={draft.fondo.poster} onChange={(url) => setFondo({ poster: url })} />
              <span className="mt-1.5 block text-sm text-gris">Se crea solo al subir un video. Sin video, sirve como foto de fondo fija.</span>
            </div>
            <div className="mt-5">
              <Opciones
                legend="Efecto de fondo"
                columns={4}
                value={draft.fondo.efecto}
                onChange={(v) => setFondo({ efecto: v })}
                options={EFECTOS.map((e) => ({
                  ...e,
                  preview: (
                    <Lienzo theme={draft} className="mb-2 aspect-[4/3] rounded-xl">
                      <EfectoFondo tipo={e.value} />
                    </Lienzo>
                  ),
                }))}
              />
            </div>
            <div className="mt-4 divide-y divide-linea">
              <ColorField label="Tinte del video" hint="Le da al video el tono de la página." value={draft.fondo.tinte} onChange={(v) => setFondo({ tinte: v })} />
              <Rango label="Fuerza del tinte" value={draft.fondo.tinteFuerza} onChange={(v) => setFondo({ tinteFuerza: v })} />
              <Rango label="Velo en el inicio" hint="Funde el video con el fondo para que los botones resalten." value={draft.fondo.oscurecerInicio} onChange={(v) => setFondo({ oscurecerInicio: v })} />
              <Rango label={`Velo en ${site.vocab.generoSeccion === 'f' ? 'la' : 'el'} ${site.vocab.seccion.toLowerCase()}`} hint="Más alto = productos y precios más fáciles de leer." value={draft.fondo.oscurecerCatalogo} onChange={(v) => setFondo({ oscurecerCatalogo: v })} />
            </div>
          </Card>

          <Card title="Botones del inicio" description="Cada opción se ve con los colores de la página. Arriba, cómo quedan juntos.">
            <Lienzo theme={draft} className="rounded-2xl px-5 py-6">
              <EfectoFondo tipo={draft.fondo.efecto} />
              <div className="relative mx-auto flex max-w-sm flex-col gap-3">
                <BotonMuestra botones={draft.botones} acento icono={iconoSeccion(site.vocab.tipo)} texto={m.boton} />
                <BotonMuestra botones={draft.botones} icono="whatsapp" texto="Pedir por WhatsApp" />
              </div>
            </Lienzo>
            <div className="mt-5 space-y-5">
              <Opciones
                legend="Estilo"
                columns={4}
                value={draft.botones.estilo}
                onChange={(v) => setBotones({ estilo: v })}
                options={ESTILOS.map((e) => ({
                  ...e,
                  preview: (
                    <Lienzo theme={draft} className="mb-2 rounded-xl px-2.5 py-3">
                      <BotonMuestra mini botones={{ ...draft.botones, estilo: e.value }} acento texto="Ver" />
                    </Lienzo>
                  ),
                }))}
              />
              <Opciones
                legend="Forma"
                value={draft.botones.forma}
                onChange={(v) => setBotones({ forma: v })}
                options={FORMAS.map((f) => ({
                  ...f,
                  preview: (
                    <Lienzo theme={draft} className="mb-2 rounded-xl px-2.5 py-3">
                      <BotonMuestra mini botones={{ ...draft.botones, forma: f.value }} acento texto="Ver" />
                    </Lienzo>
                  ),
                }))}
              />
              <Opciones
                legend="Sombra"
                value={draft.botones.sombra}
                onChange={(v) => setBotones({ sombra: v })}
                options={SOMBRAS.map((s) => ({
                  ...s,
                  preview: (
                    <Lienzo theme={draft} className="mb-2 rounded-xl px-2.5 pt-3 pb-5">
                      <BotonMuestra mini botones={{ ...draft.botones, sombra: s.value }} acento texto="Ver" />
                    </Lienzo>
                  ),
                }))}
              />
              <Opciones
                legend="Tamaño"
                value={draft.botones.tamano}
                onChange={(v) => setBotones({ tamano: v })}
                options={[
                  { value: 'compacto', label: 'Compacto', hint: 'Caben más botones' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'grande', label: 'Grande', hint: 'Letra más grande' },
                ]}
              />
              <Rango
                label="Difuminado interior"
                hint="Cuánto desenfocan el video los botones translúcidos (vidrio, borde, neón, suave y degradado)."
                value={draft.botones.difuminado}
                onChange={(v) => setBotones({ difuminado: v })}
              />
            </div>
          </Card>

          <Card title="Foto de perfil" description="El aro que la rodea y su forma. «Sin aro» la deja limpia, sin borde.">
            <div className="space-y-5">
              <Opciones
                legend="Aro"
                columns={3}
                value={draft.avatar.aro}
                onChange={(v) => setAvatar({ aro: v })}
                options={AROS.map((a) => ({
                  ...a,
                  preview: (
                    <Lienzo theme={draft} className="mb-2 grid place-items-center rounded-xl py-5">
                      <Avatar src={site.avatar_url} name={site.name} size={64} avatar={{ ...draft.avatar, aro: a.value }} />
                    </Lienzo>
                  ),
                }))}
              />
              <Opciones
                legend="Forma de la foto"
                columns={2}
                value={draft.avatar.forma}
                onChange={(v) => setAvatar({ forma: v })}
                options={[
                  { value: 'circulo', label: 'Círculo' },
                  { value: 'redondeado', label: 'Cuadrada redondeada' },
                ]}
              />
            </div>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-linea bg-papel/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
            {dirty ? <span className="mr-auto text-sm text-gris">Cambios sin guardar</span> : <span className="mr-auto text-sm text-gris">Todo guardado</span>}
            {!wide && (
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye size={18} /> Vista previa</Button>
            )}
            {dirty && <Button variant="ghost" onClick={() => setDraft(saved)}>Descartar</Button>}
            <Button onClick={save} busy={busy} disabled={!dirty}>Guardar diseño</Button>
          </div>
        </div>

        {wide && <aside className="sticky top-6" aria-label="Vista previa">{preview}</aside>}
      </div>

      {!wide && previewOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/85 p-3 backdrop-blur" role="dialog" aria-modal="true" aria-label="Vista previa">
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={() => setPreviewOpen(false)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white/12 px-4 font-semibold text-white">
              <X size={18} /> Cerrar
            </button>
          </div>
          <div className="min-h-0 flex-1">{preview}</div>
        </div>
      )}

      <ConfirmDialog
        open={!!plantilla}
        title={`¿Usar la plantilla ${PLANTILLAS.find((p) => p.id === plantilla)?.nombre ?? ''}?`}
        message="Se reemplazan los colores, las letras, el efecto y los botones. El video y el póster se conservan. Lo puedes ajustar todo después; nada se publica hasta que guardes."
        confirmLabel="Usar plantilla"
        onClose={() => setPlantilla(null)}
        onConfirm={() => {
          if (plantilla) setDraft((d) => temaDePlantilla(plantilla, d))
          setPlantilla(null)
        }}
      />
    </>
  )
}

/** La página real en un marco de celular; recibe el diseño sin guardar por postMessage. */
function VistaPrevia({ theme }: { theme: Theme }) {
  const { site, m } = useAdminSite()
  const frame = useRef<HTMLIFrameElement>(null)
  const [pagina, setPagina] = useState<'inicio' | 'seccion'>('inicio')
  const latest = useRef(theme)
  latest.current = theme

  const send = () => frame.current?.contentWindow?.postMessage({ type: 'tema', theme: latest.current } satisfies MensajeVistaPrevia, location.origin)

  useEffect(send, [theme])
  useEffect(() => {
    const onMessage = (e: MessageEvent<MensajeVistaPrevia>) => {
      if (e.origin === location.origin && e.source === frame.current?.contentWindow && e.data?.type === 'listo') send()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const src = `${location.pathname}#/${site.slug}${pagina === 'seccion' ? `/${m.ruta}` : ''}`

  return (
    <div className="flex h-full flex-col items-center gap-3">
      <div role="group" aria-label="Página de la vista previa" className="flex rounded-xl border border-linea bg-superficie p-0.5">
        {([['inicio', 'Inicio'], ['seccion', m.seccion]] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={pagina === value}
            onClick={() => setPagina(value)}
            className={`min-h-10 rounded-[10px] px-4 text-sm font-semibold transition-colors ${pagina === value ? 'bg-tinta text-superficie' : 'text-gris hover:text-tinta'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="h-full max-h-[760px] min-h-[520px] w-full max-w-[380px] overflow-hidden rounded-[2.2rem] border-[6px] border-[#16181c] bg-black shadow-2xl lg:h-[min(760px,calc(100dvh-9rem))]">
        <iframe key={src} ref={frame} src={src} title={`Vista previa de ${site.name}`} className="h-full w-full" />
      </div>
      <p className="max-w-[380px] text-center text-xs text-gris">Puedes navegar dentro de la vista previa. Muestra el contenido guardado con el diseño que estás editando.</p>
    </div>
  )
}

/** Subir un video (con póster automático), pegar un enlace o quitarlo. */
function VideoField({ value, onChange }: { value: string | null; onChange: (video: string | null, poster?: string | null) => void }) {
  const { site } = useAdminSite()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState('')
  const [pegando, setPegando] = useState(false)
  const [enlace, setEnlace] = useState('')

  async function pick(file: File | undefined) {
    if (input.current) input.current.value = ''
    if (!file) return
    if (!file.type.startsWith('video/')) return toast.error('Ese archivo no es un video. Usa MP4 o WEBM.')
    const mb = file.size / 1024 / 1024
    if (mb > VIDEO_MAX_MB) return toast.error(`El video pesa ${mb.toFixed(1)} MB y el máximo es ${VIDEO_MAX_MB} MB. Comprímelo a 720p y vuelve a intentarlo.`)
    if (mb > VIDEO_AVISO_MB) toast(`El video pesa ${mb.toFixed(1)} MB. Funciona, pero carga lento en celulares y gasta más datos; lo ideal es 2–4 MB.`, { icon: '⚠️', duration: 7000 })
    try {
      setBusy('Subiendo video…')
      const video = await store.uploadVideo(file, site.id)
      setBusy('Creando póster…')
      const frame = await capturarPoster(file)
      const poster = frame ? await store.uploadImage(frame, site.id, 'poster') : undefined
      onChange(video, poster)
      toast.success('Video listo. Guarda el diseño para publicarlo.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div>
      <span className="mb-1.5 block font-medium">Video de fondo</span>
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-linea p-2">
          <video src={value} muted playsInline preload="metadata" className="h-20 w-14 shrink-0 rounded-lg bg-black object-cover" />
          <span className="min-w-0 flex-1 truncate text-sm text-gris">{value.split('/').pop()}</span>
          <button type="button" onClick={() => onChange(null)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-peligro transition-colors hover:bg-peligro/8">
            <Trash2 size={15} aria-hidden /> Quitar
          </button>
        </div>
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-linea px-4 py-4 text-sm text-gris">Sin video: se ve el póster o el efecto de fondo.</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => input.current?.click()} busy={!!busy} busyLabel={busy}><Film size={18} /> {value ? 'Cambiar video' : 'Subir video'}</Button>
        <Button variant="ghost" onClick={() => setPegando((v) => !v)}><Link2 size={18} /> Pegar enlace</Button>
      </div>
      {pegando && (
        <div className="mt-2 flex gap-2">
          <TextInput aria-label="Enlace del video (MP4 o WEBM)" value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://…/video.mp4" inputMode="url" autoCapitalize="off" />
          <Button
            onClick={() => {
              if (!/^https?:\/\/.+\..+/.test(normalizeUrl(enlace))) return toast.error('Pega un enlace directo al archivo de video (termina en .mp4 o .webm).')
              onChange(normalizeUrl(enlace))
              setEnlace('')
              setPegando(false)
            }}
          >
            Usar
          </Button>
        </div>
      )}
      <p className="mt-2 text-sm text-gris">MP4 horizontal o vertical, sin sonido, de 10 a 20 segundos. Ideal: 720p y menos de {VIDEO_AVISO_MB} MB (máximo {VIDEO_MAX_MB} MB).</p>
      <input ref={input} type="file" accept="video/mp4,video/webm" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}

/** Toma un cuadro del video (a 1 s) para usarlo como póster mientras carga. */
async function capturarPoster(file: File): Promise<File | null> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = url
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve
      video.onerror = reject
    })
    video.currentTime = Math.min(1, (video.duration || 0) / 10)
    await new Promise((resolve) => (video.onseeked = resolve))
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))
    return blob ? new File([blob], 'poster.webp', { type: 'image/webp' }) : null
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return matches
}
