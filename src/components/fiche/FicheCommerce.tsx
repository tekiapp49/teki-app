"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconBread,
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconLock,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconRoute,
  IconStar,
} from "@tabler/icons-react";
import type { FicheDemo } from "@/lib/fiches/demo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavori } from "@/lib/favoris";

export default function FicheCommerce({ fiche }: { fiche: FicheDemo }) {
  // Un visiteur non inscrit voit les infos verrouillées. Toucher un
  // élément verrouillé ouvre l'inscription (téléphone + code SMS) ; une
  // fois le code validé, on revient ici, débloqué (jamais renvoyé à
  // l'accueil), et le toast « Inscription terminée » s'affiche.
  const { user, requireAuth } = useAuth();
  const inscrit = !!user;
  const [toast, setToast] = useState(false);
  const [favori, toggleFavori] = useFavori(fiche.id);

  function demanderInscription() {
    requireAuth(() => setToast(true));
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream pb-10">
      {/* Couverture + retour + badge catégorie */}
      <div className="relative">
        <div className="h-40 w-full bg-brand-surface-alt" />

        <Link
          href="/"
          aria-label="Retour"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-text/50 text-white backdrop-blur-sm"
        >
          <IconArrowLeft size={20} />
        </Link>

        {toast && (
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-brand-text px-4 py-2 text-sm font-semibold text-white shadow-md">
              <IconCheck size={16} className="text-brand-green-light" />
              Inscription terminée
            </div>
          </div>
        )}

        <div className="absolute -bottom-7 left-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-terracotta ring-4 ring-brand-cream">
          <IconBread size={30} className="text-white" />
        </div>
      </div>

      <div className="px-5 pt-10">
        {/* Titre + méta */}
        <h1 className="text-2xl font-bold text-brand-text">{fiche.nom}</h1>
        <p className="mt-0.5 text-sm text-brand-text-secondary">
          {fiche.categorie} · {fiche.commune} · {fiche.distance} ·{" "}
          <span className="font-semibold text-brand-green-light">
            {fiche.ouvert ? "Ouvert" : "Fermé"}
          </span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-text-secondary">
          <IconMapPin size={16} className="shrink-0" />
          {fiche.adresse}
        </p>

        {/* Actions : Favoris / Appeler / Itinéraire */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* Favoris : déclenche l'inscription pour un visiteur */}
          {!inscrit ? (
            <ActionButton
              icon={<IconHeart size={18} />}
              label="Favoris"
              variant="primary"
              onClick={demanderInscription}
            />
          ) : (
            <ActionButton
              icon={
                favori ? (
                  <IconHeartFilled size={18} />
                ) : (
                  <IconHeart size={18} />
                )
              }
              label="Favoris"
              variant={favori ? "primary" : "neutral"}
              onClick={toggleFavori}
            />
          )}

          {!inscrit ? (
            <ActionButton
              icon={<IconLock size={16} />}
              label="Appeler"
              variant="locked"
              onClick={demanderInscription}
            />
          ) : (
            <ActionButton
              icon={<IconPhone size={18} />}
              label="Appeler"
              variant="primary"
              href={`tel:${fiche.telephone}`}
            />
          )}

          {!inscrit ? (
            <ActionButton
              icon={<IconLock size={16} />}
              label="Itinéraire"
              variant="locked"
              onClick={demanderInscription}
            />
          ) : (
            <ActionButton
              icon={<IconRoute size={18} />}
              label="Itinéraire"
              variant="primary"
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                fiche.adresse,
              )}`}
            />
          )}
        </div>

        {/* Offre « En ce moment » */}
        {fiche.offre && (
          <section className="mt-5 rounded-2xl bg-brand-text p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-terracotta">
              En ce moment
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug">
              {inscrit ? fiche.offre.precis : fiche.offre.teaser}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {fiche.offre.conditions}
            </p>

            {!inscrit && (
              <button
                type="button"
                onClick={demanderInscription}
                className="mt-3 flex items-start gap-2 text-left text-sm"
              >
                <IconLock
                  size={16}
                  className="mt-0.5 shrink-0 text-brand-terracotta"
                />
                <span>
                  <span className="font-bold text-brand-terracotta">
                    Gratuit
                  </span>{" "}
                  · inscris-toi pour voir l&apos;offre
                </span>
              </button>
            )}
          </section>
        )}

        {/* Photos (toujours visibles) */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="aspect-square rounded-xl bg-brand-surface-alt" />
          <div className="aspect-square rounded-xl bg-brand-surface" />
          <div className="aspect-square rounded-xl bg-brand-surface-alt" />
        </div>

        {/* Avis (lecture toujours visible) */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-text">Avis</h2>
            <button
              type="button"
              onClick={inscrit ? undefined : demanderInscription}
              className="flex items-center gap-1.5 text-sm text-brand-text-on-brown"
            >
              <IconPencil size={16} />
              Laisser un avis
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold text-brand-text">
              {fiche.note.toLocaleString("fr-FR", {
                minimumFractionDigits: 1,
              })}
            </span>
            <IconStar size={20} className="text-brand-terracotta" />
            <span className="text-sm text-brand-text-secondary">
              {fiche.nbAvis} avis
            </span>
          </div>

          {fiche.avis.map((avis) => (
            <div
              key={avis.id}
              className="mt-3 rounded-2xl bg-brand-surface p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface-alt text-xs font-semibold text-brand-text-on-brown">
                  {avis.initiales}
                </span>
                <span className="text-sm font-semibold text-brand-text">
                  {avis.auteur}
                </span>
                <IconStar size={15} className="text-brand-terracotta" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                {avis.commentaire}
              </p>
            </div>
          ))}
        </section>

        {/* Horaires (toujours visibles) */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-brand-text">Horaires</h2>
          <div className="mt-2 divide-y divide-brand-surface-alt">
            {fiche.horaires.map((h) => (
              <div
                key={h.label}
                className={`flex items-center justify-between py-2.5 text-sm ${
                  h.actif
                    ? "font-semibold text-brand-text"
                    : "text-brand-text-secondary"
                }`}
              >
                <span>{h.label}</span>
                <span>{h.valeur}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

type ActionVariant = "primary" | "neutral" | "locked";

function ActionButton({
  icon,
  label,
  variant,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  variant: ActionVariant;
  onClick?: () => void;
  href?: string;
}) {
  const styles: Record<ActionVariant, string> = {
    primary: "bg-brand-green text-white",
    neutral: "bg-brand-surface-alt text-brand-text",
    locked: "bg-brand-surface-alt text-brand-text-on-brown",
  };
  const className = `flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-sm font-semibold ${styles[variant]}`;

  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
