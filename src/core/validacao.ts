import { calcularTotais, paraCentavos, subtotal } from './precos'
import type { DadosCheckout, Escolhas, GrupoOpcoes, Item, ItemCarrinho, Loja, ModoPedido } from './tipos'

export const LIMITE_OBS_ITEM = 140

/** Grupos obrigatórios que ainda não têm nenhuma opção escolhida. */
export function gruposPendentes(item: Item, escolhas: Escolhas): GrupoOpcoes[] {
  return (item.grupos ?? []).filter((grupo) => {
    if (!grupo.obrigatorio) return false
    const ids = escolhas[grupo.id] ?? []
    return !grupo.opcoes.some((opcao) => ids.includes(opcao.id))
  })
}

/**
 * Escolhas válidas para o item: só grupos e opções que existem,
 * no máximo uma opção em grupo 'unica' e todos os obrigatórios preenchidos.
 */
export function escolhasValidas(item: Item, escolhas: Escolhas): boolean {
  const grupos = item.grupos ?? []
  for (const [grupoId, ids] of Object.entries(escolhas)) {
    const grupo = grupos.find((g) => g.id === grupoId)
    if (!grupo) return false
    if (grupo.tipo === 'unica' && ids.length > 1) return false
    if (new Set(ids).size !== ids.length) return false
    if (!ids.every((id) => grupo.opcoes.some((opcao) => opcao.id === id))) return false
  }
  return gruposPendentes(item, escolhas).length === 0
}

/** Centavos que faltam para o pedido mínimo da entrega; 0 se atingiu ou se é retirada. */
export function faltaParaMinimo(linhas: ItemCarrinho[], modo: ModoPedido, loja: Loja): number {
  if (modo !== 'entrega') return 0
  return Math.max(0, paraCentavos(loja.entrega.pedidoMinimo) - subtotal(linhas))
}

/** Códigos de erro; o texto para a pessoa fica na interface de cada cliente. */
export type ErrosCheckout = {
  carrinho?: 'vazio'
  nome?: 'obrigatorio'
  endereco?: 'obrigatorio'
  trocoPara?: 'menorQueTotal'
  minimo?: { faltam: number }
}

export function validarCheckout(linhas: ItemCarrinho[], checkout: DadosCheckout, loja: Loja): ErrosCheckout {
  const erros: ErrosCheckout = {}
  if (linhas.length === 0) erros.carrinho = 'vazio'
  if (!checkout.nome.trim()) erros.nome = 'obrigatorio'
  if (checkout.modo === 'entrega' && !checkout.endereco.trim()) erros.endereco = 'obrigatorio'

  const faltam = faltaParaMinimo(linhas, checkout.modo, loja)
  if (faltam > 0) erros.minimo = { faltam }

  if (checkout.pagamento === 'dinheiro' && checkout.trocoPara !== undefined) {
    const { total } = calcularTotais(linhas, checkout.modo, loja)
    if (paraCentavos(checkout.trocoPara) < total) erros.trocoPara = 'menorQueTotal'
  }
  return erros
}

export function checkoutValido(erros: ErrosCheckout): boolean {
  return Object.keys(erros).length === 0
}
