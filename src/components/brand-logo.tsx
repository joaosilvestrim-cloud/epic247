// Wordmark EPIC / 247 · PROTOCOLO.
// As letras usam currentColor (defina text-white / text-navy no pai);
// a barra "/" é dourada. `size` controla a altura das letras grandes.

export default function BrandLogo({
  className = "",
  size = "1.4rem",
  tagline = true,
}: {
  className?: string;
  size?: string;
  tagline?: boolean;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      style={{ fontSize: size }}
    >
      <span className="font-sans font-extrabold tracking-tight">
        EPIC
        <span className="mx-[0.12em] font-light italic text-gold">/</span>
        247
      </span>
      {tagline && (
        <span className="mt-[0.28em] pl-[0.45em] text-[0.32em] font-semibold tracking-[0.55em] opacity-70">
          PROTOCOLO
        </span>
      )}
    </span>
  );
}
