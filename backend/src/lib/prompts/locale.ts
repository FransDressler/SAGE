const LOCALES: Record<string, string> = {
  de: "Respond in German (Deutsch). Use proper orthography: ä, ö, ü, ß. Technical terms may stay in English where standard.",
  en: "Respond in English.",
}

export function getLocale() {
  const code = process.env.PAGELM_LOCALE || "de"
  return { code, instruction: LOCALES[code] || LOCALES.de }
}
