import { Check } from 'lucide-react'
import { formatarBRL, paraCentavos } from '../core/precos'
import type { GrupoOpcoes as Grupo } from '../core/tipos'
import { textos } from './textos'

type Props = {
  grupo: Grupo
  escolhidos: string[]
  aoMudar: (ids: string[]) => void
}

export function GrupoOpcoes({ grupo, escolhidos, aoMudar }: Props) {
  const preenchido = escolhidos.length > 0
  const multipla = grupo.tipo === 'multipla'

  const alternar = (id: string) => {
    if (!multipla) return aoMudar([id])
    aoMudar(escolhidos.includes(id) ? escolhidos.filter((e) => e !== id) : [...escolhidos, id])
  }

  const selo = grupo.obrigatorio
    ? preenchido
      ? textos.escolhido
      : textos.obrigatorio
    : multipla
      ? `${textos.opcional} · ${textos.quantosQuiser}`
      : textos.opcional

  return (
    <fieldset className="border-t border-cream/10 px-5 py-5 md:px-8">
      <legend className="sr-only">
        {grupo.nome}, {selo}
      </legend>
      <div aria-hidden className="flex items-center justify-between gap-3">
        <span className="rotulo text-cream">{grupo.nome}</span>
        <span
          className={`rotulo inline-flex items-center gap-1 text-[10px] transition-colors duration-300 ${
            grupo.obrigatorio && !preenchido ? 'text-gold' : 'text-cream/65'
          }`}
        >
          {grupo.obrigatorio && preenchido && <Check size={12} strokeWidth={3} className="text-gold" />}
          {selo}
        </span>
      </div>

      <div className="mt-2">
        {grupo.opcoes.map((opcao) => {
          const marcado = escolhidos.includes(opcao.id)
          return (
            <div key={opcao.id} className="border-b border-cream/5 last:border-b-0">
              <label className="flex min-h-12 cursor-pointer items-center gap-4 py-2.5">
                <input
                  type={multipla ? 'checkbox' : 'radio'}
                  name={grupo.id}
                  value={opcao.id}
                  checked={marcado}
                  onChange={() => alternar(opcao.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center border transition-[background-color,border-color] duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold ${
                    multipla ? 'rounded-[3px]' : 'rounded-full'
                  } ${marcado ? 'border-gold bg-gold' : 'border-cream/45'}`}
                >
                  {marcado &&
                    (multipla ? (
                      <Check size={13} strokeWidth={3} className="text-ink" />
                    ) : (
                      <span className="size-2 rounded-full bg-ink" />
                    ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] first-letter:uppercase">{opcao.nome}</span>
                  {opcao.ficha && <span className="block text-[13px] text-cream/65 first-letter:uppercase">{opcao.ficha.notas}</span>}
                </span>
                {opcao.precoExtra > 0 && (
                  <span className="numeros-tabulares shrink-0 text-sm text-cream/70">
                    + {formatarBRL(paraCentavos(opcao.precoExtra))}
                  </span>
                )}
              </label>

              {opcao.ficha && (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-cine ${
                    marcado ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-3 pl-9 text-[13px] text-cream/70">
                      {[opcao.ficha.origem, `torra ${opcao.ficha.torra}`, opcao.ficha.processo, opcao.ficha.altitude]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
