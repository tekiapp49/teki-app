import L from "leaflet";

// Pin dessiné à la main (outline, façon Tabler icons) plutôt que les
// images marker par défaut de Leaflet, pour rester cohérent avec la
// charte "icônes outline uniquement, jamais de pictos remplis".
function pinSvg(color: string) {
  return `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}"
      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21s-6.5-5.686-6.5-11a6.5 6.5 0 0 1 13 0c0 5.314-6.5 11-6.5 11z" fill="${color}" fill-opacity="0.12"/>
      <circle cx="12" cy="10" r="2.5" fill="${color}"/>
    </svg>
  `;
}

export function createPinIcon(color: string) {
  return L.divIcon({
    html: pinSvg(color),
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 32],
  });
}
