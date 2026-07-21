// Données de test pour l'étape 3 (fiche commerce). Pour le pilote, les
// vraies fiches seront créées à la main dans Supabase ; ici c'est une
// fiche factice codée en dur pour valider le rendu visible / verrouillé.

export type AvisDemo = {
  id: string;
  auteur: string;
  initiales: string;
  commentaire: string;
};

export type HoraireDemo = {
  label: string;
  valeur: string;
  actif: boolean; // vrai pour la ligne « Aujourd'hui »
};

export type FicheDemo = {
  id: string;
  nom: string;
  categorie: string; // ex. « Commerce »
  commune: string;
  distance: string; // ex. « 450 m »
  ouvert: boolean;
  adresse: string;
  telephone: string;
  offre: {
    // Version « teaser » lisible mais imprécise, montrée au visiteur ;
    // version précise révélée après inscription.
    teaser: string;
    precis: string;
    conditions: string;
  } | null;
  note: number;
  nbAvis: number;
  avis: AvisDemo[];
  horaires: HoraireDemo[];
};

const BOULANGERIE_DU_PONT: FicheDemo = {
  id: "boulangerie-du-pont",
  nom: "Boulangerie du Pont",
  categorie: "Commerce",
  commune: "Jallais",
  distance: "450 m",
  ouvert: true,
  adresse: "12 rue du Pont, Jallais",
  telephone: "+33241000000",
  offre: {
    teaser: "Moins vingt pourcent sur les viennoiseries",
    precis: "- 20 % sur les viennoiseries, jusqu'à dimanche",
    conditions: "Dans la limite des stocks disponibles",
  },
  note: 4.6,
  nbAvis: 28,
  avis: [
    {
      id: "1",
      auteur: "Marie C.",
      initiales: "MC",
      commentaire:
        "Le pain aux céréales est excellent, toujours accueillie avec le sourire.",
    },
  ],
  horaires: [
    { label: "Aujourd'hui", valeur: "7h – 19h30", actif: true },
    { label: "Demain", valeur: "7h – 19h30", actif: false },
  ],
};

const FICHES: Record<string, FicheDemo> = {
  [BOULANGERIE_DU_PONT.id]: BOULANGERIE_DU_PONT,
};

export function getFicheDemo(id: string): FicheDemo | null {
  return FICHES[id] ?? null;
}
