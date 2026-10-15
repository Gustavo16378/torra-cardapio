import { useEffect, type RefObject } from 'react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Enquanto ativo: leva o foco para dentro do painel ([data-autofoco] ou o próprio painel),
 * prende o Tab ali dentro e, ao desativar, devolve o foco para quem abriu.
 */
export function useFocoPreso(ref: RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    const painel = ref.current
    if (!ativo || !painel) return
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const alvo = painel.querySelector<HTMLElement>('[data-autofoco]') ?? painel
    alvo.focus({ preventScroll: true })

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Tab') return
      const focaveis = [...painel.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((el) => el.getClientRects().length > 0)
      const primeiro = focaveis[0]
      const ultimo = focaveis.at(-1)
      if (!primeiro || !ultimo) {
        evento.preventDefault()
        return
      }
      const atual = document.activeElement
      if (evento.shiftKey && (atual === primeiro || atual === painel)) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && (atual === ultimo || !painel.contains(atual))) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      // Espera um quadro: o fundo só deixa de ser inerte depois dos outros cleanups da folha.
      requestAnimationFrame(() => {
        if (anterior?.isConnected && !anterior.closest('[inert]')) anterior.focus({ preventScroll: true })
      })
    }
  }, [ref, ativo])
}
