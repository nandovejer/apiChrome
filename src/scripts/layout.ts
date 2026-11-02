import { initCopyButtons, initTabs } from "@luz-ds/core";

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
