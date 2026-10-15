import { useCallback, useMemo, useState } from 'react'
import { encontrarItem, totalItens } from './core/carrinho'
import type { Escolhas, Item } from './core/tipos'
import { carregarCardapio } from './dados/carregarCardapio'
import { loja, urlSite } from './dados/loja'
import { useCardapio } from './hooks/useCardapio'
import { useCarrinho } from './hooks/useCarrinho'
import { useDadosCliente } from './hooks/useDadosCliente'
import { useSituacaoLoja } from './hooks/useSituacaoLoja'
import { BarraCarrinho } from './ui/BarraCarrinho'
import { FolhaItem } from './ui/FolhaItem'
import { ALTURA_NAV, idSecao, NavCategorias } from './ui/NavCategorias'
import { PainelPedido } from './ui/PainelPedido'
import { Rodape } from './ui/Rodape'
import { SecaoCategoria } from './ui/SecaoCategoria'
import { textos } from './ui/textos'
import { Topo } from './ui/Topo'
import { useScrollSpy } from './ui/useScrollSpy'

export default function App() {
  const { categorias } = useCardapio(carregarCardapio)
  const situacao = useSituacaoLoja(loja)
  const carrinho = useCarrinho(categorias, 'torra:carrinho:v1')
  const cliente = useDadosCliente('torra:cliente:v1')

  const [itemAberto, setItemAberto] = useState<Item | null>(null)
  const [pedidoAberto, setPedidoAberto] = useState(false)
  const [aviso, setAviso] = useState('')

  const idsSecoes = useMemo(() => (categorias ?? []).map(idSecao), [categorias])
  const { ativo, irPara } = useScrollSpy(idsSecoes, ALTURA_NAV)

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
  const fecharPedido = useCallback(() => setPedidoAberto(false), [])

  return (
    <>
      <Topo loja={loja} situacao={situacao} urlSite={urlSite} />

      {categorias && (
        <>
          <NavCategorias categorias={categorias} ativo={ativo} aoEscolher={irPara} />
          <main className={`mx-auto max-w-[720px] px-5 ${carrinho.quantidadeItens > 0 ? 'pb-24' : ''}`}>
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
        </>
      )}

      <Rodape loja={loja} urlSite={urlSite} />

      <BarraCarrinho quantidade={carrinho.quantidadeItens} subtotal={carrinho.subtotal} aoAbrir={() => setPedidoAberto(true)} />

      <FolhaItem item={itemAberto} categoria={categoriaDoItem} aoFechar={fecharItem} aoAdicionar={adicionar} />
      <PainelPedido
        aberto={pedidoAberto}
        aoFechar={fecharPedido}
        carrinho={carrinho}
        cliente={cliente}
        loja={loja}
        situacao={situacao}
      />

      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </>
  )
}
