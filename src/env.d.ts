/// <reference types="astro/client" />

declare module "@luz-ds/core" {
  export function initCopyButtons(defer?: boolean): void;
  export function initTabs(root?: ParentNode, defer?: boolean): void;
}
