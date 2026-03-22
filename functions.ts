import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_GRADE_TO_AMOUNT,
  DEFAULT_CURRENCY,
  GRADE_STORAGE_KEY,
  SUPPORTED_PATH,
  TABLE_VIEW_MODE_STORAGE_KEY
} from "./constants"
import type { CurrencyCode, GradeEntry, GradeToAmountMap, MonthSummary, PageExtractionResult, TableViewMode } from "./types"

export const normalizeTableViewMode = (value: unknown): TableViewMode => value === "detailed" ? "detailed" : "compact"

export const getStoredTableViewMode = async (): Promise<TableViewMode> => {
  const stored = await chrome.storage.local.get(TABLE_VIEW_MODE_STORAGE_KEY)

  return normalizeTableViewMode(stored[TABLE_VIEW_MODE_STORAGE_KEY])
}

export const saveTableViewMode = async (mode: TableViewMode): Promise<void> => {
  await chrome.storage.local.set({
    [TABLE_VIEW_MODE_STORAGE_KEY]: normalizeTableViewMode(mode)
  })
}

export const normalizePath = (pathname: string): string => pathname.replace(/\/+$/, "") || "/"

export const normalizeCurrency = (value: unknown): CurrencyCode => {
  if (value === "Ft") {
    return "HUF"
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase()

    if (/^[A-Z]{3}$/.test(normalized)) {
      return normalized
    }
  }

  return DEFAULT_CURRENCY
}

export const getStoredCurrency = async (): Promise<CurrencyCode> => {
  const stored = await chrome.storage.local.get(CURRENCY_STORAGE_KEY)

  return normalizeCurrency(stored[CURRENCY_STORAGE_KEY])
}

export const saveCurrency = async (currency: CurrencyCode): Promise<void> => {
  await chrome.storage.local.set({
    [CURRENCY_STORAGE_KEY]: normalizeCurrency(currency)
  })
}

export const formatAmount = (amount: number, currency: CurrencyCode = DEFAULT_CURRENCY as CurrencyCode): string => {
  const currencyLabel = currency === "HUF" ? "Ft" : currency

  return `${amount > 0 ? "+" : ""}${amount} ${currencyLabel}`
}

export const buildMonthSummaries = (result: PageExtractionResult): MonthSummary[] => result.months.map((month: string) => {
    const entries = result.entries.filter((entry: GradeEntry) => entry.month === month)
    const total = entries.reduce((sum: number, entry: GradeEntry) => sum + entry.amount, 0)

    return {
      month,
      entries,
      total
    }
  })

export const calculateAllFiveTotal = (monthSummaries: MonthSummary[]): number => {
  const allFiveBase = DEFAULT_GRADE_TO_AMOUNT[5]

  return monthSummaries.reduce(
    (sum: number, month: MonthSummary) =>
      sum +
      month.entries.reduce((monthSum: number, entry: GradeEntry) => monthSum + Math.round((allFiveBase * entry.weight) / 100), 0),
    0
  )
}

export const normalizeGradeToAmountMap = (input: unknown): GradeToAmountMap => {
  const fallback = DEFAULT_GRADE_TO_AMOUNT
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {}
  const grades = [1, 2, 3, 4, 5]

  return grades.reduce<GradeToAmountMap>((acc: GradeToAmountMap, grade: number) => {
    const rawValue = source[String(grade)] ?? source[grade]
    const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue)
    acc[grade] = Number.isFinite(numericValue) ? Math.round(numericValue) : fallback[grade]

    return acc
  }, { ...fallback })
}

export const getStoredGradeToAmount = async (): Promise<GradeToAmountMap> => {
  const stored = await chrome.storage.local.get(GRADE_STORAGE_KEY)

  return normalizeGradeToAmountMap(stored[GRADE_STORAGE_KEY])
}

export const saveGradeToAmount = async (gradeToAmount: GradeToAmountMap): Promise<void> => {
  const normalized = normalizeGradeToAmountMap(gradeToAmount)

  await chrome.storage.local.set({
    [GRADE_STORAGE_KEY]: normalized
  })
}

export const resetGradeToAmount = async (): Promise<GradeToAmountMap> => {
  await saveGradeToAmount(DEFAULT_GRADE_TO_AMOUNT)

  return { ...DEFAULT_GRADE_TO_AMOUNT }
}

export const calculateAllFiveTotalWithMap = (
  monthSummaries: MonthSummary[],
  gradeToAmount: GradeToAmountMap
): number => {
  const allFiveBase = gradeToAmount[5] ?? DEFAULT_GRADE_TO_AMOUNT[5]

  return monthSummaries.reduce(
    (sum: number, month: MonthSummary) =>
      sum +
      month.entries.reduce((monthSum: number, entry: GradeEntry) => monthSum + Math.round((allFiveBase * entry.weight) / 100), 0),
    0
  )
}

export const calculateMonthAllFiveTotalWithMap = (
  monthSummary: MonthSummary,
  gradeToAmount: GradeToAmountMap
): number => {
  const allFiveBase = gradeToAmount[5] ?? DEFAULT_GRADE_TO_AMOUNT[5]

  return monthSummary.entries.reduce(
    (monthSum: number, entry: GradeEntry) => monthSum + Math.round((allFiveBase * entry.weight) / 100),
    0
  )
}

export const extractMonthlyEntries = async (
  tabId: number,
  gradeToAmount: GradeToAmountMap
): Promise<PageExtractionResult> => {
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (gradeToAmount: GradeToAmountMap) => {
      const gradeTable = document.querySelector<HTMLTableElement>("table.TanuloErtekelesGrid")

      if (!gradeTable) {
        throw new Error("The grades table was not found on the page.")
      }

      const normalizeText = (value: string | null | undefined): string =>
        value?.replace(/\s+/g, " ").trim() ?? ""

      const parseWeight = (rawWeight: string | undefined): number => {
        const match = rawWeight?.match(/(\d+)/)

        return match ? Number(match[1]) : 100
      }

      const ignoredHeaders = new Set(["", "#", "Tantárgy", "I", "II", "Átlag", "Átlag (%)"])
      const monthColumns = Array.from(gradeTable.querySelectorAll<HTMLTableCellElement>("thead th"))
        .map((cell: HTMLTableCellElement, index: number) => ({
          index,
          label: normalizeText(cell.textContent)
        }))
        .filter(
          (column: { index: number; label: string }) =>
            !ignoredHeaders.has(column.label) && /^\d{2}(?:\/[A-Z]+)?$/i.test(column.label)
        )

      const months = monthColumns.map((column: { index: number; label: string }) => column.label)
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
    throw new Error("Failed to extract grades.")
  }

  return injectionResult.result
}

export const isSupportedUrl = (rawUrl?: string): boolean => {
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