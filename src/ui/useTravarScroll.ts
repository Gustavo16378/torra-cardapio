import { useLayoutEffect } from 'react'

/**
 * Trava o scroll do fundo do jeito que funciona no iOS: body em position fixed deslocado
 * por -scrollY (overflow hidden sozinho não segura o Safari). Ao destravar, volta ao mesmo ponto.
 */
export function useTravarScroll(ativo: boolean) {
  useLayoutEffect(() => {
    if (!ativo) return
    const { body, documentElement } = document
    const y = window.scrollY
    const temBarra = window.innerWidth > documentElement.clientWidth
    const anterior = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflowY: body.style.overflowY,
    }

    Object.assign(body.style, {
      position: 'fixed',
      top: `-${y}px`,
      left: '0',
      right: '0',
      width: '100%',
      overflowY: temBarra ? 'scroll' : '',
    })

    return () => {
      Object.assign(body.style, anterior)
      window.scrollTo({ top: y, behavior: 'instant' })
    }
  }, [ativo])
}
