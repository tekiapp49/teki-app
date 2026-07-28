// Communes du territoire pilote (Mauges) affichées en étiquettes sur la
// carte, pour garder des repères là où les tuiles OSM masquent les petites
// villes. Coordonnées approximatives (suffisant pour un label).
export type CommuneLabel = { name: string; lat: number; lng: number };

export const COMMUNES: CommuneLabel[] = [
  { name: "Beaupréau", lat: 47.2075, lng: -0.9908 },
  { name: "Jallais", lat: 47.1756, lng: -0.8664 },
  { name: "Saint-Florent-le-Vieil", lat: 47.3608, lng: -1.0125 },
  { name: "Chemillé", lat: 47.2126, lng: -0.7269 },
  { name: "Montrevault-sur-Èvre", lat: 47.2558, lng: -1.0439 },
  { name: "Le May-sur-Èvre", lat: 47.1225, lng: -0.9331 },
  { name: "Saint-Macaire-en-Mauges", lat: 47.1356, lng: -1.0206 },
  { name: "Andrezé", lat: 47.1719, lng: -0.9469 },
  { name: "Gesté", lat: 47.1758, lng: -1.0839 },
  { name: "La Pommeraye", lat: 47.3436, lng: -0.9214 },
  { name: "Saint-Pierre-Montlimart", lat: 47.2669, lng: -1.0075 },
  { name: "Cholet", lat: 47.0592, lng: -0.8788 },
];
