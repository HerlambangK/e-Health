import SyncLog from "~/server/models/SyncLog";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  await SyncLog.create({
    sistem: "satusehat",
    resource: "webhook",
    resourceId: body.resourceId || "unknown",
    action: "update",
    status: "success",
    fhirResource: JSON.stringify(body),
  });

  return { data: { received: true } };
});
