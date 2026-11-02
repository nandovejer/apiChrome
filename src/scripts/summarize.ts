import type { SummaryFormat, SummaryLength, SummaryType } from "@engine";
import { $, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("summarize", ({ root, engine, runner }) => {
  const input = $<HTMLTextAreaElement>(root, "#input");
  const out = $(root, "#out");
  input.value = samples.article(engine.language);

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = $<HTMLSelectElement>(root, "#type").value as SummaryType;
    const length = $<HTMLSelectElement>(root, "#length").value as SummaryLength;
    const format = $<HTMLSelectElement>(root, "#format").value as SummaryFormat;
    void runner.run(async (signal) => {
      const stream = engine.stream({ task: "summarize", input: input.value, options: { type, length, format }, signal });
      await streamInto(out, stream, runner, { markdown: format === "markdown" });
    });
  });
});
