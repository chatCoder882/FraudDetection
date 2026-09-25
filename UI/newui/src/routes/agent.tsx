import { createFileRoute } from "@tanstack/react-router";
import { Agent } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/agent")({
 head:()=>({meta:[{title:"Agent Activity — Sentinel"},{name:"description",content:"Monitor live investigation workflow and tool activity."},{property:"og:title",content:"Agent Activity — Sentinel"},{property:"og:description",content:"Monitor live investigation workflow and tool activity."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Agent,
});
