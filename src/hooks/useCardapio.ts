import { useEffect, useState } from 'react'
import type { Categoria } from '../core/tipos'

/** Carrega o cardápio uma vez a partir de uma fonte assíncrona (arquivo hoje, planilha amanhã). */
export function useCardapio(carregar: () => Promise<Categoria[]>) {
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let ativo = true
    carregar()
      .then((dados) => ativo && setCategorias(dados))
      .catch(() => ativo && setErro(true))
    return () => {
      ativo = false
    }
  }, [carregar])

  return { categorias, erro }
}
