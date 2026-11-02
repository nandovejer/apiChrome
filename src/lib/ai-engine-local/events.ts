import type { EngineEvents } from "./types";

type Handler<K extends keyof EngineEvents> = (payload: EngineEvents[K]) => void;

export class Emitter {
  private handlers = new Map<keyof EngineEvents, Set<Handler<never>>>();

  on<K extends keyof EngineEvents>(event: K, handler: Handler<K>): () => void {
    const set = this.handlers.get(event) ?? new Set<Handler<never>>();
    set.add(handler as Handler<never>);
    this.handlers.set(event, set);
    return () => set.delete(handler as Handler<never>);
  }

  emit<K extends keyof EngineEvents>(event: K, payload: EngineEvents[K]): void {
    this.handlers.get(event)?.forEach((handler) => (handler as Handler<K>)(payload));
  }
}
