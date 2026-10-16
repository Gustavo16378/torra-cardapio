# TORRA. Cardápio

Cardápio digital com pedido pelo WhatsApp para o TORRA., uma torrefação e cafeteria fictícia em Pinheiros (SP). É uma peça de portfólio, companheira do [site do TORRA.](https://github.com/Gustavo16378/torra-site), e roda em modo demonstração (o pedido vai para um número de teste).

🔗 **[cardapio-torra.pages.dev](https://cardapio-torra.pages.dev)**

## Stack

| Peça | Escolha |
| --- | --- |
| Interface | React 19 + TypeScript |
| Build | Vite |
| Estilo | Tailwind CSS v4 (tokens em `@theme`) |
| Ícones | lucide-react |
| Fontes | Anton e Archivo, self-hosted em woff2 |
| Imagens | AVIF e WebP responsivos, gerados com sharp |
| Testes | Vitest |
| Deploy | Cloudflare Pages |

## Como funciona

1. A pessoa navega pelas categorias (espressos, coados, gelados, para comer, grãos para levar) e abre um item.
2. Escolhe as opções do item (tamanho, leite, extras, origem, moagem), vê a ficha técnica do café quando houver e pode deixar uma observação.
3. O item vai para a comanda, onde dá para ajustar quantidades, remover ou limpar tudo.
4. No checkout informa nome, retirada ou entrega (com endereço), forma de pagamento e troco, se for dinheiro.
5. O pedido é validado e enviado como mensagem formatada pelo WhatsApp. Na volta, a página pergunta se o pedido foi enviado.

## Detalhes de implementação

- **Motor separado da interface.** `src/core/` é TypeScript puro (carrinho, preços, horário, validação, mensagem). Um teste (`fronteira.test.ts`) garante que esses arquivos só importam de dentro de `core/` e não usam `window`, `document` nem `localStorage`.
- **Mensagem do WhatsApp.** `montarMensagem` monta o pedido em blocos (itens com opções e observações, totais, dados do cliente), com negrito em `*asteriscos*` e textos livres reduzidos a uma linha para não quebrar o formato. `linkWhatsApp` gera o link `wa.me` com o texto codificado.
- **Dinheiro em centavos.** O cardápio é escrito em reais, mas todo cálculo interno usa centavos inteiros, e a formatação em BRL não depende do `Intl`.
- **Carrinho persistente e conferido.** O carrinho é salvo no `localStorage` só com ids, escolhas e quantidades. Ao recarregar, cada linha é reconstruída contra o cardápio atual, e itens que sumiram, esgotaram ou mudaram de opções são descartados. Linhas com o mesmo item, opções e observação se juntam.
- **Horário no fuso da loja.** `core/horario.ts` calcula se a loja está aberta, o corte de pedidos antes do fechamento e a próxima abertura sempre em `America/Sao_Paulo`, considerando datas fechadas. No modo demonstração a interface ignora esse cálculo e mostra a loja aberta.

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm test          # testes com Vitest
npm run build     # checagem de tipos + build em dist/
npm run preview   # serve o build localmente
```

Dados da loja (WhatsApp, horários, taxa e pedido mínimo de entrega) ficam em `src/dados/loja.ts`, e o cardápio em `src/dados/cardapio.ts`.

## Estrutura

```
src/
  core/        # motor: tipos, carrinho, preços, horário, validação, WhatsApp
  dados/       # conteúdo do TORRA. (cardápio, loja, fotos)
  hooks/       # estado em React e persistência no localStorage
  ui/          # componentes da interface
  styles/      # tokens, fontes e utilitários
public/        # fontes, imagens otimizadas, og-image, _headers
scripts/       # geração de imagens (sharp) e da og-image
```

## Autor

Desenvolvido por [Gustavo Barbosa Lima](https://gustavodev.dev).
