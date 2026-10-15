import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { formatarBRL } from '../core/precos'
import { plural, textos } from './textos'

/** Comanda creme presa ao rodapé: aparece quando há itens e dá um "tique" a cada adição. */
export function BarraCarrinho({
  quantidade,
  subtotal,
  aoAbrir,
}: {
  quantidade: number
  subtotal: number
  aoAbrir: () => void
}) {
  const visivel = quantidade > 0
  const barraRef = useRef<HTMLDivElement>(null)
  const anterior = useRef(quantidade)

  // Empurrãozinho quando entra item (não quando sai).
  useEffect(() => {
    const cresceu = quantidade > anterior.current && anterior.current > 0
    anterior.current = quantidade
    if (!cresceu || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    barraRef.current?.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }],
      { duration: 460, easing: 'cubic-bezier(.16, 1, .3, 1)' },
    )
  }, [quantidade])

  const total = formatarBRL(subtotal)

  return (
    <div
      inert={!visivel}
      className={`fixed inset-x-0 bottom-0 z-40 transition-[transform,visibility] duration-700 ease-cine ${
        visivel ? 'visible translate-y-0' : 'invisible translate-y-[calc(100%+12px)]'
      }`}
    >
      <div ref={barraRef} className="serrilha bg-cream text-ink shadow-[0_-12px_40px_rgb(0_0_0/0.35)]">
        <button
          type="button"
          onClick={aoAbrir}
          aria-label={`${textos.verPedido}: ${textos.barra(quantidade, total)}`}
          className="group mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <span className="rotulo flex items-center gap-2 overflow-hidden text-[12px] tracking-[0.12em]">
            <span key={`q${quantidade}`} className="numeros-tabulares inline-block animate-tique">
              {plural(quantidade, 'item', 'itens')}
            </span>
            <span aria-hidden>·</span>
            <span key={`t${subtotal}`} className="numeros-tabulares inline-block animate-tique">
              {total}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 font-display text-[22px] uppercase leading-none">
            {textos.verPedido}
            <ArrowRight aria-hidden size={20} strokeWidth={2.25} className="transition-transform duration-300 ease-cine group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  )
}
