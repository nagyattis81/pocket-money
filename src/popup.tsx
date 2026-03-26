import React, { useEffect, useState } from "react"
import { version } from "../package.json"
import {
  DEFAULT_CURRENCY,
  DEFAULT_GRADE_TO_AMOUNT,
  SUPPORTED_PATH
} from "./constants"
import {
  hintStyle
} from "./css-properties.constants"
import { cardStyle, containerStyle } from "./popup.styles"
import {
  buildMonthSummaries,
  calculateAllFiveTotalWithMap,
  extractMonthlyEntries,
  formatAmount,
  getStoredCurrency,
  getStoredGradeToAmount,
  getStoredTableViewMode,
  isSupportedUrl,
  normalizeGradeToAmountMap,
  resetGradeToAmount,
  saveCurrency,
  saveGradeToAmount,
  saveTableViewMode
} from "./functions"
import { detectLanguage, getStoredLanguage, saveLanguage, t } from "./i18n"
import type { AppLanguage, TranslationKey } from "./i18n"
import { MonthSummaryTable } from "./components/month-summary-table"
import { EmptyView, ErrorView, LoadingView, UnsupportedView } from "./components/popup-status-views"
import { SettingsPanel } from "./components/settings-panel"
import { SummaryHeader } from "./components/summary-header"
import type { CurrencyCode, GradeToAmountMap, MonthSummary, PopupState, SettingsStatus, TableViewMode } from "./types"

const FALLBACK_CURRENCIES: CurrencyCode[] = ["HUF", "EUR", "USD"]

const getCurrencyOptions = (language: AppLanguage): Array<{ code: CurrencyCode; label: string }> => {
  const locale = language === "hu" ? "hu-HU" : "en-US"
  const intlWithSupported = Intl as Intl.DateTimeFormatOptions & {
    supportedValuesOf?: (key: "currency") => string[]
  }
  const listed = intlWithSupported.supportedValuesOf?.("currency") ?? []
  const displayNames =
    "DisplayNames" in Intl
      ? new Intl.DisplayNames([locale], { type: "currency" })
      : null
  const codes = Array.from(new Set([...FALLBACK_CURRENCIES, ...listed])).slice(0, 200)

  return codes.map((code: CurrencyCode) => {
    const name = displayNames?.of(code) ?? code
    const suffix = code === "HUF" ? "Ft" : code

    return {
      code,
      label: `${name} (${suffix})`
    }
  })
}

const IndexPopup = (): React.JSX.Element => {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })
  const [gradeToAmount, setGradeToAmount] = useState<GradeToAmountMap>({ ...DEFAULT_GRADE_TO_AMOUNT })
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>("compact")
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>("idle")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [language, setLanguage] = useState<AppLanguage>(detectLanguage())
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY)

  useEffect(() => {
    document.body.style.margin = "0"
  }, [])

  useEffect(() => {
    let disposed = false

    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await getStoredLanguage()

        if (!disposed && storedLanguage) {
          setLanguage(storedLanguage)
        }
      } catch {
        // Fallback stays on detected language.
      }
    }

    const loadStoredSettings = async () => {
      try {
        const stored = await getStoredGradeToAmount()

        if (!disposed) {
          setGradeToAmount(stored)
        }
      } catch {
        if (!disposed) {
          setGradeToAmount({ ...DEFAULT_GRADE_TO_AMOUNT })
        }
      }
    }

    const loadStoredTableViewMode = async () => {
      try {
        const storedMode = await getStoredTableViewMode()

        if (!disposed) {
          setTableViewMode(storedMode)
        }
      } catch {
        if (!disposed) {
          setTableViewMode("compact")
        }
      }
    }

    const loadStoredCurrency = async () => {
      try {
        const storedCurrency = await getStoredCurrency()

        if (!disposed) {
          setCurrency(storedCurrency)
        }
      } catch {
        if (!disposed) {
          setCurrency(DEFAULT_CURRENCY)
        }
      }
    }

    loadStoredLanguage()
    loadStoredSettings()
    loadStoredTableViewMode()
    loadStoredCurrency()

    return () => {
      disposed = true
    }
  }, [])

  useEffect(() => {
    let isDisposed = false

    const loadActiveTab = async () => {
      try {
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })

        if (isDisposed) {
          return
        }

        const activeUrl = activeTab?.url

        if (isSupportedUrl(activeUrl)) {
          if (!activeTab?.id) {
            setPopupState({
              status: "error",
              message: t(language, "missingTabId")
            })
            return
          }

          const extractionResult = await extractMonthlyEntries(activeTab.id, gradeToAmount)
          const monthSummaries = buildMonthSummaries(extractionResult)
          const grandTotal = monthSummaries.reduce((sum: number, month: MonthSummary) => sum + month.total, 0)
          const allFiveTotal = calculateAllFiveTotalWithMap(monthSummaries, gradeToAmount)

          if (monthSummaries.every((month: MonthSummary) => month.entries.length === 0)) {
            setPopupState({
              status: "empty",
              url: activeUrl,
              message: t(language, "emptyMessage")
            })
            return
          }

          setPopupState({
            status: "ready",
            url: activeUrl,
            monthSummaries,
            grandTotal,
            allFiveTotal
          })
          return
        }

        setPopupState({ status: "unsupported", url: activeUrl })
      } catch {
        if (!isDisposed) {
          setPopupState({
            status: "error",
            message: t(language, "activeTabCheckFailed")
          })
        }
      }
    }

    loadActiveTab()

    return () => {
      isDisposed = true
    }
  }, [gradeToAmount, language])

  const handleGradeValueChange = (grade: number, rawValue: string) => {
    const parsed = Number(rawValue)

    setSettingsStatus("idle")
    setGradeToAmount((prev: GradeToAmountMap) => ({
      ...prev,
      [grade]: Number.isFinite(parsed) ? Math.round(parsed) : 0
    }))
  }

  const handleSaveSettings = async () => {
    try {
      const normalized = normalizeGradeToAmountMap(gradeToAmount)
      await saveGradeToAmount(normalized)
      setGradeToAmount(normalized)
      setSettingsStatus("saved")
    } catch {
      setSettingsStatus("error")
    }
  }

  const handleResetDefaults = async () => {
    try {
      const defaults = await resetGradeToAmount()
      setGradeToAmount(defaults)
      setSettingsStatus("saved")
    } catch {
      setSettingsStatus("error")
    }
  }

  const handleLanguageChange = async () => {
    const next: AppLanguage = language === "hu" ? "en" : "hu"
    setLanguage(next)

    try {
      await saveLanguage(next)
    } catch {
      // Keep UI responsive even if saving language fails.
    }
  }

  const handleTableViewModeChange = async () => {
    const next: TableViewMode = tableViewMode === "compact" ? "detailed" : "compact"
    setTableViewMode(next)

    try {
      await saveTableViewMode(next)
    } catch {
      // Keep UI responsive even if saving table mode fails.
    }
  }

  const handleCurrencyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCurrency = event.target.value as CurrencyCode
    setCurrency(nextCurrency)

    try {
      await saveCurrency(nextCurrency)
    } catch {
      // Keep UI responsive even if saving currency fails.
    }
  }

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev: boolean) => !prev)
  }

  const settingsPanel = (
    <SettingsPanel
      gradeToAmount={gradeToAmount}
      currency={currency}
      settingsStatus={settingsStatus}
      currencyOptions={getCurrencyOptions(language)}
      onGradeValueChange={handleGradeValueChange}
      onCurrencyChange={handleCurrencyChange}
      onSaveSettings={handleSaveSettings}
      onResetDefaults={handleResetDefaults}
      t={(key: TranslationKey) => t(language, key)}
    />
  )

  const renderContent = () => {
    switch (popupState.status) {
      case "loading":
        return <LoadingView t={(key: TranslationKey) => t(language, key)} />
      case "ready":
        return (
          <>
            <SummaryHeader
              isSettingsOpen={isSettingsOpen}
              language={language}
              tableViewMode={tableViewMode}
              grandTotal={popupState.grandTotal}
              allFiveTotal={popupState.allFiveTotal}
              currency={currency}
              onTableViewModeChange={handleTableViewModeChange}
              onLanguageChange={handleLanguageChange}
              onSettingsToggle={handleSettingsToggle}
              t={(key: TranslationKey) => t(language, key)}
              formatAmount={formatAmount}
            />
            {isSettingsOpen ? (
              settingsPanel
            ) : (
              <MonthSummaryTable
                monthSummaries={popupState.monthSummaries}
                tableViewMode={tableViewMode}
                currency={currency}
                gradeToAmount={gradeToAmount}
                t={(key: TranslationKey) => t(language, key)}
              />
            )}
          </>
        )
      case "empty":
        return (
          <EmptyView
            t={(key: TranslationKey) => t(language, key)}
            message={popupState.message}
            url={popupState.url}
            settingsPanel={settingsPanel}
          />
        )
      case "unsupported":
        return (
          <UnsupportedView
            t={(key: TranslationKey) => t(language, key)}
            supportedPath={SUPPORTED_PATH}
            url={popupState.url}
            settingsPanel={settingsPanel}
          />
        )
      case "error":
        return (
          <ErrorView
            t={(key: TranslationKey) => t(language, key)}
            message={popupState.message}
            settingsPanel={settingsPanel}
          />
        )
    }
  }

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>{renderContent()}</section>
      <p style={{ ...hintStyle, textAlign: "center", marginTop: 6 }}>v{version}</p>
    </main>
  )
}

export default IndexPopup
