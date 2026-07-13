"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Configuration des URLs par site
const SITE_URLS: Record<string, string> = {
  UGB: "http://localhost:8082",
  UCAD: "http://localhost:8081",
  UADB: "http://localhost:8083",
}

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
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedEmploye, setSelectedEmploye] = useState<any>(null)
  const [form, setForm] = useState({ nom: "", adresse: "", statut: "" })
  const [editForm, setEditForm] = useState({ nom: "", adresse: "", statut: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Obtenir l'URL de base pour le site
  const getBaseUrl = () => {
    return SITE_URLS[site] || `http://localhost:8081`
  }

  async function submit() {
    if (!form.nom.trim() || !form.adresse.trim() || !form.statut.trim()) {
      toast.error("Tous les champs sont obligatoires")
      return
    }
    setSaving(true)
    try {
      const baseUrl = getBaseUrl()
      const res = await fetch(`${baseUrl}/api/employes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom.trim(),
          adresse: form.adresse.trim(),
          statut: form.statut.trim()
        })
      })
      if (!res.ok) throw new Error("Erreur lors de l'ajout")
      toast.success("Employé ajouté")
      setForm({ nom: "", adresse: "", statut: "" })
      setOpen(false)
      employes.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!editForm.nom.trim() || !editForm.adresse.trim() || !editForm.statut.trim()) {
      toast.error("Tous les champs sont obligatoires")
      return
    }
    setSaving(true)
    try {
      const baseUrl = getBaseUrl()
      const empId = selectedEmploye.idEmp || selectedEmploye.id
      const res = await fetch(`${baseUrl}/api/employes/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: editForm.nom.trim(),
          adresse: editForm.adresse.trim(),
          statut: editForm.statut.trim()
        })
      })
      if (res.status === 404) {
        toast.error("Employé non trouvé")
        setEditOpen(false)
        setSelectedEmploye(null)
        employes.mutate()
        setSaving(false)
        return
      }
      if (!res.ok) throw new Error("Erreur lors de la modification")
      toast.success("Employé modifié avec succès")
      setEditOpen(false)
      setSelectedEmploye(null)
      employes.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const baseUrl = getBaseUrl()
      const empId = selectedEmploye.idEmp || selectedEmploye.id
      const res = await fetch(`${baseUrl}/api/employes/${empId}`, {
        method: 'DELETE'
      })
      if (res.status === 404) {
        toast.error("Employé non trouvé")
        setDeleteOpen(false)
        setSelectedEmploye(null)
        employes.mutate()
        setDeleting(false)
        return
      }
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      toast.success("Employé supprimé avec succès")
      setDeleteOpen(false)
      setSelectedEmploye(null)
      employes.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (employe: any) => {
    setSelectedEmploye(employe)
    setEditForm({
      nom: employe.nom || "",
      adresse: employe.adresse || "",
      statut: employe.statut || ""
    })
    setEditOpen(true)
  }

  const openDelete = (employe: any) => {
    setSelectedEmploye(employe)
    setDeleteOpen(true)
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
                <TableHead>Adresse</TableHead>
                <TableHead>Poste / Statut</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employes.data?.map((e) => {
                const empId = e.idEmp || e.id
                return (
                  <TableRow key={empId}>
                    <TableCell className="font-mono text-muted-foreground">{empId}</TableCell>
                    <TableCell className="font-medium">{e.nom}</TableCell>
                    <TableCell>{e.adresse}</TableCell>
                    <TableCell className="text-muted-foreground">{e.statut}</TableCell>
                    <TableCell>
                      <SiteBadge site={e.bibliotheque || e.site || site} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(e)}
                          aria-label={`Modifier ${e.nom}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => openDelete(e)}
                          aria-label={`Supprimer ${e.nom}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </DataState>
      </Card>

      {/* Dialog Ajouter */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel employé</DialogTitle>
            <DialogDescription>
              Affecté au site <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input 
                id="nom" 
                value={form.nom} 
                onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                placeholder="Nom de l'employé"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adresse">Adresse</Label>
              <Input 
                id="adresse" 
                value={form.adresse} 
                onChange={(e) => setForm({ ...form, adresse: e.target.value })} 
                placeholder="Adresse"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="statut">Poste / Statut</Label>
              <Input 
                id="statut" 
                value={form.statut} 
                onChange={(e) => setForm({ ...form, statut: e.target.value })} 
                placeholder="Bibliothécaire, Assistant..."
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

      {/* Dialog Modifier */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
            <DialogDescription>
              Modifier les informations de l'employé sur le site <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nom">Nom</Label>
              <Input
                id="edit-nom"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                placeholder="Nom de l'employé"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-adresse">Adresse</Label>
              <Input
                id="edit-adresse"
                value={editForm.adresse}
                onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })}
                placeholder="Adresse"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-statut">Poste / Statut</Label>
              <Input
                id="edit-statut"
                value={editForm.statut}
                onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
                placeholder="Bibliothécaire, Assistant..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Supprimer */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l&apos;employé &quot;{selectedEmploye?.nom}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
