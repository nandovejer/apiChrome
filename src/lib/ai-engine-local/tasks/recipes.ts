import type { ExtractField, JsonSchema, TaskName, TaskSpec } from "../types";
import type { Handler } from "./context";
import { promptJson, promptStream, warmPrompt, withLanguage } from "./prompt-core";

const strings = { type: "array", items: { type: "string" } } as const;
const object = (properties: Record<string, unknown>): JsonSchema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const CATEGORIES = ["hate", "harassment", "violence", "sexual", "self-harm", "spam", "profanity", "other"];
const FIELDS: ExtractField[] = ["emails", "phones", "names", "urls", "dates"];

function recipeHandler<T extends TaskName>(
  run: Handler<T>["run"],
): Handler<T> {
  return { api: "prompt", warm: (ctx) => warmPrompt(ctx), run };
}

function streamHandler<T extends TaskName>(
  stream: Handler<T>["stream"],
  image = false,
): Handler<T> {
  return { api: "prompt", warm: (ctx) => warmPrompt(ctx, image), stream };
}

export const prompt: Handler<"prompt"> = streamHandler((ctx, input, { system }) =>
  promptStream(ctx, system, input),
);

export const json: Handler<"json"> = recipeHandler((ctx, input, { schema, system }) =>
  promptJson(
    ctx,
    withLanguage(ctx, system ?? "Answer only with JSON that follows the schema."),
    input,
    schema,
  ),
);

export const classify: Handler<"classify"> = recipeHandler(async (ctx, input, { labels }) => {
  const schema = object({ label: { type: "string", enum: labels }, reason: { type: "string" } });
  const system = withLanguage(
    ctx,
    `Classify the message into exactly one of: ${labels.join(", ")}. Give the label and a one-sentence reason.`,
  );
  return (await promptJson(ctx, system, input, schema)) as TaskSpec["classify"]["output"];
});

export const extract: Handler<"extract"> = recipeHandler(async (ctx, input, { fields = FIELDS }) => {
  const schema = object(Object.fromEntries(FIELDS.map((f) => [f, strings])));
  const system = `Extract only what is written in the text, never invent anything. Fill ${fields.join(", ")}; leave the other lists empty.`;
  const raw = (await promptJson(ctx, system, input, schema)) as Partial<Record<ExtractField, string[]>>;
  return Object.fromEntries(
    FIELDS.map((f) => [f, fields.includes(f) ? [...new Set(raw[f] ?? [])] : []]),
  ) as TaskSpec["extract"]["output"];
});

export const tags: Handler<"tags"> = recipeHandler(async (ctx, input, { max = 8 }) => {
  const schema = object({ tags: strings, keywords: strings });
  const system = withLanguage(
    ctx,
    `Give up to ${max} short lowercase tags (topics) and up to ${max} keywords (terms from the text).`,
  );
  const raw = (await promptJson(ctx, system, input, schema)) as TaskSpec["tags"]["output"];
  return { tags: raw.tags.slice(0, max), keywords: raw.keywords.slice(0, max) };
});

export const moderate: Handler<"moderate"> = recipeHandler((ctx, input) => {
  const schema = object({
    flagged: { type: "boolean" },
    categories: { type: "array", items: { type: "string", enum: CATEGORIES } },
    reason: { type: "string" },
  });
  const system = withLanguage(
    ctx,
    "You moderate user content. Flag it only when it is clearly hateful, harassing, violent, sexual, self-harming, spam or profane. Explain in one sentence.",
  );
  return promptJson(ctx, system, input, schema) as Promise<TaskSpec["moderate"]["output"]>;
});

export const describe: Handler<"describe"> = streamHandler((ctx, input, { tone = "friendly" }) =>
  promptStream(
    ctx,
    withLanguage(
      ctx,
      `You write product descriptions for an online shop, ${tone} in tone, 60 to 90 words. Use only the facts given: invent nothing.`,
    ),
    input,
  ),
);

export const questions: Handler<"questions"> = recipeHandler(async (ctx, input, { count = 5 }) => {
  const schema = object({
    questions: {
      type: "array",
      items: object({ question: { type: "string" }, answer: { type: "string" } }),
    },
  });
  const system = withLanguage(
    ctx,
    `Write ${count} study questions about the text, each with a short answer found in the text.`,
  );
  const raw = (await promptJson(ctx, system, input, schema)) as TaskSpec["questions"]["output"];
  return { questions: raw.questions.slice(0, count) };
});

export const synonyms: Handler<"synonyms"> = recipeHandler(async (ctx, input, { count = 6 }) => {
  const schema = object({
    synonyms: { type: "array", items: object({ word: { type: "string" }, nuance: { type: "string" } }) },
  });
  const system = withLanguage(
    ctx,
    `Give ${count} synonyms of the word or phrase, each with a few words on how its meaning differs.`,
  );
  const raw = (await promptJson(ctx, system, input, schema)) as TaskSpec["synonyms"]["output"];
  return { synonyms: raw.synonyms.slice(0, count) };
});

export const weather: Handler<"weather"> = streamHandler((ctx, input) =>
  promptStream(
    ctx,
    withLanguage(
      ctx,
      "You turn weather data into two or three friendly sentences for a person, and say what to wear. Use only the data given.",
    ),
    input,
  ),
);

export const image: Handler<"image"> = streamHandler((ctx, input, { question }) => {
  const content = [
    { type: "text" as const, value: question?.trim() || "Describe this image." },
    { type: "image" as const, value: input },
  ];
  return promptStream(ctx, withLanguage(ctx, "You look at images and answer about them."), [
    { role: "user", content },
  ], true);
}, true);

export const simplify: Handler<"simplify"> = streamHandler((ctx, input, { audience = "a general reader" }) =>
  promptStream(
    ctx,
    withLanguage(
      ctx,
      `Rewrite the text in plain, short sentences for ${audience}. Keep the meaning. Return only the new text.`,
    ),
    input,
  ),
);

export const tone: Handler<"tone"> = streamHandler((ctx, input, { tone: wanted }) =>
  promptStream(
    ctx,
    withLanguage(ctx, `Rewrite the text in a ${wanted} tone. Keep the meaning. Return only the new text.`),
    input,
  ),
);

