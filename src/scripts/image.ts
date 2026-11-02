import { $, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("image", ({ root, engine, runner }) => {
  const file = $<HTMLInputElement>(root, "#file");
  const preview = $<HTMLImageElement>(root, "#preview");
  const question = $<HTMLInputElement>(root, "#question");
  const out = $(root, "#out");
  let url: string | undefined;

  const questions = samples.imageQuestions(engine.language);
  $(root, "#questions").replaceChildren(...questions.map((q) => new Option(q, q)));
  question.value = questions[0] ?? "";

  file.addEventListener("change", () => {
    if (url) URL.revokeObjectURL(url);
    const chosen = file.files?.[0];
    url = chosen ? URL.createObjectURL(chosen) : undefined;
    preview.src = url ?? "";
    $(root, "[data-preview]").hidden = !url;
  });

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const chosen = file.files?.[0];
    if (!chosen) return;
    void runner.run(async (signal) => {
      const bitmap = await createImageBitmap(chosen);
      try {
        const stream = engine.stream({ task: "image", input: bitmap, options: { question: question.value }, signal });
        await streamInto(out, stream, runner);
      } finally {
        bitmap.close();
      }
    });
  });

  return () => {
    if (url) URL.revokeObjectURL(url);
  };
});
