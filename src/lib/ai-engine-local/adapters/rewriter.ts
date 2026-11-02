import type { RewriteLength, RewriteTone } from "../types";
import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface RewriterOptions {
  tone: RewriteTone;
  length: RewriteLength;
  context?: string;
}

export type RewriterAdapter = Adapter<RewriterOptions, Rewriter>;

export function createRewriterAdapter(deps: AdapterDeps): RewriterAdapter {
  return createAdapter<RewriterOptions, Rewriter>(deps, {
    api: "rewriter",
    ctor: (env) => env.Rewriter,
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
