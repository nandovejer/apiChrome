import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface PromptOptions {
  system?: string;
  image?: boolean;
}

export type PromptAdapter = Adapter<PromptOptions, LanguageModel>;

export function createPromptAdapter(deps: AdapterDeps): PromptAdapter {
  return createAdapter<PromptOptions, LanguageModel>(deps, {
    api: "prompt",
    ctor: (env) => env.LanguageModel,
    core: (opts, { language }) => ({
      expectedInputs: [
        { type: "text", languages: [language] },
        ...(opts.image ? [{ type: "image" as const }] : []),
      ],
      expectedOutputs: [{ type: "text", languages: [language] }],
    }),
    extras: (opts) =>
      opts.system ? { initialPrompts: [{ role: "system", content: opts.system }] } : {},
    key: (opts) => JSON.stringify([opts.system ?? "", Boolean(opts.image)]),
  });
}
