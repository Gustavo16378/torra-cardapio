// localStorage pode lançar exceção (aba anônima no Safari, cota cheia, armazenamento bloqueado).
// Toda leitura e escrita passa por aqui e falha em silêncio: o cardápio funciona sem persistência.

export function lerJSON(chave: string): unknown {
  try {
    const bruto = window.localStorage.getItem(chave)
    return bruto === null ? undefined : JSON.parse(bruto)
  } catch {
    return undefined
  }
}

export function gravarJSON(chave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // sem persistência nesta sessão
  }
}

export function apagar(chave: string): void {
  try {
    window.localStorage.removeItem(chave)
  } catch {
    // nada a fazer
  }
}
