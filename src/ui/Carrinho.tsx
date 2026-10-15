import { Plus } from 'lucide-react'
import { formatarBRL, totalLinha } from '../core/precos'
import type { Carrinho as EstadoCarrinho } from '../hooks/useCarrinho'
import { SeletorQuantidade } from './SeletorQuantidade'
import { textos } from './textos'

export function Carrinho({ carrinho, aoAdicionarMais }: { carrinho: EstadoCarrinho; aoAdicionarMais: () => void }) {
  const { linhas } = carrinho

  return (
    <div className="px-5 pt-6 pb-6 md:px-8 md:pt-8">
      <p className="rotulo text-gold">{textos.comanda}</p>
      <h2
        id="folha-pedido-titulo"
        tabIndex={-1}
        className="mt-2 font-display text-[clamp(38px,11vw,52px)] uppercase leading-[0.92] outline-none"
      >
        {textos.seuPedido}
      </h2>

      {carrinho.descartadas > 0 && (
        <p role="status" className="mt-4 border-l-2 border-gold/60 pl-3 text-sm text-cream/80">
          {textos.descartadas(carrinho.descartadas)}
        </p>
      )}

      {linhas.length === 0 ? (
        <div className="py-10">
          <p className="text-cream/75">{textos.pedidoVazio}</p>
          <button type="button" onClick={aoAdicionarMais} className="rotulo mt-4 py-2 text-gold underline-offset-4 hover:underline">
            {textos.voltarCardapio}
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-6 border-t border-cream/10">
            {linhas.map((linha) => (
              <li key={linha.chave} className="border-b border-cream/10 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold uppercase leading-snug tracking-[0.04em]">{linha.nome}</p>
                    {linha.opcoes.length > 0 && (
                      <p className="mt-0.5 text-sm text-cream/70 first-letter:uppercase">{linha.opcoes.join(', ')}</p>
                    )}
                    {linha.obs && <p className="mt-0.5 text-sm italic text-cream/70">“{linha.obs}”</p>}
                  </div>
                  <p className="numeros-tabulares shrink-0 text-[15px] font-medium">{formatarBRL(totalLinha(linha))}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <SeletorQuantidade
                    compacto
                    valor={linha.quantidade}
                    rotulo={linha.nome}
                    aoMudar={(q) => carrinho.alterarQuantidade(linha.chave, q)}
                  />
                  <button
                    type="button"
                    onClick={() => carrinho.remover(linha.chave)}
                    aria-label={`${textos.remover} ${linha.nome}`}
                    className="rotulo px-1 py-2 text-[10px] text-cream/70 transition-colors duration-200 hover:text-gold"
                  >
                    {textos.remover}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-end gap-2 text-[15px]">
            <span className="rotulo">{textos.subtotal}</span>
            <span aria-hidden className="pontilhado flex-1" />
            <span className="numeros-tabulares font-semibold">{formatarBRL(carrinho.subtotal)}</span>
          </div>

          <button
            type="button"
            onClick={aoAdicionarMais}
            className="rotulo mt-6 inline-flex items-center gap-1.5 py-2 text-gold transition-colors duration-200 hover:text-cream"
          >
            <Plus aria-hidden size={14} strokeWidth={2.5} />
            {textos.adicionarMais}
          </button>
        </>
      )}
    </div>
  )
}
