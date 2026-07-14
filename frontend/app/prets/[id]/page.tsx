"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, User, BookOpen, Building, XCircle, RefreshCw } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Définition des URLs des sites
const SITE_URLS: Record<string, string> = {
  UGB: "http://localhost:8082",
  UCAD: "http://localhost:8081",
  UADB: "http://localhost:8083",
}

export default function PretDetailsPage() {
  return (
    <AppShell>
      <PretDetails />
    </AppShell>
  )
}

function PretDetails() {
  const { site } = useSite()
  const params = useParams()
  const router = useRouter()
  const pretId = params?.id ? parseInt(params.id as string) : null
  
  const [pretDetail, setPretDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer le nom d'un étudiant depuis son site
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

  useEffect(() => {
    const fetchPretDetails = async () => {
      if (!pretId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const baseUrl = SITE_URLS[site] || "http://localhost:8081"
        const res = await fetch(`${baseUrl}/api/prets`)
        if (!res.ok) throw new Error("Erreur lors du chargement des prêts")
        
        const prets = await res.json()
        const pret = prets.find((p: any) => (p.idPret || p.id) === pretId)
        
        if (!pret) {
          throw new Error("Prêt non trouvé")
        }
        
        const ouvragesRes = await fetch(`${baseUrl}/api/ouvrages`)
        const ouvrages = await ouvragesRes.json()
        const ouvrage = ouvrages.find((o: any) => (o.idOuv || o.id) === pret.ouvrageId)
        
        // Récupérer le nom de l'étudiant depuis son site
        const etudiantNom = await getEtudiantName(pret.etudiantId)
        
        let universite = "—"
        if (pret.etudiantId >= 1000 && pret.etudiantId < 2000) universite = "UGB"
        else if (pret.etudiantId >= 2000 && pret.etudiantId < 3000) universite = "UCAD"
        else if (pret.etudiantId >= 3000 && pret.etudiantId < 4000) universite = "UADB"
        
        setPretDetail({
          ...pret,
          id: pret.idPret || pret.id,
          titreOuvrage: ouvrage?.titre || `Ouvrage #${pret.ouvrageId}`,
          nomEtudiant: etudiantNom,
          universiteEtudiant: universite,
          dateEmprunt: pret.dateEmprunt || "—",
          dateRetour: pret.dateRetour || null,
          statut: pret.dateRetour === null ? "EN_COURS" : "RETOURNE",
          domaine: ouvrage?.domaine || "—",
          editeur: ouvrage?.editeur || "—",
          annee: ouvrage?.annee || "—"
        })
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPretDetails()
  }, [pretId, site])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des détails du prêt...</p>
        </div>
      </div>
    )
  }

  if (error || !pretDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="size-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-destructive">Erreur</p>
          <p className="text-muted-foreground">{error || "Prêt non trouvé"}</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const isEnCours = pretDetail.statut === "EN_COURS"

  return (
    <>
      <PageHeader
        title={`Prêt #${pretDetail.id}`}
        description="Détails complets du prêt"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID du prêt</p>
                <p className="font-mono font-medium">{pretDetail.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge variant={isEnCours ? "default" : "secondary"} className="mt-1">
                  {isEnCours ? "En cours" : "Retourné"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date d'emprunt</p>
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4 text-muted-foreground" />
                  {pretDetail.dateEmprunt}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de retour</p>
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4 text-muted-foreground" />
                  {pretDetail.dateRetour || "—"}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Site de traitement</p>
              <p className="font-medium"><SiteBadge site={site} /></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Ouvrage emprunté
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Titre</p>
              <p className="font-medium text-lg">{pretDetail.titreOuvrage}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Domaine</p>
                <p>{pretDetail.domaine}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Année</p>
                <p>{pretDetail.annee}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Éditeur</p>
              <p>{pretDetail.editeur}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Détenu par</p>
              <SiteBadge site={site} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Étudiant emprunteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{pretDetail.nomEtudiant}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Université</p>
                <SiteBadge site={pretDetail.universiteEtudiant} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID étudiant</p>
                <p className="font-mono">{pretDetail.etudiantId}</p>
              </div>
            </div>
            {pretDetail.universiteEtudiant !== site && (
              <div className="mt-4 p-3 rounded-lg border border-accent/40 bg-accent/10 text-sm">
                <Building className="size-4 inline-block mr-2 text-accent-foreground" />
                <span className="text-accent-foreground">
                  Prêt inter-site : l'étudiant est de {pretDetail.universiteEtudiant}, 
                  le prêt est traité par {site}.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              Historique de la transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-3 rounded-full bg-primary mt-1.5" />
                  <div className="w-0.5 h-12 bg-border" />
                </div>
                <div>
                  <p className="font-medium">Emprunt enregistré</p>
                  <p className="text-sm text-muted-foreground">
                    {pretDetail.dateEmprunt} - Site {site}
                  </p>
                </div>
              </div>
              {pretDetail.dateRetour && (
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-green-500 mt-1.5" />
                  </div>
                  <div>
                    <p className="font-medium">Retour effectué</p>
                    <p className="text-sm text-muted-foreground">
                      {pretDetail.dateRetour} - Site {site}
                    </p>
                  </div>
                </div>
              )}
              {!pretDetail.dateRetour && (
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-yellow-500 mt-1.5 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-600">En cours</p>
                    <p className="text-sm text-muted-foreground">L'ouvrage n'a pas encore été retourné</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
