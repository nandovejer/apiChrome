import { guides } from "./guides";
import { langOfPath, messages } from "./index";

/** The language, texts and guides for the page being built. Server only: the guides stay out of the browser. */
export function i18n(url: URL) {
  const lang = langOfPath(url.pathname);
  return { lang, m: messages[lang], g: guides[lang] };
}
