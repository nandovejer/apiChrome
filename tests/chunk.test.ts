import { describe, expect, it } from "vitest";
import { chunkText, locateCorrections, normalizeLangTag } from "@engine";

describe("chunkText", () => {
  it("returns short text whole and nothing for blank text", () => {
    expect(chunkText("hello", 100)).toEqual(["hello"]);
    expect(chunkText("   ")).toEqual([]);
  });

  it("packs paragraphs without passing the size", () => {
    const text = ["a".repeat(60), "b".repeat(60), "c".repeat(60)].join("\n\n");
    const chunks = chunkText(text, 130);
    expect(chunks).toHaveLength(2);
    expect(chunks.every((c) => c.length <= 130)).toBe(true);
  });

  it("splits a paragraph that is too long on its sentences, and a sentence that is too long by size", () => {
    const sentences = chunkText("One two three. Four five six. Seven eight nine.", 20);
    expect(sentences.every((c) => c.length <= 20)).toBe(true);
    expect(chunkText("x".repeat(50), 20).map((c) => c.length)).toEqual([20, 20, 10]);
  });
});

describe("helpers", () => {
  it("normalizes language tags", () => {
    expect(normalizeLangTag("pt_br")).toBe("pt-BR");
    expect(normalizeLangTag("ZH-cn")).toBe("zh-CN");
  });

  it("locates corrections in order and skips the ones it cannot find", () => {
    const out = locateCorrections("teh cat sat on teh mat", [
      { original: "teh", correction: "the", type: "spelling", explanation: "" },
      { original: "teh", correction: "the", type: "spelling", explanation: "" },
      { original: "dog", correction: "cat", type: "spelling", explanation: "" },
    ]);
    expect(out.map((c) => c.startIndex)).toEqual([0, 15]);
  });
});
