# PLAN · Cardápio TORRA.

Plano aprovado em 15/10/2026, com as decisões do Gustavo incorporadas (seção 4). A implementação segue as etapas da seção 1. Ao fim de cada etapa rodo `npm run build` e `npm run test`.

## 0. Identidade herdada do site (torra-cafe.pages.dev)

| Token | Valor | Origem |
|---|---|---|
| `ink` (fundo) | `#120d09` | site |
| `cream` (texto) | `#f2ece1` | site (prevalece sobre `#f3e9dc` do Spec) |
| `gold` (destaque) | `#c9973f` | site (prevalece sobre `#c8873a` do Spec) |
| `surface` | `#1e1610` | Spec (o site não tem) |

- **Fontes:** Anton (display, caixa-alta, entrelinha ~0.9) e Archivo variável 100–900 (texto), self-hosted em `/fonts/*.woff2`, subset latin, `font-display: swap`. Os arquivos são os mesmos do site (licença OFL).
- **Tom:** rótulos pequenos em caixa-alta com tracking largo, seções numeradas ("01 · ESPRESSOS"), separador " · ".
- **Movimento:** `--ease-cine: cubic-bezier(.16, 1, .3, 1)`.
- **Marca:** wordmark "TORRA." em Anton, com o ponto em dourado.
- **Tailwind v4**, igual ao site.

## 1. Etapas de implementação (em ordem)

1. **Scaffold:** `git init`, Vite + React + TS strict, Tailwind v4 (`@tailwindcss/vite`), lucide-react, Vitest. Scripts `dev`, `build` (`tsc -b && vite build`), `test` (`vitest run`), `preview`.
2. **Motor (`src/core/`), TypeScript 100% puro, sem React:**
   1. `tipos.ts`: tipos do Spec, mais `FichaTecnica`, `Loja`, `ItemCarrinho`, `Pedido`, `DadosCliente`.
   2. `precos.ts`: cálculo em centavos inteiros e `formatarBRL`. Testes.
   3. `carrinho.ts`: reducer puro, que junta linhas iguais, e reidratação a partir do cardápio atual. Testes.
   4. `horario.ts`: aberto/fechado, corte antes de fechar, datas fechadas, próximo horário, tudo no fuso da loja. Testes.
   5. `validacao.ts`: obrigatórios, checkout, pedido mínimo e quanto falta. Testes.
   6. `whatsapp.ts`: mensagem no formato exato e link `wa.me`. Testes.
   7. `fronteira.test.ts`: falha se algum arquivo de `core/` importar `react`, `ui/`, `hooks/` ou `dados/`.
3. **Hooks e dados:** `src/hooks/useCarrinho.ts` (useReducer + localStorage), `src/hooks/useDadosCliente.ts` (lembra nome e endereço), `dados/loja.ts`, `dados/cardapio.ts` com fichas técnicas, e `dados/carregarCardapio.ts` (async).
4. **Base visual:** tokens em `styles/index.css`, `@font-face`, foco visível, `prefers-reduced-motion`.
5. **Interface, na ordem do fluxo:** Topo e status → navegação com scroll spy → seções e linhas de item (com ficha nos coados e grãos) → folha do item → barra do carrinho → carrinho → checkout → envio e confirmação.
6. **Microinterações:** abrir folha, "+" direto com confirmação, barra reagindo ao total, barra surgindo. Sempre com propriedades listadas, nunca `transition-all`.
7. **SEO e preview:** meta tags, canonical `https://cardapio-torra.pages.dev/`, og:image 1200×630 gerada a partir de um HTML com as fontes do TORRA (screenshot via playwright-cli), favicon.
8. **Verificação final:** testes, build sem warnings, fluxo completo em viewport 390px com playwright-cli, contraste, teclado/Esc/foco, Lighthouse mobile.
9. **Deploy:** só o preparo (`public/_headers`). Não publico sem ordem.

## 2. Arquivos

> Lista atualizada ao fim da implementação (ver "Ajustes durante a implementação" na seção 5).

```
index.html                     # SEO, OG, Twitter, canonical, preload das fontes
package.json / vite.config.ts / tsconfig*.json / .gitignore
public/
  favicon.svg  og-image.jpg  robots.txt  _headers
  fonts/anton-latin.woff2  fonts/archivo-latin-wght.woff2
  img/.gitkeep
scripts/
  og-image.html  gerar-og.js   # fonte e gerador da og:image
src/
  main.tsx  App.tsx
  core/                        # TS puro, só importa de ./
    tipos.ts  precos.ts  carrinho.ts  horario.ts  validacao.ts  whatsapp.ts
    __testes__/                # fixtures próprias, testes e fronteira.test.ts
  hooks/                       # ponte React ↔ core (reaproveitável)
    useCarrinho.ts  useDadosCliente.ts  useCardapio.ts  useSituacaoLoja.ts  armazenamento.ts
  dados/                       # conteúdo do TORRA
    loja.ts  cardapio.ts  carregarCardapio.ts
    __testes__/cardapio.test.ts
  ui/                          # interface exclusiva do TORRA
    textos.ts  Marca.tsx  Topo.tsx  NavCategorias.tsx  SecaoCategoria.tsx  LinhaItem.tsx
    FichaTecnica.tsx  Folha.tsx  FolhaItem.tsx  GrupoOpcoes.tsx  SeletorQuantidade.tsx
    BarraCarrinho.tsx  PainelPedido.tsx  Carrinho.tsx  Checkout.tsx  ConfirmacaoEnvio.tsx  Rodape.tsx
    useScrollSpy.ts  useTravarScroll.ts  useFocoPreso.ts
  styles/index.css             # @theme (tokens), @font-face, utilitários e keyframes
```

## 3. Direção visual escolhida: A · "Carta de balcão"

O cardápio impresso pendurado atrás do balcão, levado para o celular. Não tem caixas: só tipografia, filetes finos e pontilhado ligando o nome ao preço. Cada categoria abre com número e título grandes em Anton.

**Linha do item:**
```
  CAPPUCCINO ·························· 16      ( + )
  Espresso, leite vaporizado, espuma fina.
  DA CASA
──────────────────────────────────────────────── (filete 1px creme/10%)
```
- O nome vai em Archivo 600, caixa-alta. O pontilhado é dourado a 35%, e o preço usa algarismos tabulares, sem "R$".
- A descrição fica em creme a 65%. As tags são rótulos de 10px em dourado.
- **"+" de item sem opções** adiciona direto. O círculo vira "✓" dourado por cerca de 700 ms, e a barra do carrinho dá um "tique" no total.
- **"+" de item com opções** abre a folha.
- **Esgotado:** a linha fica a 40% de opacidade, o preço é riscado e o "+" dá lugar a "ESGOTADO HOJE" em creme pleno.

**Mini ficha técnica (herdada da direção B),** só nos coados e grãos para levar:
```
  TORRA. MANTIQUEIRA 250 G ············· 62      ( + )
  ┌ ORIGEM    Mantiqueira de Minas, MG
  │ TORRA     média
  │ NOTAS     caramelo, laranja, mel
  └ PROCESSO  natural · 1.200 m
```
- Os grãos têm `ficha` no próprio `Item`. Nos coados, a ficha está em cada `Opcao` do grupo Origem. A linha do item mostra as origens disponíveis, e a folha mostra ao vivo a ficha da origem escolhida.
- Os rótulos têm 10px em dourado, e os valores ficam em creme a 80%. O filete vertical dourado à esquerda evoca a etiqueta do pacote.

**Barra do carrinho:** uma comanda creme colada no rodapé, ocupando a largura toda, com a borda de cima serrilhada.
```
 /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  3 ITENS · R$ 42,00               VER PEDIDO →
```
Ela sobe com `transform` e `--ease-cine`, e o total dá um "tique" a cada item adicionado.

## 4. Decisões

1. Cores e fontes do site, como na seção 0. Logo: wordmark "TORRA." com o ponto dourado.
2. **`useCarrinho.ts` fica em `src/hooks/`.** `core/` é TypeScript puro, sem exceção, e o teste de fronteira barra `react`.
3. **Ficha técnica:** `FichaTecnica = { origem; torra; notas; processo?; altitude? }`, opcional em `Item` e em `Opcao`. O conteúdo é inventado e coerente com as origens do Spec.
4. **Pedido mínimo de entrega (R$ 30,00, sobre o subtotal sem taxa)** bloqueia o envio e mostra "Faltam R$ 12,00 para entrega". Retirada não tem mínimo.
5. **"+":** item sem grupos adiciona direto, com microanimação e a barra reagindo. Item com grupos abre a folha.
6. **Corte:** aceita pedidos até `minutosCorte` (15) antes de fechar, valor configurável em `dados/loja.ts`. Dentro do corte, o status mostra "Pedidos encerrados por hoje · abre …" e o envio fica bloqueado.
7. **Feriados:** `datasFechadas: string[]` ('AAAA-MM-DD') em `dados/loja.ts`, vazia, e `horario.ts` já respeita.
8. **Nome e endereço** ficam no localStorage (try/catch) e preenchem o checkout na próxima visita.
9. **og:image** 1200×630 simples, com a tipografia e as cores do TORRA.
10. **Canonical:** `https://cardapio-torra.pages.dev/` (placeholder).
11. **Dinheiro:** os dados ficam em reais (como no Spec), e o cálculo interno é em centavos inteiros.
12. **Opções na mensagem:** entram todas as escolhidas, na ordem dos grupos: "(G, aveia, shot extra)". Os nomes das opções ficam em minúsculas nos dados (exceto P/G e nomes próprios), e a UI capitaliza via CSS.
13. **Variações da mensagem:**
    - Retirada: sem as linhas "Entrega:" e "Endereço:", e com "Tipo: Retirada".
    - Dinheiro: "Pagamento: Dinheiro (troco para R$ 100,00)".
    - Cartão: "Pagamento: Cartão na entrega" ou "Cartão na retirada".
    - As obs só aparecem se preenchidas.
    - O valor de cada linha é o total da linha.
14. Linhas iguais (item + opções + obs) somam quantidade, de 1 a 20 por linha.
15. O localStorage guarda só ids, opções e qtd. Ao voltar, os preços são recalculados pelo cardápio atual, e itens que sumiram ou esgotaram são descartados.
16. **Envio:** `<a href="https://wa.me/…" target="_blank">` disparado no toque, seguido de "Você enviou o pedido?" com "Sim, limpar" e "Ainda não". O carrinho só é limpo no "sim".
17. Com a loja fechada, dá para montar o carrinho, só o envio é bloqueado.
18. `carregarCardapio()` é async desde já.
19. **Desktop:** coluna central de cerca de 720px, e as folhas viram modal centralizado.
20. Link discreto para o site do TORRA no topo.

## 5. Ajustes durante a implementação

- **Testes do core em `src/core/__testes__/`**, com fixtures próprias, já que `core/` não pode importar `dados/`. O teste de fronteira exige que todo arquivo de `core/` importe só de `./` e não use APIs do navegador.
- **`Categoria.descricao?`** (opcional, genérico) guarda o subtítulo editorial de cada seção.
- **`Loja.horarios`** aceita vários turnos por dia (útil para o próximo cliente com pausa de almoço).
- **Ficha dos coados:**
  - O quadro "Origens da semana" aparece uma vez na seção.
  - Na folha, cada origem mostra as suas notas.
  - A ficha completa abre sob a origem escolhida.
- **Carrinho, checkout e confirmação** ficam numa folha só (`PainelPedido`), em etapas, com uma etapa final "Obrigado".
- **Esgotado** fica apagado por cor, não por opacity, para manter o contraste AA.
- **Nome e endereço** são lembrados no momento do envio. O checkout tem o link "Esquecer meu nome e endereço".

## 6. Verificação (15/10/2026)

- `npm run test` tem 78 testes passando (core + dados). `npm run build` sai sem erros nem warnings.
- **Fluxo em viewport de iPhone 15 (playwright-cli):**
  - Cappuccino G/aveia/shot ×2 com obs + Pão de queijo → entrega → Pix: a mensagem do link é **idêntica** ao exemplo do Spec.
  - Obrigatórios bloqueiam o "Adicionar", e o preço atualiza ao vivo.
  - O mínimo de entrega bloqueia com "Faltam R$ 12,00 para entrega".
  - Troco menor que o total bloqueia.
  - O corte (18h50) e a loja fechada bloqueiam o envio e mostram a próxima abertura (hoje / amanhã / terça).
  - O carrinho sobrevive ao reload e só é limpo no "Sim, enviei".
  - Esc fecha, o foco volta para quem abriu, o Tab fica preso na folha e o scroll volta ao mesmo ponto.
- **Lighthouse mobile:** Performance 99 · Acessibilidade 100 · Boas práticas 100 · SEO 100 (LCP 1,8 s, CLS 0).
- Nenhum `transition-all` nem `transition` genérico.

## 7. Pendências

- Trocar o placeholder do canonical/og:url (`https://cardapio-torra.pages.dev/`) depois do deploy.
- Trocar o WhatsApp de teste pelo da cafeteria.
- Deploy no Cloudflare Pages (build `npm run build`, saída `dist`): aguardando a sua ordem.
