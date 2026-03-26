import type { CSSProperties } from "react"

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
  verticalAlign: "top",
  textAlign: "left"
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
