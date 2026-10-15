import { describe, expect, it } from 'vitest'
import { encontrarItem } from '../../core/carrinho'
import { carregarCardapio } from '../carregarCardapio'
import { cardapio } from '../cardapio'
import { loja } from '../loja'

const itens = cardapio.flatMap((c) => c.itens)

describe('cardápio do TORRA', () => {
  it('ids únicos de categoria e item', () => {
    const ids = [...cardapio.map((c) => c.id), ...itens.map((i) => i.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('opções únicas dentro de cada grupo e preços válidos', () => {
    for (const item of itens) {
      expect(item.preco, item.id).toBeGreaterThan(0)
      for (const grupo of item.grupos ?? []) {
        const ids = grupo.opcoes.map((o) => o.id)
        expect(new Set(ids).size, `${item.id}/${grupo.id}`).toBe(ids.length)
        for (const opcao of grupo.opcoes) expect(opcao.precoExtra).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('preços batem com o Spec', () => {
    const precos: Record<string, number> = {
      espresso: 9, 'espresso-duplo': 13, macchiato: 11, cortado: 13, cappuccino: 16, latte: 17, mocha: 19,
      v60: 16, chemex: 28, 'prensa-francesa': 18,
      'cold-brew': 16, 'espresso-tonica': 18, 'iced-latte': 18,
      'pao-de-queijo': 12, croissant: 14, 'toast-ricota-mel': 26, 'bolo-laranja': 15, cookie: 11,
      'graos-mantiqueira': 62, 'graos-cerrado': 58,
    }
    expect(Object.fromEntries(itens.map((i) => [i.id, i.preco]))).toEqual(precos)
  })

  it('cookie esgotado para testar o estado "Esgotado hoje"', () => {
    expect(encontrarItem(cardapio, 'cookie')?.disponivel).toBe(false)
  })

  it('coados e grãos têm ficha técnica', () => {
    for (const id of ['graos-mantiqueira', 'graos-cerrado']) expect(encontrarItem(cardapio, id)?.ficha).toBeDefined()
    for (const id of ['v60', 'chemex', 'prensa-francesa']) {
      const origem = encontrarItem(cardapio, id)?.grupos?.find((g) => g.id === 'origem')
      expect(origem?.opcoes.every((o) => o.ficha)).toBe(true)
    }
  })

  it('carregarCardapio devolve o cardápio', async () => {
    await expect(carregarCardapio()).resolves.toBe(cardapio)
  })
})

describe('loja do TORRA', () => {
  it('segunda fechada, terça a sexta 7h–19h, fim de semana 8h–18h, corte de 15 min', () => {
    expect(loja.horarios[1]).toEqual([])
    for (const dia of [2, 3, 4, 5]) expect(loja.horarios[dia]).toEqual([{ abre: '07:00', fecha: '19:00' }])
    for (const dia of [0, 6]) expect(loja.horarios[dia]).toEqual([{ abre: '08:00', fecha: '18:00' }])
    expect(loja.minutosCorte).toBe(15)
    expect(loja.fuso).toBe('America/Sao_Paulo')
  })
})
