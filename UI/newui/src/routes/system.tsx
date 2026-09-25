import { createFileRoute } from "@tanstack/react-router";
import { SystemHealth } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/system")({
 head:()=>({meta:[{title:"System Health — Sentinel"},{name:"description",content:"Monitor Sentinel investigation service health."},{property:"og:title",content:"System Health — Sentinel"},{property:"og:description",content:"Monitor Sentinel investigation service health."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:SystemHealth,
});
