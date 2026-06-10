import { enqueue } from "~/server/jobs/queue";

export function triggerFHIRSync(
  type: "patient" | "encounter" | "condition" | "medication" | "observation" | "procedure",
  resourceId: string,
  action: "create" | "update" = "create"
) {
  return enqueue(
    "satusehat-sync",
    { type, resourceId, action, priority: "normal" },
    { priority: 5 }
  );
}
