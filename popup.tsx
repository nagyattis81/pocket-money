import React, { useEffect, useState } from "react"
import {
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
  flagButtonInactiveStyle,
  headerCellStyle,
  headingStyle,
  hintStyle,
  itemListStyle,
  languageRowStyle,
  languageSelectStyle,
  settingsActionsStyle,
  settingsButtonStyle,
  settingsGridStyle,
  settingsInputStyle,
  settingsPanelStyle,
  settingsStatusStyle,
  summaryStyle,
  tableStyle,
  textStyle
} from "./css-properties.constants"
import {
  buildMonthSummaries,
  calculateAllFiveTotalWithMap,
  extractMonthlyEntries,
  formatAmount,
  getStoredGradeToAmount,
  getStoredTableViewMode,
  isSupportedUrl,
  normalizeGradeToAmountMap,
  resetGradeToAmount,
  saveGradeToAmount,
  saveTableViewMode
} from "./functions"
import { detectLanguage, getStoredLanguage, saveLanguage, t } from "./i18n"
import type { AppLanguage } from "./i18n"
import type { GradeToAmountMap, PopupState, SettingsStatus, TableViewMode } from "./types"

function IndexPopup() {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })
  const [gradeToAmount, setGradeToAmount] = useState<GradeToAmountMap>({ ...DEFAULT_GRADE_TO_AMOUNT })
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>("compact")
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>("idle")
  const [language, setLanguage] = useState<AppLanguage>(detectLanguage())

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

    loadStoredLanguage()
    loadStoredSettings()
    loadStoredTableViewMode()

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
          const grandTotal = monthSummaries.reduce((sum, month) => sum + month.total, 0)
          const allFiveTotal = calculateAllFiveTotalWithMap(monthSummaries, gradeToAmount)

          if (monthSummaries.every((month) => month.entries.length === 0)) {
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
    setGradeToAmount((prev) => ({
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

  const handleLanguageChange = async (lang: AppLanguage) => {
    setLanguage(lang)

    try {
      await saveLanguage(lang)
    } catch {
      // Keep UI responsive even if saving language fails.
    }
  }

  const handleTableViewModeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMode: TableViewMode = event.target.value === "detailed" ? "detailed" : "compact"

    setTableViewMode(selectedMode)

    try {
      await saveTableViewMode(selectedMode)
    } catch {
      // Keep UI responsive even if saving table mode fails.
    }
  }

  const renderSettingsPanel = () => (
    <section style={settingsPanelStyle}>
      <div style={languageRowStyle}>
        <span>{t(language, "languageTitle")}:</span>
        <button
          type="button"
          title={t(language, "languageHungarian")}
          onClick={() => handleLanguageChange("hu")}
          style={language === "hu" ? flagButtonActiveStyle : flagButtonInactiveStyle}>
          <svg width="28" height="18" viewBox="0 0 3 2" style={{ display: "block", borderRadius: 2 }}>
            <rect width="3" height="0.667" fill="#CE2939" />
            <rect width="3" height="0.667" y="0.667" fill="#FFFFFF" />
            <rect width="3" height="0.667" y="1.333" fill="#477050" />
          </svg>
        </button>
        <button
          type="button"
          title={t(language, "languageEnglish")}
          onClick={() => handleLanguageChange("en")}
          style={language === "en" ? flagButtonActiveStyle : flagButtonInactiveStyle}>
          <svg width="28" height="18" viewBox="0 0 60 40" style={{ display: "block", borderRadius: 2 }}>
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12" />
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
          </svg>
        </button>
      </div>
      <h2 style={headingStyle}>{t(language, "settingsTitle")}</h2>
      <p style={textStyle}>{t(language, "settingsHint")}</p>
      <div style={settingsGridStyle}>
        {[1, 2, 3, 4, 5].map((grade) => (
          <label key={grade}>
            {grade}
            <input
              type="number"
              value={gradeToAmount[grade] ?? 0}
              onChange={(event) => handleGradeValueChange(grade, event.target.value)}
              style={settingsInputStyle}
            />
          </label>
        ))}
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
              {t(language, "grandTotal")}: <strong>{formatAmount(popupState.grandTotal)}</strong> | {t(language, "allFiveTotal")}:{" "}
              <strong>{formatAmount(popupState.allFiveTotal)}</strong>
            </div>
            <div style={languageRowStyle}>
              <span>{t(language, "tableViewTitle")}:</span>
              <select value={tableViewMode} onChange={handleTableViewModeChange} style={languageSelectStyle}>
                <option value="compact">{t(language, "tableViewCompact")}</option>
                <option value="detailed">{t(language, "tableViewDetailed")}</option>
              </select>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>{t(language, "month")}</th>
                  {tableViewMode === "detailed" ? (
                    <th style={headerCellStyle}>{t(language, "gradesAndWeights")}</th>
                  ) : null}
                  <th style={headerCellStyle}>{t(language, "total")}</th>
                </tr>
              </thead>
              <tbody>
                {popupState.monthSummaries.map((summary) => (
                  <tr key={summary.month}>
                    <td style={bodyCellStyle}>{summary.month}</td>
                    {tableViewMode === "detailed" ? (
                      <td style={bodyCellStyle}>
                        {summary.entries.length > 0 ? (
                          <div style={itemListStyle}>
                            {summary.entries.map((entry, index) => (
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
                                  {formatAmount(entry.amount)}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={hintStyle}>{t(language, "noGrades")}</span>
                        )}
                      </td>
                    ) : null}
                    <td style={bodyCellStyle}>{formatAmount(summary.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderSettingsPanel()}
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
    </main>
  )
}

export default IndexPopup
