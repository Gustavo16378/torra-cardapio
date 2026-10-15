import { describe, expect, it } from 'vitest'
import { criarLinha } from '../carrinho'
import type { DadosCheckout } from '../tipos'
import { checkoutValido, escolhasValidas, faltaParaMinimo, gruposPendentes, validarCheckout } from '../validacao'
import { cappuccino, espresso, loja, paoDeQueijo } from './fixtures'

describe('opções obrigatórias', () => {
  it('lista os grupos obrigatórios sem escolha', () => {
    expect(gruposPendentes(cappuccino, {}).map((g) => g.id)).toEqual(['tamanho', 'leite'])
    expect(gruposPendentes(cappuccino, { tamanho: ['g'] }).map((g) => g.id)).toEqual(['leite'])
    expect(gruposPendentes(cappuccino, { tamanho: ['g'], leite: ['aveia'] })).toEqual([])
  })

  it('grupo opcional não bloqueia', () => {
    expect(escolhasValidas(cappuccino, { tamanho: ['p'], leite: ['integral'] })).toBe(true)
  })

  it('item sem grupos é sempre válido', () => {
    expect(escolhasValidas(espresso, {})).toBe(true)
  })

  it('recusa opção inexistente, grupo inexistente, duplicata e duas opções em grupo único', () => {
    const base = { tamanho: ['g'], leite: ['aveia'] }
    expect(escolhasValidas(cappuccino, { ...base, leite: ['soja'] })).toBe(false)
    expect(escolhasValidas(cappuccino, { ...base, calda: ['x'] })).toBe(false)
    expect(escolhasValidas(cappuccino, { ...base, extras: ['shot', 'shot'] })).toBe(false)
    expect(escolhasValidas(cappuccino, { ...base, tamanho: ['p', 'g'] })).toBe(false)
    expect(escolhasValidas(cappuccino, { ...base, extras: ['shot', 'canela'] })).toBe(true)
  })

  it('opção vazia num obrigatório continua pendente', () => {
    expect(escolhasValidas(cappuccino, { tamanho: [], leite: ['aveia'] })).toBe(false)
  })
})

describe('pedido mínimo da entrega', () => {
  const linhas = [criarLinha(paoDeQueijo, {}, 1), criarLinha(espresso, {}, 1)] // R$ 21,00

  it('mostra quanto falta, sobre o subtotal sem a taxa', () => {
    expect(faltaParaMinimo(linhas, 'entrega', loja)).toBe(900)
  })

  it('retirada não tem mínimo', () => {
    expect(faltaParaMinimo(linhas, 'retirada', loja)).toBe(0)
  })

  it('atingiu o mínimo exato', () => {
    const exato = [criarLinha(paoDeQueijo, {}, 1), criarLinha(espresso, {}, 2)] // R$ 30,00
    expect(faltaParaMinimo(exato, 'entrega', loja)).toBe(0)
  })
})

describe('validarCheckout', () => {
  const linhas = [criarLinha(cappuccino, { tamanho: ['g'], leite: ['aveia'] }, 2)] // R$ 46,00
  const base: DadosCheckout = { nome: 'Ana', modo: 'retirada', endereco: '', pagamento: 'pix', obs: '' }

  it('retirada com nome é válida', () => {
    expect(validarCheckout(linhas, base, loja)).toEqual({})
    expect(checkoutValido(validarCheckout(linhas, base, loja))).toBe(true)
  })

  it('exige nome (espaços não contam)', () => {
    expect(validarCheckout(linhas, { ...base, nome: '   ' }, loja)).toEqual({ nome: 'obrigatorio' })
  })

  it('entrega exige endereço', () => {
    expect(validarCheckout(linhas, { ...base, modo: 'entrega' }, loja)).toEqual({ endereco: 'obrigatorio' })
  })

  it('entrega abaixo do mínimo bloqueia e diz quanto falta', () => {
    const pouco = [criarLinha(espresso, {}, 2)] // R$ 18,00
    const erros = validarCheckout(pouco, { ...base, modo: 'entrega', endereco: 'Rua X' }, loja)
    expect(erros).toEqual({ minimo: { faltam: 1200 } })
    expect(checkoutValido(erros)).toBe(false)
  })

  it('carrinho vazio é inválido', () => {
    expect(validarCheckout([], base, loja).carrinho).toBe('vazio')
  })

  it('troco precisa cobrir o total (com taxa)', () => {
    const dinheiro = { ...base, modo: 'entrega' as const, endereco: 'Rua X', pagamento: 'dinheiro' as const }
    expect(validarCheckout(linhas, { ...dinheiro, trocoPara: 50 }, loja)).toEqual({ trocoPara: 'menorQueTotal' })
    expect(validarCheckout(linhas, { ...dinheiro, trocoPara: 54 }, loja)).toEqual({})
    expect(validarCheckout(linhas, dinheiro, loja)).toEqual({})
  })
})
