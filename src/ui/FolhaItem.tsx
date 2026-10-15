import { useState } from 'react'
import { formatarBRL, precoUnitario } from '../core/precos'
import type { Escolhas, Item } from '../core/tipos'
import { gruposPendentes, LIMITE_OBS_ITEM } from '../core/validacao'
import { fotoDoItem } from '../dados/fotos'
import { FichaTecnica } from './FichaTecnica'
import { Folha } from './Folha'
import { Foto } from './Foto'
import { GrupoOpcoes } from './GrupoOpcoes'
import { SeletorQuantidade } from './SeletorQuantidade'
import { textos } from './textos'

type Props = {
  item: Item | null
  categoria: string
  aoFechar: () => void
  aoAdicionar: (item: Item, escolhas: Escolhas, quantidade: number, obs: string) => void
}

export function FolhaItem({ item, categoria, aoFechar, aoAdicionar }: Props) {
  // Mantém o último item na tela enquanto a folha anima a saída.
  const [exibido, setExibido] = useState(item)
  if (item && item !== exibido) setExibido(item)

  return (
    <Folha aberta={item !== null} aoFechar={aoFechar} tituloId="folha-item-titulo">
      {exibido && (
        <ConteudoItem
          key={exibido.id}
          item={exibido}
          categoria={categoria}
          aoAdicionar={(...args) => {
            aoAdicionar(...args)
            aoFechar()
          }}
        />
      )}
    </Folha>
  )
}

function ConteudoItem({
  item,
  categoria,
  aoAdicionar,
}: {
  item: Item
  categoria: string
  aoAdicionar: Props['aoAdicionar']
}) {
  const [escolhas, setEscolhas] = useState<Escolhas>({})
  const [quantidade, setQuantidade] = useState(1)
  const [obs, setObs] = useState('')

  const pendentes = gruposPendentes(item, escolhas)
  const pronto = pendentes.length === 0
  const total = precoUnitario(item, escolhas) * quantidade
  const foto = fotoDoItem(item)

  return (
    <div className="flex min-h-full flex-col">
      {foto && <Foto foto={foto} sizes="(min-width: 48rem) 560px, 100vw" className="mt-3 aspect-[16/10] w-full" prioridade />}
      <header className="px-5 pt-6 pb-6 md:px-8 md:pt-8">
        <p className="rotulo pr-12 text-gold">{categoria}</p>
        <h2 id="folha-item-titulo" className="mt-2 pr-10 font-display text-[clamp(38px,11vw,52px)] uppercase leading-[0.92]">
          {item.nome}
        </h2>
        {item.descricao && <p className="mt-3 max-w-texto text-[15px] leading-normal text-cream/75">{item.descricao}</p>}
        {item.tags && item.tags.length > 0 && (
          <p className="rotulo mt-3 flex gap-3 text-[10px] text-gold">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </p>
        )}
        {item.ficha && <FichaTecnica ficha={item.ficha} className="mt-5" />}
      </header>

      {item.grupos?.map((grupo) => (
        <GrupoOpcoes
          key={grupo.id}
          grupo={grupo}
          escolhidos={escolhas[grupo.id] ?? []}
          aoMudar={(ids) => setEscolhas((atual) => ({ ...atual, [grupo.id]: ids }))}
        />
      ))}

      <div className="flex items-center justify-between border-t border-cream/10 px-5 py-4 md:px-8">
        <span className="rotulo">{textos.quantidade}</span>
        <SeletorQuantidade valor={quantidade} aoMudar={setQuantidade} rotulo={item.nome} />
      </div>

      <div className="border-t border-cream/10 px-5 pt-4 pb-6 md:px-8">
        <div className="flex items-baseline justify-between">
          <label htmlFor="obs-item" className="rotulo">
            {textos.observacao} <span className="text-cream/65 normal-case tracking-normal font-normal">({textos.opcional.toLowerCase()})</span>
          </label>
          <span aria-hidden className="numeros-tabulares text-xs text-cream/65">
            {obs.length}/{LIMITE_OBS_ITEM}
          </span>
        </div>
        <textarea
          id="obs-item"
          rows={2}
          maxLength={LIMITE_OBS_ITEM}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder={textos.observacaoDica}
          className="mt-2 w-full resize-none border-b border-cream/25 bg-transparent py-2 text-[15px] placeholder:text-cream/45 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-cream/10 bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8">
        <button
          type="button"
          disabled={!pronto}
          aria-describedby={pronto ? undefined : 'falta-escolher'}
          onClick={() => aoAdicionar(item, escolhas, quantidade, obs)}
          className="flex h-14 w-full items-center justify-center bg-gold font-display text-xl uppercase tracking-[0.02em] text-ink transition-[background-color,color,opacity] duration-300 hover:bg-cream disabled:cursor-not-allowed disabled:bg-cream/10 disabled:text-cream/50"
        >
          <span key={total} className="numeros-tabulares inline-block animate-tique">
            {textos.botaoAdicionar(formatarBRL(total))}
          </span>
        </button>
        {!pronto && (
          <p id="falta-escolher" className="mt-2 text-center text-[13px] text-cream/70">
            {textos.faltaEscolher(pendentes.map((g) => g.nome))}
          </p>
        )}
      </div>
    </div>
  )
}
