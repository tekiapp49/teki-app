"use client";

import { useMemo, useState } from "react";
import { IconArrowLeft, IconLoader2, IconPhone } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { toE164 } from "@/lib/phone";
import ProfileCompletion from "./ProfileCompletion";

const CODE_LENGTH = 6;

type AuthSheetProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthSheet({ onClose, onSuccess }: AuthSheetProps) {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState<"phone" | "code" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const e164 = toE164(phone);

  async function sendCode() {
    if (!e164) {
      setError("Entre un numéro de téléphone valide.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);
    if (error) {
      console.error("signInWithOtp:", error.message);
      setError("L'envoi du SMS a échoué. Vérifie le numéro et réessaie.");
      return;
    }
    setCode("");
    setStep("code");
  }

  async function verify() {
    if (code.length !== CODE_LENGTH || !e164) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code,
      type: "sms",
    });
    if (error) {
      setLoading(false);
      console.error("verifyOtp:", error.message);
      setError("Code incorrect ou expiré. Réessaie.");
      return;
    }

    // Profil déjà complété (prénom renseigné) ? Sinon, on enchaîne sur
    // l'écran de complétion avant de revenir à l'origine.
    const userId = data.user?.id;
    let profilComplet = false;
    if (userId) {
      const { data: profil } = await supabase
        .from("profils")
        .select("prenom")
        .eq("id", userId)
        .maybeSingle();
      profilComplet = Boolean(profil?.prenom);
    }
    setLoading(false);

    if (profilComplet) {
      onSuccess();
    } else {
      setStep("profile");
    }
  }

  function handleBack() {
    if (step === "code") {
      setStep("phone");
      setError(null);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-brand-text/30"
      />

      <div className="pointer-events-auto relative mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-brand-cream px-6 pb-8 pt-6">
        {step !== "profile" && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Retour"
            className="mb-3 -ml-1 flex h-8 w-8 items-center justify-center text-brand-text"
          >
            <IconArrowLeft size={22} />
          </button>
        )}

        {step === "profile" ? (
          <ProfileCompletion onDone={onSuccess} />
        ) : step === "phone" ? (
          <>
            <h1 className="text-xl font-bold text-brand-text">
              Ton numéro de téléphone
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
              Gratuit. Sert uniquement à te reconnaître, jamais partagé.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-brand-surface-alt bg-brand-surface px-4 py-3.5">
              <IconPhone size={18} className="shrink-0 text-brand-green" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="06 12 34 56 78"
                className="w-full bg-transparent text-base text-brand-text outline-none placeholder:text-brand-text-secondary"
              />
            </div>

            {error && (
              <p className="mt-2 px-1 text-sm text-brand-terracotta">{error}</p>
            )}

            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
            >
              {loading ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : (
                "Continuer"
              )}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-brand-text">
              Vérifie ton numéro
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
              Un code a été envoyé au {phone}. Gratuit, ça prend 30 secondes.
            </p>

            <div className="relative mt-5">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={CODE_LENGTH}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
                }
                onKeyDown={(e) => e.key === "Enter" && verify()}
                className="absolute inset-0 h-full w-full cursor-pointer text-transparent caret-transparent opacity-0"
                aria-label="Code reçu par SMS"
              />
              <div className="flex justify-between gap-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const active = i === code.length;
                  return (
                    <div
                      key={i}
                      className={`flex h-14 flex-1 items-center justify-center rounded-2xl border-2 text-xl font-bold text-brand-text ${
                        active
                          ? "border-brand-green bg-brand-cream"
                          : "border-brand-surface-alt bg-brand-surface"
                      }`}
                    >
                      {code[i] ?? ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="mt-2 px-1 text-sm text-brand-terracotta">{error}</p>
            )}

            <button
              type="button"
              onClick={verify}
              disabled={loading || code.length !== CODE_LENGTH}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : (
                "Valider"
              )}
            </button>

            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className="mt-4 w-full text-center text-sm text-brand-text-on-brown underline underline-offset-4 disabled:opacity-70"
            >
              Renvoyer le code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
