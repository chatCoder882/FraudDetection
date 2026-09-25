import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/settings")({
 head:()=>({meta:[{title:"Settings — Sentinel"},{name:"description",content:"Manage analyst workspace and notification preferences."},{property:"og:title",content:"Settings — Sentinel"},{property:"og:description",content:"Manage analyst workspace and notification preferences."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:Settings,
});
