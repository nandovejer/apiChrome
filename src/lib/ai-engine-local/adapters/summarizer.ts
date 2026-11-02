import type { SummaryFormat, SummaryLength, SummaryType } from "../types";
import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface SummarizerOptions {
  type: SummaryType;
  length: SummaryLength;
  format: SummaryFormat;
  context?: string;
}

export type SummarizerAdapter = Adapter<SummarizerOptions, Summarizer>;

export function createSummarizerAdapter(deps: AdapterDeps): SummarizerAdapter {
  return createAdapter<SummarizerOptions, Summarizer>(deps, {
    api: "summarizer",
    ctor: (env) => env.Summarizer,
    core: (opts, { language }) => ({
      type: opts.type,
      length: opts.length,
      format: opts.format,
      expectedInputLanguages: [language],
      expectedContextLanguages: [language],
      outputLanguage: language,
    }),
    extras: (opts) => (opts.context ? { sharedContext: opts.context } : {}),
    key: (opts) => JSON.stringify([opts.type, opts.length, opts.format, opts.context ?? ""]),
  });
}
