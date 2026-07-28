"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Calendar,
  Info,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FAMILLES, FEED, type FeedItem } from "@/lib/feed/demo";
import { getFavoris, getNotifOff, toggleNotifOff } from "@/lib/favoris";
import { useClientValue } from "@/lib/useClientValue";
import BottomNav from "@/components/nav/BottomNav";

export default function FavorisScreen() {
  const favIds = useClientValue(getFavoris, [] as string[]);
  const [filtre, setFiltre] = useState<string>("tout");

  const favItems = FEED.filter((f) => favIds.includes(f.id));
  const items =
    filtre === "tout" ? favItems : favItems.filter((f) => f.famille === filtre);
  const nbNouveautes = favItems.filter((f) => f.nouveaute).length;
  const vide = favItems.length === 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
        {/* En-tête vert */}
        <header className="rounded-b-[30px] bg-acc2-800 px-[18px] pb-4 pt-[22px] text-app">
          <h1 className="font-display text-[26px] leading-none">Tes favoris</h1>
          <p className="mt-1.5 text-[13px] text-acc2-300">
            {vide
              ? "Rien pour l'instant"
              : `${favItems.length} lieu${favItems.length > 1 ? "x" : ""} et assos suivis · ${nbNouveautes} nouveauté${nbNouveautes > 1 ? "s" : ""}`}
          </p>
          {!vide && (
            <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAMILLES.map(({ key, label }) => {
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
                    {label}
                  </button>
                );
              })}
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
              {items.map((item) => (
                <FavoriCard key={item.id} item={item} />
              ))}
            </div>
            <p className="mt-3 text-center text-[11.5px] text-sand-600">
              La cloche active les notifications de ce favori.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

const ARCH_ICON: Record<FeedItem["kind"], LucideIcon> = {
  commerce: Info,
  association: Users,
  evenement: Calendar,
  info: Info,
};

const TYPE_LABEL: Record<FeedItem["kind"], string> = {
  commerce: "Commerce",
  association: "Association",
  evenement: "Événement",
  info: "Info",
};

function FavoriCard({ item }: { item: FeedItem }) {
  const commerce = item.kind === "commerce";
  const ArchIcon = ARCH_ICON[item.kind];
  const notifOff0 = useClientValue(
    () => getNotifOff().includes(item.id),
    false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const notifOff = override ?? notifOff0;

  const inner = (
    <div className="flex items-center gap-[13px] rounded-[26px] border border-divider bg-white py-[9px] pl-[9px] pr-[13px]">
      <span
        className={`relative flex-none ${
          item.image
            ? "washed bg-cover bg-center"
            : "flex items-center justify-center bg-acc2-200 text-acc2-800"
        } h-[88px] w-[76px] rounded-[38px_38px_15px_15px]`}
        style={item.image ? { backgroundImage: `url('${item.image}')` } : undefined}
      >
        {!item.image && <ArchIcon size={24} strokeWidth={2.75} />}
        {item.nouveaute && (
          <span className="absolute -right-1 -top-1 block h-[18px] w-[18px] rounded-full bg-acc outline outline-2 outline-white" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className={`text-[10px] uppercase tracking-[0.1em] ${
            commerce ? "text-acc-700" : "text-acc2-700"
          }`}
        >
          {TYPE_LABEL[item.kind]}
          {item.commune ? ` · ${item.commune}` : ""}
        </span>
        <h3 className="mt-0.5 text-[15.5px] font-semibold">{item.nom}</h3>
        <p
          className={`mt-px text-[12px] ${
            commerce ? "text-acc-800" : "text-acc2-800"
          }`}
        >
          {item.accroche}
        </p>
      </div>

      <button
        type="button"
        aria-label="Notifications de ce favori"
        onClick={(e) => {
          e.preventDefault();
          setOverride(toggleNotifOff(item.id));
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
    </div>
  );

  return item.href ? <Link href={item.href}>{inner}</Link> : inner;
}
