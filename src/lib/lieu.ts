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

// Historique des lieux utilisés (device-local ; synchronisé au compte
// quand la personne est connectée, via profils.lieux_recents).
const KEY_HIST = "teki:lieux-recents";

export function getLieuxRecents(): Lieu[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_HIST) || "[]") as Lieu[];
  } catch {
    return [];
  }
}

export function pushLieuRecent(lieu: Lieu, base?: Lieu[]): Lieu[] {
  const source = base ?? getLieuxRecents();
  const next = [lieu, ...source.filter((l) => l.name !== lieu.name)].slice(0, 5);
  try {
    localStorage.setItem(KEY_HIST, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
