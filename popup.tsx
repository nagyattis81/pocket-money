import React, { useEffect, useState } from "react"

const SUPPORTED_PATH = "/TanuloErtekeles/Osztalyzatok"

type PopupState =
  | { status: "loading" }
  | { status: "supported"; url: string }
  | { status: "unsupported"; url?: string }
  | { status: "error"; message: string }

const containerStyle: React.CSSProperties = {
  padding: 16,
  width: 320,
  fontFamily: "Segoe UI, sans-serif",
  background: "#f5f1e8",
  color: "#1f2937"
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 16,
  background: "#fffaf0",
  border: "1px solid #d6c7a1",
  boxShadow: "0 8px 24px rgba(84, 62, 24, 0.08)"
}

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700
}

const textStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.5
}

const hintStyle: React.CSSProperties = {
  ...textStyle,
  color: "#6b7280",
  wordBreak: "break-word"
}

function isSupportedUrl(rawUrl?: string) {
  if (!rawUrl) {
    return false
  }

  try {
    const url = new URL(rawUrl)

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".e-kreta.hu") &&
      url.pathname === SUPPORTED_PATH
    )
  } catch {
    return false
  }
}

function IndexPopup() {
  const [popupState, setPopupState] = useState<PopupState>({ status: "loading" })

  useEffect(() => {
    let isDisposed = false

    const loadActiveTab = async () => {
      try {
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })

        if (isDisposed) {
          return
        }

        const activeUrl = activeTab?.url

        if (isSupportedUrl(activeUrl)) {
          setPopupState({ status: "supported", url: activeUrl })
          return
        }

        setPopupState({ status: "unsupported", url: activeUrl })
      } catch {
        if (!isDisposed) {
          setPopupState({
            status: "error",
            message: "Az aktiv lap nem ellenorizheto."
          })
        }
      }
    }

    loadActiveTab()

    return () => {
      isDisposed = true
    }
  }, [])

  const renderContent = () => {
    switch (popupState.status) {
      case "loading":
        return (
          <>
            <h1 style={headingStyle}>eKreta pocket money</h1>
            <p style={textStyle}>Az aktiv lap ellenorzese folyamatban van.</p>
          </>
        )
      case "supported":
        return (
          <>
            <h1 style={headingStyle}>Tamogatott oldal</h1>
            <p style={textStyle}>
              A bovitmeny ezen az eKreta Osztalyzatok oldalon aktiv lehet.
            </p>
            <p style={hintStyle}>{popupState.url}</p>
          </>
        )
      case "unsupported":
        return (
          <>
            <h1 style={headingStyle}>Nem tamogatott oldal</h1>
            <p style={textStyle}>
              A bovitmeny csak az eKreta Osztalyzatok oldalon mukodik.
            </p>
            <p style={hintStyle}>
              Nyisd meg ezt az utvonalat: https://*.e-kreta.hu{SUPPORTED_PATH}
            </p>
            {popupState.url ? <p style={hintStyle}>{popupState.url}</p> : null}
          </>
        )
      case "error":
        return (
          <>
            <h1 style={headingStyle}>Ellenorzes sikertelen</h1>
            <p style={textStyle}>{popupState.message}</p>
          </>
        )
    }
  }

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>{renderContent()}</section>
    </main>
  )
}

export default IndexPopup
