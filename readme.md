# Chrome Local AI

Demos de las APIs de IA integradas de Chrome (Gemini Nano). Todo se ejecuta en el dispositivo del usuario: no hay servidor y, una vez descargado el modelo, tampoco hace falta conexión. El sitio es bilingüe (inglés y español) y está construido con [Astro](https://astro.build/), TypeScript y [Luz DS](https://github.com/nandovejer/luz).

## Contenido

- [Demos](#demos)
- [Requisitos](#requisitos)
- [Desarrollo](#desarrollo)
- [Idiomas](#idiomas)
- [Motor `ai-engine-local`](#motor-ai-engine-local)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Créditos](#créditos)

## Demos

Cada demo empieza con una guía que explica qué hace y cómo se usa, paso a paso. Las rutas llevan el idioma delante: `/es/prompt/`, `/en/prompt/`.

| Ruta | Descripción | API |
|---|---|---|
| `/` | Estado de las siete APIs en el navegador y descarga de modelos | Todas |
| `/toolkit/` | Un texto, varias acciones (resumir, traducir, corregir, simplificar, reescribir), con los resultados guardados para compararlos | Summarizer, Translator, Prompt |
| `/prompt/` | Playground con respuesta en streaming | Prompt |
| `/chat/` | Chat con historial, botón de parar y varias sesiones que se pueden bifurcar | Prompt |
| `/json/` | Datos estructurados que siguen un JSON Schema | Prompt |
| `/recipes/` | Clasificar, extraer, etiquetar, moderar, describir productos y generar preguntas | Prompt |
| `/synonyms/` | Sinónimos con la diferencia de matiz entre cada uno | Prompt |
| `/weather/` | Datos meteorológicos convertidos en texto natural | Prompt |
| `/image/` | Preguntas sobre una imagen | Prompt (multimodal) |
| `/summarize/` | Resumen como TL;DR, puntos clave, gancho o titular | Summarizer |
| `/summary-of-summaries/` | Trocea un texto largo, resume cada parte y resume los resúmenes | Summarizer |
| `/translate/` | Detecta el idioma y traduce | Language Detector, Translator |
| `/proofread/` | Correcciones marcadas, con tipo y explicación | Proofreader |
| `/write/` | Escritura y reescritura con tono y longitud | Writer, Rewriter |
| `/assistant/` | Editor que corrige y cambia el tono del texto | Proofreader, Prompt |

## Requisitos

- Chrome de escritorio reciente con Gemini Nano (Chrome 138 o superior para Summarizer, Translator y Language Detector).
- Los modelos se descargan la primera vez y solo tras una acción del usuario: el botón Preparar de la página de estado.
- Si algo falla, `chrome://on-device-internals` muestra el estado del modelo.
- Proofreader es experimental y Writer y Rewriter están obsoletas. Cuando faltan, el motor usa la Prompt API y lo indica en el resultado (`fallback`).

## Desarrollo

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev        # servidor local en http://localhost:4321/apiChrome/
npm test           # tests del motor y de los textos (Vitest, con mocks de las APIs)
npm run typecheck  # tsc --noEmit
npm run check      # luz-check: valida las clases de Luz DS
npm run build      # genera dist/
```

## Idiomas

El sitio está disponible en inglés (`/en/`) y español (`/es/`). La raíz (`/`) redirige al idioma elegido la última vez o, si no hay ninguno, al del navegador. El selector de la barra superior es el componente `luz-lang-switch` de Luz DS: cambia de idioma en la misma página y fija también el idioma de los textos de ejemplo y del modelo.

| Contenido | Ubicación |
|---|---|
| Textos de la interfaz | [src/i18n/en.ts](src/i18n/en.ts) y [src/i18n/es.ts](src/i18n/es.ts). El español usa el tipo del inglés, de modo que una clave ausente no compila |
| Guías de cada demo, descripciones de las APIs y recursos | [src/i18n/guides.ts](src/i18n/guides.ts). Solo las lee el servidor: no llegan al navegador |
| Textos de ejemplo para el modelo | [src/data/samples.ts](src/data/samples.ts) |

Para añadir un idioma, se incluye en `LANGS` ([src/i18n/index.ts](src/i18n/index.ts)), se crea su fichero de textos y se añade su entrada en `guides.ts`. El test [tests/i18n.test.ts](tests/i18n.test.ts) comprueba que todos los idiomas tienen las mismas claves y que cada demo está explicada.

## Motor `ai-engine-local`

El motor es un módulo TypeScript en [src/lib/ai-engine-local/](src/lib/ai-engine-local/) que se ejecuta en el navegador: Gemini Nano solo existe ahí, por lo que no hay un endpoint de servidor. Es el único punto de entrada de las demos.

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

Cada `task` está tipada, tanto sus opciones como su resultado: `prompt`, `json`, `classify`, `extract`, `tags`, `moderate`, `describe`, `questions`, `synonyms`, `weather`, `image`, `summarize`, `summarize-long`, `detect`, `translate`, `universal-translate`, `proofread`, `write`, `rewrite`, `simplify` y `tone`.

El motor resuelve en un solo sitio:

- La caché de instancias por opciones.
- Las sesiones de usar y tirar (`clone()`) para las tareas sin estado.
- Las alternativas a la Prompt API cuando falta una API específica.
- Las variantes regionales de idioma (`pt-BR` se resuelve como `pt`).
- La cancelación con `AbortSignal`.
- Los errores normalizados (`AIEngineError`): `unsupported`, `unavailable`, `needs-user-activation`, `aborted`, `quota-exceeded`, `invalid-output` e `invalid-input`.

La temperatura y `topK` no se exponen porque Chrome los limita a extensiones.

## Estructura del proyecto

```text
src/
  components/      componentes Astro compartidos (DemoShell, RunBar, Output, LanguageSelect)
  data/            registro de demos, idiomas del traductor y textos de ejemplo
  i18n/            textos de la interfaz, guías de las demos y utilidades de idioma
  layouts/         AppLayout: barra, menú lateral, selector de idioma y tema
  lib/             motor ai-engine-local y utilidades de interfaz
  pages/[lang]/    una página por demo, generada para cada idioma
  scripts/         lógica de cada demo en el navegador
  styles/          reglas propias sobre los tokens de Luz DS
tests/             Vitest: motor, fragmentación de texto y textos
```

## Créditos

- [Luz DS](https://github.com/nandovejer/luz): sistema de diseño (`@luz-ds/tokens`, `core` y `catalog`).
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) y los [Web AI demos](https://chrome.dev/web-ai-demos/), en los que se basan las demos.
