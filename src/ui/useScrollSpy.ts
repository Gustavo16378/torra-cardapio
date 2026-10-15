import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Marca a seção visível: a última cujo topo já passou da linha `deslocamento` (altura da barra fixa).
 * Durante a rolagem disparada por clique, a marcação fica no destino e o spy espera a rolagem terminar.
 */
export function useScrollSpy(ids: string[], deslocamento: number) {
  const [ativo, setAtivo] = useState(ids[0] ?? '')
  const travadoAte = useRef(0)

  useEffect(() => {
    if (ids.length === 0) return
    let quadro = 0

    const medir = () => {
      quadro = 0
      if (performance.now() < travadoAte.current) return
      // Scroll travado por uma folha aberta: as medidas não valem.
      if (document.body.style.position === 'fixed') return
      const noFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      let atual = ids[0] ?? ''
      if (noFim) atual = ids.at(-1) ?? atual
      else {
        for (const id of ids) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= deslocamento + 8) atual = id
        }
      }
      setAtivo(atual)
    }

    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    const aoTerminar = () => {
      travadoAte.current = 0
      aoRolar()
    }

    medir()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('scrollend', aoTerminar)
    window.addEventListener('resize', aoRolar)
    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('scrollend', aoTerminar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [ids, deslocamento])

  const irPara = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    setAtivo(id)
    // Fallback para navegadores sem 'scrollend'.
    travadoAte.current = performance.now() + 1200
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduzir ? 'instant' : 'smooth', block: 'start' })
  }, [])

  return { ativo, irPara }
}
