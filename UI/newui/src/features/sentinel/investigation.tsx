import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDot,
  FileCheck2,
  LockKeyhole,
  Network,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  audit,
  cases,
  evidence,
  finalRecommendation,
  initialRecommendation,
  memoryCases,
  timeline,
} from "@/lib/sentinel.mock";
import type { Recommendation } from "@/lib/sentinel.types";
import { ApprovalBadge, CaseRow, Panel, Risk, StatusBadge, VerdictBadge } from "./shared";
import { InvestigationGraph } from "./investigation-graph";
import { useCases, useCase } from "@/lib/sentinel.hooks";
const chart = [
  { name: "Trigger", p: 0.2 },
  { name: "Txn", p: 0.38 },
  { name: "Device", p: 0.61 },
  { name: "Graph", p: 0.78 },
  { name: "Customer", p: 0.89 },
];
function RecommendationCard({
  label,
  item,
  final = false,
}: {
  label: string;
  item: Recommendation;
  final?: boolean;
}) {
  return (
    <div
      className={
        final
          ? "rounded border border-warning/35 bg-warning-muted/40 p-4"
          : "rounded border border-border bg-background p-4"
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <ApprovalBadge route={item.route} />
      </div>
      <div className="font-mono text-sm font-semibold">{item.action}</div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.reason}</p>
      <div className="mt-3 flex justify-between border-t border-border pt-3 text-[10px]">
        <span>{item.rule}</span>
        <span className={final ? "text-warning" : "text-success"}>{item.status}</span>
      </div>
    </div>
  );
}
function EvidenceLedger() {
  return (
    <div className="space-y-2">
      {evidence.map((e) => (
        <div
          key={e.id}
          className="grid gap-3 rounded border border-border bg-background p-3 lg:grid-cols-[130px_1fr_100px_110px]"
        >
          <div>
            <span className="rounded bg-info-muted px-2 py-1 text-[10px] font-semibold text-info">
              {e.type}
            </span>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">{e.time}</div>
          </div>
          <div>
            <div className="text-xs font-medium">{e.finding}</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              {e.source} · {e.entities.join(" · ")}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Likelihood impact</div>
            <div className="mt-1 font-mono text-xs text-critical">{e.impact}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Probability</div>
            <div className="mt-1 font-mono text-xs">
              {e.before.toFixed(2)} → <span className="text-warning">{e.after.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function Timeline() {
  return (
    <div className="relative ml-2 border-l border-border pl-5">
      {timeline.map((s, i) => (
        <div key={s.title} className="relative pb-5 last:pb-0">
          <div
            className={
              "absolute -left-[27px] top-0 grid size-3 rounded-full border-2 border-background " +
              (s.status === "Active"
                ? "bg-warning status-pulse"
                : s.status === "Complete"
                  ? "bg-success"
                  : "bg-muted-foreground")
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold">{s.title}</div>
            <span className="text-[9px] uppercase text-muted-foreground">{s.status}</span>
            {s.delta && <span className="font-mono text-[10px] text-warning">{s.delta}</span>}
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{s.time}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{s.finding}</p>
          <div className="mt-1 font-mono text-[10px] text-info">{s.source}</div>
        </div>
      ))}
    </div>
  );
}
function Overview() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-4">
        <Panel className="p-4">
          <div className="mb-3 text-xs font-semibold">Probability progression</div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  tickFormatter={(v) => `${v * 100}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={0.8} stroke="var(--critical)" strokeDasharray="4 4" />
                <Area
                  dataKey="p"
                  type="monotone"
                  stroke="var(--critical)"
                  fill="var(--critical-muted)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1 text-center font-mono text-[10px] text-muted-foreground">
            {chart.map((x) => (
              <span key={x.name}>{x.p.toFixed(2)}</span>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold">
            <CircleDot className="size-4 text-info" />
            Agent investigation timeline
          </div>
          <Timeline />
        </Panel>
      </div>
      <div className="space-y-4">
        <Panel className="overflow-hidden">
          <div className="border-b border-border p-4 text-xs font-semibold">
            Connected risk graph
          </div>
          <InvestigationGraph />
        </Panel>
        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <ShieldAlert className="size-4 text-warning" />
            Next Best Action
          </div>
          <div className="space-y-3">
            <RecommendationCard label="Initial recommendation" item={initialRecommendation} />
            <RecommendationCard label="Final recommendation" item={finalRecommendation} final />
            <div className="rounded border border-ai/25 bg-ai-muted/40 p-3">
              <div className="text-[10px] font-semibold uppercase text-ai">What changed?</div>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  Probability <span className="font-mono text-warning">0.78 → 0.89</span>
                </div>
                <div>
                  New evidence{" "}
                  <span className="text-muted-foreground">Customer denied transaction</span>
                </div>
                <div>
                  New action <span className="font-mono">BLOCK_CARD</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="critical" size="sm" className="flex-1">
                <LockKeyhole />
                Send to L2 approval
              </Button>
              <Button variant="outline" size="sm">
                Request evidence
              </Button>
            </div>
            <p className="text-[10px] leading-4 text-muted-foreground">
              This action cannot execute until an L2 analyst approves it.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
export function Investigation({ id }: { id: string }) {
  const { data: casesData } = useCases();
  const cases = casesData || [];
  const { data: current } = useCase(id);
  const [activeTab, setActiveTab] = useState("overview");
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setActiveTab(hash);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  if (!current) return null;
  return (
    <div className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-panel xl:block">
        <div className="border-b border-border p-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Live queue · {cases.length} cases
        </div>
        {cases.map((c) => (
          <CaseRow key={c.id} item={c} />
        ))}
      </aside>
      <div className="min-w-0">
        <div className="border-b border-border bg-panel px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-lg font-semibold">{current.id}</h2>
                <StatusBadge status={current.status} />
                <VerdictBadge verdict={current.verdict} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  Trigger <b className="text-foreground">{current.trigger}</b>
                </span>
                <span>
                  Customer <b className="font-mono text-foreground">{current.customer}</b>
                </span>
                <span>
                  Transaction <b className="font-mono text-foreground">{current.transaction}</b>
                </span>
                <span>
                  Pattern <b className="text-foreground">{current.pattern}</b>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Fraud probability</div>
                <div className="mt-1 w-32">
                  <Risk value={current.probability} />
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Exposure</div>
                <div className="mt-1 font-mono text-sm font-semibold text-critical">
                  ${current.exposure.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            window.history.replaceState(null, "", `#${value}`);
          }}
          className="p-4 md:p-6"
        >
          <TabsList className="mb-4 h-auto w-full justify-start overflow-x-auto rounded border border-border bg-panel p-1">
            {[
              "Overview",
              "Investigation",
              "Evidence",
              "Graph",
              "Actions",
              "SAR",
              "Memory",
              "Audit",
            ].map((t) => (
              <TabsTrigger key={t} value={t.toLowerCase()} className="text-xs">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview">
            <Overview id={id} />
          </TabsContent>
          <TabsContent value="investigation">
            <Panel className="p-5">
              <Timeline id={id} />
            </Panel>
          </TabsContent>
          <TabsContent id="evidence" value="evidence">
            <EvidenceLedger id={id} />
          </TabsContent>
          <TabsContent id="graph" value="graph">
            <Panel className="p-2">
              <InvestigationGraph />
            </Panel>
          </TabsContent>
          <TabsContent value="actions">
            <div className="grid gap-4 lg:grid-cols-2">
              <RecommendationCard label="Initial recommendation" item={initialRecommendation} />
              <RecommendationCard label="Final recommendation" item={finalRecommendation} final />
            </div>
          </TabsContent>
          <TabsContent value="sar">
            <SarDocument compact />
          </TabsContent>
          <TabsContent value="memory">
            <MemoryTable />
          </TabsContent>
          <TabsContent value="audit">
            <AuditTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
export function AuditTable() {
  return (
    <Panel className="overflow-hidden">
      <div className="grid grid-cols-[100px_120px_150px_1fr_140px] border-b border-border bg-muted/30 px-3 py-2 text-[10px] uppercase text-muted-foreground">
        <span>Timestamp</span>
        <span>Actor</span>
        <span>Event</span>
        <span>Change</span>
        <span>Source</span>
      </div>
      {audit.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_120px_150px_1fr_140px] border-b border-border px-3 py-3 text-xs last:border-0"
        >
          <span className="font-mono text-muted-foreground">{r[0]}</span>
          <span>{r[1]}</span>
          <span>{r[2]}</span>
          <span className="font-mono">{r[3]}</span>
          <span className="text-muted-foreground">{r[4]}</span>
        </div>
      ))}
    </Panel>
  );
}
export function MemoryTable() {
  return (
    <div className="space-y-3">
      {memoryCases.map((c) => (
        <Panel key={c.id} className="grid gap-3 p-4 md:grid-cols-[100px_130px_1fr_80px_140px]">
          <div>
            <div className="font-mono text-xs text-ai">{c.id}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">{c.outcome}</div>
          </div>
          <div className="text-xs">{c.pattern}</div>
          <div>
            <div className="text-xs">{c.reason}</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              Exposure {c.exposure}
            </div>
          </div>
          <div className="font-mono text-sm text-ai">{c.similarity}</div>
          <div className="font-mono text-[10px]">{c.action}</div>
        </Panel>
      ))}
    </div>
  );
}
export function SarDocument({ compact = false }: { compact?: boolean }) {
  return (
    <Panel className="mx-auto max-w-5xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <div className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">
            Suspicious Activity Report
          </div>
          <div className="mt-1 font-mono text-sm font-semibold">SAR-HHG-003-DRAFT</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Export
          </Button>
          <Button size="sm" variant="outline">
            Copy
          </Button>
          {!compact && (
            <Button size="sm" variant="success">
              <FileCheck2 />
              Approve filing
            </Button>
          )}
        </div>
      </div>
      <article className="space-y-6 p-6 text-sm leading-6">
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-[.1em] text-info">
            Subject information
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-3 rounded border border-border bg-background p-3 text-xs">
            <span>
              Customer <b className="font-mono">CUS-48129</b>
            </span>
            <span>
              Card <b className="font-mono">CARD-9241</b>
            </span>
            <span>
              Transaction <b className="font-mono">TXN-908174</b>
            </span>
            <span>
              Total suspicious amount <b className="font-mono">$18,420</b>
            </span>
          </div>
        </section>
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-[.1em] text-info">
            Activity summary
          </h3>
          <p className="mt-2 text-muted-foreground">
            Sentinel identified card-not-present activity from a first-seen device connected through
            the investigation graph to three previously confirmed fraud cases. The transaction
            amount was materially outside the subject’s baseline, and the customer subsequently
            denied authorizing it.
          </p>
        </section>
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-[.1em] text-info">
            Evidence and pattern
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>New device association increased probability from 0.38 to 0.61.</li>
            <li>Confirmed-fraud graph connections increased probability to 0.78.</li>
            <li>Customer denial increased final probability to 0.89.</li>
          </ul>
        </section>
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-[.1em] text-info">
            Filing decision
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <Check className="size-4 text-success" />
            <span>Filing recommended under policy rule R9; human approval required.</span>
          </div>
        </section>
      </article>
    </Panel>
  );
}
