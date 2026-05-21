import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary-600" aria-hidden="true" />
        <span className="text-sm font-medium">Chargement de votre espace...</span>
      </div>
    </div>
  );
}
