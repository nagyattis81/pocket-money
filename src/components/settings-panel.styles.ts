import type { CSSProperties } from "react"

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

export const settingsCurrencyGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  maxWidth: 320,
  marginTop: 8
}

export const settingsCurrencyPrefixStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "black",
  background: "#efe0bb",
  border: "1px solid #d8c8a0",
  borderRight: "none",
  borderRadius: "8px 0 0 8px",
  whiteSpace: "nowrap",
  boxSizing: "border-box"
}

export const settingsCurrencySelectStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: "0 8px 8px 0",
  border: "1px solid #d8c8a0",
  background: "#fffaf0",
  color: "#1f2937",
  padding: "6px 8px",
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
