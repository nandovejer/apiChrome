import { en, type Messages } from "./en";
import { es } from "./es";

export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/** Each language in its own words, for the switcher. */
export const LANG_NAMES: Record<Lang, string> = { en: "English", es: "Español" };

export const messages: Record<Lang, Messages> = { en, es };

/** Where the choice of language is remembered, so the root page can send the visitor to it. */
export const LANG_KEY = "luz-ai-ui-lang";

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

const base = (): string => import.meta.env.BASE_URL.replace(/\/$/, "");

/** `/apiChrome/es/prompt/` for `("es", "prompt")`; the status page has the empty slug. */
export function pageHref(lang: Lang, slug = ""): string {
  return `${base()}/${lang}/${slug ? `${slug}/` : ""}`;
}

/** The language a pathname belongs to, read from its first segment after the base. */
export function langOfPath(pathname: string): Lang {
  const rest = pathname.startsWith(base()) ? pathname.slice(base().length) : pathname;
  const first = rest.split("/").find(Boolean);
  return isLang(first) ? first : DEFAULT_LANG;
}

/** The same page in another language. */
export function swapLang(pathname: string, to: Lang): string {
  const from = langOfPath(pathname);
  const prefix = `${base()}/${from}/`;
  return pathname.startsWith(prefix) ? `${base()}/${to}/${pathname.slice(prefix.length)}` : pageHref(to);
}

/** A language's name in the language of the page ("Spanish" / "español"), whatever its code. */
export function languageName(code: string, lang: Lang): string {
  try {
    const name = new Intl.DisplayNames([lang], { type: "language" }).of(code);
    if (name && name !== code) return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
  } catch {
    /* a code Intl does not know: show it as it is */
  }
  return code;
}

/** `{ params: { lang } }` for every language: the pages under `src/pages/[lang]/` all share it. */
export const getStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export type { Messages };
