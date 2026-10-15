import type { Categoria } from '../core/tipos'
import { idSecao } from './NavCategorias'
import { textos } from './textos'

/** Índice vertical da lombada (a partir de 1024px), com a categoria visível marcada. */
export function IndiceCategorias({
  categorias,
  ativo,
  aoEscolher,
}: {
  categorias: Categoria[]
  ativo: string
  aoEscolher: (idSecao: string) => void
}) {
  return (
    <nav aria-label={textos.navCategorias} className="mt-10 hidden lg:block">
      <ol>
        {categorias.map((categoria, i) => {
          const id = idSecao(categoria)
          const marcado = id === ativo
          return (
            <li key={categoria.id}>
              <a
                href={`#${id}`}
                aria-current={marcado ? 'true' : undefined}
                onClick={(evento) => {
                  evento.preventDefault()
                  aoEscolher(id)
                }}
                className="group flex items-center gap-3 py-2"
              >
                <span
                  aria-hidden
                  className={`h-px w-6 shrink-0 origin-left bg-gold transition-transform duration-500 ease-cine ${
                    marcado ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
                <span aria-hidden className="font-display text-sm leading-none text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`rotulo transition-colors duration-300 ${
                    marcado ? 'text-cream' : 'text-cream/60 group-hover:text-cream'
                  }`}
                >
                  {categoria.nome}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
