import { $, $$, onDemo, setTag, showError } from "../lib/ui";
import { storeLanguage } from "../lib/engine";
import { renderCompat } from "../lib/compat-view";
import type { ApiName } from "@engine";

onDemo("", ({ root, engine }) => {
  const other = engine.language === "en" ? "es" : "en";
  const warm: Record<ApiName, () => Promise<void>> = {
    prompt: () => engine.prepare("prompt"),
    summarizer: () => engine.prepare("summarize"),
    translator: () => engine.prepare("translate", { source: engine.language, target: other }),
    detector: () => engine.prepare("detect"),
    proofreader: () => engine.prepare("proofread"),
    writer: () => engine.prepare("write"),
    rewriter: () => engine.prepare("rewrite"),
  };

  const refresh = async () => {
    const status = await engine.status();
    for (const tag of $$(root, "[data-api-tag]")) setTag(tag, status[tag.dataset.apiTag as ApiName]);
    void renderCompat(root, Promise.resolve(status));
  };

  void renderCompat(root, engine.status());
  $(root, "[data-compat-recheck]").addEventListener("click", () => void renderCompat(root, engine.status()));

  const off = engine.on("download", ({ api, progress }) => {
    const bar = root.querySelector<HTMLProgressElement>(`[data-row-progress="${api}"]`);
    if (!bar) return;
    bar.hidden = progress >= 1;
    bar.value = Math.round(progress * 100);
  });

  for (const button of $$<HTMLButtonElement>(root, "[data-prepare]")) {
    button.addEventListener("click", async () => {
      const api = button.dataset.prepare as ApiName;
      button.disabled = true;
      try {
        await warm[api]();
      } catch (err) {
        showError(root, err);
      } finally {
        button.disabled = false;
        await refresh();
      }
    });
  }

  $(root, "[data-refresh]").addEventListener("click", refresh);
  const select = $<HTMLSelectElement>(root, "#model-language");
  select.value = engine.language;
  select.addEventListener("change", () => {
    storeLanguage(select.value);
    location.reload();
  });

  return off;
});
