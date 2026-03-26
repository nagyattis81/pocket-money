import React from "react"
import {
  headingStyle,
  hintStyle,
  textStyle
} from "../css-properties.constants"
import type { TranslationKey } from "../i18n"

type BaseViewProps = {
  t: (key: TranslationKey) => string
}

type LoadingViewProps = BaseViewProps

type EmptyViewProps = BaseViewProps & {
  message: string
  url: string
  settingsPanel: React.JSX.Element
}

type UnsupportedViewProps = BaseViewProps & {
  supportedPath: string
  url?: string
  settingsPanel: React.JSX.Element
}

type ErrorViewProps = BaseViewProps & {
  message: string
  settingsPanel: React.JSX.Element
}

export const LoadingView = ({ t }: LoadingViewProps): React.JSX.Element => (
  <>
    <h1 style={headingStyle}>{t("loadingTitle")}</h1>
    <p style={textStyle}>{t("loadingMessage")}</p>
  </>
)

export const EmptyView = ({
  t,
  message,
  url,
  settingsPanel
}: EmptyViewProps): React.JSX.Element => (
  <>
    <h1 style={headingStyle}>{t("emptyTitle")}</h1>
    <p style={textStyle}>{message}</p>
    <p style={hintStyle}>{url}</p>
    {settingsPanel}
  </>
)

export const UnsupportedView = ({
  t,
  supportedPath,
  url,
  settingsPanel
}: UnsupportedViewProps): React.JSX.Element => (
  <>
    <h1 style={headingStyle}>{t("unsupportedTitle")}</h1>
    <p style={textStyle}>{t("unsupportedMessage")}</p>
    <p style={hintStyle}>
      {t("unsupportedHintPrefix")} https://*.e-kreta.hu{supportedPath}
    </p>
    {url ? <p style={hintStyle}>{url}</p> : null}
    {settingsPanel}
  </>
)

export const ErrorView = ({
  t,
  message,
  settingsPanel
}: ErrorViewProps): React.JSX.Element => (
  <>
    <h1 style={headingStyle}>{t("errorTitle")}</h1>
    <p style={textStyle}>{message}</p>
    {settingsPanel}
  </>
)
