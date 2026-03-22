import { beforeEach, describe, expect, it, vi } from "vitest"

import { DEFAULT_GRADE_TO_AMOUNT } from "./constants"
import {
  buildMonthSummaries,
  calculateAllFiveTotalWithMap,
  calculateMonthAllFiveTotalWithMap,
  formatAmount,
  getStoredCurrency,
  getStoredGradeToAmount,
  getStoredTableViewMode,
  isSupportedUrl,
  normalizeCurrency,
  normalizeGradeToAmountMap,
  normalizePath,
  normalizeTableViewMode,
  saveCurrency,
  saveGradeToAmount,
  saveTableViewMode
} from "./functions"
import { chromeMock, mockStorage } from "./test-setup"
import type {
  GradeToAmountMap,
  MonthSummary,
  PageExtractionResult
} from "./types"

describe("functions helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("normalizes path and keeps root path stable", () => {
    expect(normalizePath("/TanuloErtekeles/Osztalyzatok///")).toBe(
      "/TanuloErtekeles/Osztalyzatok"
    )
    expect(normalizePath("/")).toBe("/")
  })

  it("normalizes currency values with legacy Ft support", () => {
    expect(normalizeCurrency("Ft")).toBe("HUF")
    expect(normalizeCurrency("eur")).toBe("EUR")
    expect(normalizeCurrency("bad-value")).toBe("HUF")
  })

  it("normalizes table view mode safely", () => {
    expect(normalizeTableViewMode("compact")).toBe("compact")
    expect(normalizeTableViewMode("detailed")).toBe("detailed")
    expect(normalizeTableViewMode("other")).toBe("compact")
  })

  it("formats amounts with currency label", () => {
    expect(formatAmount(500, "HUF")).toBe("+500 Ft")
    expect(formatAmount(-300, "EUR")).toBe("-300 EUR")
  })

  it("normalizes grade map and falls back for invalid values", () => {
    const normalized = normalizeGradeToAmountMap({
      1: "-100",
      2: null,
      3: 10.4,
      4: "abc",
      5: 999
    })

    expect(normalized).toEqual({
      1: -100,
      2: 0,
      3: 10,
      4: DEFAULT_GRADE_TO_AMOUNT[4],
      5: 999
    })
  })

  it("builds month summaries from extracted entries", () => {
    const result: PageExtractionResult = {
      months: ["09", "10"],
      entries: [
        {
          subject: "Math",
          month: "09",
          grade: 5,
          weight: 100,
          amount: 500,
          date: "",
          kind: ""
        },
        {
          subject: "History",
          month: "09",
          grade: 4,
          weight: 100,
          amount: 300,
          date: "",
          kind: ""
        },
        {
          subject: "Biology",
          month: "10",
          grade: 3,
          weight: 100,
          amount: 0,
          date: "",
          kind: ""
        }
      ]
    }

    const summaries = buildMonthSummaries(result)

    expect(summaries).toHaveLength(2)
    expect(summaries[0]?.total).toBe(800)
    expect(summaries[1]?.total).toBe(0)
  })

  it("calculates all-five totals for full and monthly summaries", () => {
    const monthSummaries: MonthSummary[] = [
      {
        month: "09",
        total: 200,
        entries: [
          {
            subject: "Math",
            month: "09",
            grade: 4,
            weight: 200,
            amount: 600,
            date: "",
            kind: ""
          },
          {
            subject: "Biology",
            month: "09",
            grade: 3,
            weight: 50,
            amount: 0,
            date: "",
            kind: ""
          }
        ]
      }
    ]

    const gradeMap: GradeToAmountMap = {
      ...DEFAULT_GRADE_TO_AMOUNT,
      5: 500
    }

    expect(calculateAllFiveTotalWithMap(monthSummaries, gradeMap)).toBe(1250)
    expect(calculateMonthAllFiveTotalWithMap(monthSummaries[0], gradeMap)).toBe(
      1250
    )
  })

  it("validates supported e-kreta urls", () => {
    expect(
      isSupportedUrl("https://abc.e-kreta.hu/TanuloErtekeles/Osztalyzatok")
    ).toBe(true)
    expect(
      isSupportedUrl("https://abc.e-kreta.hu/TanuloErtekeles/Osztalyzatok/")
    ).toBe(true)
    expect(
      isSupportedUrl("http://abc.e-kreta.hu/TanuloErtekeles/Osztalyzatok")
    ).toBe(false)
    expect(
      isSupportedUrl("https://example.com/TanuloErtekeles/Osztalyzatok")
    ).toBe(false)
  })
})

describe("chrome storage wrappers", () => {
  it("reads and writes table view mode", async () => {
    mockStorage.tableViewMode = "detailed"

    expect(await getStoredTableViewMode()).toBe("detailed")

    await saveTableViewMode("compact")

    expect(mockStorage.tableViewMode).toBe("compact")
    expect(chromeMock.storage.local.set).toHaveBeenCalledTimes(1)
  })

  it("reads and writes currency", async () => {
    mockStorage.currency = "Ft"

    expect(await getStoredCurrency()).toBe("HUF")

    await saveCurrency("usd")

    expect(mockStorage.currency).toBe("USD")
  })

  it("reads and writes grade map", async () => {
    mockStorage.gradeToAmount = {
      1: -100,
      2: -50,
      3: 0,
      4: 50,
      5: 100
    }

    expect(await getStoredGradeToAmount()).toEqual({
      1: -100,
      2: -50,
      3: 0,
      4: 50,
      5: 100
    })

    await saveGradeToAmount({
      1: -200,
      2: -100,
      3: 0,
      4: 100,
      5: 200
    })

    expect(mockStorage.gradeToAmount).toEqual({
      1: -200,
      2: -100,
      3: 0,
      4: 100,
      5: 200
    })
  })
})
