import type { AIEnvironment } from "@engine";

export function stream(chunks: string[]): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

export interface Calls {
  created: Record<string, number>;
  clones: number;
  destroyed: number;
  prompts: { input: unknown; options: unknown }[];
  summaries: string[];
  monitorCreate?: (monitor: EventTarget) => void;
}

export interface MockOptions {
  /** What the language model answers; a function gets the input. */
  answer?: string | ((input: unknown) => string);
  translatorPairs?: string[];
  detected?: { detectedLanguage: string; confidence: number }[];
  without?: (keyof AIEnvironment)[];
  languageModelState?: Availability;
  createError?: Error;
}

/** Fakes of the built-in AI classes: enough surface for the engine, no model. */
export function mockEnv(opts: MockOptions = {}): { env: AIEnvironment; calls: Calls } {
  const calls: Calls = { created: {}, clones: 0, destroyed: 0, prompts: [], summaries: [] };
  const count = (name: string) => (calls.created[name] = (calls.created[name] ?? 0) + 1);
  const answer = (input: unknown) =>
    typeof opts.answer === "function" ? opts.answer(input) : (opts.answer ?? "ok");

  const withMonitor = async (name: string, options: { monitor?: (m: EventTarget) => void } | undefined) => {
    if (opts.createError) throw opts.createError;
    count(name);
    if (options?.monitor) {
      const monitor = new EventTarget();
      options.monitor(monitor);
      monitor.dispatchEvent(Object.assign(new Event("downloadprogress"), { loaded: 0.5 }));
    }
  };

  class Session {
    contextUsage = 10;
    contextWindow = 100;
    async prompt(input: unknown, options: unknown) {
      calls.prompts.push({ input, options });
      return answer(input);
    }
    promptStreaming(input: unknown, options: unknown) {
      calls.prompts.push({ input, options });
      return stream(answer(input).split(" ").map((w, i) => (i ? ` ${w}` : w)));
    }
    async append() {}
    async clone() {
      calls.clones++;
      return new Session();
    }
    destroy() {
      calls.destroyed++;
    }
  }

  const LanguageModel = {
    availability: async () => opts.languageModelState ?? "available",
    create: async (o?: { monitor?: (m: EventTarget) => void }) => {
      await withMonitor("prompt", o);
      return new Session();
    },
  };

  const Summarizer = {
    availability: async () => "available",
    create: async (o?: { monitor?: (m: EventTarget) => void; type?: string }) => {
      await withMonitor("summarizer", o);
      const summarize = async (input: string) => {
        calls.summaries.push(input);
        return `S(${input.length})`;
      };
      return {
        summarize,
        summarizeStreaming: (input: string) => stream([`S(${input.length})`, "!"]),
        destroy() {},
      };
    },
  };

  const pairs = opts.translatorPairs ?? ["en>es", "pt>en"];
  const Translator = {
    availability: async (o: { sourceLanguage: string; targetLanguage: string }) =>
      pairs.includes(`${o.sourceLanguage}>${o.targetLanguage}`) ? "available" : "unavailable",
    create: async (o: { sourceLanguage: string; targetLanguage: string; monitor?: (m: EventTarget) => void }) => {
      await withMonitor("translator", o);
      return {
        translateStreaming: (input: string) => stream([`[${o.sourceLanguage}>${o.targetLanguage}] `, input]),
        destroy() {},
      };
    },
  };

  const LanguageDetector = {
    availability: async () => "available",
    create: async (o?: { monitor?: (m: EventTarget) => void }) => {
      await withMonitor("detector", o);
      return { detect: async () => opts.detected ?? [{ detectedLanguage: "en", confidence: 0.9 }], destroy() {} };
    },
  };

  const all = { LanguageModel, Summarizer, Translator, LanguageDetector } as unknown as AIEnvironment;
  for (const key of opts.without ?? []) delete all[key];
  return { env: all, calls };
}
