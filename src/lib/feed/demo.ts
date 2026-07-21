import {
  IconBuildingStore,
  IconCompass,
  IconHeartHandshake,
  IconTicket,
  IconTool,
  type Icon,
} from "@tabler/icons-react";

// Les 4 familles du fil (+ « Tout »), en icônes outline.
export type Famille = "commerces" | "sorties" | "entraide" | "pratique";
export type Filtre = "tout" | Famille;

export const FAMILLES: { key: Filtre; label: string; Icon: Icon }[] = [
  { key: "tout", label: "Tout", Icon: IconCompass },
  { key: "commerces", label: "Commerces", Icon: IconBuildingStore },
  { key: "sorties", label: "Sorties", Icon: IconTicket },
  { key: "entraide", label: "Entraide", Icon: IconHeartHandshake },
  { key: "pratique", label: "Pratique", Icon: IconTool },
];

export type FeedItem = {
  id: string;
  famille: Famille;
  kind: "info" | "commerce" | "association" | "evenement";
  nom: string;
  distanceM: number; // pour le tri par proximité
  distanceLabel: string;
  accroche: string; // « Offre en cours », « Cherche des bénévoles »…
  href?: string;
  badge?: string; // « Info officielle »
  commune?: string; // pour l'affichage dans les favoris
  quand?: string; // événements : « Vendredi 24 juillet, 21h »
};

// Données de test. Ne figurent que des contenus « actifs » (offre en
// cours, événement à venir, appel en cours) — jamais de fiche sans
// actualité, conformément à la règle du fil.
export const FEED: FeedItem[] = [
  {
    id: "info-mooj",
    famille: "pratique",
    kind: "info",
    nom: "Le service Mooj! dessert tout le territoire",
    distanceM: 0,
    distanceLabel: "Tout le territoire",
    accroche: "",
    badge: "Info officielle",
  },
  {
    id: "boulangerie-du-pont",
    famille: "commerces",
    kind: "commerce",
    nom: "Boulangerie du Pont",
    distanceM: 450,
    distanceLabel: "450 m",
    accroche: "Offre en cours",
    href: "/fiche/boulangerie-du-pont",
    commune: "Jallais",
  },
  {
    id: "amicale-laique",
    famille: "entraide",
    kind: "association",
    nom: "Amicale laïque",
    distanceM: 1200,
    distanceLabel: "1,2 km",
    accroche: "Cherche des bénévoles",
    commune: "Jallais",
  },
  {
    id: "podiums-florentais",
    famille: "sorties",
    kind: "evenement",
    nom: "Podiums florentais",
    distanceM: 4800,
    distanceLabel: "4,8 km",
    accroche: "Ven. 24 juil · 21h",
    commune: "Saint-Florent-le-Vieil",
    quand: "Vendredi 24 juillet, 21h",
  },
];
