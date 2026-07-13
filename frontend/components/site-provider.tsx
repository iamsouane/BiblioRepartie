"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { loadBaseUrls, saveBaseUrls, SITES } from "@/lib/config"
import { createApi, type Api, type ApiMode } from "@/lib/api"
import type { SiteCode } from "@/lib/types"

interface SiteContextValue {
  site: SiteCode
  setSite: (s: SiteCode) => void
  mode: ApiMode
  setMode: (m: ApiMode) => void
  baseUrls: Record<SiteCode, string>
  setBaseUrl: (s: SiteCode, url: string) => void
  api: Api
  siteConfig: (typeof SITES)[SiteCode]
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSiteState] = useState<SiteCode>("UGB")
  const [mode, setModeState] = useState<ApiMode>("demo")
  const [baseUrls, setBaseUrls] = useState<Record<SiteCode, string>>(() => ({
    UGB: SITES.UGB.baseUrl,
    UCAD: SITES.UCAD.baseUrl,
    UADB: SITES.UADB.baseUrl,
  }))

  // hydrate persisted values
  useEffect(() => {
    setBaseUrls(loadBaseUrls())
    const savedSite = window.localStorage.getItem("biblio.site") as SiteCode | null
    if (savedSite && SITES[savedSite]) setSiteState(savedSite)
    const savedMode = window.localStorage.getItem("biblio.mode") as ApiMode | null
    if (savedMode === "demo" || savedMode === "live") setModeState(savedMode)
  }, [])

  const setSite = (s: SiteCode) => {
    setSiteState(s)
    window.localStorage.setItem("biblio.site", s)
  }
  const setMode = (m: ApiMode) => {
    setModeState(m)
    window.localStorage.setItem("biblio.mode", m)
  }
  const setBaseUrl = (s: SiteCode, url: string) => {
    setBaseUrls((prev) => {
      const next = { ...prev, [s]: url }
      saveBaseUrls(next)
      return next
    })
  }

  const api = useMemo(() => createApi({ mode, baseUrls }), [mode, baseUrls])

  const value: SiteContextValue = {
    site,
    setSite,
    mode,
    setMode,
    baseUrls,
    setBaseUrl,
    api,
    siteConfig: SITES[site],
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error("useSite must be used within SiteProvider")
  return ctx
}
