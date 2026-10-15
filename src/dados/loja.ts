import type { Loja } from '../core/tipos'

const semana = { abre: '07:00', fecha: '19:00' }
const fimDeSemana = { abre: '08:00', fecha: '18:00' }

export const loja: Loja = {
  nome: 'TORRA.',
  // Número de teste do Gustavo; trocar pelo da cafeteria em cada cliente.
  whatsapp: '5563991114551',
  endereco: 'Rua dos Pinheiros, 000 · Pinheiros, São Paulo',
  fuso: 'America/Sao_Paulo',
  // 0 = domingo … 6 = sábado. Segunda fechado.
  horarios: [[fimDeSemana], [], [semana], [semana], [semana], [semana], [fimDeSemana]],
  minutosCorte: 15,
  // Feriados e folgas, 'AAAA-MM-DD' no fuso da loja.
  datasFechadas: [],
  entrega: { taxa: 8, pedidoMinimo: 30 },
}

export const urlSite = 'https://torra-cafe.pages.dev'

/**
 * Modo demonstração: a loja aparece sempre aberta, o envio nunca é bloqueado por horário
 * e uma faixa avisa que o pedido vai para o WhatsApp de teste. O motor (core/horario.ts)
 * continua calculando o horário real; só a interface decide ignorá-lo.
 */
export const modoDemo = true
