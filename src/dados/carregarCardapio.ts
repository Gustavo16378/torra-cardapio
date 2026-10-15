import type { Categoria } from '../core/tipos'
import { cardapio } from './cardapio'

/**
 * Única porta de entrada do cardápio. Hoje lê `cardapio.ts`; na fase 2 passa a ler a planilha
 * do Google sem que nenhum componente mude.
 */
export async function carregarCardapio(): Promise<Categoria[]> {
  return cardapio
}
