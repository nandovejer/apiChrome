import { chunkText, type SummaryType } from "@engine";
import { $, bindRange, onDemo, renderMarkdown } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("summary-of-summaries", ({ root, engine, runner }) => {
  const input = $<HTMLTextAreaElement>(root, "#input");
  const chunk = $<HTMLInputElement>(root, "#chunk");
  const info = $(root, "#size-info");
  const steps = $<HTMLProgressElement>(root, "#steps");
  const out = $(root, "#out");
  const partials = $(root, "#partials");
  bindRange(chunk);
  input.value = samples.longArticle(engine.language);

  const describe = () => {
    const parts = chunkText(input.value, Number(chunk.value)).length;
    info.textContent = `${input.value.length} characters: ${parts} chunk${parts === 1 ? "" : "s"}`;
  };
  input.addEventListener("input", describe);
  chunk.addEventListener("input", describe);
  describe();

  const off = engine.on("progress", ({ done, total }) => {
    steps.hidden = false;
    steps.value = Math.round((done / total) * 100);
    steps.setAttribute("aria-label", `Summarizing chunks: ${done} of ${total}`);
  });

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = $<HTMLSelectElement>(root, "#type").value as SummaryType;
    void runner.run(async (signal) => {
      out.textContent = "";
      $(root, "[data-partials]").hidden = true;
      try {
        const res = await engine.run({
          task: "summarize-long",
          input: input.value,
          options: { type, length: "medium", format: "markdown", chunkSize: Number(chunk.value) },
          signal,
        });
        renderMarkdown(out, res.data.summary);
        partials.replaceChildren(
          ...res.data.partials.map((p) => Object.assign(document.createElement("li"), { textContent: p })),
        );
        $(root, "[data-partials]").hidden = res.data.partials.length === 0;
        runner.setMeta(res.meta);
      } finally {
        steps.hidden = true;
      }
    });
  });

  return off;
});
