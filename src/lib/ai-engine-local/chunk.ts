function splitSentences(paragraph: string, size: number): string[] {
  const sentences = paragraph.match(/[^.!?。]+[.!?。]*\s*/g) ?? [paragraph];
  const out: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > size) {
      if (current) out.push(current.trim());
      current = "";
      for (let i = 0; i < sentence.length; i += size) out.push(sentence.slice(i, i + size).trim());
    } else if (current.length + sentence.length > size) {
      out.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

/** Splits a long text into chunks of at most `size` characters, on paragraph and sentence edges. */
export function chunkText(text: string, size = 3000): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];
  const pieces = clean
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (p.length <= size ? [p] : splitSentences(p, size)));
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length + 2 > size) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
