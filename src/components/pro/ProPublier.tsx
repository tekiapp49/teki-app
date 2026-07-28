"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageIcon } from "lucide-react";
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
      <main className="mx-auto min-h-dvh w-full max-w-md bg-app">
        <ProBanner nom={fiche.nom} type={type} backHref={`/pro/${fiche.id}`} />
        <div className="flex flex-col items-center px-6 pt-24 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-acc2-800 text-app">
            <Check size={28} strokeWidth={2.75} />
          </span>
          <h1 className="mt-4 font-display text-[21px]">
            {programmer ? "Publication programmée" : "Publication publiée"}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-sand-600">
            Tu la retrouves dans ton tableau de bord.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/pro/${fiche.id}`)}
            className="mt-6 rounded-full bg-acc2-800 px-5 py-3 font-display text-[13.5px] text-app"
          >
            Retour au tableau de bord
          </button>
        </div>
      </main>
    );
  }

  const peutPublier = texte.trim().length > 0;
  const champ =
    "mt-1 w-full rounded-2xl bg-surface px-4 py-3 text-[16px] text-ink outline-none placeholder:text-sand-600";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-app">
      <ProBanner nom={fiche.nom} type={type} backHref={`/pro/${fiche.id}`} />

      <div className="px-[18px] pb-10 pt-5">
        <h1 className="font-display text-[21px]">Nouvelle publication</h1>

        <div className="mt-4 flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTypePub(t.key)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                typePub === t.key
                  ? "bg-acc2-800 font-display text-app"
                  : "bg-surface text-sand-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-[13px] text-sand-600">
          {LABEL_TEXTE[typePub]}
        </label>
        <input
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={typePub === "promo" ? "−20 % sur les viennoiseries" : ""}
          className={champ}
        />

        {typePub !== "actu" && (
          <>
            <label className="mt-3 block text-[13px] text-sand-600">
              Conditions
            </label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Dans la limite des stocks disponibles"
              className={champ}
            />
          </>
        )}

        <button
          type="button"
          disabled
          className="mt-4 flex items-center gap-2 text-[13px] text-sand-500 opacity-70"
        >
          <ImageIcon size={20} strokeWidth={2.75} />
          Ajouter une photo
        </button>

        {typePub === "promo" && (
          <>
            <p className="mt-5 text-[13px] text-sand-600">Durée de l&apos;offre</p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Field label="Du">
                <input
                  type="date"
                  value={du}
                  onChange={(e) => setDu(e.target.value)}
                  className="w-full bg-transparent text-[14px] text-ink outline-none"
                />
              </Field>
              <Field label="Au">
                <input
                  type="date"
                  value={au}
                  onChange={(e) => setAu(e.target.value)}
                  className="w-full bg-transparent text-[14px] text-ink outline-none"
                />
              </Field>
            </div>
          </>
        )}

        <p className="mt-5 text-[13px] text-sand-600">Quand publier ?</p>
        <div className="mt-1 flex gap-2">
          {(["maintenant", "programmer"] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuand(q)}
              className={`flex-1 rounded-full px-4 py-3 text-[13px] font-semibold ${
                quand === q
                  ? "bg-acc2-800 font-display text-app"
                  : "bg-surface text-sand-600"
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
                className="w-full bg-transparent text-[14px] text-ink outline-none"
              />
            </Field>
            <Field label="À">
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="w-full bg-transparent text-[14px] text-ink outline-none"
              />
            </Field>
          </div>
        )}

        <button
          type="button"
          onClick={publier}
          disabled={!peutPublier}
          className="mt-6 w-full rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app disabled:opacity-50"
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
      <p className="text-[12px] text-sand-600">{label}</p>
      <div className="mt-1 rounded-2xl bg-surface px-3 py-2.5">{children}</div>
    </div>
  );
}
