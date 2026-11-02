import { $, onDemo, showJson } from "../lib/ui";
import { JSON_PRESETS, samples } from "../data/samples";

onDemo("json", ({ root, engine, runner }) => {
  const description = $<HTMLTextAreaElement>(root, "#description");
  const preset = $<HTMLSelectElement>(root, "#preset");
  const schema = $<HTMLTextAreaElement>(root, "#schema");

  preset.replaceChildren(...Object.entries(JSON_PRESETS).map(([key, p]) => new Option(p.label, key)), new Option("Custom", "custom"));
  const apply = () => {
    const chosen = JSON_PRESETS[preset.value];
    if (chosen) schema.value = JSON.stringify(chosen.schema, null, 2);
  };
  preset.addEventListener("change", apply);
  schema.addEventListener("input", () => (preset.value = "custom"));
  description.value = samples.userDescriptions(engine.language);
  apply();

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    void runner.run(async (signal) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(schema.value) as Record<string, unknown>;
      } catch {
        throw new Error("The schema is not valid JSON.");
      }
      const res = await engine.run({ task: "json", input: description.value, options: { schema: parsed }, signal });
      showJson($(root, "#json-out"), res.data);
      runner.setMeta(res.meta);
    });
  });
});
