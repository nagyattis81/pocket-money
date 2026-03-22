export type AppLanguage = "hu" | "en"

const LANGUAGE_STORAGE_KEY = "appLanguage"

export type TranslationKey =
  | "loadingTitle"
  | "loadingMessage"
  | "summaryTitle"
  | "grandTotal"
  | "allFiveTotal"
  | "month"
  | "gradesAndWeights"
  | "total"
  | "monthlyAllFive"
  | "noGrades"
  | "emptyTitle"
  | "emptyMessage"
  | "unsupportedTitle"
  | "unsupportedMessage"
  | "unsupportedHintPrefix"
  | "errorTitle"
  | "missingTabId"
  | "activeTabCheckFailed"
  | "settingsTitle"
  | "settingsHint"
  | "currencyLabel"
  | "saveSettings"
  | "resetDefaults"
  | "settingsSaved"
  | "settingsSaveFailed"
  | "languageHungarian"
  | "languageEnglish"
  | "tableViewCompact"
  | "tableViewDetailed"

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  hu: {
    loadingTitle: "e-kreta pocket money",
    loadingMessage: "Az aktív lap ellenőrzése folyamatban van.",
    summaryTitle: "Havi zsebpénz összesítő",
    grandTotal: "Végösszeg",
    allFiveTotal: "ha minden jegy 5-ös lenne",
    month: "Hónap",
    gradesAndWeights: "Jegyek és súlyok",
    total: "Összesen",
    monthlyAllFive: "Teljes",
    noGrades: "Nincs jegy",
    emptyTitle: "Nincs kiolvasható jegy",
    emptyMessage: "Nem találtam kiolvasható számjegyes 1-5 osztályzatokat a havi oszlopokban.",
    unsupportedTitle: "Nem támogatott oldal",
    unsupportedMessage: "A bővítmény csak az e-kreta Osztályzatok oldalon működik.",
    unsupportedHintPrefix: "Nyisd meg ezt az útvonalat:",
    errorTitle: "Ellenőrzés sikertelen",
    missingTabId: "Az aktív lap azonosítója nem érhető el.",
    activeTabCheckFailed: "Az aktív lap nem ellenőrizhető.",
    settingsTitle: "Jegy / Ft beállítások",
    settingsHint: "Módosítsd az értékeket, majd mentsd el.",
    currencyLabel: "Pénznem",
    saveSettings: "Mentés",
    resetDefaults: "Alapértékek",
    settingsSaved: "Beállítások elmentve.",
    settingsSaveFailed: "A mentés nem sikerült.",
    languageHungarian: "Magyar",
    languageEnglish: "Angol",
    tableViewCompact: "Tömör",
    tableViewDetailed: "Részletes"
  },
  en: {
    loadingTitle: "e-kreta pocket money",
    loadingMessage: "Checking the active tab.",
    summaryTitle: "Monthly pocket money summary",
    grandTotal: "Grand total",
    allFiveTotal: "if every grade had been 5",
    month: "Month",
    gradesAndWeights: "Grades and weights",
    total: "Total",
    monthlyAllFive: "Full",
    noGrades: "No grades",
    emptyTitle: "No readable grades",
    emptyMessage: "No readable numeric grades (1-5) were found in monthly columns.",
    unsupportedTitle: "Unsupported page",
    unsupportedMessage: "The extension works only on the e-kreta Grades page.",
    unsupportedHintPrefix: "Open this path:",
    errorTitle: "Check failed",
    missingTabId: "The active tab id is not available.",
    activeTabCheckFailed: "The active tab cannot be checked.",
    settingsTitle: "Grade / Ft settings",
    settingsHint: "Update values and save them.",
    currencyLabel: "Currency",
    saveSettings: "Save",
    resetDefaults: "Defaults",
    settingsSaved: "Settings saved.",
    settingsSaveFailed: "Saving failed.",
    languageHungarian: "Hungarian",
    languageEnglish: "English",
    tableViewCompact: "Compact",
    tableViewDetailed: "Detailed"
  }
}

export const detectLanguage = (): AppLanguage => {
  const uiLanguage = chrome.i18n?.getUILanguage?.() ?? navigator.language ?? "en"

  return uiLanguage.toLowerCase().startsWith("hu") ? "hu" : "en"
}

export const normalizeLanguage = (value: unknown): AppLanguage => value === "hu" ? "hu" : "en"

export const getStoredLanguage = async (): Promise<AppLanguage | null> => {
  const stored = await chrome.storage.local.get(LANGUAGE_STORAGE_KEY)
  const storedValue = stored[LANGUAGE_STORAGE_KEY]

  if (storedValue === undefined) {
    return null
  }

  return normalizeLanguage(storedValue)
}

export const saveLanguage = async (language: AppLanguage): Promise<void> => {
  await chrome.storage.local.set({
    [LANGUAGE_STORAGE_KEY]: normalizeLanguage(language)
  })
}

export const t = (language: AppLanguage, key: TranslationKey): string => translations[language][key]