import { calcularTotais, formatarBRL, paraCentavos, totalLinha } from './precos'
import type { DadosCheckout, ItemCarrinho, Loja, Pedido } from './tipos'

/** Texto livre vira uma linha só, para não quebrar o formato da mensagem. */
function emUmaLinha(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim()
}

function linhaDoItem(linha: ItemCarrinho): string {
  const opcoes = linha.opcoes.length > 0 ? ` (${linha.opcoes.join(', ')})` : ''
  const principal = `${linha.quantidade}x ${linha.nome}${opcoes} · ${formatarBRL(totalLinha(linha))}`
  const obs = emUmaLinha(linha.obs)
  return obs ? `${principal}\n   obs: ${obs}` : principal
}

function descreverPagamento(checkout: DadosCheckout): string {
  switch (checkout.pagamento) {
    case 'pix':
      return 'Pix'
    case 'cartao':
      return checkout.modo === 'entrega' ? 'Cartão na entrega' : 'Cartão na retirada'
    case 'dinheiro':
      return checkout.trocoPara !== undefined
        ? `Dinheiro (troco para ${formatarBRL(paraCentavos(checkout.trocoPara))})`
        : 'Dinheiro'
  }
}

/** Mensagem do pedido, pronta para o WhatsApp (negrito com *asteriscos*, sem emojis). */
export function montarMensagem(pedido: Pedido, loja: Loja): string {
  const { linhas, checkout } = pedido
  const totais = calcularTotais(linhas, checkout.modo, loja)
  const entrega = checkout.modo === 'entrega'

  const blocos = [
    [`*Novo pedido · ${loja.nome}*`],
    linhas.map(linhaDoItem),
    [
      `Subtotal: ${formatarBRL(totais.subtotal)}`,
      ...(entrega ? [`Entrega: ${formatarBRL(totais.taxaEntrega)}`] : []),
      `*Total: ${formatarBRL(totais.total)}*`,
    ],
    [
      `Nome: ${emUmaLinha(checkout.nome)}`,
      `Tipo: ${entrega ? 'Entrega' : 'Retirada'}`,
      ...(entrega ? [`Endereço: ${emUmaLinha(checkout.endereco)}`] : []),
      `Pagamento: ${descreverPagamento(checkout)}`,
      ...(emUmaLinha(checkout.obs) ? [`Obs: ${emUmaLinha(checkout.obs)}`] : []),
    ],
  ]

  return blocos.map((bloco) => bloco.join('\n')).join('\n\n')
}

/** Link wa.me com a mensagem codificada. O número precisa ter só dígitos (DDI + DDD + número). */
export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
}
