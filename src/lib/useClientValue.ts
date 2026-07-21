"use client";

import { useEffect, useState } from "react";

// Lit une valeur disponible uniquement côté navigateur (ex. localStorage)
// après le montage, sans provoquer d'écart d'hydratation : le rendu
// serveur et le premier rendu client utilisent `fallback`, puis la vraie
// valeur est appliquée.
export function useClientValue<T>(read: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(read());
    // Lecture unique au montage (source externe, pas de dépendance React).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
