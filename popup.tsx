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
  secondarySummaryStyle,
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
import type { PopupState } from "./types"

function IndexPopup() {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })

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
              message: "Az aktiv lap azonositoja nem erheto el."
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
              message: "Nem talaltam kiolvashato szamjegyes 1-5 osztalyzatokat a havi oszlopokban."
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
            message: "Az aktiv lap nem ellenorizheto."
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
            <h1 style={headingStyle}>eKreta pocket money</h1>
            <p style={textStyle}>Az aktiv lap ellenorzese folyamatban van.</p>
          </>
        )
      case "ready":
        return (
          <>
            <h1 style={headingStyle}>Havi zsebpenz osszesito</h1>
            <p style={textStyle}>
              Az `I`, `II`, `Atlag` es `Atlag (%)` oszlopok kihagyva.
            </p>
            <p style={hintStyle}>{popupState.url}</p>
            <div style={summaryStyle}>Vegosszeg: {formatAmount(popupState.grandTotal)}</div>
            <div style={secondarySummaryStyle}>
              Osszeg, ha minden jegy 5-os lenne: {formatAmount(popupState.allFiveTotal)}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Honap</th>
                  <th style={headerCellStyle}>Jegyek es sulyok</th>
                  <th style={headerCellStyle}>Osszesen</th>
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
                        <span style={hintStyle}>Nincs jegy</span>
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
            <h1 style={headingStyle}>Nincs kiolvashato jegy</h1>
            <p style={textStyle}>{popupState.message}</p>
            <p style={hintStyle}>{popupState.url}</p>
          </>
        )
      case "unsupported":
        return (
          <>
            <h1 style={headingStyle}>Nem tamogatott oldal</h1>
            <p style={textStyle}>
              A bovitmeny csak az eKreta Osztalyzatok oldalon mukodik.
            </p>
            <p style={hintStyle}>
              Nyisd meg ezt az utvonalat: https://*.e-kreta.hu{SUPPORTED_PATH}
            </p>
            {popupState.url ? <p style={hintStyle}>{popupState.url}</p> : null}
          </>
        )
      case "error":
        return (
          <>
            <h1 style={headingStyle}>Ellenorzes sikertelen</h1>
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
