"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import type { FicheDemo } from "@/lib/fiches/demo";
import {
  deletePublication,
  getPublications,
  type Publication,
  type PubType,
} from "@/lib/publications";
import ProBanner from "./ProBanner";

const TYPE_LABEL: Record<PubType, string> = {
  promo: "Promo",
  evenement: "Événement",
  actu: "Actu",
};

export default function ProDashboard({ fiche }: { fiche: FicheDemo }) {
  const type = fiche.categorie.toLowerCase().includes("commerce")
    ? "commerce"
    : "association";

  const [pubs, setPubs] = useState<Publication[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPubs(getPublications(fiche.id));
  }, [fiche.id]);

  function supprimer(id: string) {
    deletePublication(id);
    setPubs(getPublications(fiche.id));
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-app">
      <ProBanner nom={fiche.nom} type={type} backHref="/profil" />

      <div className="px-[18px] pb-10 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-acc2-800 p-4 text-app">
            <p className="font-display text-[26px]">34</p>
            <p className="text-[13px] text-acc2-200">Favoris</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="font-display text-[26px] text-ink">210</p>
            <p className="text-[13px] text-sand-600">Vues (30j)</p>
          </div>
        </div>

        <Link
          href={`/pro/${fiche.id}/publier`}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app"
        >
          <Plus size={18} strokeWidth={2.75} />
          Publier une actu
        </Link>

        <p className="mt-6 text-[11px] uppercase tracking-[0.12em] text-sand-600">
          Mes publications
        </p>
        {pubs.length === 0 ? (
          <p className="mt-2 text-[13px] text-sand-600">
            Aucune publication pour l&apos;instant.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {pubs.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-2xl border border-divider bg-white p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-acc px-2 py-0.5 font-display text-[11px] text-app">
                      {TYPE_LABEL[p.type]}
                    </span>
                    <span className="text-[11px] text-sand-600">
                      {p.quand === "programmer"
                        ? `Programmée${p.le ? ` · ${p.le}${p.heure ? ` ${p.heure}` : ""}` : ""}`
                        : "Publiée"}
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-ink">
                    {p.texte}
                  </p>
                  {p.conditions && (
                    <p className="text-[13px] text-sand-600">{p.conditions}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => supprimer(p.id)}
                  aria-label="Supprimer"
                  className="text-sand-600"
                >
                  <Trash2 size={18} strokeWidth={2.75} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 divide-y divide-divider">
          <Link href={`/fiche/${fiche.id}`} className="flex items-center py-3.5">
            <span className="flex-1 text-ink">Ma fiche</span>
            <ChevronRight size={18} strokeWidth={2.75} className="text-sand-500" />
          </Link>
          <div className="flex items-center py-3.5">
            <span className="flex-1 text-ink">Abonnement</span>
            <span className="text-[13px] text-sand-600">
              Proximité · 10€/mois
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
