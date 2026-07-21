// Supabase Auth attend un numéro au format E.164 (ex. « +33612345678 »).
// On accepte une saisie française courante (« 06 12 34 56 78 ») et on la
// convertit ; renvoie null si le numéro n'est pas exploitable.
export function toE164(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned.length >= 8 ? cleaned : null;
  }
  // Numéro français : 0X XX XX XX XX → 9 chiffres après le 0 initial.
  if (cleaned.startsWith("0")) {
    const rest = cleaned.slice(1);
    return rest.length === 9 ? `+33${rest}` : null;
  }
  return null;
}
