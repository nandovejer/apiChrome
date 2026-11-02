import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export interface TranslatorOptions {
  source: string;
  target: string;
}

export type TranslatorAdapter = Adapter<TranslatorOptions, Translator>;

export function createTranslatorAdapter(deps: AdapterDeps): TranslatorAdapter {
  return createAdapter<TranslatorOptions, Translator>(deps, {
    api: "translator",
    ctor: (env) => env.Translator,
    core: (opts) => ({ sourceLanguage: opts.source, targetLanguage: opts.target }),
    key: (opts) => `${opts.source}>${opts.target}`,
  });
}
