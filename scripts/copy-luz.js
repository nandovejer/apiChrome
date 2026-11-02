// Copy the Luz DS build from node_modules into vendor/luz/, because GitHub Pages
// serves the repo as-is and never runs npm install.
import { cpSync, mkdirSync, rmSync } from "node:fs";

const out = "vendor/luz";
const files = [
  ["node_modules/@luz-ds/tokens/dist/luz-tokens.min.css", "luz-tokens.min.css"],
  ["node_modules/@luz-ds/tokens/dist/fonts", "fonts"], // luz-tokens.css loads ./fonts/*
  ["node_modules/@luz-ds/core/dist/luz.min.css", "luz.min.css"],
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const [from, to] of files) cpSync(from, `${out}/${to}`, { recursive: true });
console.log(`Luz DS copied to ${out}/`);
