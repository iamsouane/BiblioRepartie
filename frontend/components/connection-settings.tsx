"use client"

import { useSite } from "@/components/site-provider"
import { SITES, SITE_CODES } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function ConnectionSettings({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { baseUrls, setBaseUrl, mode } = useSite()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connexion aux sites</DialogTitle>
          <DialogDescription>
            URL de base de chaque instance Spring Boot. Utilisées en mode{" "}
            <span className="font-medium text-foreground">Live</span> pour interroger les vraies bases H2.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "demo" && (
            <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
              Vous êtes en mode <strong>Démo</strong> : les données sont simulées en mémoire dans le navigateur,
              y compris la transaction distribuée. Passez en <strong>Live</strong> pour interroger vos 3 backends.
            </p>
          )}
          {SITE_CODES.map((code) => (
            <div key={code} className="space-y-1.5">
              <Label htmlFor={`url-${code}`} className="flex items-center gap-2">
                <Badge variant="secondary">{code}</Badge>
                <span className="text-muted-foreground">{SITES[code].nom}</span>
              </Label>
              <Input
                id={`url-${code}`}
                value={baseUrls[code]}
                onChange={(e) => setBaseUrl(code, e.target.value)}
                spellCheck={false}
                className="font-mono text-sm"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            En mode Live, les navigateurs bloquent les requêtes vers <code>localhost</code> depuis un site distant
            (CORS/mixed-content). Lancez ce frontend en local pour dialoguer avec vos instances.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
