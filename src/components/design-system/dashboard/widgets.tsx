"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card>
        <CardHeader className="space-y-1 pb-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <CardTitle className="kpi-value">{value}</CardTitle>
        </CardHeader>
        {delta ? (
          <CardContent className="pt-0">
            <p className="inline-flex items-center gap-1 text-xs text-success-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {delta}
            </p>
          </CardContent>
        ) : null}
      </Card>
    </motion.div>
  );
}

interface StatWidgetProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StatWidget({ title, subtitle, children }: StatWidgetProps) {
  return (
    <motion.section variants={fadeUp}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.section>
  );
}

interface ActivityItem {
  id: string;
  label: string;
  meta: string;
  type: "success" | "warning" | "neutral";
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
}

export function ActivityFeed({ title = "Activite recente", items }: ActivityFeedProps) {
  return (
    <motion.section variants={fadeUp}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-md border ui-border-color bg-slate-50/60 p-3">
              <span
                className={cn(
                  "mt-1 h-2.5 w-2.5 rounded-full",
                  item.type === "success" && "bg-success-500",
                  item.type === "warning" && "bg-warning-500",
                  item.type === "neutral" && "bg-slate-400"
                )}
              />
              <div>
                <p className="text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-slate-500">{item.meta}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.section>
  );
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

interface AlertPanelProps {
  alerts: AlertItem[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  return (
    <motion.section variants={fadeUp}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Alertes systeme</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3.5 w-3.5" />
            {alerts.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={fadeUp}
                className={cn(
                  "rounded-md border p-3",
                  alert.severity === "info" && "border-primary-100 bg-primary-50/50",
                  alert.severity === "warning" && "border-warning-500/20 bg-warning-50/60",
                  alert.severity === "critical" && "border-danger-500/20 bg-danger-50/60"
                )}
              >
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {alert.severity === "critical" ? (
                    <AlertTriangle className="h-4 w-4 text-danger-700" />
                  ) : alert.severity === "warning" ? (
                    <ShieldCheck className="h-4 w-4 text-warning-700" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary-700" />
                  )}
                  {alert.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{alert.message}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
