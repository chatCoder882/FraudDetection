import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cases } from "@/lib/sentinel.mock";
import { Page, Panel, SectionHeader, StatusBadge } from "./shared";

export function Actions() {
  const [completed, setCompleted] = useState<string[]>([]);
  const actionable = cases.filter((item) => item.status === "Awaiting Approval" || item.probability > 0.75);

  return (
    <Page>
      <SectionHeader title="Actions" description="Execute or reject approved fraud response actions" />
      <div className="space-y-3">
        {actionable.map((item) => {
          const isCompleted = completed.includes(item.id);
          return (
            <Panel key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <div className="font-mono text-xs text-info">{item.id}</div>
                <div className="mt-2 text-sm font-medium">{item.nextAction}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <StatusBadge status={isCompleted ? "Closed" : item.status} />
                  <span>Exposure ${item.exposure.toLocaleString()}</span>
                </div>
              </div>
              {isCompleted ? (
                <span className="flex items-center gap-2 text-xs text-success"><Check className="size-4" /> Action recorded</span>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => setCompleted((current) => [...current, item.id])}><X /> Reject</Button>
                  <Button size="sm" variant="success" onClick={() => setCompleted((current) => [...current, item.id])}><Check /> Execute</Button>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </Page>
  );
}
