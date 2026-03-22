import React from "react"

import compactViewIcon from "./assets/icons/compact-view.svg"
import detailedViewIcon from "./assets/icons/detailed-view.svg"
import enFlagIcon from "./assets/icons/flag-en.svg"
import huFlagIcon from "./assets/icons/flag-hu.svg"

export function CompactViewIcon() {
  return <img src={compactViewIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block" }} />
}

export function DetailedViewIcon() {
  return <img src={detailedViewIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block" }} />
}

export function HuFlagIcon() {
  return <img src={huFlagIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block", borderRadius: 2 }} />
}

export function EnFlagIcon() {
  return <img src={enFlagIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block", borderRadius: 2 }} />
}