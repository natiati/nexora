// Marca de Nexora: la N con el destello, igual que en la landing
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${className}`}>
      <span className="relative">
        N
        <svg viewBox="0 0 18 18" fill="currentColor" className="absolute -top-0.5 -right-1.5 w-2 h-2 text-teal-400">
          <path d="M9 0 10.6 7.4 18 9l-7.4 1.6L9 18 7.4 10.6 0 9l7.4-1.6Z" />
        </svg>
      </span>
      exora
    </span>
  );
}
