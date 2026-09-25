import { FormEvent, useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInvestigateCase } from "@/lib/sentinel.hooks";
import type { InvestigationInput } from "@/lib/sentinel.hooks";
import { CaseTable } from "./case-table";
import { Page, Panel, SectionHeader } from "./shared";

type CaseForm = {
  case_id: string;
  opened_at: string;
  trigger_type: string;
  flagged_txn_id: string;
  card_id: string;
  customer_id: string;
  trigger_text: string;
  risk_score: string;
};

const pasteFields = new Set<keyof CaseForm>([
  "case_id",
  "opened_at",
  "trigger_type",
  "trigger_text",
  "flagged_txn_id",
  "card_id",
  "customer_id",
  "risk_score",
]);

function parsePastedCase(value: string): Partial<CaseForm> & Partial<InvestigationInput> {
  const rows = value
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split("\t").map((cell) => cell.trim()));
  if (rows.length < 2) throw new Error("Paste the header row and one case row.");

  const headers = rows[0];
  const values = rows[1];
  const parsed: Partial<CaseForm> & Partial<InvestigationInput> = {};
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  if (record.first_fraud_txn_id && !record.flagged_txn_id) {
    record.flagged_txn_id = record.first_fraud_txn_id;
  }
  if (record.outcome === "confirmed_fraud" && !record.risk_score) record.risk_score = "0.9";
  if (record.analyst_notes && !record.trigger_text) record.trigger_text = record.analyst_notes;
  if (record.outcome && !record.trigger_type) record.trigger_type = record.outcome;
  headers.forEach((header, index) => {
    if (pasteFields.has(header as keyof CaseForm) && values[index]) {
      parsed[header as keyof CaseForm] = values[index];
    }
  });
  for (const field of ["flagged_txn_id", "trigger_text", "trigger_type", "risk_score"] as const) {
    if (record[field] && !parsed[field]) parsed[field] = record[field];
  }
  for (const field of [
    "closed_at",
    "outcome",
    "pattern",
    "txn_ids",
    "connected_card_ids",
    "actions_taken",
    "report_filed",
    "analyst_notes",
  ] as const) {
    if (record[field]) parsed[field] = record[field];
  }
  if (record.exposure_usd) parsed.exposure_usd = Number(record.exposure_usd);
  return parsed;
}

export function Cases() {
  const navigate = useNavigate();
  const investigate = useInvestigateCase();
  const [form, setForm] = useState<CaseForm>({
    case_id: "",
    opened_at: "",
    trigger_type: "",
    flagged_txn_id: "",
    card_id: "",
    customer_id: "",
    trigger_text: "",
    risk_score: "",
  });
  const [pastedCase, setPastedCase] = useState("");
  const [error, setError] = useState("");
  const update = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    let submitted = form;
    if (pastedCase.trim()) {
      try {
        submitted = { ...form, ...parsePastedCase(pastedCase) };
        setForm(submitted);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "Invalid pasted case.");
        return;
      }
    }
    if (
      !submitted.case_id ||
      !submitted.flagged_txn_id ||
      !submitted.card_id ||
      !submitted.customer_id
    ) {
      setError("Case ID, transaction, card, and customer are required.");
      return;
    }
    investigate.mutate(
      {
        case_id: submitted.case_id,
        opened_at: submitted.opened_at || undefined,
        trigger_type: submitted.trigger_type || undefined,
        flagged_txn_id: submitted.flagged_txn_id,
        card_id: submitted.card_id,
        customer_id: submitted.customer_id,
        trigger_text: submitted.trigger_text || undefined,
        risk_score: submitted.risk_score ? Number(submitted.risk_score) : undefined,
        ...(submitted as Partial<InvestigationInput>),
      },
      {
        onSuccess: () => navigate({ to: "/cases/$id", params: { id: submitted.case_id } }),
        onError: (error) =>
          setError(`The investigation could not be started: ${error.message}`),
      },
    );
  };
  return (
    <Page>
      <SectionHeader
        title="Case Queue"
        description="Prioritized alerts across every investigation state"
      />
      <Panel className="mb-4 p-4">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <h2 className="text-sm font-semibold">Run a test case</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter case data to send directly to the investigation agent.
            </p>
          </div>
          <label className="text-xs text-muted-foreground md:col-span-2 xl:col-span-3">
            Paste tab-separated case row
            <Textarea
              value={pastedCase}
              onChange={(event) => setPastedCase(event.target.value)}
              placeholder="case_id\topened_at\ttrigger_type\ttrigger_text\tflagged_txn_id\tcard_id\tcustomer_id\trisk_score"
              className="mt-1 min-h-20 font-mono text-xs"
            />
          </label>
          {[
            ["case_id", "Case ID", "HHG-TEST-001"],
            ["flagged_txn_id", "Transaction ID", "TXN-123"],
            ["card_id", "Card ID", "CARD-123"],
            ["customer_id", "Customer ID", "CUS-123"],
            ["trigger_text", "Trigger", "Customer report"],
            ["risk_score", "Initial risk score", "0.5"],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="text-xs text-muted-foreground">
              {label}
              <Input
                value={form[field as keyof typeof form]}
                onChange={(event) => update(field, event.target.value)}
                placeholder={placeholder}
                type={field === "risk_score" ? "number" : "text"}
                min={field === "risk_score" ? 0 : undefined}
                max={field === "risk_score" ? 1 : undefined}
                step={field === "risk_score" ? 0.01 : undefined}
                className="mt-1 h-9 text-xs"
              />
            </label>
          ))}
          <div className="flex items-center gap-3 md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={investigate.isPending}>
              <Play className="size-3.5" />
              {investigate.isPending ? "Running investigation" : "Run test case"}
            </Button>
            {error && <p className="text-xs text-critical">{error}</p>}
          </div>
        </form>
      </Panel>
      <Panel className="overflow-hidden">
        <CaseTable />
      </Panel>
    </Page>
  );
}
