"use client";

import { useState } from "react";
import { ArrowLeft, LoaderCircle, LocateFixed } from "lucide-react";
import CommuneSearch from "./CommuneSearch";
import { SUGGESTED_COMMUNES } from "@/lib/geo/constants";
import type { CommuneResult } from "@/lib/geo/nominatim";
import type { GeolocationState } from "@/hooks/useGeolocation";

type LocationOnboardingCardProps = {
  geoState: GeolocationState;
  onRequestLocation: () => void;
  onSelectCommune: (result: CommuneResult) => void;
};

export default function LocationOnboardingCard({
  geoState,
  onRequestLocation,
  onSelectCommune,
}: LocationOnboardingCardProps) {
  const [manualMode, setManualMode] = useState(false);
  const isRequesting = geoState.status === "requesting";
  const wasRefused = geoState.status === "denied";
  const enManuel = manualMode || wasRefused;

  return (
    <div className="pointer-events-auto w-full rounded-t-[30px] bg-app px-6 pb-8 pt-6 shadow-[0_-8px_30px_rgba(46,43,37,0.14)]">
      {!enManuel ? (
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-acc2-100 text-acc2-800">
            <LocateFixed size={24} strokeWidth={2.75} />
          </span>
          <h1 className="mt-4 font-display text-[20px]">
            Vois ce qui se passe près de chez toi
          </h1>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-sand-600">
            TéKi utilise ta position pour te montrer les commerces, sorties et
            infos utiles les plus proches. Elle n&apos;est jamais partagée.
          </p>
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={isRequesting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app disabled:opacity-70"
          >
            {isRequesting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Localisation en cours…
              </>
            ) : (
              "Activer ma position"
            )}
          </button>
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="mt-4 text-[13px] text-acc-700 underline underline-offset-4"
          >
            Indiquer mon lieu manuellement
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setManualMode(false)}
            aria-label="Retour"
            className="mb-3 -ml-1 flex h-8 w-8 items-center justify-center text-ink"
          >
            <ArrowLeft size={22} strokeWidth={2.75} />
          </button>
          <h1 className="font-display text-[20px]">Indique ton lieu</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sand-600">
            Ta commune ou ton village, pour te montrer ce qui se passe autour.
          </p>
          <div className="mt-4">
            <CommuneSearch
              onSelect={onSelectCommune}
              suggestions={SUGGESTED_COMMUNES}
            />
          </div>
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={isRequesting}
            className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-acc2-700 underline underline-offset-4 disabled:opacity-70"
          >
            {isRequesting ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <LocateFixed size={18} strokeWidth={2.75} />
            )}
            Utiliser ma position actuelle
          </button>
        </div>
      )}
    </div>
  );
}
