"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChevronRight,
  Info,
  MapPin,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FAMILLES, FEED, type FeedItem, type Filtre } from "@/lib/feed/demo";
import { getLieu } from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TERRITORY_NAME } from "@/lib/geo/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import BottomNav from "@/components/nav/BottomNav";

export default function FilScreen() {
  const supabase = useMemo(() => createClient(), []);
  const { user, requireAuth } = useAuth();
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [prenom, setPrenom] = useState<string | null>(null);
  const lieuName =
    useClientValue(() => getLieu()?.name ?? null, null) ??
    DEFAULT_TERRITORY_NAME;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profils")
      .select("prenom")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setPrenom((data?.prenom as string) || null));
  }, [user, supabase]);

  const items = useMemo(() => {
    const filtered =
      filtre === "tout" ? FEED : FEED.filter((f) => f.famille === filtre);
    return [...filtered].sort((a, b) => a.distanceM - b.distanceM);
  }, [filtre]);

  const salutation = user && prenom ? `Salut ${prenom} ` : "Bonjour ";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
        {/* En-tête vert */}
        <header className="rounded-b-[30px] bg-acc2-800 px-[18px] pb-[18px] pt-[22px] text-app">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/teki-logo.png"
                alt="TéKi"
                width={32}
                height={32}
                className="flex-none rounded-[10px]"
              />
              <h1 className="font-display text-[26px] leading-none">
                {salutation}
                <span className="text-acc-300">!</span>
              </h1>
            </div>
            <button
              type="button"
              aria-label="Rechercher"
              className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-acc2-700 text-app"
            >
              <Search size={18} strokeWidth={2.75} />
            </button>
          </div>
          <p className="mt-0.5 text-[13px] text-acc2-300">
            Il se passe {FEED.length} choses autour de toi.
          </p>

          {/* Lieu + rayon */}
          <div className="mt-[13px] flex gap-2">
            <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-app px-3.5 py-[7px] text-[13px] font-semibold text-ink">
              <MapPin size={14} strokeWidth={2.75} />
              {lieuName} ▾
            </span>
            <span className="inline-flex flex-none items-center rounded-full bg-acc2-700 px-3.5 py-[7px] text-[13px] text-acc2-100">
              10 km ▾
            </span>
          </div>

          {/* Familles */}
          <div className="mt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        </header>

        {/* Fil */}
        <div className="px-[18px] pt-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-acc-700">
            Autour de toi
          </p>
          <div className="mt-[9px] flex flex-col gap-2.5">
            {items.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <p className="py-6 text-center text-[13px] text-sand-600">
                Rien d&apos;actif dans cette famille pour l&apos;instant.
              </p>
            )}
          </div>

          {/* Incitation inscription (visiteur) */}
          {!user && (
            <div className="mt-4 rounded-[22px] bg-acc2-800 p-5 text-app">
              <h2 className="font-display text-[18px]">
                Tu fais déjà partie de TéKi
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-acc2-100">
                Même en simple visiteur, ton regard compte. Inscris-toi
                gratuitement pour suivre et échanger.
              </p>
              <button
                type="button"
                onClick={() => requireAuth()}
                className="mt-3 rounded-full bg-acc px-4 py-2 font-display text-[13px] text-white"
              >
                Je m&apos;inscris
              </button>
            </div>
          )}
        </div>
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

function FeedCard({ item }: { item: FeedItem }) {
  const commerce = item.kind === "commerce";
  const ArchIcon = ARCH_ICON[item.kind];

  const kicker = commerce
    ? `Promo · ${item.distanceLabel}`
    : item.kind === "association"
      ? `Association · ${item.commune ?? ""}`
      : item.kind === "evenement"
        ? `Événement · ${item.commune ?? ""}`
        : "Info · Territoire";

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
        {item.datePill && (
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-acc2-800 px-2.5 py-[3px] font-display text-[10px] text-app">
            {item.datePill}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <span
          className={`text-[10px] uppercase tracking-[0.1em] ${
            commerce ? "text-acc-700" : "text-acc2-700"
          }`}
        >
          {kicker}
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

      <span
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-white ${
          commerce ? "bg-acc" : "bg-acc2-700"
        }`}
      >
        <ChevronRight size={15} strokeWidth={2.75} />
      </span>
    </div>
  );

  return item.href ? <Link href={item.href}>{inner}</Link> : inner;
}
