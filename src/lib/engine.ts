import { createLocalAIEngine, type LocalAIEngine } from "@engine";

const KEY = "luz-ai-language";

export function storedLanguage(): string | undefined {
  try {
    return localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function storeLanguage(language: string): void {
  try {
    localStorage.setItem(KEY, language);
  } catch {
    /* private window: the choice lasts until reload */
  }
}

let instance: LocalAIEngine | undefined;

/** One engine for the whole app: its models stay loaded while the pages change. */
export function getEngine(): LocalAIEngine {
  return (instance ??= createLocalAIEngine({ language: storedLanguage() }));
}
