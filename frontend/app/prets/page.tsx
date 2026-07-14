"use client"

import { useState, useEffect } from "react"
import { Undo2, Eye } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const SITE_URLS: Record<string, string> = {
  UGB: "http://localhost:8082",
  UCAD: "http://localhost:8081",
  UADB: "http://localhost:8083",
}

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
  const [pretsEnrichis, setPretsEnrichis] = useState<any[]>([])
  const [loadingNames, setLoadingNames] = useState(false)

  const getEtudiantName = async (etudiantId: number) => {
    let siteCode = "UCAD"
    if (etudiantId >= 1000 && etudiantId < 2000) siteCode = "UGB"
    else if (etudiantId >= 2000 && etudiantId < 3000) siteCode = "UCAD"
    else if (etudiantId >= 3000 && etudiantId < 4000) siteCode = "UADB"
    
    const baseUrl = SITE_URLS[siteCode]
    try {
      const res = await fetch(`${baseUrl}/api/etudiants/${etudiantId}`)
      if (res.ok) {
        const data = await res.json()
        return data.nom || `Étudiant #${etudiantId}`
      }
      return `Étudiant #${etudiantId}`
    } catch {
      return `Étudiant #${etudiantId}`
    }
  }

  const getOuvrageTitle = async (ouvrageId: number) => {
    const baseUrl = SITE_URLS[site]
    try {
      const res = await fetch(`${baseUrl}/api/ouvrages/${ouvrageId}`)
      if (res.ok) {
        const data = await res.json()
        return data.titre || `Ouvrage #${ouvrageId}`
      }
      return `Ouvrage #${ouvrageId}`
    } catch {
      return `Ouvrage #${ouvrageId}`
    }
  }

  useEffect(() => {
    const enrichPrets = async () => {
      if (!prets.data || prets.data.length === 0) {
        setPretsEnrichis([])
        return
      }

      setLoadingNames(true)
      const enriched = await Promise.all(
        prets.data.map(async (pret: any) => {
          const etudiantNom = await getEtudiantName(pret.etudiantId)
          const ouvrageTitre = await getOuvrageTitle(pret.ouvrageId)
          
          let universite = "—"
          if (pret.etudiantId >= 1000 && pret.etudiantId < 2000) universite = "UGB"
          else if (pret.etudiantId >= 2000 && pret.etudiantId < 3000) universite = "UCAD"
          else if (pret.etudiantId >= 3000 && pret.etudiantId < 4000) universite = "UADB"

          return {
            ...pret,
            id: pret.idPret || pret.id,
            titreOuvrage: ouvrageTitre,
            nomEtudiant: etudiantNom,
            universiteEtudiant: universite,
            statut: pret.dateRetour === null ? "EN_COURS" : "RETOURNE",
            dateEmprunt: pret.dateEmprunt || "—",
            dateRetour: pret.dateRetour || "—"
          }
        })
      )
      setPretsEnrichis(enriched)
      setLoadingNames(false)
    }

    enrichPrets()
  }, [prets.data, site])

  async function retour(id: number) {
    setBusy(id)
    try {
      const baseUrl = SITE_URLS[site] || "http://localhost:8081"
      const res = await fetch(`${baseUrl}/api/prets/retourner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pretId: id })
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "Erreur lors du retour")
      }
      toast.success("Ouvrage retourné, compteur étudiant ajusté")
      prets.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const isLoading = prets.isLoading || loadingNames

  return (
    <>
      <PageHeader
        title="Prêts"
        description="Prêts traités et stockés par ce site (fragmentation dérivée de OUVRAGE). Un ouvrage emprunté ici est rendu ici, quelle que soit l'université de l'étudiant."
        actions={<SiteBadge site={site} className="px-3 py-1 text-sm" />}
      />

      <Card className="overflow-hidden p-0">
        <DataState
          isLoading={isLoading}
          error={prets.error}
          isEmpty={pretsEnrichis.length === 0}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pretsEnrichis.map((p) => {
                const enCours = p.statut === "EN_COURS"
                const distant = p.universiteEtudiant !== site && p.universiteEtudiant !== "—"

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.titreOuvrage}</TableCell>
                    <TableCell>{p.nomEtudiant}</TableCell>
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
                    <TableCell className="text-muted-foreground">{p.dateRetour}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          enCours
                            ? "border-accent/40 bg-accent/15 text-accent-foreground"
                            : "border-primary/30 bg-primary/10 text-primary"
                        }
                      >
                        {enCours ? "En cours" : "Retourné"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/prets/${p.id}`}>
                          <Button variant="ghost" size="sm" title="Voir les détails">
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                        {enCours && (
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
                      </div>
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
