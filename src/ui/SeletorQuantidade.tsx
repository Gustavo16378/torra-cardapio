import { Minus, Plus, Trash2 } from 'lucide-react'
import { QUANTIDADE_MAXIMA } from '../core/carrinho'

type Props = {
  valor: number
  aoMudar: (valor: number) => void
  /** Nome do item, para os rótulos dos botões. */
  rotulo: string
  /** Se informado, com quantidade 1 o "−" vira lixeira e remove o item (carrinho/comanda). */
  aoRemover?: () => void
  compacto?: boolean
  /** Sobre fundo creme (comanda lateral). */
  claro?: boolean
}

export function SeletorQuantidade({ valor, aoMudar, rotulo, aoRemover, compacto = false, claro = false }: Props) {
  const tamanho = compacto ? 'size-9' : 'size-11'
  const botao = `grid ${tamanho} place-items-center rounded-full border transition-[border-color,color,opacity] duration-200 disabled:pointer-events-none disabled:opacity-30 ${
    claro ? 'border-ink/30 hover:border-ink' : 'border-cream/30 hover:border-gold hover:text-gold'
  }`
  const removeNoMenos = valor <= 1 && aoRemover !== undefined

  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Quantidade de ${rotulo}`}>
      <button
        type="button"
        className={botao}
        onClick={() => (removeNoMenos ? aoRemover() : aoMudar(valor - 1))}
        disabled={valor <= 1 && !removeNoMenos}
        aria-label={removeNoMenos ? `Remover ${rotulo}` : 'Diminuir quantidade'}
      >
        {removeNoMenos ? <Trash2 aria-hidden size={15} /> : <Minus aria-hidden size={16} />}
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
