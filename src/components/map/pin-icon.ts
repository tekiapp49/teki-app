import L from "leaflet";

// Pin « goutte » du thème logo : carré à coin pointu, tourné à -45°,
// avec une icône redressée à l'intérieur. Sélection : plus grand,
// magenta, cerné de la couleur de fond de l'app.
type PinOptions = {
  color: string;
  size?: number;
  selected?: boolean;
  iconSvg?: string;
};

export function createPinIcon({
  color,
  size = 34,
  selected = false,
  iconSvg,
}: PinOptions) {
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 6px;
      background:${color};
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(46,43,37,.28);
      ${selected ? "outline:3px solid #faf7f0;" : ""}
    ">
      ${iconSvg ? `<div style="transform:rotate(45deg);display:flex">${iconSvg}</div>` : ""}
    </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
  });
}

// Icônes Lucide (outline blanc) prêtes à insérer dans un pin.
function lucide(path: string, s = 15) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#faf7f0" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

export const PIN_HOME = lucide(
  '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
  18,
);
export const PIN_PLACE = lucide(
  '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
);
