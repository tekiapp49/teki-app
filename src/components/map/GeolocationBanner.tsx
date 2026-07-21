"use client";

import { IconCurrentLocation } from "@tabler/icons-react";

type GeolocationBannerProps = {
  locationName: string;
  onActivate: () => void;
};

export default function GeolocationBanner({
  locationName,
  onActivate,
}: GeolocationBannerProps) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-brand-text px-4 py-3 text-white shadow-md">
      <IconCurrentLocation
        size={20}
        className="shrink-0 text-brand-terracotta"
      />
      <p className="flex-1 text-sm leading-snug">
        Position fixe ({locationName}) · active la géoloc pour rester à jour
      </p>
      <button
        type="button"
        onClick={onActivate}
        className="shrink-0 text-sm font-semibold text-brand-terracotta"
      >
        Activer
      </button>
    </div>
  );
}
