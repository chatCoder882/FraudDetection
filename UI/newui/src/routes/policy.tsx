import { createFileRoute } from "@tanstack/react-router";
import { Policy } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/policy")({
 head:()=>({meta:[{title:"Policy & Rules — Sentinel"},{name:"description",content:"Review deterministic policy rules and action permissions."},{property:"og:title",content:"Policy & Rules — Sentinel"},{property:"og:description",content:"Review deterministic policy rules and action permissions."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Policy,
});
