export type GradeEntry = {
  subject: string
  month: string
  grade: number
  weight: number
  amount: number
  date: string
  kind: string
}

export type PageExtractionResult = {
  months: string[]
  entries: GradeEntry[]
}

export type MonthSummary = {
  month: string
  entries: GradeEntry[]
  total: number
}

export type PopupState =
  | { status: "loading" }
  | {
      status: "ready"
      url: string
      monthSummaries: MonthSummary[]
      grandTotal: number
      allFiveTotal: number
    }
  | { status: "empty"; url: string; message: string }
  | { status: "unsupported"; url?: string }
  | { status: "error"; message: string }