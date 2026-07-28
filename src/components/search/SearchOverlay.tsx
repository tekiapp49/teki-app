"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Store, Users } from "lucide-react";
import { communeFromAdresse, searchFiches, type Fiche } from "@/lib/db";

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      searchFiches(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const chercheEnCours = q.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-[2000] bg-app">
      <div className="mx-auto flex h-full max-w-md flex-col">
        <div className="flex items-center gap-2 bg-acc2-800 px-3 py-3 text-app">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 flex-none items-center justify-center"
          >
            <ArrowLeft size={22} strokeWidth={2.75} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-app px-4 py-2.5">
            <Search size={18} strokeWidth={2.75} className="shrink-0 text-sand-600" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher un commerce, une asso…"
              className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-sand-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[18px] py-4">
          {!chercheEnCours && (
            <p className="text-[13px] text-sand-600">
              Tape le nom d&apos;un lieu, d&apos;un commerce ou d&apos;une
              association.
            </p>
          )}
          {chercheEnCours && loading && (
            <p className="text-[13px] text-sand-600">Recherche…</p>
          )}
          {chercheEnCours && !loading && results.length === 0 && (
            <p className="text-[13px] text-sand-600">
              Aucun résultat pour « {q.trim()} ».
            </p>
          )}
          <div className="flex flex-col gap-2">
            {results.map((f) => {
              const commerce = f.type === "commerce";
              const Icon = commerce ? Store : Users;
              return (
                <Link
                  key={f.id}
                  href={`/fiche/${f.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-[18px] border border-divider bg-white px-3 py-3"
                >
                  <span
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                      commerce
                        ? "bg-acc-100 text-acc-800"
                        : "bg-acc2-100 text-acc2-800"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-semibold">{f.nom}</h3>
                    <p className="text-[12px] text-sand-600">
                      {f.categorie}
                      {communeFromAdresse(f.adresse)
                        ? ` · ${communeFromAdresse(f.adresse)}`
                        : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
