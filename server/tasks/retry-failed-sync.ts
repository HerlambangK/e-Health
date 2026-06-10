import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "~/server/jobs/satusehat.job";

export default defineTask({
  meta: { name: "retry-failed-sync", description: "Retry failed sync jobs" },
  async run() {
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

    return { result: `Retried ${failedLogs.length} failed syncs` };
  },
});
