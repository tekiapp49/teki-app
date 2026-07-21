"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconBuildingStore,
  IconChevronDown,
} from "@tabler/icons-react";

// Bandeau de contexte plein largeur, coloré selon la fiche, affichant
// son nom sur chaque écran pro. Le chevron évoque le sélecteur multi-fiches
// (différé en V1).
export default function ProBanner({
  nom,
  type,
  backHref,
}: {
  nom: string;
  type: "commerce" | "association";
  backHref: string;
}) {
  const bg = type === "association" ? "bg-brand-green-light" : "bg-brand-terracotta";
  return (
    <div className={`${bg} text-white`}>
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <Link href={backHref} aria-label="Retour">
          <IconArrowLeft size={22} />
        </Link>
        <IconBuildingStore size={20} className="shrink-0" />
        <span className="flex-1 font-bold">{nom}</span>
        <IconChevronDown size={20} className="opacity-80" />
      </div>
    </div>
  );
}
