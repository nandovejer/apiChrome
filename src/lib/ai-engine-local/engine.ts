import { createAdapters } from "./adapters";
import { Emitter } from "./events";
import { AIEngineError, normalizeError, throwIfAborted } from "./errors";
import { modelLanguage } from "./languages";
import { collect } from "./stream";
import { handlers } from "./tasks";
import { createChat, type Chat, type ChatOptions } from "./tasks/chat";
import type { CallContext, Handler } from "./tasks/context";
import {
  API_NAMES,
  type AIEnvironment,
  type ApiName,
  type ApiStatus,
  type EngineConfig,
  type EngineEvents,
  type ResultMeta,
  type StreamableTask,
  type TaskName,
  type TaskRequest,
  type TaskResult,
  type TaskSpec,
} from "./types";

/** The text of a streaming task. `meta` is complete once the iteration ends. */
export class TaskStream implements AsyncIterable<string> {
  constructor(
    private source: AsyncIterable<string>,
    readonly meta: ResultMeta,
    private started: number,
  ) {}

  async *[Symbol.asyncIterator](): AsyncGenerator<string> {
    try {
      yield* this.source;
    } finally {
      this.meta.ms = Math.round(performance.now() - this.started);
    }
  }

  text(): Promise<string> {
    return collect(this);
  }
}

export interface LocalAIEngine {
  readonly language: string;
  /**
   * Availability of each API on this device. `onEach` hears each answer as it arrives, so a slow
   * API does not hold the others back; one that takes over `timeoutMs` counts as unavailable.
   */
  status(onEach?: (api: ApiName, state: ApiStatus[ApiName]) => void, timeoutMs?: number): Promise<ApiStatus>;
  /** Starts the model download for a task. Call it from a click. */
  prepare<T extends TaskName>(task: T, options?: TaskSpec[T]["options"], signal?: AbortSignal): Promise<void>;
  run<T extends TaskName>(request: TaskRequest<T>): Promise<TaskResult<T>>;
  stream<T extends StreamableTask>(request: TaskRequest<T>): TaskStream;
  chat(options?: ChatOptions, signal?: AbortSignal): Promise<Chat>;
  on<K extends keyof EngineEvents>(event: K, handler: (payload: EngineEvents[K]) => void): () => void;
  /** Destroys every cached model instance and open chat. */
  dispose(): void;
}

function defaultLanguage(): string {
  return modelLanguage(typeof navigator === "undefined" ? "en" : navigator.language);
}

export function createLocalAIEngine(config: EngineConfig = {}): LocalAIEngine {
  const env = config.env ?? (globalThis as unknown as AIEnvironment);
  const language = modelLanguage(config.language ?? defaultLanguage());
  const emitter = new Emitter();
  const adapters = createAdapters({ env, emitter, language });
  const chats = new Set<Chat>();

  const context = <T extends TaskName>(task: T, handler: Handler<T>, signal?: AbortSignal): CallContext => ({
    adapters,
    emitter,
    language,
    task,
    signal,
    meta: { api: handler.api, fallback: false },
  });

  const handlerFor = <T extends TaskName>(task: T): Handler<T> => {
    const handler = handlers[task] as Handler<T> | undefined;
    if (!handler) throw new AIEngineError("invalid-input", `Unknown task: ${task}`);
    return handler;
  };

  const otherLanguage = language === "en" ? "es" : "en";

  return {
    language,

    async status(onEach, timeoutMs = 5000) {
      const probe = async (api: ApiName): Promise<ApiStatus[ApiName]> => {
        try {
          switch (api) {
            case "prompt": return await adapters.prompt.availability({});
            case "summarizer": return await adapters.summarizer.availability({ type: "key-points", length: "medium", format: "markdown" });
            case "translator": return await adapters.translator.availability({ source: language, target: otherLanguage });
            case "detector": return await adapters.detector.availability();
            case "proofreader": return await adapters.proofreader.availability({ explain: true });
            case "writer": return await adapters.writer.availability({ tone: "neutral", length: "medium" });
            case "rewriter": return await adapters.rewriter.availability({ tone: "as-is", length: "as-is" });
          }
        } catch {
          return "unavailable";
        }
      };
      const timeout = new Promise<"unavailable">((resolve) => setTimeout(() => resolve("unavailable"), timeoutMs));
      const entries = await Promise.all(
        API_NAMES.map(async (api) => {
          const state = await Promise.race([probe(api), timeout]);
          onEach?.(api, state);
          return [api, state] as const;
        }),
      );
      return Object.fromEntries(entries) as ApiStatus;
    },

    async prepare(task, options, signal) {
      const handler = handlerFor(task);
      try {
        throwIfAborted(signal);
        await handler.warm(context(task, handler, signal), (options ?? {}) as TaskSpec[typeof task]["options"]);
      } catch (err) {
        throw normalizeError(err, handler.api);
      }
    },

    async run<T extends TaskName>(request: TaskRequest<T>): Promise<TaskResult<T>> {
      const started = performance.now();
      const handler = handlerFor(request.task);
      const ctx = context(request.task, handler, request.signal);
      const options = ((request as { options?: unknown }).options ?? {}) as TaskSpec[T]["options"];
      try {
        throwIfAborted(request.signal);
        const data = handler.run
          ? await handler.run(ctx, request.input, options)
          : ((await collect(handler.stream!(ctx, request.input, options))) as TaskSpec[T]["output"]);
        return {
          data,
          meta: { task: request.task, ...ctx.meta, ms: Math.round(performance.now() - started) },
        };
      } catch (err) {
        throw normalizeError(err, ctx.meta.api);
      }
    },

    stream<T extends StreamableTask>(request: TaskRequest<T>): TaskStream {
      const started = performance.now();
      const handler = handlerFor(request.task);
      const ctx = context(request.task, handler, request.signal);
      const options = ((request as { options?: unknown }).options ?? {}) as TaskSpec[T]["options"];
      const meta: ResultMeta = { task: request.task, ...ctx.meta, ms: 0 };
      async function* source(): AsyncGenerator<string> {
        try {
          throwIfAborted(request.signal);
          for await (const chunk of handler.stream!(ctx, request.input, options)) {
            Object.assign(meta, ctx.meta);
            yield chunk;
          }
          Object.assign(meta, ctx.meta);
        } catch (err) {
          throw normalizeError(err, ctx.meta.api);
        }
      }
      return new TaskStream(source(), meta, started);
    },

    async chat(options = {}, signal) {
      try {
        const chat = await createChat(adapters, options, (c) => chats.delete(c), signal);
        chats.add(chat);
        return chat;
      } catch (err) {
        throw normalizeError(err, "prompt");
      }
    },

    on: (event, handler) => emitter.on(event, handler),

    dispose() {
      for (const chat of [...chats]) chat.destroy();
      for (const adapter of Object.values(adapters)) adapter.clear();
    },
  };
}

