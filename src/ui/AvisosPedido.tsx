import { RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ItemCarrinho } from '../core/tipos'
import type { Carrinho } from '../hooks/useCarrinho'
import { textos } from './textos'

const TEMPO_DESFAZER_MS = 6000

/** "Limpar pedido" com alguns segundos para desfazer. */
export function useLimparComDesfazer(carrinho: Carrinho) {
  const [limpas, setLimpas] = useState<ItemCarrinho[] | null>(null)

  useEffect(() => {
    if (!limpas) return
    const t = window.setTimeout(() => setLimpas(null), TEMPO_DESFAZER_MS)
    return () => window.clearTimeout(t)
  }, [limpas])

  return {
    podeDesfazer: limpas !== null && carrinho.linhas.length === 0,
    limpar: () => {
      setLimpas(carrinho.linhas)
      carrinho.limpar()
    },
    desfazer: () => {
      if (limpas) carrinho.restaurar(limpas)
      setLimpas(null)
    },
  }
}

type Tom = { claro?: boolean }

/** Botão discreto mas legível para esvaziar o pedido. */
export function BotaoLimpar({ aoLimpar, claro }: { aoLimpar: () => void } & Tom) {
  return (
    <button
      type="button"
      onClick={aoLimpar}
      className={`rotulo inline-flex min-h-11 items-center gap-1.5 px-1 text-[11px] transition-colors duration-200 ${
        claro ? 'text-ink/75 hover:text-ink' : 'text-cream/75 hover:text-gold'
      }`}
    >
      <X aria-hidden size={14} strokeWidth={2.5} />
      {textos.limparPedido}
    </button>
  )
}

/** Avisa que o pedido veio da visita anterior e oferece começar do zero. */
export function AvisoVisitaAnterior({ aoComecarDoZero, claro }: { aoComecarDoZero: () => void } & Tom) {
  return (
    <div
      role="status"
      className={`mt-4 border-l-2 pl-3 text-sm leading-normal ${claro ? 'border-ink/40 text-ink/80' : 'border-gold/60 text-cream/80'}`}
    >
      {textos.pedidoAnterior}{' '}
      <button
        type="button"
        onClick={aoComecarDoZero}
        className={`font-semibold underline underline-offset-4 transition-colors duration-200 ${
          claro ? 'text-ink hover:text-ink/70' : 'text-gold hover:text-cream'
        }`}
      >
        {textos.comecarDoZero}
      </button>
    </div>
  )
}

/** Depois de limpar: "Pedido limpo. Desfazer". */
export function AvisoDesfazer({ aoDesfazer, claro }: { aoDesfazer: () => void } & Tom) {
  return (
    <p role="status" className={`mt-3 flex items-center gap-2 text-sm ${claro ? 'text-ink/80' : 'text-cream/80'}`}>
      {textos.pedidoLimpo}
      <button
        type="button"
        onClick={aoDesfazer}
        className={`inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4 ${
          claro ? 'text-ink' : 'text-gold'
        }`}
      >
        <RotateCcw aria-hidden size={14} strokeWidth={2.25} />
        {textos.desfazer}
      </button>
    </p>
  )
}

/** Botão de remover uma linha: ícone + texto, área de toque de 44px. */
export function BotaoRemover({ nome, aoRemover, claro }: { nome: string; aoRemover: () => void } & Tom) {
  return (
    <button
      type="button"
      onClick={aoRemover}
      aria-label={`${textos.remover} ${nome}`}
      className={`rotulo inline-flex min-h-11 items-center gap-1.5 px-1 text-[11px] transition-colors duration-200 ${
        claro ? 'text-ink/75 hover:text-ink' : 'text-cream/75 hover:text-gold'
      }`}
    >
      <X aria-hidden size={14} strokeWidth={2.5} />
      {textos.remover}
    </button>
  )
}
