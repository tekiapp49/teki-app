"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconBell,
  IconBuildingStore,
  IconChevronRight,
  IconCurrentLocation,
  IconLogout,
  IconPlus,
} from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getLieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { INTERETS } from "@/lib/interets";
import BottomNav from "@/components/nav/BottomNav";

type Profil = {
  prenom: string | null;
  nom: string | null;
  centres_interet: string[] | null;
  lieu_reference_nom: string | null;
  notifications_actives: boolean | null;
};

type FichePro = { id: string; nom: string; categorie: string };

// Fiche de démo pour explorer l'espace pro tant que les vraies fiches ne
// sont pas en base (elles seront créées à la main dans Supabase).
const FICHE_PRO_DEMO: FichePro = {
  id: "boulangerie-du-pont",
  nom: "Boulangerie du Pont",
  categorie: "Commerce",
};

// Écran Profil principal (pages 16 du PDF). Le sélecteur multi-fiches et
// l'espace pro complet arrivent plus tard ; ici on pose l'ossature.
export default function ProfilScreen() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();

  const [profil, setProfil] = useState<Profil | null>(null);
  const [fichesPro, setFichesPro] = useState<FichePro[]>([]);
  const [notif, setNotif] = useState(true);
  const localisationActive = useClientValue(() => getLieu() !== null, false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profils")
      .select(
        "prenom, nom, centres_interet, lieu_reference_nom, notifications_actives",
      )
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as Profil | null;
        setProfil(p);
        setNotif(p?.notifications_actives ?? true);
      });
    supabase
      .from("fiches")
      .select("id, nom, categorie")
      .eq("proprietaire_user_id", user.id)
      .then(({ data }) => setFichesPro((data as FichePro[]) ?? []));
  }, [user, supabase]);

  async function toggleNotif() {
    if (!user) return;
    const v = !notif;
    setNotif(v);
    await supabase
      .from("profils")
      .update({ notifications_actives: v })
      .eq("id", user.id);
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/fil");
  }

  const nomComplet = [profil?.prenom, profil?.nom].filter(Boolean).join(" ");
  const initiale = (profil?.prenom?.[0] ?? "?").toUpperCase();
  const interets = INTERETS.filter((i) =>
    (profil?.centres_interet ?? []).includes(i.key),
  );

  if (!loading && !user) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream px-5 pb-28 pt-8">
        <h1 className="text-2xl font-bold text-brand-text">Profil</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Inscris-toi gratuitement pour retrouver tes favoris, tes messages et
          ton profil.
        </p>
        <button
          type="button"
          onClick={() => requireAuth()}
          className="mt-4 rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-white"
        >
          S&apos;inscrire
        </button>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream px-5 pb-28 pt-8">
      <h1 className="text-2xl font-bold text-brand-text">Profil</h1>

      {/* Identité */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-lg font-bold text-white">
          {initiale}
        </div>
        <div>
          <p className="text-base font-bold text-brand-text">
            {nomComplet || "Ton profil"}
          </p>
          {profil?.lieu_reference_nom && (
            <p className="text-sm text-brand-text-secondary">
              {profil.lieu_reference_nom}
            </p>
          )}
        </div>
      </div>

      {/* Centres d'intérêt (en icônes) */}
      {interets.length > 0 && (
        <>
          <p className="mt-7 text-xs font-semibold uppercase tracking-wide text-brand-text-on-brown">
            Centres d&apos;intérêt
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {interets.map(({ key, label, Icon }) => (
              <span
                key={key}
                className="flex flex-col items-center gap-1 rounded-2xl bg-brand-green px-4 py-2 text-xs font-semibold text-white"
              >
                <Icon size={22} />
                {label}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Mes fiches pro */}
      <p className="mt-7 text-xs font-semibold uppercase tracking-wide text-brand-text-on-brown">
        Mes fiches pro
      </p>
      <div className="mt-2 divide-y divide-brand-surface-alt">
        {[FICHE_PRO_DEMO, ...fichesPro].map((f) => (
          <Link
            key={f.id}
            href={`/pro/${f.id}`}
            className="flex items-center gap-3 py-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-terracotta text-white">
              <IconBuildingStore size={20} />
            </span>
            <div className="flex-1">
              <p className="font-bold text-brand-text">{f.nom}</p>
              <p className="text-sm text-brand-text-secondary">{f.categorie}</p>
            </div>
            <IconChevronRight size={18} className="text-brand-text-secondary" />
          </Link>
        ))}
        <button
          type="button"
          disabled
          title="Bientôt : ajouter et gérer une fiche pro"
          className="flex w-full items-center gap-3 py-3 text-left text-brand-text-on-brown opacity-60"
        >
          <IconPlus size={20} className="ml-1.5 shrink-0" />
          Ajouter une fiche
        </button>
      </div>

      {/* Réglages */}
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-text-on-brown">
        Réglages
      </p>
      <div className="mt-2 divide-y divide-brand-surface-alt">
        <div className="flex items-center gap-3 py-3.5">
          <IconBell size={20} className="text-brand-text" />
          <span className="flex-1 text-brand-text">Notifications</span>
          <button
            type="button"
            role="switch"
            aria-checked={notif}
            onClick={toggleNotif}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              notif ? "bg-brand-green" : "bg-brand-surface-alt"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                notif ? "left-0.5 translate-x-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3 py-3.5">
          <IconCurrentLocation size={20} className="text-brand-text" />
          <span className="flex-1 text-brand-text">Localisation</span>
          <span
            className={`text-sm font-semibold ${
              localisationActive
                ? "text-brand-green-light"
                : "text-brand-text-secondary"
            }`}
          >
            {localisationActive ? "Activée" : "Désactivée"}
          </span>
        </div>

      </div>

      <button
        type="button"
        onClick={seDeconnecter}
        className="mt-7 flex items-center gap-2 text-sm font-semibold text-brand-text-on-brown"
      >
        <IconLogout size={18} />
        Se déconnecter
      </button>

      <BottomNav />
    </main>
  );
}
