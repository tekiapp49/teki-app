import type { CommuneResult } from "./nominatim";

// Territoire pilote : Mauges (Maine-et-Loire) — centre par défaut tant
// qu'on ne connaît pas la position de la personne.
export const DEFAULT_TERRITORY_NAME = "Les Mauges";
export const DEFAULT_CENTER: [number, number] = [47.1975, -0.8865];
export const DEFAULT_ZOOM = 12;
export const LOCATED_ZOOM = 14;

// Communes du territoire pilote proposées d'emblée dans l'écran de
// repli manuel (avant même que la personne ait tapé quoi que ce soit),
// comme sur l'écran validé « Indique ton lieu ».
export const SUGGESTED_COMMUNES: CommuneResult[] = [
  { id: "jallais", name: "Jallais", label: "Jallais", lat: 47.1756, lng: -0.8664 },
  {
    id: "beaupreau-en-mauges",
    name: "Beaupréau-en-Mauges",
    label: "Beaupréau-en-Mauges",
    lat: 47.2075,
    lng: -0.9908,
  },
  {
    id: "saint-florent-le-vieil",
    name: "Saint-Florent-le-Vieil",
    label: "Saint-Florent-le-Vieil",
    lat: 47.3608,
    lng: -1.0125,
  },
];
