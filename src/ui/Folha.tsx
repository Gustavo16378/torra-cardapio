import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { textos } from './textos'
import { useFocoPreso } from './useFocoPreso'
import { useTravarScroll } from './useTravarScroll'

const DURACAO_SAIDA = 420

type Fase = 'fechada' | 'entrando' | 'aberta' | 'saindo'

type Props = {
  aberta: boolean
  aoFechar: () => void
  /** id do título visível dentro da folha (aria-labelledby). */
  tituloId: string
  children: ReactNode
  /** Área fixa no pé da folha (botão principal). */
  rodape?: ReactNode
}

/**
 * Bottom sheet no celular, modal centralizado a partir de 768px.
 * Fecha com Esc, clique no fundo ou no X; prende e devolve o foco; trava o scroll do fundo.
 */
export function Folha({ aberta, aoFechar, tituloId, children, rodape }: Props) {
  const [fase, setFase] = useState<Fase>(aberta ? 'aberta' : 'fechada')
  const painelRef = useRef<HTMLDivElement>(null)
  const montada = fase !== 'fechada'
  const visivel = fase === 'aberta'

  useEffect(() => {
    if (aberta) {
      setFase((f) => (f === 'aberta' ? f : 'entrando'))
      // Dois quadros: o primeiro pinta a posição inicial, o segundo dispara a transição.
      let segundo = 0
      const primeiro = requestAnimationFrame(() => {
        segundo = requestAnimationFrame(() => setFase('aberta'))
      })
      return () => {
        cancelAnimationFrame(primeiro)
        cancelAnimationFrame(segundo)
      }
    }
    setFase((f) => (f === 'fechada' ? f : 'saindo'))
    const t = window.setTimeout(() => setFase('fechada'), DURACAO_SAIDA)
    return () => window.clearTimeout(t)
  }, [aberta])

  useTravarScroll(montada)
  useFocoPreso(painelRef, aberta && montada)

  // Esc fecha; o resto da página fica inerte enquanto a folha está aberta.
  // Roda depois do useFocoPreso (mesmo commit), que já guardou quem tinha o foco:
  // tornar o #root inerte antes disso tiraria o foco do botão que abriu a folha.
  useEffect(() => {
    if (!aberta || !montada) return
    const raiz = document.getElementById('root')
    raiz?.setAttribute('inert', '')
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        aoFechar()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      raiz?.removeAttribute('inert')
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberta, montada, aoFechar])

  if (!montada) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-8">
      <div
        aria-hidden
        onClick={aoFechar}
        className={`absolute inset-0 bg-ink/75 backdrop-blur-[3px] transition-opacity duration-500 ease-cine ${
          visivel ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        inert={!aberta}
        className={`relative flex max-h-[92dvh] w-full flex-col border-t border-gold/50 bg-surface text-cream shadow-[0_-24px_60px_rgb(0_0_0/0.45)] outline-none transition-[transform,opacity] duration-500 ease-cine md:max-h-[86dvh] md:max-w-[560px] md:border ${
          visivel ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-6 md:opacity-0'
        }`}
      >
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-cream/20 md:hidden" />
        <button
          type="button"
          onClick={aoFechar}
          aria-label={textos.fechar}
          className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-surface/90 text-cream/80 backdrop-blur-sm transition-colors duration-200 hover:text-gold"
        >
          <X aria-hidden size={22} strokeWidth={1.75} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {rodape && (
          <div className="shrink-0 border-t border-cream/10 bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8">
            {rodape}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
