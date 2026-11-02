import type { ApiName } from "@engine";

export type DemoGroup = "start" | "prompt" | "text" | "language" | "writing";
export type ApiMaturity = "stable" | "experimental" | "deprecated";

export interface Demo {
  slug: string;
  title: string;
  summary: string;
  group: DemoGroup;
  /** APIs the demo shows in its header. */
  uses: ApiName[];
  /** APIs without which the demo cannot work at all (the others have a fallback). */
  requires: ApiName[];
  maturity: ApiMaturity;
  /** Official demo this one covers. */
  source?: { label: string; url: string };
}

export const GROUPS: Record<DemoGroup, string> = {
  start: "Start",
  prompt: "Prompt API",
  text: "Summarizer",
  language: "Translator and detector",
  writing: "Writing",
};

const WEB_AI = "https://chrome.dev/web-ai-demos";

export const DEMOS: Demo[] = [
  { slug: "", title: "Status", summary: "Which built-in AI APIs this browser exposes, and the models on this device.", group: "start", uses: ["prompt", "summarizer", "translator", "detector", "proofreader", "writer", "rewriter"], requires: [], maturity: "stable", source: { label: "Built-in AI", url: "https://developer.chrome.com/docs/ai/built-in" } },
  { slug: "toolkit", title: "Text toolkit", summary: "One text, many actions: summarize, translate, proofread, simplify and rewrite, with every result kept to compare.", group: "start", uses: ["summarizer", "translator", "prompt", "proofreader"], requires: ["prompt"], maturity: "stable" },
  { slug: "prompt", title: "Prompt playground", summary: "Send any instruction to Gemini Nano and read the answer as it streams.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "Prompt API Playground", url: `${WEB_AI}/prompt-api-playground/` } },
  { slug: "chat", title: "Local chat", summary: "A chat with history, streaming, a stop button and several sessions you can fork.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "AI Session Management", url: `${WEB_AI}/ai-session-management/` } },
  { slug: "json", title: "JSON generator", summary: "Describe the data you need and get it back as JSON that follows a schema.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable" },
  { slug: "recipes", title: "Recipes", summary: "Classify, extract, tag, moderate, describe and ask questions of a text, each a small prompt.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable" },
  { slug: "synonyms", title: "Synonym finder", summary: "Synonyms of a word, with how each one differs.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "AI Synonym Finder", url: `${WEB_AI}/ai-synonym-finder/` } },
  { slug: "weather", title: "Weather describer", summary: "Turn raw weather data into a sentence a person would say.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "stable", source: { label: "Prompt API Weather", url: `${WEB_AI}/prompt-api-weather/` } },
  { slug: "image", title: "Image analyzer", summary: "Ask the model what is in a picture, with the Prompt API's image input.", group: "prompt", uses: ["prompt"], requires: ["prompt"], maturity: "experimental" },
  { slug: "summarize", title: "Summarizer", summary: "Summarize a text as a TL;DR, key points, a teaser or a headline, in the length you choose.", group: "text", uses: ["summarizer"], requires: ["summarizer"], maturity: "stable", source: { label: "Summarizer Playground", url: `${WEB_AI}/summarization-api-playground/` } },
  { slug: "summary-of-summaries", title: "Summary of summaries", summary: "Split a long text into chunks, summarize each, then summarize the summaries.", group: "text", uses: ["summarizer"], requires: ["summarizer"], maturity: "stable", source: { label: "Summary of Summaries", url: `${WEB_AI}/summary-of-summaries/` } },
  { slug: "translate", title: "Universal translator", summary: "Paste text in any language: it is detected and translated to the one you pick.", group: "language", uses: ["detector", "translator"], requires: ["translator"], maturity: "stable", source: { label: "Translator + Language Detector", url: `${WEB_AI}/translation-language-detection-api-playground/` } },
  { slug: "proofread", title: "Proofreader", summary: "Spelling, punctuation and grammar fixes, each with its type and why.", group: "writing", uses: ["proofreader", "prompt"], requires: ["prompt"], maturity: "experimental", source: { label: "Proofreader Playground", url: `${WEB_AI}/proofreader-api-playground/` } },
  { slug: "write", title: "Writer and rewriter", summary: "Write from an instruction or rewrite a text in another tone and length.", group: "writing", uses: ["writer", "rewriter", "prompt"], requires: ["prompt"], maturity: "deprecated", source: { label: "Writer / Rewriter Playground", url: `${WEB_AI}/writer-rewriter-api-playground/` } },
  { slug: "assistant", title: "Writing assistant", summary: "An editor that corrects, changes the tone or simplifies the text you wrote.", group: "writing", uses: ["proofreader", "prompt"], requires: ["prompt"], maturity: "experimental" },
];

export const API_INFO: Record<ApiName, { label: string; global: string; maturity: ApiMaturity; note: string }> = {
  prompt: { label: "Prompt API", global: "LanguageModel", maturity: "stable", note: "General purpose generative AI" },
  summarizer: { label: "Summarizer API", global: "Summarizer", maturity: "stable", note: "TL;DR, key points, teaser, headline" },
  translator: { label: "Translator API", global: "Translator", maturity: "stable", note: "On-device translation, one model per language pair" },
  detector: { label: "Language Detector API", global: "LanguageDetector", maturity: "stable", note: "Which language a text is in" },
  proofreader: { label: "Proofreader API", global: "Proofreader", maturity: "experimental", note: "Origin trial; falls back to the Prompt API" },
  writer: { label: "Writer API", global: "Writer", maturity: "deprecated", note: "Deprecated; falls back to the Prompt API" },
  rewriter: { label: "Rewriter API", global: "Rewriter", maturity: "deprecated", note: "Deprecated; falls back to the Prompt API" },
};

export const RESOURCES: { label: string; url: string; note: string }[] = [
  { label: "Built-in AI", url: "https://developer.chrome.com/docs/ai/built-in", note: "The general index" },
  { label: "Get started", url: "https://developer.chrome.com/docs/ai/get-started", note: "Initial setup and flags" },
  { label: "API reference", url: "https://developer.chrome.com/docs/ai/built-in-apis", note: "The state of each API" },
  { label: "Web AI demos", url: "https://chrome.dev/web-ai-demos/", note: "Google's collection of working examples" },
  { label: "Prompt API explainer", url: "https://github.com/explainers-by-googlers/prompt-api", note: "The proposal on GitHub" },
  { label: "@types/dom-chromium-ai", url: "https://www.npmjs.com/package/@types/dom-chromium-ai", note: "TypeScript typings this app uses" },
  { label: "Web AI Studio", url: "https://web-ai.studio/", note: "Inspect models and compatibility" },
  { label: "Built-in AI Playground", url: "https://ai.etiennenoel.com/", note: "Third party: it also shows experiments that are not Chrome APIs" },
];

export function demoHref(slug: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${slug ? `${slug}/` : ""}`;
}

export const demoBySlug = (slug: string): Demo => {
  const demo = DEMOS.find((d) => d.slug === slug);
  if (!demo) throw new Error(`Unknown demo: ${slug}`);
  return demo;
};
