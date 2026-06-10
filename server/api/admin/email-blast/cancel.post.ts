import { Validator } from "#nuxt-server-utils";
import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailCampaign from "~/server/models/EmailCampaign";
import { z } from "h3-zod";

const CancelSchema = z.object({
  campaignId: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(CancelSchema, body);

    const { campaignId } = body as { campaignId: string };

    const campaign = await EmailCampaign.findByIdAndUpdate(
      campaignId,
      { status: "cancelled", completedAt: new Date() },
      { new: true }
    ).lean();

    if (!campaign) {
      return sendApiError(event, 404, "not_found", "Campaign tidak ditemukan");
    }

    return sendSuccess(event, {
      campaignId: campaign._id,
      name: campaign.name,
      status: campaign.status,
    });
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 400, "validation_error", "Invalid payload", error);
  }
});
