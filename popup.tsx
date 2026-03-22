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
  headerCellStyle,
  headingStyle,
  hintStyle,
  itemListStyle,
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
  isSupportedUrl,
  normalizeGradeToAmountMap,
  resetGradeToAmount,
  saveGradeToAmount
} from "./functions"
import { detectLanguage, t } from "./i18n"
import type { GradeToAmountMap, PopupState, SettingsStatus } from "./types"

function IndexPopup() {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })
  const [gradeToAmount, setGradeToAmount] = useState<GradeToAmountMap>({ ...DEFAULT_GRADE_TO_AMOUNT })
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>("idle")
  const language = detectLanguage()

  useEffect(() => {
    document.body.style.margin = "0"
  }, [])

  useEffect(() => {
    let disposed = false

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

    loadStoredSettings()

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

  const renderSettingsPanel = () => (
    <section style={settingsPanelStyle}>
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
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>{t(language, "month")}</th>
                  <th style={headerCellStyle}>{t(language, "gradesAndWeights")}</th>
                  <th style={headerCellStyle}>{t(language, "total")}</th>
                </tr>
              </thead>
              <tbody>
                {popupState.monthSummaries.map((summary) => (
                  <tr key={summary.month}>
                    <td style={bodyCellStyle}>{summary.month}</td>
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
