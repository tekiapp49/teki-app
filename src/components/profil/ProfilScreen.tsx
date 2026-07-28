"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  MapPin,
  Pencil,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getFavoris } from "@/lib/favoris";
import { getLieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { labelInteret } from "@/lib/interets";
import BottomNav from "@/components/nav/BottomNav";

type Profil = {
  prenom: string | null;
  nom: string | null;
  centres_interet: string[] | null;
  lieu_reference_nom: string | null;
};

export default function ProfilScreen() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();
  const [profil, setProfil] = useState<Profil | null>(null);
  const favIds = useClientValue(getFavoris, [] as string[]);
  const lieu = useClientValue(() => getLieu()?.name ?? null, null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profils")
      .select("prenom, nom, centres_interet, lieu_reference_nom")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfil(data as Profil | null));
  }, [user, supabase]);

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/fil");
  }

  if (!loading && !user) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
        <div className="flex-1 px-[18px] pb-24 pt-16">
          <h1 className="font-display text-[26px]">Profil</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-sand-600">
            Inscris-toi gratuitement pour retrouver tes favoris et ton profil.
          </p>
          <button
            type="button"
            onClick={() => requireAuth()}
            className="mt-4 rounded-full bg-acc px-5 py-3 font-display text-[13.5px] text-white"
          >
            S&apos;inscrire
          </button>
        </div>
        <BottomNav />
      </main>
    );
  }

  const nomComplet =
    [profil?.prenom, profil?.nom].filter(Boolean).join(" ") || "Ton profil";
  const initiale = (profil?.prenom?.[0] ?? "?").toUpperCase();
  const commune = profil?.lieu_reference_nom ?? lieu ?? "—";
  const interets = profil?.centres_interet ?? [];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
        {/* En-tête vert */}
        <header className="rounded-b-[30px] bg-acc2-800 px-[18px] pb-[18px] pt-[22px] text-app">
          <div className="flex items-center gap-[14px]">
            <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-acc font-display text-[24px] text-app outline outline-[3px] outline-[rgba(250,247,240,0.35)]">
              {initiale}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[23px] leading-tight">
                {nomComplet}
              </h1>
              <p className="mt-0.5 text-[12.5px] text-acc2-300">
                {commune} · membre
              </p>
            </div>
            <button
              type="button"
              aria-label="Modifier"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-acc2-700 text-app"
            >
              <Pencil size={16} strokeWidth={2.75} />
            </button>
          </div>

          <div className="mt-[15px] flex gap-2">
            <StatTile n={favIds.length} label="suivis" />
            <StatTile n={interets.length} label="intérêts" />
            <StatTile n={commune === "—" ? 0 : 1} label="village" />
          </div>
        </header>

        <div className="px-[18px] pt-4">
          {/* Centres d'intérêt */}
          {interets.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-sand-600">
                Tes centres d&apos;intérêt
              </p>
              <div className="mt-[9px] flex flex-wrap gap-[7px]">
                {interets.map((k, i) => (
                  <span
                    key={k}
                    className={`rounded-full px-[13px] py-1.5 text-[12.5px] font-semibold ${
                      i % 2 === 0
                        ? "bg-acc-100 text-acc-800"
                        : "bg-acc2-100 text-acc2-800"
                    }`}
                  >
                    {labelInteret(k)}
                  </span>
                ))}
                <span className="rounded-full border-[1.5px] border-dashed border-sand-400 px-[13px] py-1.5 text-[12.5px] text-sand-600">
                  + Ajouter
                </span>
              </div>
            </>
          )}

          {/* Réglages */}
          <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-sand-600">
            Réglages
          </p>
          <div className="mt-[9px] flex flex-col gap-[7px]">
            <SettingRow
              Icon={MapPin}
              titre="Mes villages"
              sous={`${commune} + 10 km`}
            />
            <SettingRow
              Icon={Bell}
              titre="Notifications"
              sous="Favoris et alentours"
            />

            {/* Espace pro & asso (mis en avant) */}
            <Link
              href="/pro/boulangerie-du-pont"
              className="flex items-center gap-3 rounded-[18px] bg-acc2-100 px-[13px] py-[11px]"
            >
              <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-acc2-700 text-app">
                <Store size={17} strokeWidth={2.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-semibold">
                  Espace pro &amp; asso
                </h3>
                <p className="mt-px text-[11.5px] text-acc2-800">
                  Publier vos événements et promos
                </p>
              </div>
              <span className="flex-none rounded-full bg-acc2-800 px-3 py-[5px] font-display text-[11.5px] text-app">
                Ouvrir
              </span>
            </Link>

            <SettingRow Icon={HelpCircle} titre="Aide & contact" neutre />
          </div>

          <button
            type="button"
            onClick={seDeconnecter}
            className="mt-6 text-[13px] font-semibold text-sand-600 underline underline-offset-4"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

function StatTile({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex-1 rounded-2xl bg-acc2-700 px-1 py-[9px] text-center">
      <b className="block font-display text-[17px]">{n}</b>
      <span className="text-[10.5px] text-acc2-300">{label}</span>
    </span>
  );
}

function SettingRow({
  Icon,
  titre,
  sous,
  neutre,
}: {
  Icon: typeof MapPin;
  titre: string;
  sous?: string;
  neutre?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-[18px] border border-divider bg-white px-[13px] py-[11px] text-left"
    >
      <span
        className={`flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full ${
          neutre ? "bg-sand-200 text-sand-700" : "bg-acc-100 text-acc-800"
        }`}
      >
        <Icon size={17} strokeWidth={2.75} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14.5px] font-semibold">{titre}</h3>
        {sous && <p className="mt-px text-[11.5px] text-sand-600">{sous}</p>}
      </div>
      <ChevronRight size={15} strokeWidth={2.75} className="flex-none text-sand-500" />
    </button>
  );
}
