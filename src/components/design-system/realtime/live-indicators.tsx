import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveUpdateIndicatorProps {
  isLive: boolean;
  lastUpdated?: string;
  className?: string;
}

export function LiveUpdateIndicator({ isLive, lastUpdated, className }: LiveUpdateIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Badge variant={isLive ? "success" : "secondary"} className="gap-1.5">
        <Activity className={cn("h-3 w-3", isLive && "animate-pulse")} />
        {isLive ? "Live" : "Pause"}
      </Badge>
      {lastUpdated ? <span className="text-xs text-slate-500">Derniere sync: {lastUpdated}</span> : null}
    </div>
  );
}

interface TrustScoreBarProps {
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export function TrustScoreBar({ score, riskLevel }: TrustScoreBarProps) {
  const tone = riskLevel === "LOW" ? "bg-success-500" : riskLevel === "MEDIUM" ? "bg-warning-500" : "bg-danger-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Trust score</span>
        <span className="text-slate-600">{score}/100</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full transition-all duration-300 ease-soft", tone)} style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
      </div>
      <Badge variant={riskLevel === "LOW" ? "success" : riskLevel === "MEDIUM" ? "warning" : "destructive"}>Risque {riskLevel}</Badge>
    </div>
  );
}
