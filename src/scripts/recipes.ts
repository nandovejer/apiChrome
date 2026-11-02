import type { ExtractField } from "@engine";
import { $, $$, bindRange, onDemo, showJson, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

type Recipe = "classify" | "extract" | "tags" | "moderate" | "describe" | "questions";

const SAMPLE: Record<Recipe, (l: string) => string> = {
  classify: samples.message,
  extract: samples.contacts,
  tags: samples.article,
  moderate: samples.rude,
  describe: samples.product,
  questions: samples.article,
};

onDemo("recipes", ({ root, engine, runner }) => {
  const recipe = $<HTMLSelectElement>(root, "#recipe");
  const input = $<HTMLTextAreaElement>(root, "#input");
  const textOut = $(root, "#text-out");
  const verdict = $(root, "[data-verdict]");
  const jsonPanel = $(root, "[data-json-panel]");
  bindRange($<HTMLInputElement>(root, "#count"));

  const sync = () => {
    const current = recipe.value as Recipe;
    input.value = SAMPLE[current](engine.language);
    for (const el of $$(root, "[data-for]")) el.hidden = !el.dataset.for?.split(" ").includes(current);
    textOut.parentElement!.hidden = current !== "describe";
    jsonPanel.hidden = true;
    verdict.hidden = true;
  };
  recipe.addEventListener("change", sync);
  sync();

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    const count = Number($<HTMLInputElement>(root, "#count").value);
    void runner.run(async (signal) => {
      jsonPanel.hidden = true;
      verdict.hidden = true;
      switch (recipe.value as Recipe) {
        case "describe": {
          await streamInto(textOut, engine.stream({ task: "describe", input: text, signal }), runner);
          return;
        }
        case "classify": {
          const labels = $<HTMLInputElement>(root, "#labels").value.split(",").map((l) => l.trim()).filter(Boolean);
          const res = await engine.run({ task: "classify", input: text, options: { labels }, signal });
          verdict.textContent = `${res.data.label}: ${res.data.reason}`;
          verdict.hidden = false;
          showJson($(root, "#json-out"), res.data);
          return runner.setMeta(res.meta);
        }
        case "extract": {
          const fields = $$<HTMLInputElement>(root, 'fieldset[data-for="extract"] input:checked').map((c) => c.value as ExtractField);
          const res = await engine.run({ task: "extract", input: text, options: { fields }, signal });
          showJson($(root, "#json-out"), res.data);
          return runner.setMeta(res.meta);
        }
        case "tags": {
          const res = await engine.run({ task: "tags", input: text, options: { max: count }, signal });
          showJson($(root, "#json-out"), res.data);
          return runner.setMeta(res.meta);
        }
        case "moderate": {
          const res = await engine.run({ task: "moderate", input: text, signal });
          verdict.textContent = res.data.flagged ? `Flagged (${res.data.categories.join(", ") || "other"}): ${res.data.reason}` : `Looks fine: ${res.data.reason}`;
          verdict.hidden = false;
          showJson($(root, "#json-out"), res.data);
          return runner.setMeta(res.meta);
        }
        case "questions": {
          const res = await engine.run({ task: "questions", input: text, options: { count }, signal });
          showJson($(root, "#json-out"), res.data);
          return runner.setMeta(res.meta);
        }
      }
    });
  });
});
