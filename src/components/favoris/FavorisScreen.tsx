"use client";

import Link from "next/link";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconInfoCircle,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";
import { FEED, type FeedItem } from "@/lib/feed/demo";
import { getFavoris } from "@/lib/favoris";
import { useClientValue } from "@/lib/useClientValue";
import BottomNav from "@/components/nav/BottomNav";

export default function FavorisScreen() {
  const favIds = useClientValue(getFavoris, [] as string[]);
  const favItems = FEED.filter((f) => favIds.includes(f.id));

  const nouveautes = favItems.filter((f) => f.kind === "commerce");
  const aVenir = favItems.filter((f) => f.kind === "evenement");
  const mesFavoris = favItems.filter(
    (f) => f.kind === "association" || f.kind === "info",
  );

  const vide = favItems.length === 0;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream px-5 pb-28 pt-8">
      <h1 className="text-2xl font-bold text-brand-text">Favoris</h1>

      {vide ? (
        <div className="mt-24 flex flex-col items-center px-4 text-center">
          <h2 className="text-lg font-bold text-brand-text">
            Ton réseau se construit
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-text-secondary">
            Ajoute des commerces, associations ou événements en favoris pour
            les retrouver ici.
          </p>
          <Link
            href="/fil"
            className="mt-6 rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-white"
          >
            Découvrir TéKi là
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <Section titre="Nouveautés" items={nouveautes} variante="nouveaute" />
          <Section titre="À venir" items={aVenir} variante="avenir" />
          <Section titre="Mes favoris" items={mesFavoris} variante="favori" />
        </div>
      )}

      <BottomNav />
    </main>
  );
}

const KIND_ICON: Record<FeedItem["kind"], Icon> = {
  commerce: IconBuildingStore,
  evenement: IconCalendarEvent,
  association: IconUsersGroup,
  info: IconInfoCircle,
};

const TYPE_LABEL: Record<FeedItem["kind"], string> = {
  commerce: "Commerce",
  association: "Association",
  evenement: "Événement",
  info: "Info",
};

type Variante = "nouveaute" | "avenir" | "favori";

function Section({
  titre,
  items,
  variante,
}: {
  titre: string;
  items: FeedItem[];
  variante: Variante;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-text-on-brown">
        {titre}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <Row key={item.id} item={item} variante={variante} />
        ))}
      </div>
    </>
  );
}

function Row({ item, variante }: { item: FeedItem; variante: Variante }) {
  const Icon = KIND_ICON[item.kind];
  const asso = item.kind === "association";

  const sousTitre =
    variante === "nouveaute" ? (
      <span className="text-brand-green-light">Nouvelle offre partagée</span>
    ) : variante === "avenir" ? (
      <span className="text-brand-text-secondary">{item.quand}</span>
    ) : (
      <span className="text-brand-text-secondary">
        {TYPE_LABEL[item.kind]}
        {item.commune ? ` · ${item.commune}` : ""}
      </span>
    );

  const inner = (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          asso
            ? "bg-brand-green/10 text-brand-green-light"
            : "bg-brand-surface-alt text-brand-text-on-brown"
        }`}
      >
        <Icon size={20} />
      </span>
      <div>
        <p className="font-bold text-brand-text">{item.nom}</p>
        <p className="text-sm">{sousTitre}</p>
      </div>
    </div>
  );

  return item.href ? <Link href={item.href}>{inner}</Link> : inner;
}
