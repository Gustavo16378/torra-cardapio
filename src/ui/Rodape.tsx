import { formatarBRL, paraCentavos } from '../core/precos'
import type { Loja } from '../core/tipos'
import { Marca } from './Marca'
import { horariosAgrupados, textos } from './textos'

export function Rodape({ loja, urlSite }: { loja: Loja; urlSite: string }) {
  const taxa = formatarBRL(paraCentavos(loja.entrega.taxa))
  const minimo = formatarBRL(paraCentavos(loja.entrega.pedidoMinimo))

  return (
    <footer className="mx-auto mt-20 max-w-[720px] border-t border-cream/15 px-5 pt-12 pb-16">
      <Marca className="text-6xl leading-none" />

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="rotulo text-[10px] text-gold">{textos.horarios}</h2>
          <dl className="mt-3 space-y-1.5">
            {horariosAgrupados(loja).map(({ dias, horario }) => (
              <div key={dias} className="flex items-end gap-2 text-[15px]">
                <dt>{dias}</dt>
                <span aria-hidden className="pontilhado flex-1" />
                <dd className="numeros-tabulares text-cream/80">{horario}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-cream/65">{textos.corte(loja.minutosCorte)}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="rotulo text-[10px] text-gold">{textos.enderecoTitulo}</h2>
            <p className="mt-3 text-[15px] text-cream/80">{loja.endereco}</p>
          </div>
          <div>
            <h2 className="rotulo text-[10px] text-gold">{textos.entregaTitulo}</h2>
            <p className="mt-3 text-[15px] text-cream/80">{textos.entregaRodape(taxa, minimo)}</p>
          </div>
        </div>
      </div>

      <a href={urlSite} className="rotulo mt-12 inline-block py-2 text-cream/70 transition-colors duration-200 hover:text-gold">
        {textos.voltarSite} →
      </a>
    </footer>
  )
}
