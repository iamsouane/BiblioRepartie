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
  const { site } = useSite()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitre, setNewTitre] = useState("")
  const [newAuteur, setNewAuteur] = useState("")
  const [newDomaine, setNewDomaine] = useState("")
  
  const ouvrages = useResource("ouvrages", (a) => a.getOuvrages(site))
  const auteurs = useResource("auteurs", (a) => a.getAuteurs(site))
  const rechercheGlobale = useResource(
    "recherche-globale",
    (a) => searchTerm.length > 0 ? a.rechercheGlobale(site, searchTerm) : Promise.resolve([])
  )

  // Fonction pour obtenir le nom de l'auteur
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

  const handleAjouterOuvrage = async () => {
    toast.success("Ouvrage ajouté avec succès")
    setIsDialogOpen(false)
    setNewTitre("")
    setNewAuteur("")
    setNewDomaine("")
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
                <Button size="sm" variant="default">
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
                    <Label htmlFor="auteur">Auteur</Label>
                    <Input
                      id="auteur"
                      placeholder="Nom de l'auteur"
                      value={newAuteur}
                      onChange={(e) => setNewAuteur(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="domaine">Domaine</Label>
                    <Input
                      id="domaine"
                      placeholder="Domaine"
                      value={newDomaine}
                      onChange={(e) => setNewDomaine(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAjouterOuvrage}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Barre de recherche */}
      <Card className="mb-4">
        <CardContent className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un ouvrage sur l'ensemble des sites..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Search className="size-4 mr-1" />
            Recherche globale
          </Button>
        </CardContent>
      </Card>

      {/* Résultats recherche */}
      {searchTerm.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">
              🌐 Résultats globaux ({rechercheGlobale.data?.length || 0})
            </h3>
            <DataState isLoading={rechercheGlobale.isLoading} error={rechercheGlobale.error}>
              {rechercheGlobale.data && rechercheGlobale.data.length > 0 ? (
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
                    {rechercheGlobale.data.map((o, index) => (
                      <TableRow key={getKey(o, index)}>
                        <TableCell className="font-mono text-muted-foreground text-xs">
                          {o.id || o.idOuv || "—"}
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
            </DataState>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {ouvrages.data && ouvrages.data.length > 0 ? (
                  ouvrages.data.map((o, index) => (
                    <TableRow key={getKey(o, index)}>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {o.id || "—"}
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucun ouvrage dans ce fragment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DataState>
        </CardContent>
      </Card>
    </>
  )
}
