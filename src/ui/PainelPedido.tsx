import { useEffect, useRef, useState } from 'react'
import type { SituacaoLoja } from '../core/horario'
import { calcularTotais, formatarBRL, lerValorDigitado } from '../core/precos'
import type { DadosCheckout, Loja } from '../core/tipos'
import { checkoutValido, validarCheckout } from '../core/validacao'
import { linkWhatsApp, montarMensagem } from '../core/whatsapp'
import type { Carrinho as EstadoCarrinho } from '../hooks/useCarrinho'
import type { useDadosCliente } from '../hooks/useDadosCliente'
import { Carrinho } from './Carrinho'
import { Checkout, type FormularioCheckout } from './Checkout'
import { ConfirmacaoEnvio, Obrigado } from './ConfirmacaoEnvio'
import { Folha } from './Folha'
import { textoFaltaMinimo, textoFechadoParaEnvio, textos } from './textos'

type Etapa = 'carrinho' | 'checkout' | 'enviado' | 'obrigado'

type Props = {
  aberto: boolean
  aoFechar: () => void
  carrinho: EstadoCarrinho
  cliente: ReturnType<typeof useDadosCliente>
  loja: Loja
  situacao: SituacaoLoja
}

const botaoPrincipal =
  'flex h-14 w-full items-center justify-center bg-gold font-display text-xl uppercase tracking-[0.02em] text-ink transition-[background-color,color] duration-300 hover:bg-cream disabled:cursor-not-allowed disabled:bg-cream/10 disabled:text-cream/50'
const botaoSecundario =
  'flex h-12 w-full items-center justify-center border border-cream/25 rotulo text-cream transition-[border-color,color] duration-200 hover:border-gold hover:text-gold'

/** Carrinho, checkout e envio numa folha só, em etapas. */
export function PainelPedido({ aberto, aoFechar, carrinho, cliente, loja, situacao }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('carrinho')
  const [form, setForm] = useState<FormularioCheckout>(() => ({
    nome: cliente.salvos.nome,
    modo: 'retirada',
    endereco: cliente.salvos.endereco,
    pagamento: 'pix',
    trocoTexto: '',
    obs: '',
  }))

  // Toda abertura começa pelo carrinho.
  useEffect(() => {
    if (aberto) setEtapa('carrinho')
  }, [aberto])

  // Ao trocar de etapa, leva o foco (e a rolagem) para o título novo.
  const primeiraEtapa = useRef(true)
  useEffect(() => {
    if (primeiraEtapa.current) {
      primeiraEtapa.current = false
      return
    }
    document.getElementById('folha-pedido-titulo')?.focus()
  }, [etapa])

  const aoMudar = <K extends keyof FormularioCheckout>(campo: K, valor: FormularioCheckout[K]) =>
    setForm((atual) => ({ ...atual, [campo]: valor }))

  const dados: DadosCheckout = {
    nome: form.nome,
    modo: form.modo,
    endereco: form.endereco,
    pagamento: form.pagamento,
    trocoPara: form.pagamento === 'dinheiro' ? lerValorDigitado(form.trocoTexto) : undefined,
    obs: form.obs,
  }
  const erros = validarCheckout(carrinho.linhas, dados, loja)
  const podeEnviar = situacao.aceitaPedidos && checkoutValido(erros)
  const link = linkWhatsApp(loja.whatsapp, montarMensagem({ linhas: carrinho.linhas, checkout: dados }, loja))
  const totais = calcularTotais(carrinho.linhas, form.modo, loja)

  const motivoBloqueio = !situacao.aceitaPedidos
    ? textoFechadoParaEnvio(situacao)
    : erros.nome || erros.endereco
      ? textos.preencha([erros.nome && 'seu nome', erros.endereco && 'o endereço'].filter((c): c is string => Boolean(c)))
      : erros.minimo
        ? textoFaltaMinimo(erros.minimo.faltam)
        : erros.trocoPara
          ? textos.confirmeTroco
          : ''

  const esquecerDados = () => {
    cliente.esquecer()
    setForm((atual) => ({ ...atual, nome: '', endereco: '' }))
  }

  const rodape = {
    carrinho: (
      <button
        type="button"
        className={botaoPrincipal}
        disabled={carrinho.linhas.length === 0}
        onClick={() => setEtapa('checkout')}
      >
        {textos.continuar(formatarBRL(carrinho.subtotal))}
      </button>
    ),
    checkout: (
      <>
        {podeEnviar ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={botaoPrincipal}
            onClick={() => {
              cliente.lembrar({ nome: form.nome, endereco: form.endereco || cliente.salvos.endereco })
              setEtapa('enviado')
            }}
          >
            {textos.enviar}
          </a>
        ) : (
          <button type="button" disabled className={botaoPrincipal} aria-describedby="motivo-bloqueio">
            {textos.enviar}
          </button>
        )}
        <p
          id="motivo-bloqueio"
          aria-live="polite"
          className={`mt-2 text-center text-[13px] ${podeEnviar ? 'text-cream/70' : 'text-gold'}`}
        >
          {podeEnviar ? `${textos.total} ${formatarBRL(totais.total)}` : motivoBloqueio}
        </p>
      </>
    ),
    enviado: (
      <div className="grid gap-2">
        <button
          type="button"
          className={botaoPrincipal}
          onClick={() => {
            carrinho.limpar()
            setForm((atual) => ({ ...atual, trocoTexto: '', obs: '' }))
            setEtapa('obrigado')
          }}
        >
          {textos.simEnviei}
        </button>
        <button type="button" className={botaoSecundario} onClick={() => setEtapa('checkout')}>
          {textos.aindaNao}
        </button>
      </div>
    ),
    obrigado: (
      <button type="button" className={botaoSecundario} onClick={aoFechar}>
        {textos.voltarCardapio}
      </button>
    ),
  }[etapa]

  return (
    <Folha aberta={aberto} aoFechar={aoFechar} tituloId="folha-pedido-titulo" rodape={rodape}>
      {etapa === 'carrinho' && <Carrinho carrinho={carrinho} aoAdicionarMais={aoFechar} />}
      {etapa === 'checkout' && (
        <Checkout
          form={form}
          aoMudar={aoMudar}
          linhas={carrinho.linhas}
          loja={loja}
          erros={erros}
          temDadosSalvos={cliente.temSalvos}
          aoEsquecerDados={esquecerDados}
          aoVoltar={() => setEtapa('carrinho')}
        />
      )}
      {etapa === 'enviado' && <ConfirmacaoEnvio link={link} />}
      {etapa === 'obrigado' && <Obrigado nome={form.nome} />}
    </Folha>
  )
}
