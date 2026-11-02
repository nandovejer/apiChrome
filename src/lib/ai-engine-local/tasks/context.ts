import type { Adapter } from "../adapters/base";
import type { Adapters } from "../adapters";
import type { Emitter } from "../events";
import type { ApiName, TaskName, TaskSpec } from "../types";

export interface CallContext {
  adapters: Adapters;
  emitter: Emitter;
  language: string;
  task: TaskName;
  signal: AbortSignal | undefined;
  meta: { api: ApiName; fallback: boolean };
}

export interface Handler<T extends TaskName> {
  /** The API that normally does the work. */
  api: ApiName;
  /** Starts the model download without running the task. */
  warm(ctx: CallContext, options: TaskSpec[T]["options"]): Promise<unknown>;
  run?(
    ctx: CallContext,
    input: TaskSpec[T]["input"],
    options: TaskSpec[T]["options"],
  ): Promise<TaskSpec[T]["output"]>;
  stream?(
    ctx: CallContext,
    input: TaskSpec[T]["input"],
    options: TaskSpec[T]["options"],
  ): AsyncIterable<string>;
}

/** True when the dedicated API exists and its model can be used or downloaded. */
export async function dedicatedReady<O>(adapter: Adapter<O, unknown>, opts: O): Promise<boolean> {
  const state = await adapter.availability(opts).catch(() => "unsupported" as const);
  return state !== "unsupported" && state !== "unavailable";
}

export function markFallback(ctx: CallContext, from: ApiName): void {
  ctx.meta.api = "prompt";
  ctx.meta.fallback = true;
  ctx.emitter.emit("fallback", { task: ctx.task, from, to: "prompt" });
}
