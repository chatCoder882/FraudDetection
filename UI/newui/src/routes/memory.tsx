import { createFileRoute } from "@tanstack/react-router";
import { MemoryPage } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/memory")({
 head:()=>({meta:[{title:"Case Memory — Sentinel"},{name:"description",content:"Search historical investigations and similar prior cases."},{property:"og:title",content:"Case Memory — Sentinel"},{property:"og:description",content:"Search historical investigations and similar prior cases."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:MemoryPage,
});
