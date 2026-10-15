import { Minus, Plus } from 'lucide-react'
import { QUANTIDADE_MAXIMA } from '../core/carrinho'

type Props = {
  valor: number
  aoMudar: (valor: number) => void
  /** Nome do item, para os rótulos dos botões. */
  rotulo: string
  compacto?: boolean
}

export function SeletorQuantidade({ valor, aoMudar, rotulo, compacto = false }: Props) {
  const tamanho = compacto ? 'size-9' : 'size-11'
  const botao = `grid ${tamanho} place-items-center rounded-full border border-cream/30 transition-[border-color,color,opacity] duration-200 hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30`

  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button type="button" className={botao} onClick={() => aoMudar(valor - 1)} disabled={valor <= 1} aria-label="Diminuir quantidade">
        <Minus aria-hidden size={16} />
      </button>
      <output aria-live="polite" className={`numeros-tabulares text-center font-display ${compacto ? 'w-8 text-lg' : 'w-10 text-2xl'}`}>
        {valor}
      </output>
      <button
        type="button"
        className={botao}
        onClick={() => aoMudar(valor + 1)}
        disabled={valor >= QUANTIDADE_MAXIMA}
        aria-label="Aumentar quantidade"
      >
        <Plus aria-hidden size={16} />
      </button>
    </div>
  )
}
