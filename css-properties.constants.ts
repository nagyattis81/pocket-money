import type { CSSProperties } from "react"

export const containerStyle: CSSProperties = {
  padding: 16,
  width: 720,
  maxWidth: "100vw",
  fontFamily: "Segoe UI, sans-serif",
  background: "#f5f1e8",
  color: "#1f2937"
}

export const cardStyle: CSSProperties = {
  borderRadius: 12,
  padding: 16,
  background: "#fffaf0",
  border: "1px solid #d6c7a1",
  boxShadow: "0 8px 24px rgba(84, 62, 24, 0.08)"
}

export const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700
}

export const textStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.5
}

export const hintStyle: CSSProperties = {
  ...textStyle,
  color: "#6b7280",
  wordBreak: "break-word"
}

export const summaryStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  background: "#f0ead6",
  border: "1px solid #d6c7a1",
  fontSize: 15,
  fontWeight: 400,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10
}

export const summaryAmountsStyle: CSSProperties = {
  textAlign: "left",
  whiteSpace: "nowrap"
}

export const summaryControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 0,
  marginLeft: "auto"
}

export const secondarySummaryStyle: CSSProperties = {
  ...summaryStyle,
  marginTop: 8,
  background: "#f7f2e2"
}

export const tableStyle: CSSProperties = {
  width: "100%",
  marginTop: 16,
  borderCollapse: "collapse",
  fontSize: 13,
  background: "#fff"
}

export const headerCellStyle: CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  borderBottom: "2px solid #d6c7a1",
  verticalAlign: "top"
}

export const bodyCellStyle: CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #eadfbe",
  verticalAlign: "top"
}

export const itemListStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}

export const badgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#f7f1dc",
  border: "1px solid #e4d4a6",
  lineHeight: 1.4
}

export const settingsPanelStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  background: "#f7f2e2",
  border: "1px solid #d6c7a1"
}

export const settingsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: 8,
  marginTop: 8
}

export const settingsFieldStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  width: "100%"
}

export const settingsFieldLabelStyle: CSSProperties = {
  minWidth: 28,
  padding: "6px 8px",
  textAlign: "center",
  fontWeight: 600,
  color: "black",
  background: "#efe0bb",
  border: "1px solid #d8c8a0",
  borderRight: "none",
  borderRadius: "8px 0 0 8px",
  boxSizing: "border-box"
}

export const settingsInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  boxSizing: "border-box",
  borderRadius: 0,
  border: "1px solid #d8c8a0",
  padding: "6px 8px",
  background: "#fffaf0"
}

export const settingsUnitStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  whiteSpace: "nowrap",
  padding: "6px 8px",
  background: "#efe0bb",
  border: "1px solid #d8c8a0",
  borderLeft: "none",
  borderRadius: "0 8px 8px 0",
  boxSizing: "border-box"
}

export const settingsActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10
}

export const settingsButtonStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid #bfa775",
  background: "#efe0bb",
  color: "#493512",
  padding: "6px 10px",
  cursor: "pointer"
}

export const settingsStatusStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#6b7280"
}

export const languageSelectStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid #d8c8a0",
  background: "#fffaf0",
  color: "#1f2937",
  padding: "6px 8px"
}

export const amountPositiveStyle: CSSProperties = {
  color: "#2f7a43",
  fontWeight: 700
}

export const amountNegativeStyle: CSSProperties = {
  color: "#9b3d32",
  fontWeight: 700
}

export const amountNeutralStyle: CSSProperties = {
  color: "#6b7280",
  fontWeight: 700
}

export const flagButtonActiveStyle: CSSProperties = {
  background: "#efe0bb",
  border: "2px solid #bfa775",
  borderRadius: 6,
  padding: "3px 5px",
  cursor: "pointer",
  lineHeight: 0,
  opacity: 1
}

export const flagButtonInactiveStyle: CSSProperties = {
  background: "none",
  border: "2px solid transparent",
  borderRadius: 6,
  padding: "3px 5px",
  cursor: "pointer",
  lineHeight: 0,
  opacity: 0.35
}