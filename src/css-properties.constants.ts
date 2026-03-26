import type { CSSProperties } from "react"

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
