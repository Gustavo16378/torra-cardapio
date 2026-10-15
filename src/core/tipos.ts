// Tipos do motor. Nada aqui conhece React, estilo ou o conteúdo de um cliente específico.

/** Ficha técnica de um café: origem, torra, notas sensoriais. */
export type FichaTecnica = {
  origem: string
  torra: string
  notas: string
  processo?: string
  altitude?: string
}

export type Opcao = {
  id: string
  nome: string
  /** Em reais, ex.: 3 ou 2.5 */
  precoExtra: number
  ficha?: FichaTecnica
}

export type GrupoOpcoes = {
  id: string
  nome: string
  tipo: 'unica' | 'multipla'
  obrigatorio: boolean
  opcoes: Opcao[]
}

export type Item = {
  id: string
  nome: string
  descricao?: string
  /** Em reais, ex.: 9.5 */
  preco: number
  imagem?: string
  tags?: string[]
  disponivel: boolean
  grupos?: GrupoOpcoes[]
  ficha?: FichaTecnica
}

export type Categoria = { id: string; nome: string; descricao?: string; itens: Item[] }

/** Opções escolhidas de um item: id do grupo → ids das opções, na ordem do cardápio. */
export type Escolhas = Record<string, string[]>

/** Linha do carrinho, já resolvida contra o cardápio. Valores em centavos. */
export type ItemCarrinho = {
  /** Identidade da linha: item + escolhas + obs. Linhas com a mesma chave se juntam. */
  chave: string
  itemId: string
  nome: string
  escolhas: Escolhas
  /** Nomes das opções escolhidas, na ordem dos grupos. */
  opcoes: string[]
  precoUnitario: number
  quantidade: number
  obs: string
}

/** O mínimo para guardar uma linha no navegador e reconstruí-la depois. */
export type LinhaSalva = {
  itemId: string
  escolhas: Escolhas
  quantidade: number
  obs: string
}

/** Turno de funcionamento no mesmo dia, 'HH:MM' a 'HH:MM' (fecha > abre). */
export type Turno = { abre: string; fecha: string }

export type Loja = {
  nome: string
  /** Só dígitos, com DDI e DDD, ex.: '5511999999999' */
  whatsapp: string
  endereco: string
  /** Fuso IANA, ex.: 'America/Sao_Paulo' */
  fuso: string
  /** Índice 0 = domingo … 6 = sábado. Lista vazia = fechado no dia. */
  horarios: Turno[][]
  /** Pedidos param de ser aceitos X minutos antes de cada turno fechar. */
  minutosCorte: number
  /** Datas fechadas no fuso da loja, 'AAAA-MM-DD'. */
  datasFechadas: string[]
  entrega: {
    /** Em reais */
    taxa: number
    /** Em reais, sobre o subtotal sem a taxa */
    pedidoMinimo: number
  }
}

export type ModoPedido = 'retirada' | 'entrega'
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro'

export type DadosCheckout = {
  nome: string
  modo: ModoPedido
  endereco: string
  pagamento: FormaPagamento
  /** Em reais; só faz sentido com pagamento em dinheiro. */
  trocoPara?: number
  obs: string
}

export type Pedido = {
  linhas: ItemCarrinho[]
  checkout: DadosCheckout
}

/** Totais em centavos. */
export type Totais = {
  subtotal: number
  taxaEntrega: number
  total: number
}
