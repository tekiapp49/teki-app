"use client";

import Link from "next/link";
import { Map } from "lucide-react";
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
  voirCarteHref,
}: {
  current: Rayon;
  onSelect: (r: Rayon) => void;
  onClose: () => void;
  // Si fourni, affiche un bouton « Voir la zone sur la carte » (utile sur
  // le Fil, qui n'a pas de carte pour visualiser le rayon).
  voirCarteHref?: string;
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

        {voirCarteHref && (
          <Link
            href={voirCarteHref}
            onClick={onClose}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-divider py-3 text-[13.5px] font-semibold text-ink"
          >
            <Map size={17} strokeWidth={2.75} />
            Voir la zone sur la carte
          </Link>
        )}
      </div>
    </div>
  );
}
