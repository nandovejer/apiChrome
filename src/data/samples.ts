/** Sample inputs, in the languages the on-device model takes. */
type Lang = "en" | "es";
const pick = <T,>(table: Record<Lang, T>, language: string): T => (language === "es" ? table.es : table.en);

const ARTICLE_EN = [
  "The city council approved a plan on Monday to turn the old harbour warehouses into a public library, a market hall and a small museum about the port's history. The project, which has been discussed for nearly a decade, will cost around 42 million euros and is expected to open in 2029.",
  "Supporters say the plan will bring life back to a district that has been mostly empty since shipping moved to the new terminal in the 1990s. Local shop owners expect more visitors, and the university has offered to run a study centre inside the library. Architects chose to keep the iron roof and the brick facades, adding glass walkways between the buildings.",
  "Critics are worried about the cost and about traffic. The neighbourhood association asked for a limit on car access and a new tram stop before the first works begin. The council answered that a mobility study will be published in the spring and that no construction permit will be granted before it.",
  "Funding will come from three sources: 18 million from the regional government, 14 million from a European regeneration fund and 10 million from the city's own budget, which includes the sale of two unused municipal buildings. If the European fund is delayed, the council said, the museum would be built in a second phase.",
  "Environmental groups welcomed the decision to reuse the existing buildings instead of demolishing them, which saves an estimated 9,000 tonnes of carbon dioxide compared with new construction. The old cranes on the quay will stay as monuments, and part of the quay will become a public park with trees and benches facing the water.",
  "The mayor said the project is a bet on the city's future. 'We are not building a monument,' she told reporters. 'We are giving the harbour back to the people who live here.' A public exhibition of the designs opens next week at the town hall, and residents can send comments until the end of the month.",
].join("\n\n");

const ARTICLE_ES = [
  "El ayuntamiento aprobó el lunes un plan para convertir los antiguos almacenes del puerto en una biblioteca pública, un mercado cubierto y un pequeño museo sobre la historia portuaria. El proyecto, debatido durante casi una década, costará unos 42 millones de euros y se prevé que abra en 2029.",
  "Los partidarios aseguran que el plan devolverá la vida a un barrio casi vacío desde que el tráfico marítimo se trasladó a la nueva terminal en los años noventa. Los comerciantes esperan más visitantes y la universidad se ha ofrecido a gestionar una sala de estudio dentro de la biblioteca. Los arquitectos han decidido conservar la cubierta de hierro y las fachadas de ladrillo, y añadir pasarelas de cristal entre los edificios.",
  "Los críticos temen por el coste y por el tráfico. La asociación de vecinos ha pedido limitar el acceso de coches y una nueva parada de tranvía antes de que empiecen las obras. El ayuntamiento respondió que un estudio de movilidad se publicará en primavera y que no se concederá ninguna licencia antes.",
  "La financiación saldrá de tres fuentes: 18 millones del gobierno regional, 14 millones de un fondo europeo de regeneración y 10 millones del presupuesto municipal, que incluye la venta de dos edificios municipales sin uso. Si el fondo europeo se retrasa, dijo el consistorio, el museo se construiría en una segunda fase.",
  "Los grupos ecologistas valoraron la decisión de reutilizar los edificios existentes en lugar de demolerlos, lo que evita unas 9.000 toneladas de dióxido de carbono frente a una obra nueva. Las viejas grúas del muelle se conservarán como monumentos y parte del muelle será un parque público con árboles y bancos frente al agua.",
  "La alcaldesa dijo que el proyecto es una apuesta por el futuro de la ciudad. «No estamos construyendo un monumento», explicó a los periodistas. «Le estamos devolviendo el puerto a quienes viven aquí». Una exposición pública de los diseños se inaugura la próxima semana en el ayuntamiento y los vecinos pueden enviar comentarios hasta final de mes.",
].join("\n\n");

export const samples = {
  article: (l: string) => pick({ en: ARTICLE_EN, es: ARTICLE_ES }, l),
  longArticle: (l: string) => {
    const a = pick({ en: ARTICLE_EN, es: ARTICLE_ES }, l);
    return `${a}\n\n${a}\n\n${a}`;
  },
  prompts: (l: string) =>
    pick(
      {
        en: ["Explain what an API is to a ten-year-old.", "Write a haiku about debugging.", "Give me three names for a coffee shop run by cats.", "Make a list of five things to check before a long trip."],
        es: ["Explica qué es una API a un niño de diez años.", "Escribe un haiku sobre depurar código.", "Dame tres nombres para una cafetería regentada por gatos.", "Haz una lista de cinco cosas que revisar antes de un viaje largo."],
      },
      l,
    ),
  userDescriptions: (l: string) =>
    pick({ en: "Three fictional users from different countries, with name, email, age and favorite hobby", es: "Tres usuarios ficticios de países distintos, con nombre, email, edad y afición favorita" }, l),
  message: (l: string) =>
    pick(
      {
        en: "Hi, I was charged twice for my order #4821 this month and I would like a refund for the second payment as soon as possible. Thanks.",
        es: "Hola, me han cobrado dos veces el pedido #4821 este mes y quisiera que me devolvieran el segundo pago lo antes posible. Gracias.",
      },
      l,
    ),
  contacts: (l: string) =>
    pick(
      {
        en: "Contact Maria Lopez at maria.lopez@example.com or on +34 600 123 456. Her colleague John Smith (john@acme.io, +1 555 010 2030) is out until 3 March 2027. More at https://acme.io/team.",
        es: "Contacta con María López en maria.lopez@example.com o en el +34 600 123 456. Su compañero Juan Pérez (juan@acme.io, +34 611 222 333) está fuera hasta el 3 de marzo de 2027. Más en https://acme.io/equipo.",
      },
      l,
    ),
  review: (l: string) =>
    pick(
      {
        en: "I bought these headphones for the commute. The noise cancelling is excellent and the battery lasts all week, but the left ear cup creaks and the app keeps asking me to update.",
        es: "Compré estos auriculares para ir al trabajo. La cancelación de ruido es excelente y la batería dura toda la semana, pero la almohadilla izquierda cruje y la app me pide actualizar todo el rato.",
      },
      l,
    ),
  product: (l: string) =>
    pick(
      {
        en: "Stainless steel water bottle, 750 ml, keeps drinks cold for 24 hours and hot for 12, leak-proof lid, dishwasher safe, available in green and black.",
        es: "Botella de agua de acero inoxidable, 750 ml, mantiene frías las bebidas 24 horas y calientes 12, tapa antifugas, apta para lavavajillas, disponible en verde y negro.",
      },
      l,
    ),
  rude: (l: string) =>
    pick(
      { en: "This is the worst product ever and you are all idiots, I hope your company goes bankrupt.", es: "Este es el peor producto del mundo y sois todos unos inútiles, ojalá vuestra empresa quiebre." },
      l,
    ),
  word: (l: string) => pick({ en: "happy", es: "feliz" }, l),
  errors: (l: string) =>
    pick(
      {
        en: "Yesterday me and my freind goes to the market, and we buyed some apple's. Their was alot of people there, and it was realy noisy",
        es: "Ayer mi amigo y yo fuimos al mercado y compramos unas manzanas. Habia mucha gente alli y hacia mucho ruido, ademas llovia demaciado",
      },
      l,
    ),
  informal: (l: string) =>
    pick(
      {
        en: "Hey, just wanted to say the stuff you sent is kinda late, can you look into it and let me know what's going on? Thanks a ton!",
        es: "Oye, solo quería decirte que lo que enviaste llega un poco tarde, ¿puedes mirarlo y avisarme de qué pasa? ¡Mil gracias!",
      },
      l,
    ),
  technical: (l: string) =>
    pick(
      {
        en: "The service uses an idempotent retry mechanism with exponential backoff and jitter to mitigate thundering-herd effects when the upstream circuit breaker transitions from half-open to closed.",
        es: "El servicio usa un mecanismo de reintento idempotente con espera exponencial y jitter para mitigar el efecto de manada cuando el cortacircuitos del servicio previo pasa de semiabierto a cerrado.",
      },
      l,
    ),
  writeInstruction: (l: string) =>
    pick(
      { en: "An email to my landlord asking to fix the heating, which has been broken for a week", es: "Un email a mi casero pidiéndole que arregle la calefacción, rota desde hace una semana" },
      l,
    ),
  chatSystem: (l: string) =>
    pick({ en: "You are a friendly assistant. Answer briefly.", es: "Eres un asistente amable. Responde con brevedad." }, l),
  imageQuestions: (l: string) =>
    pick(
      { en: ["Describe this image.", "What objects can you see?", "Write a short caption for it.", "Is there any text in the picture?"], es: ["Describe esta imagen.", "¿Qué objetos ves?", "Escribe un pie de foto corto.", "¿Hay algún texto en la imagen?"] },
      l,
    ),
};

export interface WeatherSample {
  city: string;
  data: Record<string, string | number>;
}

/** Local data, so the demo keeps working with no network. */
export const WEATHER: WeatherSample[] = [
  { city: "Madrid", data: { city: "Madrid", temperatureC: 31, feelsLikeC: 33, condition: "clear sky", humidityPct: 22, windKmh: 9, uvIndex: 9, rainChancePct: 0 } },
  { city: "Bilbao", data: { city: "Bilbao", temperatureC: 14, feelsLikeC: 12, condition: "light rain", humidityPct: 86, windKmh: 21, uvIndex: 2, rainChancePct: 80 } },
  { city: "Reykjavik", data: { city: "Reykjavik", temperatureC: -3, feelsLikeC: -9, condition: "snow showers", humidityPct: 78, windKmh: 34, uvIndex: 1, rainChancePct: 65 } },
  { city: "Singapore", data: { city: "Singapore", temperatureC: 29, feelsLikeC: 35, condition: "thunderstorms", humidityPct: 91, windKmh: 12, uvIndex: 6, rainChancePct: 90 } },
];

export const JSON_PRESETS: Record<string, { label: string; schema: object }> = {
  users: {
    label: "Users",
    schema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" }, email: { type: "string" }, age: { type: "integer" }, hobby: { type: "string" } },
            required: ["name", "email", "age", "hobby"],
          },
        },
      },
      required: ["users"],
    },
  },
  products: {
    label: "Products",
    schema: {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" }, price: { type: "number" }, category: { type: "string" }, inStock: { type: "boolean" } },
            required: ["name", "price", "category", "inStock"],
          },
        },
      },
      required: ["products"],
    },
  },
  companies: {
    label: "Companies",
    schema: {
      type: "object",
      properties: {
        companies: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" }, country: { type: "string" }, employees: { type: "integer" }, address: { type: "string" } },
            required: ["name", "country", "employees", "address"],
          },
        },
      },
      required: ["companies"],
    },
  },
};
