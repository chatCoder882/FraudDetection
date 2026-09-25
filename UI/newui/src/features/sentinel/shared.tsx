import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  ChevronRight,
  CircleCheck,
  CircleDot,
  Clock3,
  FileSearch,
  HeartPulse,
  Menu,
  Network,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  XCircle,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cases } from "@/lib/sentinel.mock";
import { useCases } from "@/lib/sentinel.hooks";
import type { ApprovalRoute, CaseStatus, SentinelCase, Verdict } from "@/lib/sentinel.types";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Investigation",
    items: [
      ["Dashboard", "/dashboard", Activity],
      ["Case Queue", "/cases", FileSearch],
      ["Investigations", "/cases", ShieldAlert],
      ["Evidence", "/cases", CircleDot],
      ["Graph Explorer", "/cases", Network],
    ],
  },
  {
    label: "Operations",
    items: [
      ["Approval Inbox", "/approvals", ShieldCheck],
      ["Actions", "/approvals", CircleCheck],
      ["SAR Reports", "/sar", FileSearch],
    ],
  },
  {
    label: "Intelligence",
    items: [
      ["Case Memory", "/memory", BrainCircuit],
      ["Fraud Patterns", "/patterns", AlertTriangle],
      ["Policy & Rules", "/policy", SlidersHorizontal],
    ],
  },
  {
    label: "System",
    items: [
      ["Agent Activity", "/agent", Activity],
      ["System Health", "/system", HeartPulse],
      ["Settings", "/settings", SlidersHorizontal],
    ],
  },
] as const;

function Navigation() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const currentCaseId = path.match(/^\/cases\/([^/]+)/)?.[1] ?? "HHG-003";
  const activeLabel = path.startsWith("/cases/")
    ? "Investigations"
    : (
        {
          "/dashboard": "Dashboard",
          "/cases": "Case Queue",
          "/approvals": "Approval Inbox",
          "/actions": "Actions",
          "/sar": "SAR Reports",
          "/memory": "Case Memory",
          "/patterns": "Fraud Patterns",
          "/policy": "Policy & Rules",
          "/agent": "Agent Activity",
          "/system": "System Health",
          "/settings": "Settings",
        } as Record<string, string>
      )[path];
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="grid size-8 place-items-center rounded bg-primary text-primary-foreground">
          <ShieldAlert className="size-4" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-[0.18em] text-foreground">SENTINEL</div>
          <div className="text-[10px] text-muted-foreground">FRAUD OPERATIONS</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {g.label}
            </div>
            {g.items.map(([label, to, Icon]) => {
              const active = label === activeLabel;
              const href =
                label === "Actions"
                  ? "/actions"
                  : label === "Evidence"
                    ? `/cases/${currentCaseId}#evidence`
                    : label === "Graph Explorer"
                      ? `/cases/${currentCaseId}#graph`
                      : to;
              const tabHash =
                label === "Evidence" ? "evidence" : label === "Graph Explorer" ? "graph" : null;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(event) => {
                    if (!tabHash) return;
                    event.preventDefault();
                    const target = `/cases/${currentCaseId}`;
                    if (window.location.pathname === target) {
                      window.location.hash = tabHash;
                    } else {
                      window.location.assign(`${target}#${tabHash}`);
                    }
                  }}
                  className={cn(
                    "mb-0.5 flex h-9 items-center gap-3 rounded px-2.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                    active && "bg-sidebar-accent text-foreground border-l-2 border-primary",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                  {label === "Approval Inbox" && (
                    <span className="ml-auto rounded bg-warning-muted px-1.5 py-0.5 font-mono text-[10px] text-warning">
                      7
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="status-pulse size-2 rounded-full bg-success" />
          <span className="text-muted-foreground">All systems operational</span>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [search, setSearch] = useState("");
  const { data: fetchedCases } = useCases();
  const cases = fetchedCases || [];
  const results = useMemo(
    () =>
      search.length < 2
        ? []
        : cases
            .filter((c) => Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase()))
            .slice(0, 4),
    [search, cases],
  );
  const title = path.startsWith("/cases/")
    ? "Investigation Workspace"
    : ((
        {
          "/dashboard": "Dashboard",
          "/cases": "Case Queue",
          "/approvals": "Approval Inbox",
          "/actions": "Actions",
          "/sar": "SAR Reports",
          "/memory": "Case Memory",
          "/patterns": "Fraud Patterns",
          "/policy": "Policy & Rules",
          "/agent": "Agent Activity",
          "/system": "System Health",
          "/settings": "Settings",
        } as Record<string, string>
      )[path] ?? "Sentinel");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border xl:block">
        <Navigation />
      </aside>
      <div className="xl:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <Navigation />
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Sentinel / Operations
            </div>
            <h1 className="truncate text-sm font-semibold">{title}</h1>
          </div>
          <div className="relative ml-auto hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case, transaction, customer, card, device, email"
              className="h-9 bg-panel pl-9 text-xs"
            />
            {results.length > 0 && (
              <div className="absolute top-11 z-40 w-full rounded border border-border bg-popover p-1 shadow-xl">
                {results.map((c) => (
                  <Link
                    key={c.id}
                    to="/cases/$id"
                    params={{ id: c.id }}
                    onClick={() => setSearch("")}
                    className="flex items-center justify-between rounded px-3 py-2 hover:bg-accent"
                  >
                    <div>
                      <div className="font-mono text-xs">{c.id}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.customer} · {c.transaction}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="hidden items-center gap-2 rounded border border-success/25 bg-success-muted px-2.5 py-1.5 text-[11px] text-success sm:flex">
            <span className="status-pulse size-1.5 rounded-full bg-success" />
            Agent active
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-critical" />
          </Button>
          <div className="grid size-8 place-items-center rounded bg-secondary text-xs font-semibold">
            AK
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1600px] p-4 md:p-6", className)}>{children}</div>;
}
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("panel", className)}>{children}</section>;
}
export function StatusBadge({ status }: { status: CaseStatus }) {
  const cls =
    status === "Closed"
      ? "bg-success-muted text-success"
      : status === "Awaiting Evidence"
        ? "bg-warning-muted text-warning"
        : status === "Awaiting Approval"
          ? "bg-ai-muted text-ai"
          : status === "Action Required"
            ? "bg-critical-muted text-critical"
            : "bg-info-muted text-info";
  return <Badge className={cn("border-0 text-[10px] font-medium", cls)}>{status}</Badge>;
}
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const cls =
    verdict === "Fraud"
      ? "bg-critical-muted text-critical"
      : verdict === "Legitimate"
        ? "bg-success-muted text-success"
        : "bg-warning-muted text-warning";
  const Icon = verdict === "Fraud" ? XCircle : verdict === "Legitimate" ? CircleCheck : Clock3;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase",
        cls,
      )}
    >
      <Icon className="size-3" />
      {verdict}
    </span>
  );
}
export function ApprovalBadge({ route }: { route: ApprovalRoute }) {
  const cls =
    route === "Auto"
      ? "bg-success-muted text-success"
      : route === "L1"
        ? "bg-info-muted text-info"
        : route === "L2"
          ? "bg-warning-muted text-warning"
          : "bg-critical-muted text-critical";
  return (
    <span className={cn("rounded px-2 py-1 text-[10px] font-bold uppercase", cls)}>
      {route === "Auto" ? "Auto-executable" : route + " approval"}
    </span>
  );
}
export function Risk({ value }: { value: number }) {
  const color = value >= 0.8 ? "text-critical" : value >= 0.5 ? "text-warning" : "text-success";
  return (
    <div className="flex min-w-20 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
        <div
          className={cn(
            "h-full",
            value >= 0.8 ? "bg-critical" : value >= 0.5 ? "bg-warning" : "bg-success",
          )}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className={cn("font-mono text-xs font-semibold", color)}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
export function CaseRow({ item }: { item: SentinelCase }) {
  return (
    <Link
      to="/cases/$id"
      params={{ id: item.id }}
      className="block border-b border-border p-3 transition-colors last:border-0 hover:bg-accent"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-info">{item.id}</span>
        <span className="text-[10px] text-muted-foreground">{item.opened}</span>
      </div>
      <div className="mt-2">
        <Risk value={item.probability} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <VerdictBadge verdict={item.verdict} />
        <StatusBadge status={item.status} />
      </div>
    </Link>
  );
}
