"use client";

import { useEffect, useRef, useState } from "react";
import { IconLoader2, IconMapPin, IconSearch } from "@tabler/icons-react";
import { searchCommunes, type CommuneResult } from "@/lib/geo/nominatim";

type CommuneSearchProps = {
  onSelect: (result: CommuneResult) => void;
  // Communes proposées d'emblée, tant que le champ est vide.
  suggestions?: CommuneResult[];
};

export default function CommuneSearch({
  onSelect,
  suggestions = [],
}: CommuneSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommuneResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const isSearching = query.trim().length >= 2;

  useEffect(() => {
    const tooShort = query.trim().length < 2;

    const timeout = setTimeout(() => {
      if (tooShort) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchCommunes(query, controller.signal)
        .then(setResults)
        .catch((err) => {
          if (err.name !== "AbortError") setError(true);
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  // Suggestions par défaut tant qu'on ne cherche pas ; résultats sinon.
  const list = isSearching ? results : suggestions;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-2xl bg-brand-surface px-4 py-3">
        <IconSearch size={18} className="shrink-0 text-brand-text-secondary" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom de ta commune ou village"
          className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-text-secondary"
        />
        {loading && (
          <IconLoader2
            size={16}
            className="shrink-0 animate-spin text-brand-text-secondary"
          />
        )}
      </div>

      {error && (
        <p className="mt-2 px-1 text-sm text-brand-text-secondary">
          La recherche n&apos;a pas fonctionné, réessaie dans un instant.
        </p>
      )}

      {isSearching && !loading && !error && results.length === 0 && (
        <p className="mt-2 px-1 text-sm text-brand-text-secondary">
          Aucune commune trouvée pour « {query.trim()} ».
        </p>
      )}

      {list.length > 0 && (
        <ul className="mt-1">
          {list.map((result) => (
            <li
              key={result.id}
              className="border-b border-brand-surface-alt last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onSelect(result)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <IconMapPin
                  size={18}
                  className="shrink-0 text-brand-text-secondary"
                />
                <span className="text-sm text-brand-text">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
