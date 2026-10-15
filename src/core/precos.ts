import type { Escolhas, Item, ItemCarrinho, Loja, ModoPedido, Opcao, Totais } from './tipos'

// Todo cálculo interno é feito em centavos inteiros; os dados chegam em reais.

export function paraCentavos(reais: number): number {
  return Math.round(reais * 100)
}

/** Opções escolhidas, na ordem dos grupos e das opções no cardápio (não na ordem do clique). */
export function opcoesEscolhidas(item: Item, escolhas: Escolhas): Opcao[] {
  const resultado: Opcao[] = []
  for (const grupo of item.grupos ?? []) {
    const ids = escolhas[grupo.id] ?? []
    for (const opcao of grupo.opcoes) {
      if (ids.includes(opcao.id)) resultado.push(opcao)
    }
  }
  return resultado
}

/** Preço de uma unidade do item com as opções escolhidas, em centavos. */
export function precoUnitario(item: Item, escolhas: Escolhas): number {
  return opcoesEscolhidas(item, escolhas).reduce(
    (soma, opcao) => soma + paraCentavos(opcao.precoExtra),
    paraCentavos(item.preco),
  )
}

export function totalLinha(linha: Pick<ItemCarrinho, 'precoUnitario' | 'quantidade'>): number {
  return linha.precoUnitario * linha.quantidade
}

export function subtotal(linhas: ItemCarrinho[]): number {
  return linhas.reduce((soma, linha) => soma + totalLinha(linha), 0)
}

export function calcularTotais(linhas: ItemCarrinho[], modo: ModoPedido, loja: Loja): Totais {
  const sub = subtotal(linhas)
  const taxaEntrega = modo === 'entrega' && linhas.length > 0 ? paraCentavos(loja.entrega.taxa) : 0
  return { subtotal: sub, taxaEntrega, total: sub + taxaEntrega }
}

/** '54,00', '1.234,50'. Sem depender do Intl, para não inserir espaço não separável. */
export function formatarValor(centavos: number): string {
  const negativo = centavos < 0
  const abs = Math.abs(Math.round(centavos))
  const inteiro = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimal = (abs % 100).toString().padStart(2, '0')
  return `${negativo ? '-' : ''}${inteiro},${decimal}`
}

/** 'R$ 54,00' */
export function formatarBRL(centavos: number): string {
  return `R$ ${formatarValor(centavos)}`
}

/** Preço curto para listas de cardápio: '16' quando redondo, '16,50' quando não. */
export function formatarPrecoCurto(centavos: number): string {
  return centavos % 100 === 0 ? formatarValor(centavos).slice(0, -3) : formatarValor(centavos)
}

/** Converte texto digitado ('100', '100,50', 'R$ 1.000,00') em reais; undefined se não der. */
export function lerValorDigitado(texto: string): number | undefined {
  const limpo = texto.replace(/[^\d,.]/g, '')
  if (!limpo) return undefined
  // Formato brasileiro: ponto é milhar, vírgula é decimal.
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo.replace(/\.(?=\d{3}(\D|$))/g, '')
  const valor = Number(normalizado)
  return Number.isFinite(valor) ? valor : undefined
}
