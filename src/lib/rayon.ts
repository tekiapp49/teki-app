// Rayon de recherche autour du lieu de référence (en km). Réglé via un
// slider logarithmique (plus de finesse sur les petites distances).
export const RAYON_MIN = 1;
export const RAYON_MAX = 50;
export type Rayon = number;

const KEY = "teki:rayon";
const DEFAULT_RAYON = 10;

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
    localStorage.setItem(KEY, String(r));
  } catch {
    // ignore
  }
}

export function rayonLabel(r: Rayon): string {
  return `${Math.round(r)} km`;
}

function clampRayon(km: number): number {
  return Math.max(RAYON_MIN, Math.min(RAYON_MAX, km));
}

// Slider ⇄ rayon (échelle log). La position du slider va de 0 à 1000.
export function sliderToRayon(v: number): number {
  const t = Math.min(1, Math.max(0, v / 1000));
  const km = RAYON_MIN * Math.pow(RAYON_MAX / RAYON_MIN, t);
  return clampRayon(Math.round(km));
}

export function rayonToSlider(km: number): number {
  const c = clampRayon(km);
  return Math.round(
    (1000 * Math.log(c / RAYON_MIN)) / Math.log(RAYON_MAX / RAYON_MIN),
  );
}
