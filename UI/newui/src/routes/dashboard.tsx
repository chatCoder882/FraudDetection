import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/sentinel/dashboard";
export const Route = createFileRoute("/dashboard")({
 head:()=>({meta:[{title:"Dashboard — Sentinel"},{name:"description",content:"Live fraud investigation posture and active case operations."},{property:"og:title",content:"Dashboard — Sentinel"},{property:"og:description",content:"Live fraud investigation posture and active case operations."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Dashboard,
});
