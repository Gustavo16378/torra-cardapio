import { describe, expect, it } from 'vitest'
import {
  carrinhoVazio,
  criarLinha,
  QUANTIDADE_MAXIMA,
  reducerCarrinho,
  reidratarCarrinho,
  serializarCarrinho,
  totalItens,
} from '../carrinho'
import { cappuccino, categorias, cookie, espresso, paoDeQueijo } from './fixtures'

const cappG = { tamanho: ['g'], leite: ['aveia'] }

describe('criarLinha', () => {
  it('resolve nome, opções e preço a partir do item', () => {
    const linha = criarLinha(cappuccino, { ...cappG, extras: ['shot'] }, 2, 'bem quente')
    expect(linha).toMatchObject({
      itemId: 'cappuccino',
      nome: 'Cappuccino',
      opcoes: ['G', 'aveia', 'shot extra'],
      precoUnitario: 2700,
      quantidade: 2,
      obs: 'bem quente',
    })
  })

  it('a chave independe da ordem dos grupos e das opções', () => {
    const a = criarLinha(cappuccino, { tamanho: ['g'], leite: ['aveia'], extras: ['shot', 'canela'] })
    const b = criarLinha(cappuccino, { extras: ['canela', 'shot'], leite: ['aveia'], tamanho: ['g'] })
    expect(a.chave).toBe(b.chave)
  })

  it('a chave muda com opções ou obs diferentes', () => {
    const base = criarLinha(cappuccino, cappG)
    expect(criarLinha(cappuccino, { ...cappG, leite: ['integral'] }).chave).not.toBe(base.chave)
    expect(criarLinha(cappuccino, cappG, 1, 'sem espuma').chave).not.toBe(base.chave)
  })

  it('normaliza a obs: espaços, quebras de linha e limite de 140', () => {
    expect(criarLinha(espresso, {}, 1, '  bem\n quente  ').obs).toBe('bem quente')
    expect(criarLinha(espresso, {}, 1, 'x'.repeat(200)).obs).toHaveLength(140)
  })

  it('limita a quantidade entre 1 e o máximo', () => {
    expect(criarLinha(espresso, {}, 0).quantidade).toBe(1)
    expect(criarLinha(espresso, {}, 99).quantidade).toBe(QUANTIDADE_MAXIMA)
  })
})

describe('reducerCarrinho', () => {
  it('adiciona linhas novas', () => {
    let estado = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha: criarLinha(espresso, {}) })
    estado = reducerCarrinho(estado, { tipo: 'adicionar', linha: criarLinha(paoDeQueijo, {}) })
    expect(estado.linhas.map((l) => l.itemId)).toEqual(['espresso', 'pao-de-queijo'])
  })

  it('junta linhas iguais somando a quantidade, sem passar do máximo', () => {
    let estado = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha: criarLinha(cappuccino, cappG, 2) })
    estado = reducerCarrinho(estado, { tipo: 'adicionar', linha: criarLinha(cappuccino, cappG, 3) })
    expect(estado.linhas).toHaveLength(1)
    expect(estado.linhas[0]?.quantidade).toBe(5)

    estado = reducerCarrinho(estado, { tipo: 'adicionar', linha: criarLinha(cappuccino, cappG, 20) })
    expect(estado.linhas[0]?.quantidade).toBe(QUANTIDADE_MAXIMA)
  })

  it('mantém separadas linhas do mesmo item com opções diferentes', () => {
    let estado = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha: criarLinha(cappuccino, cappG) })
    estado = reducerCarrinho(estado, {
      tipo: 'adicionar',
      linha: criarLinha(cappuccino, { tamanho: ['p'], leite: ['integral'] }),
    })
    expect(estado.linhas).toHaveLength(2)
  })

  it('altera quantidade e remove quando chega a zero', () => {
    const linha = criarLinha(espresso, {})
    let estado = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha })
    estado = reducerCarrinho(estado, { tipo: 'alterarQuantidade', chave: linha.chave, quantidade: 4 })
    expect(estado.linhas[0]?.quantidade).toBe(4)
    estado = reducerCarrinho(estado, { tipo: 'alterarQuantidade', chave: linha.chave, quantidade: 0 })
    expect(estado.linhas).toEqual([])
  })

  it('remove e limpa', () => {
    const linha = criarLinha(espresso, {})
    let estado = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha })
    estado = reducerCarrinho(estado, { tipo: 'adicionar', linha: criarLinha(paoDeQueijo, {}) })
    estado = reducerCarrinho(estado, { tipo: 'remover', chave: linha.chave })
    expect(estado.linhas.map((l) => l.itemId)).toEqual(['pao-de-queijo'])
    expect(reducerCarrinho(estado, { tipo: 'limpar' }).linhas).toEqual([])
  })

  it('não muta o estado anterior', () => {
    const anterior = reducerCarrinho(carrinhoVazio, { tipo: 'adicionar', linha: criarLinha(espresso, {}) })
    const copia = structuredClone(anterior)
    reducerCarrinho(anterior, { tipo: 'adicionar', linha: criarLinha(espresso, {}) })
    expect(anterior).toEqual(copia)
  })

  it('conta itens somando quantidades', () => {
    const linhas = [criarLinha(espresso, {}, 2), criarLinha(paoDeQueijo, {}, 3)]
    expect(totalItens(linhas)).toBe(5)
  })
})

describe('persistência', () => {
  it('serializa só o necessário e reidrata com preços do cardápio atual', () => {
    const linhas = [criarLinha(cappuccino, cappG, 2, 'bem quente'), criarLinha(espresso, {})]
    const salvo = JSON.parse(JSON.stringify(serializarCarrinho(linhas)))
    expect(Object.keys(salvo[0]).sort()).toEqual(['escolhas', 'itemId', 'obs', 'quantidade'])

    const maisCaro = { ...espresso, preco: 10 }
    const cardapioNovo = [{ id: 'c', nome: 'C', itens: [cappuccino, maisCaro] }]
    const { linhas: reidratadas, descartadas } = reidratarCarrinho(salvo, cardapioNovo)
    expect(descartadas).toBe(0)
    expect(reidratadas).toEqual([linhas[0], { ...linhas[1], precoUnitario: 1000 }])
  })

  it('descarta itens que sumiram, esgotaram ou têm opções inválidas', () => {
    const salvo = [
      { itemId: 'sumiu', escolhas: {}, quantidade: 1, obs: '' },
      { itemId: cookie.id, escolhas: {}, quantidade: 1, obs: '' },
      { itemId: 'cappuccino', escolhas: { tamanho: ['g'] }, quantidade: 1, obs: '' },
      { itemId: 'cappuccino', escolhas: { tamanho: ['g'], leite: ['soja'] }, quantidade: 1, obs: '' },
      { itemId: 'espresso', escolhas: {}, quantidade: 2, obs: '' },
    ]
    const { linhas, descartadas } = reidratarCarrinho(salvo, categorias)
    expect(descartadas).toBe(4)
    expect(linhas.map((l) => [l.itemId, l.quantidade])).toEqual([['espresso', 2]])
  })

  it('tolera lixo no armazenamento', () => {
    expect(reidratarCarrinho(null, categorias)).toEqual({ linhas: [], descartadas: 0 })
    expect(reidratarCarrinho('texto', categorias)).toEqual({ linhas: [], descartadas: 0 })
    expect(reidratarCarrinho([42, { itemId: 1 }], categorias)).toEqual({ linhas: [], descartadas: 2 })
  })
})
