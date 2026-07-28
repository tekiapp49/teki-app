"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { setLieu } from "@/lib/lieu";
import type { CommuneResult } from "@/lib/geo/nominatim";
import {
  DEFAULT_CENTER,
  DEFAULT_TERRITORY_NAME,
  DEFAULT_ZOOM,
  LOCATED_ZOOM,
} from "@/lib/geo/constants";
import LocationOnboardingCard from "./LocationOnboardingCard";
import BottomNav from "@/components/nav/BottomNav";
import type { MapMarker } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-sand-600">
      Chargement de la carte…
    </div>
  ),
});

const FILTRES_CARTE = ["Aujourd'hui ▾", "Tout ▾", "Ouvert maintenant"];

export default function MapEntryScreen() {
  const { state: geoState, request: requestLocation } = useGeolocation();
  const [manualLocation, setManualLocation] = useState<CommuneResult | null>(
    null,
  );

  const geolocActive = geoState.status === "granted";
  const hasLocation = geolocActive || manualLocation !== null;
  const lieuName = geolocActive
    ? "Ma position"
    : (manualLocation?.name ?? DEFAULT_TERRITORY_NAME);

  // Mémorise le lieu (pour le fil) dès que la géoloc est accordée.
  useEffect(() => {
    if (geoState.status === "granted") {
      setLieu({ name: "Ma position", lat: geoState.lat, lng: geoState.lng });
    }
  }, [geoState]);

  const center = useMemo<[number, number]>(() => {
    if (geoState.status === "granted") return [geoState.lat, geoState.lng];
    if (manualLocation) return [manualLocation.lat, manualLocation.lng];
    return DEFAULT_CENTER;
  }, [geoState, manualLocation]);

  const zoom = hasLocation ? LOCATED_ZOOM : DEFAULT_ZOOM;

  const marker = useMemo<MapMarker | null>(() => {
    if (geoState.status === "granted") {
      return { id: "user", lat: geoState.lat, lng: geoState.lng, kind: "user" };
    }
    if (manualLocation) {
      return {
        id: manualLocation.id,
        lat: manualLocation.lat,
        lng: manualLocation.lng,
        kind: "commune",
      };
    }
    return null;
  }, [geoState, manualLocation]);

  function handleSelectCommune(result: CommuneResult) {
    setManualLocation(result);
    setLieu({ name: result.name, lat: result.lat, lng: result.lng });
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-app">
      {hasLocation && (
        <header className="z-[600] flex-none rounded-b-[30px] bg-acc2-800 px-[18px] pb-[15px] pt-[18px] text-app">
          <div className="flex gap-2">
            <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-app px-3.5 py-[7px] text-[13px] font-semibold text-ink">
              <MapPin size={14} strokeWidth={2.75} />
              {lieuName} ▾
            </span>
            <span className="inline-flex flex-none items-center rounded-full bg-acc2-700 px-3.5 py-[7px] text-[13px] text-acc2-100">
              10 km ▾
            </span>
            <button
              type="button"
              aria-label="Rechercher"
              className="ml-auto flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-acc2-700 text-app"
            >
              <Search size={15} strokeWidth={2.75} />
            </button>
          </div>
          <div className="mt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTRES_CARTE.map((f, i) => (
              <span
                key={f}
                className={`flex-none rounded-full px-[13px] py-1.5 text-[12px] ${
                  i === 0
                    ? "bg-acc font-display text-app"
                    : "border-[1.5px] border-acc2-500 text-acc2-100"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </header>
      )}

      <div className="relative flex-1">
        <LeafletMap center={center} zoom={zoom} marker={marker} />

        {!hasLocation && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex justify-center">
            <div className="w-full">
              <LocationOnboardingCard
                geoState={geoState}
                onRequestLocation={requestLocation}
                onSelectCommune={handleSelectCommune}
              />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
