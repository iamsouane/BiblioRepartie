"use client"

import { useState } from "react"
import { ArrowLeftRight, CheckCircle2, Loader2, Server, ArrowRight, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { PageHeader, SiteBadge } from "@/components/shared"
import { useSite } from "@/components/site-provider"
import { useResource } from "@/lib/use-resource"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SITE_CODES } from "@/lib/config"
import type { Etudiant, SiteCode } from "@/lib/types"

export default function EmpruntsPage() {
  return (
    <AppShell>
      <Emprunts />
    </AppShell>
  )
}

type TxState = "idle" | "running" | "done" | "error"

function Emprunts() {
  const { site, api } = useSite()

  const ouvrages = useResource("ouvrages", (a) => a.getOuvrages(site))
  const [univEtudiant, setUnivEtudiant] = useState<SiteCode>(site)
  const etudiants = useResource(
    `etudiants-${univEtudiant}`,
    (a) => a.getEtudiants(univEtudiant),
  )

  const [idOuvrage, setIdOuvrage] = useState<string>("")
  const [idEtudiant, setIdEtudiant] = useState<string>("")
  const [tx, setTx] = useState<TxState>("idle")
  const [txMsg, setTxMsg] = useState<string>("")

  const disponibles = ouvrages.data?.filter((o) => o.disponible) ?? []
  const distant = univEtudiant !== site

  async function submit() {
    const etu = etudiants.data?.find((e) => String(e.id) === idEtudiant)
    const ouv = disponibles.find((o) => String(o.id) === idOuvrage)
    if (!ouv || !etu) {
      toast.error("Sélectionnez un ouvrage disponible et un étudiant")
      return
    }
    setTx("running")
    setTxMsg("")
    try {
      await api.emprunter(site, {
        idOuvrage: ouv.id,
        idEtudiant: etu.id,
        universiteEtudiant: univEtudiant,
        nomEtudiant: etu.nom,
        prenomEtudiant: etu.prenom,
      })
      setTx("done")
      toast.success(distant ? "Transaction distribuée validée" : "Emprunt enregistré")
      setIdOuvrage("")
      setIdEtudiant("")
      ouvrages.mutate()
      etudiants.mutate()
    } catch (e) {
      setTx("error")
      setTxMsg((e as Error).message)
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Emprunts"
        description="Enregistrer un emprunt. Le prêt est traité par le site de l'ouvrage ; si l'étudiant relève d'une autre université, une transaction distribuée ajuste son compteur à distance."
        actions={
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Server className="size-4" /> Site traitant <SiteBadge site={site} />
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Nouvel emprunt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Ouvrage disponible (détenu par {site})</Label>
              <Select value={idOuvrage} onValueChange={setIdOuvrage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un ouvrage" />
                </SelectTrigger>
                <SelectContent>
                  {disponibles.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      #{o.id} — {o.titre}
                    </SelectItem>
                  ))}
                  {disponibles.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Aucun ouvrage disponible</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Université de l&apos;étudiant</Label>
              <Select
                value={univEtudiant}
                onValueChange={(v) => {
                  setUnivEtudiant(v as SiteCode)
                  setIdEtudiant("")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_CODES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c} {c === site ? "(local)" : "(distant)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Étudiant emprunteur</Label>
              <Select value={idEtudiant} onValueChange={setIdEtudiant}>
                <SelectTrigger>
                  <SelectValue placeholder={etudiants.isLoading ? "Chargement…" : "Choisir un étudiant"} />
                </SelectTrigger>
                <SelectContent>
                  {etudiants.data?.map((e: Etudiant) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      #{e.id} — {e.prenom} {e.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border p-3 text-sm",
                distant
                  ? "border-accent/40 bg-accent/10 text-accent-foreground"
                  : "border-primary/30 bg-primary/5 text-foreground",
              )}
            >
              {distant ? <ArrowLeftRight className="size-4" /> : <CheckCircle2 className="size-4 text-primary" />}
              {distant ? (
                <span>
                  Transaction <strong>distribuée</strong> : le compteur de l&apos;étudiant vit sur{" "}
                  <SiteBadge site={univEtudiant} className="mx-0.5" /> et sera ajusté via un appel REST inter-site.
                </span>
              ) : (
                <span>
                  Transaction <strong>locale</strong> : ouvrage et étudiant sont sur le même site.
                </span>
              )}
            </div>

            <Button className="w-full" onClick={submit} disabled={tx === "running"}>
              {tx === "running" ? <Loader2 className="size-4 animate-spin" /> : <ArrowLeftRight className="size-4" />}
              {tx === "running" ? "Traitement…" : "Enregistrer l'emprunt"}
            </Button>
          </CardContent>
        </Card>

        <SagaPanel state={tx} distant={distant} processing={site} etudiantSite={univEtudiant} errorMsg={txMsg} />
      </div>
    </>
  )
}

function SagaPanel({
  state,
  distant,
  processing,
  etudiantSite,
  errorMsg,
}: {
  state: TxState
  distant: boolean
  processing: SiteCode
  etudiantSite: SiteCode
  errorMsg: string
}) {
  const active = state === "running" || state === "done" || state === "error"
  const ok = state === "done"
  const failed = state === "error"

  const steps = [
    { n: 1, label: `${processing} vérifie la disponibilité localement`, site: processing },
    { n: 2, label: `${processing} crée le PRET et passe l'ouvrage à disponible = false`, site: processing },
    distant
      ? {
          n: 3,
          label: `Appel REST → ${etudiantSite} : ajuster nbreEmprunts (+1)`,
          site: etudiantSite,
          remote: true,
        }
      : { n: 3, label: `${processing} incrémente nbreEmprunts (même transaction locale)`, site: processing },
  ]

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <ArrowLeftRight className="size-5 text-primary" /> Saga applicative
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card p-4">
          <SiteNode code={processing} label="Site traitant" active={active} />
          {distant ? (
            <ArrowRight className={cn("size-5", active ? "text-accent-foreground" : "text-muted-foreground")} />
          ) : (
            <span className="text-xs text-muted-foreground">local</span>
          )}
          {distant && <SiteNode code={etudiantSite} label="Site étudiant" active={active} />}
        </div>

        <ol className="space-y-2">
          {steps.map((s) => (
            <li
              key={s.n}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                active ? "border-border bg-card" : "border-dashed border-border/60 bg-transparent opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  ok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {ok ? <CheckCircle2 className="size-4" /> : s.n}
              </span>
              <span className="flex-1">
                {s.label}
                {"remote" in s && s.remote && (
                  <Badge variant="outline" className="ml-2 border-accent/40 text-accent-foreground">
                    inter-site
                  </Badge>
                )}
              </span>
            </li>
          ))}
        </ol>

        {failed && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Compensation déclenchée</p>
              <p className="text-muted-foreground">{errorMsg}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Le prêt est annulé et l&apos;ouvrage repassé disponible : jamais de prêt sans compteur incrémenté.
              </p>
            </div>
          </div>
        )}

        {ok && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
            <CheckCircle2 className="size-4" />
            <span>Système cohérent sur {distant ? "les 2 sites" : "le site local"}.</span>
          </div>
        )}

        {state === "idle" && (
          <p className="text-center text-xs text-muted-foreground">
            Renseignez le formulaire puis validez pour dérouler la transaction.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SiteNode({ code, label, active }: { code: SiteCode; label: string; active: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", !active && "opacity-60")}>
      <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary">
        <Server className="size-5 text-primary" />
      </span>
      <SiteBadge site={code} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
