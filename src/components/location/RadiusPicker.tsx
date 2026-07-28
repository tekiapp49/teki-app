"use client";

import { Check } from "lucide-react";
import { RAYONS_KM, setRayon, type Rayon } from "@/lib/rayon";

export default function RadiusPicker({
  current,
  onSelect,
  onClose,
}: {
  current: Rayon;
  onSelect: (r: Rayon) => void;
  onClose: () => void;
}) {
  const options: Rayon[] = [...RAYONS_KM, null];

  function choisir(r: Rayon) {
    setRayon(r);
    onSelect(r);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      <div className="pointer-events-auto relative mx-auto w-full max-w-md rounded-t-[30px] bg-app px-6 pb-8 pt-6">
        <h1 className="font-display text-[20px]">Distance autour de toi</h1>
        <p className="mt-1 text-[13px] text-sand-600">
          On ne te montre que ce qui est dans ce rayon.
        </p>
        <div className="mt-3 flex flex-col">
          {options.map((r) => {
            const actif = (current ?? "tout") === (r ?? "tout");
            return (
              <button
                key={r ?? "tout"}
                type="button"
                onClick={() => choisir(r)}
                className="flex items-center justify-between border-b border-divider py-3.5 text-left last:border-b-0"
              >
                <span
                  className={`text-[15px] ${
                    actif ? "font-semibold text-ink" : "text-ink"
                  }`}
                >
                  {r === null ? "Tout le territoire" : `${r} km`}
                </span>
                {actif && (
                  <Check size={18} strokeWidth={2.75} className="text-acc2-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
