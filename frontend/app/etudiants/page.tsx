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

const SITE_URLS: Record<string, string> = {
  UGB: "http://localhost:8082",
  UCAD: "http://localhost:8081",
  UADB: "http://localhost:8083",
}

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
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedEtudiant, setSelectedEtudiant] = useState<any>(null)
  const [form, setForm] = useState({ nom: "", prenom: "" })
  const [editForm, setEditForm] = useState({ nom: "", prenom: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const getBaseUrl = () => {
    return SITE_URLS[site] || "http://localhost:8081"
  }

  async function submit() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast.error("Nom et prénom obligatoires")
      return
    }
    setSaving(true)
    try {
      const baseUrl = getBaseUrl()
      const nomComplet = `${form.prenom.trim()} ${form.nom.trim()}`
      const res = await fetch(`${baseUrl}/api/etudiants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomComplet,
          adresse: "Non renseigné",
          specialite: "Non renseigné"
        })
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
      }
      toast.success("Étudiant inscrit avec succès")
      setForm({ nom: "", prenom: "" })
      setOpen(false)
      etudiants.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!editForm.nom.trim() || !editForm.prenom.trim()) {
      toast.error("Nom et prénom obligatoires")
      return
    }
    setSaving(true)
    try {
      const baseUrl = getBaseUrl()
      const etudId = selectedEtudiant.idEtud || selectedEtudiant.id
      const nomComplet = `${editForm.prenom.trim()} ${editForm.nom.trim()}`
      const res = await fetch(`${baseUrl}/api/etudiants/${etudId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomComplet,
          adresse: selectedEtudiant.adresse || "Non renseigné",
          specialite: selectedEtudiant.specialite || "Non renseigné"
        })
      })
      if (res.status === 404) {
        toast.error("Étudiant non trouvé")
        setEditOpen(false)
        setSelectedEtudiant(null)
        etudiants.mutate()
        setSaving(false)
        return
      }
      if (!res.ok) throw new Error("Erreur lors de la modification")
      toast.success("Étudiant modifié avec succès")
      setEditOpen(false)
      setSelectedEtudiant(null)
      etudiants.mutate()
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
      const etudId = selectedEtudiant.idEtud || selectedEtudiant.id
      const res = await fetch(`${baseUrl}/api/etudiants/${etudId}`, {
        method: 'DELETE'
      })
      if (res.status === 404) {
        toast.error("Étudiant non trouvé")
        setDeleteOpen(false)
        setSelectedEtudiant(null)
        etudiants.mutate()
        setDeleting(false)
        return
      }
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      toast.success("Étudiant supprimé avec succès")
      setDeleteOpen(false)
      setSelectedEtudiant(null)
      etudiants.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (etudiant: any) => {
    setSelectedEtudiant(etudiant)
    const nomComplet = etudiant.nom || ""
    const parts = nomComplet.split(" ")
    const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : ""
    const nom = parts.length > 1 ? parts[parts.length - 1] : nomComplet
    setEditForm({ nom, prenom })
    setEditOpen(true)
  }

  const openDelete = (etudiant: any) => {
    setSelectedEtudiant(etudiant)
    setDeleteOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Étudiants"
        description="Étudiants rattachés à cette université (fragment σ université). Le compteur nbreEmprunts est ajusté ici, y compris via les transactions distribuées déclenchées par d'autres sites."
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
                <TableHead className="text-right">Emprunts</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {etudiants.data?.map((e) => {
                const etudId = e.idEtud || e.id
                const nomComplet = e.nom || ""
                const parts = nomComplet.split(" ")
                const prenom = parts.length > 1 ? parts.slice(0, -1).join(" ") : ""
                const nom = parts.length > 1 ? parts[parts.length - 1] : nomComplet
                return (
                  <TableRow key={etudId}>
                    <TableCell className="font-mono text-muted-foreground">{etudId}</TableCell>
                    <TableCell className="font-medium">{nom}</TableCell>
                    <TableCell>{prenom}</TableCell>
                    <TableCell>
                      <SiteBadge site={e.universite} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={e.nbreEmprunts > 0 ? "default" : "secondary"} className="tabular-nums">
                        {e.nbreEmprunts}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(e)}
                          aria-label={`Modifier ${nom}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => openDelete(e)}
                          aria-label={`Supprimer ${nom}`}
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
            <DialogTitle>Nouvel étudiant</DialogTitle>
            <DialogDescription>
              Rattaché à l&apos;université <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input 
                id="prenom" 
                value={form.prenom} 
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input 
                id="nom" 
                value={form.nom} 
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom"
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
            <DialogTitle>Modifier l'étudiant</DialogTitle>
            <DialogDescription>
              Modifier les informations de l&apos;étudiant sur le site <SiteBadge site={site} className="ml-1" />.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-prenom">Prénom</Label>
              <Input
                id="edit-prenom"
                value={editForm.prenom}
                onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-nom">Nom</Label>
              <Input
                id="edit-nom"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
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
              Cette action supprimera définitivement l&apos;étudiant &quot;{selectedEtudiant?.nom}&quot;.
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
