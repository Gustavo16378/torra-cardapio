import type { Categoria, Item, Opcao } from '../core/tipos'
import { OrigensDaSemana } from './FichaTecnica'
import { LinhaItem } from './LinhaItem'
import { idSecao } from './NavCategorias'

/** Opções com ficha técnica oferecidas pelos itens da seção (ex.: as origens dos coados), sem repetir. */
function origensDaSecao(categoria: Categoria): Opcao[] {
  const vistas = new Map<string, Opcao>()
  for (const item of categoria.itens)
    for (const grupo of item.grupos ?? [])
      for (const opcao of grupo.opcoes) if (opcao.ficha && !vistas.has(opcao.id)) vistas.set(opcao.id, opcao)
  return [...vistas.values()]
}

function contarOrigens(item: Item): number {
  return (item.grupos ?? []).reduce((n, grupo) => n + grupo.opcoes.filter((o) => o.ficha).length, 0)
}

export function SecaoCategoria({
  categoria,
  numero,
  aoAbrir,
  aoAdicionarDireto,
}: {
  categoria: Categoria
  numero: number
  aoAbrir: (item: Item) => void
  aoAdicionarDireto: (item: Item) => void
}) {
  const id = idSecao(categoria)
  const origens = origensDaSecao(categoria)

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-[52px] pt-14 lg:scroll-mt-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg leading-none text-gold">{String(numero).padStart(2, '0')}</span>
          <span aria-hidden className="h-px flex-1 bg-cream/15" />
        </div>
        <h2 id={`${id}-titulo`} className="mt-4 font-display text-[clamp(44px,13vw,64px)] uppercase leading-[0.9] text-cream">
          {categoria.nome}
        </h2>
        {categoria.descricao && <p className="mt-4 max-w-texto text-[15px] leading-normal text-cream/70">{categoria.descricao}</p>}
      </header>

      {origens.length > 0 && <OrigensDaSemana origens={origens} />}

      <ul>
        {categoria.itens.map((item) => (
          <LinhaItem
            key={item.id}
            item={item}
            origens={contarOrigens(item)}
            aoAbrir={aoAbrir}
            aoAdicionarDireto={aoAdicionarDireto}
          />
        ))}
      </ul>
    </section>
  )
}
