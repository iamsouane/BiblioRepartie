// In-memory simulation of the 3 distributed Spring Boot sites.
// Lets the UI run end-to-end (including the inter-site distributed transaction)
// without the local backend being reachable from the preview.

import type {
  Auteur,
  Employe,
  Etudiant,
  EmpruntRequest,
  Ouvrage,
  OuvrageGlobal,
  Pret,
  SiteCode,
  SiteInfo,
} from "./types"
import { SITES } from "./config"

interface SiteData {
  employes: Employe[]
  etudiants: Etudiant[]
  ouvrages: Ouvrage[]
  prets: Pret[]
  auteurs: Auteur[] // replicated: same content on every site
}

// Shared, replicated AUTEUR table
const AUTEURS: Auteur[] = [
  { id: "a1", nom: "Diop", prenom: "Birago", nationalite: "Sénégalaise" },
  { id: "a2", nom: "Bâ", prenom: "Mariama", nationalite: "Sénégalaise" },
  { id: "a3", nom: "Senghor", prenom: "Léopold Sédar", nationalite: "Sénégalaise" },
  { id: "a4", nom: "Achebe", prenom: "Chinua", nationalite: "Nigériane" },
  { id: "a5", nom: "Adichie", prenom: "Chimamanda", nationalite: "Nigériane" },
]

function cloneAuteurs(): Auteur[] {
  return AUTEURS.map((a) => ({ ...a }))
}

const store: Record<SiteCode, SiteData> = {
  UGB: {
    employes: [
      { id: 1, nom: "Ndiaye", prenom: "Fatou", poste: "Bibliothécaire", site: "UGB" },
      { id: 2, nom: "Sarr", prenom: "Modou", poste: "Agent d'accueil", site: "UGB" },
    ],
    etudiants: [
      { id: 1, nom: "Diop", prenom: "Awa", universite: "UGB", nbreEmprunts: 1 },
      { id: 2, nom: "Fall", prenom: "Ibrahima", universite: "UGB", nbreEmprunts: 0 },
    ],
    ouvrages: [
      { id: 101, titre: "Les Contes d'Amadou Koumba", idAuteur: "a1", site: "UGB", disponible: true },
      { id: 102, titre: "Une si longue lettre", idAuteur: "a2", site: "UGB", disponible: false },
      { id: 103, titre: "Hosties noires", idAuteur: "a3", site: "UGB", disponible: true },
    ],
    prets: [
      {
        id: 9001,
        idOuvrage: 102,
        titreOuvrage: "Une si longue lettre",
        idEtudiant: 1,
        nomEtudiant: "Diop",
        prenomEtudiant: "Awa",
        universiteEtudiant: "UGB",
        dateEmprunt: "2026-06-20",
        dateRetour: null,
        statut: "EN_COURS",
      },
    ],
    auteurs: cloneAuteurs(),
  },
  UCAD: {
    employes: [{ id: 1, nom: "Gueye", prenom: "Aïssatou", poste: "Bibliothécaire", site: "UCAD" }],
    etudiants: [
      { id: 1, nom: "Ba", prenom: "Ousmane", universite: "UCAD", nbreEmprunts: 0 },
      { id: 2, nom: "Sow", prenom: "Khadija", universite: "UCAD", nbreEmprunts: 2 },
    ],
    ouvrages: [
      { id: 201, titre: "Things Fall Apart", idAuteur: "a4", site: "UCAD", disponible: true },
      { id: 202, titre: "Americanah", idAuteur: "a5", site: "UCAD", disponible: true },
      { id: 203, titre: "Éthiopiques", idAuteur: "a3", site: "UCAD", disponible: false },
    ],
    prets: [],
    auteurs: cloneAuteurs(),
  },
  UADB: {
    employes: [{ id: 1, nom: "Diallo", prenom: "Mamadou", poste: "Responsable BU", site: "UADB" }],
    etudiants: [{ id: 1, nom: "Cissé", prenom: "Rama", universite: "UADB", nbreEmprunts: 0 }],
    ouvrages: [
      { id: 301, titre: "Purple Hibiscus", idAuteur: "a5", site: "UADB", disponible: true },
      { id: 302, titre: "La Belle Histoire de Leuk-le-Lièvre", idAuteur: "a3", site: "UADB", disponible: true },
    ],
    prets: [],
    auteurs: cloneAuteurs(),
  },
}

let idCounter = 100000
const nextId = () => ++idCounter

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function auteurLabel(site: SiteCode, idAuteur: string) {
  const a = store[site].auteurs.find((x) => x.id === idAuteur)
  return a ? { auteurNom: a.nom, auteurPrenom: a.prenom } : {}
}

export const demoStore = {
  getSiteInfo(site: SiteCode): SiteInfo {
    const cfg = SITES[site]
    return {
      code: site,
      nom: cfg.nom,
      port: cfg.port,
      sitesConnus: (Object.keys(SITES) as SiteCode[])
        .filter((s) => s !== site)
        .map((s) => ({ code: s, url: SITES[s].baseUrl })),
    }
  },

  getEmployes: (site: SiteCode) => store[site].employes.map((e) => ({ ...e })),
  addEmploye(site: SiteCode, data: Omit<Employe, "id" | "site">) {
    const e: Employe = { ...data, id: nextId(), site }
    store[site].employes.push(e)
    return e
  },
  deleteEmploye(site: SiteCode, id: number) {
    store[site].employes = store[site].employes.filter((e) => e.id !== id)
  },

  getEtudiants: (site: SiteCode) => store[site].etudiants.map((e) => ({ ...e })),
  getEtudiant: (site: SiteCode, id: number) => store[site].etudiants.find((e) => e.id === id),
  addEtudiant(site: SiteCode, data: Omit<Etudiant, "id" | "universite" | "nbreEmprunts">) {
    const e: Etudiant = { ...data, id: nextId(), universite: site, nbreEmprunts: 0 }
    store[site].etudiants.push(e)
    return e
  },

  getOuvrages: (site: SiteCode) => store[site].ouvrages.map((o) => ({ ...o })),
  addOuvrage(site: SiteCode, data: Omit<Ouvrage, "id" | "site" | "disponible">) {
    const o: Ouvrage = { ...data, id: nextId(), site, disponible: true }
    store[site].ouvrages.push(o)
    return o
  },

  getAuteurs: (site: SiteCode) => store[site].auteurs.map((a) => ({ ...a })),
  addAuteur(site: SiteCode, data: Omit<Auteur, "id">) {
    const a: Auteur = { ...data, id: `a${nextId()}` }
    // replicated across all sites
    ;(Object.keys(store) as SiteCode[]).forEach((s) => store[s].auteurs.push({ ...a }))
    return a
  },

  getPrets: (site: SiteCode) => store[site].prets.map((p) => ({ ...p })),

  rechercheLocale(site: SiteCode, titre: string): OuvrageGlobal[] {
    const q = titre.trim().toLowerCase()
    return store[site].ouvrages
      .filter((o) => o.titre.toLowerCase().includes(q))
      .map((o) => ({ ...o, siteSource: site, ...auteurLabel(site, o.idAuteur) }))
  },

  rechercheGlobale(titre: string): OuvrageGlobal[] {
    const sites = Object.keys(store) as SiteCode[]
    return sites.flatMap((s) => this.rechercheLocale(s, titre))
  },

  // Distributed transaction (saga with compensation) — the loan is always
  // processed by the site that OWNS the ouvrage.
  emprunter(ouvrageSite: SiteCode, req: EmpruntRequest): { pret: Pret; distant: boolean; compteurAjuste: boolean } {
    const site = store[ouvrageSite]
    const ouvrage = site.ouvrages.find((o) => o.id === req.idOuvrage)
    if (!ouvrage) throw new Error(`Ouvrage #${req.idOuvrage} introuvable sur le site ${ouvrageSite}`)
    if (!ouvrage.disponible) throw new Error(`L'ouvrage "${ouvrage.titre}" n'est pas disponible`)

    // 1 + 2. Create loan locally and mark ouvrage unavailable
    ouvrage.disponible = false
    const pret: Pret = {
      id: nextId(),
      idOuvrage: ouvrage.id,
      titreOuvrage: ouvrage.titre,
      idEtudiant: req.idEtudiant,
      nomEtudiant: req.nomEtudiant,
      prenomEtudiant: req.prenomEtudiant,
      universiteEtudiant: req.universiteEtudiant,
      dateEmprunt: today(),
      dateRetour: null,
      statut: "EN_COURS",
    }
    site.prets.push(pret)

    const distant = req.universiteEtudiant !== ouvrageSite
    // 3 / 4. Adjust the student's counter (local or via remote call)
    const etudiantSite = store[req.universiteEtudiant]
    const etudiant = etudiantSite.etudiants.find((e) => e.id === req.idEtudiant)
    if (!etudiant) {
      // compensation: remote/local student not found -> roll back
      ouvrage.disponible = true
      site.prets = site.prets.filter((p) => p.id !== pret.id)
      throw new Error(
        `Compensation: étudiant #${req.idEtudiant} introuvable sur ${req.universiteEtudiant}. Prêt annulé, ouvrage remis disponible.`,
      )
    }
    etudiant.nbreEmprunts += 1
    return { pret, distant, compteurAjuste: true }
  },

  retour(ouvrageSite: SiteCode, idPret: number): Pret {
    const site = store[ouvrageSite]
    const pret = site.prets.find((p) => p.id === idPret)
    if (!pret) throw new Error(`Prêt #${idPret} introuvable`)
    pret.statut = "RETOURNE"
    pret.dateRetour = today()
    const ouvrage = site.ouvrages.find((o) => o.id === pret.idOuvrage)
    if (ouvrage) ouvrage.disponible = true
    // decrement the student's counter on its owning site
    const etu = store[pret.universiteEtudiant].etudiants.find((e) => e.id === pret.idEtudiant)
    if (etu && etu.nbreEmprunts > 0) etu.nbreEmprunts -= 1
    return { ...pret }
  },
}
