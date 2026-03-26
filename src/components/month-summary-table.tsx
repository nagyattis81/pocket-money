import React from "react"
import type { TranslationKey } from "../i18n"
import {
  hintStyle
} from "../css-properties.constants"
import {
  amountNegativeStyle,
  amountNeutralStyle,
  amountPositiveStyle,
  badgeStyle,
  bodyCellStyle,
  headerCellStyle,
  itemListStyle,
  tableStyle
} from "./month-summary-table.styles"
import { calculateMonthAllFiveTotalWithMap, formatAmount } from "../functions"
import type {
  CurrencyCode,
  GradeEntry,
  GradeToAmountMap,
  MonthSummary,
  TableViewMode
} from "../types"

type MonthSummaryTableProps = {
  monthSummaries: MonthSummary[]
  tableViewMode: TableViewMode
  currency: CurrencyCode
  gradeToAmount: GradeToAmountMap
  t: (key: TranslationKey) => string
}

export const MonthSummaryTable = ({
  monthSummaries,
  tableViewMode,
  currency,
  gradeToAmount,
  t
}: MonthSummaryTableProps): React.JSX.Element => (
  <table style={tableStyle}>
    <thead>
      <tr>
        <th style={{ ...headerCellStyle, width: "1%" }}>{t("month")}</th>
        {tableViewMode === "detailed" ? (
          <th style={headerCellStyle}>{t("gradesAndWeights")}</th>
        ) : null}
        <th style={{ ...headerCellStyle, width: "1%" }}>{t("total")}</th>
        <th style={{ ...headerCellStyle, width: "1%" }}>{t("monthlyAllFive")}</th>
      </tr>
    </thead>
    <tbody>
      {monthSummaries
        .filter((summary: MonthSummary) => summary.entries.length > 0)
        .map((summary: MonthSummary) => (
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
                        {entry.subject}: {entry.grade} ({entry.weight}%){" "}
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
                  <span style={hintStyle}>{t("noGrades")}</span>
                )}
              </td>
            ) : null}
            <td style={{ ...bodyCellStyle, whiteSpace: "nowrap" }}>
              {formatAmount(summary.total, currency)}
            </td>
            <td style={{ ...bodyCellStyle, whiteSpace: "nowrap" }}>
              {formatAmount(
                calculateMonthAllFiveTotalWithMap(summary, gradeToAmount),
                currency
              )}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
)
