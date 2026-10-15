import { useCallback, useState } from 'react'
import { apagar, gravarJSON, lerJSON } from './armazenamento'

/**
 * Pedido que saiu para o WhatsApp e ainda não foi confirmado. Fica no localStorage porque o
 * wa.me abre na mesma aba: na volta a página pode recarregar e a pergunta "Pedido enviado?"
 * precisa reaparecer.
 */
export type EnvioPendente = { link: string; nome: string; em: number }

/** Depois disso a pergunta não volta mais (a pessoa já seguiu a vida). */
const VALIDADE_MS = 6 * 60 * 60 * 1000

function ler(chave: string): EnvioPendente | null {
  const bruto = lerJSON(chave)
  if (typeof bruto !== 'object' || bruto === null) return null
  const { link, nome, em } = bruto as Record<string, unknown>
  if (typeof link !== 'string' || typeof nome !== 'string' || typeof em !== 'number') return null
  if (Date.now() - em > VALIDADE_MS) return null
  return { link, nome, em }
}

export function useEnvioPendente(chaveArmazenamento: string) {
  const [pendente, setPendente] = useState<EnvioPendente | null>(() => ler(chaveArmazenamento))

  const marcar = useCallback(
    (dados: Omit<EnvioPendente, 'em'>) => {
      const envio = { ...dados, em: Date.now() }
      gravarJSON(chaveArmazenamento, envio)
      setPendente(envio)
    },
    [chaveArmazenamento],
  )

  const limpar = useCallback(() => {
    apagar(chaveArmazenamento)
    setPendente(null)
  }, [chaveArmazenamento])

  return { pendente, marcar, limpar }
}

export type Envio = ReturnType<typeof useEnvioPendente>
