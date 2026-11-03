import type { ApiAvailability, ApiName } from "@engine";

/** The first Chrome with the Summarizer, Translator and Language Detector APIs. */
export const MIN_CHROME = 138;

/** The APIs that are stable; the others (Proofreader, Writer, Rewriter) may be missing in a good setup. */
const STABLE: ApiName[] = ["prompt", "summarizer", "translator", "detector"];

export type CheckStatus = "ok" | "warn" | "fail" | "info";
export type CheckId = "browser" | "system" | "apis" | "model" | "cores" | "memory" | "gpu";
export type Verdict = "compatible" | "check" | "incompatible";

/** What a row says: the key of a sentence in the texts, and the values it takes. */
export type DetailKey =
  | "browserChrome" | "browserOld" | "browserChromium" | "browserOther"
  | "systemDesktop" | "systemMobile" | "systemChromeOS" | "systemUnknown"
  | "apisAll" | "apisOptional" | "apisSome" | "apisNone"
  | "modelReady" | "modelDownload" | "modelDownloading" | "modelUnavailable" | "modelNone"
  | "coresOk" | "coresLow" | "coresUnknown"
  | "memoryUnknown" | "memoryLow" | "memoryCapped" | "memoryOk"
  | "gpuAdapter" | "gpuNone" | "gpuUnsupported";

export interface Check {
  id: CheckId;
  status: CheckStatus;
  detail: DetailKey;
  args: (string | number)[];
}

export interface CompatReport {
  verdict: Verdict;
  checks: Check[];
}

/** What the page can read from the browser. All optional: a browser leaves out what it does not have. */
export interface BrowserInfo {
  userAgent: string;
  /** `navigator.userAgentData.brands` */
  brands?: { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  cores?: number;
  /** `navigator.deviceMemory`: Chrome rounds it down to a power of two, and the spec caps it at 8. */
  memoryGb?: number;
  gpu: { state: "adapter" | "none" | "unsupported"; name?: string };
}

interface NavigatorLike {
  userAgent: string;
  userAgentData?: { brands?: { brand: string; version: string }[]; mobile?: boolean; platform?: string };
  hardwareConcurrency?: number;
  deviceMemory?: number;
  gpu?: { requestAdapter(): Promise<{ info?: { description?: string; vendor?: string } } | null> };
}

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

/** Reads the browser's own data: user agent, client hints, cores, memory hint and a WebGPU adapter. */
export async function readBrowser(nav: NavigatorLike = navigator as unknown as NavigatorLike): Promise<BrowserInfo> {
  const gpu: BrowserInfo["gpu"] = { state: "unsupported" };
  if (nav.gpu) {
    try {
      const adapter = await withTimeout(nav.gpu.requestAdapter(), 2500, null);
      gpu.state = adapter ? "adapter" : "none";
      const name = adapter?.info?.description || adapter?.info?.vendor;
      if (name) gpu.name = name;
    } catch {
      gpu.state = "none";
    }
  }
  return {
    userAgent: nav.userAgent,
    brands: nav.userAgentData?.brands,
    mobile: nav.userAgentData?.mobile,
    platform: nav.userAgentData?.platform,
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    gpu,
  };
}

const GENERIC_BRAND = /not.?a.?brand|^chromium$/i;

function browserCheck(info: BrowserInfo): Check {
  const chrome = info.brands?.find((b) => b.brand === "Google Chrome");
  if (chrome) {
    const version = Number.parseInt(chrome.version, 10);
    return version >= MIN_CHROME
      ? { id: "browser", status: "ok", detail: "browserChrome", args: [version] }
      : { id: "browser", status: "fail", detail: "browserOld", args: [version, MIN_CHROME] };
  }
  const chromium = info.brands?.find((b) => b.brand === "Chromium");
  if (chromium) {
    const other = info.brands?.find((b) => !GENERIC_BRAND.test(b.brand));
    return { id: "browser", status: "warn", detail: "browserChromium", args: [other?.brand ?? "Chromium", Number.parseInt(chromium.version, 10)] };
  }
  // No client hints: Firefox, Safari, or a Chrome too old to have them.
  const ua = info.userAgent;
  const match = /Chrome\/(\d+)/.exec(ua);
  if (match && !/Edg\/|OPR\/|Firefox\//.test(ua)) {
    const version = Number(match[1]);
    return version >= MIN_CHROME
      ? { id: "browser", status: "ok", detail: "browserChrome", args: [version] }
      : { id: "browser", status: "fail", detail: "browserOld", args: [version, MIN_CHROME] };
  }
  const name = /Firefox\//.test(ua) ? "Firefox" : /Edg\//.test(ua) ? "Edge" : /Safari\//.test(ua) ? "Safari" : "?";
  return { id: "browser", status: "fail", detail: "browserOther", args: [name] };
}

function systemCheck(info: BrowserInfo): Check {
  const ua = info.userAgent;
  const platform =
    info.platform ||
    (/Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /CrOS/.test(ua) ? "Chrome OS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "");
  const mobile = info.mobile ?? /Android|iPhone|iPad|Mobile/.test(ua);
  if (mobile || platform === "Android" || platform === "iOS") return { id: "system", status: "fail", detail: "systemMobile", args: [platform || "mobile"] };
  if (platform === "Chrome OS" || platform === "ChromeOS") return { id: "system", status: "warn", detail: "systemChromeOS", args: [] };
  if (["Windows", "macOS", "Linux"].includes(platform)) return { id: "system", status: "ok", detail: "systemDesktop", args: [platform] };
  return { id: "system", status: "warn", detail: "systemUnknown", args: [platform || "?"] };
}

function apisCheck(states: Record<ApiName, ApiAvailability>): Check {
  const all = Object.keys(states) as ApiName[];
  const present = all.filter((api) => states[api] !== "unsupported");
  const missing = all.filter((api) => states[api] === "unsupported");
  const stablePresent = STABLE.filter((api) => present.includes(api));
  const args = [present.length, all.length];
  if (!missing.length) return { id: "apis", status: "ok", detail: "apisAll", args };
  if (stablePresent.length === STABLE.length) return { id: "apis", status: "ok", detail: "apisOptional", args: [...args, missing.join(", ")] };
  if (stablePresent.length) return { id: "apis", status: "warn", detail: "apisSome", args: [...args, STABLE.filter((api) => !present.includes(api)).join(", ")] };
  return { id: "apis", status: "fail", detail: "apisNone", args };
}

function modelCheck(states: Record<ApiName, ApiAvailability>): Check {
  const state = states.prompt;
  switch (state) {
    case "available": return { id: "model", status: "ok", detail: "modelReady", args: [] };
    case "downloadable": return { id: "model", status: "info", detail: "modelDownload", args: [] };
    case "downloading": return { id: "model", status: "info", detail: "modelDownloading", args: [] };
    case "unavailable": return { id: "model", status: "fail", detail: "modelUnavailable", args: [] };
    default: return { id: "model", status: "fail", detail: "modelNone", args: [] };
  }
}

function hardwareChecks(info: BrowserInfo): Check[] {
  const cores: Check =
    info.cores === undefined
      ? { id: "cores", status: "info", detail: "coresUnknown", args: [] }
      : info.cores >= 4
        ? { id: "cores", status: "ok", detail: "coresOk", args: [info.cores] }
        : { id: "cores", status: "warn", detail: "coresLow", args: [info.cores] };
  const memory: Check =
    info.memoryGb === undefined
      ? { id: "memory", status: "info", detail: "memoryUnknown", args: [] }
      : info.memoryGb < 8
        ? { id: "memory", status: "warn", detail: "memoryLow", args: [info.memoryGb] }
        : info.memoryGb < 16
          ? { id: "memory", status: "info", detail: "memoryCapped", args: [info.memoryGb] }
          : { id: "memory", status: "ok", detail: "memoryOk", args: [info.memoryGb] };
  const gpu: Check =
    info.gpu.state === "adapter"
      ? { id: "gpu", status: "ok", detail: "gpuAdapter", args: [info.gpu.name ?? ""] }
      : info.gpu.state === "none"
        ? { id: "gpu", status: "warn", detail: "gpuNone", args: [] }
        : { id: "gpu", status: "warn", detail: "gpuUnsupported", args: [] };
  return [cores, memory, gpu];
}

/**
 * Decides, from what the browser says, whether it can run the built-in AI.
 * A failed requirement means "incompatible"; a warning means "check it". Hardware warnings only count while
 * the model is not already available, because an available model has shown that the device can run it.
 */
export function evaluate(info: BrowserInfo, states: Record<ApiName, ApiAvailability>): CompatReport {
  const required = [browserCheck(info), systemCheck(info), apisCheck(states), modelCheck(states)];
  const hardware = hardwareChecks(info);
  const checks = [...required, ...hardware];
  const modelReady = states.prompt === "available";
  const counted = modelReady ? required : checks;
  const verdict: Verdict = counted.some((c) => c.status === "fail") ? "incompatible" : counted.some((c) => c.status === "warn") ? "check" : "compatible";
  return { verdict, checks };
}
