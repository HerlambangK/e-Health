import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailCampaign from "~/server/models/EmailCampaign";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = Math.min(Number(query.limit) || 10, 50);

    const [active, recent] = await Promise.all([
      EmailCampaign.findOne({ status: "running" }).sort({ createdAt: -1 }).lean(),
      EmailCampaign.find({ status: { $ne: "running" } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const formattedActive = active ? formatCampaign(active) : null;
    const formattedRecent = recent.map(formatCampaign);

    return sendSuccess(event, {
      active: formattedActive,
      recent: formattedRecent,
    });
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Gagal mengambil daftar campaign");
  }
});

function formatCampaign(campaign: any) {
  const progress =
    campaign.total > 0 ? Math.round((campaign.sent / campaign.total) * 100) : 0;

  return {
    campaignId: campaign._id,
    name: campaign.name,
    status: campaign.status,
    total: campaign.total,
    sent: campaign.sent,
    failed: campaign.failed,
    skipped: campaign.skipped,
    progressPercent: progress,
    createdAt: campaign.createdAt,
    completedAt: campaign.completedAt || null,
  };
}
