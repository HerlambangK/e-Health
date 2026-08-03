import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailCampaign from "~/server/models/EmailCampaign";
import EmailLog from "~/server/models/EmailLog";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Number(query.pageSize) || 10, 50);
    const status = query.status as string | undefined;
    const q = query.q as string | undefined;

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    const [active, campaignList, total] = await Promise.all([
      EmailCampaign.findOne({ status: "running" }).sort({ createdAt: -1 }).lean(),
      EmailCampaign.find({ status: { $ne: "running" }, ...(status !== "running" && status ? filter : filter) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      EmailCampaign.countDocuments({ status: { $ne: "running" }, ...filter }),
    ]);

    const campaignIds = campaignList.map((c: any) => c._id);
    const logCounts = await EmailLog.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      {
        $group: {
          _id: "$campaignId",
          sentCount: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          skippedCount: { $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] } },
          lastSent: { $max: "$sentAt" },
        },
      },
    ]);

    const logCountsMap = new Map<string, any>();
    for (const lc of logCounts) {
      logCountsMap.set(lc._id.toString(), lc);
    }

    const formattedActive = active ? formatCampaign(active, logCountsMap) : null;
    const campaigns = campaignList.map((c: any) => formatCampaign(c, logCountsMap));

    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + (c.failed || 0), 0);

    return sendSuccess(event, {
      active: formattedActive,
      campaigns,
      page,
      pageSize,
      total,
      totalSent,
      totalFailed,
    });
  } catch (error: any) {
    console.error("[Campaigns] GET error:", error);
    return sendApiError(event, 500, "server_error", "Gagal mengambil daftar campaign");
  }
});

function formatCampaign(campaign: any, logCountsMap?: Map<string, any>) {
  const progress =
    campaign.total > 0 ? Math.round((campaign.sent / campaign.total) * 100) : 0;

  const logInfo = logCountsMap?.get(campaign._id.toString());

  let duration: number | null = null;
  if (campaign.completedAt && campaign.createdAt) {
    duration = Math.round(
      (new Date(campaign.completedAt).getTime() - new Date(campaign.createdAt).getTime()) / 1000
    );
  }

  return {
    campaignId: campaign._id,
    name: campaign.name,
    status: campaign.status,
    from: campaign.from || "",
    templateSubject: campaign.templateSubject || "",
    testEmail: campaign.testEmail || null,
    noreply: campaign.noreply ?? false,
    total: campaign.total,
    sent: campaign.sent,
    failed: campaign.failed,
    skipped: campaign.skipped,
    progressPercent: progress,
    duration,
    lastSent: logInfo?.lastSent || null,
    logSentCount: logInfo?.sentCount ?? campaign.sent,
    logFailedCount: logInfo?.failedCount ?? campaign.failed,
    createdAt: campaign.createdAt,
    completedAt: campaign.completedAt || null,
  };
}
