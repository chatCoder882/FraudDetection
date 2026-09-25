import { createFileRoute } from "@tanstack/react-router";
import { Approvals } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/approvals")({
 head:()=>({meta:[{title:"Approval Inbox — Sentinel"},{name:"description",content:"Review policy-gated fraud actions requiring analyst approval."},{property:"og:title",content:"Approval Inbox — Sentinel"},{property:"og:description",content:"Review policy-gated fraud actions requiring analyst approval."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Approvals,
});
