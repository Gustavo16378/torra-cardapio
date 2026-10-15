import { useCallback, useSyncExternalStore } from 'react'

/** true enquanto a media query casar (ex.: '(min-width: 64rem)'). */
export function useMediaQuery(consulta: string): boolean {
  const assinar = useCallback(
    (avisar: () => void) => {
      const lista = window.matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    [consulta],
  )
  return useSyncExternalStore(assinar, () => window.matchMedia(consulta).matches)
}
