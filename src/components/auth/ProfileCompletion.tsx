"use client";

import { useEffect, useMemo, useState } from "react";
import { IconHome, IconLoader2, IconPlus } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { SUGGESTED_COMMUNES } from "@/lib/geo/constants";
import { INTERETS } from "@/lib/interets";
import type { CommuneResult } from "@/lib/geo/nominatim";
import CommuneSearch from "@/components/map/CommuneSearch";

// « JJ/MM/AAAA » -> « AAAA-MM-JJ » (format date Postgres) ; null si vide
// ou non exploitable (le champ est optionnel, on ne bloque jamais).
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text">Ton profil</h1>
      <p className="text-sm text-brand-text-on-brown">* champ obligatoire</p>

      {/* Prénom (obligatoire) */}
      <label className="mt-4 block text-sm text-brand-text-secondary">
        Prénom *
      </label>
      <input
        type="text"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Claude"
        className="mt-1 w-full rounded-xl bg-brand-surface px-4 py-3 text-base text-brand-text outline-none placeholder:text-brand-text-secondary"
      />

      {/* Nom */}
      <label className="mt-3 block text-sm text-brand-text-secondary">Nom</label>
      <input
        type="text"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="mt-1 w-full rounded-xl bg-brand-surface px-4 py-3 text-base text-brand-text outline-none"
      />

      {/* Centres d'intérêt (au moins 1) */}
      <p className="mt-4 text-sm text-brand-text-secondary">
        Ça t&apos;intéresse ? (au moins 1)
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {INTERETS.map(({ key, label, Icon }) => {
          const actif = interets.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleInteret(key)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-semibold ${
                actif
                  ? "bg-brand-green text-white"
                  : "bg-brand-surface-alt text-brand-text-secondary"
              }`}
            >
              <Icon size={22} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Mes lieux */}
      <p className="mt-4 text-sm text-brand-text-secondary">Mes lieux</p>
      {!editLieu ? (
        <button
          type="button"
          onClick={() => setEditLieu(true)}
          className="mt-1 flex w-full items-center gap-2 py-2 text-left text-base text-brand-text"
        >
          <IconHome size={20} className="shrink-0 text-brand-green" />
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
        title="Bientôt : plusieurs lieux (travail, famille…)"
        className="flex items-center gap-2 py-1 text-base text-brand-text-on-brown opacity-60"
      >
        <IconPlus size={20} className="shrink-0" />
        Ajouter un lieu (travail…)
      </button>

      {/* Naissance */}
      <label className="mt-4 block text-sm text-brand-text-secondary">
        Naissance
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={naissance}
        onChange={(e) => setNaissance(e.target.value)}
        placeholder="JJ/MM/AAAA"
        className="mt-1 w-full rounded-xl bg-brand-surface px-4 py-3 text-base text-brand-text outline-none placeholder:text-brand-text-secondary"
      />

      {/* Adresse */}
      <label className="mt-3 block text-sm text-brand-text-secondary">
        Adresse
      </label>
      <input
        type="text"
        value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
        className="mt-1 w-full rounded-xl bg-brand-surface px-4 py-3 text-base text-brand-text outline-none"
      />

      {error && <p className="mt-3 text-sm text-brand-terracotta">{error}</p>}

      <button
        type="button"
        onClick={terminer}
        disabled={!peutTerminer || loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {loading ? <IconLoader2 size={18} className="animate-spin" /> : "Terminer"}
      </button>
    </div>
  );
}
