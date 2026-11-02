/** One live instance per key: concurrent callers share the same creation. */
export class InstanceCache<T extends { destroy(): unknown }> {
  private entries = new Map<string, Promise<T>>();

  get(key: string, create: () => Promise<T>): Promise<T> {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = create();
      this.entries.set(key, entry);
      entry.catch(() => this.entries.delete(key));
    }
    return entry;
  }

  get size(): number {
    return this.entries.size;
  }

  clear(): void {
    for (const entry of this.entries.values()) entry.then((item) => item.destroy(), () => {});
    this.entries.clear();
  }
}
