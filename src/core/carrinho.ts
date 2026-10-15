import { opcoesEscolhidas, precoUnitario } from './precos'
import type { Categoria, Escolhas, Item, ItemCarrinho, LinhaSalva } from './tipos'
import { escolhasValidas, LIMITE_OBS_ITEM } from './validacao'

export const QUANTIDADE_MAXIMA = 20

export type EstadoCarrinho = { linhas: ItemCarrinho[] }

export type AcaoCarrinho =
  | { tipo: 'adicionar'; linha: ItemCarrinho }
  | { tipo: 'alterarQuantidade'; chave: string; quantidade: number }
  | { tipo: 'remover'; chave: string }
  | { tipo: 'limpar' }
  | { tipo: 'substituir'; linhas: ItemCarrinho[] }

export const carrinhoVazio: EstadoCarrinho = { linhas: [] }

function limitarQuantidade(quantidade: number): number {
  return Math.min(QUANTIDADE_MAXIMA, Math.max(1, Math.floor(quantidade)))
}

/** Escolhas em forma canônica: só grupos com opção, opções na ordem do cardápio. */
export function normalizarEscolhas(item: Item, escolhas: Escolhas): Escolhas {
  const resultado: Escolhas = {}
  for (const grupo of item.grupos ?? []) {
    const ids = escolhas[grupo.id] ?? []
    const ordenados = grupo.opcoes.filter((opcao) => ids.includes(opcao.id)).map((opcao) => opcao.id)
    if (ordenados.length > 0) resultado[grupo.id] = ordenados
  }
  return resultado
}

export function normalizarObs(obs: string): string {
  return obs.replace(/\s+/g, ' ').trim().slice(0, LIMITE_OBS_ITEM)
}

export function chaveDaLinha(itemId: string, escolhas: Escolhas, obs: string): string {
  const partes = Object.keys(escolhas)
    .sort()
    .map((grupoId) => `${grupoId}=${(escolhas[grupoId] ?? []).join(',')}`)
  return [itemId, partes.join(';'), obs].join('|')
}

/** Monta uma linha a partir do item do cardápio. Não valida obrigatórios: use `escolhasValidas`. */
export function criarLinha(item: Item, escolhas: Escolhas, quantidade = 1, obs = ''): ItemCarrinho {
  const canonicas = normalizarEscolhas(item, escolhas)
  const obsLimpa = normalizarObs(obs)
  return {
    chave: chaveDaLinha(item.id, canonicas, obsLimpa),
    itemId: item.id,
    nome: item.nome,
    escolhas: canonicas,
    opcoes: opcoesEscolhidas(item, canonicas).map((opcao) => opcao.nome),
    precoUnitario: precoUnitario(item, canonicas),
    quantidade: limitarQuantidade(quantidade),
    obs: obsLimpa,
  }
}

export function reducerCarrinho(estado: EstadoCarrinho, acao: AcaoCarrinho): EstadoCarrinho {
  switch (acao.tipo) {
    case 'adicionar': {
      const existente = estado.linhas.find((linha) => linha.chave === acao.linha.chave)
      if (!existente) return { linhas: [...estado.linhas, { ...acao.linha, quantidade: limitarQuantidade(acao.linha.quantidade) }] }
      return {
        linhas: estado.linhas.map((linha) =>
          linha.chave === acao.linha.chave
            ? { ...linha, quantidade: limitarQuantidade(linha.quantidade + acao.linha.quantidade) }
            : linha,
        ),
      }
    }
    case 'alterarQuantidade':
      if (acao.quantidade < 1) return reducerCarrinho(estado, { tipo: 'remover', chave: acao.chave })
      return {
        linhas: estado.linhas.map((linha) =>
          linha.chave === acao.chave ? { ...linha, quantidade: limitarQuantidade(acao.quantidade) } : linha,
        ),
      }
    case 'remover':
      return { linhas: estado.linhas.filter((linha) => linha.chave !== acao.chave) }
    case 'limpar':
      return carrinhoVazio
    case 'substituir':
      return { linhas: acao.linhas }
  }
}

export function totalItens(linhas: ItemCarrinho[]): number {
  return linhas.reduce((soma, linha) => soma + linha.quantidade, 0)
}

export function encontrarItem(categorias: Categoria[], itemId: string): Item | undefined {
  for (const categoria of categorias) {
    const item = categoria.itens.find((i) => i.id === itemId)
    if (item) return item
  }
  return undefined
}

export function serializarCarrinho(linhas: ItemCarrinho[]): LinhaSalva[] {
  return linhas.map(({ itemId, escolhas, quantidade, obs }) => ({ itemId, escolhas, quantidade, obs }))
}

function pareceLinhaSalva(valor: unknown): valor is LinhaSalva {
  if (typeof valor !== 'object' || valor === null) return false
  const v = valor as Record<string, unknown>
  return (
    typeof v.itemId === 'string' &&
    typeof v.quantidade === 'number' &&
    typeof v.obs === 'string' &&
    typeof v.escolhas === 'object' &&
    v.escolhas !== null &&
    Object.values(v.escolhas).every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'))
  )
}

/**
 * Reconstrói o carrinho salvo contra o cardápio atual: preços e nomes vêm do cardápio,
 * e linhas de itens que sumiram, esgotaram ou mudaram de opções são descartadas.
 */
export function reidratarCarrinho(
  salvo: unknown,
  categorias: Categoria[],
): { linhas: ItemCarrinho[]; descartadas: number } {
  if (!Array.isArray(salvo)) return { linhas: [], descartadas: 0 }
  let estado = carrinhoVazio
  let descartadas = 0
  for (const bruto of salvo) {
    if (!pareceLinhaSalva(bruto)) {
      descartadas++
      continue
    }
    const item = encontrarItem(categorias, bruto.itemId)
    if (!item || !item.disponivel || !escolhasValidas(item, bruto.escolhas)) {
      descartadas++
      continue
    }
    estado = reducerCarrinho(estado, {
      tipo: 'adicionar',
      linha: criarLinha(item, bruto.escolhas, bruto.quantidade, bruto.obs),
    })
  }
  return { linhas: estado.linhas, descartadas }
}
