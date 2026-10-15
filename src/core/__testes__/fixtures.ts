import type { GrupoOpcoes, Item, Loja } from '../tipos'

// Dados de teste. Ficam aqui (e não em dados/) porque core/ não pode depender de dados/.

const tamanho: GrupoOpcoes = {
  id: 'tamanho',
  nome: 'Tamanho',
  tipo: 'unica',
  obrigatorio: true,
  opcoes: [
    { id: 'p', nome: 'P', precoExtra: 0 },
    { id: 'g', nome: 'G', precoExtra: 4 },
  ],
}

const leite: GrupoOpcoes = {
  id: 'leite',
  nome: 'Leite',
  tipo: 'unica',
  obrigatorio: true,
  opcoes: [
    { id: 'integral', nome: 'integral', precoExtra: 0 },
    { id: 'aveia', nome: 'aveia', precoExtra: 3 },
    { id: 'sem-lactose', nome: 'sem lactose', precoExtra: 2 },
  ],
}

const extras: GrupoOpcoes = {
  id: 'extras',
  nome: 'Extras',
  tipo: 'multipla',
  obrigatorio: false,
  opcoes: [
    { id: 'shot', nome: 'shot extra', precoExtra: 4 },
    { id: 'canela', nome: 'canela', precoExtra: 0 },
  ],
}

export const cappuccino: Item = {
  id: 'cappuccino',
  nome: 'Cappuccino',
  preco: 16,
  disponivel: true,
  grupos: [tamanho, leite, extras],
}

export const paoDeQueijo: Item = {
  id: 'pao-de-queijo',
  nome: 'Pão de queijo (3 un)',
  preco: 12,
  disponivel: true,
}

export const espresso: Item = { id: 'espresso', nome: 'Espresso', preco: 9, disponivel: true }

export const cookie: Item = { id: 'cookie', nome: 'Cookie', preco: 11, disponivel: false }

export const categorias = [
  { id: 'bebidas', nome: 'Bebidas', itens: [espresso, cappuccino] },
  { id: 'comer', nome: 'Para comer', itens: [paoDeQueijo, cookie] },
]

/** Terça a sexta 7h–19h, sábado e domingo 8h–18h, segunda fechado. */
export const loja: Loja = {
  nome: 'TORRA.',
  whatsapp: '5563991114551',
  endereco: 'Rua de Teste, 1',
  fuso: 'America/Sao_Paulo',
  horarios: [
    [{ abre: '08:00', fecha: '18:00' }],
    [],
    [{ abre: '07:00', fecha: '19:00' }],
    [{ abre: '07:00', fecha: '19:00' }],
    [{ abre: '07:00', fecha: '19:00' }],
    [{ abre: '07:00', fecha: '19:00' }],
    [{ abre: '08:00', fecha: '18:00' }],
  ],
  minutosCorte: 15,
  datasFechadas: [],
  entrega: { taxa: 8, pedidoMinimo: 30 },
}
