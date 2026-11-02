import type { TaskName } from "../types";
import type { Handler } from "./context";
import * as language from "./language";
import * as recipes from "./recipes";
import * as summary from "./summarize";
import * as writing from "./writing";

export const handlers: { [T in TaskName]: Handler<T> } = {
  prompt: recipes.prompt,
  json: recipes.json,
  classify: recipes.classify,
  extract: recipes.extract,
  tags: recipes.tags,
  moderate: recipes.moderate,
  describe: recipes.describe,
  questions: recipes.questions,
  synonyms: recipes.synonyms,
  weather: recipes.weather,
  image: recipes.image,
  summarize: summary.summarize,
  "summarize-long": summary.summarizeLong,
  detect: language.detect,
  translate: language.translate,
  "universal-translate": language.universalTranslate,
  proofread: writing.proofread,
  write: writing.write,
  rewrite: writing.rewrite,
  simplify: recipes.simplify,
  tone: recipes.tone,
};
