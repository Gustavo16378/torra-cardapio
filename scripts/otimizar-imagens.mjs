// Gera as variantes responsivas de uma imagem: <saida>-480/-800.avif e .webp.
// Uso: node scripts/otimizar-imagens.mjs <entrada> <saida-sem-extensao>
import sharp from 'sharp'

const [entrada, saida] = process.argv.slice(2)
if (!entrada || !saida) {
  console.error('Uso: node scripts/otimizar-imagens.mjs <entrada> <saida-sem-extensao>')
  process.exit(1)
}

for (const largura of [480, 800]) {
  const base = sharp(entrada).resize({ width: largura, withoutEnlargement: true })
  await base.clone().avif({ quality: 55, effort: 6 }).toFile(`${saida}-${largura}.avif`)
  await base.clone().webp({ quality: 78 }).toFile(`${saida}-${largura}.webp`)
  console.log(`${saida}-${largura}.avif / .webp`)
}
