/** Wordmark "TORRA." com o ponto em dourado, como no favicon do site. */
export function Marca({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display uppercase ${className}`}>
      TORRA<span className="text-gold">.</span>
    </span>
  )
}
