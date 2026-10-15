// Renderiza as ilustrações dos pacotes (scripts/pacote.html) em PNG 800×1000.
// Uso, a partir da raiz do projeto, com `npx vite --port 5180` rodando:
//   playwright-cli -s=img open
//   playwright-cli -s=img run-code --filename=scripts/gerar-pacotes.js
//   playwright-cli -s=img close
//   node scripts/otimizar-imagens.mjs .imagens/pacote-mantiqueira.png public/img/pacote-mantiqueira
//   node scripts/otimizar-imagens.mjs .imagens/pacote-cerrado.png public/img/pacote-cerrado
async (page) => {
  await page.setViewportSize({ width: 800, height: 1000 })
  for (const origem of ['mantiqueira', 'cerrado']) {
    await page.goto(`http://localhost:5180/scripts/pacote.html?origem=${origem}`)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `.imagens/pacote-${origem}.png`, scale: 'css' })
  }
  return 'pacotes renderizados em .imagens/'
}
