import type { Categoria, FichaTecnica, GrupoOpcoes } from '../core/tipos'

// Conteúdo fictício do TORRA. Nomes de opção em minúsculas (exceto siglas e nomes próprios),
// porque entram assim na mensagem do WhatsApp: "(G, aveia, shot extra)".

const fichaMantiqueira: FichaTecnica = {
  origem: 'Carmo de Minas · Mantiqueira de Minas, MG',
  torra: 'média',
  notas: 'caramelo, laranja, mel',
  processo: 'natural',
  altitude: '1.200 m',
}

const fichaCerrado: FichaTecnica = {
  origem: 'Patrocínio · Cerrado Mineiro, MG',
  torra: 'média',
  notas: 'chocolate ao leite, castanhas, rapadura',
  processo: 'natural',
  altitude: '1.000 m',
}

const fichaChapada: FichaTecnica = {
  origem: 'Piatã · Chapada Diamantina, BA',
  torra: 'clara',
  notas: 'frutas amarelas, jasmim, acidez cítrica',
  processo: 'cereja descascado',
  altitude: '1.350 m',
}

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
    { id: 'shot-extra', nome: 'shot extra', precoExtra: 4 },
    { id: 'canela', nome: 'canela', precoExtra: 0 },
  ],
}

const origem: GrupoOpcoes = {
  id: 'origem',
  nome: 'Origem',
  tipo: 'unica',
  obrigatorio: true,
  opcoes: [
    { id: 'mantiqueira', nome: 'Mantiqueira', precoExtra: 0, ficha: fichaMantiqueira },
    { id: 'cerrado-mineiro', nome: 'Cerrado Mineiro', precoExtra: 0, ficha: fichaCerrado },
    { id: 'chapada-diamantina', nome: 'Chapada Diamantina', precoExtra: 4, ficha: fichaChapada },
  ],
}

const moagem: GrupoOpcoes = {
  id: 'moagem',
  nome: 'Moagem',
  tipo: 'unica',
  obrigatorio: true,
  opcoes: [
    { id: 'graos', nome: 'em grãos', precoExtra: 0 },
    { id: 'espresso', nome: 'espresso', precoExtra: 0 },
    { id: 'coado', nome: 'coado', precoExtra: 0 },
    { id: 'prensa', nome: 'prensa', precoExtra: 0 },
  ],
}

const comLeite = [tamanho, leite, extras]

export const cardapio: Categoria[] = [
  {
    id: 'espressos',
    nome: 'Espressos',
    descricao: 'Blend da casa, torra média, extraído a 93 °C.',
    itens: [
      { id: 'espresso', nome: 'Espresso', descricao: 'Blend da casa, torra média.', preco: 9, disponivel: true },
      { id: 'espresso-duplo', nome: 'Espresso duplo', descricao: 'Dose dupla do blend da casa.', preco: 13, disponivel: true },
      { id: 'macchiato', nome: 'Macchiato', descricao: 'Espresso marcado com uma colher de espuma.', preco: 11, disponivel: true },
      { id: 'cortado', nome: 'Cortado', descricao: 'Espresso e leite vaporizado em partes iguais.', preco: 13, disponivel: true },
      { id: 'cappuccino', nome: 'Cappuccino', descricao: 'Espresso, leite vaporizado e espuma fina.', preco: 16, disponivel: true, grupos: comLeite },
      { id: 'latte', nome: 'Latte', descricao: 'Mais leite, textura sedosa, espresso por baixo.', preco: 17, disponivel: true, grupos: comLeite },
      { id: 'mocha', nome: 'Mocha', descricao: 'Espresso, chocolate 70% e leite vaporizado.', preco: 19, disponivel: true, grupos: comLeite },
    ],
  },
  {
    id: 'coados',
    nome: 'Coados',
    descricao: 'Três origens na barra esta semana. Você escolhe o grão, a gente passa na hora.',
    itens: [
      { id: 'v60', nome: 'V60', descricao: 'Preparado na hora, notas da origem escolhida.', preco: 16, disponivel: true, grupos: [origem] },
      { id: 'chemex', nome: 'Chemex (serve 2)', descricao: 'Filtro grosso, xícara limpa e doce. Para dividir.', preco: 28, disponivel: true, grupos: [origem] },
      { id: 'prensa-francesa', nome: 'Prensa francesa', descricao: 'Quatro minutos de imersão, corpo cheio.', preco: 18, disponivel: true, grupos: [origem] },
    ],
  },
  {
    id: 'gelados',
    nome: 'Gelados',
    itens: [
      { id: 'cold-brew', nome: 'Cold brew', descricao: '16 horas de extração a frio.', preco: 16, disponivel: true },
      { id: 'espresso-tonica', nome: 'Espresso tônica', descricao: 'Espresso sobre tônica e gelo, com casca de laranja.', preco: 18, disponivel: true },
      { id: 'iced-latte', nome: 'Iced latte', descricao: 'Espresso, leite gelado e gelo.', preco: 18, disponivel: true, grupos: [leite] },
    ],
  },
  {
    id: 'para-comer',
    nome: 'Para comer',
    itens: [
      { id: 'pao-de-queijo', nome: 'Pão de queijo (3 un)', descricao: 'Assado na hora, com queijo canastra.', preco: 12, tags: ['da casa', 'sem glúten'], disponivel: true },
      { id: 'croissant', nome: 'Croissant de manteiga', descricao: 'Folhado na manteiga, assado de manhã.', preco: 14, disponivel: true },
      { id: 'toast-ricota-mel', nome: 'Toast de fermentação natural com ricota e mel', descricao: 'Pão de longa fermentação, ricota fresca, mel e flor de sal.', preco: 26, disponivel: true },
      { id: 'bolo-laranja', nome: 'Bolo de laranja com calda (fatia)', descricao: 'Úmido, com calda de laranja-pera.', preco: 15, disponivel: true },
      { id: 'cookie', nome: 'Cookie de chocolate meio amargo', descricao: 'Borda crocante, miolo macio.', preco: 11, disponivel: false },
    ],
  },
  {
    id: 'graos',
    nome: 'Grãos para levar',
    descricao: 'Torrados nesta semana, em pacotes de 250 g. Moemos na hora para o seu método.',
    itens: [
      { id: 'graos-mantiqueira', nome: 'TORRA. Mantiqueira 250 g', preco: 62, disponivel: true, grupos: [moagem], ficha: fichaMantiqueira },
      { id: 'graos-cerrado', nome: 'TORRA. Cerrado 250 g', preco: 58, disponivel: true, grupos: [moagem], ficha: fichaCerrado },
    ],
  },
]
