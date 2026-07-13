"use client"

import { useState } from "react"
import { Plus, Copy, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card, CardContent } from "@/components/ui/card"
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

export default function AuteursPage() {
  return (
    <AppShell>
      <Auteurs />
    </AppShell>
  )
}

function Auteurs() {
  const { site, api } = useSite()
  const auteurs = useResource("auteurs", (a) => a.getAuteurs(site))
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedAuteur, setSelectedAuteur] = useState<any>(null)
  const [form, setForm] = useState({ nom: "", prenom: "" })
  const [editForm, setEditForm] = useState({ nom: "", prenom: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Séparer nomAuteur en nom et prénom
  const getNomPrenom = (nomAuteur: string) => {
    if (!nomAuteur || nomAuteur.trim() === "") return { nom: "—", prenom: "—" }
    const parts = nomAuteur.trim().split(" ")
    if (parts.length === 1) {
      return { nom: parts[0], prenom: "—" }
    }
    const prenom = parts.slice(0, -1).join(" ")
    const nom = parts[parts.length - 1]
    return { nom, prenom }
  }

  // Combiner nom et prénom en nomAuteur
  const combinerNom = (prenom: string, nom: string) => {
    if (!prenom.trim() && !nom.trim()) return ""
    return `${prenom.trim()} ${nom.trim()}`.trim()
  }

  async function submit() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast.error("Nom et prénom obligatoires")
      return
    }
    setSaving(true)
    try {
      const nomAuteur = combinerNom(form.prenom, form.nom)
      console.log("Création avec nomAuteur:", nomAuteur)
      
      // Utiliser fetch directement avec le bon champ
      const baseUrl = api.baseUrls ? api.baseUrls[site] : `http://localhost:8081`
      const res = await fetch(`${baseUrl}/api/auteurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomAuteur })
      })
      
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
      }
      const data = await res.json()
      console.log("Auteur créé:", data)
      toast.success(`Auteur "${nomAuteur}" créé et répliqué sur les 3 sites`)
      setForm({ nom: "", prenom: "" })
      setOpen(false)
      auteurs.mutate()
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
      const nomAuteur = combinerNom(editForm.prenom, editForm.nom)
      console.log("Modification avec nomAuteur:", nomAuteur)
      
      const baseUrl = api.baseUrls ? api.baseUrls[site] : `http://localhost:8081`
      const res = await fetch(`${baseUrl}/api/auteurs/${selectedAuteur.idAut}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomAuteur })
      })
      if (!res.ok) throw new Error("Erreur lors de la modification")
      toast.success("Auteur modifié avec succès")
      setEditOpen(false)
      setSelectedAuteur(null)
      auteurs.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const baseUrl = api.baseUrls ? api.baseUrls[site] : `http://localhost:8081`
      const res = await fetch(`${baseUrl}/api/auteurs/${selectedAuteur.idAut}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      toast.success("Auteur supprimé avec succès")
      setDeleteOpen(false)
      setSelectedAuteur(null)
      auteurs.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (auteur: any) => {
    setSelectedAuteur(auteur)
    const { nom, prenom } = getNomPrenom(auteur.nomAuteur || auteur.nom || "")
    setEditForm({ nom, prenom })
    setEditOpen(true)
  }

  const openDelete = (auteur: any) => {
    setSelectedAuteur(auteur)
    setDeleteOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Auteurs"
        description="Table de référence répliquée intégralement sur les trois sites."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Ajouter
          </Button>
        }
      />

      <Card className="mb-6 border-accent/30 bg-accent/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Copy className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
          <p className="text-sm text-muted-foreground">
            Réplication complète : toute création d&apos;auteur est propagée à{" "}
            <SiteBadge site="UGB" className="mx-0.5" />
            <SiteBadge site="UCAD" className="mx-0.5" />
            <SiteBadge site="UADB" className="mx-0.5" />
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <DataState
          isLoading={auteurs.isLoading}
          error={auteurs.error}
          isEmpty={auteurs.data?.length === 0}
          emptyLabel="Aucun auteur enregistré."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead className="text-right">ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auteurs.data?.map((a) => {
                const { nom, prenom } = getNomPrenom(a.nomAuteur || a.nom || "")
                return (
                  <TableRow key={a.idAut || a.id}>
                    <TableCell className="font-medium">{nom}</TableCell>
                    <TableCell>{prenom}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {a.idAut || a.id || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(a)}
                          aria-label={`Modifier ${a.nomAuteur}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => openDelete(a)}
                          aria-label={`Supprimer ${a.nomAuteur}`}
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
            <DialogTitle>Nouvel auteur</DialogTitle>
            <DialogDescription>Sera répliqué sur les trois nœuds du réseau.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Réplication…" : "Créer et répliquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'auteur</DialogTitle>
            <DialogDescription>Les modifications seront répliquées sur les 3 sites.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              Cette action supprimera définitivement l&apos;auteur &quot;{selectedAuteur?.nomAuteur || selectedAuteur?.nom || "sans nom"}&quot; des 3 sites.
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
