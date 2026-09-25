import { createFileRoute } from "@tanstack/react-router";
import { Patterns } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/patterns")({
 head:()=>({meta:[{title:"Fraud Patterns — Sentinel"},{name:"description",content:"Explore known and discovered fraud patterns."},{property:"og:title",content:"Fraud Patterns — Sentinel"},{property:"og:description",content:"Explore known and discovered fraud patterns."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Patterns,
});
