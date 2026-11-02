import { $, $$, correctionRows, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

const TONES: Record<string, string> = { formal: "formal and polite", friendly: "warm and friendly", concise: "concise and direct" };

onDemo("assistant", ({ root, engine, runner }) => {
  const editor = $<HTMLTextAreaElement>(root, "#editor");
  const panel = $(root, "[data-suggestion]");
  const suggestion = $(root, "#suggestion");
  const undo = $<HTMLButtonElement>(root, "[data-undo]");
  const acts = $$<HTMLButtonElement>(root, "[data-act]");
  const corrections = $(root, "[data-corrections]");
  let previous: string | null = null;
  editor.value = samples.errors(engine.language);

  const exec = (work: (text: string, signal: AbortSignal) => Promise<void>) => {
    const text = editor.value.trim();
    if (!text) return;
    acts.forEach((b) => (b.disabled = true));
    panel.hidden = false;
    corrections.hidden = true;
    suggestion.textContent = "";
    void runner
      .run((signal) => work(text, signal))
      .finally(() => acts.forEach((b) => (b.disabled = false)));
  };

  $(root, "[data-run]").addEventListener("click", () =>
    exec(async (text, signal) => {
      const res = await engine.run({ task: "proofread", input: text, signal });
      suggestion.textContent = res.data.corrected;
      $(root, "#rows").replaceChildren(...correctionRows(res.data.corrections));
      corrections.hidden = res.data.corrections.length === 0;
      runner.setMeta(res.meta);
    }),
  );

  for (const button of acts) {
    button.addEventListener("click", () =>
      exec(async (text, signal) => {
        const act = button.dataset.act ?? "";
        const stream =
          act === "simplify"
            ? engine.stream({ task: "simplify", input: text, signal })
            : engine.stream({ task: "tone", input: text, options: { tone: TONES[act] ?? act }, signal });
        await streamInto(suggestion, stream, runner);
      }),
    );
  }

  $(root, "[data-apply]").addEventListener("click", () => {
    previous = editor.value;
    editor.value = suggestion.textContent ?? "";
    undo.hidden = false;
  });
  undo.addEventListener("click", () => {
    if (previous !== null) editor.value = previous;
    undo.hidden = true;
  });
});
