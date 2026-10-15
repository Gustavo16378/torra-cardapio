import { describe, expect, it } from 'vitest'
import { criarLinha } from '../carrinho'
import type { DadosCheckout, Pedido } from '../tipos'
import { linkWhatsApp, montarMensagem } from '../whatsapp'
import { cappuccino, espresso, loja, paoDeQueijo } from './fixtures'

const linhasDoSpec = [
  criarLinha(cappuccino, { tamanho: ['g'], leite: ['aveia'], extras: ['shot'] }, 2, 'bem quente'),
  criarLinha(paoDeQueijo, {}, 1),
]

const entregaDoSpec: DadosCheckout = {
  nome: 'Ana',
  modo: 'entrega',
  endereco: 'Rua X, 123, ap 4',
  pagamento: 'pix',
  obs: 'sem açúcar no café',
}

describe('montarMensagem', () => {
  it('reproduz exatamente o exemplo do Spec', () => {
    const pedido: Pedido = { linhas: linhasDoSpec, checkout: entregaDoSpec }
    expect(montarMensagem(pedido, loja)).toBe(
      [
        '*Novo pedido · TORRA.*',
        '',
        '2x Cappuccino (G, aveia, shot extra) · R$ 54,00',
        '   obs: bem quente',
        '1x Pão de queijo (3 un) · R$ 12,00',
        '',
        'Subtotal: R$ 66,00',
        'Entrega: R$ 8,00',
        '*Total: R$ 74,00*',
        '',
        'Nome: Ana',
        'Tipo: Entrega',
        'Endereço: Rua X, 123, ap 4',
        'Pagamento: Pix',
        'Obs: sem açúcar no café',
      ].join('\n'),
    )
  })

  it('retirada não tem linhas de entrega nem endereço; obs vazia some', () => {
    const pedido: Pedido = {
      linhas: [criarLinha(espresso, {}, 1)],
      checkout: { ...entregaDoSpec, modo: 'retirada', endereco: 'ignorado', obs: '  ' },
    }
    expect(montarMensagem(pedido, loja)).toBe(
      [
        '*Novo pedido · TORRA.*',
        '',
        '1x Espresso · R$ 9,00',
        '',
        'Subtotal: R$ 9,00',
        '*Total: R$ 9,00*',
        '',
        'Nome: Ana',
        'Tipo: Retirada',
        'Pagamento: Pix',
      ].join('\n'),
    )
  })

  it('descreve cartão e dinheiro com e sem troco', () => {
    const pagamento = (checkout: Partial<DadosCheckout>) =>
      montarMensagem({ linhas: linhasDoSpec, checkout: { ...entregaDoSpec, ...checkout } }, loja)
        .split('\n')
        .find((l) => l.startsWith('Pagamento:'))

    expect(pagamento({ pagamento: 'cartao' })).toBe('Pagamento: Cartão na entrega')
    expect(pagamento({ pagamento: 'cartao', modo: 'retirada' })).toBe('Pagamento: Cartão na retirada')
    expect(pagamento({ pagamento: 'dinheiro' })).toBe('Pagamento: Dinheiro')
    expect(pagamento({ pagamento: 'dinheiro', trocoPara: 100 })).toBe('Pagamento: Dinheiro (troco para R$ 100,00)')
  })

  it('quebras de linha digitadas não quebram o formato', () => {
    const pedido: Pedido = {
      linhas: linhasDoSpec,
      checkout: { ...entregaDoSpec, nome: ' Ana\nMaria ', endereco: 'Rua X,\n123', obs: 'tocar\n\ninterfone' },
    }
    const mensagem = montarMensagem(pedido, loja)
    expect(mensagem).toContain('Nome: Ana Maria\n')
    expect(mensagem).toContain('Endereço: Rua X, 123\n')
    expect(mensagem.endsWith('Obs: tocar interfone')).toBe(true)
  })

  it('não tem emojis', () => {
    const mensagem = montarMensagem({ linhas: linhasDoSpec, checkout: entregaDoSpec }, loja)
    expect(mensagem).not.toMatch(/\p{Extended_Pictographic}/u)
  })
})

describe('linkWhatsApp', () => {
  it('codifica acentos, quebras de linha e símbolos, e volta idêntico', () => {
    const mensagem = montarMensagem({ linhas: linhasDoSpec, checkout: entregaDoSpec }, loja)
    const link = linkWhatsApp(loja.whatsapp, mensagem)
    expect(link.startsWith('https://wa.me/5563991114551?text=')).toBe(true)

    const texto = link.split('?text=')[1] ?? ''
    // '*' (negrito do WhatsApp) é permitido cru numa URL; espaço, quebra e acentos não.
    expect(texto).not.toMatch(/[\s·ãçé]/)
    expect(texto).toContain('%0A')
    expect(texto).toContain('P%C3%A3o') // Pão
    expect(texto).toContain('%C2%B7') // ·
    expect(decodeURIComponent(texto)).toBe(mensagem)
  })

  it('codifica & e # que cortariam a URL', () => {
    const link = linkWhatsApp('55 (63) 99111-4551', 'café & pão #1')
    expect(link).toBe('https://wa.me/5563991114551?text=caf%C3%A9%20%26%20p%C3%A3o%20%231')
  })
})
