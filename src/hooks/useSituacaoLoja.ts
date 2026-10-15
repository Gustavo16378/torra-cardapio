import { useEffect, useState } from 'react'
import { situacaoLoja, type SituacaoLoja } from '../core/horario'
import type { Loja } from '../core/tipos'

/** Situação da loja (aberta, corte, próxima abertura), reavaliada a cada 30 s e ao voltar para a aba. */
export function useSituacaoLoja(loja: Loja): SituacaoLoja {
  const [situacao, setSituacao] = useState(() => situacaoLoja(loja))

  useEffect(() => {
    const atualizar = () => setSituacao(situacaoLoja(loja))
    atualizar()
    const intervalo = window.setInterval(atualizar, 30_000)
    const aoVoltar = () => document.visibilityState === 'visible' && atualizar()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [loja])

  return situacao
}
