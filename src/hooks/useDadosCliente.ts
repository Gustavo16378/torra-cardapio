import { useCallback, useState } from 'react'
import { apagar, gravarJSON, lerJSON } from './armazenamento'

export type DadosCliente = { nome: string; endereco: string }

const vazio: DadosCliente = { nome: '', endereco: '' }

function ler(chave: string): DadosCliente {
  const bruto = lerJSON(chave)
  if (typeof bruto !== 'object' || bruto === null) return vazio
  const { nome, endereco } = bruto as Record<string, unknown>
  return {
    nome: typeof nome === 'string' ? nome : '',
    endereco: typeof endereco === 'string' ? endereco : '',
  }
}

/** Nome e endereço lembrados neste aparelho, para preencher o checkout na próxima visita. */
export function useDadosCliente(chaveArmazenamento: string) {
  const [salvos, setSalvos] = useState<DadosCliente>(() => ler(chaveArmazenamento))

  const lembrar = useCallback(
    (dados: DadosCliente) => {
      const limpos = { nome: dados.nome.trim(), endereco: dados.endereco.trim() }
      gravarJSON(chaveArmazenamento, limpos)
      setSalvos(limpos)
    },
    [chaveArmazenamento],
  )

  const esquecer = useCallback(() => {
    apagar(chaveArmazenamento)
    setSalvos(vazio)
  }, [chaveArmazenamento])

  return { salvos, temSalvos: Boolean(salvos.nome || salvos.endereco), lembrar, esquecer }
}
