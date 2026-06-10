import SyncLog from "~/server/models/SyncLog";

export default defineEventHandler(async () => {
  const stats = await SyncLog.aggregate([
    {
      $group: {
        _id: { sistem: "$sistem", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  return { data: stats };
});
