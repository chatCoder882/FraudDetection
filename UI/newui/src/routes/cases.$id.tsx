import { createFileRoute } from "@tanstack/react-router";
import { Investigation } from "@/features/sentinel/investigation";
export const Route=createFileRoute("/cases/$id")({
 head:({params})=>({meta:[{title:`${params.id} Investigation — Sentinel`},{name:"description",content:"Fraud investigation evidence, reasoning, graph, policy, and next action."},{property:"og:title",content:`${params.id} Investigation — Sentinel`},{property:"og:description",content:"Fraud investigation evidence, reasoning, graph, policy, and next action."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
 component:CaseDetail,
});
function CaseDetail(){const {id}=Route.useParams();return <Investigation id={id}/>}
