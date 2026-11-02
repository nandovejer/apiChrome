import { DEFAULT_LANG, isLang, languageName, messages, type Lang, type Messages } from "./index";

/** The language of the page being shown (the router swaps `<html lang>` with the page). */
export function lang(): Lang {
  const value = document.documentElement.lang;
  return isLang(value) ? value : DEFAULT_LANG;
}

/** The texts of the page being shown. */
export const m = (): Messages => messages[lang()];

/** A language code written out in the page's language. */
export const nameOf = (code: string): string => languageName(code, lang());
