import { createAdapter, type Adapter, type AdapterDeps } from "./base";

export type DetectorAdapter = Adapter<void, LanguageDetector>;

export function createDetectorAdapter(deps: AdapterDeps): DetectorAdapter {
  return createAdapter<void, LanguageDetector>(deps, {
    api: "detector",
    ctor: (env) => env.LanguageDetector,
    core: () => ({}),
    key: () => "default",
  });
}
