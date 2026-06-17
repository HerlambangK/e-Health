import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "~/server/jobs/satusehat.job";
import { processQueue } from "~/server/jobs/queue";

export default defineTask({
  meta: { name: "satusehat-sync", description: "Sync pending data ke SatuSehat" },
  async run() {
    let queueProcessed = 0;

    for (let i = 0; i < 10; i++) {
      const job = await processQueue();
      if (job) {
        queueProcessed++;
      } else {
        break;
      }
    }

    const pending = await SyncLog.find({
      sistem: "satusehat",
      status: "pending",
      $or: [
        { nextRetryAt: { $exists: false } },
        { nextRetryAt: { $lte: new Date() } },
      ],
    }).limit(20);

    for (const log of pending) {
      await processSyncJob({
        type: log.resource as any,
        resourceId: log.resourceId,
        action: log.action as any,
        priority: "normal",
      });
    }

    return {
      result: `Processed ${queueProcessed} queue jobs, ${pending.length} pending syncs`,
    };
  },
});
