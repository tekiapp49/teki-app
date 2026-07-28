"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MapPin, Search, Store, Users } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getLieu, setLieu, type Lieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import {
  communeFromAdresse,
  distanceLabel,
  distanceMetres,
  fetchFiches,
  type Fiche,
} from "@/lib/db";
import { getRayon, rayonLabel, zoomForRayon, type Rayon } from "@/lib/rayon";
import type { CommuneResult } from "@/lib/geo/nominatim";
import {
  DEFAULT_CENTER,
  DEFAULT_TERRITORY_NAME,
  DEFAULT_ZOOM,
} from "@/lib/geo/constants";
import LocationOnboardingCard from "./LocationOnboardingCard";
import BottomNav from "@/components/nav/BottomNav";
import SearchOverlay from "@/components/search/SearchOverlay";
import LocationPicker from "@/components/location/LocationPicker";
import RadiusPicker from "@/components/location/RadiusPicker";
import type { FichePin } from "./LeafletMap";

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
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<Lieu | null>(null);
  const [rayonPickerOpen, setRayonPickerOpen] = useState(false);
  const [pickedRayon, setPickedRayon] = useState<Rayon | undefined>(undefined);
  const initialRayon = useClientValue(() => getRayon(), 10000 as Rayon);
  const rayon = pickedRayon === undefined ? initialRayon : pickedRayon;
  const mounted = useClientValue(() => true, false);
  const storedLieu = useClientValue(() => getLieu(), null);

  useEffect(() => {
    fetchFiches().then(setFiches);
  }, []);

  const effective = useMemo(() => {
    if (geoState.status === "granted") {
      return { name: "Ma position", lat: geoState.lat, lng: geoState.lng };
    }
    if (manualLocation) {
      return {
        name: manualLocation.name,
        lat: manualLocation.lat,
        lng: manualLocation.lng,
      };
    }
    return picked ?? storedLieu;
  }, [geoState, manualLocation, picked, storedLieu]);
  const hasLocation = effective !== null;
  const lieuName = effective?.name ?? DEFAULT_TERRITORY_NAME;

  useEffect(() => {
    if (geoState.status === "granted") {
      setLieu({ name: "Ma position", lat: geoState.lat, lng: geoState.lng });
    }
  }, [geoState]);

  const center = useMemo<[number, number]>(
    () => (effective ? [effective.lat, effective.lng] : DEFAULT_CENTER),
    [effective],
  );
  // Zoom adapté au rayon pour que le cercle tienne à l'écran.
  const zoom = hasLocation ? zoomForRayon(rayon) : DEFAULT_ZOOM;

  const pins = useMemo<FichePin[]>(
    () =>
      fiches
        .filter((f) => f.lat != null && f.lng != null)
        .filter((f) => {
          if (!effective) return true;
          return (
            distanceMetres(effective, {
              lat: f.lat as number,
              lng: f.lng as number,
            }) <= rayon
          );
        })
        .map((f) => ({
          id: f.id,
          lat: f.lat as number,
          lng: f.lng as number,
          type: f.type,
        })),
    [fiches, effective, rayon],
  );
  const userLoc = effective
    ? { lat: effective.lat, lng: effective.lng }
    : null;
  const selected = fiches.find((f) => f.id === selectedId) ?? null;

  function handleSelectCommune(result: CommuneResult) {
    setManualLocation(result);
    setLieu({ name: result.name, lat: result.lat, lng: result.lng });
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-app">
      {hasLocation && (
        <header className="z-[600] flex-none rounded-b-[30px] bg-acc2-800 px-[18px] pb-[15px] pt-[18px] text-app">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex flex-none items-center gap-1.5 rounded-full bg-app px-3.5 py-[7px] text-[13px] font-semibold text-ink"
            >
              <MapPin size={14} strokeWidth={2.75} />
              {lieuName} ▾
            </button>
            <button
              type="button"
              onClick={() => setRayonPickerOpen(true)}
              className="inline-flex flex-none items-center rounded-full bg-acc2-700 px-3.5 py-[7px] text-[13px] text-acc2-100"
            >
              {rayonLabel(rayon)} ▾
            </button>
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
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
        <LeafletMap
          center={center}
          zoom={zoom}
          userLoc={userLoc}
          pins={pins}
          selectedId={selectedId}
          onSelectPin={setSelectedId}
          circle={
            effective
              ? {
                  lat: effective.lat,
                  lng: effective.lng,
                  radius: rayon,
                }
              : null
          }
        />

        {mounted && !hasLocation && (
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

        {selected && (
          <SelectedCard
            fiche={selected}
            lieu={effective}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {pickerOpen && (
        <LocationPicker
          onSelect={setPicked}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {rayonPickerOpen && (
        <RadiusPicker
          current={rayon}
          onSelect={setPickedRayon}
          onClose={() => setRayonPickerOpen(false)}
        />
      )}
      <BottomNav />
    </main>
  );
}

function SelectedCard({
  fiche,
  lieu,
  onClose,
}: {
  fiche: Fiche;
  lieu: { lat: number; lng: number } | null;
  onClose: () => void;
}) {
  const commerce = fiche.type === "commerce";
  const Icon = commerce ? Store : Users;
  const image = fiche.photos?.[0];
  const commune = communeFromAdresse(fiche.adresse);
  const { label } = distanceLabel(
    fiche,
    lieu ? { name: "", lat: lieu.lat, lng: lieu.lng } : null,
  );

  return (
    <div className="absolute inset-x-3.5 bottom-[calc(env(safe-area-inset-bottom)+74px)] z-[1400]">
      <Link
        href={`/fiche/${fiche.id}`}
        onClick={onClose}
        className="flex items-center gap-[13px] rounded-[26px] border border-divider bg-white py-[9px] pl-[9px] pr-[13px] shadow-lg"
      >
        <span
          className={`relative flex-none ${
            image
              ? "washed bg-cover bg-center"
              : "flex items-center justify-center bg-acc2-200 text-acc2-800"
          } h-[88px] w-[76px] rounded-[38px_38px_15px_15px]`}
          style={image ? { backgroundImage: `url('${image}')` } : undefined}
        >
          {!image && <Icon size={24} strokeWidth={2.75} />}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={`text-[10px] uppercase tracking-[0.1em] ${
              commerce ? "text-acc-700" : "text-acc2-700"
            }`}
          >
            {commerce ? "Commerce" : "Association"}
            {commune ? ` · ${commune}` : ""}
            {label ? ` · ${label}` : ""}
          </span>
          <h3 className="mt-0.5 truncate text-[15.5px] font-semibold">
            {fiche.nom}
          </h3>
          <p className="mt-px truncate text-[12px] text-sand-600">
            {fiche.categorie}
          </p>
        </div>
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-white ${
            commerce ? "bg-acc" : "bg-acc2-700"
          }`}
        >
          <ChevronRight size={15} strokeWidth={2.75} />
        </span>
      </Link>
    </div>
  );
}
