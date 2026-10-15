// Gera public/og-image.jpg a partir de scripts/og-image.html.
// Uso, a partir da raiz do projeto, com `npm run dev` rodando na porta 5173:
//   playwright-cli -s=og open
//   playwright-cli -s=og run-code --filename=scripts/gerar-og.js
//   playwright-cli -s=og close
async (page) => {
  await page.setViewportSize({ width: 1200, height: 630 })
  await page.goto('http://localhost:5173/scripts/og-image.html')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 86, scale: 'css' })
  return 'public/og-image.jpg gerada'
}
