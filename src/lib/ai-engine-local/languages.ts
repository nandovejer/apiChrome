/** Normalize tags to BCP-47 (pt_BR -> pt-BR). */
export function normalizeLangTag(tag: string): string {
  const [first = "en", ...rest] = String(tag).replace(/_/g, "-").split("-");
  return [first.toLowerCase(), ...rest.map((part) => (/^[A-Za-z]{2,3}$/.test(part) ? part.toUpperCase() : part))].join("-");
}

export function baseLanguage(tag: string): string {
  return normalizeLangTag(tag).split("-")[0] ?? "en";
}

const NAMES: Record<string, string> = { en: "English", es: "Spanish", ja: "Japanese", de: "German", fr: "French" };

export function languageName(code: string): string {
  return NAMES[baseLanguage(code)] ?? code;
}

/** The languages the on-device model takes today; anything else falls back to English. */
export function modelLanguage(preferred: string | undefined): string {
  const base = baseLanguage(preferred ?? "en");
  return ["en", "es", "ja"].includes(base) ? base : "en";
}
