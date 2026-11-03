import type { ApiAvailability, ApiName } from "@engine";
import { m } from "../i18n/client";
import { evaluate, readBrowser, type CheckId, type CheckStatus, type DetailKey, type Verdict } from "./compat";

const TAG: Record<CheckStatus, string> = { ok: "green", warn: "yellow", fail: "red", info: "blue" };
const ALERT: Record<Verdict, [string, string]> = { compatible: ["success", "✓"], check: ["warning", "!"], incompatible: ["error", "×"] };

/** The answer of the FAQ that helps with each check. */
const HELP: Record<CheckId, string> = {
  browser: "faq-browser",
  system: "faq-browser",
  apis: "faq-unavailable",
  model: "faq-unavailable",
  cores: "faq-hardware",
  memory: "faq-hardware",
  gpu: "faq-hardware",
};

type Sentence = (...args: (string | number)[]) => string;

/**
 * Fills the compatibility panel of the page: the verdict and one row per check. It reads the browser's own
 * data (`navigator`) and the state of each API that the engine already asked Chrome for.
 */
export async function renderCompat(root: ParentNode, states: Promise<Record<ApiName, ApiAvailability>>): Promise<void> {
  const box = root.querySelector<HTMLElement>("[data-compat]");
  if (!box) return;
  const [info, resolved] = await Promise.all([readBrowser(), states]);
  if (!box.isConnected) return;

  const t = m().compat;
  const report = evaluate(info, resolved);

  const verdict = box.querySelector<HTMLElement>("[data-compat-verdict]");
  const [tone, icon] = ALERT[report.verdict];
  if (verdict) {
    verdict.className = `luz-alert luz-alert--${tone}`;
    verdict.querySelector("[data-compat-icon]")!.textContent = icon;
    verdict.querySelector("[data-compat-title]")!.textContent = t.verdicts[report.verdict].title;
    verdict.querySelector("[data-compat-body]")!.textContent = t.verdicts[report.verdict].body;
  }

  const links = box.querySelector<HTMLElement>("[data-compat-links]");
  if (links) links.hidden = report.verdict === "compatible";

  const rows = report.checks.map((check) => {
    const tr = document.createElement("tr");
    const sentence = t.detail[check.detail as DetailKey] as Sentence;
    const tag = document.createElement("span");
    tag.className = `luz-tag luz-tag--${TAG[check.status]} luz-tag--dot`;
    tag.textContent = t.status[check.status];
    // A row that says "Check" or "No" points to the answer that tells what to do.
    const detail: (string | HTMLElement)[] = [sentence(...check.args)];
    if (check.status === "warn" || check.status === "fail") {
      const help = document.createElement("a");
      help.href = `#${HELP[check.id]}`;
      help.textContent = t.help;
      detail.push(" ", help);
    }
    const cells: [string, string | HTMLElement | (string | HTMLElement)[]][] = [
      [t.colCheck, t.rows[check.id]],
      [t.colResult, tag],
      [t.colDetail, detail],
    ];
    for (const [label, value] of cells) {
      const td = tr.appendChild(document.createElement("td"));
      td.dataset.label = label;
      const inner = td.appendChild(document.createElement("div"));
      if (typeof value === "string") inner.textContent = value;
      else inner.append(...(Array.isArray(value) ? value : [value]));
    }
    return tr;
  });
  box.querySelector("[data-compat-rows]")?.replaceChildren(...rows);
  box.querySelector<HTMLElement>("[data-compat-table]")!.hidden = false;
}
