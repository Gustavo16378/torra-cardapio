import { useCallback, useEffect, useRef, useState } from 'react'
import type { SituacaoLoja } from '../core/horario'
import { calcularTotais, formatarBRL, lerValorDigitado } from '../core/precos'
import type { DadosCheckout, Loja } from '../core/tipos'
import { checkoutValido, validarCheckout, type ErrosCheckout } from '../core/validacao'
import { linkWhatsApp, montarMensagem } from '../core/whatsapp'
import type { Carrinho as EstadoCarrinho } from '../hooks/useCarrinho'
import type { useDadosCliente } from '../hooks/useDadosCliente'
import type { Envio } from '../hooks/useEnvioPendente'
import { Carrinho } from './Carrinho'
import { Checkout, ID_CAMPO, type FormularioCheckout } from './Checkout'
import { ConfirmacaoEnvio, Obrigado } from './ConfirmacaoEnvio'
import { Folha } from './Folha'
import { textoFaltaMinimo, textoFechadoParaEnvio, textos } from './textos'

type Etapa = 'carrinho' | 'checkout' | 'enviado' | 'obrigado'
export type EtapaInicial = 'carrinho' | 'checkout' | 'enviado'

type Props = {
  aberto: boolean
  /** Barra: carrinho. Comanda lateral: checkout. Volta do WhatsApp: enviado. */
  etapaInicial: EtapaInicial
  aoFechar: () => void
  carrinho: EstadoCarrinho
  cliente: ReturnType<typeof useDadosCliente>
  envio: Envio
  loja: Loja
  situacao: SituacaoLoja
}

const botaoPrincipal =
  'flex h-14 w-full items-center justify-center bg-gold font-display text-xl uppercase tracking-[0.02em] text-ink transition-[background-color,color] duration-300 hover:bg-cream disabled:cursor-not-allowed disabled:bg-cream/10 disabled:text-cream/50'
const botaoSecundario =
  'flex h-12 w-full items-center justify-center border border-cream/25 rotulo text-cream transition-[border-color,color] duration-200 hover:border-gold hover:text-gold'

/** Primeiro problema do formulário, na ordem em que os campos aparecem. */
function primeiroInvalido(erros: ErrosCheckout): string | undefined {
  if (erros.nome) return ID_CAMPO.nome
  if (erros.endereco) return ID_CAMPO.endereco
  if (erros.minimo) return ID_CAMPO.minimo
  if (erros.trocoPara) return ID_CAMPO.trocoPara
  return undefined
}

function motivoDoErro(erros: ErrosCheckout): string {
  if (erros.nome || erros.endereco)
    return textos.preencha([erros.nome && 'seu nome', erros.endereco && 'o endereço'].filter((c): c is string => Boolean(c)))
  if (erros.minimo) return textoFaltaMinimo(erros.minimo.faltam)
  if (erros.trocoPara) return textos.confirmeTroco
  return ''
}

/** Carrinho, checkout e envio numa folha só, em etapas. */
export function PainelPedido({ aberto, etapaInicial, aoFechar, carrinho, cliente, envio, loja, situacao }: Props) {
  const [etapa, setEtapa] = useState<Etapa>(etapaInicial)
  const [mostrarErros, setMostrarErros] = useState(false)
  const [form, setForm] = useState<FormularioCheckout>(() => ({
    nome: cliente.salvos.nome,
    modo: 'retirada',
    endereco: cliente.salvos.endereco,
    pagamento: 'pix',
    trocoTexto: '',
    obs: '',
  }))

  useEffect(() => {
    if (aberto) setEtapa(etapaInicial)
  }, [aberto, etapaInicial])

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
  const valido = checkoutValido(erros)
  const link = linkWhatsApp(loja.whatsapp, montarMensagem({ linhas: carrinho.linhas, checkout: dados }, loja))
  const totais = calcularTotais(carrinho.linhas, form.modo, loja)

  // Sair da pergunta "Pedido enviado?" (respondendo ou fechando) encerra o envio pendente.
  const fechar = useCallback(() => {
    if (etapa === 'enviado') envio.limpar()
    aoFechar()
  }, [etapa, envio, aoFechar])

  const enviar = () => {
    if (erros.carrinho) return setEtapa('carrinho')
    if (!valido) {
      setMostrarErros(true)
      const id = primeiroInvalido(erros)
      // Espera o destaque renderizar antes de rolar e focar.
      requestAnimationFrame(() => {
        const campo = id ? document.getElementById(id) : null
        if (!campo) return
        const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        campo.scrollIntoView({ block: 'center', behavior: reduzir ? 'instant' : 'smooth' })
        campo.focus({ preventScroll: true })
      })
      return
    }
    cliente.lembrar({ nome: form.nome, endereco: form.endereco || cliente.salvos.endereco })
    envio.marcar({ link, nome: form.nome })
    setMostrarErros(false)
    setEtapa('enviado')
    // Mesma aba: funciona no navegador do Instagram e no iOS. Na volta, o envio pendente
    // salvo no localStorage reabre a pergunta "Pedido enviado?" mesmo se a página recarregar.
    window.location.href = link
  }

  const esquecerDados = () => {
    cliente.esquecer()
    setForm((atual) => ({ ...atual, nome: '', endereco: '' }))
  }

  const motivo = situacao.aceitaPedidos ? motivoDoErro(erros) : textoFechadoParaEnvio(situacao)

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
        {/* Só a loja fechada desabilita; com dados faltando o botão segue ativo e aponta o campo. */}
        <button
          type="button"
          className={botaoPrincipal}
          disabled={!situacao.aceitaPedidos}
          aria-describedby="motivo-envio"
          onClick={enviar}
        >
          {textos.enviar}
        </button>
        <p
          id="motivo-envio"
          aria-live="polite"
          className={`mt-3 text-center text-[15px] leading-snug ${
            !situacao.aceitaPedidos ? 'text-gold' : motivo && mostrarErros ? 'text-alerta' : 'text-cream/80'
          }`}
        >
          {motivo || `${textos.total} ${formatarBRL(totais.total)}`}
        </p>
      </>
    ),
    enviado: (
      <div className="grid gap-2">
        <button
          type="button"
          className={botaoPrincipal}
          onClick={() => {
            envio.limpar()
            carrinho.limpar()
            setForm((atual) => ({ ...atual, trocoTexto: '', obs: '' }))
            setEtapa('obrigado')
          }}
        >
          {textos.simEnviei}
        </button>
        <button
          type="button"
          className={botaoSecundario}
          onClick={() => {
            envio.limpar()
            setEtapa('checkout')
          }}
        >
          {textos.aindaNao}
        </button>
      </div>
    ),
    obrigado: (
      <button type="button" className={botaoSecundario} onClick={fechar}>
        {textos.voltarCardapio}
      </button>
    ),
  }[etapa]

  return (
    <Folha aberta={aberto} aoFechar={fechar} tituloId="folha-pedido-titulo" rodape={rodape}>
      {etapa === 'carrinho' && <Carrinho carrinho={carrinho} aoAdicionarMais={fechar} />}
      {etapa === 'checkout' && (
        <Checkout
          form={form}
          aoMudar={aoMudar}
          linhas={carrinho.linhas}
          loja={loja}
          erros={erros}
          mostrarErros={mostrarErros}
          temDadosSalvos={cliente.temSalvos}
          aoEsquecerDados={esquecerDados}
          aoVoltar={() => setEtapa('carrinho')}
        />
      )}
      {etapa === 'enviado' && <ConfirmacaoEnvio link={envio.pendente?.link ?? link} />}
      {etapa === 'obrigado' && <Obrigado nome={form.nome || envio.pendente?.nome || ''} />}
    </Folha>
  )
}
