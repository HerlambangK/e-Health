import SyncLog from "~/server/models/SyncLog";
import { processSyncJob } from "~/server/jobs/satusehat.job";

export default defineTask({
  meta: { name: "satusehat-sync", description: "Sync pending data ke SatuSehat" },
  async run() {
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

    return { result: `Processed ${pending.length} pending syncs` };
  },
});
