import { AIEngineError, messageFor, normalizeError } from "../errors";
import { languageName } from "../languages";
import { collect, readChunks } from "../stream";
import type { JsonSchema } from "../types";
import type { CallContext } from "./context";

export function withLanguage(ctx: CallContext, system: string): string {
  return `${system}\nWrite in ${languageName(ctx.language)}.`;
}

/** Runs `fn` on a throwaway clone, so the cached session never accumulates history. */
async function withClone<R>(
  ctx: CallContext,
  system: string | undefined,
  image: boolean,
  fn: (session: LanguageModel) => Promise<R>,
): Promise<R> {
  const base = await ctx.adapters.prompt.get({ system, image }, ctx.signal);
  const session = await base.clone({ signal: ctx.signal });
  try {
    return await fn(session);
  } finally {
    session.destroy();
  }
}

export async function* promptStream(
  ctx: CallContext,
  system: string | undefined,
  input: LanguageModelPrompt,
  image = false,
): AsyncGenerator<string> {
  const base = await ctx.adapters.prompt.get({ system, image }, ctx.signal);
  const session = await base.clone({ signal: ctx.signal });
  try {
    yield* readChunks(session.promptStreaming(input, { signal: ctx.signal }), ctx.signal, "prompt");
  } finally {
    session.destroy();
  }
}

export function promptText(ctx: CallContext, system: string | undefined, input: string): Promise<string> {
  return collect(promptStream(ctx, system, input));
}

export function parseJson(text: string): unknown {
  const body = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    return JSON.parse(body);
  } catch (err) {
    throw new AIEngineError("invalid-output", messageFor("invalid-output"), "prompt", err);
  }
}

export async function promptJson(
  ctx: CallContext,
  system: string,
  input: string,
  schema: JsonSchema,
): Promise<unknown> {
  try {
    const text = await withClone(ctx, system, false, (session) =>
      session.prompt(input, { responseConstraint: schema, signal: ctx.signal }),
    );
    return parseJson(text);
  } catch (err) {
    throw normalizeError(err, "prompt");
  }
}

export function warmPrompt(ctx: CallContext, image = false): Promise<unknown> {
  return ctx.adapters.prompt.get({ image }, ctx.signal);
}
