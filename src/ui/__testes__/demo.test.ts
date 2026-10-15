import { describe, expect, it } from 'vitest'
import { situacaoLoja } from '../../core/horario'
import { loja, modoDemo } from '../../dados/loja'
import { situacaoExibida } from '../demo'
import { textoStatus } from '../textos'

// Segunda-feira, loja fechada de verdade.
const segunda = new Date('2026-10-19T10:00:00-03:00')

describe('modo demonstração', () => {
  it('está ligado no TORRA', () => {
    expect(modoDemo).toBe(true)
  })

  it('o motor continua vendo a loja fechada', () => {
    expect(situacaoLoja(loja, segunda).aceitaPedidos).toBe(false)
  })

  it('a interface mostra aberta e aceitando pedidos', () => {
    const exibida = situacaoExibida(situacaoLoja(loja, segunda), true)
    expect(exibida.aceitaPedidos).toBe(true)
    expect(textoStatus(exibida)).toBe('Aberto agora')
  })

  it('desligado, a interface usa a situação real', () => {
    const real = situacaoLoja(loja, segunda)
    expect(situacaoExibida(real, false)).toBe(real)
    expect(textoStatus(real)).toBe('Fechado · abre amanhã às 7h')
  })
})
