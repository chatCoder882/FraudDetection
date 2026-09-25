import { useMemo, useState } from "react";
import { ArrowUpDown, Filter, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCases } from "@/lib/sentinel.hooks";
import type { SentinelCase } from "@/lib/sentinel.types";
import { Risk, StatusBadge, VerdictBadge } from "./shared";

type SortKey="id"|"probability"|"exposure";
export function CaseTable({compact=false}:{compact?:boolean}){
 const nav=useNavigate(); const [query,setQuery]=useState(""); const [status,setStatus]=useState("all"); const [verdict,setVerdict]=useState("all"); const [sort,setSort]=useState<SortKey>("probability");
 const { data: fetchedCases } = useCases();
 const cases = fetchedCases || [];
 const data=useMemo(()=>cases.filter(c=>(status==="all"||c.status===status)&&(verdict==="all"||c.verdict===verdict)&&Object.values(c).join(" ").toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="id"?a.id.localeCompare(b.id):b[sort]-a[sort]),[query,status,verdict,sort,cases]);
 const heads=["Case ID","Trigger","Customer","Probability","Verdict","Pattern","Exposure","Status","Next Action"];
 const cycleSort=()=>setSort(s=>s==="probability"?"exposure":s==="exposure"?"id":"probability");
 return <div><div className="flex flex-wrap gap-2 border-b border-border p-3"><div className="relative min-w-56 flex-1"><Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search cases or entities" className="h-8 pl-8 text-xs"/></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-8 w-40 text-xs"><Filter className="size-3"/><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Investigating">Investigating</SelectItem><SelectItem value="Awaiting Evidence">Awaiting Evidence</SelectItem><SelectItem value="Awaiting Approval">Awaiting Approval</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select><Select value={verdict} onValueChange={setVerdict}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Verdict"/></SelectTrigger><SelectContent><SelectItem value="all">All verdicts</SelectItem><SelectItem value="Fraud">Fraud</SelectItem><SelectItem value="Legitimate">Legitimate</SelectItem><SelectItem value="Uncertain">Uncertain</SelectItem></SelectContent></Select></div><Table><TableHeader><TableRow>{heads.slice(0,compact?6:undefined).map(h=><TableHead key={h} className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em]"><Button variant="ghost" size="sm" className="h-7 px-1 text-[10px] uppercase" onClick={cycleSort}>{h}<ArrowUpDown className="size-3"/></Button></TableHead>)}</TableRow></TableHeader><TableBody>{data.map(row=><TableRow key={row.id} className="cursor-pointer" onClick={()=>nav({to:"/cases/$id",params:{id:row.id}})}><TableCell className="font-mono text-xs font-semibold text-info">{row.id}</TableCell><TableCell className="whitespace-nowrap text-xs">{row.trigger}</TableCell><TableCell className="font-mono text-xs">{row.customer}</TableCell><TableCell><Risk value={row.probability}/></TableCell><TableCell><VerdictBadge verdict={row.verdict}/></TableCell><TableCell className="whitespace-nowrap text-xs">{row.pattern}</TableCell>{!compact&&<><TableCell className="font-mono text-xs">${row.exposure.toLocaleString()}</TableCell><TableCell><StatusBadge status={row.status}/></TableCell><TableCell className="font-mono text-[11px]">{row.nextAction}</TableCell></>}</TableRow>)}</TableBody></Table>{data.length===0&&<div className="py-16 text-center text-sm text-muted-foreground">No cases match the current filters.</div>}</div>
}
