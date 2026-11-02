import { AIEngineError } from "../errors";
import { baseLanguage, normalizeLangTag } from "../languages";
import { collect, readChunks } from "../stream";
import type { Detection } from "../types";
import type { CallContext, Handler } from "./context";

interface Pair {
  source: string;
  target: string;
}

/** The pair the browser can translate: as asked, or with the regional variants dropped. */
async function resolvePair(ctx: CallContext, source: string, target: string): Promise<Pair> {
  const wanted = { source: normalizeLangTag(source), target: normalizeLangTag(target) };
  if (baseLanguage(wanted.source) === baseLanguage(wanted.target) && wanted.source === wanted.target) {
    throw new AIEngineError("invalid-input", "Source and target cannot be the same.", "translator");
  }
  const { translator } = ctx.adapters;
  if ((await translator.availability(wanted)) !== "unavailable") return wanted;
  const base = { source: baseLanguage(wanted.source), target: baseLanguage(wanted.target) };
  if (base.source !== wanted.source || base.target !== wanted.target) {
    const state = await translator.availability(base);
    if (state !== "unavailable" && state !== "unsupported") return base;
  }
  throw new AIEngineError("unavailable", `Unsupported pair: ${wanted.source} → ${wanted.target}`, "translator");
}

export const translate: Handler<"translate"> = {
  api: "translator",
  warm: async (ctx, { source, target }) =>
    ctx.adapters.translator.get(await resolvePair(ctx, source, target), ctx.signal),
  async *stream(ctx, input, { source, target }) {
    const pair = await resolvePair(ctx, source, target);
    const translator = await ctx.adapters.translator.get(pair, ctx.signal);
    yield* readChunks(translator.translateStreaming(input, { signal: ctx.signal }), ctx.signal, "translator");
  },
};

async function detectLanguages(ctx: CallContext, input: string): Promise<Detection[]> {
  const detector = await ctx.adapters.detector.get(undefined, ctx.signal);
  const results = await detector.detect(input, { signal: ctx.signal });
  return results
    .filter((r): r is { detectedLanguage: string; confidence?: number } => Boolean(r.detectedLanguage))
    .map((r) => ({ language: r.detectedLanguage, confidence: r.confidence ?? 0 }))
    .sort((a, b) => b.confidence - a.confidence);
}

export const detect: Handler<"detect"> = {
  api: "detector",
  warm: (ctx) => ctx.adapters.detector.get(undefined, ctx.signal),
  run: (ctx, input) => detectLanguages(ctx, input),
};

export const universalTranslate: Handler<"universal-translate"> = {
  api: "translator",
  warm: (ctx) => ctx.adapters.detector.get(undefined, ctx.signal),
  async run(ctx, input, { target }) {
    const [top] = await detectLanguages(ctx, input);
    const same = top && baseLanguage(top.language) === baseLanguage(target);
    if (!top || top.language === "und" || same) {
      return { detected: top ?? null, translation: input, skipped: true };
    }
    ctx.meta.api = "translator";
    const pair = await resolvePair(ctx, top.language, target);
    const translator = await ctx.adapters.translator.get(pair, ctx.signal);
    const translation = await collect(
      readChunks(translator.translateStreaming(input, { signal: ctx.signal }), ctx.signal, "translator"),
    );
    return { detected: top, translation, skipped: false };
  },
};

