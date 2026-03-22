import React, { useEffect, useState } from "react"

const SUPPORTED_PATH = "/TanuloErtekeles/Osztalyzatok"
const GRADE_TO_AMOUNT: Record<number, number> = {
  1: -500,
  2: -300,
  3: 0,
  4: 300,
  5: 500
}

type GradeEntry = {
  subject: string
  month: string
  grade: number
  weight: number
  amount: number
  date: string
  kind: string
}

type PageExtractionResult = {
  months: string[]
  entries: GradeEntry[]
}

type MonthSummary = {
  month: string
  entries: GradeEntry[]
  total: number
}

type PopupState =
  | { status: "loading" }
  | {
      status: "ready"
      url: string
      monthSummaries: MonthSummary[]
      grandTotal: number
    }
  | { status: "empty"; url: string; message: string }
  | { status: "unsupported"; url?: string }
  | { status: "error"; message: string }

const containerStyle: React.CSSProperties = {
  padding: 16,
  width: 720,
  maxWidth: "100vw",
  fontFamily: "Segoe UI, sans-serif",
  background: "#f5f1e8",
  color: "#1f2937"
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 16,
  background: "#fffaf0",
  border: "1px solid #d6c7a1",
  boxShadow: "0 8px 24px rgba(84, 62, 24, 0.08)"
}

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700
}

const textStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.5
}

const hintStyle: React.CSSProperties = {
  ...textStyle,
  color: "#6b7280",
  wordBreak: "break-word"
}

const summaryStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  background: "#f0ead6",
  border: "1px solid #d6c7a1",
  fontSize: 15,
  fontWeight: 700
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 16,
  borderCollapse: "collapse",
  fontSize: 13,
  background: "#fff"
}

const headerCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  borderBottom: "2px solid #d6c7a1",
  verticalAlign: "top"
}

const bodyCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #eadfbe",
  verticalAlign: "top"
}

const itemListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#f7f1dc",
  border: "1px solid #e4d4a6",
  lineHeight: 1.4
}

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/"
}

function formatAmount(amount: number) {
  return `${amount > 0 ? "+" : ""}${amount} Ft`
}

function buildMonthSummaries(result: PageExtractionResult) {
  return result.months.map((month) => {
    const entries = result.entries.filter((entry) => entry.month === month)
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0)

    return {
      month,
      entries,
      total
    }
  })
}

async function extractMonthlyEntries(tabId: number): Promise<PageExtractionResult> {
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (gradeToAmount) => {
      const gradeTable = document.querySelector<HTMLTableElement>("table.TanuloErtekelesGrid")

      if (!gradeTable) {
        throw new Error("Az osztalyzatok tablazat nem talalhato.")
      }

      const normalizeText = (value: string | null | undefined) =>
        value?.replace(/\s+/g, " ").trim() ?? ""

      const parseWeight = (rawWeight: string | undefined) => {
        const match = rawWeight?.match(/(\d+)/)

        return match ? Number(match[1]) : 100
      }

      const ignoredHeaders = new Set(["", "#", "Tantárgy", "I", "II", "Átlag", "Átlag (%)"])
      const monthColumns = Array.from(gradeTable.querySelectorAll<HTMLTableCellElement>("thead th"))
        .map((cell, index) => ({
          index,
          label: normalizeText(cell.textContent)
        }))
        .filter(
          (column) =>
            !ignoredHeaders.has(column.label) && /^\d{2}(?:\/[A-Z]+)?$/i.test(column.label)
        )

      const months = monthColumns.map((column) => column.label)
      const entries: Array<{
        subject: string
        month: string
        grade: number
        weight: number
        amount: number
        date: string
        kind: string
      }> = []

      for (const row of gradeTable.querySelectorAll<HTMLTableRowElement>("tbody tr.k-master-row")) {
        const cells = Array.from(row.children) as HTMLTableCellElement[]
        const subject = normalizeText(cells[2]?.textContent)

        if (!subject) {
          continue
        }

        for (const column of monthColumns) {
          const cell = cells[column.index]

          if (!cell) {
            continue
          }

          for (const gradeNode of cell.querySelectorAll<HTMLSpanElement>('span[data-tanuloertekeles]')) {
            const grade = Number(gradeNode.dataset.tanuloertekeles ?? normalizeText(gradeNode.textContent))

            if (!Number.isInteger(grade) || !(grade in gradeToAmount)) {
              continue
            }

            const weight = parseWeight(gradeNode.dataset.suly)
            const baseAmount = gradeToAmount[grade as keyof typeof gradeToAmount] ?? 0

            entries.push({
              subject,
              month: column.label,
              grade,
              weight,
              amount: Math.round((baseAmount * weight) / 100),
              date: gradeNode.dataset.datum ?? "",
              kind: gradeNode.dataset.tipusmod ?? ""
            })
          }
        }
      }

      return { months, entries }
    },
    args: [GRADE_TO_AMOUNT]
  })

  if (!injectionResult?.result) {
    throw new Error("Nem sikerult kiolvasni az osztalyzatokat.")
  }

  return injectionResult.result
}

function isSupportedUrl(rawUrl?: string) {
  if (!rawUrl) {
    return false
  }

  try {
    const url = new URL(rawUrl)

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".e-kreta.hu") &&
      normalizePath(url.pathname) === SUPPORTED_PATH
    )
  } catch {
    return false
  }
}

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
            grandTotal
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
