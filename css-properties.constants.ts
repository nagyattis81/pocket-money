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
  fontWeight: 400
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

export const settingsInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 8,
  border: "1px solid #d8c8a0",
  padding: "6px 8px",
  background: "#fffaf0"
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