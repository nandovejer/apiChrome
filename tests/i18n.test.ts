import { describe, expect, it } from "vitest";
import { DEMOS, RESOURCES } from "../src/data/demos";
import { guides } from "../src/i18n/guides";
import { LANGS, langOfPath, messages, pageHref, swapLang } from "../src/i18n";

/** The paths of an object down to its leaves, to compare the shape of two languages. */
function shape(value: unknown, path = ""): string[] {
  if (typeof value === "function") return [path];
  if (Array.isArray(value)) return [`${path}[${value.length}]`];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  return [path];
}

describe("languages", () => {
  it("has the same texts in every language", () => {
    const [first, ...rest] = LANGS;
    for (const lang of rest) {
      expect(shape(messages[lang]), lang).toEqual(shape(messages[first!]));
      expect(shape(guides[lang].home), lang).toEqual(shape(guides[first!].home));
      expect(shape(guides[lang].faq), lang).toEqual(shape(guides[first!].faq));
    }
  });

  it("explains every demo: what it does and how to use it", () => {
    for (const lang of LANGS) {
      for (const { slug } of DEMOS) {
        const guide = guides[lang].demos[slug];
        expect(guide?.title, `${lang}/${slug} title`).toBeTruthy();
        expect(guide?.summary, `${lang}/${slug} summary`).toBeTruthy();
        if (slug) {
          expect(guide?.what, `${lang}/${slug} what`).toBeTruthy();
          expect(guide?.how.length, `${lang}/${slug} how`).toBeGreaterThan(1);
        }
      }
      for (const { id } of RESOURCES) expect(guides[lang].resources[id]?.note, `${lang}/${id}`).toBeTruthy();
    }
  });
});

describe("faq", () => {
  it("has unique ids and an answer for every question", () => {
    for (const lang of LANGS) {
      const items = guides[lang].faq.groups.flatMap((group) => group.items);
      expect(new Set(items.map((item) => item.id)).size, lang).toBe(items.length);
      for (const item of items) {
        expect(item.q, `${lang}/${item.id}`).toBeTruthy();
        expect(item.a.length, `${lang}/${item.id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("paths", () => {
  it("builds and reads language paths", () => {
    expect(pageHref("es", "prompt")).toMatch(/\/es\/prompt\/$/);
    expect(langOfPath(pageHref("es", "prompt"))).toBe("es");
    expect(langOfPath("/something-else/")).toBe("en");
    expect(swapLang(pageHref("es", "prompt"), "en")).toBe(pageHref("en", "prompt"));
  });
});
