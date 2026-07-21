"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import AuthSheet from "./AuthSheet";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  // Exécute `action` si déjà inscrit ; sinon ouvre l'inscription et
  // rejoue l'action une fois le code validé (retour à l'origine, débloqué).
  requireAuth: (action?: () => void) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  function requireAuth(action?: () => void) {
    if (user) {
      action?.();
      return;
    }
    pendingAction.current = action ?? null;
    setSheetOpen(true);
  }

  function handleSuccess() {
    setSheetOpen(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }

  function handleClose() {
    pendingAction.current = null;
    setSheetOpen(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, requireAuth }}>
      {children}
      {sheetOpen && (
        <AuthSheet onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans <AuthProvider>.");
  }
  return ctx;
}
