"use client";

import dynamic from "next/dynamic";
import {
  rayonLabel,
  rayonToSlider,
  setRayon,
  sliderToRayon,
  zoomForRayon,
  type Rayon,
} from "@/lib/rayon";
import type { FichePin } from "@/components/map/LeafletMap";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface text-[12px] text-sand-600">
      Chargement de la carte…
    </div>
  ),
});

export default function RadiusPicker({
  current,
  onSelect,
  onClose,
  miniMap,
}: {
  current: Rayon;
  onSelect: (r: Rayon) => void;
  onClose: () => void;
  // Aperçu cartographique de la zone (utile sur le Fil, qui n'a pas de
  // carte pour visualiser le rayon).
  miniMap?: { lat: number; lng: number; pins: FichePin[] };
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      <div className="pointer-events-auto relative mx-auto w-full max-w-md rounded-t-[30px] bg-app px-6 pb-8 pt-6 shadow-[0_-8px_30px_rgba(46,43,37,0.16)]">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-[20px]">Zone de recherche</h1>
          <span className="font-display text-[24px] text-acc">
            {rayonLabel(current)}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-sand-600">
          On ne te montre que ce qui est dans ce rayon.
        </p>

        {miniMap && (
          <div className="mt-4 h-[190px] overflow-hidden rounded-[22px] border border-divider">
            <LeafletMap
              center={[miniMap.lat, miniMap.lng]}
              zoom={zoomForRayon(current)}
              userLoc={{ lat: miniMap.lat, lng: miniMap.lng }}
              pins={miniMap.pins}
              circle={{
                lat: miniMap.lat,
                lng: miniMap.lng,
                radius: current,
              }}
              interactive={false}
            />
          </div>
        )}

        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={rayonToSlider(current)}
          onChange={(e) => {
            const m = sliderToRayon(Number(e.target.value));
            setRayon(m);
            onSelect(m);
          }}
          className="mt-5 w-full accent-acc"
          aria-label="Rayon de recherche"
        />
        <div className="mt-1 flex justify-between text-[11px] text-sand-600">
          <span>200 m</span>
          <span>50 km</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-acc2-800 py-3 font-display text-[14px] text-app"
        >
          OK
        </button>
      </div>
    </div>
  );
}
