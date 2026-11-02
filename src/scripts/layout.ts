import { initCopyButtons, initTabs } from "@luz-ds/core";
import { LANG_KEY } from "../i18n";
import { MODEL_LANGUAGE_KEY } from "../lib/engine";

// luz.js starts its behaviors once, on the first load; every later page needs them again.
let first = true;
document.addEventListener("astro:page-load", () => {
  if (first) {
    first = false;
    return;
  }
  initCopyButtons();
  initTabs(document);
});

// The router replaces <html>'s attributes: keep the color mode LUZ wrote on it.
document.addEventListener("astro:before-swap", (event) => {
  const from = document.documentElement;
  const to = event.newDocument.documentElement;
  for (const name of ["data-mode", "data-theme", "data-luz-js"]) {
    const value = from.getAttribute(name);
    if (value !== null) to.setAttribute(name, value);
  }
});

// Choosing a language is remembered: the root page sends the visitor there next time, and the
// demos use it for their example texts. The link reloads the page, so the engine starts over in it.
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-lang-link]");
  const chosen = link?.dataset.langLink;
  if (!chosen) return;
  try {
    localStorage.setItem(LANG_KEY, chosen);
    localStorage.setItem(MODEL_LANGUAGE_KEY, chosen);
  } catch {
    /* private window: the link still works */
  }
});
