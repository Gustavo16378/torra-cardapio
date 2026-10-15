import { useEffect, useRef } from 'react'
import type { Categoria } from '../core/tipos'
import { textos } from './textos'

export const ALTURA_NAV = 52

export function idSecao(categoria: Categoria): string {
  return `secao-${categoria.id}`
}

export function NavCategorias({
  categorias,
  ativo,
  aoEscolher,
}: {
  categorias: Categoria[]
  ativo: string
  aoEscolher: (idSecao: string) => void
}) {
  const listaRef = useRef<HTMLUListElement>(null)

  // Mantém a categoria marcada visível na barra (rola só a barra, nunca a página).
  useEffect(() => {
    const lista = listaRef.current
    const botao = lista?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!lista || !botao) return
    const alvo = botao.offsetLeft - (lista.clientWidth - botao.offsetWidth) / 2
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lista.scrollTo({ left: alvo, behavior: reduzir ? 'instant' : 'smooth' })
  }, [ativo])

  return (
    <nav
      aria-label={textos.navCategorias}
      className="sticky top-0 z-30 border-y border-cream/10 bg-ink/90 backdrop-blur-md"
      style={{ height: ALTURA_NAV }}
    >
      <ul ref={listaRef} className="sem-barra-rolagem mx-auto flex h-full max-w-[720px] gap-6 overflow-x-auto px-5">
        {categorias.map((categoria) => {
          const id = idSecao(categoria)
          const marcado = id === ativo
          return (
            <li key={categoria.id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={marcado ? 'true' : undefined}
                onClick={(evento) => {
                  evento.preventDefault()
                  aoEscolher(id)
                }}
                className={`rotulo relative flex h-full items-center whitespace-nowrap transition-colors duration-300 ${
                  marcado ? 'text-cream' : 'text-cream/60 hover:text-cream'
                }`}
              >
                {categoria.nome}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-500 ease-cine ${
                    marcado ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
