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
import { demoStore } from "./demo-store"

export type ApiMode = "demo" | "live"

export interface ApiContext {
  mode: ApiMode
  baseUrls: Record<SiteCode, string>
}

async function req<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) msg = body.message
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export function createApi(ctx: ApiContext) {
  const base = (site: SiteCode) => ctx.baseUrls[site]
  const isDemo = ctx.mode === "demo"

  return {
    async getSiteInfo(site: SiteCode): Promise<SiteInfo> {
      if (isDemo) return await delay().then(() => demoStore.getSiteInfo(site))
      return req<SiteInfo>(base(site), "/api/site")
    },

    async getEmployes(site: SiteCode): Promise<Employe[]> {
      if (isDemo) return await delay().then(() => demoStore.getEmployes(site))
      return req<Employe[]>(base(site), "/api/employes")
    },
    async addEmploye(site: SiteCode, data: Omit<Employe, "id" | "site">): Promise<Employe> {
      if (isDemo) return await delay().then(() => demoStore.addEmploye(site, data))
      return req<Employe>(base(site), "/api/employes", { method: "POST", body: JSON.stringify(data) })
    },
    async deleteEmploye(site: SiteCode, id: number): Promise<void> {
      if (isDemo) return await delay().then(() => demoStore.deleteEmploye(site, id))
      return req<void>(base(site), `/api/employes/${id}`, { method: "DELETE" })
    },

    async getEtudiants(site: SiteCode): Promise<Etudiant[]> {
      if (isDemo) return await delay().then(() => demoStore.getEtudiants(site))
      return req<Etudiant[]>(base(site), "/api/etudiants")
    },
    async addEtudiant(
      site: SiteCode,
      data: Omit<Etudiant, "id" | "universite" | "nbreEmprunts">
    ): Promise<Etudiant> {
      if (isDemo) return await delay().then(() => demoStore.addEtudiant(site, data))
      return req<Etudiant>(base(site), "/api/etudiants", { method: "POST", body: JSON.stringify(data) })
    },

    async getOuvrages(site: SiteCode): Promise<Ouvrage[]> {
      if (isDemo) return await delay().then(() => demoStore.getOuvrages(site))
      return req<Ouvrage[]>(base(site), "/api/ouvrages")
    },
    async addOuvrage(site: SiteCode, data: Omit<Ouvrage, "id" | "site" | "disponible">): Promise<Ouvrage> {
      if (isDemo) return await delay().then(() => demoStore.addOuvrage(site, data))
      return req<Ouvrage>(base(site), "/api/ouvrages", { method: "POST", body: JSON.stringify(data) })
    },

    // Recherche globale - interroge tous les sites en parallèle
    async rechercheGlobale(site: SiteCode, titre: string): Promise<OuvrageGlobal[]> {
      if (isDemo) return await delay(500).then(() => demoStore.rechercheGlobale(titre))
      
      // Encoder le titre pour les caractères spéciaux
      const encodedTitre = encodeURIComponent(titre)
      
      const sites: SiteCode[] = ["UGB", "UCAD", "UADB"]
      const allResults = await Promise.all(
        sites.map(async (s) => {
          try {
            const url = `${base(s)}/api/ouvrages/recherche-globale?titre=${encodedTitre}`
            const res = await fetch(url)
            if (!res.ok) return []
            const data = await res.json()
            console.log(`Résultats de ${s}:`, data)
            return (data || []).map((item: any) => ({
              id: item.idOuv || item.id,
              titre: item.titre || "Sans titre",
              auteurNom: item.auteurNom || null,
              auteurPrenom: item.auteurPrenom || null,
              auteurId: item.auteurId || null,
              siteSource: item.site || s,
              disponible: (item.stock || 0) > 0,
              stock: item.stock || 0,
              editeur: item.editeur,
              annee: item.annee,
              domaine: item.domaine
            }))
          } catch (err) {
            console.error(`Erreur sur ${s}:`, err)
            return []
          }
        })
      )
      
      return allResults.flat()
    },

    async getAuteurs(site: SiteCode): Promise<Auteur[]> {
      if (isDemo) return await delay().then(() => demoStore.getAuteurs(site))
      return req<Auteur[]>(base(site), "/api/auteurs")
    },
    async addAuteur(site: SiteCode, data: Omit<Auteur, "id">): Promise<Auteur> {
      if (isDemo) return await delay().then(() => demoStore.addAuteur(site, data))
      return req<Auteur>(base(site), "/api/auteurs", { method: "POST", body: JSON.stringify(data) })
    },

    async getPrets(site: SiteCode): Promise<Pret[]> {
      if (isDemo) return await delay().then(() => demoStore.getPrets(site))
      return req<Pret[]>(base(site), "/api/prets")
    },

    async emprunter(ouvrageSite: SiteCode, data: EmpruntRequest): Promise<Pret> {
      if (isDemo) return await delay(500).then(() => demoStore.emprunter(ouvrageSite, data).pret)
      return req<Pret>(base(ouvrageSite), "/api/prets/emprunter", { method: "POST", body: JSON.stringify(data) })
    },

    async retour(ouvrageSite: SiteCode, idPret: number): Promise<Pret> {
      if (isDemo) return await delay().then(() => demoStore.retour(ouvrageSite, idPret))
      return req<Pret>(base(ouvrageSite), `/api/prets/retourner`, { 
        method: "POST", 
        body: JSON.stringify({ pretId: idPret }) 
      })
    },
  }
}

export type Api = ReturnType<typeof createApi>
