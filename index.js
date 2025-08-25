// Normalize tags to BCP-47 (e.g., pt_BR -> pt-BR)
function normalizeLangTag(tag) {
  const parts = String(tag).replace(/_/g, "-").split("-");
  if (!parts.length) return "en";
  parts[0] = parts[0].toLowerCase();
  for (let i = 1; i < parts.length; i++) {
    if (/^[A-Za-z]{2,3}$/.test(parts[i])) parts[i] = parts[i].toUpperCase();
  }
  return parts.join("-");
}

async function runTranslator(text, sourceSel, targetSel) {
  const outputEl = document.getElementById("translationOutput");
  if (!("Translator" in self)) {
    outputEl.textContent = "Translator API not available in this browser.";
    return;
  }

  let source = normalizeLangTag(sourceSel);
  let target = normalizeLangTag(targetSel);

  if (source === target) {
    outputEl.textContent = "Source and target cannot be the same.";
    return;
  }

  let availability = await Translator.availability({
    sourceLanguage: source,
    targetLanguage: target,
  });

  // fallback: try base language if variant fails
  if (availability === "unavailable") {
    const baseS = source.split("-")[0];
    const baseT = target.split("-")[0];
    if (baseS !== source || baseT !== target) {
      const alt = await Translator.availability({
        sourceLanguage: baseS,
        targetLanguage: baseT,
      });
      if (alt !== "unavailable") {
        source = baseS;
        target = baseT;
        availability = alt;
      }
    }
  }

  if (
    availability !== "available" &&
    availability !== "downloadable" &&
    availability !== "downloading"
  ) {
    outputEl.textContent = `Unsupported pair: ${source} → ${target}`;
    return;
  }

  const translator = await Translator.create({
    sourceLanguage: source,
    targetLanguage: target,
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        outputEl.textContent = `Downloading model: ${Math.round(
          e.loaded * 100
        )}%`;
      });
    },
  });

  outputEl.textContent = await translator.translate(text);
  translator.destroy();
}

document.getElementById("translateForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("textInput").value.trim();
  const source = document.getElementById("sourceLang").value;
  const target = document.getElementById("targetLang").value;
  if (text) runTranslator(text, source, target);
});
