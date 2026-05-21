"use client";

import { motion } from "framer-motion";
import {
  ActivityFeed,
  AlertPanel,
  DashboardShell,
  DisputeCard,
  KpiCard,
  LiveUpdateIndicator,
  OfferCard,
  RequestCard,
  ShipmentCard,
  StatePanel,
  StatWidget,
  TrustScoreBar,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pageTransition, staggerContainer } from "@/lib/motion/presets";

export function DesignSystemShowcase() {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <DashboardShell
        title="AutoSAV Design System"
        subtitle="Kit premium SaaS pour dashboards, marketplace, escrow et litiges"
        topbarSlot={<LiveUpdateIndicator isLive lastUpdated="il y a 14 sec" />}
        sidebarSlot={
          <nav className="space-y-1">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">System</p>
            {[
              "Tokens",
              "Core components",
              "Marketplace cards",
              "States",
              "Motion",
            ].map((item) => (
              <a key={item} className="block rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" href="#">
                {item}
              </a>
            ))}
          </nav>
        }
      >
        <KpiCard label="Demandes actives" value={34} delta="+12% cette semaine" />
        <KpiCard label="Offres en attente" value={19} delta="+4 nouvelles aujourd'hui" />
        <KpiCard label="Transactions escrow" value="€45 700" delta="volume 30j" />
        <KpiCard label="Litiges ouverts" value={3} delta="-1 depuis hier" />
      </DashboardShell>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 md:px-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <motion.div className="grid gap-4 md:grid-cols-2" variants={staggerContainer} initial="hidden" animate="visible">
            <OfferCard
              meta={{
                title: "Paris -> Alger",
                subtitle: "Expedition fragile, depart sous 48h",
                amount: 380,
                statusLabel: "MATCHED",
                priority: "HIGH",
                riskLevel: "LOW",
              }}
            />
            <RequestCard
              meta={{
                title: "Lyon -> Oran",
                subtitle: "2 pieces auto, format moyen",
                amount: 240,
                statusLabel: "ACTIVE",
                priority: "NORMAL",
                riskLevel: "MEDIUM",
              }}
            />
            <ShipmentCard
              meta={{
                title: "Suivi #SHP-908",
                subtitle: "Arrivee estimee demain 14:00",
                statusLabel: "IN_TRANSIT",
                priority: "LOW",
                riskLevel: "LOW",
              }}
            />
            <DisputeCard
              meta={{
                title: "Litige #DSP-122",
                subtitle: "Retard important signale par le client",
                statusLabel: "REVIEW",
                priority: "HIGH",
                riskLevel: "HIGH",
              }}
            />
          </motion.div>

          <StatWidget title="Table light SaaS" subtitle="Lecture rapide, faible charge visuelle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demande</TableHead>
                  <TableHead>Priorite</TableHead>
                  <TableHead>Score confiance</TableHead>
                  <TableHead className="text-right">Escrow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Frein BMW X5</TableCell>
                  <TableCell>
                    <Badge variant="priority-high">HIGH</Badge>
                  </TableCell>
                  <TableCell>88/100</TableCell>
                  <TableCell className="text-right">€620</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pompe Audi A4</TableCell>
                  <TableCell>
                    <Badge variant="priority-normal">NORMAL</Badge>
                  </TableCell>
                  <TableCell>67/100</TableCell>
                  <TableCell className="text-right">€280</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </StatWidget>

          <StatWidget title="States system" subtitle="Loading, empty, error et success prets a brancher">
            <div className="grid gap-4 md:grid-cols-2">
              <StatePanel tone="loading" title="Synchronisation en cours" description="Mise a jour des offres et transactions" />
              <StatePanel tone="empty" title="Aucune offre" description="Publiez une demande pour demarrer le matching" action={<Button size="sm">Creer une demande</Button>} />
              <StatePanel tone="error" title="Erreur reseau" description="Le serveur escrow ne repond pas" action={<Button size="sm" variant="secondary">Reessayer</Button>} />
              <StatePanel tone="success" title="Paiement confirme" description="Les fonds sont bloques dans l'escrow" />
            </div>
          </StatWidget>
        </section>

        <aside className="space-y-6">
          <StatWidget title="Trust & risk" subtitle="Visualisation reputation et anti-fraude">
            <TrustScoreBar score={74} riskLevel="MEDIUM" />
          </StatWidget>

          <AlertPanel
            alerts={[
              {
                id: "a1",
                title: "Pic de litiges",
                message: "3 nouveaux litiges ouverts sur les 24h.",
                severity: "warning",
              },
              {
                id: "a2",
                title: "Risque eleve fournisseur",
                message: "Agent #AG-20 depasse le seuil de cancellations.",
                severity: "critical",
              },
            ]}
          />

          <ActivityFeed
            items={[
              { id: "e1", label: "Offre acceptee sur PR-294", meta: "Il y a 12 min", type: "success" },
              { id: "e2", label: "Escrow cree pour TX-0091", meta: "Il y a 31 min", type: "neutral" },
              { id: "e3", label: "Nouveau litige sur SHP-044", meta: "Il y a 2 h", type: "warning" },
            ]}
          />

          <StatWidget title="Micro-interactions" subtitle="CTA visibles et saisie rapide">
            <div className="space-y-3">
              <Input placeholder="Rechercher une demande, offre ou shipment" />
              <div className="flex gap-2">
                <Button className="flex-1">Nouveau matching</Button>
                <Button variant="outline" className="flex-1">Exporter</Button>
              </div>
            </div>
          </StatWidget>
        </aside>
      </main>
    </motion.div>
  );
}
