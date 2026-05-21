import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StateTone = "loading" | "empty" | "error" | "success";

interface StatePanelProps {
  tone: StateTone;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const toneStyle: Record<StateTone, string> = {
  loading: "text-primary-700",
  empty: "text-slate-500",
  error: "text-danger-700",
  success: "text-success-700",
};

export function StatePanel({ tone, title, description, action, className }: StatePanelProps) {
  const Icon =
    tone === "loading"
      ? Loader2
      : tone === "error"
      ? AlertCircle
      : tone === "success"
      ? CheckCircle2
      : Inbox;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <Icon className={cn("h-5 w-5", toneStyle[tone], tone === "loading" && "animate-spin")} />
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="max-w-md text-sm text-slate-500">{description}</p> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
