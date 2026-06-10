import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "~/server/jobs/satusehat.job";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const logId = body.syncLogId;

  if (logId) {
    const log = await SyncLog.findById(logId);
    if (!log) throw createError({ statusCode: 404, message: "Sync log tidak ditemukan" });

    await processSyncJob({
      type: log.resource as any,
      resourceId: log.resourceId,
      action: log.action as any,
      priority: "high",
    });

    return { data: { message: "Retry initiated" } };
  }

  const failedLogs = await SyncLog.find({
    status: "failed",
    sistem: "satusehat",
  }).limit(10);

  for (const log of failedLogs) {
    await processSyncJob({
      type: log.resource as any,
      resourceId: log.resourceId,
      action: log.action as any,
      priority: "high",
    });
  }

  return { data: { retried: failedLogs.length } };
});
