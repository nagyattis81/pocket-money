import type { CSSProperties } from "react"

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

export const flagButtonActiveStyle: CSSProperties = {
  background: "#efe0bb",
  border: "2px solid #bfa775",
  borderRadius: 6,
  padding: "3px 5px",
  cursor: "pointer",
  lineHeight: 0,
  opacity: 1
}
