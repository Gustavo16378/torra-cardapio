import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// core/ é o motor reaproveitável: TypeScript puro, que só importa de dentro de core/.

const pastaCore = join(dirname(fileURLToPath(import.meta.url)), '..')
const arquivos = readdirSync(pastaCore, { withFileTypes: true }).filter((e) => e.isFile())

function importacoes(codigo: string): string[] {
  const padroes = [/\bfrom\s+['"]([^'"]+)['"]/g, /\bimport\s+['"]([^'"]+)['"]/g, /\bimport\s*\(\s*['"]([^'"]+)['"]/g]
  return padroes.flatMap((padrao) => [...codigo.matchAll(padrao)].map((m) => m[1] ?? ''))
}

describe('fronteira do core/', () => {
  it('só tem arquivos .ts (nada de JSX, CSS ou assets)', () => {
    expect(arquivos.length).toBeGreaterThan(0)
    for (const arquivo of arquivos) expect(arquivo.name).toMatch(/\.ts$/)
  })

  it.each(arquivos.map((a) => a.name))('%s só importa de dentro de core/', (nome) => {
    const codigo = readFileSync(join(pastaCore, nome), 'utf8')
    for (const origem of importacoes(codigo)) {
      expect(origem, `${nome} importa "${origem}"`).toMatch(/^\.\/[^/]+$/)
    }
  })

  // React já fica de fora pela regra acima (só importa './…'); aqui barramos APIs do navegador.
  it('não usa APIs do navegador', () => {
    for (const arquivo of arquivos) {
      const codigo = readFileSync(join(pastaCore, arquivo.name), 'utf8')
      expect(codigo, arquivo.name).not.toMatch(/\b(window|document|localStorage|sessionStorage)\./)
    }
  })
})
