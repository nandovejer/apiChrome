import { $, onDemo, streamInto } from "../lib/ui";
import { languageLabel } from "../data/languages";

onDemo("translate", ({ root, engine, runner }) => {
  const input = $<HTMLTextAreaElement>(root, "#input");
  const source = $<HTMLSelectElement>(root, "#source");
  const target = $<HTMLSelectElement>(root, "#target");
  const detected = $(root, "#detected");
  const out = $(root, "#out");
  target.value = engine.language === "es" ? "en" : "es";

  let timer: ReturnType<typeof setTimeout> | undefined;
  let alive = true;
  /** Shows the language as the text is typed. It stays silent while the detector model still has to be downloaded. */
  const detect = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const text = input.value.trim();
      if (text.length < 4) return void (detected.textContent = "");
      try {
        const { data } = await engine.run({ task: "detect", input: text });
        if (!alive) return;
        const top = data[0];
        detected.textContent = top ? `Detected: ${languageLabel(top.language)} (${Math.round(top.confidence * 100)}%)` : "";
      } catch {
        detected.textContent = "";
      }
    }, 400);
  };
  input.addEventListener("input", detect);

  $(root, "[data-swap]").addEventListener("click", () => {
    if (source.value === "auto") return;
    [source.value, target.value] = [target.value, source.value];
  });

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    void runner.run(async (signal) => {
      if (source.value === "auto") {
        const res = await engine.run({ task: "universal-translate", input: input.value, options: { target: target.value }, signal });
        const { detected: found, translation, skipped } = res.data;
        out.textContent = translation;
        detected.textContent = found
          ? `Detected: ${languageLabel(found.language)}${skipped ? ". It is already in the target language." : ""}`
          : "The language could not be detected.";
        return runner.setMeta(res.meta);
      }
      const stream = engine.stream({ task: "translate", input: input.value, options: { source: source.value, target: target.value }, signal });
      await streamInto(out, stream, runner);
    });
  });

  return () => {
    alive = false;
    clearTimeout(timer);
  };
});
