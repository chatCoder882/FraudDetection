import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SentinelCase, Evidence, TimelineStep, Recommendation } from "./sentinel.types";

export type InvestigationInput = {
  case_id: string;
  opened_at?: string;
  trigger_type?: string;
  flagged_txn_id: string;
  card_id: string;
  customer_id: string;
  trigger_text?: string;
  risk_score?: number;
  closed_at?: string;
  outcome?: string;
  pattern?: string;
  txn_ids?: string;
  exposure_usd?: number;
  connected_card_ids?: string;
  actions_taken?: string;
  report_filed?: string;
  analyst_notes?: string;
};

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error("Failed to fetch cases");
      return res.json() as Promise<SentinelCase[]>;
    },
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ["cases", id],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${id}`);
      if (!res.ok) throw new Error("Failed to fetch case");
      return res.json() as Promise<SentinelCase>;
    },
    enabled: !!id,
  });
}

export function useEvidence(id: string) {
  return useQuery({
    queryKey: ["cases", id, "evidence"],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${id}/evidence`);
      if (!res.ok) throw new Error("Failed to fetch evidence");
      return res.json() as Promise<Evidence[]>;
    },
    enabled: !!id,
  });
}

export function useTimeline(id: string) {
  return useQuery({
    queryKey: ["cases", id, "timeline"],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${id}/timeline`);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      return res.json() as Promise<TimelineStep[]>;
    },
    enabled: !!id,
  });
}

export function useRecommendations(id: string) {
  return useQuery({
    queryKey: ["cases", id, "recommendations"],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${id}/recommendations`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json() as Promise<{ initial: Recommendation; final: Recommendation }>;
    },
    enabled: !!id,
  });
}

export function useInvestigateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InvestigationInput) => {
      const res = await fetch(`/api/cases/${input.case_id}/investigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Failed to start investigation (${res.status})`);
      }
      return res.json();
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["cases", input.case_id] });
    },
  });
}
