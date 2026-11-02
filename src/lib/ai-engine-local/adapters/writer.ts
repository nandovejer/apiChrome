import type { WriteLength, WriteTone } from "../types";
import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface WriterOptions {
  tone: WriteTone;
  length: WriteLength;
  context?: string;
}

export type WriterAdapter = Adapter<WriterOptions, Writer>;

export function createWriterAdapter(deps: AdapterDeps): WriterAdapter {
  return createAdapter<WriterOptions, Writer>(deps, {
    api: "writer",
    ctor: (env) => env.Writer,
    core: (opts, { language }) => ({
      tone: opts.tone,
      length: opts.length,
      format: "plain-text",
      expectedInputLanguages: [language],
      expectedContextLanguages: [language],
      outputLanguage: language,
    }),
    extras: (opts) => (opts.context ? { sharedContext: opts.context } : {}),
    key: (opts) => JSON.stringify([opts.tone, opts.length, opts.context ?? ""]),
  });
}
