import SyncLog from "~/server/models/SyncLog";
import { enqueueSync } from "~/server/jobs/queue";

export default defineTask({
  meta: { name: "retry-failed-sync", description: "Retry sync yang gagal" },
  async run() {
    const config = useRuntimeConfig();
    if (!config.satusehat?.baseUrl || !config.satusehat?.clientId) {
      return { result: "SatuSehat credentials not configured in .env. Skipping retry sync task." };
    }

    try {
      const failed = await SyncLog.find({
        status: "pending",
        retryCount: { $lt: 5 },
        nextRetryAt: { $lte: new Date() },
      }).limit(50);

      for (const log of failed) {
        await enqueueSync({
          type: log.resource as any,
          resourceId: log.resourceId,
          action: log.action as any,
          priority: "low",
        });
      }

      return { result: `Re-enqueued ${failed.length} failed syncs` };
    } catch (err: any) {
      return { result: `Retry task notice: ${err.message}` };
    }
  },
});
