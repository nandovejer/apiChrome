import { $, bindRange, onDemo } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("synonyms", ({ root, engine, runner }) => {
  const word = $<HTMLInputElement>(root, "#word");
  const count = $<HTMLInputElement>(root, "#count");
  const rows = $(root, "#rows");
  bindRange(count);
  word.value = samples.word(engine.language);

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    void runner.run(async (signal) => {
      const res = await engine.run({ task: "synonyms", input: word.value.trim(), options: { count: Number(count.value) }, signal });
      rows.replaceChildren(
        ...res.data.synonyms.map(({ word: w, nuance }) => {
          const tr = document.createElement("tr");
          for (const [label, value] of [["Word", w], ["How it differs", nuance]] as const) {
            const td = tr.appendChild(document.createElement("td"));
            td.dataset.label = label;
            td.appendChild(document.createElement("div")).textContent = value;
          }
          return tr;
        }),
      );
      $(root, "[data-results]").hidden = false;
      runner.setMeta(res.meta);
    });
  });
});
