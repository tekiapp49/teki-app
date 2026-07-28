"use client";

import { createClient } from "@/lib/supabase/client";
import type { Lieu } from "@/lib/lieu";

// ── Types (miroir des tables Supabase) ───────────────────────────────
export type Fiche = {
  id: string;
  type: "commerce" | "association";
  nom: string;
  categorie: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  adresse: string | null;
  telephone: string | null;
  horaires: Record<string, string> | null;
  photos: string[] | null;
};

export type Publication = {
  id: string;
  fiche_id: string;
  type: "promo" | "evenement" | "actu";
  texte: string;
  conditions: string | null;
  date_debut: string | null;
  date_fin: string | null;
  date_evenement: string | null;
  lieu_evenement: string | null;
  statut: string;
};

export type FeedPost = { publication: Publication; fiche: Fiche };

const FICHE_COLS =
  "id, type, nom, categorie, description, lat, lng, adresse, telephone, horaires, photos";

// ── Publication active ? ─────────────────────────────────────────────
export function estActive(p: Publication): boolean {
  if (p.type === "promo") {
    if (!p.date_fin) return true;
    const fin = new Date(p.date_fin);
    fin.setHours(23, 59, 59, 999);
    return fin >= new Date();
  }
  if (p.type === "evenement") {
    return !p.date_evenement || new Date(p.date_evenement) >= new Date();
  }
  return true; // actu
}

// ── Requêtes ─────────────────────────────────────────────────────────
export async function fetchFeed(): Promise<FeedPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("publications")
    .select(`*, fiche:fiches(${FICHE_COLS})`)
    .eq("statut", "publie");
  if (error || !data) return [];
  return data
    .filter((row) => row.fiche && estActive(row as unknown as Publication))
    .map((row) => {
      const { fiche, ...publication } = row as unknown as Publication & {
        fiche: Fiche;
      };
      return { publication, fiche };
    });
}

export async function fetchFiches(): Promise<Fiche[]> {
  const supabase = createClient();
  const { data } = await supabase.from("fiches").select(FICHE_COLS);
  return (data as Fiche[] | null) ?? [];
}

export async function fetchFichesByIds(ids: string[]): Promise<Fiche[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("fiches")
    .select(FICHE_COLS)
    .in("id", ids);
  return (data as Fiche[] | null) ?? [];
}

export async function fetchFiche(
  id: string,
): Promise<{ fiche: Fiche; publications: Publication[] } | null> {
  const supabase = createClient();
  const { data: fiche } = await supabase
    .from("fiches")
    .select(FICHE_COLS)
    .eq("id", id)
    .maybeSingle();
  if (!fiche) return null;
  const { data: pubs } = await supabase
    .from("publications")
    .select("*")
    .eq("fiche_id", id)
    .eq("statut", "publie");
  const publications = ((pubs as Publication[] | null) ?? []).filter(estActive);
  return { fiche: fiche as Fiche, publications };
}

export async function fetchPublicationsByFicheIds(
  ids: string[],
): Promise<Publication[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("statut", "publie")
    .in("fiche_id", ids);
  return ((data as Publication[] | null) ?? []).filter(estActive);
}

export async function searchFiches(query: string): Promise<Fiche[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("fiches")
    .select(FICHE_COLS)
    .ilike("nom", `%${q}%`)
    .limit(10);
  return (data as Fiche[] | null) ?? [];
}

// ── Distance ─────────────────────────────────────────────────────────
export function distanceMetres(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function distanceLabel(
  fiche: Pick<Fiche, "lat" | "lng">,
  lieu: Lieu | null,
): { metres: number; label: string } {
  if (!lieu || fiche.lat == null || fiche.lng == null) {
    return { metres: Number.MAX_SAFE_INTEGER, label: "" };
  }
  const m = distanceMetres(lieu, { lat: fiche.lat, lng: fiche.lng });
  const label =
    m < 1000
      ? `${Math.round(m / 10) * 10} m`
      : `${(m / 1000).toFixed(1).replace(".", ",")} km`;
  return { metres: m, label };
}

// ── Mise en forme ────────────────────────────────────────────────────
export function communeFromAdresse(adresse: string | null): string {
  if (!adresse) return "";
  const parts = adresse.split(",");
  return parts[parts.length - 1].trim();
}

export function feedKind(
  post: FeedPost,
): "commerce" | "evenement" | "association" {
  if (post.publication.type === "evenement") return "evenement";
  if (post.publication.type === "promo") return "commerce";
  return post.fiche.type === "association" ? "association" : "commerce";
}

const MOIS_COURTS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];
const JOURS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function datePill(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_COURTS[d.getMonth()]}`;
}

export function dateLongue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const h = d.getHours();
  const min = d.getMinutes();
  const heure = min === 0 ? `${h} h` : `${h} h ${String(min).padStart(2, "0")}`;
  return `${JOURS[d.getDay()]} ${heure}`;
}
