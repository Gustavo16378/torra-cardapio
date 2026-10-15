# SPEC · Cardápio TORRA.

## O que é
Cardápio digital com pedido pelo WhatsApp para o TORRA. (cafeteria fictícia de torrefação e cafés especiais em Pinheiros, SP, site em torra-cafe.pages.dev). É uma **peça autoral**: a interface é desenhada para a identidade do TORRA, não é template nem tema genérico. Deve parecer uma extensão natural do site do TORRA.

O projeto tem duas camadas separadas de propósito:
- **Interface (exclusiva do TORRA):** layout, tipografia, animações, navegação, microinterações. Feita sob medida e não pensada para ser reaproveitada.
- **Motor (reaproveitável):** carrinho, cálculo de opções e preços, montagem da mensagem do WhatsApp, horário de funcionamento. Lógica pura em `src/core/`, sem nenhum JSX, estilo ou texto do TORRA, para ser copiada para o próximo cliente que terá outra interface feita do zero.

**Não tem back-end.** O carrinho vive no navegador do cliente e o pedido sai como mensagem pronta no WhatsApp da cafeteria (link `https://wa.me/<numero>?text=<mensagem codificada>`). Sem banco, sem login, sem pagamento online.

## Stack
- React + Vite + TypeScript + Tailwind CSS
- Ícones: lucide-react
- Deploy: Cloudflare Pages (build `npm run build`, saída `dist`)
- Sem bibliotecas de estado globais; o reducer de `core/carrinho.ts` com useReducer basta
- Mobile-first, media queries só com min-width

## Estrutura de pastas
```
src/
  core/            # MOTOR reaproveitável: TypeScript puro, sem React, sem estilo, sem texto do TORRA
    tipos.ts       # Item, Categoria, GrupoOpcoes, ItemCarrinho, Pedido, Loja
    carrinho.ts    # reducer e funções puras (adicionar, remover, alterar qtd, subtotal)
    precos.ts      # preço com opções, formatação BRL
    whatsapp.ts    # monta e codifica a mensagem do pedido a partir de Pedido + Loja
    horario.ts     # aberto/fechado no fuso da loja, próximo horário de abertura
    validacao.ts   # obrigatórios, pedido mínimo, campos do checkout
    useCarrinho.ts # único hook: liga o reducer ao React e ao localStorage
  dados/
    loja.ts        # nome, whatsapp, endereço, horários, taxas
    cardapio.ts    # categorias e itens
  ui/              # INTERFACE do TORRA, desenhada sob medida
  styles/
```
Regra: nada em `core/` importa de `ui/` ou `dados/`. Cobrir `core/` com testes (Vitest) para carrinho, preços, mensagem e horário, porque é a parte que vai para outros projetos.

## Modelo de dados (tipos em `core/tipos.ts`, conteúdo em `dados/cardapio.ts`)
```ts
type Opcao = { id: string; nome: string; precoExtra: number }
type GrupoOpcoes = {
  id: string
  nome: string            // ex: "Tamanho", "Leite", "Extras"
  tipo: 'unica' | 'multipla'
  obrigatorio: boolean
  opcoes: Opcao[]
}
type Item = {
  id: string
  nome: string
  descricao?: string
  preco: number           // em reais, ex: 9.5
  imagem?: string         // caminho em /public/img; sem imagem mostra layout só texto
  tags?: string[]         // ex: "vegano", "sem lactose", "da casa"
  disponivel: boolean     // false = aparece esmaecido com "Esgotado hoje"
  grupos?: GrupoOpcoes[]
}
type Categoria = { id: string; nome: string; itens: Item[] }
```

## Conteúdo do TORRA (fictício, usar este)
**Espressos**
- Espresso · 9,00 · blend da casa, torra média
- Espresso duplo · 13,00
- Macchiato · 11,00
- Cortado · 13,00
- Cappuccino · 16,00 · grupos: Tamanho (P +0 / G +4, obrigatório), Leite (integral +0 / aveia +3 / sem lactose +2, obrigatório), Extras (shot extra +4, canela +0, múltipla)
- Latte · 17,00 · mesmos grupos do cappuccino
- Mocha · 19,00 · mesmos grupos do cappuccino

**Coados** (grupo Origem obrigatório, única: Mantiqueira +0 / Cerrado Mineiro +0 / Chapada Diamantina +4)
- V60 · 16,00 · descrição "preparado na hora, notas da origem escolhida"
- Chemex (serve 2) · 28,00
- Prensa francesa · 18,00

**Gelados**
- Cold brew · 16,00 · 16 horas de extração
- Espresso tônica · 18,00
- Iced latte · 18,00 · grupo Leite igual ao do cappuccino

**Para comer**
- Pão de queijo (3 un) · 12,00 · tag "da casa"
- Croissant de manteiga · 14,00
- Toast de fermentação natural com ricota e mel · 26,00
- Bolo de laranja com calda (fatia) · 15,00
- Cookie de chocolate meio amargo · 11,00 · disponivel: false (testar o estado "Esgotado hoje")

**Grãos para levar**
- TORRA. Mantiqueira 250 g · 62,00 · grupo Moagem obrigatório (em grãos / espresso / coado / prensa)
- TORRA. Cerrado 250 g · 58,00 · mesmo grupo Moagem

Sem fotos reais por enquanto: usar layout sem imagem (o card precisa ficar bonito sem foto) e deixar o campo pronto.

## Configuração da loja (`dados/loja.ts`)
- nome: "TORRA."
- whatsapp: "5563991114551" (número de teste do Gustavo; trocar pelo da cafeteria em cada cliente)
- endereço: "Rua dos Pinheiros, 000 · Pinheiros, São Paulo" (fictício)
- horários: terça a sexta 7h às 19h, sábado e domingo 8h às 18h, segunda fechado
- modos de pedido: retirada (sempre) e entrega (taxa fixa R$ 8,00, pedido mínimo R$ 30,00)
- fuso: America/Sao_Paulo (calcular aberto/fechado nesse fuso, não no do aparelho)

## Direção visual (exclusiva do TORRA)
Partir da identidade do site do TORRA: se o código dele estiver acessível, usar as mesmas cores, fontes, logo e o mesmo tom editorial. Caso contrário, usar fundo `#120d09`, texto creme `#f3e9dc`, destaque caramelo `#c8873a`, superfícies `#1e1610`.

Não é para parecer app de delivery genérico (nada de cards cinza com botão verde). A referência é um menu impresso de cafeteria de especialidade levado para o celular: tipografia com personalidade, hierarquia editorial, respiro, detalhes de torrefação (origem, notas, torra) tratados como parte do design. Animações discretas e com propósito (abrir item, adicionar ao carrinho, barra do carrinho surgindo).

Antes de codar a interface, propor 2 direções visuais curtas no PLAN.md (descrição + como fica o card do item e a barra do carrinho) para o Gustavo escolher.

## Telas e comportamento
1. **Topo:** logo, status "Aberto agora · fecha às 19h" ou "Fechado · abre terça às 7h", endereço curto.
2. **Navegação de categorias:** barra horizontal fixa no topo ao rolar, com scroll spy (a categoria visível fica marcada) e clique rolando suave até a seção.
3. **Lista de itens:** card com nome, descrição, tags, preço e botão "+". Item indisponível esmaecido, sem botão.
4. **Folha do item** (bottom sheet no mobile, modal centralizado no desktop): grupos de opções, quantidade, observação do item (até 140 caracteres), preço atualizando ao vivo, botão "Adicionar · R$ XX,XX" desabilitado até preencher os obrigatórios.
5. **Barra do carrinho:** fixa no rodapé quando há itens, "3 itens · R$ 42,00 · Ver pedido".
6. **Carrinho:** lista com opções escolhidas, alterar quantidade, remover, subtotal.
7. **Checkout:** nome (obrigatório), retirada ou entrega; se entrega, endereço (obrigatório) e aviso de pedido mínimo; forma de pagamento (Pix, cartão na entrega/retirada, dinheiro com campo "troco para"); observação geral. Total com taxa.
8. **Enviar:** botão "Enviar pedido no WhatsApp". Com a loja fechada, o botão fica desabilitado e mostra o próximo horário de abertura.

## Mensagem do WhatsApp (formato exato)
```
*Novo pedido · TORRA.*

2x Cappuccino (G, aveia, shot extra) · R$ 54,00
   obs: bem quente
1x Pão de queijo (3 un) · R$ 12,00

Subtotal: R$ 66,00
Entrega: R$ 8,00
*Total: R$ 74,00*

Nome: Ana
Tipo: Entrega
Endereço: Rua X, 123, ap 4
Pagamento: Pix
Obs: sem açúcar no café
```
Sem emojis. Valores sempre em BRL com vírgula. Codificar com `encodeURIComponent` e testar acentos e quebras de linha.

## Persistência
Carrinho salvo em localStorage (com try/catch, porque pode falhar em aba anônima) para não perder o pedido se a pessoa sair e voltar. Limpar o carrinho só depois que ela confirmar que enviou.

## Qualidade
- Acessibilidade: foco visível, botões com rótulo, contraste AA, folhas fecham com Esc e devolvem o foco.
- Performance: meta Lighthouse mobile 90+ em tudo, sem imagens pesadas, fontes com `font-display: swap`.
- Transições: listar as propriedades animadas, nunca `transition-all`.
- Bloquear o scroll do fundo com sheet aberto do jeito que funciona no iOS (position fixed + top -scrollY), nunca só overflow hidden.
- SEO e preview de link desde o início: title, description, OG tags, Twitter Card, og:image 1200×630, canonical com placeholder da URL de produção.

## Fora do escopo agora
Pagamento online, painel de pedidos, estoque, login, integração com planilha. A planilha do Google como fonte de dados vem numa fase 2, então deixar a leitura de `cardapio.ts` isolada numa função `carregarCardapio()` para trocar a fonte depois sem mexer nos componentes.

## Critérios de aceite
- Pedido completo no celular em menos de 1 minuto, do primeiro "+" ao WhatsApp aberto.
- A mensagem chega no WhatsApp exatamente no formato acima, com acentos certos.
- Opções obrigatórias bloqueiam o "Adicionar" até serem escolhidas.
- Loja fechada bloqueia o envio e mostra o próximo horário.
- `core/` não importa nada de `ui/` nem de `dados/`, e os testes de `core/` passam (`npm run test`).
- A interface não parece template: passa no teste "isso só podia ser do TORRA".
- `npm run build` sem erros e sem warnings de TypeScript.