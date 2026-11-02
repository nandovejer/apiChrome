import type { ApiName } from "./types";

export type AIEngineErrorCode =
  | "unsupported"
  | "unavailable"
  | "needs-user-activation"
  | "aborted"
  | "quota-exceeded"
  | "invalid-output"
  | "invalid-input"
  | "unknown";

export class AIEngineError extends Error {
  readonly code: AIEngineErrorCode;
  readonly api: ApiName | undefined;

  constructor(code: AIEngineErrorCode, message: string, api?: ApiName, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "AIEngineError";
    this.code = code;
    this.api = api;
  }
}

const BY_NAME: Record<string, AIEngineErrorCode> = {
  AbortError: "aborted",
  NotAllowedError: "needs-user-activation",
  QuotaExceededError: "quota-exceeded",
  NotSupportedError: "unavailable",
  InvalidStateError: "unavailable",
};

const MESSAGES: Record<AIEngineErrorCode, string> = {
  unsupported: "This browser does not expose the API.",
  unavailable: "The model is not available on this device.",
  "needs-user-activation": "Downloading the model needs a click: press the button and try again.",
  aborted: "Stopped.",
  "quota-exceeded": "The input is too long for the model.",
  "invalid-output": "The model did not return what was asked for.",
  "invalid-input": "The input is not valid for this task.",
  unknown: "Something went wrong.",
};

export function messageFor(code: AIEngineErrorCode): string {
  return MESSAGES[code];
}

export function normalizeError(err: unknown, api?: ApiName): AIEngineError {
  if (err instanceof AIEngineError) return err;
  const name = err instanceof Error ? err.name : "";
  const code = BY_NAME[name] ?? "unknown";
  const detail = err instanceof Error && code === "unknown" ? err.message : MESSAGES[code];
  return new AIEngineError(code, detail, api, err);
}

export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new AIEngineError("aborted", MESSAGES.aborted);
}
