import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatarPrecoCurto, paraCentavos } from '../core/precos'
import type { Item } from '../core/tipos'
import { FichaTecnica } from './FichaTecnica'
import { textos } from './textos'

type Props = {
  item: Item
  /** Quantas origens com ficha o item oferece (coados). */
  origens: number
  aoAbrir: (item: Item) => void
  aoAdicionarDireto: (item: Item) => void
}

/** Uma linha da carta: nome ··· preço, descrição, tags e o "+". */
export function LinhaItem({ item, origens, aoAbrir, aoAdicionarDireto }: Props) {
  // Esgotado fica apagado por cor (não por opacity), para o texto continuar com contraste AA.
  const apagado = !item.disponivel
  const temOpcoes = (item.grupos?.length ?? 0) > 0
  const [confirmacoes, setConfirmacoes] = useState(0)
  const confirmando = confirmacoes > 0

  useEffect(() => {
    if (!confirmando) return
    const t = window.setTimeout(() => setConfirmacoes(0), 900)
    return () => window.clearTimeout(t)
  }, [confirmacoes, confirmando])

  const conteudo = (
    <>
      <span className="flex items-end gap-2">
        <span
          className={`text-[15px] font-semibold uppercase leading-snug tracking-[0.04em] transition-colors duration-200 group-hover:text-gold ${apagado ? 'text-cream/55' : ''}`}
        >
          {item.nome}
        </span>
        <span aria-hidden className="pontilhado flex-1" />
        <span className={`numeros-tabulares text-[15px] font-medium leading-snug ${apagado ? 'text-cream/55 line-through' : ''}`}>
          <span className="sr-only">R$ </span>
          {formatarPrecoCurto(paraCentavos(item.preco))}
        </span>
      </span>
      {item.descricao && <span className={`mt-1.5 block text-sm leading-relaxed ${apagado ? 'text-cream/50' : 'text-cream/65'}`}>{item.descricao}</span>}
      {(item.tags?.length || origens > 0) && (
        <span className="rotulo mt-2 flex flex-wrap gap-x-3 text-[10px] text-gold">
          {item.tags?.map((tag) => <span key={tag}>{tag}</span>)}
          {origens > 0 && <span>{textos.origensNaLinha(origens)}</span>}
        </span>
      )}
    </>
  )

  return (
    <li className="border-b border-cream/10">
      <div className="flex items-start gap-4 py-5">
        {item.disponivel ? (
          <button type="button" onClick={() => aoAbrir(item)} className="group min-w-0 flex-1 text-left">
            {conteudo}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{conteudo}</div>
        )}

        {item.disponivel ? (
          <button
            type="button"
            aria-label={temOpcoes ? textos.escolherOpcoes(item.nome) : textos.adicionar(item.nome)}
            onClick={() => {
              if (temOpcoes) return aoAbrir(item)
              aoAdicionarDireto(item)
              setConfirmacoes((n) => n + 1)
            }}
            className={`-mt-2.5 grid size-11 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300 ${
              confirmando
                ? 'border-gold bg-gold text-ink'
                : 'border-cream/35 text-cream hover:border-gold hover:text-gold'
            }`}
          >
            {confirmando ? (
              <Check key={confirmacoes} aria-hidden size={18} strokeWidth={2.5} className="animate-carimbo" />
            ) : (
              <Plus aria-hidden size={18} strokeWidth={2} />
            )}
          </button>
        ) : (
          <span className="rotulo w-16 shrink-0 text-right text-[10px] leading-tight text-cream">{textos.esgotado}</span>
        )}
      </div>

      {item.ficha && <FichaTecnica ficha={item.ficha} className="mb-6 -mt-1" />}
    </li>
  )
}
