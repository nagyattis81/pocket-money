import React from "react"
import {
  headingStyle,
  textStyle
} from "../css-properties.constants"
import {
  settingsActionsStyle,
  settingsButtonStyle,
  settingsCurrencyGroupStyle,
  settingsCurrencyPrefixStyle,
  settingsCurrencySelectStyle,
  settingsFieldLabelStyle,
  settingsFieldStyle,
  settingsGridStyle,
  settingsInputStyle,
  settingsPanelStyle,
  settingsStatusStyle,
  settingsUnitStyle
} from "./settings-panel.styles"
import type { TranslationKey } from "../i18n"
import type { CurrencyCode, GradeToAmountMap, SettingsStatus } from "../types"

type CurrencyOption = {
  code: CurrencyCode
  label: string
}

type SettingsPanelProps = {
  gradeToAmount: GradeToAmountMap
  currency: CurrencyCode
  settingsStatus: SettingsStatus
  currencyOptions: CurrencyOption[]
  onGradeValueChange: (grade: number, rawValue: string) => void
  onCurrencyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onSaveSettings: () => void
  onResetDefaults: () => void
  t: (key: TranslationKey) => string
}

export const SettingsPanel = ({
  gradeToAmount,
  currency,
  settingsStatus,
  currencyOptions,
  onGradeValueChange,
  onCurrencyChange,
  onSaveSettings,
  onResetDefaults,
  t
}: SettingsPanelProps): React.JSX.Element => (
  <section style={settingsPanelStyle}>
    <h2 style={headingStyle}>{t("settingsTitle")}</h2>
    <p style={textStyle}>{t("settingsHint")}</p>
    <div style={settingsGridStyle}>
      {[1, 2, 3, 4, 5].map((grade: number) => (
        <label key={grade} style={settingsFieldStyle}>
          <span style={settingsFieldLabelStyle}>{grade}</span>
          <input
            type="number"
            value={gradeToAmount[grade] ?? 0}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onGradeValueChange(grade, event.target.value)
            }
            style={settingsInputStyle}
          />
          <span style={settingsUnitStyle}>{currency === "HUF" ? "Ft" : currency}</span>
        </label>
      ))}
    </div>
    <div style={settingsCurrencyGroupStyle}>
      <span style={settingsCurrencyPrefixStyle}>{t("currencyLabel")}</span>
      <select
        value={currency}
        onChange={onCurrencyChange}
        style={settingsCurrencySelectStyle}>
        {currencyOptions.map((item: CurrencyOption) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
    <div style={settingsActionsStyle}>
      <button type="button" onClick={onSaveSettings} style={settingsButtonStyle}>
        {t("saveSettings")}
      </button>
      <button type="button" onClick={onResetDefaults} style={settingsButtonStyle}>
        {t("resetDefaults")}
      </button>
    </div>
    {settingsStatus === "saved" ? (
      <div style={settingsStatusStyle}>{t("settingsSaved")}</div>
    ) : settingsStatus === "error" ? (
      <div style={settingsStatusStyle}>{t("settingsSaveFailed")}</div>
    ) : null}
  </section>
)
