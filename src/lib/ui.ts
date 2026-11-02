import { AIEngineError, messageFor, type ApiName, type ApiAvailability, type LocalAIEngine, type ResultMeta, type TaskStream } from "@engine";
import { DEMOS, demoBySlug } from "../data/demos";
import { getEngine } from "./engine";

export function $<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export const $$ = <T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

export interface DemoContext {
  root: HTMLElement;
  engine: LocalAIEngine;
  runner: Runner;
}

/**
 * Starts a demo when its page is shown and cleans up when the page is left.
 * With the client router a page script runs once, so it listens to the router's events.
 */
export function onDemo(slug: string, setup: (ctx: DemoContext) => void | (() => void)): void {
  let cleanup: (() => void) | void;
  document.addEventListener("astro:before-swap", () => {
    cleanup?.();
    cleanup = undefined;
  });
  document.addEventListener("astro:page-load", () => {
    const root = document.querySelector<HTMLElement>(`[data-demo="${slug}"]`);
    if (!root) return;
    const engine = getEngine();
    const runner = createRunner(root, engine);
    const stopStatus = showApiStatus(root, engine, slug);
    const stop = setup({ root, engine, runner });
    cleanup = () => {
      runner.stop();
      runner.dispose();
      stopStatus();
      stop?.();
    };
  });
}

/* Status tags and the "not supported" alert in the page header */

const TAG: Record<ApiAvailability, [string, string]> = {
  available: ["green", "Ready"],
  downloadable: ["blue", "Needs download"],
  downloading: ["yellow", "Downloading"],
  unavailable: ["red", "Unavailable"],
  unsupported: ["gray", "Not in this browser"],
};

export function setTag(el: HTMLElement, state: ApiAvailability): void {
  const [color, label] = TAG[state];
  el.className = `luz-tag luz-tag--${color} luz-tag--dot`;
  el.textContent = label;
  el.dataset.state = state;
}

function showApiStatus(root: HTMLElement, engine: LocalAIEngine, slug: string): () => void {
  let live = true;
  const demo = demoBySlug(slug);
  const status: Partial<Record<ApiName, ApiAvailability>> = {};
  const showAlert = () => {
    const missing = demo.requires.filter((api) => status[api] === "unsupported" || status[api] === "unavailable");
    const alert = root.querySelector<HTMLElement>("[data-unsupported]");
    if (alert && missing.length) {
      alert.hidden = false;
      $$(root, "[data-run]").forEach((button) => ((button as HTMLButtonElement).disabled = true));
    }
  };
  void engine.status((api, state) => {
    if (!live) return;
    status[api] = state;
    for (const tag of $$(root, `[data-api-tag="${api}"]`)) setTag(tag, state);
    showAlert();
  });
  return () => {
    live = false;
  };
}

/* The run bar: Run, Stop, download progress, errors and the result line */

export interface Runner {
  run(task: (signal: AbortSignal) => Promise<void>): Promise<void>;
  stop(): void;
  setMeta(meta: ResultMeta | null): void;
  dispose(): void;
}

export function showError(root: ParentNode, err: unknown): void {
  const box = root.querySelector<HTMLElement>("[data-error]");
  if (!box) return;
  if (err instanceof AIEngineError && err.code === "aborted") {
    box.hidden = true;
    return;
  }
  const message = err instanceof AIEngineError ? err.message : messageFor("unknown");
  const body = box.querySelector<HTMLElement>("[data-error-text]");
  if (body) body.textContent = message;
  box.hidden = false;
}

export function createRunner(root: HTMLElement, engine: LocalAIEngine): Runner {
  const runButton = root.querySelector<HTMLButtonElement>("[data-run]");
  const stopButton = root.querySelector<HTMLButtonElement>("[data-stop]");
  const progress = root.querySelector<HTMLProgressElement>("[data-download]");
  const metaLine = root.querySelector<HTMLElement>("[data-meta]");
  const error = root.querySelector<HTMLElement>("[data-error]");
  let controller: AbortController | null = null;

  const offDownload = engine.on("download", ({ api, progress: value }) => {
    if (!progress) return;
    progress.hidden = value >= 1;
    progress.value = Math.round(value * 100);
    progress.setAttribute("aria-label", `Downloading the ${api} model, ${progress.value}%`);
  });

  const busy = (on: boolean) => {
    if (runButton) runButton.disabled = on;
    if (stopButton) stopButton.hidden = !on;
    root.toggleAttribute("aria-busy", on);
  };

  const setMeta = (meta: ResultMeta | null) => {
    if (!metaLine) return;
    metaLine.hidden = !meta;
    if (!meta) return;
    const via = meta.fallback ? `${meta.api} API (fallback)` : `${meta.api} API`;
    metaLine.textContent = `${via} · ${meta.ms} ms`;
  };

  const stop = () => controller?.abort();
  stopButton?.addEventListener("click", stop);

  return {
    async run(task) {
      controller?.abort();
      const mine = (controller = new AbortController());
      busy(true);
      if (error) error.hidden = true;
      setMeta(null);
      try {
        await task(mine.signal);
      } catch (err) {
        showError(root, err);
      } finally {
        if (controller === mine) controller = null;
        busy(false);
        if (progress) progress.hidden = true;
      }
    },
    stop,
    setMeta,
    dispose() {
      offDownload();
      stopButton?.removeEventListener("click", stop);
    },
  };
}

/* Output */

/** Appends a stream to an element as it arrives. Markdown lists are drawn as lists. */
export async function streamInto(
  el: HTMLElement,
  stream: TaskStream,
  runner?: Runner,
  options: { markdown?: boolean } = {},
): Promise<string> {
  let text = "";
  el.textContent = "";
  for await (const chunk of stream) {
    text += chunk;
    if (options.markdown) renderMarkdown(el, text);
    else el.textContent = text;
  }
  runner?.setMeta(stream.meta);
  return text;
}

/** A small subset of Markdown (paragraphs, bullets, bold), built as DOM so nothing is injected as HTML. */
export function renderMarkdown(el: HTMLElement, text: string): void {
  el.replaceChildren();
  let list: HTMLUListElement | null = null;
  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*[*-]\s+(.*)$/);
    if (bullet) {
      list ??= el.appendChild(document.createElement("ul"));
      appendInline(list.appendChild(document.createElement("li")), bullet[1] ?? "");
    } else if (line.trim()) {
      list = null;
      appendInline(el.appendChild(document.createElement("p")), line.trim());
    } else {
      list = null;
    }
  }
}

function appendInline(parent: HTMLElement, text: string): void {
  text.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      parent.appendChild(document.createElement("strong")).textContent = part.slice(2, -2);
    } else if (part) {
      parent.appendChild(document.createTextNode(part));
    }
  });
}

export function showJson(code: HTMLElement, value: unknown): void {
  code.textContent = JSON.stringify(value, null, 2);
  code.closest("[data-json-panel]")?.removeAttribute("hidden");
}

export function bindRange(range: HTMLInputElement): void {
  const out = document.getElementById(range.dataset.output ?? "");
  const sync = () => out && (out.textContent = range.value);
  range.addEventListener("input", sync);
  sync();
}

export function fillSelect(select: HTMLSelectElement, options: string[]): void {
  select.replaceChildren(...options.map((o) => new Option(o, o)));
}

/** The text of the demo samples, in the engine's language. */
export const language = (): string => getEngine().language;

export { DEMOS };

/** Draws a text with each correction marked; hovering a mark says what changed and why. */
export function renderCorrections(
  el: HTMLElement,
  text: string,
  corrections: { startIndex: number; endIndex: number; original: string; correction: string; types: string[]; explanation: string }[],
): void {
  el.replaceChildren();
  let cursor = 0;
  for (const c of [...corrections].sort((a, b) => a.startIndex - b.startIndex)) {
    if (c.startIndex < cursor) continue;
    el.append(text.slice(cursor, c.startIndex));
    const mark = el.appendChild(document.createElement("mark"));
    mark.className = "fix";
    mark.textContent = text.slice(c.startIndex, c.endIndex);
    mark.title = `${c.original} → ${c.correction}${c.types.length ? ` (${c.types.join(", ")})` : ""}${c.explanation ? `: ${c.explanation}` : ""}`;
    cursor = c.endIndex;
  }
  el.append(text.slice(cursor));
}

/** The rows of a corrections table. */
export function correctionRows(
  corrections: { original: string; correction: string; types: string[]; explanation: string }[],
): HTMLTableRowElement[] {
  return corrections.map((c) => {
    const tr = document.createElement("tr");
    const cells: [string, string][] = [
      ["Original", c.original],
      ["Correction", c.correction],
      ["Type", c.types.join(", ") || "-"],
      ["Why", c.explanation || "-"],
    ];
    for (const [label, value] of cells) {
      const td = tr.appendChild(document.createElement("td"));
      td.dataset.label = label;
      td.appendChild(document.createElement("div")).textContent = value;
    }
    return tr;
  });
}
