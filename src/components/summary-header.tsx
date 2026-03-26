import React from "react"
import {
  headingStyle
} from "../css-properties.constants"
import {
  flagButtonActiveStyle,
  summaryAmountsStyle,
  summaryControlsStyle,
  summaryStyle
} from "./summary-header.styles"
import { CompactViewIcon, DetailedViewIcon, EnFlagIcon, HuFlagIcon, SettingsIcon } from "../icons"
import type { AppLanguage, TranslationKey } from "../i18n"
import type { CurrencyCode, TableViewMode } from "../types"

type SummaryHeaderProps = {
  isSettingsOpen: boolean
  language: AppLanguage
  tableViewMode: TableViewMode
  grandTotal: number
  allFiveTotal: number
  currency: CurrencyCode
  onTableViewModeChange: () => void
  onLanguageChange: () => void
  onSettingsToggle: () => void
  t: (key: TranslationKey) => string
  formatAmount: (amount: number, currency: CurrencyCode) => string
}

export const SummaryHeader = ({
  isSettingsOpen,
  language,
  tableViewMode,
  grandTotal,
  allFiveTotal,
  currency,
  onTableViewModeChange,
  onLanguageChange,
  onSettingsToggle,
  t,
  formatAmount
}: SummaryHeaderProps): React.JSX.Element => (
  <>
    <h1 style={headingStyle}>{t(isSettingsOpen ? "settingsViewTitle" : "summaryTitle")}</h1>
    <div style={summaryStyle}>
      <div style={summaryAmountsStyle}>
        {t("grandTotal")}: <strong>{formatAmount(grandTotal, currency)}</strong> | {t("allFiveTotal")}:{" "}
        <strong>{formatAmount(allFiveTotal, currency)}</strong>
      </div>
      <div style={summaryControlsStyle}>
        <button
          type="button"
          title={tableViewMode === "compact" ? t("tableViewCompact") : t("tableViewDetailed")}
          onClick={onTableViewModeChange}
          style={flagButtonActiveStyle}>
          {tableViewMode === "compact" ? <CompactViewIcon /> : <DetailedViewIcon />}
        </button>
        <button
          type="button"
          title={language === "hu" ? t("languageHungarian") : t("languageEnglish")}
          onClick={onLanguageChange}
          style={flagButtonActiveStyle}>
          {language === "hu" ? <HuFlagIcon /> : <EnFlagIcon />}
        </button>
        <button
          type="button"
          title={t("settingsTitle")}
          aria-label={t("settingsTitle")}
          onClick={onSettingsToggle}
          style={flagButtonActiveStyle}>
          <SettingsIcon />
        </button>
      </div>
    </div>
  </>
)
