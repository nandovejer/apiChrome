import type { ApiAvailability, ApiName } from "@engine";
import { m } from "../i18n/client";
import { evaluate, readBrowser, type CheckStatus, type DetailKey, type Verdict } from "./compat";

const TAG: Record<CheckStatus, string> = { ok: "green", warn: "yellow", fail: "red", info: "blue" };
const ALERT: Record<Verdict, [string, string]> = { compatible: ["success", "✓"], check: ["warning", "!"], incompatible: ["error", "×"] };

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

  const rows = report.checks.map((check) => {
    const tr = document.createElement("tr");
    const sentence = t.detail[check.detail as DetailKey] as Sentence;
    const tag = document.createElement("span");
    tag.className = `luz-tag luz-tag--${TAG[check.status]} luz-tag--dot`;
    tag.textContent = t.status[check.status];
    const cells: [string, string | HTMLElement][] = [
      [t.colCheck, t.rows[check.id]],
      [t.colResult, tag],
      [t.colDetail, sentence(...check.args)],
    ];
    for (const [label, value] of cells) {
      const td = tr.appendChild(document.createElement("td"));
      td.dataset.label = label;
      const inner = td.appendChild(document.createElement("div"));
      if (typeof value === "string") inner.textContent = value;
      else inner.appendChild(value);
    }
    return tr;
  });
  box.querySelector("[data-compat-rows]")?.replaceChildren(...rows);
  box.querySelector<HTMLElement>("[data-compat-table]")!.hidden = false;
}
