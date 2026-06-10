import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailCampaign from "~/server/models/EmailCampaign";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const campaignId = query.campaignId as string | undefined;

    if (campaignId) {
      const campaign = await EmailCampaign.findById(campaignId).lean();
      if (!campaign) {
        return sendApiError(event, 404, "not_found", "Campaign tidak ditemukan");
      }
      return sendSuccess(event, formatCampaign(campaign));
    }

    const active = await EmailCampaign.findOne({ status: "running" }).sort({ createdAt: -1 }).lean();
    if (!active) {
      return sendSuccess(event, null);
    }

    return sendSuccess(event, formatCampaign(active));
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Gagal mengambil progress");
  }
});

function formatCampaign(campaign: any) {
  const progress = campaign.total > 0 ? Math.round((campaign.sent / campaign.total) * 100) : 0;
  const startedAt = campaign.createdAt ? new Date(campaign.createdAt).getTime() : Date.now();
  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  const estimatedRemainingSeconds =
    campaign.sent > 0 && campaign.status === "running"
      ? Math.round((elapsedSeconds / campaign.sent) * (campaign.total - campaign.sent))
      : 0;

  return {
    campaignId: campaign._id,
    name: campaign.name,
    status: campaign.status,
    total: campaign.total,
    sent: campaign.sent,
    failed: campaign.failed,
    skipped: campaign.skipped,
    progressPercent: progress,
    elapsedSeconds,
    estimatedRemainingSeconds,
    failedList: campaign.failedList?.slice(-10) || [],
    testEmail: campaign.testEmail || null,
    startedAt: campaign.createdAt,
    completedAt: campaign.completedAt || null,
  };
}
