// Domain model shared across the distributed library network (UGB / UCAD / UADB)

export type SiteCode = "UGB" | "UCAD" | "UADB"

export interface SiteInfo {
  code: SiteCode
  nom: string
  port: number
  sitesConnus: { code: SiteCode; url: string }[]
}

export interface Employe {
  id: number
  nom: string
  prenom: string
  poste: string
  site: SiteCode
}

export interface Etudiant {
  id: number
  nom: string
  prenom: string
  universite: SiteCode
  nbreEmprunts: number
}

export interface Auteur {
  id: string // UUID
  nom: string
  prenom: string
  nationalite: string
}

export interface Ouvrage {
  id: number
  titre: string
  idAuteur: string
  site: SiteCode
  disponible: boolean
}

// Result of the global fan-out search across the 3 sites
export interface OuvrageGlobal extends Ouvrage {
  siteSource: SiteCode
  auteurNom?: string
  auteurPrenom?: string
}

export type StatutPret = "EN_COURS" | "RETOURNE"

export interface Pret {
  id: number
  idOuvrage: number
  titreOuvrage: string
  idEtudiant: number
  nomEtudiant: string
  prenomEtudiant: string
  universiteEtudiant: SiteCode
  dateEmprunt: string
  dateRetour: string | null
  statut: StatutPret
}

export interface EmpruntRequest {
  etudiantId: number
  ouvrageId: number
}
