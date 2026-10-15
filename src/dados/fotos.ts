import type { Item } from '../core/tipos'

/** Foto responsiva: os arquivos ficam em `${base}-${largura}.avif|webp` dentro de /public. */
export type Foto = {
  base: string
  larguras: number[]
  /** Dimensões do arquivo maior, para width/height (proporção, sem layout shift). */
  largura: number
  altura: number
  alt: string
  /** object-position do recorte, quando o centro da foto não é o melhor ponto. */
  foco?: string
}

// Fotos do site do TORRA (torra-cafe.pages.dev), renomeadas pelo que de fato mostram.
// Pacotes: ilustração gerada em scripts/pacote.html até existir foto do produto.
export const fotos = {
  ambiente: {
    base: '/img/ambiente-interior',
    larguras: [480, 800, 1200],
    largura: 1200,
    altura: 800,
    alt: 'Salão do TORRA em Pinheiros: balcão ao fundo, mesas de madeira e luz baixa',
  },
  espresso: {
    base: '/img/espresso',
    larguras: [480, 800, 1200],
    largura: 1200,
    altura: 800,
    alt: 'Espresso com crema dourada em xícara branca, visto de cima',
  },
  cappuccino: {
    base: '/img/cappuccino',
    larguras: [480, 800, 1200],
    largura: 1200,
    altura: 1800,
    alt: 'Dois cappuccinos com latte art sobre mesa de madeira',
    foco: 'center 30%',
  },
  latte: {
    base: '/img/latte',
    larguras: [480, 800, 1200],
    largura: 1200,
    altura: 1800,
    alt: 'Latte com arte em microespuma',
    foco: 'center 70%',
  },
  coldBrew: {
    base: '/img/cold-brew',
    larguras: [480, 800, 1200],
    largura: 1200,
    altura: 800,
    alt: 'Cold brew servido gelado, com casca de laranja',
  },
  pacoteMantiqueira: {
    base: '/img/pacote-mantiqueira',
    larguras: [480, 800],
    largura: 800,
    altura: 1000,
    alt: 'Pacote de 250 g do TORRA. Mantiqueira, rótulo creme',
  },
  pacoteCerrado: {
    base: '/img/pacote-cerrado',
    larguras: [480, 800],
    largura: 800,
    altura: 1000,
    alt: 'Pacote de 250 g do TORRA. Cerrado, rótulo dourado',
  },
} satisfies Record<string, Foto>

const porBase = new Map<string, Foto>(Object.values(fotos).map((foto) => [foto.base, foto]))

/** Foto do item a partir do caminho em `item.imagem`, se estiver registrada. */
export function fotoDoItem(item: Item): Foto | undefined {
  return item.imagem ? porBase.get(item.imagem) : undefined
}
