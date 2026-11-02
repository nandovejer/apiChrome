import { describe, expect, it } from "vitest";
import { AIEngineError, createLocalAIEngine } from "@engine";
import { mockEnv } from "./mocks";

const make = (options = {}, language = "en") => {
  const { env, calls } = mockEnv(options);
  return { engine: createLocalAIEngine({ env, language }), calls };
};

describe("status", () => {
  it("reports each API, and unsupported for the ones the browser lacks", async () => {
    const { engine } = make();
    const status = await engine.status();
    expect(status.prompt).toBe("available");
    expect(status.summarizer).toBe("available");
    expect(status.proofreader).toBe("unsupported");
    expect(status.writer).toBe("unsupported");
  });

  it("answers each API as it resolves and gives up on one that hangs", async () => {
    const { env } = mockEnv();
    env.LanguageModel = { availability: () => new Promise(() => {}), create: async () => ({}) } as unknown as typeof LanguageModel;
    const engine = createLocalAIEngine({ env, language: "en" });
    const heard: string[] = [];
    const status = await engine.status((api) => heard.push(api), 30);
    expect(status.prompt).toBe("unavailable");
    expect(status.summarizer).toBe("available");
    expect(heard).toHaveLength(7);
    expect(heard.indexOf("summarizer")).toBeLessThan(heard.indexOf("prompt"));
  });

  it("falls back to English for a language the model does not take", () => {
    expect(make({}, "de").engine.language).toBe("en");
    expect(make({}, "es-MX").engine.language).toBe("es");
  });
});

describe("summarize", () => {
  it("runs through the Summarizer", async () => {
    const { engine } = make();
    const res = await engine.run({ task: "summarize", input: "hello world", options: { type: "tldr" } });
    expect(res.data).toBe("S(11)!");
    expect(res.meta).toMatchObject({ task: "summarize", api: "summarizer", fallback: false });
  });

  it("streams chunks and completes meta", async () => {
    const { engine } = make();
    const stream = engine.stream({ task: "summarize", input: "abc" });
    const chunks: string[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    expect(chunks).toEqual(["S(3)", "!"]);
    expect(stream.meta.api).toBe("summarizer");
  });

  it("makes one summary per chunk and one over the partials", async () => {
    const { engine, calls } = make();
    const text = Array.from({ length: 6 }, (_, i) => `Paragraph ${i} ${"x".repeat(80)}`).join("\n\n");
    const events: number[] = [];
    engine.on("progress", (p) => events.push(p.done));
    const res = await engine.run({ task: "summarize-long", input: text, options: { chunkSize: 200 } });
    expect(res.data.partials.length).toBeGreaterThan(1);
    expect(calls.summaries.length).toBe(res.data.partials.length + 1);
    expect(events.at(-1)).toBe(res.data.partials.length + 1);
  });
});

describe("translate", () => {
  it("translates a supported pair", async () => {
    const { engine } = make();
    const res = await engine.run({ task: "translate", input: "hi", options: { source: "en", target: "es" } });
    expect(res.data).toBe("[en>es] hi");
  });

  it("drops the regional variant when only the base pair exists", async () => {
    const { engine } = make();
    const res = await engine.run({ task: "translate", input: "oi", options: { source: "pt_BR", target: "en" } });
    expect(res.data).toBe("[pt>en] oi");
  });

  it("says when the pair is unsupported", async () => {
    const { engine } = make();
    await expect(
      engine.run({ task: "translate", input: "x", options: { source: "en", target: "ca" } }),
    ).rejects.toMatchObject({ code: "unavailable" });
  });

  it("refuses the same language on both sides", async () => {
    const { engine } = make();
    await expect(
      engine.run({ task: "translate", input: "x", options: { source: "en", target: "en" } }),
    ).rejects.toMatchObject({ code: "invalid-input" });
  });

  it("detects, then translates", async () => {
    const { engine } = make({ detected: [{ detectedLanguage: "pt", confidence: 0.8 }, { detectedLanguage: "es", confidence: 0.1 }] });
    const res = await engine.run({ task: "universal-translate", input: "olá", options: { target: "en" } });
    expect(res.data).toMatchObject({ detected: { language: "pt" }, translation: "[pt>en] olá", skipped: false });
  });

  it("skips the translation when the text is already in the target", async () => {
    const { engine } = make();
    const res = await engine.run({ task: "universal-translate", input: "hello", options: { target: "en" } });
    expect(res.data).toMatchObject({ skipped: true, translation: "hello" });
  });
});

describe("prompt tasks", () => {
  it("parses JSON, also when the model fences it", async () => {
    const { engine } = make({ answer: '```json\n{"a":1}\n```' });
    const res = await engine.run({ task: "json", input: "x", options: { schema: { type: "object" } } });
    expect(res.data).toEqual({ a: 1 });
  });

  it("rejects an answer that is not JSON", async () => {
    const { engine } = make({ answer: "sorry, no" });
    await expect(
      engine.run({ task: "json", input: "x", options: { schema: { type: "object" } } }),
    ).rejects.toMatchObject({ code: "invalid-output" });
  });

  it("answers on a throwaway clone and shares one base session", async () => {
    const { engine, calls } = make({ answer: "yes" });
    await engine.run({ task: "prompt", input: "a" });
    await engine.run({ task: "prompt", input: "b" });
    expect(calls.created.prompt).toBe(1);
    expect(calls.clones).toBe(2);
    expect(calls.destroyed).toBe(2);
  });

  it("extracts only the fields asked for, without duplicates", async () => {
    const { engine } = make({ answer: JSON.stringify({ emails: ["a@b.c", "a@b.c"], phones: ["1"], names: [], urls: [], dates: [] }) });
    const res = await engine.run({ task: "extract", input: "x", options: { fields: ["emails"] } });
    expect(res.data.emails).toEqual(["a@b.c"]);
    expect(res.data.phones).toEqual([]);
  });
});

describe("fallbacks", () => {
  it("writes with the Prompt API when Writer is missing", async () => {
    const { engine } = make({ answer: "Dear team" });
    const res = await engine.run({ task: "write", input: "an email", options: { tone: "formal" } });
    expect(res.data).toBe("Dear team");
    expect(res.meta).toMatchObject({ api: "prompt", fallback: true });
  });

  it("proofreads with the Prompt API and locates each correction", async () => {
    const answer = JSON.stringify({
      corrected: "I have a dog.",
      corrections: [{ original: "has", correction: "have", type: "grammar", explanation: "Subject-verb agreement" }],
    });
    const { engine } = make({ answer });
    const res = await engine.run({ task: "proofread", input: "I has a dog." });
    expect(res.meta.fallback).toBe(true);
    expect(res.data.corrections[0]).toMatchObject({ startIndex: 2, endIndex: 5, types: ["grammar"] });
  });
});

describe("errors, abort and events", () => {
  it("fails fast when the signal is already aborted", async () => {
    const { engine } = make();
    const controller = new AbortController();
    controller.abort();
    await expect(
      engine.run({ task: "summarize", input: "x", signal: controller.signal }),
    ).rejects.toMatchObject({ code: "aborted" });
  });

  it("stops a stream when the signal aborts", async () => {
    const { engine } = make({ answer: "one two three four" });
    const controller = new AbortController();
    const stream = engine.stream({ task: "prompt", input: "x", signal: controller.signal });
    const got: string[] = [];
    await expect(
      (async () => {
        for await (const chunk of stream) {
          got.push(chunk);
          controller.abort();
        }
      })(),
    ).rejects.toBeInstanceOf(AIEngineError);
    expect(got.length).toBe(1);
  });

  it("names a missing API", async () => {
    const { engine } = make({ without: ["Summarizer"] });
    await expect(engine.run({ task: "summarize", input: "x" })).rejects.toMatchObject({ code: "unsupported" });
  });

  it("maps a refused download to needs-user-activation", async () => {
    const { engine } = make({ createError: new DOMException("no gesture", "NotAllowedError") });
    await expect(engine.prepare("summarize")).rejects.toMatchObject({ code: "needs-user-activation" });
  });

  it("emits download progress while a model is prepared", async () => {
    const { engine } = make();
    const seen: unknown[] = [];
    engine.on("download", (e) => seen.push(e));
    await engine.prepare("detect");
    expect(seen).toEqual([{ api: "detector", progress: 0.5 }]);
  });
});

describe("chat", () => {
  it("keeps a session, streams, reports usage and can be cloned", async () => {
    const { engine } = make({ answer: "hello there" });
    const chat = await engine.chat({ system: "be brief", history: [{ role: "user", content: "hi" }] });
    expect(await chat.send("hey")).toBe("hello there");
    let text = "";
    for await (const chunk of chat.stream("again")) text += chunk;
    expect(text).toBe("hello there");
    expect(chat.usage).toEqual({ used: 10, quota: 100 });
    const copy = await chat.clone();
    expect(copy).not.toBe(chat);
    engine.dispose();
  });
});
