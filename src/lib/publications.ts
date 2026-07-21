"use client";

// Publications mémorisées côté navigateur (localStorage) tant que les
// fiches ne sont pas en base. Quand elles y seront, on basculera sur la
// table `publications` de Supabase (même structure).
export type PubType = "promo" | "evenement" | "actu";

export type Publication = {
  id: string;
  ficheId: string;
  type: PubType;
  texte: string;
  conditions?: string;
  du?: string;
  au?: string;
  quand: "maintenant" | "programmer";
  le?: string;
  heure?: string;
  createdAt: number;
};

const KEY = "teki:publications";

function readAll(): Publication[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Publication[];
  } catch {
    return [];
  }
}

function writeAll(list: Publication[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // stockage indisponible : on ignore.
  }
}

export function getPublications(ficheId: string): Publication[] {
  return readAll()
    .filter((p) => p.ficheId === ficheId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addPublication(
  pub: Omit<Publication, "id" | "createdAt">,
): Publication {
  const all = readAll();
  const created: Publication = {
    ...pub,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  all.push(created);
  writeAll(all);
  return created;
}

export function deletePublication(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}
