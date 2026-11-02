import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface ProofreaderOptions {
  explain: boolean;
}

export type ProofreaderAdapter = Adapter<ProofreaderOptions, Proofreader>;

export function createProofreaderAdapter(deps: AdapterDeps): ProofreaderAdapter {
  return createAdapter<ProofreaderOptions, Proofreader>(deps, {
    api: "proofreader",
    ctor: (env) => env.Proofreader,
    core: (opts, { language }) => ({
      includeCorrectionTypes: true,
      includeCorrectionExplanations: opts.explain,
      correctionExplanationLanguage: language,
      expectedInputLanguages: [language],
    }),
    key: (opts) => String(opts.explain),
  });
}
