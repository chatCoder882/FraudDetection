import { createFileRoute } from "@tanstack/react-router";
import { SarPage } from "@/features/sentinel/secondary-pages";
export const Route = createFileRoute("/sar")({
 head:()=>({meta:[{title:"SAR Reports — Sentinel"},{name:"description",content:"Review suspicious activity reports and filing decisions."},{property:"og:title",content:"SAR Reports — Sentinel"},{property:"og:description",content:"Review suspicious activity reports and filing decisions."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:SarPage,
});
