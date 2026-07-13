"use client"

import { useState } from "react"
import { Undo2 } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PretsPage() {
  return (
    <AppShell>
      <Prets />
    </AppShell>
  )
}

function Prets() {
  const { site, api } = useSite()
  const prets = useResource("prets", (a) => a.getPrets(site))
  const [busy, setBusy] = useState<number | null>(null)

  async function retour(id: number) {
    setBusy(id)
    try {
      await api.retour(site, id)
      toast.success("Ouvrage retourné, compteur étudiant ajusté")
      prets.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Prêts"
        description="Prêts traités et stockés par ce site (fragmentation dérivée de OUVRAGE). Un ouvrage emprunté ici est rendu ici, quelle que soit l'université de l'étudiant."
        actions={<SiteBadge site={site} className="px-3 py-1 text-sm" />}
      />

      <Card className="overflow-hidden p-0">
        <DataState
          isLoading={prets.isLoading}
          error={prets.error}
          isEmpty={prets.data?.length === 0}
          emptyLabel="Aucun prêt traité par ce site."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Ouvrage</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Université</TableHead>
                <TableHead>Emprunt</TableHead>
                <TableHead>Retour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prets.data?.map((p) => {
                const distant = p.universiteEtudiant !== site
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.titreOuvrage}</TableCell>
                    <TableCell>
                      {p.prenomEtudiant} {p.nomEtudiant}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <SiteBadge site={p.universiteEtudiant} />
                        {distant && (
                          <Badge variant="outline" className="border-accent/40 text-accent-foreground">
                            inter-site
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.dateEmprunt}</TableCell>
                    <TableCell className="text-muted-foreground">{p.dateRetour ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          p.statut === "EN_COURS"
                            ? "border-accent/40 bg-accent/15 text-accent-foreground"
                            : "border-primary/30 bg-primary/10 text-primary"
                        }
                      >
                        {p.statut === "EN_COURS" ? "En cours" : "Retourné"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.statut === "EN_COURS" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retour(p.id)}
                          disabled={busy === p.id}
                        >
                          <Undo2 className="size-3.5" />
                          {busy === p.id ? "…" : "Retour"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </DataState>
      </Card>
    </>
  )
}
