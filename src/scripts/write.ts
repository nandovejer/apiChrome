import type { RewriteLength, RewriteTone, WriteLength, WriteTone } from "@engine";
import { $, createRunner, onDemo, streamInto } from "../lib/ui";
import { samples } from "../data/samples";

onDemo("write", ({ root, engine }) => {
  $<HTMLTextAreaElement>(root, "#w-input").value = samples.writeInstruction(engine.language);
  $<HTMLTextAreaElement>(root, "#r-input").value = samples.informal(engine.language);

  const writeForm = $(root, '[data-form="write"]');
  const rewriteForm = $(root, '[data-form="rewrite"]');
  const writeRunner = createRunner(writeForm, engine);
  const rewriteRunner = createRunner(rewriteForm, engine);

  writeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void writeRunner.run(async (signal) => {
      const options = {
        tone: $<HTMLSelectElement>(root, "#w-tone").value as WriteTone,
        length: $<HTMLSelectElement>(root, "#w-length").value as WriteLength,
        context: $<HTMLInputElement>(root, "#w-context").value || undefined,
      };
      const stream = engine.stream({ task: "write", input: $<HTMLTextAreaElement>(root, "#w-input").value, options, signal });
      await streamInto($(root, "#w-out"), stream, writeRunner);
    });
  });

  rewriteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void rewriteRunner.run(async (signal) => {
      const options = {
        tone: $<HTMLSelectElement>(root, "#r-tone").value as RewriteTone,
        length: $<HTMLSelectElement>(root, "#r-length").value as RewriteLength,
      };
      const stream = engine.stream({ task: "rewrite", input: $<HTMLTextAreaElement>(root, "#r-input").value, options, signal });
      await streamInto($(root, "#r-out"), stream, rewriteRunner);
    });
  });

  return () => {
    writeRunner.stop();
    writeRunner.dispose();
    rewriteRunner.stop();
    rewriteRunner.dispose();
  };
});
