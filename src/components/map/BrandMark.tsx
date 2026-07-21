// Repère de marque TéKi : carré vert arrondi, cercle blanc décentré en
// diagonale (haut-gauche), point terracotta centré cerné de blanc.
// Conforme à la description du logo dans CLAUDE.md.
export default function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[28%] bg-brand-green shadow-md"
      style={{ width: size, height: size }}
      aria-label="TéKi"
    >
      <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden="true">
        <circle cx="15" cy="15" r="9" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="22" cy="22" r="6" fill="#FFFFFF" />
        <circle cx="22" cy="22" r="4" fill="#C1673B" />
      </svg>
    </div>
  );
}
