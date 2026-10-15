import { ArrowLeft } from 'lucide-react'
import type { SituacaoLoja } from '../core/horario'
import type { Categoria, Loja } from '../core/tipos'
import { fotos } from '../dados/fotos'
import { Foto } from './Foto'
import { IndiceCategorias } from './IndiceCategorias'
import { Marca } from './Marca'
import { textoStatus, textos } from './textos'

type Props = {
  loja: Loja
  situacao: SituacaoLoja
  urlSite: string
  categorias: Categoria[] | null
  ativo: string
  aoEscolher: (idSecao: string) => void
}

/**
 * Topo no celular; a partir de 1024px vira a lombada fixa à esquerda, como a de um cardápio:
 * marca, status, endereço, índice das categorias e a foto do salão.
 */
export function Lombada({ loja, situacao, urlSite, categorias, ativo, aoEscolher }: Props) {
  const aberto = situacao.aceitaPedidos

  return (
    <header className="sem-barra-rolagem mx-auto flex max-w-[720px] flex-col px-5 pt-5 pb-10 lg:sticky lg:top-0 lg:mx-0 lg:h-dvh lg:max-w-none lg:overflow-y-auto lg:border-r lg:border-cream/10 lg:px-0 lg:pt-8 lg:pb-8 lg:pr-10">
      <a
        href={urlSite}
        className="rotulo inline-flex items-center gap-1.5 self-start py-2 text-cream/70 transition-colors duration-200 hover:text-gold"
      >
        <ArrowLeft aria-hidden size={14} strokeWidth={2} />
        {textos.voltarSite}
      </a>

      <h1 className="mt-8 animate-surgir">
        <Marca className="block text-[clamp(88px,30vw,176px)] leading-[0.82] tracking-[-0.01em] text-cream lg:text-8xl" />
        <span className="rotulo mt-4 block text-gold">{textos.chamada}</span>
      </h1>

      <div className="mt-8 animate-surgir [animation-delay:80ms] lg:order-last lg:mt-auto lg:pt-10">
        <Foto
          foto={fotos.ambiente}
          sizes="(min-width: 64rem) 16rem, (min-width: 45rem) 680px, calc(100vw - 2.5rem)"
          className="aspect-[3/2] w-full"
          prioridade
        />
      </div>

      <div className="mt-8 border-t border-cream/15 pt-5 animate-surgir [animation-delay:120ms]">
        <p className="flex items-center gap-2.5 text-[15px] font-medium">
          <span aria-hidden className="relative flex size-2.5 shrink-0">
            {aberto && <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />}
            <span className={`relative size-2.5 rounded-full ${aberto ? 'bg-gold' : 'border border-cream/60'}`} />
          </span>
          {textoStatus(situacao)}
        </p>
        <p className="mt-3 pl-5 text-sm text-cream/65">{loja.endereco}</p>
      </div>

      {categorias && <IndiceCategorias categorias={categorias} ativo={ativo} aoEscolher={aoEscolher} />}
    </header>
  )
}
