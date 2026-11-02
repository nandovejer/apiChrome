export type ApiName =
  | "prompt"
  | "summarizer"
  | "translator"
  | "detector"
  | "proofreader"
  | "writer"
  | "rewriter";

export const API_NAMES: readonly ApiName[] = [
  "prompt",
  "summarizer",
  "translator",
  "detector",
  "proofreader",
  "writer",
  "rewriter",
];

export type ApiAvailability = Availability | "unsupported";
export type ApiStatus = Record<ApiName, ApiAvailability>;

/** The global object that exposes the built-in AI constructors (`self` in a page). */
export interface AIEnvironment {
  LanguageModel?: typeof LanguageModel;
  Summarizer?: typeof Summarizer;
  Translator?: typeof Translator;
  LanguageDetector?: typeof LanguageDetector;
  Proofreader?: typeof Proofreader;
  Writer?: typeof Writer;
  Rewriter?: typeof Rewriter;
}

export interface EngineConfig {
  /** Language of the prompts and of the model output: "en", "es" or "ja". */
  language?: string;
  env?: AIEnvironment;
}

export type JsonSchema = Record<string, unknown>;

export interface ResultMeta {
  task: TaskName;
  /** The API that did the work. */
  api: ApiName;
  /** True when the dedicated API is missing and the Prompt API did the work. */
  fallback: boolean;
  ms: number;
}

export interface EngineEvents {
  download: { api: ApiName; progress: number };
  progress: { task: TaskName; done: number; total: number };
  fallback: { task: TaskName; from: ApiName; to: ApiName };
}

export interface Detection {
  language: string;
  confidence: number;
}

export interface Correction {
  startIndex: number;
  endIndex: number;
  original: string;
  correction: string;
  types: string[];
  explanation: string;
}

export interface ProofreadOutput {
  corrected: string;
  corrections: Correction[];
}

export type SummaryType = "tldr" | "key-points" | "teaser" | "headline";
export type SummaryLength = "short" | "medium" | "long";
export type SummaryFormat = "plain-text" | "markdown";
export type WriteTone = "formal" | "neutral" | "casual";
export type WriteLength = "short" | "medium" | "long";
export type RewriteTone = "as-is" | "more-formal" | "more-casual";
export type RewriteLength = "as-is" | "shorter" | "longer";

export interface SummarizeOptions {
  type?: SummaryType;
  length?: SummaryLength;
  format?: SummaryFormat;
  context?: string;
}

export type ExtractField = "emails" | "phones" | "names" | "urls" | "dates";

/** Every task: its input, its options and what it resolves to. */
export interface TaskSpec {
  prompt: { input: string; options: { system?: string }; output: string };
  json: { input: string; options: { schema: JsonSchema; system?: string }; output: unknown };
  classify: {
    input: string;
    options: { labels: string[] };
    output: { label: string; reason: string };
  };
  extract: {
    input: string;
    options: { fields?: ExtractField[] };
    output: Record<ExtractField, string[]>;
  };
  tags: {
    input: string;
    options: { max?: number };
    output: { tags: string[]; keywords: string[] };
  };
  moderate: {
    input: string;
    options: Record<string, never>;
    output: { flagged: boolean; categories: string[]; reason: string };
  };
  describe: { input: string; options: { tone?: string }; output: string };
  questions: {
    input: string;
    options: { count?: number };
    output: { questions: { question: string; answer: string }[] };
  };
  synonyms: {
    input: string;
    options: { count?: number };
    output: { synonyms: { word: string; nuance: string }[] };
  };
  weather: { input: string; options: Record<string, never>; output: string };
  image: {
    input: ImageBitmapSource;
    options: { question?: string };
    output: string;
  };
  summarize: { input: string; options: SummarizeOptions; output: string };
  "summarize-long": {
    input: string;
    options: SummarizeOptions & { chunkSize?: number };
    output: { summary: string; partials: string[] };
  };
  detect: { input: string; options: Record<string, never>; output: Detection[] };
  translate: {
    input: string;
    options: { source: string; target: string };
    output: string;
  };
  "universal-translate": {
    input: string;
    options: { target: string };
    output: { detected: Detection | null; translation: string; skipped: boolean };
  };
  proofread: {
    input: string;
    options: { explain?: boolean };
    output: ProofreadOutput;
  };
  write: {
    input: string;
    options: { tone?: WriteTone; length?: WriteLength; context?: string };
    output: string;
  };
  rewrite: {
    input: string;
    options: { tone?: RewriteTone; length?: RewriteLength; context?: string };
    output: string;
  };
  simplify: { input: string; options: { audience?: string }; output: string };
  tone: { input: string; options: { tone: string }; output: string };
}

export type TaskName = keyof TaskSpec;

export type StreamableTask =
  | "prompt"
  | "describe"
  | "weather"
  | "image"
  | "summarize"
  | "translate"
  | "write"
  | "rewrite"
  | "simplify"
  | "tone";

type OptionsField<T extends TaskName> = Record<never, never> extends TaskSpec[T]["options"]
  ? { options?: TaskSpec[T]["options"] }
  : { options: TaskSpec[T]["options"] };

export type TaskRequest<T extends TaskName> = {
  task: T;
  input: TaskSpec[T]["input"];
  signal?: AbortSignal;
} & OptionsField<T>;

export interface TaskResult<T extends TaskName> {
  data: TaskSpec[T]["output"];
  meta: ResultMeta;
}

export interface ChatUsage {
  used: number;
  quota: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
