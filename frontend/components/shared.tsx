"use client"

import type { ReactNode } from "react"
import { Loader2, TriangleAlert, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SiteCode } from "@/lib/types"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-pretty font-serif text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

const SITE_STYLES: Record<SiteCode, string> = {
  UGB: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  UCAD: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  UADB: "bg-chart-4/15 text-chart-4 border-chart-4/30",
}

export function SiteBadge({ site, className }: { site: SiteCode; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-mono", SITE_STYLES[site], className)}>
      {site}
    </Badge>
  )
}

export function DataState({
  isLoading,
  error,
  isEmpty,
  emptyLabel = "Aucune donnée.",
  children,
}: {
  isLoading: boolean
  error?: Error
  isEmpty?: boolean
  emptyLabel?: string
  children: ReactNode
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
        <TriangleAlert className="size-6 text-destructive" />
        <p className="font-medium text-destructive">Connexion impossible</p>
        <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
        <p className="text-xs text-muted-foreground">
          Vérifiez que l&apos;instance est démarrée, ou repassez en mode Démo.
        </p>
      </div>
    )
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
        <Inbox className="size-6" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    )
  }
  return <>{children}</>
}

export function DispoBadge({ disponible }: { disponible: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        disponible
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-accent/40 bg-accent/15 text-accent-foreground",
      )}
    >
      {disponible ? "Disponible" : "Emprunté"}
    </Badge>
  )
}
