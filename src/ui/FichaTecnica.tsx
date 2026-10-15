import type { FichaTecnica as Ficha, Opcao } from '../core/tipos'
import { formatarBRL, paraCentavos } from '../core/precos'
import { textos } from './textos'

/** Mini ficha técnica, como a etiqueta de um pacote de café. */
export function FichaTecnica({ ficha, className = '' }: { ficha: Ficha; className?: string }) {
  const linhas: [string, string | undefined][] = [
    [textos.ficha.origem, ficha.origem],
    [textos.ficha.torra, ficha.torra],
    [textos.ficha.notas, ficha.notas],
    [textos.ficha.processo, ficha.processo],
    [textos.ficha.altitude, ficha.altitude],
  ]

  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-l-2 border-gold/60 pl-4 ${className}`}>
      {linhas.map(([rotulo, valor]) =>
        valor ? (
          <div key={rotulo} className="contents">
            <dt className="rotulo pt-px text-[10px] text-gold">{rotulo}</dt>
            <dd className="text-sm leading-snug text-cream/80 first-letter:uppercase">{valor}</dd>
          </div>
        ) : null,
      )}
    </dl>
  )
}

/** Quadro "Origens da semana", mostrado uma vez na seção dos coados. */
export function OrigensDaSemana({ origens }: { origens: Opcao[] }) {
  return (
    <aside className="mb-2 border-l-2 border-gold/60 pl-4" aria-labelledby="origens-da-semana">
      <h3 id="origens-da-semana" className="rotulo text-[10px] text-gold">
        {textos.origensDaSemana}
      </h3>
      <ul className="mt-3 space-y-4">
        {origens.map((opcao) =>
          opcao.ficha ? (
            <li key={opcao.id}>
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold uppercase tracking-[0.04em]">{opcao.nome}</span>
                {opcao.precoExtra > 0 && (
                  <span className="numeros-tabulares text-sm text-cream/70">
                    + {formatarBRL(paraCentavos(opcao.precoExtra))}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-cream/80 first-letter:uppercase">{opcao.ficha.notas}</p>
              <p className="mt-0.5 text-[13px] text-cream/65">
                {[opcao.ficha.origem, `torra ${opcao.ficha.torra}`, opcao.ficha.processo, opcao.ficha.altitude]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </li>
          ) : null,
        )}
      </ul>
    </aside>
  )
}
