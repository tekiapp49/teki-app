export type CommuneResult = {
  id: string;
  name: string; // court, ex. « Jallais » — pour le bandeau et le résumé
  label: string; // complet, ex. « Jallais, Maine-et-Loire » — pour la liste
  lat: number;
  lng: number;
};

// Repli manuel "recherche de commune" : géocodage via Nominatim
// (OpenStreetMap), gratuit et sans clé API — cohérent avec le choix
// Leaflet + tuiles OSM pour la carte. Recherche biaisée sur le
// Maine-et-Loire / Pays de la Loire, limitée à la France.
const VIEWBOX = "-1.6,48.0,0.6,46.6"; // large bbox Pays de la Loire (lon,lat,lon,lat)

export async function searchCommunes(
  query: string,
  signal?: AbortSignal,
): Promise<CommuneResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    format: "jsonv2",
    countrycodes: "fr",
    "accept-language": "fr",
    limit: "5",
    viewbox: VIEWBOX,
    bounded: "0",
    q: trimmed,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal, headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error("La recherche de commune a échoué.");
  }

  const data: Array<{
    place_id: number;
    name?: string;
    display_name: string;
    lat: string;
    lon: string;
  }> = await response.json();

  return data.map((item) => ({
    id: String(item.place_id),
    name: item.name || item.display_name.split(",")[0].trim(),
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
