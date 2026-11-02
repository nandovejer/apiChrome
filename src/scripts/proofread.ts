import { $, $$, correctionRows, onDemo, renderCorrections } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("proofread", ({ root, engine, runner }) => {
  const input = $<HTMLTextAreaElement>(root, "#input");
  input.value = samples.errors(engine.language);

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    const explain = $<HTMLInputElement>(root, "#explain").checked;
    void runner.run(async (signal) => {
      const res = await engine.run({ task: "proofread", input: text, options: { explain }, signal });
      renderCorrections($(root, "#marked"), text, res.data.corrections);
      $(root, "#out").textContent = res.data.corrected;
      $(root, "#rows").replaceChildren(...correctionRows(res.data.corrections));
      for (const section of $$(root, "[data-results]")) section.hidden = false;
      runner.setMeta(res.meta);
    });
  });
});
