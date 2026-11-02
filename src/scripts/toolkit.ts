import type { TaskStream, ResultMeta } from "@engine";
import { $, $$, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";
import { languageLabel } from "../data/languages";

type Action = "summarize" | "translate" | "proofread" | "simplify" | "rewrite";

onDemo("toolkit", ({ root, engine, runner }) => {
  const text = $<HTMLTextAreaElement>(root, "#text");
  const count = $(root, "#count");
  const results = $(root, "#results");
  const empty = $(root, "#empty");

  const updateCount = () => (count.textContent = text.value ? `${text.value.length} characters` : "");
  text.addEventListener("input", updateCount);
  $(root, "[data-sample]").addEventListener("click", () => {
    text.value = samples.article(engine.language);
    updateCount();
  });
  $(root, "[data-clear]").addEventListener("click", () => {
    results.replaceChildren();
    empty.hidden = false;
  });

  const action = (): Action => {
    const active = root.querySelector<HTMLElement>(".luz-tab.is-active");
    return (active?.dataset.action as Action | undefined) ?? "summarize";
  };

  const addCard = (title: string) => {
    const card = document.createElement("article");
    card.className = "luz-card result-card";
    const h = card.appendChild(document.createElement("h3"));
    h.className = "luz-card__title";
    h.textContent = title;
    const body = card.appendChild(document.createElement("div"));
    body.className = "luz-card__body output";
    const meta = card.appendChild(document.createElement("p"));
    meta.className = "meta";
    results.prepend(card);
    empty.hidden = true;
    return { body, meta };
  };

  const describe = (meta: ResultMeta) =>
    `${meta.fallback ? `${meta.api} API (fallback)` : `${meta.api} API`} · ${meta.ms} ms`;

  $(root, "[data-run]").addEventListener("click", () => {
    const input = text.value.trim();
    if (!input) return;
    const chosen = action();
    void runner.run(async (signal) => {
      const streamed = async (title: string, stream: TaskStream, markdown = false) => {
        const card = addCard(title);
        await streamInto(card.body, stream, undefined, { markdown });
        card.meta.textContent = describe(stream.meta);
      };
      switch (chosen) {
        case "summarize": {
          const type = $<HTMLSelectElement>(root, "#sum-type").value as "tldr";
          const length = $<HTMLSelectElement>(root, "#sum-length").value as "short";
          return streamed(`Summary: ${type}, ${length}`, engine.stream({ task: "summarize", input, options: { type, length }, signal }), true);
        }
        case "translate": {
          const target = $<HTMLSelectElement>(root, "#tr-target").value;
          const card = addCard(`Translation to ${languageLabel(target)}`);
          const res = await engine.run({ task: "universal-translate", input, options: { target }, signal });
          const { detected, translation, skipped } = res.data;
          card.body.textContent = translation;
          card.meta.textContent = `${detected ? `detected ${languageLabel(detected.language)}` : "language not detected"}${skipped ? ", nothing to translate" : ""} · ${describe(res.meta)}`;
          return;
        }
        case "proofread": {
          const card = addCard("Proofread");
          const res = await engine.run({ task: "proofread", input, signal });
          card.body.textContent = res.data.corrected;
          card.meta.textContent = `${res.data.corrections.length} corrections · ${describe(res.meta)}`;
          return;
        }
        case "simplify":
          return streamed("Simplified", engine.stream({ task: "simplify", input, signal }));
        case "rewrite": {
          const tone = $<HTMLSelectElement>(root, "#rw-tone").value as "more-formal";
          return streamed(`Rewritten: ${tone}`, engine.stream({ task: "rewrite", input, options: { tone }, signal }));
        }
      }
    });
  });

  void $$(root, ".luz-tab");
});
