"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  Heart,
  Lock,
  Share,
} from "lucide-react";
import {
  datePill,
  dateLongue,
  distanceLabel,
  fetchFiche,
  type Fiche,
  type Publication,
} from "@/lib/db";
import { getLieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavori } from "@/lib/favoris";
import BottomNav from "@/components/nav/BottomNav";

const JOUR_KEYS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

export default function FicheCommerce({ id }: { id: string }) {
  const { user, requireAuth } = useAuth();
  const inscrit = !!user;
  const [toast, setToast] = useState(false);
  const [data, setData] = useState<
    { fiche: Fiche; publications: Publication[] } | null | "loading"
  >("loading");
  const [favori, toggleFavori] = useFavori(id);
  const lieu = useClientValue(() => getLieu(), null);

  useEffect(() => {
    fetchFiche(id).then((d) => setData(d ?? null));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function demanderInscription() {
    requireAuth(() => setToast(true));
  }
  function suivre() {
    if (!inscrit) demanderInscription();
    else toggleFavori();
  }

  if (data === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-app text-sand-600">
        Chargement…
        <BottomNav />
      </main>
    );
  }
  if (data === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 bg-app px-6 text-center">
        <p className="text-sand-600">Cette fiche n&apos;existe pas ou plus.</p>
        <Link
          href="/fil"
          className="rounded-full bg-acc px-5 py-2.5 font-display text-[13.5px] text-white"
        >
          Retour à l&apos;accueil
        </Link>
        <BottomNav />
      </main>
    );
  }

  const { fiche, publications } = data;
  const promo = publications.find((p) => p.type === "promo");
  const actu = publications.find((p) => p.type === "actu");
  const events = publications.filter((p) => p.type === "evenement");

  const initiales = fiche.nom
    .split(" ")
    .filter((m) => /[A-Za-zÀ-ÿ]/.test(m))
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join("");
  const image = fiche.photos?.[0];
  const { label: dist } = distanceLabel(fiche, lieu);
  const todayHours = fiche.horaires?.[JOUR_KEYS[new Date().getDay()]];
  const closeH = todayHours?.split(/[–-]/).pop()?.trim();
  const itineraireUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    fiche.adresse ?? fiche.nom,
  )}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
        {/* Photo */}
        <div
          className={`relative h-[216px] rounded-b-[30px] ${
            image ? "washed bg-cover bg-center" : "bg-acc2-200"
          }`}
          style={image ? { backgroundImage: `url('${image}')` } : undefined}
        >
          <Link
            href="/fil"
            aria-label="Retour"
            className="absolute left-3.5 top-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[rgba(250,247,240,0.94)] text-ink shadow-sm"
          >
            <ChevronLeft size={17} strokeWidth={2.75} />
          </Link>
          <button
            type="button"
            aria-label="Favori"
            onClick={suivre}
            className="absolute right-3.5 top-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-acc text-app shadow-sm"
          >
            <Heart
              size={17}
              strokeWidth={2.75}
              fill={inscrit && favori ? "currentColor" : "none"}
            />
          </button>
          {toast && (
            <div className="absolute inset-x-0 top-3.5 flex justify-center">
              <span className="flex items-center gap-1.5 rounded-full bg-acc2-800 px-4 py-2 text-[13px] font-semibold text-app shadow-md">
                <Check size={15} strokeWidth={2.75} />
                Inscription terminée
              </span>
            </div>
          )}
          <span className="absolute -bottom-6 left-[18px] flex h-14 w-14 items-center justify-center rounded-full bg-acc-200 font-display text-[17px] text-acc-800 outline outline-[3.5px] outline-app">
            {initiales}
          </span>
        </div>

        <div className="px-[18px] pt-8">
          <div className="flex items-baseline justify-between gap-2.5">
            <h1 className="font-display text-[23px]">{fiche.nom}</h1>
            <span className="flex-none text-[12px] font-bold text-acc2-700">
              {todayHours ? `Ouvert · ${closeH}` : "Fermé aujourd'hui"}
            </span>
          </div>
          <p className="mt-[3px] text-[13px] text-sand-600">
            {[fiche.categorie, fiche.adresse, dist].filter(Boolean).join(" · ")}
          </p>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={suivre}
              className="flex-1 rounded-full bg-acc py-2.5 text-center font-display text-[13.5px] text-app"
            >
              {inscrit && favori ? "Suivi" : "Suivre"}
            </button>
            {inscrit ? (
              <a
                href={itineraireUrl}
                className="flex-1 rounded-full bg-surface py-2.5 text-center text-[13.5px] font-semibold text-ink"
              >
                Itinéraire
              </a>
            ) : (
              <button
                type="button"
                onClick={demanderInscription}
                className="flex-1 rounded-full bg-surface py-2.5 text-center text-[13.5px] font-semibold text-ink"
              >
                Itinéraire
              </button>
            )}
            <button
              type="button"
              aria-label="Partager"
              className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-surface text-ink"
            >
              <Share size={17} strokeWidth={2.75} />
            </button>
          </div>

          {/* Promo (magenta) ou actu (vert) */}
          {promo && (
            <div className="mt-3.5 rounded-[22px] bg-acc px-4 py-3.5 text-app">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-acc-100">
                  Promo en cours
                </span>
                <Lock size={15} strokeWidth={2.75} className={inscrit ? "hidden" : ""} />
              </div>
              <h3
                className={`mt-1.5 font-display text-[17px] text-app ${
                  inscrit ? "" : "select-none blur-[5px]"
                }`}
              >
                {promo.texte}
              </h3>
              {promo.conditions && (
                <p
                  className={`mt-1 text-[12.5px] text-acc-100 ${
                    inscrit ? "" : "select-none blur-[4px]"
                  }`}
                >
                  {promo.conditions}
                </p>
              )}
              {!inscrit && (
                <button
                  type="button"
                  onClick={demanderInscription}
                  className="mt-2 text-[12px]"
                >
                  <b>Gratuit</b> · inscris-toi pour voir l&apos;offre
                </button>
              )}
            </div>
          )}
          {!promo && actu && (
            <div className="mt-3.5 rounded-[22px] bg-acc2-100 px-4 py-3.5 text-acc2-900">
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-acc2-700">
                En ce moment
              </span>
              <h3 className="mt-1 font-display text-[16px]">{actu.texte}</h3>
            </div>
          )}

          {/* Prochainement ici */}
          {events.length > 0 && (
            <>
              <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-sand-600">
                Prochainement ici
              </p>
              <div className="mt-[9px] flex flex-col gap-2">
                {events.map((ev) => {
                  const pill = datePill(ev.date_evenement) ?? "";
                  const [jour, mois] = pill.split(" ");
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-[13px] rounded-[22px] border border-divider bg-white px-[13px] py-[11px]"
                    >
                      <span className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-full bg-acc2-700 text-app">
                        <b className="font-display text-[14px] leading-none">
                          {jour}
                        </b>
                        <span className="text-[8.5px] uppercase tracking-[0.06em]">
                          {mois}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[14.5px] font-semibold">
                          {ev.texte}
                        </h3>
                        <p className="mt-px flex items-center gap-1 text-[12px] text-acc2-800">
                          <Calendar size={12} strokeWidth={2.75} />
                          {[dateLongue(ev.date_evenement), ev.conditions]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {fiche.description && (
            <p className="mt-3.5 text-[13px] leading-relaxed text-sand-700">
              {fiche.description}
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
