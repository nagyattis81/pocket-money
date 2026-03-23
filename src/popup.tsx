import React, { useEffect, useState } from "react"
import { version } from "../package.json"
import {
  DEFAULT_CURRENCY,
  DEFAULT_GRADE_TO_AMOUNT,
  SUPPORTED_PATH
} from "./constants"
import {
  amountNegativeStyle,
  amountNeutralStyle,
  amountPositiveStyle,
  badgeStyle,
  bodyCellStyle,
  cardStyle,
  containerStyle,
  flagButtonActiveStyle,
  headerCellStyle,
  headingStyle,
  hintStyle,
  itemListStyle,
  settingsActionsStyle,
  settingsButtonStyle,
  settingsCurrencyGroupStyle,
  settingsCurrencyPrefixStyle,
  settingsCurrencySelectStyle,
  settingsFieldLabelStyle,
  settingsFieldStyle,
  settingsGridStyle,
  settingsInputStyle,
  settingsPanelStyle,
  settingsStatusStyle,
  settingsUnitStyle,
  summaryAmountsStyle,
  summaryControlsStyle,
  summaryStyle,
  tableStyle,
  textStyle
} from "./css-properties.constants"
import {
  buildMonthSummaries,
  calculateMonthAllFiveTotalWithMap,
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
import { CompactViewIcon, DetailedViewIcon, EnFlagIcon, HuFlagIcon, SettingsIcon } from "./icons"
import { detectLanguage, getStoredLanguage, saveLanguage, t } from "./i18n"
import type { AppLanguage } from "./i18n"
import type { CurrencyCode, GradeEntry, GradeToAmountMap, MonthSummary, PopupState, SettingsStatus, TableViewMode } from "./types"

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

  const renderSettingsPanel = () => (
    <section style={settingsPanelStyle}>
      <h2 style={headingStyle}>{t(language, "settingsTitle")}</h2>
      <p style={textStyle}>{t(language, "settingsHint")}</p>
      <div style={settingsGridStyle}>
        {[1, 2, 3, 4, 5].map((grade: number) => (
          <label key={grade} style={settingsFieldStyle}>
            <span style={settingsFieldLabelStyle}>{grade}</span>
            <input
              type="number"
              value={gradeToAmount[grade] ?? 0}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleGradeValueChange(grade, event.target.value)}
              style={settingsInputStyle}
            />
            <span style={settingsUnitStyle}>{currency === "HUF" ? "Ft" : currency}</span>
          </label>
        ))}
      </div>
      <div style={settingsCurrencyGroupStyle}>
        <span style={settingsCurrencyPrefixStyle}>{t(language, "currencyLabel")}</span>
        <select value={currency} onChange={handleCurrencyChange} style={settingsCurrencySelectStyle}>
          {getCurrencyOptions(language).map((item: { code: CurrencyCode; label: string }) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div style={settingsActionsStyle}>
        <button type="button" onClick={handleSaveSettings} style={settingsButtonStyle}>
          {t(language, "saveSettings")}
        </button>
        <button type="button" onClick={handleResetDefaults} style={settingsButtonStyle}>
          {t(language, "resetDefaults")}
        </button>
      </div>
      {settingsStatus === "saved" ? (
        <div style={settingsStatusStyle}>{t(language, "settingsSaved")}</div>
      ) : settingsStatus === "error" ? (
        <div style={settingsStatusStyle}>{t(language, "settingsSaveFailed")}</div>
      ) : null}
    </section>
  )

  const renderContent = () => {
    switch (popupState.status) {
      case "loading":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "loadingTitle")}</h1>
            <p style={textStyle}>{t(language, "loadingMessage")}</p>
          </>
        )
      case "ready":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "summaryTitle")}</h1>
            <div style={summaryStyle}>
              <div style={summaryAmountsStyle}>
                {t(language, "grandTotal")}: <strong>{formatAmount(popupState.grandTotal, currency)}</strong> | {t(language, "allFiveTotal")}:{" "}
                <strong>{formatAmount(popupState.allFiveTotal, currency)}</strong>
              </div>
              <div style={summaryControlsStyle}>
                <button
                  type="button"
                  title={tableViewMode === "compact" ? t(language, "tableViewCompact") : t(language, "tableViewDetailed")}
                  onClick={handleTableViewModeChange}
                  style={flagButtonActiveStyle}>
                  {tableViewMode === "compact" ? <CompactViewIcon /> : <DetailedViewIcon />}
                </button>
                <button
                  type="button"
                  title={language === "hu" ? t(language, "languageHungarian") : t(language, "languageEnglish")}
                  onClick={handleLanguageChange}
                  style={flagButtonActiveStyle}>
                  {language === "hu" ? <HuFlagIcon /> : <EnFlagIcon />}
                </button>
                <button
                  type="button"
                  title={t(language, "settingsTitle")}
                  aria-label={t(language, "settingsTitle")}
                  onClick={handleSettingsToggle}
                  style={flagButtonActiveStyle}>
                  <SettingsIcon />
                </button>
              </div>
            </div>
            {isSettingsOpen ? renderSettingsPanel() : null}
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...headerCellStyle, width:"1%" }}>{t(language, "month")}</th>
                  {tableViewMode === "detailed" ? (
                    <th style={headerCellStyle}>{t(language, "gradesAndWeights")}</th>
                  ) : null}
                  <th style={{ ...headerCellStyle, width:"1%" }}>{t(language, "total")}</th>
                  <th style={{ ...headerCellStyle, width:"1%" }}>{t(language, "monthlyAllFive")}</th>
                </tr>
              </thead>
              <tbody>
                {popupState.monthSummaries.filter((summary: MonthSummary) => summary.entries.length > 0).map((summary: MonthSummary) => (
                  <tr key={summary.month}>
                    <td style={bodyCellStyle}>{summary.month}</td>
                    {tableViewMode === "detailed" ? (
                      <td style={bodyCellStyle}>
                        {summary.entries.length > 0 ? (
                          <div style={itemListStyle}>
                            {summary.entries.map((entry: GradeEntry, index: number) => (
                              <span
                                key={`${summary.month}-${entry.subject}-${entry.date}-${index}`}
                                style={badgeStyle}>
                                {entry.subject}: {entry.grade} ({entry.weight}%)
                                {" "}
                                <span
                                  style={
                                    entry.amount > 0
                                      ? amountPositiveStyle
                                      : entry.amount < 0
                                        ? amountNegativeStyle
                                        : amountNeutralStyle
                                  }>
                                  {formatAmount(entry.amount, currency)}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={hintStyle}>{t(language, "noGrades")}</span>
                        )}
                      </td>
                    ) : null}
                    <td style={{ ...bodyCellStyle, whiteSpace: "nowrap" }}>{formatAmount(summary.total, currency)}</td>
                    <td style={{ ...bodyCellStyle, whiteSpace: "nowrap" }}>{formatAmount(calculateMonthAllFiveTotalWithMap(summary, gradeToAmount), currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      case "empty":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "emptyTitle")}</h1>
            <p style={textStyle}>{popupState.message}</p>
            <p style={hintStyle}>{popupState.url}</p>
            {renderSettingsPanel()}
          </>
        )
      case "unsupported":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "unsupportedTitle")}</h1>
            <p style={textStyle}>{t(language, "unsupportedMessage")}</p>
            <p style={hintStyle}>
              {t(language, "unsupportedHintPrefix")} https://*.e-kreta.hu{SUPPORTED_PATH}
            </p>
            {popupState.url ? <p style={hintStyle}>{popupState.url}</p> : null}
            {renderSettingsPanel()}
          </>
        )
      case "error":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "errorTitle")}</h1>
            <p style={textStyle}>{popupState.message}</p>
            {renderSettingsPanel()}
          </>
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
