import { $, fillSelect, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("prompt", ({ root, engine, runner }) => {
  const input = $<HTMLTextAreaElement>(root, "#input");
  const system = $<HTMLInputElement>(root, "#system");
  const example = $<HTMLSelectElement>(root, "#example");
  const out = $(root, "#out");
  const prompts = samples.prompts(engine.language);
  fillSelect(example, ["", ...prompts]);
  example.options[0]!.text = "Pick one…";
  example.addEventListener("change", () => example.value && (input.value = example.value));

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    void runner.run(async (signal) => {
      const stream = engine.stream({ task: "prompt", input: input.value, options: { system: system.value || undefined }, signal });
      await streamInto(out, stream, runner);
    });
  });
});
