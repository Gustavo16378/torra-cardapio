import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  carrinhoVazio,
  criarLinha,
  reducerCarrinho,
  reidratarCarrinho,
  serializarCarrinho,
  totalItens,
} from '../core/carrinho'
import { subtotal } from '../core/precos'
import type { Categoria, Escolhas, Item } from '../core/tipos'
import { gravarJSON, lerJSON } from './armazenamento'

/**
 * Único hook do carrinho: liga o reducer puro do core ao React e ao localStorage.
 * Só começa a gravar depois de reidratar, para não apagar o carrinho salvo com o estado vazio inicial.
 */
export function useCarrinho(categorias: Categoria[] | null, chaveArmazenamento: string) {
  const [estado, despachar] = useReducer(reducerCarrinho, carrinhoVazio)
  const [reidratado, setReidratado] = useState(false)
  const [descartadas, setDescartadas] = useState(0)

  useEffect(() => {
    if (!categorias || reidratado) return
    const resultado = reidratarCarrinho(lerJSON(chaveArmazenamento), categorias)
    despachar({ tipo: 'substituir', linhas: resultado.linhas })
    setDescartadas(resultado.descartadas)
    setReidratado(true)
  }, [categorias, reidratado, chaveArmazenamento])

  useEffect(() => {
    if (reidratado) gravarJSON(chaveArmazenamento, serializarCarrinho(estado.linhas))
  }, [estado.linhas, reidratado, chaveArmazenamento])

  const adicionar = useCallback((item: Item, escolhas: Escolhas, quantidade = 1, obs = '') => {
    despachar({ tipo: 'adicionar', linha: criarLinha(item, escolhas, quantidade, obs) })
  }, [])

  const alterarQuantidade = useCallback((chave: string, quantidade: number) => {
    despachar({ tipo: 'alterarQuantidade', chave, quantidade })
  }, [])

  const remover = useCallback((chave: string) => despachar({ tipo: 'remover', chave }), [])
  const limpar = useCallback(() => despachar({ tipo: 'limpar' }), [])
  const esquecerDescartadas = useCallback(() => setDescartadas(0), [])

  return useMemo(
    () => ({
      linhas: estado.linhas,
      quantidadeItens: totalItens(estado.linhas),
      subtotal: subtotal(estado.linhas),
      descartadas,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
      esquecerDescartadas,
    }),
    [estado.linhas, descartadas, adicionar, alterarQuantidade, remover, limpar, esquecerDescartadas],
  )
}

export type Carrinho = ReturnType<typeof useCarrinho>
