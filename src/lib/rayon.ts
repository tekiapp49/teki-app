// Rayon de recherche autour du lieu de référence (en km ; null = tout le
// territoire, sans limite de distance). Mémorisé côté navigateur.
export const RAYONS_KM = [1, 2, 5, 10, 20];
export type Rayon = number | null;

const KEY = "teki:rayon";
const DEFAULT_RAYON: Rayon = 10;

export function getRayon(): Rayon {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULT_RAYON;
    if (raw === "tout") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : DEFAULT_RAYON;
  } catch {
    return DEFAULT_RAYON;
  }
}

export function setRayon(r: Rayon): void {
  try {
    localStorage.setItem(KEY, r === null ? "tout" : String(r));
  } catch {
    // ignore
  }
}

export function rayonLabel(r: Rayon): string {
  return r === null ? "Tout" : `${r} km`;
}
