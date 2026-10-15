import { textos } from './textos'

export function ConfirmacaoEnvio({ link }: { link: string }) {
  return (
    <div className="px-5 pt-6 pb-8 md:px-8 md:pt-8">
      <p className="rotulo text-gold">WhatsApp</p>
      <h2
        id="folha-pedido-titulo"
        tabIndex={-1}
        className="mt-2 font-display text-[clamp(38px,11vw,52px)] uppercase leading-[0.92] outline-none"
      >
        {textos.enviadoTitulo}
      </h2>
      <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-cream/80">{textos.enviadoTexto}</p>
      <a
        href={link}
        className="rotulo mt-6 inline-block py-2 text-gold underline-offset-4 hover:underline"
      >
        {textos.abrirDeNovo}
      </a>
    </div>
  )
}

export function Obrigado({ nome }: { nome: string }) {
  const primeiroNome = nome.trim().split(/\s+/)[0] ?? ''
  return (
    <div className="px-5 pt-6 pb-8 md:px-8 md:pt-8">
      <p className="rotulo text-gold">TORRA.</p>
      <h2
        id="folha-pedido-titulo"
        tabIndex={-1}
        className="mt-2 font-display text-[clamp(38px,11vw,52px)] uppercase leading-[0.92] outline-none"
      >
        {textos.obrigado(primeiroNome)}
      </h2>
      <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-cream/80">{textos.obrigadoTexto}</p>
    </div>
  )
}
