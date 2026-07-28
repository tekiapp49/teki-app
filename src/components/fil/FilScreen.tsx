"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChevronRight,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FAMILLES, type Filtre } from "@/lib/feed/demo";
import {
  communeFromAdresse,
  datePill,
  dateLongue,
  distanceLabel,
  feedKind,
  fetchFeed,
  type FeedPost,
} from "@/lib/db";
import { getLieu, type Lieu } from "@/lib/lieu";
import { getRayon, rayonLabel, type Rayon } from "@/lib/rayon";
import { useClientValue } from "@/lib/useClientValue";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TERRITORY_NAME } from "@/lib/geo/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import BottomNav from "@/components/nav/BottomNav";
import SearchOverlay from "@/components/search/SearchOverlay";
import LocationPicker from "@/components/location/LocationPicker";
import RadiusPicker from "@/components/location/RadiusPicker";

type Item = {
  id: string;
  famille: Filtre;
  kind: "commerce" | "evenement" | "association";
  title: string;
  meta: string;
  kicker: string;
  image?: string;
  datePill?: string;
  metres: number;
  href: string;
};

function toItem(post: FeedPost, lieu: ReturnType<typeof getLieu>): Item {
  const kind = feedKind(post);
  const commerce = kind === "commerce";
  const commune = communeFromAdresse(post.fiche.adresse);
  const { metres, label } = distanceLabel(post.fiche, lieu);
  const evenement = post.publication.type === "evenement";
  return {
    id: post.publication.id,
    famille: commerce ? "commerces" : evenement ? "sorties" : "entraide",
    kind,
    title: evenement ? post.publication.texte : post.fiche.nom,
    meta: evenement
      ? [dateLongue(post.publication.date_evenement), label]
          .filter(Boolean)
          .join(" · ")
      : post.publication.texte,
    kicker: commerce
      ? `Promo${label ? ` · ${label}` : ""}`
      : evenement
        ? `Événement · ${commune}`
        : `Association · ${commune}`,
    image: post.fiche.photos?.[0],
    datePill: evenement ? datePill(post.publication.date_evenement) : undefined,
    metres,
    href: `/fiche/${post.fiche.id}`,
  };
}

export default function FilScreen() {
  const supabase = useMemo(() => createClient(), []);
  const { user, requireAuth } = useAuth();
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [prenom, setPrenom] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<Lieu | null>(null);
  const initialLieu = useClientValue(() => getLieu(), null);
  const lieu = picked ?? initialLieu;
  const lieuName = lieu?.name ?? DEFAULT_TERRITORY_NAME;

  const [rayonPickerOpen, setRayonPickerOpen] = useState(false);
  const [pickedRayon, setPickedRayon] = useState<Rayon | undefined>(undefined);
  const initialRayon = useClientValue(() => getRayon(), 10 as Rayon);
  const rayon = pickedRayon === undefined ? initialRayon : pickedRayon;

  useEffect(() => {
    fetchFeed().then(setPosts);
  }, []);

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
    if (!posts) return null;
    let all = posts.map((p) => toItem(p, lieu));
    if (filtre !== "tout") all = all.filter((i) => i.famille === filtre);
    // Filtre par rayon (uniquement si on connaît le lieu de référence).
    if (lieu) all = all.filter((i) => i.metres <= rayon * 1000);
    return all.sort((a, b) => a.metres - b.metres);
  }, [posts, lieu, filtre, rayon]);

  const salutation = user && prenom ? `Salut ${prenom} ` : "Bonjour ";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-app">
      <div className="flex-1 pb-24">
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
              onClick={() => setSearchOpen(true)}
              className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-acc2-700 text-app"
            >
              <SearchIcon />
            </button>
          </div>
          <p className="mt-0.5 text-[13px] text-acc2-300">
            {posts === null
              ? "On regarde autour de toi…"
              : `Il se passe ${posts.length} chose${posts.length > 1 ? "s" : ""} autour de toi.`}
          </p>

          <div className="mt-[13px] flex gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex flex-none items-center gap-1.5 rounded-full bg-app px-3.5 py-[7px] text-[13px] font-semibold text-ink"
            >
              <PinIcon />
              {lieuName} ▾
            </button>
            <button
              type="button"
              onClick={() => setRayonPickerOpen(true)}
              className="inline-flex flex-none items-center rounded-full bg-acc2-700 px-3.5 py-[7px] text-[13px] text-acc2-100"
            >
              {rayonLabel(rayon)} ▾
            </button>
          </div>

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

        <div className="px-[18px] pt-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-acc-700">
            Autour de toi
          </p>
          <div className="mt-[9px] flex flex-col gap-2.5">
            {items === null && (
              <p className="py-6 text-center text-[13px] text-sand-600">
                Chargement…
              </p>
            )}
            {items?.map((item) => <FeedCard key={item.id} item={item} />)}
            {items?.length === 0 && (
              <p className="py-6 text-center text-[13px] text-sand-600">
                Rien d&apos;actif près de toi pour l&apos;instant.
              </p>
            )}
          </div>

          {!user && items && items.length > 0 && (
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

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {pickerOpen && (
        <LocationPicker
          onSelect={setPicked}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {rayonPickerOpen && (
        <RadiusPicker
          current={rayon}
          onSelect={setPickedRayon}
          onClose={() => setRayonPickerOpen(false)}
        />
      )}
      <BottomNav />
    </main>
  );
}

const ARCH_ICON: Record<Item["kind"], LucideIcon> = {
  commerce: Store,
  association: Users,
  evenement: Calendar,
};

function FeedCard({ item }: { item: Item }) {
  const commerce = item.kind === "commerce";
  const ArchIcon = ARCH_ICON[item.kind];

  return (
    <Link
      href={item.href}
      className="flex items-center gap-[13px] rounded-[26px] border border-divider bg-white py-[9px] pl-[9px] pr-[13px]"
    >
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
          {item.kicker}
        </span>
        <h3 className="mt-0.5 truncate text-[15.5px] font-semibold">
          {item.title}
        </h3>
        <p
          className={`mt-px truncate text-[12px] ${
            commerce ? "text-acc-800" : "text-acc2-800"
          }`}
        >
          {item.meta}
        </p>
      </div>

      <span
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-white ${
          commerce ? "bg-acc" : "bg-acc2-700"
        }`}
      >
        <ChevronRight size={15} strokeWidth={2.75} />
      </span>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
