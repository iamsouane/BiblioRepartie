// frontend/app/ouvrages/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Package,
  Pencil,
  Trash2,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function OuvragesPage() {
  return (
    <AppShell>
      <Ouvrages />
    </AppShell>
  )
}

function Ouvrages() {
  const { site, api } = useSite() // Ajout de api
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOuvrage, setSelectedOuvrage] = useState<any>(null)
  const [newTitre, setNewTitre] = useState("")
  const [newAuteurId, setNewAuteurId] = useState<string>("")
  const [newDomaine, setNewDomaine] = useState("")
  const [newStock, setNewStock] = useState("1")
  const [editTitre, setEditTitre] = useState("")
  const [editAuteurId, setEditAuteurId] = useState<string>("")
  const [editDomaine, setEditDomaine] = useState("")
  const [editStock, setEditStock] = useState("1")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const ouvrages = useResource("ouvrages", (a) => a.getOuvrages(site))
  const auteurs = useResource("auteurs", (a) => a.getAuteurs(site))

  const getAuteurNom = (auteurId: any) => {
    if (!auteurId) return "—"
    const id = Number(auteurId)
    if (auteurs.data && auteurs.data.length > 0) {
      for (const a of auteurs.data) {
        const aid = a.idAut || a.id
        if (Number(aid) === id) {
          return a.nomAuteur || a.nom || "Inconnu"
        }
      }
    }
    return "—"
  }

  const getSiteDisplay = (item: any) => {
    return item.siteSource || item.site || "—"
  }

  const getTitre = (item: any) => {
    return item.titre || "Sans titre"
  }

  const getDisponible = (item: any) => {
    if (item.disponible !== undefined) return item.disponible
    if (item.stock !== undefined) return item.stock > 0
    return false
  }

  const getStock = (item: any) => {
    if (item.stock !== undefined) return item.stock
    return 0
  }

  const getKey = (item: any, index: number) => {
    return item?.id || item?.idOuv || `item-${index}`
  }

  // Fonction de recherche
  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!searchTerm.trim()) {
      toast.error("Saisissez un terme à rechercher")
      return
    }
    setSearching(true)
    try {
      const res = await api.rechercheGlobale(site, searchTerm.trim())
      console.log("Résultats recherche:", res)
      setSearchResults(res)
    } catch (err) {
      console.error("Erreur:", err)
      toast.error((err as Error).message)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Réinitialiser les résultats quand le terme change
  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchTerm(value)
    if (value === "") {
      setSearchResults(null)
    }
  }

  const resetForm = () => {
    setNewTitre("")
    setNewAuteurId("")
    setNewDomaine("")
    setNewStock("1")
  }

  const resetEditForm = () => {
    setEditTitre("")
    setEditAuteurId("")
    setEditDomaine("")
    setEditStock("1")
    setSelectedOuvrage(null)
  }

  const handleAjouterOuvrage = async () => {
    if (!newTitre.trim() || !newAuteurId) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    setSaving(true)
    try {
      const baseUrl = `http://localhost:8081`
      const res = await fetch(`${baseUrl}/api/ouvrages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTitre.trim(),
          auteurId: parseInt(newAuteurId),
          editeur: "Non renseigné",
          annee: new Date().getFullYear(),
          domaine: newDomaine.trim() || "Non renseigné",
          stock: parseInt(newStock) || 1,
          site: site
        })
      })
      
      if (!res.ok) throw new Error("Erreur lors de la création")
      
      toast.success("Ouvrage ajouté avec succès")
      setIsDialogOpen(false)
      resetForm()
      ouvrages.mutate()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (ouvrage: any) => {
    setSelectedOuvrage(ouvrage)
    setEditTitre(ouvrage.titre || "")
    setEditAuteurId(String(ouvrage.auteurId || ""))
    setEditDomaine(ouvrage.domaine || "")
    setEditStock(String(ouvrage.stock || 1))
    setIsEditDialogOpen(true)
  }

  const handleEditOuvrage = async () => {
    if (!editTitre.trim() || !editAuteurId) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    setSaving(true)
    try {
      const baseUrl = `http://localhost:8081`
      const id = selectedOuvrage.idOuv || selectedOuvrage.id
      const res = await fetch(`${baseUrl}/api/ouvrages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: editTitre.trim(),
          auteurId: parseInt(editAuteurId),
          editeur: selectedOuvrage.editeur || "Non renseigné",
          annee: selectedOuvrage.annee || new Date().getFullYear(),
          domaine: editDomaine.trim() || "Non renseigné",
          stock: parseInt(editStock) || 1,
          site: site
        })
      })
      
      if (!res.ok) throw new Error("Erreur lors de la modification")
      
      toast.success("Ouvrage modifié avec succès")
      setIsEditDialogOpen(false)
      resetEditForm()
      ouvrages.mutate()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const openDeleteDialog = (ouvrage: any) => {
    setSelectedOuvrage(ouvrage)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteOuvrage = async () => {
    setDeleting(true)
    try {
      const baseUrl = `http://localhost:8081`
      const id = selectedOuvrage.idOuv || selectedOuvrage.id
      const res = await fetch(`${baseUrl}/api/ouvrages/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      
      toast.success("Ouvrage supprimé avec succès")
      setIsDeleteDialogOpen(false)
      setSelectedOuvrage(null)
      ouvrages.mutate()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Ouvrages"
        description={`Fonds documentaire détenu localement par ce site (fragment horizontal σ site).`}
        actions={
          <div className="flex items-center gap-2">
            <SiteBadge site={site} className="px-3 py-1 text-sm" />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" onClick={resetForm}>
                  <Plus className="size-4 mr-1" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un ouvrage</DialogTitle>
                  <DialogDescription>
                    Renseignez les informations du nouvel ouvrage.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      placeholder="Titre de l'ouvrage"
                      value={newTitre}
                      onChange={(e) => setNewTitre(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="auteur">Auteur *</Label>
                    <Select value={newAuteurId} onValueChange={setNewAuteurId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un auteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {auteurs.data && auteurs.data.length > 0 ? (
                          auteurs.data.map((a: any) => (
                            <SelectItem key={a.idAut || a.id} value={String(a.idAut || a.id)}>
                              {a.nomAuteur || a.nom || "Inconnu"}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Aucun auteur disponible. Créez d'abord un auteur.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="domaine">Domaine</Label>
                    <Input
                      id="domaine"
                      placeholder="Domaine (ex: Littérature, Histoire...)"
                      value={newDomaine}
                      onChange={(e) => setNewDomaine(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="Nombre d'exemplaires"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAjouterOuvrage} disabled={saving || !newTitre.trim() || !newAuteurId}>
                    {saving ? "Ajout..." : "Ajouter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Barre de recherche - CORRIGÉE */}
      <Card className="mb-4">
        <CardContent className="flex flex-col sm:flex-row gap-3 p-4">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un ouvrage sur l'ensemble des sites..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </div>
            <Button type="submit" variant="default" size="sm" disabled={searching}>
              {searching ? "Recherche..." : "Recherche globale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Résultats recherche */}
      {searchResults !== null && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">
              🌐 Résultats globaux ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Détenu par</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((o, index) => (
                    <TableRow key={getKey(o, index)}>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {o.idOuv || o.id || "—"}
                      </TableCell>
                      <TableCell className="font-medium">{getTitre(o)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getAuteurNom(o.auteurId || o.idAuteur)}
                      </TableCell>
                      <TableCell>
                        <SiteBadge site={getSiteDisplay(o)} />
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        <Badge variant={getStock(o) > 0 ? "default" : "destructive"} className="gap-1">
                          <Package className="size-3" />
                          {getStock(o)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getDisponible(o) ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="size-3" />
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="size-3" />
                            Emprunté
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun résultat pour "{searchTerm}"
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tableau des ouvrages locaux */}
      <Card>
        <CardContent className="p-0">
          <DataState isLoading={ouvrages.isLoading} error={ouvrages.error}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ouvrages.data && ouvrages.data.length > 0 ? (
                  ouvrages.data.map((o, index) => {
                    const ouvId = o.idOuv || o.id
                    return (
                      <TableRow key={getKey(o, index)}>
                        <TableCell className="font-mono text-muted-foreground text-xs">
                          {ouvId || "—"}
                        </TableCell>
                        <TableCell className="font-medium">{o.titre || "Sans titre"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {getAuteurNom(o.auteurId)}
                        </TableCell>
                        <TableCell>
                          <SiteBadge site={o.site} />
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <Badge variant={getStock(o) > 0 ? "default" : "destructive"} className="gap-1">
                            <Package className="size-3" />
                            {getStock(o)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {o.disponible ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="size-3" />
                              Disponible
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="size-3" />
                              Emprunté
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(o)}
                              title="Modifier"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => openDeleteDialog(o)}
                              title="Supprimer"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Aucun ouvrage dans ce fragment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DataState>
        </CardContent>
      </Card>

      {/* Dialog Modifier */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'ouvrage</DialogTitle>
            <DialogDescription>
              Modifier les informations de l'ouvrage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-titre">Titre *</Label>
              <Input
                id="edit-titre"
                value={editTitre}
                onChange={(e) => setEditTitre(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-auteur">Auteur *</Label>
              <Select value={editAuteurId} onValueChange={setEditAuteurId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un auteur" />
                </SelectTrigger>
                <SelectContent>
                  {auteurs.data && auteurs.data.length > 0 ? (
                    auteurs.data.map((a: any) => (
                      <SelectItem key={a.idAut || a.id} value={String(a.idAut || a.id)}>
                        {a.nomAuteur || a.nom || "Inconnu"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Aucun auteur disponible.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-domaine">Domaine</Label>
              <Input
                id="edit-domaine"
                value={editDomaine}
                onChange={(e) => setEditDomaine(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-stock">Stock *</Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditOuvrage} disabled={saving || !editTitre.trim() || !editAuteurId}>
              {saving ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Supprimer */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l&apos;ouvrage &quot;{selectedOuvrage?.titre || "sans titre"}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOuvrage} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
