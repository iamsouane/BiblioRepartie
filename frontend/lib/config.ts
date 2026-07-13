import type { SiteCode } from "./types"

export interface SiteConfig {
  code: SiteCode
  nom: string
  ville: string
  port: number
  baseUrl: string
}

// Utiliser les URLs directes
export const SITES: Record<SiteCode, SiteConfig> = {
  UGB: {
    code: "UGB",
    nom: "Université Gaston Berger",
    ville: "Saint-Louis",
    port: 8082,
    baseUrl: "http://localhost:8082",
  },
  UCAD: {
    code: "UCAD",
    nom: "Université Cheikh Anta Diop",
    ville: "Dakar",
    port: 8081,
    baseUrl: "http://localhost:8081",
  },
  UADB: {
    code: "UADB",
    nom: "Université Alioune Diop de Bambey",
    ville: "Bambey",
    port: 8083,
    baseUrl: "http://localhost:8083",
  },
}

export const SITE_CODES: SiteCode[] = ["UGB", "UCAD", "UADB"]

const STORAGE_KEY = "biblio.baseUrls"

export function loadBaseUrls(): Record<SiteCode, string> {
  const defaults: Record<SiteCode, string> = {
    UGB: SITES.UGB.baseUrl,
    UCAD: SITES.UCAD.baseUrl,
    UADB: SITES.UADB.baseUrl,
  }
  if (typeof window === "undefined") return defaults
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function saveBaseUrls(urls: Record<SiteCode, string>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(urls))
}
