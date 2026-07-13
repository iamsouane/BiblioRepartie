"use client"

import Link from "next/link"
import {
  BookMarked,
  GraduationCap,
  BookOpenCheck,
  Users,
  Network,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge, DataState } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  )
}

function Dashboard() {
  const { site, siteConfig } = useSite()

  const ouvrages = useResource("ouvrages", (a) => a.getOuvrages(site))
  const etudiants = useResource("etudiants", (a) => a.getEtudiants(site))
  const employes = useResource("employes", (a) => a.getEmployes(site))
  const prets = useResource("prets", (a) => a.getPrets(site))
  const info = useResource("site-info", (a) => a.getSiteInfo(site))

  const dispo = ouvrages.data?.filter((o) => o.disponible).length ?? 0
  // Un prêt est en cours si dateRetour est null OU si le statut est "EN_COURS"
  const enCours = prets.data?.filter((p) => p.dateRetour === null || p.statut === "EN_COURS").length ?? 0

  const stats = [
    {
      label: "Ouvrages (fragment local)",
      value: ouvrages.data?.length,
      sub: `${dispo} disponibles`,
      icon: BookMarked,
      href: "/ouvrages",
    },
    {
      label: "Étudiants inscrits",
      value: etudiants.data?.length,
      sub: `Fragment ${site}`,
      icon: GraduationCap,
      href: "/etudiants",
    },
    {
      label: "Prêts en cours",
      value: enCours,
      sub: `${prets.data?.length ?? 0} au total`,
      icon: BookOpenCheck,
      href: "/prets",
    },
    {
      label: "Employés",
      value: employes.data?.length,
      sub: "Gérés localement",
      icon: Users,
      href: "/employes",
    },
  ]

  // Fallback pour sitesConnus si info.data est undefined
  const sitesConnus = info.data?.sitesConnus || [
    { code: "UGB", url: "http://localhost:8082" },
    { code: "UCAD", url: "http://localhost:8081" },
    { code: "UADB", url: "http://localhost:8083" },
  ]

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble du fragment de données géré par le site actif, dans le réseau de bibliothèques mutualisées UGB · UCAD · UADB."
        actions={<SiteBadge site={site} className="px-3 py-1 text-sm" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{s.value ?? "—"}</p>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Network className="size-5 text-primary" /> Architecture répartie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chaque site exécute le même service Spring Boot avec sa propre base PostgreSQL. Les données sont fragmentées
              horizontalement par site ; la table <span className="font-medium text-foreground">AUTEUR</span> est
              répliquée intégralement sur les trois nœuds.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["UGB", "UCAD", "UADB"] as const).map((code) => (
                <div key={code} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="flex items-center justify-between">
                    <SiteBadge site={code} />
                    {code === site && <Badge className="text-[10px]">actif</Badge>}
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>EMPLOYE_{code}</li>
                    <li>ETUDIANT_{code}</li>
                    <li>OUVRAGE_{code}</li>
                    <li>PRET_{code}</li>
                    <li className="text-foreground">AUTEUR (répliquée)</li>
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base">Site courant</CardTitle>
          </CardHeader>
          <CardContent>
            <DataState isLoading={info.isLoading} error={info.error}>
              <dl className="space-y-3 text-sm">
                <Row label="Code" value={<SiteBadge site={site} />} />
                <Row label="Nom" value={siteConfig.nom} />
                <Row label="Ville" value={siteConfig.ville} />
                <Row label="Port" value={<span className="font-mono">{siteConfig.port}</span>} />
                <div>
                  <dt className="mb-1.5 text-muted-foreground">Sites connus</dt>
                  <dd className="flex flex-col gap-1.5">
                    {sitesConnus.map((s: { code: string; url: string }) => (
                      <span key={s.code} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        <SiteBadge site={s.code} />
                        <span className="font-mono text-muted-foreground">{s.url}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </DataState>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
