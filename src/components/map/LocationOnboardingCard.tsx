"use client";

import { useState } from "react";
import {
  IconArrowLeft,
  IconCurrentLocation,
  IconLoader2,
} from "@tabler/icons-react";
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

  // Après un refus du navigateur, on bascule d'office sur le repli manuel
  // (l'écran « Indique ton lieu »), sans que la personne ait à cliquer.
  const enManuel = manualMode || wasRefused;

  return (
    <div className="pointer-events-auto w-full rounded-t-3xl bg-brand-cream px-6 pb-8 pt-6 shadow-[0_-8px_30px_rgba(43,43,40,0.10)]">
      {!enManuel ? (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface">
            <IconCurrentLocation size={24} className="text-brand-green" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-brand-text">
            Autoriser ma position
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-text-secondary">
            TéKi te montre ce qui se passe autour de toi. Sans ta position, on
            ne peut rien te proposer de proche.
          </p>

          <button
            type="button"
            onClick={onRequestLocation}
            disabled={isRequesting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
          >
            {isRequesting ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Localisation en cours…
              </>
            ) : (
              "Activer ma position"
            )}
          </button>

          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="mt-4 text-sm text-brand-text-on-brown underline underline-offset-4"
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
            className="mb-3 -ml-1 flex h-8 w-8 items-center justify-center text-brand-text"
          >
            <IconArrowLeft size={22} />
          </button>

          <h1 className="text-xl font-bold text-brand-text">Indique ton lieu</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
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
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-green underline underline-offset-4 disabled:opacity-70"
          >
            {isRequesting ? (
              <IconLoader2 size={18} className="animate-spin" />
            ) : (
              <IconCurrentLocation size={18} />
            )}
            Utiliser ma position actuelle
          </button>
        </div>
      )}
    </div>
  );
}
