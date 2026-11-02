import type { ApiName } from "@engine";

export type DemoGroup = "start" | "prompt" | "text" | "language" | "writing";
export type ApiMaturity = "stable" | "experimental" | "deprecated";

export interface Demo {
  slug: string;
  group: DemoGroup;
  /** APIs the demo shows in its header. */
  uses: ApiName[];
  /** APIs without which the demo cannot work at all (the others have a fallback). */
  requires: ApiName[];
  maturity: ApiMaturity;
  /** Official demo this one covers. */
  source?: { label: string; url: string };
}

export const GROUPS: DemoGroup[] = ["start", "prompt", "text", "language", "writing"];

const WEB_AI = "https://chrome.dev/web-ai-demos";

export const DEMOS: Demo[] = [
  { slug: "", group: "start", uses: ["prompt", "summarizer", "translator", "detector", "proofreader", "writer", "rewriter"], requires: [], maturity: "stable" },
  { slug: "toolkit", group: "start", uses: ["summarizer", "translator", "prompt", "proofreader"], requires: ["prompt"], maturity: "stable" },
  { slug: "prompt", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "Prompt API Playground", url: `${WEB_AI}/prompt-api-playground/` } },
  { slug: "chat", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "AI Session Management", url: `${WEB_AI}/ai-session-management/` } },
  { slug: "json", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable" },
  { slug: "recipes", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable" },
  { slug: "synonyms", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "AI Synonym Finder", url: `${WEB_AI}/ai-synonym-finder/` } },
  { slug: "weather", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "Prompt API Weather", url: `${WEB_AI}/prompt-api-weather/` } },
  { slug: "image", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "experimental" },
  { slug: "summarize", group: "text", uses: ["summarizer"], requires: ["summarizer"], maturity: "stable", source: { label: "Summarizer Playground", url: `${WEB_AI}/summarization-api-playground/` } },
  { slug: "summary-of-summaries", group: "text", uses: ["summarizer"], requires: ["summarizer"], maturity: "stable", source: { label: "Summary of Summaries", url: `${WEB_AI}/summary-of-summaries/` } },
  { slug: "translate", group: "language", uses: ["detector", "translator"], requires: ["translator"], maturity: "stable", source: { label: "Translator + Language Detector", url: `${WEB_AI}/translation-language-detection-api-playground/` } },
  { slug: "proofread", group: "writing", uses: ["proofreader", "prompt"], requires: ["prompt"], maturity: "experimental", source: { label: "Proofreader Playground", url: `${WEB_AI}/proofreader-api-playground/` } },
  { slug: "write", group: "writing", uses: ["writer", "rewriter", "prompt"], requires: ["prompt"], maturity: "deprecated", source: { label: "Writer / Rewriter Playground", url: `${WEB_AI}/writer-rewriter-api-playground/` } },
  { slug: "assistant", group: "writing", uses: ["proofreader", "prompt"], requires: ["prompt"], maturity: "experimental" },
];

export const API_INFO: Record<ApiName, { label: string; global: string; maturity: ApiMaturity }> = {
  prompt: { label: "Prompt API", global: "LanguageModel", maturity: "stable" },
  summarizer: { label: "Summarizer API", global: "Summarizer", maturity: "stable" },
  translator: { label: "Translator API", global: "Translator", maturity: "stable" },
  detector: { label: "Language Detector API", global: "LanguageDetector", maturity: "stable" },
  proofreader: { label: "Proofreader API", global: "Proofreader", maturity: "experimental" },
  writer: { label: "Writer API", global: "Writer", maturity: "deprecated" },
  rewriter: { label: "Rewriter API", global: "Rewriter", maturity: "deprecated" },
};

export const RESOURCES: { id: string; label: string; url: string }[] = [
  { id: "builtin", label: "Built-in AI", url: "https://developer.chrome.com/docs/ai/built-in" },
  { id: "started", label: "Get started", url: "https://developer.chrome.com/docs/ai/get-started" },
  { id: "reference", label: "API reference", url: "https://developer.chrome.com/docs/ai/built-in-apis" },
  { id: "demos", label: "Web AI demos", url: "https://chrome.dev/web-ai-demos/" },
  { id: "explainer", label: "Prompt API explainer", url: "https://github.com/explainers-by-googlers/prompt-api" },
  { id: "types", label: "@types/dom-chromium-ai", url: "https://www.npmjs.com/package/@types/dom-chromium-ai" },
  { id: "studio", label: "Web AI Studio", url: "https://web-ai.studio/" },
  { id: "playground", label: "Built-in AI Playground", url: "https://ai.etiennenoel.com/" },
];

export const demoBySlug = (slug: string): Demo => {
  const demo = DEMOS.find((d) => d.slug === slug);
  if (!demo) throw new Error(`Unknown demo: ${slug}`);
  return demo;
};
