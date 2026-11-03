import type { Theme } from './types'

export interface Plantilla {
  id: string
  nombre: string
  descripcion: string
  tema: Omit<Theme, 'plantilla' | 'fondo'> & { fondo: Omit<Theme['fondo'], 'video' | 'poster'> }
}

/**
 * Estilos listos para empezar. Al aplicar una, se cambian colores, fuentes, efecto, botones y aro de la foto;
 * el video y el póster de la página se conservan.
 */
export const PLANTILLAS: Plantilla[] = [
  {
    id: 'cobre-nocturno',
    nombre: 'Cobre nocturno',
    descripcion: 'Negro cálido y cobre, como luz de lámpara. La de Al Aire.',
    tema: {
      colores: { fondo: '#110d0a', fondo2: '#1d1712', fondo3: '#2b221b', acento: '#d97a42', acento2: '#e88b55', texto: '#f2eadf', textoSuave: '#b3a593', alerta: '#e8705e' },
      fuentes: { titulos: 'Cormorant Garamond', textos: 'Onest', precios: 'Fraunces', pesoTitulos: 600 },
      fondo: { efecto: 'luces', tinte: '#3a1d0c', tinteFuerza: 25, oscurecerInicio: 0, oscurecerCatalogo: 60 },
      botones: { estilo: 'vidrio', forma: 'pildora', difuminado: 47, sombra: 'marcada', tamano: 'normal' },
      avatar: { aro: 'fino', forma: 'circulo' },
    },
  },
  {
    id: 'oceano',
    nombre: 'Océano',
    descripcion: 'Azul de mar profundo con turquesa. La de Pez y Mar.',
    tema: {
      colores: { fondo: '#06121d', fondo2: '#0c1f30', fondo3: '#143049', acento: '#38bfc6', acento2: '#6fd6dc', texto: '#eaf5f8', textoSuave: '#a3bccb', alerta: '#ff8a7a' },
      fuentes: { titulos: 'Cormorant Garamond', textos: 'Onest', precios: 'Fraunces', pesoTitulos: 600 },
      fondo: { efecto: 'mar', tinte: '#0a3a5c', tinteFuerza: 25, oscurecerInicio: 30, oscurecerCatalogo: 75 },
      botones: { estilo: 'vidrio', forma: 'pildora', difuminado: 47, sombra: 'marcada', tamano: 'normal' },
      avatar: { aro: 'fino', forma: 'circulo' },
    },
  },
  {
    id: 'brasa',
    nombre: 'Brasa',
    descripcion: 'Rojo fuego y carbón, con chispas que suben. Para parrillas.',
    tema: {
      colores: { fondo: '#120a08', fondo2: '#221310', fondo3: '#331c17', acento: '#ef5a2f', acento2: '#ff8550', texto: '#fbeee6', textoSuave: '#c4a598', alerta: '#ffb347' },
      fuentes: { titulos: 'Oswald', textos: 'Work Sans', precios: 'Oswald', pesoTitulos: 600 },
      fondo: { efecto: 'brasas', tinte: '#4a1408', tinteFuerza: 30, oscurecerInicio: 15, oscurecerCatalogo: 65 },
      botones: { estilo: 'solido', forma: 'redondeado', difuminado: 30, sombra: 'flotante', tamano: 'normal' },
      avatar: { aro: 'degradado', forma: 'circulo' },
    },
  },
  {
    id: 'selva',
    nombre: 'Selva',
    descripcion: 'Verdes hondos y lima, con una aurora que se mueve.',
    tema: {
      colores: { fondo: '#08130e', fondo2: '#102219', fondo3: '#183326', acento: '#9fd356', acento2: '#c2ea84', texto: '#eef6ea', textoSuave: '#a4bba8', alerta: '#ff9a76' },
      fuentes: { titulos: 'Fraunces', textos: 'DM Sans', precios: 'Fraunces', pesoTitulos: 600 },
      fondo: { efecto: 'aurora', tinte: '#123d22', tinteFuerza: 25, oscurecerInicio: 15, oscurecerCatalogo: 65 },
      botones: { estilo: 'suave', forma: 'hoja', difuminado: 55, sombra: 'suave', tamano: 'normal' },
      avatar: { aro: 'doble', forma: 'circulo' },
    },
  },
  {
    id: 'cafe-de-origen',
    nombre: 'Café de origen',
    descripcion: 'Marrón tostado y crema, para cafés y panaderías.',
    tema: {
      colores: { fondo: '#16100c', fondo2: '#241a14', fondo3: '#34261d', acento: '#c8a27a', acento2: '#e0c29e', texto: '#f5ece2', textoSuave: '#b9a794', alerta: '#e98a6c' },
      fuentes: { titulos: 'Playfair Display', textos: 'Nunito', precios: 'Playfair Display', pesoTitulos: 600 },
      fondo: { efecto: 'bokeh', tinte: '#3b2412', tinteFuerza: 30, oscurecerInicio: 10, oscurecerCatalogo: 65 },
      botones: { estilo: 'borde', forma: 'pildora', difuminado: 40, sombra: 'suave', tamano: 'normal' },
      avatar: { aro: 'punteado', forma: 'circulo' },
    },
  },
  {
    id: 'pasteleria',
    nombre: 'Pastelería',
    descripcion: 'Rosa y crema con confeti, dulce y luminoso.',
    tema: {
      colores: { fondo: '#fff6f3', fondo2: '#ffe9e3', fondo3: '#f8d7cf', acento: '#c2416b', acento2: '#d9668b', texto: '#3a1f28', textoSuave: '#7a5562', alerta: '#b3261e' },
      fuentes: { titulos: 'Dancing Script', textos: 'Nunito', precios: 'Nunito', pesoTitulos: 700 },
      fondo: { efecto: 'confeti', tinte: '#ffd1dc', tinteFuerza: 20, oscurecerInicio: 35, oscurecerCatalogo: 80 },
      botones: { estilo: 'solido', forma: 'pildora', difuminado: 30, sombra: 'suave', tamano: 'normal' },
      avatar: { aro: 'historia', forma: 'circulo' },
    },
  },
  {
    id: 'carbon-y-oro',
    nombre: 'Carbón y oro',
    descripcion: 'Negro elegante con dorado bajo un cielo de estrellas. Para bares.',
    tema: {
      colores: { fondo: '#0b0b0c', fondo2: '#161617', fondo3: '#232325', acento: '#d4af37', acento2: '#e8c766', texto: '#f3f0e8', textoSuave: '#a9a49a', alerta: '#e5735f' },
      fuentes: { titulos: 'Cinzel', textos: 'Manrope', precios: 'Cinzel', pesoTitulos: 600 },
      fondo: { efecto: 'estrellas', tinte: '#1a1405', tinteFuerza: 20, oscurecerInicio: 20, oscurecerCatalogo: 70 },
      botones: { estilo: 'borde', forma: 'recto', difuminado: 40, sombra: 'brillo', tamano: 'normal' },
      avatar: { aro: 'giratorio', forma: 'circulo' },
    },
  },
  {
    id: 'neon-nocturno',
    nombre: 'Neón nocturno',
    descripcion: 'Violeta eléctrico y cuadrícula retro. Para discotecas y gamers.',
    tema: {
      colores: { fondo: '#0a0614', fondo2: '#150d26', fondo3: '#21143b', acento: '#ff3ec8', acento2: '#4de4ff', texto: '#f4efff', textoSuave: '#b6a8d6', alerta: '#ffcf4d' },
      fuentes: { titulos: 'Righteous', textos: 'Outfit', precios: 'Righteous', pesoTitulos: 400 },
      fondo: { efecto: 'cuadricula', tinte: '#3a0a5c', tinteFuerza: 30, oscurecerInicio: 20, oscurecerCatalogo: 70 },
      botones: { estilo: 'neon', forma: 'suave', difuminado: 35, sombra: 'brillo', tamano: 'normal' },
      avatar: { aro: 'pulso', forma: 'circulo' },
    },
  },
  {
    id: 'claro-minimal',
    nombre: 'Claro minimal',
    descripcion: 'Fondo claro y limpio, con acento azul tinta.',
    tema: {
      colores: { fondo: '#f6f5f2', fondo2: '#ffffff', fondo3: '#e9e6e0', acento: '#1f4fd1', acento2: '#3f6ae0', texto: '#16181d', textoSuave: '#5c6170', alerta: '#b3261e' },
      fuentes: { titulos: 'Outfit', textos: 'Inter', precios: 'Outfit', pesoTitulos: 600 },
      fondo: { efecto: 'ninguno', tinte: '#ffffff', tinteFuerza: 0, oscurecerInicio: 45, oscurecerCatalogo: 85 },
      botones: { estilo: 'solido', forma: 'redondeado', difuminado: 30, sombra: 'suave', tamano: 'normal' },
      avatar: { aro: 'ninguno', forma: 'redondeado' },
    },
  },
  {
    id: 'retro-pop',
    nombre: 'Retro pop',
    descripcion: 'Crema, rojo y bordes gruesos con sombra dura. Para hamburgueserías.',
    tema: {
      colores: { fondo: '#fff4e0', fondo2: '#ffe7bf', fondo3: '#ffd89a', acento: '#e63b2e', acento2: '#ff6b4a', texto: '#2b1a12', textoSuave: '#6b4e3d', alerta: '#b3261e' },
      fuentes: { titulos: 'Archivo Black', textos: 'Work Sans', precios: 'Archivo Black', pesoTitulos: 400 },
      fondo: { efecto: 'ondas', tinte: '#ffcf7a', tinteFuerza: 20, oscurecerInicio: 35, oscurecerCatalogo: 80 },
      botones: { estilo: 'relieve', forma: 'redondeado', difuminado: 0, sombra: 'ninguna', tamano: 'grande' },
      avatar: { aro: 'doble', forma: 'redondeado' },
    },
  },
]

export function temaDePlantilla(id: string, actual?: Theme): Theme {
  const p = PLANTILLAS.find((x) => x.id === id) ?? PLANTILLAS[1]
  return {
    ...structuredClone(p.tema),
    plantilla: p.id,
    fondo: { ...p.tema.fondo, video: actual?.fondo.video ?? null, poster: actual?.fondo.poster ?? null },
  }
}
