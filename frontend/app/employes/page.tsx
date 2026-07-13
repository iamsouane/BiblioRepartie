"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function EmployesPage() {
  return (
    <AppShell>
      <Employes />
    </AppShell>
  )
}

function Employes() {
  const { site, api } = useSite()
  const employes = useResource("employes", (a) => a.getEmployes(site))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nom: "", prenom: "", poste: "" })
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.poste.trim()) {
      toast.error("Tous les champs sont obligatoires")
      return
    }
    setSaving(true)
    try {
      await api.addEmploye(site, { nom: form.nom.trim(), prenom: form.prenom.trim(), poste: form.poste.trim() })
      toast.success("Employé ajouté")
      setForm({ nom: "", prenom: "", poste: "" })
      setOpen(false)
      employes.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteEmploye(site, id)
      toast.success("Employé supprimé")
      employes.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Employés"
        description="Personnel de la bibliothèque, géré et consulté uniquement en local (fragment σ site, jamais partagé)."
        actions={
          <>
            <SiteBadge site={site} className="px-3 py-1 text-sm" />
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Ajouter
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden p-0">
        <DataState
          isLoading={employes.isLoading}
          error={employes.error}
          isEmpty={employes.data?.length === 0}
          emptyLabel="Aucun employé sur ce site."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="w-16 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employes.data?.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-muted-foreground">{e.id}</TableCell>
                  <TableCell className="font-medium">{e.nom}</TableCell>
                  <TableCell>{e.prenom}</TableCell>
                  <TableCell className="text-muted-foreground">{e.poste}</TableCell>
                  <TableCell>
                    <SiteBadge site={e.site} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(e.id)}
                      aria-label={`Supprimer ${e.prenom} ${e.nom}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
            <DialogTitle>Nouvel employé</DialogTitle>
            <DialogDescription>
              Affecté au site <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="poste">Poste</Label>
              <Input
                id="poste"
                value={form.poste}
                onChange={(e) => setForm({ ...form, poste: e.target.value })}
                placeholder="Bibliothécaire, agent d'accueil…"
              />
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
