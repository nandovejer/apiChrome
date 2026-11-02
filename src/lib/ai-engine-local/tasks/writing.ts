import type { RewriterOptions } from "../adapters/rewriter";
import type { WriterOptions } from "../adapters/writer";
import { readChunks } from "../stream";
import type { Correction, ProofreadOutput, TaskSpec } from "../types";
import { dedicatedReady, markFallback, type Handler } from "./context";
import { promptJson, promptStream, warmPrompt, withLanguage } from "./prompt-core";

const writerOpts = (o: TaskSpec["write"]["options"]): WriterOptions => ({
  tone: o.tone ?? "neutral",
  length: o.length ?? "medium",
  context: o.context,
});

const rewriterOpts = (o: TaskSpec["rewrite"]["options"]): RewriterOptions => ({
  tone: o.tone ?? "as-is",
  length: o.length ?? "as-is",
  context: o.context,
});

/** Writer is deprecated: when it is missing, the Prompt API writes. */
export const write: Handler<"write"> = {
  api: "writer",
  warm: async (ctx, options) =>
    (await dedicatedReady(ctx.adapters.writer, writerOpts(options)))
      ? ctx.adapters.writer.get(writerOpts(options), ctx.signal)
      : warmPrompt(ctx),
  async *stream(ctx, input, options) {
    const opts = writerOpts(options);
    if (await dedicatedReady(ctx.adapters.writer, opts)) {
      const writer = await ctx.adapters.writer.get(opts, ctx.signal);
      yield* readChunks(writer.writeStreaming(input, { context: opts.context, signal: ctx.signal }), ctx.signal, "writer");
      return;
    }
    markFallback(ctx, "writer");
    const system = withLanguage(
      ctx,
      `You write texts on request. Tone: ${opts.tone}. Length: ${opts.length}. ${opts.context ? `Context: ${opts.context}.` : ""} Return only the text.`,
    );
    yield* promptStream(ctx, system, input);
  },
};

const REWRITE_TONE = { "as-is": "the same", "more-formal": "a more formal", "more-casual": "a more casual" } as const;
const REWRITE_LENGTH = { "as-is": "about the same length", shorter: "shorter", longer: "longer" } as const;

/** Rewriter is deprecated: when it is missing, the Prompt API rewrites. */
export const rewrite: Handler<"rewrite"> = {
  api: "rewriter",
  warm: async (ctx, options) =>
    (await dedicatedReady(ctx.adapters.rewriter, rewriterOpts(options)))
      ? ctx.adapters.rewriter.get(rewriterOpts(options), ctx.signal)
      : warmPrompt(ctx),
  async *stream(ctx, input, options) {
    const opts = rewriterOpts(options);
    if (await dedicatedReady(ctx.adapters.rewriter, opts)) {
      const rewriter = await ctx.adapters.rewriter.get(opts, ctx.signal);
      yield* readChunks(rewriter.rewriteStreaming(input, { context: opts.context, signal: ctx.signal }), ctx.signal, "rewriter");
      return;
    }
    markFallback(ctx, "rewriter");
    const system = withLanguage(
      ctx,
      `Rewrite the text in ${REWRITE_TONE[opts.tone]} tone, ${REWRITE_LENGTH[opts.length]}. Keep the meaning. Return only the new text.`,
    );
    yield* promptStream(ctx, system, input);
  },
};

interface Found {
  original: string;
  correction: string;
  type: string;
  explanation: string;
}

/** Finds each correction in the input, in order, to give it a position. */
export function locateCorrections(input: string, found: Found[]): Correction[] {
  const out: Correction[] = [];
  let cursor = 0;
  for (const item of found) {
    if (!item.original) continue;
    const start = input.indexOf(item.original, cursor);
    if (start < 0) continue;
    const end = start + item.original.length;
    out.push({
      startIndex: start,
      endIndex: end,
      original: item.original,
      correction: item.correction,
      types: item.type ? [item.type] : [],
      explanation: item.explanation,
    });
    cursor = end;
  }
  return out;
}

const PROOF_SCHEMA = {
  type: "object",
  properties: {
    corrected: { type: "string" },
    corrections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          correction: { type: "string" },
          type: { type: "string", enum: ["spelling", "punctuation", "capitalization", "preposition", "missing-words", "grammar"] },
          explanation: { type: "string" },
        },
        required: ["original", "correction", "type", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["corrected", "corrections"],
  additionalProperties: false,
};

/** Proofreader is experimental: when it is missing, the Prompt API proofreads. */
export const proofread: Handler<"proofread"> = {
  api: "proofreader",
  warm: async (ctx, { explain = true }) =>
    (await dedicatedReady(ctx.adapters.proofreader, { explain }))
      ? ctx.adapters.proofreader.get({ explain }, ctx.signal)
      : warmPrompt(ctx),
  async run(ctx, input, { explain = true }): Promise<ProofreadOutput> {
    if (await dedicatedReady(ctx.adapters.proofreader, { explain })) {
      const proofreader = await ctx.adapters.proofreader.get({ explain }, ctx.signal);
      const result = await proofreader.proofread(input, { signal: ctx.signal });
      return {
        corrected: result.correctedInput,
        corrections: result.corrections.map((c) => ({
          startIndex: c.startIndex,
          endIndex: c.endIndex,
          original: input.slice(c.startIndex, c.endIndex),
          correction: c.correction,
          types: c.types ?? [],
          explanation: c.explanation ?? "",
        })),
      };
    }
    markFallback(ctx, "proofreader");
    const system = withLanguage(
      ctx,
      "You proofread text: fix spelling, punctuation, capitalization and grammar only, never the style. List each fix in order of appearance, quoting the original words exactly as written.",
    );
    const raw = (await promptJson(ctx, system, input, PROOF_SCHEMA)) as {
      corrected: string;
      corrections: Found[];
    };
    return { corrected: raw.corrected, corrections: locateCorrections(input, raw.corrections) };
  },
};
