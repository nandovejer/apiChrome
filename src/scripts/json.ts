import { $, UiError, onDemo, showJson } from "../lib/ui";
import { JSON_PRESETS, samples } from "../data/samples";
import { m } from "../i18n/client";

onDemo("json", ({ root, engine, runner }) => {
  const description = $<HTMLTextAreaElement>(root, "#description");
  const preset = $<HTMLSelectElement>(root, "#preset");
  const schema = $<HTMLTextAreaElement>(root, "#schema");

  const keys = Object.keys(JSON_PRESETS) as (keyof typeof JSON_PRESETS)[];
  preset.replaceChildren(...keys.map((key) => new Option(m().json.presets[key], key)), new Option(m().json.presets.custom, "custom"));
  const apply = () => {
    const chosen = JSON_PRESETS[preset.value as keyof typeof JSON_PRESETS];
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
        throw new UiError(m().json.invalidSchema);
      }
      const res = await engine.run({ task: "json", input: description.value, options: { schema: parsed }, signal });
      showJson($(root, "#json-out"), res.data);
      runner.setMeta(res.meta);
    });
  });
});
