import {
  DEFAULT_GRADE_TO_AMOUNT,
  GRADE_STORAGE_KEY,
  SUPPORTED_PATH,
  TABLE_VIEW_MODE_STORAGE_KEY
} from "./constants"
import type { GradeToAmountMap, MonthSummary, PageExtractionResult, TableViewMode } from "./types"

export function normalizeTableViewMode(value: unknown): TableViewMode {
  return value === "detailed" ? "detailed" : "compact"
}

export async function getStoredTableViewMode(): Promise<TableViewMode> {
  const stored = await chrome.storage.local.get(TABLE_VIEW_MODE_STORAGE_KEY)

  return normalizeTableViewMode(stored[TABLE_VIEW_MODE_STORAGE_KEY])
}

export async function saveTableViewMode(mode: TableViewMode) {
  await chrome.storage.local.set({
    [TABLE_VIEW_MODE_STORAGE_KEY]: normalizeTableViewMode(mode)
  })
}

export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/"
}

export function formatAmount(amount: number) {
  return `${amount > 0 ? "+" : ""}${amount} Ft`
}

export function buildMonthSummaries(result: PageExtractionResult) {
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

export function calculateAllFiveTotal(monthSummaries: MonthSummary[]) {
  const allFiveBase = DEFAULT_GRADE_TO_AMOUNT[5]

  return monthSummaries.reduce(
    (sum, month) =>
      sum +
      month.entries.reduce((monthSum, entry) => monthSum + Math.round((allFiveBase * entry.weight) / 100), 0),
    0
  )
}

export function normalizeGradeToAmountMap(input: unknown): GradeToAmountMap {
  const fallback = DEFAULT_GRADE_TO_AMOUNT
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {}
  const grades = [1, 2, 3, 4, 5]

  return grades.reduce<GradeToAmountMap>((acc, grade) => {
    const rawValue = source[String(grade)] ?? source[grade]
    const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue)
    acc[grade] = Number.isFinite(numericValue) ? Math.round(numericValue) : fallback[grade]

    return acc
  }, { ...fallback })
}

export async function getStoredGradeToAmount(): Promise<GradeToAmountMap> {
  const stored = await chrome.storage.local.get(GRADE_STORAGE_KEY)

  return normalizeGradeToAmountMap(stored[GRADE_STORAGE_KEY])
}

export async function saveGradeToAmount(gradeToAmount: GradeToAmountMap) {
  const normalized = normalizeGradeToAmountMap(gradeToAmount)

  await chrome.storage.local.set({
    [GRADE_STORAGE_KEY]: normalized
  })
}

export async function resetGradeToAmount() {
  await saveGradeToAmount(DEFAULT_GRADE_TO_AMOUNT)

  return { ...DEFAULT_GRADE_TO_AMOUNT }
}

export function calculateAllFiveTotalWithMap(
  monthSummaries: MonthSummary[],
  gradeToAmount: GradeToAmountMap
) {
  const allFiveBase = gradeToAmount[5] ?? DEFAULT_GRADE_TO_AMOUNT[5]

  return monthSummaries.reduce(
    (sum, month) =>
      sum +
      month.entries.reduce((monthSum, entry) => monthSum + Math.round((allFiveBase * entry.weight) / 100), 0),
    0
  )
}

export async function extractMonthlyEntries(
  tabId: number,
  gradeToAmount: GradeToAmountMap
): Promise<PageExtractionResult> {
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
    args: [normalizeGradeToAmountMap(gradeToAmount)]
  })

  if (!injectionResult?.result) {
    throw new Error("Nem sikerult kiolvasni az osztalyzatokat.")
  }

  return injectionResult.result
}

export function isSupportedUrl(rawUrl?: string) {
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