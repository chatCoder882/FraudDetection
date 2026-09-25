import { createFileRoute } from "@tanstack/react-router";
import { Cases } from "@/features/sentinel/cases-page";
export const Route = createFileRoute("/cases/")({
 head:()=>({meta:[{title:"Case Queue — Sentinel"},{name:"description",content:"Search, filter, and prioritize active fraud investigations."},{property:"og:title",content:"Case Queue — Sentinel"},{property:"og:description",content:"Search, filter, and prioritize active fraud investigations."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Cases,
});
