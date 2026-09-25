import type { Evidence, Recommendation, SentinelCase, SentinelDataService, TimelineStep } from "./sentinel.types";

export const cases: SentinelCase[] = [
 {id:"HHG-003",trigger:"Customer report",customer:"CUS-48129",transaction:"TXN-908174",probability:.89,verdict:"Fraud",pattern:"CNP · new device",exposure:18420,status:"Awaiting Approval",nextAction:"BLOCK_CARD",opened:"9 min ago"},
 {id:"HHG-014",trigger:"Risk score ≥ 0.80",customer:"CUS-73910",transaction:"TXN-908221",probability:.78,verdict:"Uncertain",pattern:"Account takeover",exposure:6750,status:"Awaiting Evidence",nextAction:"VERIFY_WITH_CUSTOMER",opened:"18 min ago"},
 {id:"HHG-008",trigger:"Velocity anomaly",customer:"CUS-19042",transaction:"TXN-908117",probability:.94,verdict:"Fraud",pattern:"Card testing",exposure:28140,status:"Action Required",nextAction:"BLOCK_TRANSACTION",opened:"31 min ago"},
 {id:"HHG-017",trigger:"Out-of-region use",customer:"CUS-62204",transaction:"TXN-908280",probability:.31,verdict:"Legitimate",pattern:"Out-of-region",exposure:980,status:"Investigating",nextAction:"MONITOR_ACCOUNT",opened:"44 min ago"},
 {id:"HHG-011",trigger:"Device cluster",customer:"CUS-22831",transaction:"TXN-908193",probability:.67,verdict:"Uncertain",pattern:"Discovered pattern",exposure:12300,status:"New",nextAction:"REQUEST_EVIDENCE",opened:"1h ago"},
 {id:"HHG-002",trigger:"Risk score ≥ 0.80",customer:"CUS-84220",transaction:"TXN-907996",probability:.12,verdict:"Legitimate",pattern:"None",exposure:240,status:"Closed",nextAction:"ALLOW_TRANSACTION",opened:"2h ago"},
];
export const evidence: Evidence[] = [
 {id:"EV-102",type:"NEW DEVICE",finding:"Device not previously associated with this card.",source:"get_card_device_profile",entities:["DEV-72A","CARD-9241"],impact:"+0.73 LR",before:.38,after:.61,time:"10:42:18"},
 {id:"EV-103",type:"GRAPH LINK",finding:"Device connects to three confirmed fraud cases.",source:"expand_entity_neighbors",entities:["DEV-72A","CC-188","CC-204"],impact:"+1.14 LR",before:.61,after:.78,time:"10:42:31"},
 {id:"EV-104",type:"CUSTOMER DENIAL",finding:"Customer denied authorizing the flagged transaction.",source:"VERIFY_WITH_CUSTOMER",entities:["CUS-48129","TXN-908174"],impact:"+1.52 LR",before:.78,after:.89,time:"10:46:03"},
];
export const timeline: TimelineStep[] = [
 {title:"Scope Investigation",status:"Complete",finding:"Flagged transaction, card, customer, and adjacent entities scoped.",source:"get_alert_context",time:"10:41:52",delta:"0.20"},
 {title:"Transaction Analysis",status:"Complete",finding:"Amount is 4.8× the customer median and outside normal purchase hours.",source:"get_transaction",time:"10:42:03",delta:"0.20 → 0.38"},
 {title:"Customer / Card Baseline",status:"Complete",finding:"Card has no prior high-value digital purchases.",source:"get_card_baseline",time:"10:42:11"},
 {title:"Device Analysis",status:"Complete",finding:"First-seen device with sparse identity history.",source:"get_card_device_profile",time:"10:42:18",delta:"0.38 → 0.61"},
 {title:"Graph Investigation",status:"Complete",finding:"Shared device links to three confirmed fraud investigations.",source:"expand_entity_neighbors",time:"10:42:31",delta:"0.61 → 0.78"},
 {title:"Fraud Pattern Detection",status:"Complete",finding:"Signals match card-not-present fraud from a new device.",source:"detect_fraud_pattern",time:"10:42:44"},
 {title:"Prior Case Retrieval",status:"Complete",finding:"Retrieved 12 similar cases; 10 were confirmed fraud.",source:"retrieve_similar_cases",time:"10:42:57"},
 {title:"Policy Assessment",status:"Complete",finding:"Evidence threshold met; customer confirmation required before card block.",source:"policy_engine R7",time:"10:43:02"},
 {title:"Evidence Request",status:"Complete",finding:"Customer verification returned: transaction denied.",source:"VERIFY_WITH_CUSTOMER",time:"10:46:03",delta:"0.78 → 0.89"},
 {title:"Final Decision",status:"Active",finding:"Recommend blocking card through L2 approval route.",source:"policy_engine R3",time:"10:46:09"},
];
export const initialRecommendation: Recommendation={action:"VERIFY_WITH_CUSTOMER",reason:"High graph risk, but customer intent was not yet established.",rule:"R7 · Evidence threshold",route:"Auto",status:"Completed"};
export const finalRecommendation: Recommendation={action:"BLOCK_CARD",reason:"Customer denial confirms unauthorized use and materially increases fraud probability.",rule:"R3 · Confirmed card fraud",route:"L2",status:"Awaiting approval"};
export const audit=[
 ["10:42:18","Sentinel","Evidence retrieved","New device detected","TigerGraph"],
 ["10:42:19","Sentinel","Probability","0.38 → 0.61","Evidence ledger"],
 ["10:43:02","Sentinel","Evidence requested","VERIFY_WITH_CUSTOMER","Policy Engine"],
 ["10:46:03","Customer","Response received","Transaction denied","Customer channel"],
 ["10:46:09","Policy Engine","Recommendation","BLOCK_CARD / L2","Rule R3"],
];
export const memoryCases=[
 {id:"CC-204",outcome:"Confirmed fraud",pattern:"CNP · new device",exposure:"$21,880",similarity:"94%",reason:"Same device cluster, purchase channel, and amount band",action:"BLOCK_CARD"},
 {id:"CC-188",outcome:"Confirmed fraud",pattern:"Account takeover",exposure:"$8,940",similarity:"87%",reason:"Shared device and customer-denial sequence",action:"BLOCK_ACCOUNT"},
 {id:"CC-091",outcome:"Cleared",pattern:"Out-of-region",exposure:"$2,110",similarity:"61%",reason:"Similar travel anomaly; no device-network overlap",action:"ALLOW_TRANSACTION"},
];
export const service: SentinelDataService={
 async listCases(){ return cases; },
 async getCase(id){ return cases.find((item)=>item.id===id) ?? cases[0]; },
};
