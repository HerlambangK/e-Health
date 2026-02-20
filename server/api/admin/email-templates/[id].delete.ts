import { sendError, sendSuccess } from "~/server/utils/response";
import { loadTemplates, saveTemplates } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    if (!id) {
      return sendError(event, 400, "validation_error", "Template id is required");
    }

    const templates = await loadTemplates();
    const filtered = templates.filter((item) => item.id !== id);
    if (filtered.length === templates.length) {
      return sendError(event, 404, "not_found", "Template not found");
    }

    await saveTemplates(filtered);
    return sendSuccess(event, { id });
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Failed to delete template");
  }
});
