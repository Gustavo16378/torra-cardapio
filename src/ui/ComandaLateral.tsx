import { formatarBRL, totalLinha } from '../core/precos'
import type { Carrinho } from '../hooks/useCarrinho'
import { AvisoDesfazer, AvisoVisitaAnterior, BotaoLimpar, BotaoRemover, useLimparComDesfazer } from './AvisosPedido'
import { SeletorQuantidade } from './SeletorQuantidade'
import { textos } from './textos'

/** Comanda de papel fixa na coluna direita (a partir de 1280px): substitui a barra do rodapé. */
export function ComandaLateral({ carrinho, aoContinuar }: { carrinho: Carrinho; aoContinuar: () => void }) {
  const { linhas } = carrinho
  const { podeDesfazer, limpar, desfazer } = useLimparComDesfazer(carrinho)

  return (
    <aside aria-labelledby="comanda-titulo" className="hidden xl:block">
      <div className="sticky top-0 flex h-dvh flex-col py-10">
        <div className="serrilha serrilha-baixo flex min-h-0 flex-col bg-cream text-ink shadow-[0_24px_60px_rgb(0_0_0/0.45)]">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-7 pb-2">
            <div className="-my-3 flex min-h-11 items-center justify-between gap-3">
              <p className="rotulo text-ink/70">{textos.comanda}</p>
              {linhas.length > 0 && <BotaoLimpar claro aoLimpar={limpar} />}
            </div>
            <h2 id="comanda-titulo" className="mt-4 font-display text-4xl uppercase leading-none">
              {textos.seuPedido}
            </h2>

            {carrinho.daVisitaAnterior && <AvisoVisitaAnterior claro aoComecarDoZero={limpar} />}

            {linhas.length === 0 ? (
              <div className="py-8">
                <p className="text-[15px] font-semibold">{podeDesfazer ? textos.pedidoLimpo : textos.comandaVazia}</p>
                {podeDesfazer ? (
                  <AvisoDesfazer claro aoDesfazer={desfazer} />
                ) : (
                  <p className="mt-2 text-sm leading-normal text-ink/70">{textos.comandaVaziaDica}</p>
                )}
              </div>
            ) : (
              <ul className="mt-5 border-t border-ink/15">
                {linhas.map((linha) => (
                  <li key={linha.chave} className="animate-surgir border-b border-ink/10 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase leading-snug tracking-[0.04em]">{linha.nome}</p>
                        {linha.opcoes.length > 0 && (
                          <p className="mt-1 text-[13px] text-ink/70 first-letter:uppercase">{linha.opcoes.join(', ')}</p>
                        )}
                        {linha.obs && <p className="mt-1 text-[13px] italic text-ink/70">“{linha.obs}”</p>}
                      </div>
                      <p key={`p${linha.quantidade}`} className="numeros-tabulares shrink-0 animate-tique text-sm font-semibold">
                        {formatarBRL(totalLinha(linha))}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <SeletorQuantidade
                        compacto
                        claro
                        valor={linha.quantidade}
                        rotulo={linha.nome}
                        aoMudar={(q) => carrinho.alterarQuantidade(linha.chave, q)}
                        aoRemover={() => carrinho.remover(linha.chave)}
                      />
                      <BotaoRemover claro nome={linha.nome} aoRemover={() => carrinho.remover(linha.chave)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 px-6 pt-4 pb-7">
            <div className="flex items-end gap-2">
              <span className="rotulo">{textos.subtotal}</span>
              <span aria-hidden className="pontilhado flex-1" />
              <span key={`s${carrinho.subtotal}`} className="numeros-tabulares inline-block animate-tique font-display text-2xl leading-none">
                {formatarBRL(carrinho.subtotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={aoContinuar}
              disabled={linhas.length === 0}
              className="mt-5 flex h-14 w-full items-center justify-center bg-ink font-display text-xl uppercase tracking-[0.02em] text-cream transition-[background-color,color] duration-300 hover:bg-surface hover:text-gold disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/60"
            >
              {linhas.length === 0 ? textos.verPedido : textos.continuar(formatarBRL(carrinho.subtotal))}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
