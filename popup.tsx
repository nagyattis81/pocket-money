import React, { useEffect, useState } from "react"
import {
  SUPPORTED_PATH
} from "./constants"
import {
  badgeStyle,
  bodyCellStyle,
  cardStyle,
  containerStyle,
  headerCellStyle,
  headingStyle,
  hintStyle,
  itemListStyle,
  summaryStyle,
  tableStyle,
  textStyle
} from "./css-properties.constants"
import {
  buildMonthSummaries,
  calculateAllFiveTotal,
  extractMonthlyEntries,
  formatAmount,
  isSupportedUrl
} from "./functions"
import { detectLanguage, t } from "./i18n"
import type { PopupState } from "./types"

function IndexPopup() {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })
  const language = detectLanguage()

  useEffect(() => {
    document.body.style.margin = "0"
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

          const extractionResult = await extractMonthlyEntries(activeTab.id)
          const monthSummaries = buildMonthSummaries(extractionResult)
          const grandTotal = monthSummaries.reduce((sum, month) => sum + month.total, 0)
          const allFiveTotal = calculateAllFiveTotal(monthSummaries)

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
  }, [])

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
                              {entry.subject}: {entry.grade} ({entry.weight}%) {formatAmount(entry.amount)}
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
          </>
        )
      case "empty":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "emptyTitle")}</h1>
            <p style={textStyle}>{popupState.message}</p>
            <p style={hintStyle}>{popupState.url}</p>
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
          </>
        )
      case "error":
        return (
          <>
            <h1 style={headingStyle}>{t(language, "errorTitle")}</h1>
            <p style={textStyle}>{popupState.message}</p>
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
