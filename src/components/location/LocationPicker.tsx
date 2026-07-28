"use client";

import { useEffect, useMemo, useState } from "react";
import { History, LoaderCircle, LocateFixed } from "lucide-react";
import CommuneSearch from "@/components/map/CommuneSearch";
import { SUGGESTED_COMMUNES } from "@/lib/geo/constants";
import {
  getLieuxRecents,
  pushLieuRecent,
  setLieu,
  type Lieu,
} from "@/lib/lieu";
import { useClientValue } from "@/lib/useClientValue";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

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
  const [dbRecents, setDbRecents] = useState<Lieu[] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profils")
      .select("lieux_recents")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDbRecents((data?.lieux_recents as Lieu[]) ?? []));
  }, [user, supabase]);

  const recents = user ? (dbRecents ?? []) : localRecents;

  async function choisir(lieu: Lieu) {
    setLieu(lieu);
    pushLieuRecent(lieu, localRecents);
    if (user) {
      const next = [
        lieu,
        ...(dbRecents ?? []).filter((l) => l.name !== lieu.name),
      ].slice(0, 5);
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
            suggestions={SUGGESTED_COMMUNES}
            onSelect={(c) =>
              choisir({ name: c.name, lat: c.lat, lng: c.lng })
            }
          />
        </div>

        {recents.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-sand-600">
              Récents
            </p>
            <div className="mt-1">
              {recents.map((r) => (
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
