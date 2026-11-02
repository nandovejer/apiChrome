import { AIEngineError, messageFor, normalizeError } from "./errors";
import type { ApiName } from "./types";

/** A ReadableStream of text chunks as an async iterable, cancelled when the signal aborts. */
export async function* readChunks(
  stream: ReadableStream<string>,
  signal?: AbortSignal,
  api?: ApiName,
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const onAbort = () => void reader.cancel().catch(() => {});
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    while (true) {
      if (signal?.aborted) throw new AIEngineError("aborted", messageFor("aborted"), api);
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } catch (err) {
    throw normalizeError(err, api);
  } finally {
    signal?.removeEventListener("abort", onAbort);
    reader.releaseLock();
  }
}

export async function collect(chunks: AsyncIterable<string>): Promise<string> {
  return (await Array.fromAsync(chunks)).join("");
}

/** Races a promise against the signal so a click on Stop answers at once. */
export function withAbort<T>(promise: Promise<T>, signal?: AbortSignal, api?: ApiName): Promise<T> {
  if (!signal) return promise;
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new AIEngineError("aborted", messageFor("aborted"), api));
    if (signal.aborted) return abort();
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
