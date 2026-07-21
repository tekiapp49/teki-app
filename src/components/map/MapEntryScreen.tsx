"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import GeolocationBanner from "./GeolocationBanner";
import BrandMark from "./BrandMark";
import type { MapMarker } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-surface text-sm text-brand-text-secondary">
      Chargement de la carte…
    </div>
  ),
});

export default function MapEntryScreen() {
  const router = useRouter();
  const { state: geoState, request: requestLocation } = useGeolocation();
  const [manualLocation, setManualLocation] = useState<CommuneResult | null>(
    null,
  );
  const [cardDismissed, setCardDismissed] = useState(false);

  // Dès que la position est connue (géoloc accordée), on mémorise le lieu
  // et on entre dans le fil « TéKi là ».
  useEffect(() => {
    if (geoState.status === "granted") {
      setLieu({ name: "Ma position", lat: geoState.lat, lng: geoState.lng });
      router.push("/fil");
    }
  }, [geoState, router]);

  const geolocActive = geoState.status === "granted";
  const showCard = !cardDismissed && !manualLocation && !geolocActive;
  const showBanner = !geolocActive && (cardDismissed || manualLocation !== null);
  const bannerLocationName = manualLocation?.name ?? DEFAULT_TERRITORY_NAME;

  const center = useMemo<[number, number]>(() => {
    if (geoState.status === "granted") return [geoState.lat, geoState.lng];
    if (manualLocation) return [manualLocation.lat, manualLocation.lng];
    return DEFAULT_CENTER;
  }, [geoState, manualLocation]);

  const zoom = geolocActive || manualLocation ? LOCATED_ZOOM : DEFAULT_ZOOM;

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
    setCardDismissed(true);
    setLieu({ name: result.name, lat: result.lat, lng: result.lng });
    router.push("/fil");
  }

  // Depuis le bandeau : (ré)activer la vraie géoloc. On garde le lieu
  // manuel comme repli tant que la position n'a pas été accordée, pour
  // éviter que la carte ne saute au centre par défaut entre-temps.
  function handleReactivate() {
    requestLocation();
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <LeafletMap center={center} zoom={zoom} marker={marker} />

      {/* Haut : logo (écran d'entrée) ou bandeau géoloc persistant */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3">
        {showBanner ? (
          <GeolocationBanner
            locationName={bannerLocationName}
            onActivate={handleReactivate}
          />
        ) : showCard ? (
          <div className="flex justify-center pt-2">
            <BrandMark />
          </div>
        ) : null}
      </div>

      {/* Bas : bottom sheet d'onboarding */}
      {showCard && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex justify-center">
          <div className="w-full max-w-md">
            <LocationOnboardingCard
              geoState={geoState}
              onRequestLocation={requestLocation}
              onSelectCommune={handleSelectCommune}
            />
          </div>
        </div>
      )}
    </div>
  );
}
