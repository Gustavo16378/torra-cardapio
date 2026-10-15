import { describe, expect, it } from 'vitest'
import { criarLinha } from '../carrinho'
import {
  calcularTotais,
  formatarBRL,
  formatarPrecoCurto,
  formatarValor,
  lerValorDigitado,
  opcoesEscolhidas,
  paraCentavos,
  precoUnitario,
  subtotal,
} from '../precos'
import { cappuccino, espresso, loja, paoDeQueijo } from './fixtures'

describe('paraCentavos', () => {
  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(paraCentavos(9.5)).toBe(950)
    expect(paraCentavos(0.1 + 0.2)).toBe(30)
    expect(paraCentavos(19.99)).toBe(1999)
  })
})

describe('formatação BRL', () => {
  it('usa vírgula decimal, ponto de milhar e espaço comum após R$', () => {
    expect(formatarBRL(5400)).toBe('R$ 54,00')
    expect(formatarBRL(5)).toBe('R$ 0,05')
    expect(formatarBRL(123456)).toBe('R$ 1.234,56')
    expect(formatarBRL(100000000)).toBe('R$ 1.000.000,00')
    expect(formatarBRL(0)).toBe('R$ 0,00')
    expect(formatarBRL(5400).charCodeAt(2)).toBe(32)
  })

  it('formata negativos', () => {
    expect(formatarValor(-1250)).toBe('-12,50')
  })

  it('preço curto omite centavos redondos', () => {
    expect(formatarPrecoCurto(1600)).toBe('16')
    expect(formatarPrecoCurto(950)).toBe('9,50')
    expect(formatarPrecoCurto(120000)).toBe('1.200')
  })
})

describe('preço com opções', () => {
  it('soma os extras das opções escolhidas', () => {
    const escolhas = { tamanho: ['g'], leite: ['aveia'], extras: ['shot', 'canela'] }
    expect(precoUnitario(cappuccino, escolhas)).toBe(2700)
  })

  it('item sem grupos vale o preço base', () => {
    expect(precoUnitario(espresso, {})).toBe(900)
  })

  it('devolve as opções na ordem do cardápio, não na ordem do clique', () => {
    const escolhas = { extras: ['canela', 'shot'], leite: ['aveia'], tamanho: ['g'] }
    expect(opcoesEscolhidas(cappuccino, escolhas).map((o) => o.nome)).toEqual(['G', 'aveia', 'shot extra', 'canela'])
  })

  it('ignora opções que não existem', () => {
    expect(precoUnitario(cappuccino, { tamanho: ['gigante'] })).toBe(1600)
  })
})

describe('totais', () => {
  const linhas = [
    criarLinha(cappuccino, { tamanho: ['g'], leite: ['aveia'], extras: ['shot'] }, 2),
    criarLinha(paoDeQueijo, {}, 1),
  ]

  it('subtotal soma quantidade × unitário', () => {
    expect(subtotal(linhas)).toBe(6600)
  })

  it('entrega soma a taxa; retirada não', () => {
    expect(calcularTotais(linhas, 'entrega', loja)).toEqual({ subtotal: 6600, taxaEntrega: 800, total: 7400 })
    expect(calcularTotais(linhas, 'retirada', loja)).toEqual({ subtotal: 6600, taxaEntrega: 0, total: 6600 })
  })

  it('carrinho vazio não cobra taxa', () => {
    expect(calcularTotais([], 'entrega', loja).total).toBe(0)
  })
})

describe('lerValorDigitado', () => {
  it('entende os formatos que as pessoas digitam', () => {
    expect(lerValorDigitado('100')).toBe(100)
    expect(lerValorDigitado('100,50')).toBe(100.5)
    expect(lerValorDigitado('R$ 1.000,00')).toBe(1000)
    expect(lerValorDigitado('1.000')).toBe(1000)
    expect(lerValorDigitado('50.5')).toBe(50.5)
    expect(lerValorDigitado('')).toBeUndefined()
    expect(lerValorDigitado('abc')).toBeUndefined()
  })
})
