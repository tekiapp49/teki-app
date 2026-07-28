// Familles du fil (+ « Tout ») — libellés des chips de filtre.
export type Famille = "commerces" | "sorties" | "entraide";
export type Filtre = "tout" | Famille;

export const FAMILLES: { key: Filtre; label: string }[] = [
  { key: "tout", label: "Tout" },
  { key: "commerces", label: "Commerces" },
  { key: "sorties", label: "Sorties" },
  { key: "entraide", label: "Entraide" },
];
