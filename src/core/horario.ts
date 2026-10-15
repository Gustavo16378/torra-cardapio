import type { Loja, Turno } from './tipos'

// Tudo é calculado no fuso da loja, nunca no do aparelho de quem abre o cardápio.

export type MomentoLocal = {
  /** 'AAAA-MM-DD' no fuso da loja */
  data: string
  /** 0 = domingo … 6 = sábado */
  diaSemana: number
  /** Minutos desde a meia-noite no fuso da loja */
  minutos: number
}

export type ProximaAbertura = {
  /** 0 = hoje, 1 = amanhã, … */
  emDias: number
  diaSemana: number
  abre: string
}

export type SituacaoLoja = {
  /** Dentro de um turno de funcionamento. */
  aberta: boolean
  /** Aberta e antes do corte: dá para enviar pedido agora. */
  aceitaPedidos: boolean
  /** Fim do turno atual, 'HH:MM' (só quando aberta). */
  fechaAs?: string
  /** Último horário para enviar pedido no turno atual, 'HH:MM' (só quando aberta). */
  pedidosAte?: string
  /** Quando volta a aceitar pedidos (só quando não aceita agora). */
  proximaAbertura?: ProximaAbertura
}

const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const formatadores = new Map<string, Intl.DateTimeFormat>()

function formatador(fuso: string): Intl.DateTimeFormat {
  let f = formatadores.get(fuso)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: fuso,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    formatadores.set(fuso, f)
  }
  return f
}

export function momentoNaLoja(agora: Date, fuso: string): MomentoLocal {
  const partes: Record<string, string> = {}
  for (const parte of formatador(fuso).formatToParts(agora)) partes[parte.type] = parte.value
  const hora = Number(partes.hour) % 24
  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    diaSemana: DIAS_EN.indexOf(partes.weekday ?? ''),
    minutos: hora * 60 + Number(partes.minute),
  }
}

export function paraMinutos(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function deMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** '19:00' → '19h', '18:45' → '18h45', '07:00' → '7h' */
export function horaCurta(hhmm: string): string {
  const minutos = paraMinutos(hhmm)
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

function somarDias(data: string, dias: number): { data: string; diaSemana: number } {
  const [a = 1970, m = 1, d = 1] = data.split('-').map(Number)
  const dt = new Date(Date.UTC(a, m - 1, d + dias))
  return { data: dt.toISOString().slice(0, 10), diaSemana: dt.getUTCDay() }
}

function turnosDoDia(loja: Loja, data: string, diaSemana: number): Turno[] {
  if (loja.datasFechadas.includes(data)) return []
  return [...(loja.horarios[diaSemana] ?? [])].sort((a, b) => paraMinutos(a.abre) - paraMinutos(b.abre))
}

function buscarProximaAbertura(loja: Loja, agora: MomentoLocal): ProximaAbertura | undefined {
  // Um ano à frente cobre qualquer combinação razoável de datas fechadas.
  for (let emDias = 0; emDias <= 366; emDias++) {
    const dia = somarDias(agora.data, emDias)
    const turno = turnosDoDia(loja, dia.data, dia.diaSemana).find(
      (t) => emDias > 0 || paraMinutos(t.abre) > agora.minutos,
    )
    if (turno) return { emDias, diaSemana: dia.diaSemana, abre: turno.abre }
  }
  return undefined
}

export function situacaoLoja(loja: Loja, agora: Date = new Date()): SituacaoLoja {
  const momento = momentoNaLoja(agora, loja.fuso)
  const atual = turnosDoDia(loja, momento.data, momento.diaSemana).find(
    (t) => momento.minutos >= paraMinutos(t.abre) && momento.minutos < paraMinutos(t.fecha),
  )

  if (!atual) {
    return { aberta: false, aceitaPedidos: false, proximaAbertura: buscarProximaAbertura(loja, momento) }
  }

  const limite = paraMinutos(atual.fecha) - loja.minutosCorte
  const base = { aberta: true, fechaAs: atual.fecha, pedidosAte: deMinutos(Math.max(0, limite)) }
  if (momento.minutos < limite) return { ...base, aceitaPedidos: true }
  return { ...base, aceitaPedidos: false, proximaAbertura: buscarProximaAbertura(loja, momento) }
}
