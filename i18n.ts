export type AppLanguage = "hu" | "en"

export type TranslationKey =
  | "loadingTitle"
  | "loadingMessage"
  | "summaryTitle"
  | "excludedColumns"
  | "grandTotal"
  | "allFiveTotal"
  | "month"
  | "gradesAndWeights"
  | "total"
  | "noGrades"
  | "emptyTitle"
  | "emptyMessage"
  | "unsupportedTitle"
  | "unsupportedMessage"
  | "unsupportedHintPrefix"
  | "errorTitle"
  | "missingTabId"
  | "activeTabCheckFailed"

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  hu: {
    loadingTitle: "e-kreta pocket money",
    loadingMessage: "Az aktív lap ellenőrzése folyamatban van.",
    summaryTitle: "Havi zsebpénz összesítő",
    excludedColumns: "Az I, II, Átlag és Átlag (%) oszlopok kihagyva.",
    grandTotal: "Végösszeg",
    allFiveTotal: "Összeg, ha minden jegy 5-ös lenne",
    month: "Hónap",
    gradesAndWeights: "Jegyek és súlyok",
    total: "Összesen",
    noGrades: "Nincs jegy",
    emptyTitle: "Nincs kiolvasható jegy",
    emptyMessage: "Nem találtam kiolvasható számjegyes 1-5 osztályzatokat a havi oszlopokban.",
    unsupportedTitle: "Nem támogatott oldal",
    unsupportedMessage: "A bővítmény csak az e-kreta Osztályzatok oldalon működik.",
    unsupportedHintPrefix: "Nyisd meg ezt az útvonalat:",
    errorTitle: "Ellenőrzés sikertelen",
    missingTabId: "Az aktív lap azonosítója nem érhető el.",
    activeTabCheckFailed: "Az aktív lap nem ellenőrizhető."
  },
  en: {
    loadingTitle: "e-kreta pocket money",
    loadingMessage: "Checking the active tab.",
    summaryTitle: "Monthly pocket money summary",
    excludedColumns: "Columns I, II, Average and Average (%) are excluded.",
    grandTotal: "Grand total",
    allFiveTotal: "Amount if every grade had been 5",
    month: "Month",
    gradesAndWeights: "Grades and weights",
    total: "Total",
    noGrades: "No grades",
    emptyTitle: "No readable grades",
    emptyMessage: "No readable numeric grades (1-5) were found in monthly columns.",
    unsupportedTitle: "Unsupported page",
    unsupportedMessage: "The extension works only on the e-kreta Grades page.",
    unsupportedHintPrefix: "Open this path:",
    errorTitle: "Check failed",
    missingTabId: "The active tab id is not available.",
    activeTabCheckFailed: "The active tab cannot be checked."
  }
}

export function detectLanguage(): AppLanguage {
  const uiLanguage = chrome.i18n?.getUILanguage?.() ?? navigator.language ?? "en"

  return uiLanguage.toLowerCase().startsWith("hu") ? "hu" : "en"
}

export function t(language: AppLanguage, key: TranslationKey) {
  return translations[language][key]
}