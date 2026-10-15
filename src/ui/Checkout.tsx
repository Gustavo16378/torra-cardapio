import { ArrowLeft, CircleAlert } from 'lucide-react'
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

/** ids dos campos, na ordem em que aparecem (o envio leva o foco ao primeiro inválido). */
export const ID_CAMPO = {
  nome: 'checkout-nome',
  endereco: 'checkout-endereco',
  minimo: 'checkout-minimo',
  trocoPara: 'checkout-troco',
} as const

type Props = {
  form: FormularioCheckout
  aoMudar: <K extends keyof FormularioCheckout>(campo: K, valor: FormularioCheckout[K]) => void
  linhas: ItemCarrinho[]
  loja: Loja
  erros: ErrosCheckout
  /** Depois da primeira tentativa de envio, os campos inválidos ficam destacados. */
  mostrarErros: boolean
  temDadosSalvos: boolean
  aoEsquecerDados: () => void
  aoVoltar: () => void
}

/** Caixa do campo: superfície mais escura que a folha, borda visível, altura de toque confortável. */
function caixa(invalido: boolean): string {
  return `border bg-ink/70 transition-[border-color,box-shadow] duration-200 ${
    invalido
      ? 'border-alerta shadow-[0_0_0_1px_var(--color-alerta)]'
      : 'border-cream/30 hover:border-cream/50 focus-within:border-gold focus-within:shadow-[0_0_0_1px_var(--color-gold)]'
  }`
}

const entrada =
  'block w-full bg-transparent px-4 text-base text-cream placeholder:text-cream/50 focus:outline-none focus-visible:outline-none'

function Rotulo({ htmlFor, children, obrigatorio }: { htmlFor: string; children: ReactNode; obrigatorio?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="rotulo mb-2 block">
      {children}
      {obrigatorio && <span className="ml-2 text-[10px] text-gold">{textos.obrigatorio}</span>}
    </label>
  )
}

function Erro({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[15px] leading-snug text-alerta">
      <CircleAlert aria-hidden size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" />
      {children}
    </p>
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

export function Checkout({
  form,
  aoMudar,
  linhas,
  loja,
  erros,
  mostrarErros,
  temDadosSalvos,
  aoEsquecerDados,
  aoVoltar,
}: Props) {
  const entrega = form.modo === 'entrega'
  const totais = calcularTotais(linhas, form.modo, loja)
  const taxa = formatarBRL(paraCentavos(loja.entrega.taxa))
  const minimo = formatarBRL(paraCentavos(loja.entrega.pedidoMinimo))

  const nomeInvalido = mostrarErros && Boolean(erros.nome)
  const enderecoInvalido = mostrarErros && Boolean(erros.endereco)
  const trocoInvalido = Boolean(erros.trocoPara)

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
        <div className="scroll-mt-8">
          <Rotulo htmlFor={ID_CAMPO.nome} obrigatorio>
            {textos.nome}
          </Rotulo>
          <div className={caixa(nomeInvalido)}>
            <input
              id={ID_CAMPO.nome}
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              aria-required="true"
              aria-invalid={nomeInvalido ? 'true' : undefined}
              aria-describedby={nomeInvalido ? 'erro-nome' : undefined}
              value={form.nome}
              onChange={(e) => aoMudar('nome', e.target.value)}
              placeholder={textos.nomeDica}
              className={`${entrada} h-13`}
            />
          </div>
          {nomeInvalido && <Erro id="erro-nome">{textos.erroNome}</Erro>}
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
            <Rotulo htmlFor={ID_CAMPO.endereco} obrigatorio>
              {textos.endereco}
            </Rotulo>
            <div className={caixa(enderecoInvalido)}>
              <textarea
                id={ID_CAMPO.endereco}
                rows={2}
                autoComplete="street-address"
                aria-required="true"
                aria-invalid={enderecoInvalido ? 'true' : undefined}
                aria-describedby={enderecoInvalido ? 'erro-endereco' : undefined}
                value={form.endereco}
                onChange={(e) => aoMudar('endereco', e.target.value)}
                placeholder={textos.enderecoDica}
                className={`${entrada} min-h-24 resize-none py-3`}
              />
            </div>
            {enderecoInvalido && <Erro id="erro-endereco">{textos.erroEndereco}</Erro>}
            {erros.minimo && (
              <p
                id={ID_CAMPO.minimo}
                tabIndex={-1}
                role="status"
                className={`mt-3 text-[15px] outline-none ${mostrarErros ? 'text-alerta' : 'text-gold'}`}
              >
                {textoFaltaMinimo(erros.minimo.faltam)}{' '}
                <button
                  type="button"
                  onClick={() => aoMudar('modo', 'retirada')}
                  className="text-cream/85 underline underline-offset-4 transition-colors duration-200 hover:text-cream"
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
            <div className="mt-5 animate-surgir">
              <Rotulo htmlFor={ID_CAMPO.trocoPara}>{textos.trocoPara}</Rotulo>
              <div className={`flex items-center ${caixa(trocoInvalido)}`}>
                <span aria-hidden className="pl-4 text-base text-cream/70">
                  R$
                </span>
                <input
                  id={ID_CAMPO.trocoPara}
                  type="text"
                  inputMode="decimal"
                  value={form.trocoTexto}
                  onChange={(e) => aoMudar('trocoTexto', e.target.value)}
                  placeholder={textos.trocoDica}
                  aria-invalid={trocoInvalido ? 'true' : undefined}
                  aria-describedby={trocoInvalido ? 'erro-troco' : undefined}
                  className={`${entrada} h-13 pl-2`}
                />
              </div>
              {trocoInvalido && <Erro id="erro-troco">{textos.trocoBaixo(formatarBRL(totais.total))}</Erro>}
            </div>
          )}
        </fieldset>

        <div>
          <Rotulo htmlFor="checkout-obs">{textos.obsGeral}</Rotulo>
          <div className={caixa(false)}>
            <textarea
              id="checkout-obs"
              rows={2}
              value={form.obs}
              onChange={(e) => aoMudar('obs', e.target.value)}
              placeholder={textos.obsGeralDica}
              className={`${entrada} min-h-24 resize-none py-3`}
            />
          </div>
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
