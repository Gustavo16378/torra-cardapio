import { describe, expect, it } from 'vitest'
import { horaCurta, momentoNaLoja, situacaoLoja } from '../horario'
import { loja } from './fixtures'

// Datas de referência (outubro de 2026, Brasília = UTC−3, sem horário de verão):
// seg 12, ter 13, qua 14, qui 15, sex 16, sáb 17, dom 18.
const em = (iso: string) => new Date(`${iso}-03:00`)

describe('momentoNaLoja', () => {
  it('calcula no fuso da loja, não no do aparelho', () => {
    // 02:30 UTC de sexta ainda é 23:30 de quinta em São Paulo.
    expect(momentoNaLoja(new Date('2026-10-16T02:30:00Z'), 'America/Sao_Paulo')).toEqual({
      data: '2026-10-15',
      diaSemana: 4,
      minutos: 23 * 60 + 30,
    })
  })

  it('meia-noite é 0 minutos', () => {
    expect(momentoNaLoja(em('2026-10-15T00:00:00'), 'America/Sao_Paulo').minutos).toBe(0)
  })
})

describe('situacaoLoja', () => {
  it('aberta e aceitando pedidos no meio do turno', () => {
    expect(situacaoLoja(loja, em('2026-10-15T10:00:00'))).toEqual({
      aberta: true,
      aceitaPedidos: true,
      fechaAs: '19:00',
      pedidosAte: '18:45',
    })
  })

  it('abre exatamente no horário de abertura', () => {
    expect(situacaoLoja(loja, em('2026-10-15T07:00:00')).aceitaPedidos).toBe(true)
    expect(situacaoLoja(loja, em('2026-10-15T06:59:00')).aceitaPedidos).toBe(false)
  })

  it('para de aceitar pedidos no corte, ainda aberta', () => {
    expect(situacaoLoja(loja, em('2026-10-15T18:44:00')).aceitaPedidos).toBe(true)
    expect(situacaoLoja(loja, em('2026-10-15T18:45:00'))).toEqual({
      aberta: true,
      aceitaPedidos: false,
      fechaAs: '19:00',
      pedidosAte: '18:45',
      proximaAbertura: { emDias: 1, diaSemana: 5, abre: '07:00' },
    })
  })

  it('antes de abrir, a próxima abertura é hoje', () => {
    expect(situacaoLoja(loja, em('2026-10-15T05:00:00')).proximaAbertura).toEqual({
      emDias: 0,
      diaSemana: 4,
      abre: '07:00',
    })
  })

  it('depois de fechar, a próxima abertura é amanhã', () => {
    expect(situacaoLoja(loja, em('2026-10-15T19:00:00')).proximaAbertura).toEqual({
      emDias: 1,
      diaSemana: 5,
      abre: '07:00',
    })
  })

  it('sábado fecha às 18h e domingo abre às 8h', () => {
    expect(situacaoLoja(loja, em('2026-10-17T17:00:00')).fechaAs).toBe('18:00')
    expect(situacaoLoja(loja, em('2026-10-17T18:30:00')).proximaAbertura).toEqual({
      emDias: 1,
      diaSemana: 0,
      abre: '08:00',
    })
  })

  it('domingo à noite pula a segunda (fechada) e abre terça às 7h', () => {
    expect(situacaoLoja(loja, em('2026-10-18T20:00:00')).proximaAbertura).toEqual({
      emDias: 2,
      diaSemana: 2,
      abre: '07:00',
    })
  })

  it('segunda fica fechada o dia inteiro', () => {
    const situacao = situacaoLoja(loja, em('2026-10-19T10:00:00'))
    expect(situacao.aberta).toBe(false)
    expect(situacao.proximaAbertura).toEqual({ emDias: 1, diaSemana: 2, abre: '07:00' })
  })

  it('respeita datas fechadas e pula para o próximo dia aberto', () => {
    const comFeriado = { ...loja, datasFechadas: ['2026-10-15', '2026-10-16'] }
    expect(situacaoLoja(comFeriado, em('2026-10-15T10:00:00'))).toEqual({
      aberta: false,
      aceitaPedidos: false,
      proximaAbertura: { emDias: 2, diaSemana: 6, abre: '08:00' },
    })
  })

  it('o corte é configurável', () => {
    const semCorte = { ...loja, minutosCorte: 0 }
    expect(situacaoLoja(semCorte, em('2026-10-15T18:59:00')).aceitaPedidos).toBe(true)
  })

  it('suporta mais de um turno no dia', () => {
    const comAlmoco = {
      ...loja,
      horarios: loja.horarios.map(() => [
        { abre: '14:00', fecha: '18:00' },
        { abre: '08:00', fecha: '12:00' },
      ]),
    }
    expect(situacaoLoja(comAlmoco, em('2026-10-15T13:00:00')).proximaAbertura).toEqual({
      emDias: 0,
      diaSemana: 4,
      abre: '14:00',
    })
  })

  it('loja sem nenhum horário não tem próxima abertura', () => {
    const fechadaSempre = { ...loja, horarios: [[], [], [], [], [], [], []] }
    expect(situacaoLoja(fechadaSempre, em('2026-10-15T10:00:00'))).toEqual({
      aberta: false,
      aceitaPedidos: false,
      proximaAbertura: undefined,
    })
  })
})

describe('horaCurta', () => {
  it('formata no jeito brasileiro', () => {
    expect(horaCurta('19:00')).toBe('19h')
    expect(horaCurta('07:00')).toBe('7h')
    expect(horaCurta('18:45')).toBe('18h45')
    expect(horaCurta('08:05')).toBe('8h05')
  })
})
