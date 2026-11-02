import type { AdapterDeps } from "./base";
import { createDetectorAdapter } from "./language-detector";
import { createPromptAdapter } from "./prompt";
import { createProofreaderAdapter } from "./proofreader";
import { createRewriterAdapter } from "./rewriter";
import { createSummarizerAdapter } from "./summarizer";
import { createTranslatorAdapter } from "./translator";
import { createWriterAdapter } from "./writer";

export function createAdapters(deps: AdapterDeps) {
  return {
    prompt: createPromptAdapter(deps),
    summarizer: createSummarizerAdapter(deps),
    translator: createTranslatorAdapter(deps),
    detector: createDetectorAdapter(deps),
    proofreader: createProofreaderAdapter(deps),
    writer: createWriterAdapter(deps),
    rewriter: createRewriterAdapter(deps),
  };
}

export type Adapters = ReturnType<typeof createAdapters>;
