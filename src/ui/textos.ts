import { horaCurta, type ProximaAbertura, type SituacaoLoja } from '../core/horario'
import type { Loja, Turno } from '../core/tipos'
import { formatarBRL } from '../core/precos'

// Textos da interface do TORRA, num lugar só.

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`
}

export function quandoAbre(proxima?: ProximaAbertura): string {
  if (!proxima) return ''
  const dia = proxima.emDias === 0 ? 'hoje' : proxima.emDias === 1 ? 'amanhã' : DIAS[proxima.diaSemana]
  return `abre ${dia} às ${horaCurta(proxima.abre)}`
}

/** Linha de status do topo: "Aberto agora · fecha às 19h" / "Fechado · abre terça às 7h". */
export function textoStatus(situacao: SituacaoLoja): string {
  if (situacao.aceitaPedidos) return situacao.fechaAs ? `Aberto agora · fecha às ${horaCurta(situacao.fechaAs)}` : 'Aberto agora'
  const abre = quandoAbre(situacao.proximaAbertura)
  const inicio = situacao.aberta ? 'Pedidos encerrados por hoje' : 'Fechado'
  return abre ? `${inicio} · ${abre}` : inicio
}

/** Motivo do envio bloqueado pelo horário. */
export function textoFechadoParaEnvio(situacao: SituacaoLoja): string {
  const abre = quandoAbre(situacao.proximaAbertura)
  const inicio = situacao.aberta ? 'Pedidos encerrados por hoje' : 'Fechado agora'
  return abre ? `${inicio} · ${abre}` : inicio
}

export const textoFaltaMinimo = (centavos: number) => `Faltam ${formatarBRL(centavos)} para entrega`

const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0]

function descreverTurnos(turnos: Turno[]): string {
  if (turnos.length === 0) return 'fechado'
  return turnos.map((t) => `${horaCurta(t.abre)} – ${horaCurta(t.fecha)}`).join(' · ')
}

/** Agrupa dias seguidos com o mesmo horário: "Terça a sexta · 7h – 19h". */
export function horariosAgrupados(loja: Loja): { dias: string; horario: string }[] {
  const grupos: { dias: number[]; horario: string }[] = []
  for (const dia of ORDEM_SEMANA) {
    const horario = descreverTurnos(loja.horarios[dia] ?? [])
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo.horario === horario) ultimo.dias.push(dia)
    else grupos.push({ dias: [dia], horario })
  }
  return grupos.map(({ dias, horario }) => {
    const primeiro = NOMES_DIAS[dias[0] ?? 0] ?? ''
    const ultimo = DIAS[dias.at(-1) ?? 0] ?? ''
    const nome = dias.length === 1 ? primeiro : dias.length === 2 ? `${primeiro} e ${ultimo}` : `${primeiro} a ${ultimo}`
    return { dias: nome, horario }
  })
}

export const textos = {
  chamada: 'Cardápio · peça pelo WhatsApp',
  faixaDemo: 'Demonstração · o pedido chega no WhatsApp do Gustavo',
  voltarSite: 'torra-cafe.pages.dev',
  navCategorias: 'Categorias do cardápio',
  esgotado: 'Esgotado hoje',
  origensDaSemana: 'Origens da semana',
  origensNaLinha: (n: number) => `${n} origens · você escolhe`,
  adicionar: (nome: string) => `Adicionar ${nome} ao pedido`,
  escolherOpcoes: (nome: string) => `Escolher opções de ${nome}`,
  adicionado: (nome: string, itens: number) => `${nome} adicionado. ${plural(itens, 'item', 'itens')} no pedido.`,
  obrigatorio: 'Obrigatório',
  opcional: 'Opcional',
  quantosQuiser: 'Quantos quiser',
  escolhido: 'Escolhido',
  quantidade: 'Quantidade',
  observacao: 'Observação',
  observacaoDica: 'Ex.: bem quente, sem canela',
  botaoAdicionar: (preco: string) => `Adicionar · ${preco}`,
  faltaEscolher: (grupos: string[]) => `Escolha ${grupos.join(' e ').toLowerCase()} para adicionar`,
  barra: (itens: number, total: string) => `${plural(itens, 'item', 'itens')} · ${total}`,
  verPedido: 'Ver pedido',
  comanda: 'Comanda',
  comandaVazia: 'Nada anotado ainda.',
  comandaVaziaDica: 'Toque no + de um item e ele aparece aqui.',
  seuPedido: 'Seu pedido',
  pedidoVazio: 'Seu pedido está vazio.',
  voltarCardapio: 'Voltar ao cardápio',
  adicionarMais: 'Adicionar mais itens',
  remover: 'Remover',
  limparPedido: 'Limpar pedido',
  pedidoLimpo: 'Pedido limpo.',
  desfazer: 'Desfazer',
  pedidoAnterior: 'Guardamos o pedido da sua última visita.',
  comecarDoZero: 'Começar do zero',
  descartadas: (n: number) =>
    n === 1
      ? 'Um item do seu pedido anterior saiu do cardápio de hoje e foi retirado.'
      : `${n} itens do seu pedido anterior saíram do cardápio de hoje e foram retirados.`,
  continuar: (total: string) => `Continuar · ${total}`,
  finalizar: 'Finalizar',
  nome: 'Seu nome',
  nomeDica: 'Como te chamamos no pedido',
  erroNome: 'Diga como te chamamos no pedido.',
  erroEndereco: 'Precisamos do endereço para entregar.',
  comoReceber: 'Como você quer receber',
  retirada: 'Retirada',
  retiradaDetalhe: 'No balcão, em Pinheiros',
  entrega: 'Entrega',
  entregaDetalhe: (taxa: string, minimo: string) => `${taxa} · mínimo ${minimo}`,
  endereco: 'Endereço de entrega',
  enderecoDica: 'Rua, número, complemento',
  ouRetirada: 'ou escolha retirada',
  pagamento: 'Pagamento',
  pix: 'Pix',
  cartao: (entrega: boolean) => (entrega ? 'Cartão na entrega' : 'Cartão na retirada'),
  dinheiro: 'Dinheiro',
  trocoPara: 'Troco para',
  trocoDica: 'Opcional, ex.: 100',
  trocoBaixo: (total: string) => `O troco precisa ser de pelo menos ${total}.`,
  obsGeral: 'Observação do pedido',
  obsGeralDica: 'Ex.: tocar o interfone, sem açúcar no café',
  subtotal: 'Subtotal',
  taxaEntrega: 'Entrega',
  total: 'Total',
  esquecerDados: 'Esquecer meu nome e endereço neste aparelho',
  enviar: 'Enviar pedido no WhatsApp',
  preencha: (campos: string[]) => `Preencha ${campos.join(' e ')}`,
  confirmeTroco: 'Confira o valor do troco',
  enviadoTitulo: 'Pedido enviado?',
  enviadoTexto:
    'O WhatsApp abriu com a sua comanda pronta. Toque em enviar por lá e depois confirme aqui, para a gente limpar o seu carrinho.',
  simEnviei: 'Sim, enviei',
  aindaNao: 'Ainda não',
  abrirDeNovo: 'Abrir o WhatsApp de novo',
  obrigado: (nome: string) => (nome ? `Obrigado, ${nome}.` : 'Obrigado.'),
  obrigadoTexto: 'A barra confirma o seu pedido pelo WhatsApp. Até já.',
  fechar: 'Fechar',
  voltar: 'Voltar',
  horarios: 'Horários',
  corte: (min: number) => `Pedidos pelo WhatsApp até ${min} min antes de fechar.`,
  enderecoTitulo: 'Endereço',
  entregaTitulo: 'Entrega',
  entregaRodape: (taxa: string, minimo: string) => `Taxa de ${taxa} · pedido mínimo de ${minimo}`,
  ficha: { origem: 'Origem', torra: 'Torra', notas: 'Notas', processo: 'Processo', altitude: 'Altitude' },
}
