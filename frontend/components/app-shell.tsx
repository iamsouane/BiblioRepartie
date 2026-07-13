"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Library, Menu, Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/nav"
import { useSite } from "@/components/site-provider"
import { SITES, SITE_CODES } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConnectionSettings } from "@/components/connection-settings"
import type { SiteCode } from "@/lib/types"

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 md:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Library className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold">BiblioRépartie</p>
              <p className="text-xs text-sidebar-foreground/70">Réseau BU mutualisées</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground md:hidden"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-sidebar-foreground/60">{item.description}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/60">
          <p>Fragmentation horizontale · Réplication · Saga distribuée</p>
        </div>
      </aside>
    </>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { site, setSite, mode, setMode, siteConfig } = useSite()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu className="size-5" />
      </Button>

      <div className="hidden min-w-0 flex-col md:flex">
        <span className="truncate font-serif text-sm font-semibold text-foreground">{siteConfig.nom}</span>
        <span className="text-xs text-muted-foreground">
          {siteConfig.ville} · port {siteConfig.port}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
          <button
            onClick={() => setMode("demo")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              mode === "demo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Démo
          </button>
          <button
            onClick={() => setMode("live")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              mode === "live" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Live
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Site actif</span>
          <Select value={site} onValueChange={(v) => setSite(v as SiteCode)}>
            <SelectTrigger className="w-[120px]" aria-label="Sélectionner le site actif">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITE_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {SITES[code].port}
                    </Badge>
                    {code}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Paramètres de connexion">
          <Settings2 className="size-4" />
        </Button>
      </div>

      <ConnectionSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  )
}
