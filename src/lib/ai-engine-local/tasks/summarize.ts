import { chunkText } from "../chunk";
import { readChunks } from "../stream";
import type { SummarizeOptions } from "../types";
import type { SummarizerOptions } from "../adapters/summarizer";
import type { CallContext, Handler } from "./context";

function resolve(options: SummarizeOptions): SummarizerOptions {
  return {
    type: options.type ?? "key-points",
    length: options.length ?? "medium",
    format: options.format ?? "markdown",
    context: options.context,
  };
}

export const summarize: Handler<"summarize"> = {
  api: "summarizer",
  warm: (ctx, options) => ctx.adapters.summarizer.get(resolve(options), ctx.signal),
  async *stream(ctx, input, options) {
    const opts = resolve(options);
    const summarizer = await ctx.adapters.summarizer.get(opts, ctx.signal);
    yield* readChunks(
      summarizer.summarizeStreaming(input, { context: opts.context, signal: ctx.signal }),
      ctx.signal,
      "summarizer",
    );
  },
};

async function summarizeOnce(ctx: CallContext, input: string, opts: SummarizerOptions): Promise<string> {
  const summarizer = await ctx.adapters.summarizer.get(opts, ctx.signal);
  return summarizer.summarize(input, { context: opts.context, signal: ctx.signal });
}

/** Summary of summaries: one summary per chunk, then one over the partials. */
export const summarizeLong: Handler<"summarize-long"> = {
  api: "summarizer",
  warm: (ctx, options) => ctx.adapters.summarizer.get(resolve(options), ctx.signal),
  async run(ctx, input, { chunkSize, ...options }) {
    const final = resolve(options);
    const chunks = chunkText(input, chunkSize);
    if (chunks.length <= 1) {
      return { summary: await summarizeOnce(ctx, input, final), partials: [] };
    }
    const partialOpts: SummarizerOptions = { ...final, type: "tldr", length: "medium", format: "plain-text" };
    const partials: string[] = [];
    for (const [i, chunk] of chunks.entries()) {
      ctx.emitter.emit("progress", { task: ctx.task, done: i, total: chunks.length + 1 });
      partials.push(await summarizeOnce(ctx, chunk, partialOpts));
    }
    ctx.emitter.emit("progress", { task: ctx.task, done: chunks.length, total: chunks.length + 1 });
    const summary = await summarizeOnce(ctx, partials.join("\n\n"), final);
    ctx.emitter.emit("progress", { task: ctx.task, done: chunks.length + 1, total: chunks.length + 1 });
    return { summary, partials };
  },
};
