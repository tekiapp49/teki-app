// Lieu de référence courant (choisi sur l'écran d'entrée carte-first),
// mémorisé côté navigateur pour alimenter le fil « TéKi là ».
export type Lieu = { name: string; lat: number; lng: number };

const KEY = "teki:lieu";

export function setLieu(lieu: Lieu): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lieu));
  } catch {
    // stockage indisponible (navigation privée…) : on ignore.
  }
}

export function getLieu(): Lieu | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Lieu) : null;
  } catch {
    return null;
  }
}
