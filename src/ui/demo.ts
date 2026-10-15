import type { SituacaoLoja } from '../core/horario'

/** Situação mostrada no modo demonstração: aberta e aceitando pedidos, sem horário de fechamento. */
export const SITUACAO_DEMO: SituacaoLoja = { aberta: true, aceitaPedidos: true }

/** A interface usa a situação real, a não ser que o modo demonstração esteja ligado. */
export function situacaoExibida(real: SituacaoLoja, modoDemo: boolean): SituacaoLoja {
  return modoDemo ? SITUACAO_DEMO : real
}
