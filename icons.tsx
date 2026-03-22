import React from "react"

import compactViewIcon from "./assets/icons/compact-view.svg"
import detailedViewIcon from "./assets/icons/detailed-view.svg"
import enFlagIcon from "./assets/icons/flag-en.svg"
import huFlagIcon from "./assets/icons/flag-hu.svg"

export const CompactViewIcon = (): React.JSX.Element => <img src={compactViewIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block" }} />

export const DetailedViewIcon = (): React.JSX.Element => <img src={detailedViewIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block" }} />

export const HuFlagIcon = (): React.JSX.Element => <img src={huFlagIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block", borderRadius: 2 }} />

export const EnFlagIcon = (): React.JSX.Element => <img src={enFlagIcon} width={28} height={18} alt="" aria-hidden style={{ display: "block", borderRadius: 2 }} />