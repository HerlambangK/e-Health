import pLimit from "p-limit";
import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "~/server/jobs/satusehat.job";
import { processQueue } from "~/server/jobs/queue";

export default defineTask({
  meta: { name: "satusehat-sync", description: "Sync pending data ke SatuSehat" },
  async run() {
    const config = useRuntimeConfig();
    if (!config.satusehat?.baseUrl || !config.satusehat?.clientId) {
      return { result: "SatuSehat credentials not configured in .env. Skipping background sync task." };
    }

    let queueProcessed = 0;

    for (let i = 0; i < 10; i++) {
      try {
        const job = await processQueue();
        if (job) {
          queueProcessed++;
        } else {
          break;
        }
      } catch (qErr) {
        break;
      }
    }

    try {
      const pending = await SyncLog.find({
        sistem: "satusehat",
        status: "pending",
        $or: [
          { nextRetryAt: { $exists: false } },
          { nextRetryAt: { $lte: new Date() } },
        ],
      }).limit(20);

      const limit = pLimit(5);
      await Promise.allSettled(
        pending.map(log => limit(async () => {
          try {
            await processSyncJob({
              type: log.resource as any,
              resourceId: log.resourceId,
              action: log.action as any,
              priority: "normal",
            });
          } catch {}
        }))
      );

      return {
        result: `Processed ${queueProcessed} queue jobs, ${pending.length} pending syncs`,
      };
    } catch (err: any) {
      return { result: `Sync task completed with notice: ${err.message}` };
    }
  },
});
