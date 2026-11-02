import { normalizeError } from "../errors";
import { readChunks } from "../stream";
import type { ChatMessage, ChatUsage } from "../types";
import type { Adapters } from "../adapters";

export interface ChatOptions {
  system?: string;
  history?: ChatMessage[];
}

export interface Chat {
  send(text: string, options?: { signal?: AbortSignal }): Promise<string>;
  stream(text: string, options?: { signal?: AbortSignal }): AsyncGenerator<string>;
  /** A new chat that starts with this one's conversation. */
  clone(): Promise<Chat>;
  readonly usage: ChatUsage;
  destroy(): void;
}

class LocalChat implements Chat {
  constructor(
    private session: LanguageModel,
    private onDestroy: (chat: Chat) => void,
  ) {}

  async send(text: string, { signal }: { signal?: AbortSignal } = {}): Promise<string> {
    try {
      return await this.session.prompt(text, { signal });
    } catch (err) {
      throw normalizeError(err, "prompt");
    }
  }

  stream(text: string, { signal }: { signal?: AbortSignal } = {}): AsyncGenerator<string> {
    return readChunks(this.session.promptStreaming(text, { signal }), signal, "prompt");
  }

  async clone(): Promise<Chat> {
    return new LocalChat(await this.session.clone(), this.onDestroy);
  }

  get usage(): ChatUsage {
    const s = this.session;
    return { used: s.contextUsage ?? s.inputUsage ?? 0, quota: s.contextWindow ?? s.inputQuota ?? 0 };
  }

  destroy(): void {
    this.session.destroy();
    this.onDestroy(this);
  }
}

export async function createChat(
  adapters: Adapters,
  { system, history }: ChatOptions,
  onDestroy: (chat: Chat) => void,
  signal?: AbortSignal,
): Promise<Chat> {
  const base = await adapters.prompt.get({ system }, signal);
  const session = await base.clone({ signal });
  if (history?.length) await session.append(history, { signal });
  return new LocalChat(session, onDestroy);
}
