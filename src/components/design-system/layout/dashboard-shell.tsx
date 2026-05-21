import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  topbarSlot?: ReactNode;
  sidebarSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ title, subtitle, topbarSlot, sidebarSlot, children, className }: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen bg-bg", className)}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {sidebarSlot ? (
          <aside className="surface-card hidden h-fit p-3 lg:block">{sidebarSlot}</aside>
        ) : (
          <div className="hidden lg:block" aria-hidden />
        )}

        <main className="space-y-6">
          <header className="surface-card flex flex-wrap items-center justify-between gap-4 p-4 md:p-5">
            <div>
              <h1>{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            {topbarSlot ? <div className="flex items-center gap-2">{topbarSlot}</div> : null}
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</section>
        </main>
      </div>
    </div>
  );
}
