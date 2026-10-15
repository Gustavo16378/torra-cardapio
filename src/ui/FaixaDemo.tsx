import { textos } from './textos'

/** Faixa discreta no topo avisando que o cardápio está em demonstração. */
export function FaixaDemo() {
  return (
    <p className="border-b border-gold/25 bg-surface px-5 py-2 text-center text-xs font-medium text-cream/80">
      {textos.faixaDemo}
    </p>
  )
}
