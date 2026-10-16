import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  carrinhoVazio,
  criarLinha,
  reducerCarrinho,
  reidratarCarrinho,
  serializarCarrinho,
  totalItens,
  type AcaoCarrinho,
} from '../core/carrinho'
import { subtotal } from '../core/precos'
import type { Categoria, Escolhas, Item, ItemCarrinho } from '../core/tipos'
import { gravarJSON, lerJSON } from './armazenamento'

/**
 * Único hook do carrinho: liga o reducer puro do core ao React e ao localStorage.
 * Só começa a gravar depois de reidratar, para não apagar o carrinho salvo com o estado vazio inicial.
 */
export function useCarrinho(categorias: Categoria[] | null, chaveArmazenamento: string) {
  const [estado, despachar] = useReducer(reducerCarrinho, carrinhoVazio)
  const [reidratado, setReidratado] = useState(false)
  const [descartadas, setDescartadas] = useState(0)
  /** O carrinho atual veio salvo de uma visita anterior (até a pessoa mexer nele). */
  const [daVisitaAnterior, setDaVisitaAnterior] = useState(false)

  useEffect(() => {
    if (!categorias || reidratado) return
    const resultado = reidratarCarrinho(lerJSON(chaveArmazenamento), categorias)
    despachar({ tipo: 'substituir', linhas: resultado.linhas })
    setDescartadas(resultado.descartadas)
    setDaVisitaAnterior(resultado.linhas.length > 0)
    setReidratado(true)
  }, [categorias, reidratado, chaveArmazenamento])

  useEffect(() => {
    if (reidratado) gravarJSON(chaveArmazenamento, serializarCarrinho(estado.linhas))
  }, [estado.linhas, reidratado, chaveArmazenamento])

  // Qualquer ação da pessoa torna o pedido "dela", e o aviso de visita anterior some.
  const despacharDaPessoa = useCallback((acao: AcaoCarrinho) => {
    setDaVisitaAnterior(false)
    despachar(acao)
  }, [])

  const adicionar = useCallback(
    (item: Item, escolhas: Escolhas, quantidade = 1, obs = '') => {
      despacharDaPessoa({ tipo: 'adicionar', linha: criarLinha(item, escolhas, quantidade, obs) })
    },
    [despacharDaPessoa],
  )

  const alterarQuantidade = useCallback(
    (chave: string, quantidade: number) => despacharDaPessoa({ tipo: 'alterarQuantidade', chave, quantidade }),
    [despacharDaPessoa],
  )

  const remover = useCallback((chave: string) => despacharDaPessoa({ tipo: 'remover', chave }), [despacharDaPessoa])
  const limpar = useCallback(() => despacharDaPessoa({ tipo: 'limpar' }), [despacharDaPessoa])
  /** Volta um carrinho inteiro (usado pelo "Desfazer" depois de limpar). */
  const restaurar = useCallback((linhas: ItemCarrinho[]) => despacharDaPessoa({ tipo: 'substituir', linhas }), [despacharDaPessoa])
  const esquecerDescartadas = useCallback(() => setDescartadas(0), [])

  return useMemo(
    () => ({
      linhas: estado.linhas,
      quantidadeItens: totalItens(estado.linhas),
      subtotal: subtotal(estado.linhas),
      descartadas,
      daVisitaAnterior,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
      restaurar,
      esquecerDescartadas,
    }),
    [estado.linhas, descartadas, daVisitaAnterior, adicionar, alterarQuantidade, remover, limpar, restaurar, esquecerDescartadas],
  )
}

export type Carrinho = ReturnType<typeof useCarrinho>
