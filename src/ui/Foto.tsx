import type { Foto as DadosFoto } from '../dados/fotos'

type Props = {
  foto: DadosFoto
  /** Atributo sizes do srcset: quanto a foto ocupa na tela. */
  sizes: string
  className?: string
  /** Primeira dobra: carrega já e com prioridade. Fora dela, lazy. */
  prioridade?: boolean
}

/** <picture> com AVIF e WebP responsivos, width/height reais e lazy fora da primeira dobra. */
export function Foto({ foto, sizes, className = '', prioridade = false }: Props) {
  const srcSet = (formato: 'avif' | 'webp') => foto.larguras.map((l) => `${foto.base}-${l}.${formato} ${l}w`).join(', ')

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`${foto.base}-${foto.larguras[0]}.webp`}
        width={foto.largura}
        height={foto.altura}
        alt={foto.alt}
        loading={prioridade ? 'eager' : 'lazy'}
        fetchPriority={prioridade ? 'high' : undefined}
        decoding="async"
        style={foto.foco ? { objectPosition: foto.foco } : undefined}
        className={`bg-surface object-cover ${className}`}
      />
    </picture>
  )
}
