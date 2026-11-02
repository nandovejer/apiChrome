import type { ApiName } from "@engine";
import type { Lang } from "./index";

/**
 * What each demo does and how to use it, in each language. Only pages read this file (on the server),
 * so none of it reaches the browser bundle.
 */
export interface DemoGuide {
  title: string;
  /** One line, for the menu, the cards and the top of the page. */
  summary: string;
  what: string;
  /** Numbered steps. */
  how: string[];
  tip?: string;
}

export interface FaqItem {
  id: string;
  q: string;
  /** Paragraphs. Text between backticks is drawn as code. */
  a: string[];
  list?: string[];
}

export interface Faq {
  title: string;
  lead: string;
  groups: { id: string; title: string; items: FaqItem[] }[];
  /** "Not here?" line under the list. */
  more: string;
  moreLink: string;
}

export interface Guides {
  demos: Record<string, DemoGuide>;
  faq: Faq;
  apis: Record<ApiName, { note: string; what: string }>;
  home: {
    intro: string;
    startHeading: string;
    start: string[];
    demosIntro: string;
    apisIntro: string;
  };
  resources: Record<string, { label?: string; note: string }>;
}

const en: Guides = {
  demos: {
    "": {
      title: "Status",
      summary: "Which built-in AI APIs your browser has, and the models on this device.",
      what: "",
      how: [],
    },
    toolkit: {
      title: "Text toolkit",
      summary: "One text, many actions: summarize, translate, proofread, simplify and rewrite, keeping every result to compare.",
      what: "You write or paste a text once and apply different actions to it. Each result is added to a list below, newest first, so you can compare, for example, a short and a long summary of the same text.",
      how: [
        "Type or paste a text in the box, or press “Use a sample”.",
        "Pick an action in the tabs: Summarize (choose type and length), Translate (choose the target language; the source is detected), Proofread, Simplify, or Rewrite (choose the tone).",
        "Press “Run action”. The result streams into a new card that says which API produced it and how long it took.",
        "Change the tab or the options and run it again: the earlier cards stay. “Clear” empties the list.",
      ],
      tip: "A card says “fallback” when the Prompt API stood in for a dedicated API that your Chrome does not have.",
    },
    prompt: {
      title: "Prompt playground",
      summary: "Send any instruction to Gemini Nano and watch the answer appear word by word.",
      what: "The Prompt API is the general-purpose way into the model: it answers questions, writes, rephrases, explains. Here you talk to it directly, with an optional system prompt that sets its role or style.",
      how: [
        "Optional: write a system prompt, who the model should be or how it should answer (“You are a pirate.”).",
        "Write your prompt, or pick one from “Examples” to fill it in.",
        "Press Send. The answer streams in as the model writes it; press Stop to cancel.",
        "Use the Copy button to take the answer with you.",
      ],
      tip: "Each Send is independent: the model does not remember the previous one. For a conversation, use the Local chat.",
    },
    chat: {
      title: "Local chat",
      summary: "A conversation with history, streaming, a stop button and several sessions you can fork.",
      what: "A chat with the on-device model that remembers what was said. You can keep several sessions, fork one to explore two directions from the same point, and watch how much of the model's context is used.",
      how: [
        "Write a message and press Send (or Enter; Shift+Enter adds a line).",
        "The reply streams in. Press Stop to cancel it.",
        "“New” starts an empty session. “Fork” copies the current one so you can continue it a different way. “Delete” removes it. Switch between sessions in the Session list.",
        "“Context used” shows how much of the model's memory the conversation takes. When it is full, start a new session.",
      ],
      tip: "The history is saved in this browser only. The model session is rebuilt from it the next time you write.",
    },
    json: {
      title: "JSON generator",
      summary: "Describe the data you need and get it back as JSON that follows a schema.",
      what: "The Prompt API can be forced to answer in the shape of a JSON Schema (structured output). The answer is data your code can use directly, not free text that needs parsing.",
      how: [
        "Describe the data you need (“Three fictional users with name, email and age”).",
        "Pick a schema preset, or edit the JSON Schema yourself. It must be valid JSON.",
        "Press Generate.",
        "The result appears as formatted JSON. Copy it with the Copy button.",
      ],
      tip: "Try editing the schema: add a field, or remove it from “required”. The model has to follow whatever you write.",
    },
    recipes: {
      title: "Recipes",
      summary: "Small ready-made prompts: classify, extract, tag, moderate, describe and ask questions of a text.",
      what: "Six everyday jobs for a language model. Each one is a small prompt with a fixed answer format, so the result is structured and predictable.",
      how: [
        "Choose a recipe. A line under the list explains what it does.",
        "Replace the sample text with your own.",
        "Set the options that appear for that recipe: the categories, the fields to extract, or how many results.",
        "Press “Run recipe”. A summary line and the structured result (JSON) appear below.",
      ],
      tip: "Classify only picks from the categories you list, so write them the way you want them back.",
    },
    synonyms: {
      title: "Synonym finder",
      summary: "Synonyms of a word or phrase, with how each one differs.",
      what: "A thesaurus gives you a list; the model also tells you the nuance of each option: more formal or colloquial, stronger or weaker, and where it fits.",
      how: [
        "Type a word or a short phrase.",
        "Use the slider to choose how many synonyms you want (3 to 12).",
        "Press “Find synonyms”.",
        "Read the table: each synonym comes with how it differs from your word.",
      ],
    },
    weather: {
      title: "Weather describer",
      summary: "Turn raw weather data into a sentence a person would say.",
      what: "It shows how a language model turns structured data (JSON) into natural text with no template. The data lives in this app, so there is no weather service and no network involved.",
      how: [
        "Pick a city: its sample data fills the box.",
        "Optional: edit any value (temperature, wind, chance of rain…).",
        "Press “Describe the weather”.",
        "Change a value and run it again to see the text adapt.",
      ],
    },
    image: {
      title: "Image analyzer",
      summary: "Ask the model what is in a picture.",
      what: "It uses the image input of the Prompt API (experimental): the model looks at your picture and answers a question about it. The image is processed on your device and never uploaded.",
      how: [
        "Choose an image file. A preview appears.",
        "Write a question, or pick one of the suggestions.",
        "Press Analyze. The answer streams in.",
      ],
      tip: "Image input depends on the Chrome version and the model. If you get an error, the model on your device probably cannot read images yet.",
    },
    summarize: {
      title: "Summarizer",
      summary: "Summarize a text as a TL;DR, key points, a teaser or a headline, in the length you choose.",
      what: "The Summarizer API is a model made for summaries. You decide the style (type), how long it is and whether the result has formatting.",
      how: [
        "Paste the text. A sample article is already loaded.",
        "Choose the type: Key points (bullets), TL;DR (quick overview), Teaser (a hook to make you read) or Headline (a one-line title).",
        "Choose the length (short, medium, long) and the format (Markdown draws lists; plain text does not).",
        "Press Summarize. The summary streams in.",
      ],
      tip: "Short texts give short summaries whatever the length: there is not much to cut.",
    },
    "summary-of-summaries": {
      title: "Summary of summaries",
      summary: "Split a long text into chunks, summarize each, then summarize the summaries.",
      what: "The model can only read so much text at once. For a long document, this technique cuts it into chunks, summarizes each chunk, and then summarizes those partial summaries into a single one.",
      how: [
        "Paste a long text. The sample is an article repeated three times.",
        "Under the box you see how many chunks it will make. The slider changes the size of a chunk.",
        "Choose the type of the final summary.",
        "Press “Summarize in chunks”. A progress bar shows which chunk is being done.",
        "Open “Summary of each chunk” to see the intermediate steps.",
      ],
      tip: "Smaller chunks keep more detail, but need more calls to the model and take longer.",
    },
    translate: {
      title: "Universal translator",
      summary: "Paste text in any language: it is detected and translated to the one you pick.",
      what: "Two APIs work together: the Language Detector guesses the language of your text and the Translator translates it, all on your device. Each language pair downloads its own small model the first time you use it.",
      how: [
        "Type or paste the text. While you type, the detected language appears under the box (once the detector model is downloaded).",
        "Leave Source on “Auto-detect”, or choose the language yourself.",
        "Choose the target language. “Swap languages” exchanges source and target.",
        "Press Translate.",
      ],
      tip: "If the text is already in the target language, nothing is translated and the page says so.",
    },
    proofread: {
      title: "Proofreader",
      summary: "Spelling, punctuation and grammar fixes, each with its type and why.",
      what: "It finds mistakes in your text and returns each correction with its type and, if you want, the reason. It uses the Proofreader API (an origin trial) and falls back to the Prompt API when your Chrome does not have it.",
      how: [
        "Paste the text. The sample has a few mistakes on purpose.",
        "Keep “Explain each correction” on to get the reason for each fix.",
        "Press Proofread.",
        "Read your text with the fixes marked (hover or focus a mark), then the corrected text and the table of corrections.",
      ],
    },
    write: {
      title: "Writer and rewriter",
      summary: "Write from an instruction or rewrite a text in another tone and length.",
      what: "Two modes. Write creates a new text from an instruction. Rewrite changes the tone and the length of a text you already have. Both APIs are deprecated in Chrome: when they are missing, the Prompt API does the job.",
      how: [
        "Write tab: describe what you need (“An email to…”), add context if it helps, choose tone and length, and press Write.",
        "Rewrite tab: paste a text, choose the tone (as is, more formal, more casual) and the length (as is, shorter, longer), and press Rewrite.",
        "The text streams in. Use Stop to cancel and Copy to take it.",
      ],
    },
    assistant: {
      title: "Writing assistant",
      summary: "An editor that corrects, changes the tone or simplifies the text you wrote.",
      what: "A small editor that works on your own text. It proposes a change and you decide whether to accept it, and you can always undo.",
      how: [
        "Write or paste your text in the editor.",
        "Press Correct to fix spelling and grammar, or Make formal, Make friendly, Make concise or Simplify to change the style.",
        "The suggestion appears below. For corrections, a table lists every change.",
        "Press “Replace my text” to accept it (Undo brings your text back), or ignore it and try another action.",
      ],
    },
  },
  faq: {
    title: "Frequently asked questions",
    lead: "Setup, requirements and what to do when a model does not respond.",
    groups: [
      {
        id: "start",
        title: "Getting started",
        items: [
          {
            id: "private",
            q: "Does anything I write leave my device?",
            a: ["No. The models run inside your browser, so the texts and images you use are not sent to any server. The only network use is the first download of each model."],
          },
          {
            id: "browser",
            q: "Which browser and system do I need?",
            a: ["Chrome on desktop: Windows 10 or 11, macOS 13 or later, Linux, or ChromeOS on Chromebook Plus devices. Android and iOS are not supported by these APIs, and the Translator and the Language Detector are desktop only."],
          },
          {
            id: "hardware",
            q: "What hardware and disk space does it need?",
            a: ["These are the requirements Chrome lists. If the free space falls below 10 GB after the download, Chrome removes the model and downloads it again once the requirements are met."],
            list: [
              "At least 22 GB free on the disk that holds your Chrome profile.",
              "A GPU with more than 4 GB of VRAM, or a CPU with 16 GB of RAM and 4 or more cores.",
              "An unmetered connection for the first download.",
            ],
          },
          {
            id: "download",
            q: "How do I download a model?",
            a: ["Open the Status page and press Prepare on the API you want, or just use a demo. Chrome only starts the download after a click or a key press on the page, so it cannot happen by itself. Models are large and can take several minutes."],
          },
          {
            id: "offline",
            q: "Does it work without internet?",
            a: ["Yes, once the model is downloaded. Each language pair of the Translator downloads its own small model the first time you use it."],
          },
        ],
      },
      {
        id: "problems",
        title: "When something does not work",
        items: [
          {
            id: "unavailable",
            q: "A state says “Unavailable” or “Not in this browser”. What do I do?",
            a: [
              "“Not in this browser” means Chrome does not expose that API: use Chrome on desktop and keep it up to date. “Unavailable” means the API exists but the model cannot run on this device, usually because of the hardware or disk requirements.",
              "These are the steps Chrome's guide recommends:",
            ],
            list: [
              "Restart Chrome.",
              "Open `chrome://on-device-internals` and, in the Broker State tab, check that there are no errors.",
              "Open the DevTools console and run `LanguageModel.availability()`. It should return `available`.",
              "If it still fails, wait a little and repeat the steps.",
            ],
          },
          {
            id: "stuck",
            q: "The download does not start or does not finish.",
            a: ["Press Prepare, or the main button of a demo, on the page itself: the download needs a click. Then check that you have enough free disk space and an unmetered connection, and open `chrome://on-device-internals` to see the model and its size."],
          },
          {
            id: "echo",
            q: "The answer repeats my prompt and ends with “End.Model:”.",
            a: [
              "That text is the request itself, sent back by the browser's model without writing any answer; it usually comes back in a few milliseconds. The prompt this site sends is correct, so the problem is in the model Chrome is running, probably a stand-in and not the real Gemini Nano. We have not been able to confirm the cause.",
              "To check it:",
            ],
            list: [
              "Try the Prompt playground with a short text such as “Say hi”. If it also echoes the prompt, the model is the cause.",
              "Open `chrome://on-device-internals` and check the model status: it should show a real model with a version and a size.",
              "Restart Chrome and press Prepare again on the Status page.",
              "Try the same page in Chrome stable on desktop.",
            ],
          },
          {
            id: "image",
            q: "The image analyzer returns an error or nonsense.",
            a: ["Image input is experimental in the Prompt API and depends on the Chrome version and on the model installed on your device. If the Prompt playground works with text, the model may simply not read images yet."],
          },
          {
            id: "fallback",
            q: "Why does a result say “fallback”?",
            a: ["The Proofreader is experimental, and the Writer and the Rewriter are deprecated. When Chrome does not have one of them, the site asks the Prompt API to do the job and marks the result as a fallback. The text is still valid, but it may differ from what the dedicated API would give."],
          },
        ],
      },
      {
        id: "demos",
        title: "About the demos",
        items: [
          {
            id: "languages",
            q: "Which languages does the model understand?",
            a: ["The main model takes English, Spanish and Japanese; Chrome's guide adds German and French from Chrome 149. Choose the model language on the Status page: it also sets the language of the example texts. The Translator covers many more languages."],
          },
          {
            id: "slow",
            q: "Why is the first answer slow?",
            a: ["The first request has to load the model into memory. The following ones start much sooner."],
          },
          {
            id: "flags",
            q: "Do I need to change Chrome flags?",
            a: ["Chrome's getting-started guide lists no flags for these APIs, so try without them first. Experimental APIs, such as the Proofreader, can need extra steps: the setup guide has the current ones."],
          },
        ],
      },
    ],
    more: "Not here?",
    moreLink: "Read Chrome's setup guide",
  },
  apis: {
    prompt: { note: "General-purpose generative AI", what: "Ask the model anything: answers, writing, classification, data in a JSON shape, even images." },
    summarizer: { note: "TL;DR, key points, teaser, headline", what: "Shortens a text in a style and length you choose." },
    translator: { note: "On-device translation, one model per language pair", what: "Translates between languages; each pair downloads its own small model." },
    detector: { note: "Which language a text is in", what: "Says which language a text is written in, with a confidence." },
    proofreader: { note: "Origin trial; falls back to the Prompt API", what: "Finds spelling, punctuation and grammar mistakes and explains them." },
    writer: { note: "Deprecated; falls back to the Prompt API", what: "Writes a new text from an instruction, in a tone and length." },
    rewriter: { note: "Deprecated; falls back to the Prompt API", what: "Rewrites a text in another tone or length." },
  },
  home: {
    intro:
      "Demos of Chrome's built-in AI. A small language model, Gemini Nano, runs inside your browser: there is no server to pay for, nothing you write is uploaded, and once a model is downloaded it works without a connection.",
    startHeading: "How to get started",
    start: [
      "Open this site in Chrome on a computer (Windows, macOS or Linux). Other browsers do not have these APIs.",
      "In the table below, look at the state of each API. “Ready” means it can run now.",
      "If it says “Needs download”, press Prepare. Chrome downloads the model once; it can take a few minutes. Chrome only allows it after a click.",
      "Open any demo from the menu or the cards, type your own text or use the sample, and press the main button. The result appears as the model writes it.",
      "If something fails, read the frequently asked questions below, or open chrome://on-device-internals to see the state of the model.",
    ],
    demosIntro: "Each demo has a short guide at the top: what it does and how to use it.",
    apisIntro: "Seven APIs, each with its own job. Some demos use more than one.",
  },
  resources: {
    builtin: { note: "The general index" },
    started: { note: "Initial setup and flags" },
    reference: { note: "The state of each API" },
    demos: { note: "Google's collection of working examples" },
    explainer: { note: "The proposal on GitHub" },
    types: { note: "TypeScript typings this app uses" },
    studio: { note: "Inspect models and compatibility" },
    playground: { note: "Third party: it also shows experiments that are not Chrome APIs" },
  },
};

const es: Guides = {
  demos: {
    "": {
      title: "Estado",
      summary: "Qué APIs de IA integradas tiene tu navegador y los modelos de este dispositivo.",
      what: "",
      how: [],
    },
    toolkit: {
      title: "Caja de herramientas",
      summary: "Un texto, muchas acciones: resumir, traducir, corregir, simplificar y reescribir, con cada resultado guardado para compararlo.",
      what: "Escribes o pegas un texto una sola vez y le aplicas distintas acciones. Cada resultado se añade a una lista, el más nuevo arriba, para que puedas comparar, por ejemplo, un resumen corto y uno largo del mismo texto.",
      how: [
        "Escribe o pega un texto en la caja, o pulsa «Usar un ejemplo».",
        "Elige una acción en las pestañas: Resumir (elige tipo y longitud), Traducir (elige el idioma de destino; el de origen se detecta), Corregir, Simplificar o Reescribir (elige el tono).",
        "Pulsa «Ejecutar acción». El resultado va apareciendo en una tarjeta nueva que indica qué API lo produjo y cuánto tardó.",
        "Cambia de pestaña o de opciones y vuelve a ejecutar: las tarjetas anteriores se quedan. «Vaciar» borra la lista.",
      ],
      tip: "Una tarjeta dice «alternativa» cuando la Prompt API ha hecho el trabajo de una API específica que tu Chrome no tiene.",
    },
    prompt: {
      title: "Prompt playground",
      summary: "Envía cualquier instrucción a Gemini Nano y ve cómo aparece la respuesta palabra a palabra.",
      what: "La Prompt API es la puerta de uso general al modelo: responde preguntas, escribe, reformula, explica. Aquí hablas con ella directamente, con un prompt de sistema opcional que fija su papel o su estilo.",
      how: [
        "Opcional: escribe un prompt de sistema, quién debe ser el modelo o cómo debe responder («Eres un pirata.»).",
        "Escribe tu prompt, o elige uno de «Ejemplos» para rellenarlo.",
        "Pulsa Enviar. La respuesta llega mientras el modelo la escribe; Parar la cancela.",
        "Con el botón Copiar te llevas la respuesta.",
      ],
      tip: "Cada envío es independiente: el modelo no recuerda el anterior. Para conversar, usa el Chat local.",
    },
    chat: {
      title: "Chat local",
      summary: "Una conversación con historial, streaming, botón de parar y varias sesiones que puedes bifurcar.",
      what: "Un chat con el modelo del dispositivo que recuerda lo que se ha dicho. Puedes tener varias sesiones, bifurcar una para explorar dos caminos desde el mismo punto y ver cuánto del contexto del modelo se ha usado.",
      how: [
        "Escribe un mensaje y pulsa Enviar (o Intro; Mayús+Intro añade una línea).",
        "La respuesta llega poco a poco. Parar la cancela.",
        "«Nueva» empieza una sesión vacía. «Bifurcar» copia la actual para que la continúes de otra forma. «Borrar» la elimina. Cambia de sesión en la lista Sesión.",
        "«Contexto usado» muestra cuánta memoria del modelo ocupa la conversación. Cuando se llena, empieza una sesión nueva.",
      ],
      tip: "El historial se guarda solo en este navegador. La sesión del modelo se reconstruye a partir de él la próxima vez que escribas.",
    },
    json: {
      title: "Generador de JSON",
      summary: "Describe los datos que necesitas y recíbelos como JSON que cumple un esquema.",
      what: "La Prompt API puede obligarse a responder con la forma de un JSON Schema (salida estructurada). La respuesta son datos que tu código puede usar directamente, no texto libre que haya que interpretar.",
      how: [
        "Describe los datos que necesitas («Tres usuarios ficticios con nombre, email y edad»).",
        "Elige un esquema de ejemplo, o edita tú mismo el JSON Schema. Tiene que ser un JSON válido.",
        "Pulsa Generar.",
        "El resultado aparece como JSON formateado. Cópialo con el botón Copiar.",
      ],
      tip: "Prueba a editar el esquema: añade un campo o quítalo de «required». El modelo tiene que seguir lo que escribas.",
    },
    recipes: {
      title: "Recetas",
      summary: "Pequeños prompts listos para usar: clasificar, extraer, etiquetar, moderar, describir y hacer preguntas sobre un texto.",
      what: "Seis tareas cotidianas para un modelo de lenguaje. Cada una es un prompt pequeño con un formato de respuesta fijo, así que el resultado es estructurado y predecible.",
      how: [
        "Elige una receta. Una línea bajo la lista explica qué hace.",
        "Sustituye el texto de ejemplo por el tuyo.",
        "Ajusta las opciones que aparecen para esa receta: las categorías, los campos que extraer o cuántos resultados.",
        "Pulsa «Ejecutar receta». Debajo aparecen una línea de resumen y el resultado estructurado (JSON).",
      ],
      tip: "Clasificar solo elige entre las categorías que escribas, así que ponlas tal como quieres recibirlas.",
    },
    synonyms: {
      title: "Buscador de sinónimos",
      summary: "Sinónimos de una palabra o frase, con la diferencia entre cada uno.",
      what: "Un diccionario de sinónimos te da una lista; el modelo además te cuenta el matiz de cada opción: más formal o coloquial, más fuerte o más suave, y dónde encaja.",
      how: [
        "Escribe una palabra o una frase corta.",
        "Con el deslizador elige cuántos sinónimos quieres (de 3 a 12).",
        "Pulsa «Buscar sinónimos».",
        "Lee la tabla: cada sinónimo viene con la diferencia respecto a tu palabra.",
      ],
    },
    weather: {
      title: "Descriptor del tiempo",
      summary: "Convierte datos meteorológicos en bruto en una frase como la diría una persona.",
      what: "Muestra cómo un modelo de lenguaje convierte datos estructurados (JSON) en texto natural sin ninguna plantilla. Los datos están en esta app, así que no hay servicio meteorológico ni red de por medio.",
      how: [
        "Elige una ciudad: sus datos de ejemplo rellenan la caja.",
        "Opcional: edita cualquier valor (temperatura, viento, probabilidad de lluvia…).",
        "Pulsa «Describir el tiempo».",
        "Cambia un valor y vuelve a ejecutar para ver cómo se adapta el texto.",
      ],
    },
    image: {
      title: "Analizador de imágenes",
      summary: "Pregunta al modelo qué hay en una imagen.",
      what: "Usa la entrada de imágenes de la Prompt API (experimental): el modelo mira tu imagen y responde una pregunta sobre ella. La imagen se procesa en tu dispositivo y nunca se sube.",
      how: [
        "Elige un archivo de imagen. Aparece una vista previa.",
        "Escribe una pregunta, o elige una de las sugerencias.",
        "Pulsa Analizar. La respuesta va apareciendo.",
      ],
      tip: "La entrada de imágenes depende de la versión de Chrome y del modelo. Si da error, es probable que el modelo de tu dispositivo todavía no lea imágenes.",
    },
    summarize: {
      title: "Resumidor",
      summary: "Resume un texto como TL;DR, puntos clave, gancho o titular, con la longitud que elijas.",
      what: "La Summarizer API es un modelo hecho para resumir. Tú decides el estilo (tipo), la longitud y si el resultado lleva formato.",
      how: [
        "Pega el texto. Ya hay un artículo de ejemplo cargado.",
        "Elige el tipo: Puntos clave (viñetas), TL;DR (resumen rápido), Gancho (una frase que da ganas de leer) o Titular (un título de una línea).",
        "Elige la longitud (corta, media, larga) y el formato (Markdown dibuja las listas; el texto plano no).",
        "Pulsa Resumir. El resumen va apareciendo.",
      ],
      tip: "Un texto corto da un resumen corto sea cual sea la longitud: no hay mucho que recortar.",
    },
    "summary-of-summaries": {
      title: "Resumen de resúmenes",
      summary: "Trocea un texto largo, resume cada trozo y luego resume los resúmenes.",
      what: "El modelo solo puede leer cierta cantidad de texto de una vez. Para un documento largo, esta técnica lo corta en trozos, resume cada uno y después resume esos resúmenes parciales en uno solo.",
      how: [
        "Pega un texto largo. El ejemplo es un artículo repetido tres veces.",
        "Bajo la caja ves cuántos trozos saldrán. El deslizador cambia el tamaño de cada trozo.",
        "Elige el tipo del resumen final.",
        "Pulsa «Resumir por trozos». Una barra de progreso muestra qué trozo se está resumiendo.",
        "Abre «Resumen de cada trozo» para ver los pasos intermedios.",
      ],
      tip: "Con trozos pequeños se conserva más detalle, pero hacen falta más llamadas al modelo y tarda más.",
    },
    translate: {
      title: "Traductor universal",
      summary: "Pega un texto en cualquier idioma: se detecta y se traduce al que elijas.",
      what: "Dos APIs trabajan juntas: el Language Detector adivina el idioma de tu texto y el Translator lo traduce, todo en tu dispositivo. Cada par de idiomas descarga su propio modelo pequeño la primera vez que lo usas.",
      how: [
        "Escribe o pega el texto. Mientras escribes, el idioma detectado aparece bajo la caja (cuando el modelo del detector está descargado).",
        "Deja Origen en «Detectar idioma», o elige tú el idioma.",
        "Elige el idioma de destino. «Intercambiar idiomas» cambia origen y destino.",
        "Pulsa Traducir.",
      ],
      tip: "Si el texto ya está en el idioma de destino, no se traduce nada y la página lo dice.",
    },
    proofread: {
      title: "Corrector",
      summary: "Correcciones de ortografía, puntuación y gramática, cada una con su tipo y su porqué.",
      what: "Encuentra errores en tu texto y devuelve cada corrección con su tipo y, si quieres, el motivo. Usa la Proofreader API (en prueba de origen) y recurre a la Prompt API cuando tu Chrome no la tiene.",
      how: [
        "Pega el texto. El ejemplo tiene errores a propósito.",
        "Deja activado «Explicar cada corrección» para recibir el motivo de cada arreglo.",
        "Pulsa Corregir.",
        "Lee tu texto con las correcciones marcadas (pasa el ratón o enfoca una marca), después el texto corregido y la tabla de correcciones.",
      ],
    },
    write: {
      title: "Escritor y reescritor",
      summary: "Escribe a partir de una instrucción o reescribe un texto con otro tono y longitud.",
      what: "Dos modos. Escribir crea un texto nuevo a partir de una instrucción. Reescribir cambia el tono y la longitud de un texto que ya tienes. Ambas APIs están obsoletas en Chrome: cuando faltan, la Prompt API hace el trabajo.",
      how: [
        "Pestaña Escribir: describe lo que necesitas («Un email a…»), añade contexto si ayuda, elige tono y longitud y pulsa Escribir.",
        "Pestaña Reescribir: pega un texto, elige el tono (igual, más formal, más informal) y la longitud (igual, más corto, más largo) y pulsa Reescribir.",
        "El texto va apareciendo. Parar lo cancela y Copiar te lo lleva.",
      ],
    },
    assistant: {
      title: "Asistente de escritura",
      summary: "Un editor que corrige, cambia el tono o simplifica el texto que has escrito.",
      what: "Un pequeño editor que trabaja sobre tu propio texto. Propone un cambio y tú decides si lo aceptas; siempre puedes deshacerlo.",
      how: [
        "Escribe o pega tu texto en el editor.",
        "Pulsa Corregir para arreglar ortografía y gramática, o Hacer formal, Hacer cercano, Hacer conciso o Simplificar para cambiar el estilo.",
        "La sugerencia aparece debajo. En las correcciones, una tabla lista cada cambio.",
        "Pulsa «Reemplazar mi texto» para aceptarla (Deshacer te devuelve tu texto), o ignórala y prueba otra acción.",
      ],
    },
  },
  faq: {
    title: "Preguntas frecuentes",
    lead: "Configuración, requisitos y qué hacer cuando un modelo no responde.",
    groups: [
      {
        id: "start",
        title: "Para empezar",
        items: [
          {
            id: "private",
            q: "¿Sale del dispositivo algo de lo que escribo?",
            a: ["No. Los modelos se ejecutan dentro del navegador, así que los textos y las imágenes que usas no se envían a ningún servidor. El único uso de la red es la primera descarga de cada modelo."],
          },
          {
            id: "browser",
            q: "¿Qué navegador y qué sistema necesito?",
            a: ["Chrome de escritorio: Windows 10 u 11, macOS 13 o posterior, Linux, o ChromeOS en dispositivos Chromebook Plus. Android e iOS no son compatibles con estas APIs, y el Traductor y el Detector de idioma solo existen en escritorio."],
          },
          {
            id: "hardware",
            q: "¿Qué hardware y cuánto disco hacen falta?",
            a: ["Estos son los requisitos que indica Chrome. Si el espacio libre baja de 10 GB tras la descarga, Chrome elimina el modelo y lo vuelve a descargar cuando se cumplan de nuevo."],
            list: [
              "Al menos 22 GB libres en el disco que contiene tu perfil de Chrome.",
              "Una GPU con más de 4 GB de VRAM, o una CPU con 16 GB de RAM y 4 núcleos o más.",
              "Una conexión sin límite de datos para la primera descarga.",
            ],
          },
          {
            id: "download",
            q: "¿Cómo descargo un modelo?",
            a: ["Abre la página de estado y pulsa Preparar en la API que quieras, o usa directamente una demo. Chrome solo inicia la descarga tras un clic o una pulsación de tecla en la página, así que no puede ocurrir por sí sola. Los modelos son grandes y pueden tardar varios minutos."],
          },
          {
            id: "offline",
            q: "¿Funciona sin internet?",
            a: ["Sí, una vez descargado el modelo. Cada par de idiomas del Traductor descarga su propio modelo pequeño la primera vez que lo usas."],
          },
        ],
      },
      {
        id: "problems",
        title: "Cuando algo no funciona",
        items: [
          {
            id: "unavailable",
            q: "Un estado dice «No disponible» o «No está en este navegador». ¿Qué hago?",
            a: [
              "«No está en este navegador» significa que Chrome no ofrece esa API: usa Chrome de escritorio y mantenlo actualizado. «No disponible» significa que la API existe, pero el modelo no puede ejecutarse en este dispositivo, normalmente por los requisitos de hardware o de disco.",
              "Estos son los pasos que recomienda la guía de Chrome:",
            ],
            list: [
              "Reinicia Chrome.",
              "Abre `chrome://on-device-internals` y, en la pestaña Broker State, comprueba que no hay errores.",
              "Abre la consola de DevTools y ejecuta `LanguageModel.availability()`. Debería devolver `available`.",
              "Si sigue fallando, espera un poco y repite los pasos.",
            ],
          },
          {
            id: "stuck",
            q: "La descarga no empieza o no termina.",
            a: ["Pulsa Preparar, o el botón principal de una demo, en la propia página: la descarga necesita un clic. Después comprueba que tienes espacio libre suficiente y una conexión sin límite de datos, y abre `chrome://on-device-internals` para ver el modelo y su tamaño."],
          },
          {
            id: "echo",
            q: "La respuesta repite mi prompt y termina en «End.Model:».",
            a: [
              "Ese texto es la propia petición, devuelta por el modelo del navegador sin escribir ninguna respuesta; suele volver en pocos milisegundos. El prompt que envía este sitio es correcto, así que el problema está en el modelo que ejecuta Chrome, probablemente un sustituto y no el Gemini Nano real. No hemos podido confirmar la causa.",
              "Para comprobarlo:",
            ],
            list: [
              "Prueba el Prompt playground con un texto corto como «Di hola». Si también repite el prompt, el culpable es el modelo.",
              "Abre `chrome://on-device-internals` y mira el estado del modelo: debería mostrar un modelo real, con versión y tamaño.",
              "Reinicia Chrome y vuelve a pulsar Preparar en la página de estado.",
              "Prueba la misma página en Chrome estable de escritorio.",
            ],
          },
          {
            id: "image",
            q: "El analizador de imágenes da un error o una respuesta sin sentido.",
            a: ["La entrada de imágenes es experimental en la Prompt API y depende de la versión de Chrome y del modelo instalado en tu dispositivo. Si el Prompt playground funciona con texto, puede que el modelo todavía no lea imágenes."],
          },
          {
            id: "fallback",
            q: "¿Por qué un resultado dice «alternativa»?",
            a: ["El Corrector es experimental, y el Escritor y el Reescritor están obsoletos. Cuando Chrome no tiene alguno de ellos, el sitio le pide el trabajo a la Prompt API y marca el resultado como alternativa. El texto sigue siendo válido, pero puede diferir de lo que daría la API específica."],
          },
        ],
      },
      {
        id: "demos",
        title: "Sobre las demos",
        items: [
          {
            id: "languages",
            q: "¿Qué idiomas entiende el modelo?",
            a: ["El modelo principal admite inglés, español y japonés; la guía de Chrome añade alemán y francés desde Chrome 149. Elige el idioma del modelo en la página de estado: también fija el idioma de los textos de ejemplo. El Traductor cubre muchos más idiomas."],
          },
          {
            id: "slow",
            q: "¿Por qué la primera respuesta tarda más?",
            a: ["La primera petición tiene que cargar el modelo en memoria. Las siguientes empiezan mucho antes."],
          },
          {
            id: "flags",
            q: "¿Tengo que cambiar flags de Chrome?",
            a: ["La guía de inicio de Chrome no indica ningún flag para estas APIs, así que prueba primero sin ellos. Las APIs experimentales, como el Corrector, pueden necesitar pasos extra: la guía de configuración recoge los vigentes."],
          },
        ],
      },
    ],
    more: "¿No está aquí?",
    moreLink: "Lee la guía de configuración de Chrome",
  },
  apis: {
    prompt: { note: "IA generativa de uso general", what: "Pregúntale al modelo lo que quieras: respuestas, redacción, clasificación, datos con forma de JSON e incluso imágenes." },
    summarizer: { note: "TL;DR, puntos clave, gancho, titular", what: "Acorta un texto con el estilo y la longitud que elijas." },
    translator: { note: "Traducción en el dispositivo, un modelo por par de idiomas", what: "Traduce entre idiomas; cada par descarga su propio modelo pequeño." },
    detector: { note: "En qué idioma está un texto", what: "Dice en qué idioma está escrito un texto, con un nivel de confianza." },
    proofreader: { note: "Prueba de origen; recurre a la Prompt API", what: "Encuentra errores de ortografía, puntuación y gramática y los explica." },
    writer: { note: "Obsoleta; recurre a la Prompt API", what: "Escribe un texto nuevo a partir de una instrucción, con un tono y una longitud." },
    rewriter: { note: "Obsoleta; recurre a la Prompt API", what: "Reescribe un texto con otro tono o longitud." },
  },
  home: {
    intro:
      "Demos de la IA integrada de Chrome. Un modelo de lenguaje pequeño, Gemini Nano, se ejecuta dentro de tu navegador: no hay servidor que pagar, nada de lo que escribes se sube y, una vez descargado un modelo, funciona sin conexión.",
    startHeading: "Cómo empezar",
    start: [
      "Abre este sitio en Chrome desde un ordenador (Windows, macOS o Linux). Otros navegadores no tienen estas APIs.",
      "En la tabla de abajo mira el estado de cada API. «Listo» significa que ya puede funcionar.",
      "Si dice «Hay que descargarlo», pulsa Preparar. Chrome descarga el modelo una vez; puede tardar unos minutos. Chrome solo lo permite tras un clic.",
      "Abre cualquier demo desde el menú o las tarjetas, escribe tu texto o usa el de ejemplo y pulsa el botón principal. El resultado aparece mientras el modelo lo escribe.",
      "Si algo falla, lee las preguntas frecuentes de más abajo, o abre chrome://on-device-internals para ver el estado del modelo.",
    ],
    demosIntro: "Cada demo tiene una guía corta arriba: qué hace y cómo se usa.",
    apisIntro: "Siete APIs, cada una con su trabajo. Algunas demos usan más de una.",
  },
  resources: {
    builtin: { note: "El índice general" },
    started: { note: "Configuración inicial y flags" },
    reference: { note: "El estado de cada API" },
    demos: { note: "La colección de ejemplos de Google" },
    explainer: { note: "La propuesta en GitHub" },
    types: { note: "Los tipos de TypeScript que usa esta app" },
    studio: { note: "Inspecciona modelos y compatibilidad" },
    playground: { note: "De terceros: también muestra experimentos que no son APIs de Chrome" },
  },
};

export const guides: Record<Lang, Guides> = { en, es };
