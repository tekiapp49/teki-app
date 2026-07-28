"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, LoaderCircle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUGGESTED_COMMUNES } from "@/lib/geo/constants";
import { INTERETS } from "@/lib/interets";
import type { CommuneResult } from "@/lib/geo/nominatim";
import CommuneSearch from "@/components/map/CommuneSearch";

function parseFrDate(input: string): string | null {
  const m = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, jj, mm, aaaa] = m;
  return `${aaaa}-${mm}-${jj}`;
}

export default function ProfileCompletion({ onDone }: { onDone: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [interets, setInterets] = useState<string[]>([]);
  const [lieu, setLieu] = useState<CommuneResult>(SUGGESTED_COMMUNES[0]);
  const [editLieu, setEditLieu] = useState(false);
  const [naissance, setNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  const peutTerminer = prenom.trim().length > 0 && interets.length >= 1;

  function toggleInteret(key: string) {
    setInterets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  async function terminer() {
    if (!peutTerminer || !userId) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("profils")
      .update({
        prenom: prenom.trim(),
        nom: nom.trim() || null,
        centres_interet: interets,
        lieu_reference_lat: lieu.lat,
        lieu_reference_lng: lieu.lng,
        lieu_reference_nom: lieu.name,
        date_naissance: parseFrDate(naissance),
        adresse: adresse.trim() || null,
      })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      console.error("update profils:", error.message);
      setError("L'enregistrement a échoué, réessaie dans un instant.");
      return;
    }
    onDone();
  }

  const champ =
    "mt-1 w-full rounded-2xl bg-surface px-4 py-3 text-[16px] text-ink outline-none placeholder:text-sand-600";
  const label = "mt-3 block text-[13px] text-sand-600";

  return (
    <div>
      <h1 className="font-display text-[23px]">Ton profil</h1>
      <p className="text-[13px] text-sand-600">* champ obligatoire</p>

      <label className={`${label} mt-4`}>Prénom *</label>
      <input
        type="text"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Claude"
        className={champ}
      />

      <label className={label}>Nom</label>
      <input
        type="text"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className={champ}
      />

      <p className="mt-4 text-[13px] text-sand-600">
        Ça t&apos;intéresse ? (au moins 1)
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {INTERETS.map(({ key, label: lab, Icon }) => {
          const actif = interets.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleInteret(key)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[12px] font-semibold ${
                actif
                  ? "bg-acc2-800 text-app"
                  : "bg-surface text-sand-600"
              }`}
            >
              <Icon size={22} strokeWidth={2.75} />
              {lab}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[13px] text-sand-600">Mes lieux</p>
      {!editLieu ? (
        <button
          type="button"
          onClick={() => setEditLieu(true)}
          className="mt-1 flex w-full items-center gap-2 py-2 text-left text-[16px] text-ink"
        >
          <Home size={20} strokeWidth={2.75} className="shrink-0 text-acc2-700" />
          Maison · {lieu.name}
        </button>
      ) : (
        <div className="mt-1">
          <CommuneSearch
            suggestions={SUGGESTED_COMMUNES}
            onSelect={(c) => {
              setLieu(c);
              setEditLieu(false);
            }}
          />
        </div>
      )}
      <button
        type="button"
        disabled
        className="flex items-center gap-2 py-1 text-[16px] text-sand-500 opacity-70"
      >
        <Plus size={20} strokeWidth={2.75} className="shrink-0" />
        Ajouter un lieu (travail…)
      </button>

      <label className={label}>Naissance</label>
      <input
        type="text"
        inputMode="numeric"
        value={naissance}
        onChange={(e) => setNaissance(e.target.value)}
        placeholder="JJ/MM/AAAA"
        className={champ}
      />

      <label className={label}>Adresse</label>
      <input
        type="text"
        value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
        className={champ}
      />

      {error && <p className="mt-3 text-[13px] text-acc-700">{error}</p>}

      <button
        type="button"
        onClick={terminer}
        disabled={!peutTerminer || loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          "Terminer"
        )}
      </button>
    </div>
  );
}
