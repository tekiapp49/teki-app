// Rayon de recherche autour du lieu de référence, stocké en MÈTRES.
// Le slider est continu et logarithmique : le pas grandit progressivement
// (fin sur les petites distances, large sur les grandes). Affichage en
// mètres sous 1 km, en km au-delà.
export const RAYON_MIN_M = 200;
export const RAYON_MAX_M = 50000;
export type Rayon = number; // mètres

const KEY = "teki:rayon";
const DEFAULT_RAYON = 10000;

export function getRayon(): Rayon {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULT_RAYON;
    const n = Number(raw);
    return Number.isFinite(n) ? clampRayon(n) : DEFAULT_RAYON;
  } catch {
    return DEFAULT_RAYON;
  }
}

export function setRayon(r: Rayon): void {
  try {
    localStorage.setItem(KEY, String(Math.round(r)));
  } catch {
    // ignore
  }
}

export function rayonLabel(m: Rayon): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  if (m < 10000) return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
  return `${Math.round(m / 1000)} km`;
}

function clampRayon(m: number): number {
  return Math.max(RAYON_MIN_M, Math.min(RAYON_MAX_M, m));
}

// Slider ⇄ rayon (échelle log continue). Position du slider dans [0, 1].
export function sliderToRayon(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  const m = RAYON_MIN_M * Math.pow(RAYON_MAX_M / RAYON_MIN_M, clamped);
  return clampRayon(Math.round(m / 10) * 10);
}

export function rayonToSlider(m: number): number {
  const c = clampRayon(m);
  return Math.log(c / RAYON_MIN_M) / Math.log(RAYON_MAX_M / RAYON_MIN_M);
}

// Zoom Leaflet pour qu'un cercle de rayon `m` (mètres) tienne à l'écran.
export function zoomForRayon(m: number): number {
  return Math.max(8, Math.min(15, Math.round(14 - Math.log2(m / 1000))));
}
