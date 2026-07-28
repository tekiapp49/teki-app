"use client";

import {
  rayonLabel,
  rayonToSlider,
  setRayon,
  sliderToRayon,
  type Rayon,
} from "@/lib/rayon";

export default function RadiusPicker({
  current,
  onSelect,
  onClose,
}: {
  current: Rayon;
  onSelect: (r: Rayon) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      {/* Fond transparent : la carte (et son cercle) reste visible pendant
          le réglage. */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0"
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

        <input
          type="range"
          min={0}
          max={1000}
          value={rayonToSlider(current)}
          onChange={(e) => {
            const km = sliderToRayon(Number(e.target.value));
            setRayon(km);
            onSelect(km);
          }}
          className="mt-5 w-full accent-acc"
          aria-label="Rayon de recherche"
        />
        <div className="mt-1 flex justify-between text-[11px] text-sand-600">
          <span>1 km</span>
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
