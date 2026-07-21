"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconPlus, IconTrash } from "@tabler/icons-react";
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

// Tableau de bord de l'espace pro (page 17) + liste des publications.
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
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream">
      <ProBanner nom={fiche.nom} type={type} backHref="/profil" />

      <div className="px-5 pb-10 pt-5">
        {/* Stats simples */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-brand-green p-4 text-white">
            <p className="text-3xl font-bold">34</p>
            <p className="text-sm">Favoris</p>
          </div>
          <div className="rounded-2xl bg-brand-surface-alt p-4">
            <p className="text-3xl font-bold text-brand-text">210</p>
            <p className="text-sm text-brand-text-secondary">Vues (30j)</p>
          </div>
        </div>

        <Link
          href={`/pro/${fiche.id}/publier`}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white"
        >
          <IconPlus size={18} />
          Publier une actu
        </Link>

        {/* Mes publications */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-text-on-brown">
          Mes publications
        </p>
        {pubs.length === 0 ? (
          <p className="mt-2 text-sm text-brand-text-secondary">
            Aucune publication pour l&apos;instant.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {pubs.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 rounded-2xl bg-brand-surface p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-terracotta px-2 py-0.5 text-xs font-semibold text-white">
                      {TYPE_LABEL[p.type]}
                    </span>
                    <span className="text-xs text-brand-text-secondary">
                      {p.quand === "programmer"
                        ? `Programmée${p.le ? ` · ${p.le}${p.heure ? ` ${p.heure}` : ""}` : ""}`
                        : "Publiée"}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-brand-text">{p.texte}</p>
                  {p.conditions && (
                    <p className="text-sm text-brand-text-secondary">
                      {p.conditions}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => supprimer(p.id)}
                  aria-label="Supprimer"
                  className="text-brand-text-secondary"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Réglages fiche */}
        <div className="mt-6 divide-y divide-brand-surface-alt">
          <Link href={`/fiche/${fiche.id}`} className="flex items-center py-3.5">
            <span className="flex-1 text-brand-text">Ma fiche</span>
            <IconChevronRight size={18} className="text-brand-text-secondary" />
          </Link>
          <div className="flex items-center py-3.5">
            <span className="flex-1 text-brand-text">Abonnement</span>
            <span className="text-sm text-brand-text-secondary">
              Proximité · 10€/mois
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
