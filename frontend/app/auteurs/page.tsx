"use client"

import { useState } from "react"
import { Plus, Copy } from "lucide-react"
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
  const [form, setForm] = useState({ nom: "", prenom: "", nationalite: "" })
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast.error("Nom et prénom obligatoires")
      return
    }
    setSaving(true)
    try {
      await api.addAuteur(site, {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        nationalite: form.nationalite.trim(),
      })
      toast.success("Auteur créé et répliqué sur les 3 sites")
      setForm({ nom: "", prenom: "", nationalite: "" })
      setOpen(false)
      auteurs.mutate()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Auteurs"
        description="Table de référence répliquée intégralement sur les trois sites : peu volumineuse, rarement modifiée, très consultée."
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
            <SiteBadge site="UADB" className="mx-0.5" /> afin que chaque site résolve localement l&apos;auteur de ses
            ouvrages.
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
                <TableHead>Nationalité</TableHead>
                <TableHead className="text-right">UUID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auteurs.data?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nom}</TableCell>
                  <TableCell>{a.prenom}</TableCell>
                  <TableCell className="text-muted-foreground">{a.nationalite || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{a.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel auteur</DialogTitle>
            <DialogDescription>Sera répliqué sur les trois nœuds du réseau.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nat">Nationalité</Label>
              <Input
                id="nat"
                value={form.nationalite}
                onChange={(e) => setForm({ ...form, nationalite: e.target.value })}
              />
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
    </>
  )
}
