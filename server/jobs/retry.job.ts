import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "./satusehat.job";
import { registerHandler } from "./queue";

registerHandler("retry-failed-sync", async () => {
  const failedLogs = await SyncLog.find({
    status: "pending",
    nextRetryAt: { $lte: new Date() },
    retryCount: { $lt: 5 },
  }).limit(20);

  for (const log of failedLogs) {
    await processSyncJob({
      type: log.resource as any,
      resourceId: log.resourceId,
      action: log.action as any,
      priority: "normal",
    });
  }
});
