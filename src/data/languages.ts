export interface LanguageOption {
  code: string;
  name: string;
}

/** The languages the Translator API covers, as in the original demo. */
export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)" },
  { code: "ru", name: "Russian" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "es-419", name: "Spanish (Latin America)" },
  { code: "am", name: "Amharic" },
  { code: "bg", name: "Bulgarian" },
  { code: "bn", name: "Bengali" },
  { code: "ca", name: "Catalan" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "el", name: "Greek" },
  { code: "et", name: "Estonian" },
  { code: "fa", name: "Persian" },
  { code: "fi", name: "Finnish" },
  { code: "fil", name: "Filipino" },
  { code: "gu", name: "Gujarati" },
  { code: "he", name: "Hebrew" },
  { code: "hr", name: "Croatian" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "kn", name: "Kannada" },
  { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "ms", name: "Malay" },
  { code: "nl", name: "Dutch" },
  { code: "no", name: "Norwegian" },
  { code: "pl", name: "Polish" },
  { code: "ro", name: "Romanian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "sr", name: "Serbian" },
  { code: "sv", name: "Swedish" },
  { code: "sw", name: "Swahili" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
];

export const languageLabel = (code: string): string =>
  LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase())?.name ??
  LANGUAGES.find((l) => l.code === code.split("-")[0])?.name ??
  code;
