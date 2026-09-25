export type CaseStatus = "New" | "Investigating" | "Awaiting Evidence" | "Awaiting Approval" | "Action Required" | "Closed";
export type Verdict = "Fraud" | "Legitimate" | "Uncertain";
export type ApprovalRoute = "Auto" | "L1" | "L2" | "Human";
export type SentinelCase = {
  id:string; trigger:string; customer:string; transaction:string; probability:number; verdict:Verdict; pattern:string; exposure:number; status:CaseStatus; nextAction:string; opened:string;
};
export type Evidence = { id:string; type:string; finding:string; source:string; entities:string[]; impact:string; before:number; after:number; time:string };
export type TimelineStep = { title:string; status:"Complete"|"Active"|"Pending"; finding:string; source:string; time:string; delta?:string };
export type Recommendation = { action:string; reason:string; rule:string; route:ApprovalRoute; status:string };
export interface SentinelDataService { listCases(): Promise<SentinelCase[]>; getCase(id:string): Promise<SentinelCase | undefined>; }
