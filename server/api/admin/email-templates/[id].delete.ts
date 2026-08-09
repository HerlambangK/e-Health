import { sendApiError, sendSuccess } from "~/server/utils/response";
import { deleteTemplate, findTemplate } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    if (!id) {
      return sendApiError(event, 400, "validation_error", "Template id is required");
    }

    const existing = await findTemplate(id);
    if (!existing) {
      return sendApiError(event, 404, "not_found", "Template not found");
    }

    await deleteTemplate(id);
    return sendSuccess(event, { id });
  } catch (error: any) {
    console.error("[EmailTemplates] DELETE error:", error);
    return sendApiError(event, 500, "server_error", "Failed to delete template", {
      message: error?.message || String(error),
    });
  }
});
