"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconPhoto } from "@tabler/icons-react";
import type { FicheDemo } from "@/lib/fiches/demo";
import { addPublication, type PubType } from "@/lib/publications";
import ProBanner from "./ProBanner";

type TypePub = PubType;
const TYPES: { key: TypePub; label: string }[] = [
  { key: "promo", label: "Promo" },
  { key: "evenement", label: "Événement" },
  { key: "actu", label: "Actu" },
];

const LABEL_TEXTE: Record<TypePub, string> = {
  promo: "L'offre",
  evenement: "L'événement",
  actu: "Ton actu",
};

export default function ProPublier({ fiche }: { fiche: FicheDemo }) {
  const router = useRouter();
  const type = fiche.categorie.toLowerCase().includes("commerce")
    ? "commerce"
    : "association";

  const [typePub, setTypePub] = useState<TypePub>("promo");
  const [texte, setTexte] = useState("");
  const [conditions, setConditions] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [quand, setQuand] = useState<"maintenant" | "programmer">("maintenant");
  const [le, setLe] = useState("");
  const [heure, setHeure] = useState("");
  const [done, setDone] = useState(false);

  const programmer = quand === "programmer";

  function publier() {
    if (texte.trim().length === 0) return;
    addPublication({
      ficheId: fiche.id,
      type: typePub,
      texte: texte.trim(),
      conditions: conditions.trim() || undefined,
      du: du || undefined,
      au: au || undefined,
      quand,
      le: le || undefined,
      heure: heure || undefined,
    });
    setDone(true);
  }

  if (done) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream">
        <ProBanner nom={fiche.nom} type={type} backHref={`/pro/${fiche.id}`} />
        <div className="flex flex-col items-center px-6 pt-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-white">
            <IconCheck size={28} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-brand-text">
            {programmer ? "Publication programmée" : "Publication publiée"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
            Tu la retrouves dans ton tableau de bord. (L&apos;écriture dans
            Supabase se fera quand ta fiche sera en base, avec toi comme
            propriétaire.)
          </p>
          <button
            type="button"
            onClick={() => router.push(`/pro/${fiche.id}`)}
            className="mt-6 rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-white"
          >
            Retour au tableau de bord
          </button>
        </div>
      </main>
    );
  }

  const peutPublier = texte.trim().length > 0;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream">
      <ProBanner nom={fiche.nom} type={type} backHref={`/pro/${fiche.id}`} />

      <div className="px-5 pb-10 pt-5">
        <h1 className="text-xl font-bold text-brand-text">
          Nouvelle publication
        </h1>

        {/* Type */}
        <div className="mt-4 flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTypePub(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                typePub === t.key
                  ? "bg-brand-green text-white"
                  : "bg-brand-surface-alt text-brand-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Texte */}
        <label className="mt-4 block text-sm text-brand-text-secondary">
          {LABEL_TEXTE[typePub]}
        </label>
        <input
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={
            typePub === "promo" ? "- 20 % sur les viennoiseries" : ""
          }
          className="mt-1 w-full rounded-xl bg-brand-surface px-4 py-3 text-base text-brand-text outline-none placeholder:text-brand-text-secondary"
        />

        {/* Conditions (promo & événement) */}
        {typePub !== "actu" && (
          <>
            <label className="mt-3 block text-sm text-brand-text-secondary">
              Conditions
            </label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Dans la limite des stocks disponibles"
              className="mt-1 w-full rounded-xl border border-brand-surface-alt bg-brand-cream px-4 py-3 text-base text-brand-text outline-none placeholder:text-brand-text-secondary"
            />
          </>
        )}

        {/* Photo (à venir) */}
        <button
          type="button"
          disabled
          title="Bientôt : ajouter une photo"
          className="mt-4 flex items-center gap-2 text-sm text-brand-text-on-brown opacity-60"
        >
          <IconPhoto size={20} />
          Ajouter une photo
        </button>

        {/* Durée (promo) */}
        {typePub === "promo" && (
          <>
            <p className="mt-5 text-sm text-brand-text-secondary">
              Durée de l&apos;offre
            </p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Field label="Du">
                <input
                  type="date"
                  value={du}
                  onChange={(e) => setDu(e.target.value)}
                  className="w-full bg-transparent text-sm text-brand-text outline-none"
                />
              </Field>
              <Field label="Au">
                <input
                  type="date"
                  value={au}
                  onChange={(e) => setAu(e.target.value)}
                  className="w-full bg-transparent text-sm text-brand-text outline-none"
                />
              </Field>
            </div>
          </>
        )}

        {/* Quand publier */}
        <p className="mt-5 text-sm text-brand-text-secondary">Quand publier ?</p>
        <div className="mt-1 flex gap-2">
          {(["maintenant", "programmer"] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuand(q)}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
                quand === q
                  ? "bg-brand-green text-white"
                  : "bg-brand-surface-alt text-brand-text-secondary"
              }`}
            >
              {q === "maintenant" ? "Maintenant" : "Programmer"}
            </button>
          ))}
        </div>

        {programmer && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Le">
              <input
                type="date"
                value={le}
                onChange={(e) => setLe(e.target.value)}
                className="w-full bg-transparent text-sm text-brand-text outline-none"
              />
            </Field>
            <Field label="À">
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="w-full bg-transparent text-sm text-brand-text outline-none"
              />
            </Field>
          </div>
        )}

        <button
          type="button"
          onClick={publier}
          disabled={!peutPublier}
          className="mt-6 w-full rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {programmer ? "Programmer la publication" : "Publier maintenant"}
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-brand-text-secondary">{label}</p>
      <div className="mt-1 rounded-xl bg-brand-surface-alt px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}
