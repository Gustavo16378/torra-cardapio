import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { calcularTotais, formatarBRL, paraCentavos } from '../core/precos'
import type { FormaPagamento, ItemCarrinho, Loja, ModoPedido } from '../core/tipos'
import type { ErrosCheckout } from '../core/validacao'
import { textoFaltaMinimo, textos } from './textos'

export type FormularioCheckout = {
  nome: string
  modo: ModoPedido
  endereco: string
  pagamento: FormaPagamento
  trocoTexto: string
  obs: string
}

type Props = {
  form: FormularioCheckout
  aoMudar: <K extends keyof FormularioCheckout>(campo: K, valor: FormularioCheckout[K]) => void
  linhas: ItemCarrinho[]
  loja: Loja
  erros: ErrosCheckout
  temDadosSalvos: boolean
  aoEsquecerDados: () => void
  aoVoltar: () => void
}

const campo =
  'mt-2 w-full border-b border-cream/25 bg-transparent py-2 text-base placeholder:text-cream/45 transition-[border-color] duration-200 focus:border-gold focus:outline-none'

function Rotulo({ htmlFor, children, obrigatorio }: { htmlFor: string; children: ReactNode; obrigatorio?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="rotulo block">
      {children}
      {obrigatorio && <span className="ml-2 text-[10px] text-gold">{textos.obrigatorio}</span>}
    </label>
  )
}

function Escolha({
  nome,
  valor,
  marcado,
  aoEscolher,
  titulo,
  detalhe,
}: {
  nome: string
  valor: string
  marcado: boolean
  aoEscolher: () => void
  titulo: string
  detalhe?: string
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 border px-4 py-3.5 transition-[border-color,background-color] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
        marcado ? 'border-gold bg-gold/10' : 'border-cream/20 hover:border-cream/45'
      }`}
    >
      <input type="radio" name={nome} value={valor} checked={marcado} onChange={aoEscolher} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-[background-color,border-color] duration-200 ${
          marcado ? 'border-gold bg-gold' : 'border-cream/45'
        }`}
      >
        {marcado && <span className="size-2 rounded-full bg-ink" />}
      </span>
      <span>
        <span className="block text-[15px] font-semibold">{titulo}</span>
        {detalhe && <span className="mt-0.5 block text-[13px] text-cream/70">{detalhe}</span>}
      </span>
    </label>
  )
}

export function Checkout({ form, aoMudar, linhas, loja, erros, temDadosSalvos, aoEsquecerDados, aoVoltar }: Props) {
  const entrega = form.modo === 'entrega'
  const totais = calcularTotais(linhas, form.modo, loja)
  const taxa = formatarBRL(paraCentavos(loja.entrega.taxa))
  const minimo = formatarBRL(paraCentavos(loja.entrega.pedidoMinimo))

  return (
    <div className="px-5 pt-6 pb-8 md:px-8 md:pt-8">
      <button
        type="button"
        onClick={aoVoltar}
        className="rotulo -ml-1 inline-flex items-center gap-1.5 px-1 py-2 text-cream/70 transition-colors duration-200 hover:text-gold"
      >
        <ArrowLeft aria-hidden size={14} strokeWidth={2.25} />
        {textos.seuPedido}
      </button>
      <h2
        id="folha-pedido-titulo"
        tabIndex={-1}
        className="mt-2 font-display text-[clamp(38px,11vw,52px)] uppercase leading-[0.92] outline-none"
      >
        {textos.finalizar}
      </h2>

      <div className="mt-8 space-y-8">
        <div>
          <Rotulo htmlFor="checkout-nome" obrigatorio>
            {textos.nome}
          </Rotulo>
          <input
            id="checkout-nome"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            aria-required="true"
            value={form.nome}
            onChange={(e) => aoMudar('nome', e.target.value)}
            className={campo}
          />
        </div>

        <fieldset>
          <legend className="rotulo">{textos.comoReceber}</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Escolha
              nome="modo"
              valor="retirada"
              marcado={!entrega}
              aoEscolher={() => aoMudar('modo', 'retirada')}
              titulo={textos.retirada}
              detalhe={textos.retiradaDetalhe}
            />
            <Escolha
              nome="modo"
              valor="entrega"
              marcado={entrega}
              aoEscolher={() => aoMudar('modo', 'entrega')}
              titulo={textos.entrega}
              detalhe={textos.entregaDetalhe(`+ ${taxa}`, minimo)}
            />
          </div>
        </fieldset>

        {entrega && (
          <div className="animate-surgir">
            <Rotulo htmlFor="checkout-endereco" obrigatorio>
              {textos.endereco}
            </Rotulo>
            <textarea
              id="checkout-endereco"
              rows={2}
              autoComplete="street-address"
              aria-required="true"
              value={form.endereco}
              onChange={(e) => aoMudar('endereco', e.target.value)}
              placeholder={textos.enderecoDica}
              className={`${campo} resize-none`}
            />
            {erros.minimo && (
              <p className="mt-3 text-sm text-gold" role="status">
                {textoFaltaMinimo(erros.minimo.faltam)}{' '}
                <button
                  type="button"
                  onClick={() => aoMudar('modo', 'retirada')}
                  className="text-cream/80 underline underline-offset-4 transition-colors duration-200 hover:text-cream"
                >
                  {textos.ouRetirada}
                </button>
              </p>
            )}
          </div>
        )}

        <fieldset>
          <legend className="rotulo">{textos.pagamento}</legend>
          <div className="mt-3 grid gap-2">
            {(
              [
                ['pix', textos.pix],
                ['cartao', textos.cartao(entrega)],
                ['dinheiro', textos.dinheiro],
              ] as const
            ).map(([valor, titulo]) => (
              <Escolha
                key={valor}
                nome="pagamento"
                valor={valor}
                marcado={form.pagamento === valor}
                aoEscolher={() => aoMudar('pagamento', valor)}
                titulo={titulo}
              />
            ))}
          </div>
          {form.pagamento === 'dinheiro' && (
            <div className="mt-4 animate-surgir">
              <Rotulo htmlFor="checkout-troco">{textos.trocoPara}</Rotulo>
              <div className="flex items-baseline gap-2">
                <span aria-hidden className="text-cream/70">
                  R$
                </span>
                <input
                  id="checkout-troco"
                  type="text"
                  inputMode="decimal"
                  value={form.trocoTexto}
                  onChange={(e) => aoMudar('trocoTexto', e.target.value)}
                  placeholder={textos.trocoDica}
                  aria-invalid={erros.trocoPara ? 'true' : undefined}
                  aria-describedby={erros.trocoPara ? 'troco-erro' : undefined}
                  className={campo}
                />
              </div>
              {erros.trocoPara && (
                <p id="troco-erro" className="mt-2 text-sm text-gold">
                  {textos.trocoBaixo(formatarBRL(totais.total))}
                </p>
              )}
            </div>
          )}
        </fieldset>

        <div>
          <Rotulo htmlFor="checkout-obs">{textos.obsGeral}</Rotulo>
          <textarea
            id="checkout-obs"
            rows={2}
            value={form.obs}
            onChange={(e) => aoMudar('obs', e.target.value)}
            placeholder={textos.obsGeralDica}
            className={`${campo} resize-none`}
          />
        </div>

        <dl className="space-y-2 border-t border-cream/15 pt-5 text-[15px]">
          <div className="flex items-end gap-2">
            <dt className="rotulo">{textos.subtotal}</dt>
            <span aria-hidden className="pontilhado flex-1" />
            <dd className="numeros-tabulares">{formatarBRL(totais.subtotal)}</dd>
          </div>
          {entrega && (
            <div className="flex items-end gap-2">
              <dt className="rotulo">{textos.taxaEntrega}</dt>
              <span aria-hidden className="pontilhado flex-1" />
              <dd className="numeros-tabulares">{formatarBRL(totais.taxaEntrega)}</dd>
            </div>
          )}
          <div className="flex items-end gap-2 pt-2">
            <dt className="font-display text-2xl uppercase leading-none">{textos.total}</dt>
            <span aria-hidden className="pontilhado flex-1" />
            <dd key={totais.total} className="numeros-tabulares inline-block animate-tique font-display text-2xl leading-none text-gold">
              {formatarBRL(totais.total)}
            </dd>
          </div>
        </dl>

        {temDadosSalvos && (
          <button
            type="button"
            onClick={aoEsquecerDados}
            className="text-[13px] text-cream/65 underline underline-offset-4 transition-colors duration-200 hover:text-cream"
          >
            {textos.esquecerDados}
          </button>
        )}
      </div>
    </div>
  )
}
