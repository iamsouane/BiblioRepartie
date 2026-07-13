"use client"

import { useState } from "react"
import { Search, Loader2, Globe } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DispoBadge } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OuvrageGlobal } from "@/lib/types"

export default function RecherchePage() {
  return (
    <AppShell>
      <Recherche />
    </AppShell>
  )
}

function Recherche() {
  const { site, api } = useSite()
  const [q, setQ] = useState("")
  const [results, setResults] = useState<OuvrageGlobal[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function search(e?: React.FormEvent) {
    e?.preventDefault()
    if (!q.trim()) {
      toast.error("Saisissez un titre à rechercher")
      return
    }
    setLoading(true)
    try {
      const res = await api.rechercheGlobale(site, q.trim())
      setResults(res)
    } catch (err) {
      toast.error((err as Error).message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const grouped = (results ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.siteSource] = (acc[o.siteSource] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title="Recherche globale"
        description="Le site courant interroge son fonds local puis diffuse la requête (fan-out REST) aux deux autres sites et agrège les résultats."
        actions={
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4" /> Point d&apos;entrée <SiteBadge site={site} />
          </span>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un ouvrage par titre sur tout le réseau…"
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading} className="sm:w-40">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              {loading ? "Fan-out…" : "Rechercher"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results !== null && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{results.length} résultat(s)</span>
            {(["UGB", "UCAD", "UADB"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <SiteBadge site={s} />
                <span className="tabular-nums">{grouped[s] ?? 0}</span>
              </span>
            ))}
          </div>

          <Card className="overflow-hidden p-0">
            {results.length === 0 ? (
              <p className="py-14 text-center text-sm text-muted-foreground">
                Aucun ouvrage trouvé sur les trois sites.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Détenu par</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((o) => (
                    <TableRow key={`${o.siteSource}-${o.id}`}>
                      <TableCell className="font-mono text-muted-foreground">{o.id}</TableCell>
                      <TableCell className="font-medium">{o.titre}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {o.auteurPrenom ? `${o.auteurPrenom} ${o.auteurNom}` : "—"}
                      </TableCell>
                      <TableCell>
                        <SiteBadge site={o.siteSource} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DispoBadge disponible={o.disponible} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </>
  )
}
