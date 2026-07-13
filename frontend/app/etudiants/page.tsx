"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EtudiantsPage() {
  return (
    <AppShell>
      <Etudiants />
    </AppShell>
  )
}

function Etudiants() {
  const { site, api } = useSite()
  const etudiants = useResource("etudiants", (a) => a.getEtudiants(site))
  const [open, setOpen] = useState(false)
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!nom.trim() || !prenom.trim()) {
      toast.error("Nom et prénom obligatoires")
      return
    }
    setSaving(true)
    try {
      await api.addEtudiant(site, { nom: nom.trim(), prenom: prenom.trim() })
      toast.success("Étudiant inscrit")
      setNom("")
      setPrenom("")
      setOpen(false)
      etudiants.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Étudiants"
        description="Étudiants rattachés à cette université (fragment σ universite). Le compteur nbreEmprunts est ajusté ici, y compris via les transactions distribuées déclenchées par d'autres sites."
        actions={
          <>
            <SiteBadge site={site} className="px-3 py-1 text-sm" />
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Inscrire
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden p-0">
        <DataState
          isLoading={etudiants.isLoading}
          error={etudiants.error}
          isEmpty={etudiants.data?.length === 0}
          emptyLabel="Aucun étudiant inscrit sur ce site."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Université</TableHead>
                <TableHead className="text-right">Emprunts en cours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {etudiants.data?.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-muted-foreground">{e.id}</TableCell>
                  <TableCell className="font-medium">{e.nom}</TableCell>
                  <TableCell>{e.prenom}</TableCell>
                  <TableCell>
                    <SiteBadge site={e.universite} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={e.nbreEmprunts > 0 ? "default" : "secondary"} className="tabular-nums">
                      {e.nbreEmprunts}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel étudiant</DialogTitle>
            <DialogDescription>
              Rattaché à l&apos;université <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
