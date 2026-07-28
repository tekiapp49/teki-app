"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, LoaderCircle, Phone } from "lucide-react";
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
    if (profilComplet) onSuccess();
    else setStep("profile");
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
        className="absolute inset-0 bg-ink/30"
      />

      <div className="pointer-events-auto relative mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[30px] bg-app px-6 pb-8 pt-6">
        {step !== "profile" && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Retour"
            className="mb-3 -ml-1 flex h-8 w-8 items-center justify-center text-ink"
          >
            <ArrowLeft size={22} strokeWidth={2.75} />
          </button>
        )}

        {step === "profile" ? (
          <ProfileCompletion onDone={onSuccess} />
        ) : step === "phone" ? (
          <>
            <h1 className="font-display text-[21px]">Ton numéro de téléphone</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sand-600">
              Gratuit. Sert uniquement à te reconnaître, jamais partagé.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-full bg-surface px-4 py-3.5">
              <Phone size={18} strokeWidth={2.75} className="shrink-0 text-acc2-700" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="06 12 34 56 78"
                className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-sand-600"
              />
            </div>
            {error && <p className="mt-2 px-1 text-[13px] text-acc-700">{error}</p>}
            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app disabled:opacity-70"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                "Continuer"
              )}
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display text-[21px]">Vérifie ton numéro</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-sand-600">
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
                      className={`flex h-14 flex-1 items-center justify-center rounded-2xl border-2 font-display text-xl text-ink ${
                        active
                          ? "border-acc2-600 bg-app"
                          : "border-divider bg-surface"
                      }`}
                    >
                      {code[i] ?? ""}
                    </div>
                  );
                })}
              </div>
            </div>
            {error && <p className="mt-2 px-1 text-[13px] text-acc-700">{error}</p>}
            <button
              type="button"
              onClick={verify}
              disabled={loading || code.length !== CODE_LENGTH}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acc2-800 py-3.5 font-display text-[14px] text-app disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                "Valider"
              )}
            </button>
            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              className="mt-4 w-full text-center text-[13px] text-acc-700 underline underline-offset-4 disabled:opacity-70"
            >
              Renvoyer le code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
