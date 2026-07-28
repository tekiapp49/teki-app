"use client";

import { useEffect, useState } from "react";

// Favoris mémorisés côté navigateur (localStorage). Pour le pilote, les
// fiches de démo ne sont pas encore en base ; quand elles y seront, on
// basculera sur la table `favoris` de Supabase.
const KEY = "teki:favoris";

export function getFavoris(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleFavori(id: string): boolean {
  const set = new Set(getFavoris());
  const nowFavori = !set.has(id);
  if (nowFavori) set.add(id);
  else set.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // stockage indisponible : on ignore.
  }
  return nowFavori;
}

// Notifications par favori (la cloche des cartes). On mémorise les
// favoris dont la notification est *coupée* ; par défaut elle est active.
const KEY_NOTIF = "teki:favoris-notif-off";

export function getNotifOff(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_NOTIF) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleNotifOff(id: string): boolean {
  const set = new Set(getNotifOff());
  const nowOff = !set.has(id);
  if (nowOff) set.add(id);
  else set.delete(id);
  try {
    localStorage.setItem(KEY_NOTIF, JSON.stringify([...set]));
  } catch {
    // ignore
  }
  return nowOff;
}

// État réactif d'un favori pour un identifiant donné.
export function useFavori(id: string): [boolean, () => void] {
  const [favori, setFavori] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavori(getFavoris().includes(id));
  }, [id]);
  const toggle = () => setFavori(toggleFavori(id));
  return [favori, toggle];
}
