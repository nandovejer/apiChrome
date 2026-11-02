import { $, onDemo, streamInto } from "../lib/ui";
import { WEATHER } from "../data/samples";

onDemo("weather", ({ root, engine, runner }) => {
  const city = $<HTMLSelectElement>(root, "#city");
  const data = $<HTMLTextAreaElement>(root, "#data");
  const out = $(root, "#out");

  const load = () => {
    const chosen = WEATHER.find((w) => w.city === city.value) ?? WEATHER[0];
    data.value = JSON.stringify(chosen?.data ?? {}, null, 2);
  };
  city.addEventListener("change", load);
  load();

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    void runner.run(async (signal) => {
      await streamInto(out, engine.stream({ task: "weather", input: data.value, signal }), runner);
    });
  });
});
