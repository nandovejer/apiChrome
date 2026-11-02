# 🤖 Chrome Local AI

Demos de las **APIs de IA integradas de Chrome** (Gemini Nano): todo se ejecuta en tu dispositivo, sin servidor y, una vez descargado el modelo, sin conexión. Hecho con **[Astro](https://astro.build/)**, **TypeScript** y **[Luz DS](https://github.com/nandovejer/luz)**.

## ✨ Demos

| Ruta | Qué hace | API |
|---|---|---|
| `/` | Estado de las 7 APIs en tu navegador y descarga de modelos | todas |
| `/toolkit/` | Un texto, varias acciones (resumir, traducir, corregir, simplificar, reescribir) con los resultados para comparar | Summarizer, Translator, Prompt |
| `/prompt/` | Playground con streaming | Prompt |
| `/chat/` | Chat con historial, botón de parar y varias sesiones que se pueden bifurcar | Prompt |
| `/json/` | Datos estructurados que siguen un JSON Schema | Prompt |
| `/recipes/` | Clasificar, extraer, etiquetar, moderar, describir productos, preguntas | Prompt |
| `/synonyms/` | Buscador de sinónimos | Prompt |
| `/weather/` | Datos del tiempo → texto | Prompt |
| `/image/` | Preguntas sobre una imagen | Prompt multimodal |
| `/summarize/` | tldr, key-points, teaser, headline | Summarizer |
| `/summary-of-summaries/` | Trocea un texto largo, resume cada parte y resume los resúmenes | Summarizer |
| `/translate/` | Detecta el idioma y traduce | Language Detector + Translator |
| `/proofread/` | Correcciones marcadas, con tipo y explicación | Proofreader |
| `/write/` | Escribir y reescribir | Writer / Rewriter |
| `/assistant/` | Editor que corrige y cambia el tono | Proofreader + Prompt |

## ⚠️ Requisitos

Chrome de escritorio reciente con Gemini Nano (Chrome 138+ para Summarizer, Translator y Language Detector). Los modelos se descargan la primera vez, tras un clic (**Prepare** en la página de estado). Mira `chrome://on-device-internals` si algo falla. Proofreader, Writer y Rewriter son experimentales u obsoletas: cuando faltan, el motor usa la Prompt API y lo indica (`fallback`).

## 🚀 Desarrollo

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev        # servidor local
npm test           # tests del motor (Vitest, con mocks de las APIs)
npm run typecheck  # tsc --noEmit
npm run check      # luz-check: valida las clases de Luz DS
npm run build      # genera dist/
```

## 🧠 `ai-engine-local`

El motor es un módulo TypeScript en [src/lib/ai-engine-local/](src/lib/ai-engine-local/) que **corre en el navegador**: Gemini Nano solo existe ahí, así que no hay un endpoint de servidor. Es el punto de entrada único para todas las demos.

```ts
import { createLocalAIEngine } from "@engine";

const engine = createLocalAIEngine({ language: "es" });

await engine.status((api, state) => console.log(api, state)); // disponibilidad de cada API
engine.on("download", ({ api, progress }) => {});              // progreso de descarga
await engine.prepare("summarize");                             // descarga el modelo (desde un clic)

const res = await engine.run({ task: "summarize", input, options: { type: "key-points" }, signal });
// res.data, res.meta = { task, api, fallback, ms }

for await (const chunk of engine.stream({ task: "prompt", input, signal })) {}

const chat = await engine.chat({ system: "Sé breve" });         // send, stream, clone, usage, destroy
engine.dispose();
```

Cada `task` está tipada (opciones y resultado): `prompt`, `json`, `classify`, `extract`, `tags`, `moderate`, `describe`, `questions`, `synonyms`, `weather`, `image`, `summarize`, `summarize-long`, `detect`, `translate`, `universal-translate`, `proofread`, `write`, `rewrite`, `simplify`, `tone`.

Resuelve en un solo sitio: caché de instancias por opciones, sesiones de usar y tirar (`clone()`) para las tareas sin estado, alternativas a la Prompt API, variantes regionales de idioma (`pt-BR` → `pt`), cancelación con `AbortSignal` y errores normalizados (`AIEngineError`: `unsupported`, `unavailable`, `needs-user-activation`, `aborted`, `quota-exceeded`, `invalid-output`, `invalid-input`).

La temperatura y el `topK` no se exponen: Chrome los limita a extensiones.

## 📚 Créditos

* **[Luz DS](https://github.com/nandovejer/luz):** sistema de diseño (`@luz-ds/tokens`, `core` y `catalog`).
* **[Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in)** y los [Web AI demos](https://chrome.dev/web-ai-demos/) en los que se basan las demos.
