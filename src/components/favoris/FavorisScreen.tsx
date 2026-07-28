"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Store, Users } from "lucide-react";
import { FAMILLES, type Filtre } from "@/lib/feed/demo";
import {
  communeFromAdresse,
  fetchFichesByIds,
  fetchPublicationsByFicheIds,
  type Fiche,
} from "@/lib/db";
import { getFavoris, getNotifOff, toggleNotifOff } from "@/lib/favoris";
import { useClientValue } from "@/lib/useClientValue";
import BottomNav from "@/components/nav/BottomNav";

type Row = { fiche: Fiche; accroche: string };

export default function FavorisScreen() {
  const favIds = useClientValue(getFavoris, [] as string[]);
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const fiches = await fetchFichesByIds(favIds);
      const pubs = await fetchPublicationsByFicheIds(favIds);
      setRows(
        fiches.map((fiche) => {
          const pub = pubs.find((p) => p.fiche_id === fiche.id);
          return { fiche, accroche: pub?.texte ?? fiche.categorie };
        }),
      );
    })();
  }, [favIds]);

  const filtered =
    filtre === "tout"
      ? rows
      : rows?.filter((r) =>
          filtre === "commerces"
            ? r.fiche.type === "commerce"
            : r.fiche.type === "association",
        );
  const vide = rows !== null && rows.length === 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
        <header className="rounded-b-[30px] bg-acc2-800 px-[18px] pb-4 pt-[22px] text-app">
          <h1 className="font-display text-[26px] leading-none">Tes favoris</h1>
          <p className="mt-1.5 text-[13px] text-acc2-300">
            {rows === null
              ? "Chargement…"
              : vide
                ? "Rien pour l'instant"
                : `${rows.length} lieu${rows.length > 1 ? "x" : ""} et assos suivis`}
          </p>
          {!vide && rows !== null && (
            <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAMILLES.filter((f) => f.key !== "sorties").map(
                ({ key, label }) => {
                  const actif = filtre === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFiltre(key)}
                      className={`flex-none rounded-full px-[13px] py-1.5 text-[12px] ${
                        actif
                          ? "bg-acc font-display text-white"
                          : "border-[1.5px] border-acc2-500 text-acc2-100"
                      }`}
                    >
                      {label === "Commerces" ? "Commerces" : label}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </header>

        {vide ? (
          <div className="mt-24 flex flex-col items-center px-6 text-center">
            <h2 className="font-display text-[19px]">Ton réseau se construit</h2>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-sand-600">
              Ajoute des commerces, associations ou événements en favoris pour
              les retrouver ici.
            </p>
            <Link
              href="/fil"
              className="mt-6 rounded-full bg-acc px-5 py-3 font-display text-[13.5px] text-white"
            >
              Découvrir TéKi là
            </Link>
          </div>
        ) : (
          <div className="px-[18px] pt-4">
            <div className="flex flex-col gap-2.5">
              {filtered?.map((row) => <FavoriCard key={row.fiche.id} row={row} />)}
            </div>
            {rows !== null && (
              <p className="mt-3 text-center text-[11.5px] text-sand-600">
                La cloche active les notifications de ce favori.
              </p>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function FavoriCard({ row }: { row: Row }) {
  const { fiche, accroche } = row;
  const commerce = fiche.type === "commerce";
  const Icon = commerce ? Store : Users;
  const image = fiche.photos?.[0];
  const notifOff0 = useClientValue(
    () => getNotifOff().includes(fiche.id),
    false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const notifOff = override ?? notifOff0;

  return (
    <Link
      href={`/fiche/${fiche.id}`}
      className="flex items-center gap-[13px] rounded-[26px] border border-divider bg-white py-[9px] pl-[9px] pr-[13px]"
    >
      <span
        className={`relative flex-none ${
          image
            ? "washed bg-cover bg-center"
            : "flex items-center justify-center bg-acc2-200 text-acc2-800"
        } h-[88px] w-[76px] rounded-[38px_38px_15px_15px]`}
        style={image ? { backgroundImage: `url('${image}')` } : undefined}
      >
        {!image && <Icon size={24} strokeWidth={2.75} />}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className={`text-[10px] uppercase tracking-[0.1em] ${
            commerce ? "text-acc-700" : "text-acc2-700"
          }`}
        >
          {commerce ? "Commerce" : "Association"}
          {communeFromAdresse(fiche.adresse)
            ? ` · ${communeFromAdresse(fiche.adresse)}`
            : ""}
        </span>
        <h3 className="mt-0.5 truncate text-[15.5px] font-semibold">
          {fiche.nom}
        </h3>
        <p
          className={`mt-px truncate text-[12px] ${
            commerce ? "text-acc-800" : "text-acc2-800"
          }`}
        >
          {accroche}
        </p>
      </div>

      <button
        type="button"
        aria-label="Notifications de ce favori"
        onClick={(e) => {
          e.preventDefault();
          setOverride(toggleNotifOff(fiche.id));
        }}
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
          notifOff
            ? "bg-surface text-sand-600"
            : commerce
              ? "bg-acc text-white"
              : "bg-acc2-700 text-white"
        }`}
      >
        {notifOff ? (
          <BellOff size={15} strokeWidth={2.75} />
        ) : (
          <Bell size={15} strokeWidth={2.75} />
        )}
      </button>
    </Link>
  );
}
