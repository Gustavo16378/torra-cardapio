import { ArrowLeft } from 'lucide-react'
import type { SituacaoLoja } from '../core/horario'
import type { Loja } from '../core/tipos'
import { Marca } from './Marca'
import { textoStatus, textos } from './textos'

export function Topo({ loja, situacao, urlSite }: { loja: Loja; situacao: SituacaoLoja; urlSite: string }) {
  const aberto = situacao.aceitaPedidos

  return (
    <header className="mx-auto max-w-[720px] px-5 pt-5 pb-10 md:pt-8">
      <a
        href={urlSite}
        className="rotulo inline-flex items-center gap-1.5 py-2 text-cream/70 transition-colors duration-200 hover:text-gold"
      >
        <ArrowLeft aria-hidden size={14} strokeWidth={2} />
        {textos.voltarSite}
      </a>

      <h1 className="mt-8 animate-surgir">
        <Marca className="block text-[clamp(88px,30vw,176px)] leading-[0.82] tracking-[-0.01em] text-cream" />
        <span className="rotulo mt-4 block text-gold">{textos.chamada}</span>
      </h1>

      <div className="mt-8 border-t border-cream/15 pt-5 animate-surgir [animation-delay:120ms]">
        <p className="flex items-center gap-2.5 text-[15px] font-medium">
          <span aria-hidden className="relative flex size-2.5">
            {aberto && <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />}
            <span className={`relative size-2.5 rounded-full ${aberto ? 'bg-gold' : 'border border-cream/60'}`} />
          </span>
          {textoStatus(situacao)}
        </p>
        <p className="mt-1.5 pl-5 text-sm text-cream/65">{loja.endereco}</p>
      </div>
    </header>
  )
}
