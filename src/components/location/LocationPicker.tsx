"use client";

import { useEffect, useMemo, useState } from "react";
import { History, LoaderCircle, LocateFixed } from "lucide-react";
import CommuneSearch from "@/components/map/CommuneSearch";
import {
  getLieuxRecents,
  pushLieuRecent,
  setLieu,
  type Lieu,
} from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function dedupByName(lieux: Lieu[]): Lieu[] {
  const seen = new Set<string>();
  const out: Lieu[] = [];
  for (const l of lieux) {
    if (!seen.has(l.name)) {
      seen.add(l.name);
      out.push(l);
    }
  }
  return out;
}

export default function LocationPicker({
  onSelect,
  onClose,
}: {
  onSelect: (lieu: Lieu) => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const localRecents = useClientValue(getLieuxRecents, [] as Lieu[]);
  const [dbLieux, setDbLieux] = useState<Lieu[] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profils")
      .select(
        "lieu_reference_nom, lieu_reference_lat, lieu_reference_lng, lieux_recents",
      )
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const recents = (data?.lieux_recents as Lieu[] | null) ?? [];
        const ref: Lieu[] =
          data?.lieu_reference_nom != null && data?.lieu_reference_lat != null
            ? [
                {
                  name: data.lieu_reference_nom as string,
                  lat: data.lieu_reference_lat as number,
                  lng: data.lieu_reference_lng as number,
                },
              ]
            : [];
        setDbLieux(dedupByName([...recents, ...ref]));
      });
  }, [user, supabase]);

  // Villes enregistrées sur le profil (si connecté), sinon historique local.
  const lieux = user ? (dbLieux ?? []) : localRecents;
  const titreListe = user ? "Mes lieux" : "Récents";

  async function choisir(lieu: Lieu) {
    setLieu(lieu);
    pushLieuRecent(lieu, localRecents);
    if (user) {
      const next = dedupByName([lieu, ...(dbLieux ?? [])]).slice(0, 8);
      await supabase
        .from("profils")
        .update({ lieux_recents: next })
        .eq("id", user.id);
    }
    onSelect(lieu);
    onClose();
  }

  function utiliserPosition() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        choisir({
          name: "Ma position",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      <div className="pointer-events-auto relative mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[30px] bg-app px-6 pb-8 pt-6">
        <h1 className="font-display text-[20px]">Où es-tu ?</h1>

        <button
          type="button"
          onClick={utiliserPosition}
          disabled={geoLoading}
          className="mt-4 flex w-full items-center gap-2 rounded-full bg-acc2-800 px-4 py-3 font-display text-[14px] text-app disabled:opacity-70"
        >
          {geoLoading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <LocateFixed size={18} strokeWidth={2.75} />
          )}
          Utiliser ma position actuelle
        </button>

        <div className="mt-4">
          <CommuneSearch
            onSelect={(c) => choisir({ name: c.name, lat: c.lat, lng: c.lng })}
          />
        </div>

        {lieux.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-sand-600">
              {titreListe}
            </p>
            <div className="mt-1">
              {lieux.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => choisir(r)}
                  className="flex w-full items-center gap-3 border-b border-divider py-3 text-left last:border-b-0"
                >
                  <History
                    size={18}
                    strokeWidth={2.75}
                    className="shrink-0 text-sand-600"
                  />
                  <span className="text-[14px] text-ink">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
