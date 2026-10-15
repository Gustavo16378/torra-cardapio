import { useCallback, useMemo, useState } from 'react'
import { encontrarItem, totalItens } from './core/carrinho'
import type { Escolhas, Item } from './core/tipos'
import { carregarCardapio } from './dados/carregarCardapio'
import { loja, modoDemo, urlSite } from './dados/loja'
import { useCardapio } from './hooks/useCardapio'
import { useCarrinho } from './hooks/useCarrinho'
import { useDadosCliente } from './hooks/useDadosCliente'
import { useEnvioPendente } from './hooks/useEnvioPendente'
import { useSituacaoLoja } from './hooks/useSituacaoLoja'
import { BarraCarrinho } from './ui/BarraCarrinho'
import { ComandaLateral } from './ui/ComandaLateral'
import { situacaoExibida } from './ui/demo'
import { FaixaDemo } from './ui/FaixaDemo'
import { FolhaItem } from './ui/FolhaItem'
import { ALTURA_NAV, idSecao, NavCategorias } from './ui/NavCategorias'
import { PainelPedido, type EtapaInicial } from './ui/PainelPedido'
import { Rodape } from './ui/Rodape'
import { SecaoCategoria } from './ui/SecaoCategoria'
import { textos } from './ui/textos'
import { Lombada } from './ui/Lombada'
import { useMediaQuery } from './ui/useMediaQuery'
import { useScrollSpy } from './ui/useScrollSpy'

/** Folga no topo ao rolar até uma seção quando não há barra fixa (lombada, 1024px+): scroll-mt-8. */
const FOLGA_LOMBADA = 32

export default function App() {
  const { categorias } = useCardapio(carregarCardapio)
  const situacao = situacaoExibida(useSituacaoLoja(loja), modoDemo)
  const carrinho = useCarrinho(categorias, 'torra:carrinho:v1')
  const cliente = useDadosCliente('torra:cliente:v1')
  const envio = useEnvioPendente('torra:envio:v1')

  const [itemAberto, setItemAberto] = useState<Item | null>(null)
  // Voltando do WhatsApp com um envio pendente, a folha já abre perguntando se o pedido foi enviado.
  const [pedido, setPedido] = useState<EtapaInicial | null>(() => (envio.pendente ? 'enviado' : null))
  const [aviso, setAviso] = useState('')

  const idsSecoes = useMemo(() => (categorias ?? []).map(idSecao), [categorias])
  const comLombada = useMediaQuery('(min-width: 64rem)')
  const { ativo, irPara } = useScrollSpy(idsSecoes, comLombada ? FOLGA_LOMBADA : ALTURA_NAV)

  const categoriaDoItem = useMemo(
    () => categorias?.find((c) => itemAberto && c.itens.includes(itemAberto))?.nome ?? '',
    [categorias, itemAberto],
  )

  const adicionar = useCallback(
    (item: Item, escolhas: Escolhas, quantidade = 1, obs = '') => {
      carrinho.adicionar(item, escolhas, quantidade, obs)
      setAviso(textos.adicionado(item.nome, totalItens(carrinho.linhas) + quantidade))
    },
    [carrinho],
  )
  const adicionarDireto = useCallback((item: Item) => adicionar(item, {}), [adicionar])
  const fecharItem = useCallback(() => setItemAberto(null), [])
  const abrirItem = useCallback(
    (item: Item) => {
      // Sempre a versão atual do cardápio.
      setItemAberto((categorias && encontrarItem(categorias, item.id)) ?? item)
    },
    [categorias],
  )
  const fecharPedido = useCallback(() => setPedido(null), [])

  return (
    <>
      {modoDemo && <FaixaDemo />}
      <div className="lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-x-12 lg:px-10 xl:grid-cols-[19rem_minmax(0,1fr)_21rem]">
        <Lombada
          loja={loja}
          situacao={situacao}
          urlSite={urlSite}
          categorias={categorias}
          ativo={ativo}
          aoEscolher={irPara}
        />

        <div className="min-w-0">
          {categorias && (
            <>
              <NavCategorias categorias={categorias} ativo={ativo} aoEscolher={irPara} />
              <main
                className={`mx-auto max-w-[720px] px-5 lg:mx-0 lg:max-w-none lg:px-0 ${carrinho.quantidadeItens > 0 ? 'pb-24 xl:pb-0' : ''}`}
              >
                {categorias.map((categoria, i) => (
                  <SecaoCategoria
                    key={categoria.id}
                    categoria={categoria}
                    numero={i + 1}
                    aoAbrir={abrirItem}
                    aoAdicionarDireto={adicionarDireto}
                  />
                ))}
              </main>
              {/* Junto com o cardápio: renderizado antes, o rodapé seria empurrado (layout shift). */}
              <Rodape loja={loja} urlSite={urlSite} />
            </>
          )}
        </div>

        <ComandaLateral carrinho={carrinho} aoContinuar={() => setPedido('checkout')} />
      </div>

      <BarraCarrinho quantidade={carrinho.quantidadeItens} subtotal={carrinho.subtotal} aoAbrir={() => setPedido('carrinho')} />

      <FolhaItem item={itemAberto} categoria={categoriaDoItem} aoFechar={fecharItem} aoAdicionar={adicionar} />
      <PainelPedido
        aberto={pedido !== null}
        etapaInicial={pedido ?? 'carrinho'}
        aoFechar={fecharPedido}
        carrinho={carrinho}
        cliente={cliente}
        envio={envio}
        loja={loja}
        situacao={situacao}
      />

      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </>
  )
}
