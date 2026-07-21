"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconBuildingStore,
  IconCurrentLocation,
  IconInfoCircle,
  IconSearch,
  IconTicket,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";
import { FAMILLES, FEED, type FeedItem, type Filtre } from "@/lib/feed/demo";
import { getLieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { DEFAULT_TERRITORY_NAME } from "@/lib/geo/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import BottomNav from "@/components/nav/BottomNav";
import BrandMark from "@/components/map/BrandMark";

export default function FilScreen() {
  const { user, requireAuth } = useAuth();
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const lieuName = useClientValue(() => getLieu()?.name ?? null, null) ??
    DEFAULT_TERRITORY_NAME;

  // Favoris d'abord (à venir), puis proximité croissante. Jamais de
  // classement lié à l'abonnement.
  const items = useMemo(() => {
    const filtered =
      filtre === "tout" ? FEED : FEED.filter((f) => f.famille === filtre);
    return [...filtered].sort((a, b) => a.distanceM - b.distanceM);
  }, [filtre]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream px-5 pb-28 pt-5">
      {/* En-tête */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark size={40} />
          <h1 className="text-2xl font-extrabold leading-tight">
            <span className="text-brand-text">TéKi</span>{" "}
            <span className="text-brand-green-light">là</span>
          </h1>
        </div>
        <button
          type="button"
          aria-label="Rechercher"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-brand-text"
        >
          <IconSearch size={20} />
        </button>
      </header>

      {/* Lieu + rayon */}
      <div className="mt-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-brand-text px-3 py-1.5 text-sm font-semibold text-white">
          <IconCurrentLocation size={16} />
          {lieuName}
        </span>
        <span className="rounded-full bg-brand-surface-alt px-3 py-1.5 text-sm text-brand-text-secondary">
          10 km
        </span>
      </div>

      {/* Familles */}
      <div className="mt-4 flex justify-between">
        {FAMILLES.map(({ key, label, Icon: FamIcon }) => {
          const actif = filtre === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFiltre(key)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  actif
                    ? "bg-brand-green text-white"
                    : "bg-brand-surface text-brand-text-on-brown"
                }`}
              >
                <FamIcon size={22} />
              </span>
              <span
                className={`text-xs ${
                  actif
                    ? "font-bold text-brand-text"
                    : "text-brand-text-secondary"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fil */}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-brand-text-secondary">
            Rien d&apos;actif dans cette famille pour l&apos;instant.
          </p>
        )}

        {/* Incitation à l'inscription (visiteur uniquement) */}
        {!user && (
          <div className="rounded-2xl bg-brand-text p-5 text-white">
            <h2 className="text-lg font-bold">Tu fais déjà partie de TéKi</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              Même en simple visiteur, ton regard compte. Inscris-toi
              gratuitement pour suivre, publier un avis et échanger.
            </p>
            <button
              type="button"
              onClick={() => requireAuth()}
              className="mt-3 rounded-full bg-[#E4A87F] px-4 py-2 text-sm font-semibold text-brand-text"
            >
              Je m&apos;inscris
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

const KIND_STYLE: Record<
  FeedItem["kind"],
  { wrap: string; badge: string; Icon: Icon }
> = {
  commerce: {
    wrap: "bg-brand-terracotta/10",
    badge: "bg-brand-terracotta",
    Icon: IconBuildingStore,
  },
  association: {
    wrap: "bg-brand-green/10",
    badge: "bg-brand-green-light",
    Icon: IconUsersGroup,
  },
  evenement: {
    wrap: "bg-brand-surface-alt",
    badge: "bg-brand-text-on-brown",
    Icon: IconTicket,
  },
  info: { wrap: "", badge: "", Icon: IconInfoCircle },
};

function FeedCard({ item }: { item: FeedItem }) {
  // Info officielle : petite carte discrète, jamais alarmante.
  if (item.kind === "info") {
    return (
      <div className="rounded-2xl bg-brand-surface-alt px-4 py-3.5">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-brand-text">
          <IconInfoCircle
            size={18}
            className="mt-0.5 shrink-0 text-brand-text-on-brown"
          />
          <span>
            <span className="font-semibold">{item.badge}</span> · {item.nom}
          </span>
        </p>
      </div>
    );
  }

  const style = KIND_STYLE[item.kind];
  const inner = (
    <div className={`overflow-hidden rounded-2xl ${style.wrap}`}>
      <div className="relative h-24">
        <div
          className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-white ${style.badge}`}
        >
          <style.Icon size={22} />
        </div>
      </div>
      <div className="px-4 pb-4">
        <h3 className="text-lg font-bold text-brand-text">{item.nom}</h3>
        <p className="mt-0.5 text-sm text-brand-text-secondary">
          {item.distanceLabel} · {item.accroche}
        </p>
      </div>
    </div>
  );

  return item.href ? <Link href={item.href}>{inner}</Link> : inner;
}
