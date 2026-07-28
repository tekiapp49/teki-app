"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Store } from "lucide-react";

// Bandeau de contexte plein largeur, coloré selon la fiche.
export default function ProBanner({
  nom,
  type,
  backHref,
}: {
  nom: string;
  type: "commerce" | "association";
  backHref: string;
}) {
  const bg = type === "association" ? "bg-acc2-800" : "bg-acc";
  return (
    <div className={`${bg} text-app`}>
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <Link href={backHref} aria-label="Retour">
          <ArrowLeft size={22} strokeWidth={2.75} />
        </Link>
        <Store size={20} strokeWidth={2.75} className="shrink-0" />
        <span className="flex-1 font-display text-[16px]">{nom}</span>
        <ChevronDown size={20} strokeWidth={2.75} className="opacity-80" />
      </div>
    </div>
  );
}
