import { createFileRoute } from "@tanstack/react-router";
import { Actions } from "@/features/sentinel/actions-page";

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { title: "Actions — Sentinel" },
      { name: "description", content: "Execute approved fraud response actions." },
    ],
  }),
  component: Actions,
});
